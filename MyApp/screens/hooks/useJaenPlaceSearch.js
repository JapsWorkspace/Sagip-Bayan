import { useState, useRef } from "react";
import axios from "axios";
import api from "../../lib/api"; // ✅ backend axios instance

/* ✅ JAEN, NUEVA ECIJA — MUNICIPALITY‑WIDE BOUNDS */
const JAEN_BOUNDS = {
  north: 15.460,
  south: 15.300,
  west: 120.820,
  east: 120.960,
};

function isInsideJaenCoords(lat, lon) {
  return (
    lat >= JAEN_BOUNDS.south &&
    lat <= JAEN_BOUNDS.north &&
    lon >= JAEN_BOUNDS.west &&
    lon <= JAEN_BOUNDS.east
  );
}

export default function useJaenPlaceSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  /* ---------------- CACHES ---------------- */
  const evacCache = useRef([]);
  const evacLoadedRef = useRef(false);
  const debounceRef = useRef(null);

  /* ✅ Load evacuation centers ONCE */
  const loadEvacPlaces = async () => {
    if (evacLoadedRef.current) return;

    try {
      const res = await api.get("/evacs");
      evacCache.current = Array.isArray(res.data) ? res.data : [];
      evacLoadedRef.current = true;
    } catch (err) {
      console.error("[JaenSearch] Failed to load evac places:", err?.message);
    }
  };

  /* ---------------- CORE SEARCH ---------------- */
  const performSearch = async (value) => {
    await loadEvacPlaces();

    /* ✅ 1️⃣ EVACUATION CENTERS FIRST */
    const evacMatches = evacCache.current
      .filter(
        (p) =>
          !p.isArchived &&
          p.capacityStatus !== "closed" &&
          (
            p.name?.toLowerCase().includes(value.toLowerCase()) ||
            p.barangay?.toLowerCase().includes(value.toLowerCase())
          )
      )
      .map((p) => ({
        id: p._id || `evac-${p.latitude}-${p.longitude}`,
        label: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        source: "evacuation",
        raw: p,
      }));

    let results = [...evacMatches];

    /* ✅ 2️⃣ NOMINATIM FALLBACK */
    if (results.length < 5) {
      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: value,
              format: "json",
              countrycodes: "ph",
              bounded: 1,
              viewbox: `${JAEN_BOUNDS.west},${JAEN_BOUNDS.north},${JAEN_BOUNDS.east},${JAEN_BOUNDS.south}`,
              limit: 5,
              email: "admin@jaen.gov.ph",
            },
            headers: {
              "User-Agent": "SafeJaen/1.0 (contact: admin@jaen.gov.ph)",
            },
          }
        );

        const mapMatches = (res.data || [])
          .filter((p) =>
            isInsideJaenCoords(Number(p.lat), Number(p.lon))
          )
          .map((p, idx) => ({
            id: p.place_id || `map-${p.lat}-${p.lon}-${idx}`,
            label: p.display_name,
            latitude: Number(p.lat),
            longitude: Number(p.lon),
            source: "map",
            raw: p,
          }));

        results = [...results, ...mapMatches];
      } catch (err) {
        console.error(
          "[JaenSearch] Nominatim error:",
          err?.response?.status,
          err?.message
        );
      }
    }

    setSuggestions(results.slice(0, 5));
  };

  /* ---------------- PUBLIC SEARCH API ---------------- */
  const search = (value) => {
    setQuery(value);

    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
  };

  return {
    query,
    suggestions,
    search, // ✅ FIXED
    clear,
  };
}
``