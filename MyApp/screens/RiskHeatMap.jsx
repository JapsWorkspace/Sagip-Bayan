// screens/RiskHeatMap.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Circle, Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

// Pasig City
const PASIG_COORDS = { latitude: 14.5764, longitude: 121.0851 };

// Rough mapping from a “zoom” number to RN Maps latitudeDelta (to keep your zoom-ish behavior)
function zoomToLatDelta(z) {
  return 0.05 * Math.pow(2, 13 - z);
}

export default function RiskHeatMap() {
  const mapRef = useRef(null);
  const { width, height } = Dimensions.get('window');
  const aspect = width / height;

  const [heatIndex, setHeatIndex] = useState(null);

  const API_KEY = '70a7a0f4122be2f00a2c1d218fd3ea41'; // TODO: move to secure config (.env)

  // Initial region approximating your Leaflet zoom=14
  const initialRegion = useMemo(() => {
    const zoom = 14;
    const latDelta = zoomToLatDelta(zoom);
    return {
      latitude: PASIG_COORDS.latitude,
      longitude: PASIG_COORDS.longitude,
      latitudeDelta: latDelta,
      longitudeDelta: latDelta * aspect,
    };
  }, [aspect]);

  useEffect(() => {
    // Fetch current weather for Pasig, compute Heat Index using your formula
    const fetchHI = async () => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${PASIG_COORDS.latitude}&lon=${PASIG_COORDS.longitude}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        const T = data?.main?.temp;
        const RH = data?.main?.humidity;

        if (typeof T === 'number' && typeof RH === 'number') {
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
          console.warn('Missing temp/humidity in OpenWeather response:', data);
          setHeatIndex(null);
        }
      } catch (e) {
        console.error('Heat index fetch error:', e);
        setHeatIndex(null);
      }
    };

    fetchHI();
  }, [API_KEY]);

  const getColorForHI = (hi) => {
    if (hi == null) return '#9e9e9e';
    if (hi < 30) return 'green';   // low risk
    if (hi < 35) return 'yellow';  // moderate
    if (hi < 41) return 'orange';  // high
    return 'red';                  // very high
  };

  const circleColor = getColorForHI(heatIndex);
  const circleFill = (() => {
    // convert named colors to rgba with opacity
    const map = {
      green: 'rgba(76,175,80,0.35)',
      yellow: 'rgba(255,235,59,0.35)',
      orange: 'rgba(255,152,0,0.35)',
      red: 'rgba(244,67,54,0.35)',
      '#9e9e9e': 'rgba(158,158,158,0.25)',
    };
    return map[circleColor] || 'rgba(25,118,210,0.25)';
  })();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {heatIndex !== null
          ? `Pasig Heat Index: ${heatIndex}°C`
          : 'Loading heat index...'}
      </Text>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}  // Google on Android, Apple Maps on iOS
        initialRegion={initialRegion}
      >
        {/* Circle around Pasig with color based on HI */}
        <Circle
          center={PASIG_COORDS}
          radius={500} // ~500 meters, like your Leaflet code
          strokeColor={circleColor}
          strokeWidth={2}
          fillColor={circleFill}
        />

        {/* Marker + Callout to mimic your Popup text */}
        <Marker coordinate={PASIG_COORDS} anchor={{ x: 0.5, y: 1 }}>
          <Callout>
            <View style={{ maxWidth: 240 }}>
              <Text style={{ fontWeight: '600' }}>
                {heatIndex !== null
                  ? `Heat Index ~ ${heatIndex}°C`
                  : 'Heat Index unavailable'}
              </Text>
              <Text style={{ color: circleColor, marginTop: 4 }}>
                {heatIndex !== null ? circleColor.toUpperCase() : 'N/A'}
              </Text>
            </View>
          </Callout>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    margin: 10,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
});