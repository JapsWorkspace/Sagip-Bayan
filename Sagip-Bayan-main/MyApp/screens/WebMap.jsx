import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import MapView, {
  Marker,
  Callout,
  PROVIDER_GOOGLE,
  Polygon,
} from "react-native-maps";
import api from "../lib/api";
import axios from "axios";
import { MarkerImages, getMarkerImageBySeverity } from "./MapIcon";
import jaenGeoJSON from "./data/jaen.json";
import areasData from "./data/area.json";

/* ---------------- BARANGAY COLORS (✅ ADDED) ---------------- */
const BARANGAY_COLORS = [
  "#60A5FA", // blue
  "#34D399", // green
  "#FBBF24", // yellow
  "#F87171", // red
  "#A78BFA", // violet
  "#FB7185", // rose
  "#38BDF8", // sky
  "#4ADE80", // emerald
  "#FACC15", // amber
];

function getBarangayColor(index) {
  return BARANGAY_COLORS[index % BARANGAY_COLORS.length];
}

/* ---------------- JAEN BOUNDS ---------------- */
const JAEN_CENTER = { latitude: 15.3274, longitude: 120.9190 };
const PAD = 0.05;
const TOLERANCE = 0.0005;

const BOUNDS = {
  north: JAEN_CENTER.latitude + PAD,
  south: JAEN_CENTER.latitude - PAD,
  east: JAEN_CENTER.longitude + PAD,
  west: JAEN_CENTER.longitude - PAD,
};

const isInside = (lat, lng) =>
  lat <= BOUNDS.north + TOLERANCE &&
  lat >= BOUNDS.south - TOLERANCE &&
  lng <= BOUNDS.east + TOLERANCE &&
  lng >= BOUNDS.west - TOLERANCE;

/* ---------------- ZOOM ---------------- */
const zoomToDelta = (z) => 0.02 * Math.pow(2, 15 - z);

/* ---------------- JAEN OUTLINE ---------------- */
function renderJaenBoundary() {
  if (!jaenGeoJSON || !jaenGeoJSON.features) return null;

  return jaenGeoJSON.features.flatMap((feature, idx) => {
    if (!feature.geometry || !feature.geometry.coordinates) return [];

    const { type, coordinates } = feature.geometry;
    console.log("Jaen geometry type:", type);

    let rings = [];

    if (type === "Polygon") {
      rings = [coordinates[0]];
    } else if (type === "MultiPolygon") {
      rings = coordinates.map((polygon) => polygon[0]);
    } else {
      return [];
    }

    return rings.map((ring, pIdx) => (
      <Polygon
        key={`jaen-${idx}-${pIdx}`}
        tappable={false}
        coordinates={ring.map(([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        }))}
        strokeColor="#065F46"
        strokeWidth={2}
        fillColor="transparent"
        zIndex={11}
      />
    ));
  });
}

/* ---------------- YOUR EXISTING FUNCTION (UNCHANGED) ---------------- */
function renderBarangayBoundaries() {
  if (!areasData || !areasData.features) return null;

  console.log("Barangay features count:", areasData.features.length);

  return areasData.features.flatMap((feature, idx) => {
    if (!feature.geometry || !feature.geometry.coordinates) return [];

    const { type, coordinates } = feature.geometry;
    console.log("Jaen geometry type:", type);

    let rings = [];

    if (type === "Polygon") {
      rings = [coordinates[0]];
    } else if (type === "MultiPolygon") {
      rings = coordinates.map((polygon) => polygon[0]);
    } else {
      return [];
    }

    return rings.map((ring, pIdx) => {
      console.log("Barangay sample coordinate:", ring[0]);

      return (
        <Polygon
          key={`brgy-${idx}-${pIdx}`}
          tappable={false}
          coordinates={ring.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }))}
          strokeColor="rgba(255,0,0,1)"
          strokeWidth={4}
          fillColor="rgba(255,0,0,0.4)"
          zIndex={10}
        />
      );
    });
  });
}

