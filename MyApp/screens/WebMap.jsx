// screens/WebMap.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, Animated, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import api from '../lib/api';
import axios from 'axios';
import { MarkerImages, getMarkerImageBySeverity } from './MapIcon';

/* ------------------------- JAEN, NUEVA ECIJA LOCK ------------------------- */
const JAEN_CENTER = { latitude: 15.33830, longitude: 120.91410 };
// pad ~2 km around town
const PAD_LAT = 0.020, PAD_LNG = 0.020;
const JAEN_BOUNDS = {
  north: JAEN_CENTER.latitude + PAD_LAT,
  south: JAEN_CENTER.latitude - PAD_LAT,
  west:  JAEN_CENTER.longitude - PAD_LNG,
  east:  JAEN_CENTER.longitude + PAD_LNG,
};

function isInsideBounds(lat, lng) {
  return lat <= JAEN_BOUNDS.north && lat >= JAEN_BOUNDS.south && lng >= JAEN_BOUNDS.west && lng <= JAEN_BOUNDS.east;
}
function clampToBounds(lat, lng) {
  const clampedLat = Math.max(JAEN_BOUNDS.south, Math.min(JAEN_BOUNDS.north, lat));
  const clampedLng = Math.max(JAEN_BOUNDS.west,  Math.min(JAEN_BOUNDS.east,  lng));
  return { latitude: clampedLat, longitude: clampedLng };
}

/* ------------------------- Zoom helpers & sizes --------------------------- */
function zoomToLatDelta(z) { return 0.02 * Math.pow(2, 15 - z); }

// 👇 BIGGER but still responsive. Tune MIN / MAX / REF / BOOST to taste.
function markerSizeFromDelta(latDelta) {
  const MIN = 1080;      // smallest size (zoomed out)
  const MAX = 800;     // largest size (zoomed in)
  const REF = 0.02;    // reference delta (~zoom 15)
  const BOOST = 1.0;   // set to 1.25 for +25% everywhere
  const factor = REF / Math.max(latDelta, 1e-6);
  const raw = (MAX * factor) * BOOST;
  return Math.max(MIN * BOOST, Math.min(MAX * BOOST, raw));
}

export default function WebMap({ onSelect, selected, selectedLevel }) {
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  const aspect = width / height;

  const [incidents, setIncidents] = useState([]);
  const [region, setRegion] = useState(() => {
    const z = 15;
    const latDelta = zoomToLatDelta(z);
    return {
      latitude: JAEN_CENTER.latitude,
      longitude: JAEN_CENTER.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: latDelta * aspect,
    };
  });

  const markerPx = markerSizeFromDelta(region.latitudeDelta);

  // Limit how far you can zoom out (keep Jaen visible)
  const MAX_LAT_DELTA = 0.08;               // larger delta = more zoomed out
  const MAX_LNG_DELTA = MAX_LAT_DELTA * aspect;

  const fetchIncidents = async () => {
    try {
      const res = await api.get('/incident/getIncidents');
      setIncidents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch incidents error:', err?.message || err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon: lng, format: 'json' },
        headers: { 'User-Agent': 'YourAppName/1.0 (support@example.com)' },
      });
      const a = res?.data?.address || {};
      return a.road || a.suburb || a.neighbourhood || res?.data?.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    } catch {
      return `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    }
  };

  // Smooth focus/zoom to a location
  const focusTo = (lat, lng, targetZoom = 17, ms = 350) => {
    if (!mapRef.current) return;
    const latDelta = zoomToLatDelta(targetZoom);
    mapRef.current.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: latDelta * aspect },
      ms
    );
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (!isInsideBounds(latitude, longitude)) {
      const c = clampToBounds(latitude, longitude);
      onSelect?.({ text: '⚠ Outside Jaen, Nueva Ecija', lat: c.latitude, lng: c.longitude });
      focusTo(c.latitude, c.longitude, 16, 220);
      return;
    }
    const label = await reverseGeocode(latitude, longitude);
    onSelect?.({ text: label, lat: latitude, lng: longitude });
    focusTo(latitude, longitude, 17, 350);
  };

  const handleRegionChangeComplete = (r) => {
    // clamp center
    const inside = isInsideBounds(r.latitude, r.longitude);
    let next = { ...r };
    if (!inside && mapRef.current) {
      const c = clampToBounds(r.latitude, r.longitude);
      next.latitude = c.latitude; next.longitude = c.longitude;
    }
    // clamp zoom-out (delta upper bound)
    if (next.latitudeDelta > MAX_LAT_DELTA || next.longitudeDelta > MAX_LNG_DELTA) {
      next.latitudeDelta = Math.min(next.latitudeDelta, MAX_LAT_DELTA);
      next.longitudeDelta = Math.min(next.longitudeDelta, MAX_LNG_DELTA);
      mapRef.current?.animateToRegion(next, 140);
    }
    setRegion(next);
  };

  // Bounce when selection changes (ensures you see it)
  const dropScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (selected?.lat && selected?.lng) {
      dropScale.setValue(0.01);
      Animated.spring(dropScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }).start();
    }
  }, [selected?.lat, selected?.lng]);

  // Use defmarker if available, else fall back so it always shows
  const selectionImg = MarkerImages.def || MarkerImages.default;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        minZoomLevel={13.5}                     // Google provider supports this on Android
        maxZoomLevel={20}
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* Incident markers (keep modest size; scale if you want) */}
        {incidents.map((incident) => {
          const lat = incident?.latitude, lng = incident?.longitude;
          if (typeof lat !== 'number' || typeof lng !== 'number') return null;
          if (!isInsideBounds(lat, lng)) return null;
          const img = getMarkerImageBySeverity(incident.level || incident.type);
          return (
            <Marker key={incident._id} coordinate={{ latitude: lat, longitude: lng }} anchor={{ x: 0.5, y: 1 }}>
              <Image source={img || MarkerImages.default} style={{ width: 24, height: 24 }} resizeMode="contain" />
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.title}>{(incident.type || '').toString().toUpperCase()}</Text>
                  <Text>Status: {incident.status ?? '—'}</Text>
                  <Text>Severity: {incident.level ?? '—'}</Text>
                  {!!incident.location && <Text>{incident.location}</Text>}
                  {!!incident.description && <Text>{incident.description}</Text>}
                </View>
              </Callout>
            </Marker>
          );
        })}

        {/* Selection marker (defmarker) — BIG & responsive */}
        {!!selected?.lat && !!selected?.lng && (
          <Marker coordinate={{ latitude: selected.lat, longitude: selected.lng }} anchor={{ x: 0.5, y: 1 }}>
            <Animated.Image
              source={selectionImg}
              style={{ width: markerPx, height: markerPx, transform: [{ scale: dropScale }] }}
              resizeMode="contain"
            />
            {selected?.label ? (
              <Callout>
                <View style={{ maxWidth: 240 }}>
                  <Text style={{ fontWeight: '600' }}>{selected.label}</Text>
                </View>
              </Callout>
            ) : null}
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  callout: { maxWidth: 260, padding: 6 },
  title: { fontWeight: '700', marginBottom: 4 },
});