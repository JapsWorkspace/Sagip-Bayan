<<<<<<< HEAD
// screens/MapIcon.js
import React from 'react';
import { View, Text } from 'react-native';

export const MarkerImages = {
  low:      require('../stores/assets/low.png'),
  medium:   require('../stores/assets/medium.png'),
  high:     require('../stores/assets/high.png'),
  critical: require('../stores/assets/critical.png'),
  default:  require('../stores/assets/low.png'), // fallback
  selected: require('../stores/assets/defmarker.png'), // selected pin
};

// ✅ Normalize severity/type safely
const normalize = (val) => String(val || "").toLowerCase().trim();

// ✅ Stronger matching logic
export function getMarkerImageBySeverity(levelOrType) {
  const key = normalize(levelOrType);

  if (!key) return MarkerImages.default;

  if (key.includes("critical")) return MarkerImages.critical;
  if (key.includes("high") || key.includes("severe")) return MarkerImages.high;
  if (key.includes("medium") || key.includes("med")) return MarkerImages.medium;
  if (key.includes("low") || key.includes("minor") || key.includes("safe"))
    return MarkerImages.low;

  return MarkerImages.default;
}

/* Optional UI marker (keep if used) */
export function PillMarker({ color = '#1976d2', label, compact = false }) {
  const padH = compact ? 6 : 8;
  const padV = compact ? 4 : 6;

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        backgroundColor: color,
        paddingHorizontal: padH,
        paddingVertical: padV,
        borderRadius: 14,
        minWidth: 22,
        alignItems: 'center',
      }}>
        {label ? (
          <Text style={{
            color: '#fff',
            fontWeight: '600',
            fontSize: compact ? 11 : 12
          }}>
            {label}
          </Text>
        ) : null}
      </View>

      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: compact ? 7 : 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
      }} />
    </View>
  );
}
=======
// src/leafletIcons.js
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Remove default behavior
delete L.Icon.Default.prototype._getIconUrl;

// Merge the proper image URLs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