/* ---------------- COMPONENT ---------------- */
export default function WebMap({
  onSelect,
  selected,
  userLocation,
  onIncidentPress,
  showBarangays = false,
}) {
  const mapRef = useRef(null);
  const [incidents, setIncidents] = useState([]);

  /* ✅ MongoDB barangays */
  const [mongoBarangays, setMongoBarangays] = useState(null);

  const { width, height } = Dimensions.get("window");
  const aspect = width / height;

  const [region] = useState(() => {
    const d = zoomToDelta(15);
    return {
      latitude: JAEN_CENTER.latitude,
      longitude: JAEN_CENTER.longitude,
      latitudeDelta: d,
      longitudeDelta: d * aspect,
    };
  });

  /* ---------------- FETCH INCIDENTS ---------------- */
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await api.get("/incident/getIncidents");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.incidents || [];
      setIncidents(data);
    } catch (err) {
      console.error("Fetch error:", err?.message);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 8000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  /* ---------------- FETCH + MERGE MONGODB BARANGAYS ---------------- */
  useEffect(() => {
    (async () => {
      try {
        console.log("Fetching MongoDB barangay boundaries…");
        const res = await axios.get(
          "http://192.168.1.8:8000/api/barangays/collection"
        );

        const merged = {
          type: "FeatureCollection",
          features: res.data.flatMap(fc => fc.features),
        };

        console.log("✅ Merged barangay features:", merged.features.length);
        setMongoBarangays(merged);
      } catch (err) {
        console.error("MongoDB barangay fetch failed:", err);
      }
    })();
  }, []);

  /* ---------------- RENDER MONGODB BARANGAYS (COLORED) ---------------- */
  function renderMongoBarangayBoundaries() {
    if (!showBarangays || !mongoBarangays?.features) return null;

    return mongoBarangays.features.flatMap((feature, idx) => {
      if (!feature.geometry || !feature.geometry.coordinates) return [];

      const { type, coordinates } = feature.geometry;
      let rings = [];

      if (type === "Polygon") {
        rings = [coordinates[0]];
      } else if (type === "MultiPolygon") {
        rings = coordinates.map(p => p[0]);
      } else {
        return [];
      }

      const color = getBarangayColor(idx);

      return rings.map((ring, pIdx) => (
        <Polygon
          key={`mongo-brgy-${idx}-${pIdx}`}
          tappable={false}
          coordinates={ring.map(([lng, lat]) => ({
            latitude: lat,
            longitude: lng,
          }))}
          strokeColor="#000000"
          strokeWidth={1.5}
          fillColor={`${color}AA`}
          zIndex={999}
        />
      ));
    });
  }

  /* ---------------- HELPERS ---------------- */
  const focusTo = (lat, lng, zoom = 17) => {
    if (!mapRef.current) return;
    const d = zoomToDelta(zoom);
    mapRef.current.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: d,
      longitudeDelta: d * aspect,
    });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        { params: { lat, lon: lng, format: "json" } }
      );
      return res?.data?.display_name;
    } catch {
      return `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
    }
  };

  /* ---------------- MAP CLICK ---------------- */
  const handlePress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const label = await reverseGeocode(latitude, longitude);

    onSelect?.({ text: label, lat: latitude, lng: longitude });
    focusTo(latitude, longitude);
  };

  /* ---------------- ANIMATION ---------------- */
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected?.lat) {
      scale.setValue(0.3);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [selected?.lat]);

  /* ---------------- RENDER ---------------- */
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onPress={handlePress}
      >
        {renderMongoBarangayBoundaries()}
        {showBarangays && renderBarangayBoundaries()}
        {renderJaenBoundary()}

        {incidents.map((incident) => {
          const lat = Number(incident?.latitude);
          const lng = Number(incident?.longitude);

          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
          if (!isInside(lat, lng)) return null;

          const source = getMarkerImageBySeverity(incident.level);

          return (
            <Marker
              key={incident._id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={(e) => {
                e.stopPropagation();
                onIncidentPress?.(incident);
              }}
            >
              <Image source={source} style={styles.marker} />
              <Callout onPress={() => onIncidentPress?.(incident)}>
                <View style={styles.callout}>
                  <Text style={styles.title}>
                    {incident.type?.toUpperCase()}
                  </Text>
                  <Text>Status: {incident.status}</Text>
                  <Text>Severity: {incident.level}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  marker: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },

  selected: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },

  user: {
    width: 30,
    height: 30,
  },

  callout: {
    maxWidth: 260,
    padding: 6,
  },

  title: {
    fontWeight: "700",
    marginBottom: 4,
  },

  preview: {
    width: 140,
    height: 90,
    marginTop: 6,
    borderRadius: 8,
  },
});