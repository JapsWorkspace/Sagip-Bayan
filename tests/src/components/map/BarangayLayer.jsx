import { GeoJSON, useMap } from "react-leaflet";

const getRiskColor = (risk) => {
  if (risk === "high") return "#ff4d4d";
  if (risk === "moderate") return "#ffa500";
  return "#4caf50";
};

export default function BarangayLayer({ geojson, selectedBarangay }) {
  const map = useMap();

  return (
    <GeoJSON
      data={geojson}
      style={(feature) => {
        const isSelected =
          selectedBarangay &&
          feature.properties.name === selectedBarangay;

        return {
          color: isSelected ? "#0000ff" : "#555",
          weight: isSelected ? 4 : 1,
          fillColor: getRiskColor(feature.properties.riskLevel),
          fillOpacity: isSelected ? 0.6 : 0.3,
        };
      }}
      onEachFeature={(feature, layer) => {
        layer.on({
          click: () => {
            map.fitBounds(layer.getBounds());
          },
        });
      }}
    />
  );
}