import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";

const PASIG_CENTER = [14.5764, 121.0851];

function MapUpdater({ position, zoom }) {
  const map = useMap();
  map.setView(position, zoom);
  return null;
}

function MapClickHandler({ setPosition, setPlaceName }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      axios
        .get("https://nominatim.openstreetmap.org/reverse", {
          params: { lat, lon: lng, format: "json", addressdetails: 1 },
        })
        .then((res) => {
          const data = res.data;
          const short = makeShortLabel(data);
          setPlaceName(short);
        })
        .catch(() => setPlaceName("Unknown Location"));
    },
  });

  return null;
}

function makeShortLabel(data) {
  if (data.name) return data.name;
  const addr = data.address;
  return makeCityStreet(addr);
}

function makeCityStreet(addr) {
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

  const city = addr.city || addr.town || addr.village || addr.county || "Unknown City";

  return `${street}, ${city}`;
}

const Map = () => {
  const [position, setPosition] = useState(PASIG_CENTER);
  const [zoom, setZoom] = useState(13);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [placeName, setPlaceName] = useState("Pasig City");

  const handleSearchChange = (value) => {
    setQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    axios
      .get("https://nominatim.openstreetmap.org/search", {
        params: { q: value, format: "json", addressdetails: 1, countrycodes: "ph", limit: 5 },
      })
      .then((res) => {
        const pasigOnly = res.data.filter((place) =>
          place.display_name.toLowerCase().includes("pasig")
        );
        setSuggestions(pasigOnly);
      })
      .catch((err) => console.error(err));
  };

  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    setPosition([lat, lon]);
    setZoom(17);

    const label = place.name ? place.name : makeCityStreet(place.address);
    setPlaceName(label);

    setQuery(place.display_name);
    setSuggestions([]);
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {/* Search input */}
      <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 1000, width: "320px" }}>
        <input
          type="text"
          placeholder="Search place in Pasig"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        {suggestions.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, background: "white", border: "1px solid #ccc", borderTop: "none", maxHeight: "220px", overflowY: "auto" }}>
            {suggestions.map((place) => (
              <li
                key={place.place_id}
                onClick={() => selectPlace(place)}
                style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <MapContainer center={position} zoom={zoom} style={{ height: "100%" }}>
        <MapUpdater position={position} zoom={zoom} />
        <MapClickHandler setPosition={setPosition} setPlaceName={setPlaceName} />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>{placeName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
