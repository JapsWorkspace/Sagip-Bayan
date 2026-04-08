// screens/Map.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { PillMarker, colorByLevel } from "./MapIcon";
import AppLayout from "./AppLayout";
import useJaenPlaceSearch from "./hooks/useJaenPlaceSearch";

const PASIG_CENTER = [14.5764, 121.0851]; // default

function zoomToLatDelta(z) {
  return 0.05 * Math.pow(2, 13 - z);
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
    "Unknown Street";
  const city =
    addr.city || addr.town || addr.village || addr.county || "Unknown City";
  return `${street}, ${city}`;
}

function makeShortLabel(data) {
  if (data?.name) return data.name;
  const addr = data?.address ?? {};
  return makeCityStreet(addr);
}

export default function Map() {
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get("window");
  const aspect = width / height;

  const [position, setPosition] = useState(PASIG_CENTER);
  const [zoom, setZoom] = useState(13);
  const [placeName, setPlaceName] = useState("Pasig City");

  const { query, suggestions, search, clear } = useJaenPlaceSearch();

  const region = useMemo(() => {
    const latDelta = zoomToLatDelta(zoom);
    return {
      latitude: position[0],
      longitude: position[1],
      latitudeDelta: latDelta,
      longitudeDelta: latDelta * aspect,
    };
  }, [position, zoom, aspect]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 250);
    }
  }, [region]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: { lat, lon: lng, format: "json", addressdetails: 1 },
          headers: { "User-Agent": "SafeJaen/1.0 (contact: admin@jaen.gov.ph)" },
        }
      );
      setPlaceName(makeShortLabel(res.data));
    } catch {
      setPlaceName("Unknown Location");
    }
  };

  /* ✅ NEW unified handler */
  const handleSelectSuggestion = (place) => {
    const lat = Number(place.latitude);
    const lon = Number(place.longitude);

    setPosition([lat, lon]);
    setZoom(17);
    setPlaceName(place.label);

    clear(); // close dropdown
  };

  return (
    <AppLayout
      onSearch={search}
      suggestions={suggestions}
      onSelectSuggestion={handleSelectSuggestion}
    >
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPosition([latitude, longitude]);
            reverseGeocode(latitude, longitude);
          }}
        >
          <Marker
            coordinate={{
              latitude: position[0],
              longitude: position[1],
            }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <PillMarker
              color={colorByLevel("default")}
              label={placeName}
              compact
            />
            <Callout>
              <View style={{ maxWidth: 240 }}>
                <Text style={{ fontWeight: "600" }}>{placeName}</Text>
              </View>
            </Callout>
          </Marker>
        </MapView>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
