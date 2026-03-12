import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useState, useEffect } from "react";
import L from "leaflet";
import incidentImage from "../assets/incident-icon.png";

// Custom icon
const incidentIcon = new L.Icon({
  iconUrl: incidentImage,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const PASIG_BOUNDS = {
  north: 14.602,
  south: 14.542,
  west: 121.055,
  east: 121.105,
};

function isInsidePasig(lat, lng) {
  return (
    lat <= PASIG_BOUNDS.north &&
    lat >= PASIG_BOUNDS.south &&
    lng >= PASIG_BOUNDS.west &&
    lng <= PASIG_BOUNDS.east
  );
}

// Handles map click to select location
function MapClickHandler({ onSelect }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;

      if (!isInsidePasig(lat, lng)) {
        onSelect({ text: "⚠ Outside Pasig City", lat, lng });
        return;
      }

      try {
        const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
          params: { lat, lon: lng, format: "json" },
        });

        const address =
          res.data.address.road ||
          res.data.suburb ||
          res.data.neighbourhood ||
          res.data.display_name ||
          `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;

        onSelect({ text: address, lat, lng });
      } catch {
        onSelect({ text: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`, lat, lng });
      }
    },
  });

  return null;
}

export default function WebMap({ onSelect }) {
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get("http://localhost:8000/incident/getIncidents");
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents(); // fetch immediately on mount

    const interval = setInterval(fetchIncidents, 5000); // fetch every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <MapContainer
      center={[14.5764, 121.0621]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      maxBounds={[
        [PASIG_BOUNDS.south, PASIG_BOUNDS.west],
        [PASIG_BOUNDS.north, PASIG_BOUNDS.east],
      ]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <MapClickHandler onSelect={onSelect} />

      {incidents.map((incident) => {
        if (incident.latitude == null || incident.longitude == null) return null;

        return (
          <Marker
            key={incident._id}
            position={[incident.latitude, incident.longitude]}
            icon={incidentIcon}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div>
                <strong>{incident.type?.toUpperCase()}</strong><br />
                Status: {incident.status}<br />
                Severity: {incident.level}<br />
                {incident.location}<br />
                {incident.description}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
