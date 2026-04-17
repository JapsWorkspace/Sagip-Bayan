// src/components/admin/Admin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import incidentImage from '../assets/images/incident-icon.png';

const incidentIcon = new L.Icon({
  iconUrl: incidentImage,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Pasig bounds
const PASIG_BOUNDS = {
  north: 14.602,
  south: 14.542,
  west: 121.055,
  east: 121.105,
};

export default function Admin() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) navigate('/');
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/incident/getIncidents');
        setIncidents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = incidents.filter(inc => {
    if (filter === "all") return true;
    return inc.verification?.status === filter;
  });

  const handleChange = async (id, value) => {
    try {
      const incident = incidents.find(i => i._id === id);

      // Update status in DB
      await axios.put(`http://localhost:8000/incident/updateStatus/${id}`, {
        status: value
      });

      // Save history
      await axios.post('http://localhost:8000/history/registerHistory', {
        action: 'STATUS_UPDATE',
        placeName: incident.location,
        details: incident.description,
      });

      // Update UI
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const incident = incidents.find(i => i._id === id);

    await axios.post('http://localhost:8000/history/registerHistory', {
      action: 'DELETE',
      placeName: incident.location,
      details: incident.description,
    });

    try {
      await axios.delete(`http://localhost:8000/incident/delete/${id}`);
      setIncidents(prev => prev.filter(i => i._id !== id));
      setStatusMap(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOverride = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/incident/updateVerification/${id}`,
        { status: newStatus }
      );

      const updated = res.data.incident;

      setIncidents(prev =>
        prev.map(i => (i._id === id ? updated : i))
      );

      setSelectedIncident(updated);

    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleReverify = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/incident/reverify/${id}`
      );

      const updated = res.data.incident;

      // ✅ Update UI with fresh AI result
      setIncidents(prev =>
        prev.map(i => (i._id === id ? updated : i))
      );

      // ✅ Also update modal if open
      setSelectedIncident(updated);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>Incident Administration</h1>

      <h3>Incident Map</h3>
      <div style={{ height: '400px', marginBottom: '20px' }}>
        <MapContainer
          center={[14.5764, 121.0621]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
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
          {incidents.map(incident => (
            incident.latitude != null && incident.longitude != null && (
              <Marker
                key={incident._id}
                position={[incident.latitude, incident.longitude]}
                icon={incidentIcon}
                eventHandlers={{
                  click: () => setSelectedIncident(incident)
                }}
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
            )
          ))}
        </MapContainer>
      </div>

      <h3>Manage Incident Statuses</h3>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button onClick={() => setFilter("approved")}>Approved</button>
        <button onClick={() => setFilter("rejected")}>Rejected</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table border="1" cellPadding="6" cellSpacing="0" style={{ width: '100%', fontSize: 14 }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Level</th>
              <th>Description</th>
              <th>Location</th>
              <th>Status</th>    
              <th>Image</th>
              <th>AI Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map(inc => (
              <tr key={inc._id}>
                <td>{inc.type}</td>
                <td>{inc.level}</td>
                <td>{inc.description}</td>
                <td>{inc.location}</td>
                <td>
                  <select
                    value={statusMap[inc._id] || inc.status || ''}
                    onChange={e => handleChange(inc._id, e.target.value)}
                  >
                    <option value="">Reported</option>
                    <option value="onProcess">On Process</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td>
                  {inc.image?.fileUrl && (
                    <img
                      src={inc.image.fileUrl}
                      alt="incident"
                      style={{ width: 60, cursor: "pointer" }}
                      onClick={() => setSelectedIncident(inc)}
                    />
                  )}
                </td>

                <td>
                  <span style={{
                    color:
                      inc.verification?.status === "approved" ? "green" :
                      inc.verification?.status === "rejected" ? "red" :
                      "orange"
                  }}>
                    {inc.verification?.status || "pending"}
                  </span>

                  <div>
                    <button onClick={() => handleVerifyOverride(inc._id, "approved")}>✔</button>
                    <button onClick={() => handleVerifyOverride(inc._id, "rejected")}>✖</button>
                    <button onClick={() => handleReverify(inc._id)}>↻</button>
                  </div>
                </td>
                <td>
                  <button onClick={() => handleDelete(inc._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIncident && (
        <div className="modal">
          <h2>{selectedIncident.type}</h2>
          <p>Status: {selectedIncident.status}</p>
          <p>Severity: {selectedIncident.level}</p>
          <p>{selectedIncident.location}</p>
          <p>{selectedIncident.description}</p>
          <p> Username: {selectedIncident.usernames}</p>
          <p> Phone: {selectedIncident.phone}</p>
          {selectedIncident.image?.fileUrl && (
            <img
              src={selectedIncident.image.fileUrl}
              alt="incident"
              style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
            />
          )}
          <p>
            <strong>AI Status:</strong>{" "}
            <span style={{
              color:
                selectedIncident.verification?.status === "approved" ? "green" :
                selectedIncident.verification?.status === "rejected" ? "red" :
                "orange",
              fontWeight: "bold"
            }}>
              {selectedIncident.verification?.status}
            </span>
          </p>

          <p><strong>Confidence:</strong> {selectedIncident.verification?.confidence}%</p>
          <p><strong>Matched Labels:</strong> {selectedIncident.verification?.matchedLabels?.join(", ") || "None"}</p>
          <p><strong>All Labels:</strong> {selectedIncident.verification?.labels?.join(", ")}</p>
          <p><strong>Confidence:</strong> {selectedIncident.verification?.confidence}</p>
          <p><strong>Labels:</strong> {selectedIncident.verification?.labels?.join(", ")}</p>

          <button onClick={() => handleVerifyOverride(selectedIncident._id, "approved")}>
            Approve
          </button>
          <button onClick={() => handleVerifyOverride(selectedIncident._id, "rejected")}>
            Reject
          </button>
          <button onClick={() => handleReverify(selectedIncident._id)}>
            Re-Verify AI
          </button>
          <button onClick={() => setSelectedIncident(null)}>Close</button>
        </div>
      )}
    </div>
  );
}