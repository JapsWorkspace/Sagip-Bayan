// screens/Map.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { PillMarker, colorByLevel } from './MapIcon';

const PASIG_CENTER = [14.5764, 121.0851]; // [lat, lng]

// Convert numeric zoom to RN latitudeDelta (keeps your zoom behavior)
function zoomToLatDelta(z) {
  return 0.05 * Math.pow(2, 13 - z); // at z=13 -> ~0.05
}

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

export default function Map() {
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  const aspect = width / height;

  const [position, setPosition] = useState(PASIG_CENTER); // [lat, lng]
  const [zoom, setZoom] = useState(13);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [placeName, setPlaceName] = useState('Pasig City');

  const regionForState = useMemo(() => {
    const latDelta = zoomToLatDelta(zoom);
    return {
      latitude: position[0],
      longitude: position[1],
      latitudeDelta: latDelta,
      longitudeDelta: latDelta * aspect,
    };
  }, [position, zoom, aspect]);

  // Animate map when position/zoom changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(regionForState, 250);
    }
  }, [regionForState]);

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
          q: value,
          format: 'json',
          addressdetails: 1,
          countrycodes: 'ph',
          limit: 5,
        },
        headers: { 'User-Agent': 'YourAppName/1.0 (support@example.com)' },
      });
      const pasigOnly = (res.data || []).filter((place) =>
        String(place.display_name || '').toLowerCase().includes('pasig'),
      );
      setSuggestions(pasigOnly);
    } catch (err) {
      console.error(err);
    }
  };

  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setPosition([lat, lon]);
    setZoom(17);
    setPlaceName(place.name ? place.name : makeCityStreet(place.address));
    setQuery(place.display_name);
    setSuggestions([]);
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={handleSearchChange}
          placeholder="Search place in Pasig"
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
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }} // <-- not absoluteFill so BottomNav remains visible
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // <-- Google on Android
        initialRegion={regionForState}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setPosition([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        }}
      >
        {/* (No UrlTile here) */}

        {/* Dynamic marker view (no image required) */}
        <Marker
          coordinate={{ latitude: position[0], longitude: position[1] }}
          anchor={{ x: 0.5, y: 1 }}
        >
          <PillMarker color={colorByLevel('default')} label={placeName} compact />
          <Callout>
            <View style={{ maxWidth: 240 }}>
              <Text style={{ fontWeight: '600' }}>{placeName}</Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchWrap: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 20 }),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  searchInput: {
    width: 320,
    maxWidth: '90%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  suggestions: {
    width: 320,
    maxWidth: '90%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    maxHeight: 220,
    marginTop: -1,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
});