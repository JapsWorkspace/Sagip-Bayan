// screens/MainCenter.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  StatusBar,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MarkerImages /* getMarkerImageBySeverity */ } from './MapIcon';
import NewBottomNav from './NewBottomNav';

/* ------------------------- JAEN, NUEVA ECIJA LOCK ------------------------- */
const JAEN_CENTER = [15.33830, 120.91410]; // [lat, lng]
// ~0.02° ≈ ~2 km at this latitude — tune wider/narrower if you want
const PAD_LAT = 0.020, PAD_LNG = 0.020;
const JAEN_BOUNDS = {
  north: JAEN_CENTER[0] + PAD_LAT,
  south: JAEN_CENTER[0] - PAD_LAT,
  west:  JAEN_CENTER[1] - PAD_LNG,
  east:  JAEN_CENTER[1] + PAD_LNG,
};
function isInsideBounds(lat, lng) {
  return lat <= JAEN_BOUNDS.north && lat >= JAEN_BOUNDS.south && lng >= JAEN_BOUNDS.west && lng <= JAEN_BOUNDS.east;
}
function clampToBounds(lat, lng) {
  const clampedLat = Math.max(JAEN_BOUNDS.south, Math.min(JAEN_BOUNDS.north, lat));
  const clampedLng = Math.max(JAEN_BOUNDS.west,  Math.min(JAEN_BOUNDS.east,  lng));
  return { latitude: clampedLat, longitude: clampedLng };
}

/* ------------------------- Zoom helpers (size/animation) ------------------ */
function zoomToLatDelta(z) { return 0.05 * Math.pow(2, 13 - z); }
function makeCityStreet(addr = {}) {
  const street =
    addr.road ||
    addr.pedestrian ||
    addr.cycleway ||
    addr.footway ||
    addr.path ||
    addr.neighbourhood ||
    addr.suburb ||
    addr.village ||
    addr.hamlet ||
    'Unknown Street';
  const city = addr.city || addr.town || addr.village || addr.county || 'Unknown City';
  return `${street}, ${city}`;
}
function makeShortLabel(data) {
  if (data?.name) return data.name;
  const addr = data?.address ?? {};
  return makeCityStreet(addr);
}
// Convert latitudeDelta → marker size (px). Clamped min/max.
function markerSizeFromDelta(latDelta) {
  const MIN = 20;    // smaller default
  const MAX = 40;    // max when zoomed in
  const ref = 0.05;  // reference delta for your map (tune to taste)
  const raw = MAX * (ref / Math.max(latDelta, 1e-6));
  return Math.max(MIN, Math.min(MAX, raw));
}

