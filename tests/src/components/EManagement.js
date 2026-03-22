import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Map from "./map/Map";
import "./map/MapIcon";
import "./css/EManagement.css";
import DashboardShell from "./layout/DashboardShell";

const DEV_DEBUG = false;

const EManagement = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) {
      navigate("/");
      return;
    }
    fetchPlaces();
  }, [navigate]);

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [statusChoice, setStatusChoice] = useState("available");
  const [notes, setNotes] = useState("");
  const [capacityDisplay, setCapacityDisplay] = useState(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    latitude: null,
    longitude: null,
  });

  const [pickMode, setPickMode] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const nameRef = useRef(null);

  const [panelView, setPanelView] = useState("main");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historySortBy, setHistorySortBy] = useState("date");
  const [historySortDir, setHistorySortDir] = useState("desc");

  const selectedPlace = useMemo(
    () => places.find((p) => p._id === selectedId) || null,
    [places, selectedId]
  );

  const filteredPlaces = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return places;
    return places.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.location?.toLowerCase().includes(term)
    );
  }, [places, search]);

  useEffect(() => {
    if (!selectedPlace) return;
    setStatusChoice(selectedPlace.capacityStatus || "available");
    setCapacityDisplay(Number(selectedPlace.capacity) || 0);
  }, [selectedPlace]);

  useEffect(() => {
    if (!selectedPlace) return;
    const lat = Number(selectedPlace.latitude);
    const lng = Number(selectedPlace.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    window.dispatchEvent(
      new CustomEvent("emap:flyTo", { detail: { lat, lng, zoom: 17 } })
    );
  }, [selectedPlace]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || document.activeElement?.tagName;
      const isField =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable;
      if (isField) return;
      if (e.key === "Escape") {
        if (showAddForm) setShowAddForm(false);
        if (pickMode) setPickMode(false);
        if (panelView === "history") setShowHistory(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddForm, pickMode, panelView]);

  useEffect(() => {
    if (showAddForm && nameRef.current) {
      const t = setTimeout(() => nameRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [showAddForm]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
      setHistoryQuery("");
      setPanelView("history");
    } else {
      setPanelView("main");
    }
  }, [showHistory]);

  const fetchPlaces = () => {
    axios.get("http://localhost:8000/evacs")
      .then((res) => setPlaces(res.data))
      .catch(console.error);
  };

  const updateStatus = (id, status) =>
    axios.put(`http://localhost:8000/evacs/${id}/status`, { capacityStatus: status })
      .then(fetchPlaces);

  const deletePlace = (id) => {
    if (!window.confirm("Delete this place?")) return;
    axios.delete(`http://localhost:8000/evacs/${id}`).then(fetchPlaces);
  };

  const fetchHistory = () => {
    axios.get("http://localhost:8000/evacs/history/logs")
      .then((res) => setHistory(res.data))
      .catch(console.error);
  };

  const sanitizeText = (value) => value.replace(/<[^>]*>?/gm, "");

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? value.replace(/\D/g, "") : sanitizeText(value),
    }));
  };

  const handleStartPick = () => {
    setFormData({ name: "", location: "", capacity: "", latitude: null, longitude: null });
    setPickMode(true);
    setShowAddForm(false);
  };

  const normalizeMapArgs = (...args) => {
    let loc = "", lat = null, lng = null;
    if (args.length === 1 && args[0]?.latlng) {
      lat = args[0].latlng.lat;
      lng = args[0].latlng.lng;
      loc = args[0].label || "";
    } else if (args.length >= 3) {
      loc = args[0];
      lat = Number(args[1]);
      lng = Number(args[2]);
    }
    return { loc, lat, lng };
  };

  const handleMapSelectLocation = useCallback((...args) => {
    if (!pickMode) return;
    const { loc, lat, lng } = normalizeMapArgs(...args);
    if (lat == null || lng == null) return;
    const clean = (v) => (v || "").replace(/<[^>]*>?/gm, "").trim();
    setFormData({
      name: "",
      location: clean(loc || ""),
      capacity: "",
      latitude: lat,
      longitude: lng,
    });
    setPickMode(false);
    setShowAddForm(true);
  }, [pickMode]);

  const handleSubmitAdd = () => {
    if (!formData.name || !formData.location || !formData.capacity ||
        formData.latitude === null || formData.longitude === null) {
      alert("Please fill in all fields and select a location on the map.");
      return;
    }
    setLoading(true);
    axios.post("http://localhost:8000/evacs/make", {
      ...formData, capacity: Number(formData.capacity),
    })
      .then(() => {
        setFormData({ name: "", location: "", capacity: "", latitude: null, longitude: null });
        setShowAddForm(false);
        fetchPlaces();
      })
      .catch(() => alert("Error saving data"))
      .finally(() => setLoading(false));
  };

  const historySorted = useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    const filtered = history.filter((h) => {
      if (!q) return true;
      return (
        String(h.action ?? "").toLowerCase().includes(q) ||
        String(h.placeName ?? "").toLowerCase().includes(q) ||
        String(h.details ?? "").toLowerCase().includes(q)
      );
    });

    const cmp = (a, b) => {
      let result = 0;
      if (historySortBy === "date") {
        const vA = new Date(a.createdAt).getTime() || 0;
        const vB = new Date(b.createdAt).getTime() || 0;
        result = vA - vB;
      } else if (historySortBy === "action") {
        result = String(a.action ?? "").localeCompare(String(b.action ?? ""), undefined, { sensitivity: "base" });
      } else {
        result = String(a.placeName ?? "").localeCompare(String(b.placeName ?? ""), undefined, { sensitivity: "base" });
      }
      return historySortDir === "asc" ? result : -result;
    };

    return filtered.slice().sort(cmp);
  }, [history, historyQuery, historySortBy, historySortDir]);

  return (
    <DashboardShell>
      {/* Lock the entire screen area (under header). Page doesn't scroll. */}
      <div className="evac-screen-lock">
        {/* ❌ Toolbar removed */}

        {/* Split canvas: map | panel */}
        <div className="evac-page">
          {/* Map */}
          <div
            className="evac-map"
            style={{ cursor: pickMode ? "crosshair" : "default", position: "relative" }}
          >
            <Map onSelectLocation={handleMapSelectLocation} places={places} />

            {pickMode && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "10px 12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 10,
                  pointerEvents: "none",
                }}
              >
                <span style={{ fontWeight: 700 }}>Click on the map to set location…</span>
                <button
                  onClick={() => setPickMode(false)}
                  style={{
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    borderRadius: 6,
                    height: 30,
                    padding: "0 10px",
                    cursor: "pointer",
                    pointerEvents: "auto",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <aside className={`evac-panel ${panelView === "history" ? "history-open" : ""}`}>
            <div className="panel-views">
              {/* MAIN VIEW */}
              <section className="view-main">
                <div className="evac-brand">
                  <img
                    src="/logo-pasig.svg"
                    alt="Pasig"
                    className="evac-brand-logo"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <div className="evac-brand-title">Evacuation Center Management</div>
                </div>

                <div className="evac-search">
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="evac-list">
                  {filteredPlaces.length === 0 ? (
                    <div className="evac-empty">No places found.</div>
                  ) : (
                    filteredPlaces.map((p) => (
                      <label
                        key={p._id}
                        className={`evac-list-item ${selectedId === p._id ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="selectedPlace"
                          checked={selectedId === p._id}
                          onChange={() => setSelectedId(p._id)}
                        />
                        <span className="evac-list-name">{p.name}</span>
                        <span className="evac-list-loc">{p.location}</span>
                        <span
                          className={`evac-dot ${
                            (p.capacityStatus || "available") === "available"
                              ? "dot-green"
                              : (p.capacityStatus || "available") === "limited"
                              ? "dot-orange"
                              : "dot-red"
                          }`}
                        />
                      </label>
                    ))
                  )}
                </div>

                <div className="evac-capacity">
                  <button
                    className="cap-btn"
                    onClick={() => setCapacityDisplay((n) => Math.max(0, (Number(n) || 0) - 1))}
                  >
                    −
                  </button>
                  <input
                    className="cap-input"
                    type="number"
                    value={capacityDisplay}
                    onChange={(e) => setCapacityDisplay(e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    className="cap-btn"
                    onClick={() => setCapacityDisplay((n) => (Number(n) || 0) + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="evac-status">
                  <label className="status-label">Status</label>
                  <div className="status-row">
                    {["available", "limited", "full"].map((s) => (
                      <label key={s} className="status-pill">
                        <input
                          type="radio"
                          name="statusChoice"
                          checked={statusChoice === s}
                          onChange={() => setStatusChoice(s)}
                        />
                        <span className="pill-text">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="evac-selected">
                  <label>Selected Place</label>
                  <input
                    readOnly
                    value={
                      selectedPlace ? `${selectedPlace.name} — ${selectedPlace.location}` : ""
                    }
                    placeholder="(none)"
                  />
                </div>

                <div className="evac-notes">
                  <label>Extra notes</label>
                  <textarea
                    rows={3}
                    placeholder="Add notes (local only)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="evac-actions">
                  <button className="btn btn-back" onClick={() => navigate(-1)}>
                    BACK
                  </button>
                  <button
                    className="btn btn-update"
                    disabled={!selectedId}
                    onClick={async () => {
                      if (!selectedId) {
                        alert("Select a place first");
                        return;
                      }
                      await updateStatus(selectedId, statusChoice);
                    }}
                  >
                    UPDATE
                  </button>
                </div>

                <div className="evac-utils">
                  <button className="link-btn" onClick={handleStartPick}>
                    + Add Place
                  </button>
                  <button
                    className="link-btn"
                    onClick={() => {
                      setShowHistory((v) => !v);
                      fetchHistory();
                    }}
                  >
                    {showHistory ? "Hide History" : "Show History"}
                  </button>

                  {selectedPlace && (
                    <button
                      className="link-btn danger"
                      onClick={() => deletePlace(selectedPlace._id)}
                    >
                      Delete Selected
                    </button>
                  )}
                </div>

                {showHistory && history.length > 0 && (
                  <div className="evac-history">
                    <div className="history-title">History</div>
                    <div className="history-list">
                      {history.map((h) => (
                        <div className="history-item" key={h._id}>
                          <div className="history-main">
                            <span className="history-action">{h.action}</span>
                            <span className="history-place">• {h.placeName}</span>
                          </div>
                          <div className="history-sub">
                            <span className="history-details">{h.details}</span>
                            <span className="history-date">
                              {new Date(h.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* HISTORY VIEW */}
              <section className="view-history">
                <div className="history-toolbar">
                  <button className="tbtn tbtn-light" onClick={() => setShowHistory(false)}>
                    ← Back
                  </button>

                  <div className="history-search">
                    <input
                      type="text"
                      placeholder="Search history (action, place, details)…"
                      value={historyQuery}
                      onChange={(e) => setHistoryQuery(e.target.value)}
                    />
                  </div>

                  <div className="history-sort">
                    <label>Sort by:</label>
                    <select
                      value={historySortBy}
                      onChange={(e) => setHistorySortBy(e.target.value)}
                    >
                      <option value="date">Date</option>
                      <option value="action">Action</option>
                      <option value="place">Place</option>
                    </select>
                    <button
                      type="button"
                      className="sort-dir"
                      title={`Toggle ${historySortDir === "asc" ? "descending" : "ascending"}`}
                      onClick={() => setHistorySortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    >
                      {historySortDir === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>

                <div className="history-body">
                  <div className="evac-history-panel">
                    {historySorted.map((h) => (
                      <div className="history-card" key={h._id}>
                        <div className="h-row">
                          <strong className="h-action">{h.action}</strong>
                          <span className="h-place">• {h.placeName}</span>
                        </div>
                        <div className="h-sub">{h.details}</div>
                        <div className="h-date">
                          {h.createdAt ? new Date(h.createdAt).toLocaleString() : "-"}
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && <div className="evac-empty">No history yet.</div>}
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal kept */}
      {showAddForm &&
        createPortal(
          <div
            className="evac-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add Evacuation Place"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,23,42,0.4)",
              display: "grid",
              placeItems: "center",
              zIndex: 1000,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key !== "Escape") e.stopPropagation();
            }}
          >
            <div
              className="evac-modal-card"
              style={{
                width: "min(560px, 92vw)",
                maxHeight: "min(84vh, 800px)",
                overflow: "hidden",
                background: "#ffffff",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: 12,
                boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setShowAddForm(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 2px 10px 2px",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  className="modal-title"
                  style={{ fontSize: 16, fontWeight: 800, color: "#1f2937" }}
                >
                  Add Evacuation Place
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    border: "none",
                    background: "transparent",
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitAdd();
                }}
                className="modal-form"
                style={{
                  display: "grid",
                  gap: 12,
                  paddingTop: 12,
                  maxHeight: "calc(84vh - 120px)",
                  overflowY: "auto",
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Escape") e.stopPropagation();
                }}
              >
                <div className="modal-body" style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label>Place Name</label>
                    <textarea
                      ref={nameRef}
                      name="name"
                      rows={2}
                      value={formData.name}
                      onChange={handleFieldChange}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label>Location</label>
                    <textarea
                      name="location"
                      rows={2}
                      value={formData.location}
                      onChange={handleFieldChange}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label>Capacity</label>
                    <input
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleFieldChange}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label>Latitude / Longitude</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        formData.latitude !== null && formData.longitude !== null
                          ? `${Number(formData.latitude).toFixed(6)}, ${Number(
                              formData.longitude
                            ).toFixed(6)}`
                          : ""
                      }
                      placeholder="Click on the map to set coordinates"
                    />
                  </div>
                </div>

                <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-back"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-update" disabled={loading}>
                    {loading ? "Submitting..." : "Save Place"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </DashboardShell>
  );
};

export default EManagement;
