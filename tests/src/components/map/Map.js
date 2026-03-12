import { useState, useEffect } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const PASIG_CENTER = [14.5764, 121.0851];

// Colored icons

const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const orangeIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapUpdater({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, zoom);
  }, [position, zoom, map]);
  return null;
}

// Map click handler
function MapClickHandler({ setPosition, setPlaceName, onSelectLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      axios
        .get("https://nominatim.openstreetmap.org/reverse", {
          params: { lat, lon: lng, format: "json", addressdetails: 1 },
        })
        .then((res) => {
          let short = "Unknown Location";
          if (res.data.name) {
            short = res.data.name;
          } else if (res.data.address) {
            const addr = res.data.address;
            const street =
              addr.road ||
              addr.pedestrian ||
              addr.suburb ||
              addr.village ||
              "Unknown Street";
            const city =
              addr.city || addr.town || addr.village || addr.county || "Unknown City";
            short = `${street}, ${city}`;
          }

          setPlaceName(short);
          onSelectLocation(short, lat, lng);
        })
        .catch(() => {
          setPlaceName("Unknown Location");
          onSelectLocation("Unknown Location", lat, lng);
        });
    },
  });
  return null;
}

const Map = ({ onSelectLocation, places = [] }) => {
  const [position, setPosition] = useState(PASIG_CENTER);
  const [zoom, setZoom] = useState(13);
  const [placeName, setPlaceName] = useState("Pasig City");

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <MapUpdater position={position} zoom={zoom} />
      <MapClickHandler
        setPosition={setPosition}
        setPlaceName={setPlaceName}
        onSelectLocation={onSelectLocation}
      />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Clicked location */}
      <Marker position={position} icon={blueIcon}>
        <Popup>{placeName}</Popup>
      </Marker>

      {/* Existing evacuation places */}
      {places.map((place) => {
        if (place.latitude === undefined || place.longitude === undefined)
          return null;

        // Marker icon based on capacityStatus
        let icon = greenIcon; // default available
        if (place.capacityStatus === "limited") icon = orangeIcon;
        else if (place.capacityStatus === "full") icon = redIcon;

        return (
          <Marker key={place._id} position={[place.latitude, place.longitude]} icon={icon}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.location}
              <br />
              Capacity: {place.capacity}
              <br />
              Status: {place.capacityStatus}
              <br />
              Lat: {place.latitude.toFixed(6)}, Lng: {place.longitude.toFixed(6)}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