export default function MainCenter({ navigation }) {
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  const aspect = width / height;

  const [position, setPosition] = useState([JAEN_CENTER[0], JAEN_CENTER[1]]); // [lat, lng]
  const [zoom, setZoom] = useState(13);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [placeName, setPlaceName] = useState('Jaen, Nueva Ecija');

  // Keep a live region so we can compute marker size from latitudeDelta
  const [region, setRegion] = useState(() => {
    const latDelta = zoomToLatDelta(zoom);
    return {
      latitude: position[0],
      longitude: position[1],
      latitudeDelta: latDelta,
      longitudeDelta: latDelta * aspect,
    };
  });
  const pinPx = markerSizeFromDelta(region.latitudeDelta);

  // Animate map when region changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 250);
    }
  }, [region]);

  // Smooth focus/zoom to a location
  const focusTo = (lat, lng, targetZoom = 17, ms = 350) => {
    if (!mapRef.current) return;
    const latDelta = zoomToLatDelta(targetZoom);
    mapRef.current.animateToRegion(
      {
        latitude: lat, longitude: lng,
        latitudeDelta: latDelta, longitudeDelta: latDelta * aspect,
      },
      ms
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon: lng, format: 'json', addressdetails: 1 },
        headers: { 'User-Agent': 'YourAppName/1.0 (support@example.com)' },
      });
      setPlaceName(makeShortLabel(res.data));
    } catch {
      setPlaceName('Unknown Location');
    }
  };

  const handleSearchChange = async (value) => {
    setQuery(value);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: value, format: 'json', addressdetails: 1, countrycodes: 'ph', limit: 5,
        },
        headers: { 'User-Agent': 'YourAppName/1.0 (support@example.com)' },
      });
      // Prioritize Jaen results
      const hits = (res.data || []).filter((p) =>
        String(p.display_name || '').toLowerCase().includes('jaen')
      );
      setSuggestions(hits);
    } catch (err) {
      console.error(err);
    }
  };

  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    const inside = isInsideBounds(lat, lon);
    const target = inside ? { latitude: lat, longitude: lon } : clampToBounds(lat, lon);

    setPosition([target.latitude, target.longitude]);     // move pin
    setZoom(17);
    focusTo(target.latitude, target.longitude, 17, 350);  // animate zoom/focus
    setPlaceName(place.name ? place.name : makeCityStreet(place.address));
    setQuery(place.display_name);
    setSuggestions([]);
  };

  /* ----------------------- Slideable bottom panel wiring ----------------------- */
  const ANDROID_SB = StatusBar?.currentHeight || 0;
  const PANEL_TOP = Platform.select({ ios: 260, android: 240 }); // tune to taste
  const TOP_MARGIN = Platform.select({ ios: 12, android: 8 });

  const MAX_UP = -Math.max(0, PANEL_TOP - ANDROID_SB - TOP_MARGIN);
  const MAX_DOWN = 0;
  const START_Y = 0;

  const FULL_OPEN_TOP = PANEL_TOP + MAX_UP;
  const SHEET_MIN_HEIGHT = height - FULL_OPEN_TOP;
  const EXTRA_BOTTOM_PAD = Platform.select({ ios: 16, android: 12 });

  const pan = useRef(new Animated.ValueXY({ x: 0, y: START_Y })).current;
  const startY = useRef(START_Y);
  const SNAP_THRESHOLD = 80;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startY.current = pan.y._value;
      },
      onPanResponderMove: (_, g) => {
        let newY = startY.current + g.dy;
        if (newY < MAX_UP) newY = MAX_UP;     // clamp to top
        if (newY > MAX_DOWN) newY = MAX_DOWN; // clamp to bottom
        pan.setValue({ x: 0, y: newY });
      },
      onPanResponderRelease: (_, g) => {
        const draggedUpEnough = -g.dy >= SNAP_THRESHOLD || g.vy <= -0.4;
        const targetY = draggedUpEnough ? MAX_UP : MAX_DOWN;

        Animated.spring(pan, {
          toValue: { x: 0, y: targetY },
          useNativeDriver: false,
          speed: 16,
          bounciness: 6,
        }).start();
      },
    })
  ).current;

  /* ----------------- Animated drop/bounce for the image marker ----------------- */
  const dropScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    // whenever position changes, play a quick bounce
    dropScale.setValue(0.01);
    Animated.spring(dropScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 6,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);

  return (
    <View style={styles.screen}>
      {/* Map area */}
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            const inside = isInsideBounds(latitude, longitude);
            const target = inside ? { latitude, longitude } : clampToBounds(latitude, longitude);

            setPosition([target.latitude, target.longitude]);    // move pin
            focusTo(target.latitude, target.longitude, 17, 350); // animate zoom/focus
            reverseGeocode(target.latitude, target.longitude);   // update label
          }}
          onRegionChangeComplete={(r) => {
            // Clamp the center inside Jaen and keep region for icon resizing
            const inside = isInsideBounds(r.latitude, r.longitude);
            if (!inside && mapRef.current) {
              const c = clampToBounds(r.latitude, r.longitude);
              mapRef.current.animateToRegion({ ...r, latitude: c.latitude, longitude: c.longitude }, 180);
            }
            setRegion(r);
          }}
        >
          {/* Image pin (def) with dynamic size */}
          <Marker
            coordinate={{ latitude: position[0], longitude: position[1] }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Animated.Image
              source={MarkerImages.def}
              style={{ width: pinPx, height: pinPx, transform: [{ scale: dropScale }] }}
              resizeMode="contain"
            />
            <Callout>
              <View style={{ maxWidth: 240 }}>
                <Text style={{ fontWeight: '600' }}>{placeName}</Text>
              </View>
            </Callout>
          </Marker>
        </MapView>
      </View>

      {/* Slideable Panel (over the map) */}
      <Animated.View
        style={[
          styles.centerWrapper,
          { top: PANEL_TOP, transform: pan.getTranslateTransform() },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View
            style={[
              styles.card,
              { minHeight: SHEET_MIN_HEIGHT, paddingBottom: EXTRA_BOTTOM_PAD },
            ]}
          >
            {/* Drag handle */}
            <View {...panResponder.panHandlers} style={styles.dragHandle} />

            {/* Panel content */}
            <ScrollView
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
              bounces
              showsVerticalScrollIndicator={false}
            >
              {/* Search input inside the panel */}
              <TextInput
                value={query}
                onChangeText={handleSearchChange}
                placeholder="Search place in Jaen"
                placeholderTextColor="#777"
                style={styles.searchInput}
                returnKeyType="search"
              />

              {suggestions.length > 0 && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => String(item.place_id)}
                  style={styles.suggestions}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.suggestionItem} onPress={() => selectPlace(item)}>
                      <Text numberOfLines={2}>{item.display_name}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}

              {/* Example quick actions */}
              <View style={styles.gridWrap}>
                <TouchableOpacity style={[styles.tile, { backgroundColor: '#14532d' }]}>
                  <Text style={[styles.tileText, { color: '#fff' }]}>
                    RECENT/OCCURING{'\n'}DISASTER Alerts
                  </Text>
                </TouchableOpacity>

                <View style={styles.row}>
                  <TouchableOpacity style={styles.tile}>
                    <Text style={styles.tileText}>Account Settings</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tile}>
                    <Text style={styles.tileText}>Status Marking</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.row}>
                  <TouchableOpacity style={styles.tile}>
                    <Text style={styles.tileText}>Education{'\n'}& Tutorial</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tile}>
                    <Text style={styles.tileText}>Find{'\n'}People</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      {/* Bottom nav */}
      <NewBottomNav
        navigation={navigation}
        onCenterPress={() => navigation.navigate('MainCenter')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  mapWrap: { flex: 1 },

  // ⬇️ Expanded panel to edge-to-edge (no side padding on wrapper)
  centerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 0, // was 12
  },

  // keep generous inner padding so content breathes across full width
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 16, // a bit wider padding for edge-to-edge sheet
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  dragHandle: {
    alignSelf: 'center',
    width: 44,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
  },

  // ⬇️ Make inputs & suggestion list fill most of the width
  searchInput: {
    width: '94%',            // was fixed 320; now responsive
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },
  suggestions: {
    width: '94%',            // was fixed 320; now responsive
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    maxHeight: 220,
    marginTop: -1,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },

  gridWrap: { paddingHorizontal: 4, paddingTop: 8 },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  tile: {
    flex: 1,
    minHeight: 84,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tileText: { color: '#111827', fontWeight: '700', textAlign: 'center' },
});