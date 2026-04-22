<<<<<<< HEAD
// screens/RiskHeatMap.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Circle, Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import AppLayout from "./AppLayout";
import useJaenPlaceSearch from "./hooks/useJaenPlaceSearch";

/* ✅ Default center (Pasig for heat index baseline) */
const PASIG_COORDS = { latitude: 14.5764, longitude: 121.0851 };

function zoomToLatDelta(z) {
  return 0.05 * Math.pow(2, 13 - z);
}

export default function RiskHeatMap() {
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get("window");
  const aspect = width / height;

  const [heatIndex, setHeatIndex] = useState(null);
  const [center, setCenter] = useState(PASIG_COORDS);
  const [zoom, setZoom] = useState(14);

  const { suggestions, search, clear } = useJaenPlaceSearch();

  const API_KEY = "70a7a0f4122be2f00a2c1d218fd3ea41"; // move to env later

  const region = useMemo(() => {
    const latDelta = zoomToLatDelta(zoom);
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: latDelta * aspect,
    };
  }, [center, zoom, aspect]);

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 250);
  }, [region]);

  /* ✅ Heat Index fetch */
  useEffect(() => {
    const fetchHI = async () => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${center.latitude}&lon=${center.longitude}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        const T = data?.main?.temp;
        const RH = data?.main?.humidity;

        if (typeof T === "number" && typeof RH === "number") {
          const HI =
            -8.784695 +
            1.61139411 * T +
            2.338549 * RH -
            0.14611605 * T * RH -
            0.012308094 * T * T -
            0.016424828 * RH * RH +
            0.002211732 * T * T * RH +
            0.00072546 * T * RH * RH -
            0.000003582 * T * T * RH * RH;

          setHeatIndex(Math.round(HI));
        } else {
          setHeatIndex(null);
        }
      } catch {
        setHeatIndex(null);
      }
    };

    fetchHI();
  }, [center, API_KEY]);

  const getColorForHI = (hi) => {
    if (hi == null) return "#9e9e9e";
    if (hi < 30) return "green";
    if (hi < 35) return "yellow";
    if (hi < 41) return "orange";
    return "red";
  };

  const circleColor = getColorForHI(heatIndex);
  const circleFill = {
    green: "rgba(76,175,80,0.35)",
    yellow: "rgba(255,235,59,0.35)",
    orange: "rgba(255,152,0,0.35)",
    red: "rgba(244,67,54,0.35)",
    "#9e9e9e": "rgba(158,158,158,0.25)",
  }[circleColor];

  /* ✅ REQUIRED handler for AppTopBar */
  const handleSelectSuggestion = (place) => {
    setCenter({
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setZoom(15);
    clear();
  };

  return (
    <AppLayout
      onSearch={search}
      suggestions={suggestions}
      onSelectSuggestion={handleSelectSuggestion}
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          {heatIndex !== null
            ? `Heat Index: ${heatIndex}°C`
            : "Loading heat index…"}
        </Text>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
        >
          <Circle
            center={center}
            radius={500}
            strokeColor={circleColor}
            strokeWidth={2}
            fillColor={circleFill}
          />

          <Marker coordinate={center}>
            <Callout>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: "600" }}>
                  Heat Index: {heatIndex ?? "N/A"}°C
                </Text>
                <Text style={{ color: circleColor, marginTop: 4 }}>
                  {circleColor?.toUpperCase()}
                </Text>
              </View>
            </Callout>
          </Marker>
        </MapView>
      </View>
    </AppLayout>
=======
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function RiskHeatMap() {
  const [heatIndex, setHeatIndex] = useState(null);
  const [coords] = useState([14.5764, 121.0851]); // Pasig City

  const API_KEY = "70a7a0f4122be2f00a2c1d218fd3ea41";

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords[0]}&lon=${coords[1]}&units=metric&appid=70a7a0f4122be2f00a2c1d218fd3ea41`
    )
      .then((res) => res.json())
      .then((data) => {
        const T = data.main.temp;
        const RH = data.main.humidity;
        // compute heat index
        const HI =
          -8.784695 +
          1.61139411 * T +
          2.338549 * RH -
          0.14611605 * T * RH -
          0.012308094 * T * T -
          0.016424828 * RH * RH +
          0.002211732 * T * T * RH +
          0.00072546 * T * RH * RH -
          0.000003582 * T * T * RH * RH;
        setHeatIndex(Math.round(HI));
      })
      .catch((e) => console.error("Heat index fetch error:", e));
  }, []);

  const getColorForHI = (hi) => {
    if (hi < 30) return "green";        // low risk
    if (hi < 35) return "yellow";       // moderate
    if (hi < 41) return "orange";       // high
    return "red";                       // very high
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {heatIndex !== null
          ? `Pasig Heat Index: ${heatIndex}°C`
          : "Loading heat index..."}
      </Text>

      <MapContainer
        center={coords}
        zoom={14}
        style={{ flex: 1, width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {heatIndex !== null && (
          <Circle
            center={coords}
            radius={500} // bigger circle around Pasig
            pathOptions={{
              color: getColorForHI(heatIndex),
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              Heat Index ~ {heatIndex}°C (<span style={{color:getColorForHI(heatIndex)}}>{getColorForHI(heatIndex)}</span>)
            </Popup>
          </Circle>
        )}
      </MapContainer>
    </View>
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: "#fff" },
  title: {
    fontSize: 18,
    fontWeight: "600",
    margin: 10,
    textAlign: "center",
  },
  map: { flex: 1 },
});
=======
  container: { flex: 1, height: "100vh", width: "100vw" },
  title: { fontSize: 18, fontWeight: "600", margin: 10, textAlign: "center" },
});
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
