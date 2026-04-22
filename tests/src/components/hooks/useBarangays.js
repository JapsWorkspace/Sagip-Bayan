import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function useBarangays(selectedName) {
  const [barangays, setBarangays] = useState(null);

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const url = selectedName
          ? `${API_BASE}/api/barangays/collection/${encodeURIComponent(selectedName)}`
          : `${API_BASE}/api/barangays/collection`;

        const res = await axios.get(url);
        setBarangays(res.data);
      } catch (err) {
        console.error("Barangay fetch error:", err?.response?.status, err.message);
      }
    };

    fetchBarangays();
  }, [selectedName]);

  return barangays;
}