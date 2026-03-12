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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, height: "100vh", width: "100vw" },
  title: { fontSize: 18, fontWeight: "600", margin: 10, textAlign: "center" },
});
