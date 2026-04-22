<<<<<<< HEAD
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
=======
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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
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
<<<<<<< HEAD
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
=======

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
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
