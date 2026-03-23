import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import incidentImage from '../assets/images/incident-icon.png';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,   // x-axis labels
  LinearScale,     // y-axis
  BarElement,      // for Bar chart
  PointElement,    // points on Line chart
  LineElement,     // lines on Line chart
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';


// Register all elements you will use
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,    // required for Bar charts
  PointElement,  // required for Line chart points
  LineElement,   // required for Line chart lines
  Title,
  ChartTooltip,
  Legend
);

const LegendItem = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <div style={{ width: '20px', height: '20px', backgroundColor: color, borderRadius: '3px' }}></div>
    <span>{label}</span>
  </div>
);

// Custom icon using public folder
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
  const [selectedIncident, setSelectedIncident] = useState(null);
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [trendData, setTrendData] = useState([]);

  const [typeStats, setTypeStats] = useState({});
 const [stats, setStats] = useState({
  reported: 0,
  onProcess: 0,
  resolved: 0,
  total: 0
});
const [evacAnalytics, setEvacAnalytics] = useState({
  totalPlaces: 0,
  statusCounts: { available: 0, limited: 0, full: 0 },
  totalCapacity: 0,
  averageCapacity: 0
});

useEffect(() => {
  const fetchEvacAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:8000/evacs/analytics/summary');
      setEvacAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchEvacAnalytics();
  const interval = setInterval(fetchEvacAnalytics, 5000); // refresh every 5 sec for testing
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const fetchTrend = async () => {
    try {
      const res = await axios.get('http://localhost:8000/incident/trend');
      setTrendData(res.data); // <-- update your state with fetched data
    } catch (err) {
      console.error(err);
    }
  };

  fetchTrend();
  const interval = setInterval(fetchTrend, 5000); // refresh every 5 sec for testing
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const fetchTypeStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/incident/typeStats');
      setTypeStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchTypeStats();
  const interval = setInterval(fetchTypeStats, 5000);
  return () => clearInterval(interval);
}, []);


const fetchTypeStatsNow = async () => {
  const res = await axios.get('http://localhost:8000/incident/typeStats');
  setTypeStats(res.data);
};

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/incident/stats');
      setStats(res.data);  // now includes total
    } catch (err) {
      console.error(err);
    }
  };

  fetchStats();
  const interval = setInterval(fetchStats, 5000);
  return () => clearInterval(interval);
}, []);
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

  const handleChange = async (id, value) => {
  try {
    const incident = incidents.find(i => i._id === id);

    // ✅ UPDATE STATUS IN DATABASE
    await axios.put(`http://localhost:8000/incident/updateStatus/${id}`, {
      status: value
    });

    // ✅ SAVE HISTORY
    await axios.post('http://localhost:8000/history/registerHistory', {
      action: 'STATUS_UPDATE',
      placeName: incident.location,
      details: incident.description,
    });

    // ✅ UPDATE UI
    setIncidents(prev =>
      prev.map(i => i._id === id ? { ...i, status: value } : i)
    );

    setStatusMap(prev => ({ ...prev, [id]: value }));

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

      // fetchTypeStatsNow();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
     
      <h1>Admin Page</h1>

      <h2>Evacuation Center Analytics</h2>
<div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
  <div style={cardStyle}>
    <h3>Total Centers</h3>
    <p>{evacAnalytics.totalPlaces}</p>
  </div>

  <div style={cardStyle}>
    <h3>Available</h3>
    <p>{evacAnalytics.statusCounts.available}</p>
  </div>

  <div style={cardStyle}>
    <h3>Limited</h3>
    <p>{evacAnalytics.statusCounts.limited}</p>
  </div>

  <div style={cardStyle}>
    <h3>Full</h3>
    <p>{evacAnalytics.statusCounts.full}</p>
  </div>

  <div style={cardStyle}>
    <h3>Total Capacity</h3>
    <p>{evacAnalytics.totalCapacity}</p>
  </div>

  <div style={cardStyle}>
    <h3>Average Capacity</h3>
    <p>{Math.round(evacAnalytics.averageCapacity * 10) / 10}</p>
  </div>
</div>

<h3>Evacuation Center Status Distribution</h3>
<div style={{ maxWidth: '600px', marginBottom: '40px' }}>
  <Bar
    data={{
      labels: ['Available', 'Limited', 'Full'],
      datasets: [
        {
          label: 'Centers by Status',
          data: [
            evacAnalytics.statusCounts.available,
            evacAnalytics.statusCounts.limited,
            evacAnalytics.statusCounts.full
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
        }
      ]
    }}
    options={{
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Evacuation Center Status' }
      }
    }}
  />
</div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
  <div style={cardStyle}>
    <h3>Reported</h3>
    <p>{stats.reported}</p>
  </div>

  <div style={cardStyle}>
    <h3>On Process</h3>
    <p>{stats.onProcess}</p>
  </div>

  <div style={cardStyle}>
    <h3>Resolved</h3>
    <p>{stats.resolved}</p>
  </div>

  <div style={cardStyle}>
    <h3>Total Incidents</h3>
    <p>{stats.total}</p>
  </div>
</div> 

<h3>Incident Trend Over Time</h3>
<div style={{ maxWidth: '700px', marginBottom: '40px' }}>
  <Line
    data={{
      labels: trendData.map(item => item._id), // dates
      datasets: [
        {
          label: 'Incidents per Day',
          data: trendData.map(item => item.count),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    }}
    options={{
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Number of Incidents'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Daily Incident Reports'
        }
      }
    }}
  />
</div>

<h3>Incident Type Distribution</h3>
<div style={{ maxWidth: '600px', marginBottom: '40px' }}>
  <Bar
    data={{
      // Fixed order of labels
      labels: ['flood', 'fire', 'earthquake', 'typhoon'],
      datasets: [
        {
          label: 'Incidents per Type',
          data: [
            typeStats['flood'] || 0,
            typeStats['fire'] || 0,
            typeStats['earthquake'] || 0,
            typeStats['typhoon'] || 0
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',  // flood - blue
            'rgba(255, 99, 132, 0.6)',  // fire - red
            'rgba(255, 206, 86, 0.6)',  // earthquake - yellow
            'rgba(255, 159, 64, 0.6)'   // typhoon - orange
          ],
        }
      ]
    }}
    options={{
      responsive: true,
      plugins: {
        legend: { display: false }, // hide auto legend
        title: { display: true, text: 'Incident Count by Type' },
      },
    }}
  />

  {/* Custom static legend */}
  <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(54, 162, 235, 0.6)' }} />
      <span>Flood</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255, 99, 132, 0.6)' }} />
      <span>Fire</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255, 206, 86, 0.6)' }} />
      <span>Earthquake</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'rgba(255, 159, 64, 0.6)' }} />
      <span>Typhoon</span>
    </div>
  </div>
</div>

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
    click: () => {
      setSelectedIncident(incident);
    }
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
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Type</th>
            <th>Level</th>
            <th>Description</th>
            <th>Location</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map(inc => (
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
                <button onClick={() => handleDelete(inc._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedIncident && (
  <div className="modal">
    <h2>{selectedIncident.type}</h2>
    <p>Status: {selectedIncident.status}</p>
    <p>Severity: {selectedIncident.level}</p>
    <p>{selectedIncident.location}</p>
    <p>{selectedIncident.description}</p>
    <p> Username: {selectedIncident.usernames}</p>
    <p> Phone: {selectedIncident.phone}</p>

    <button onClick={() => setSelectedIncident(null)}>
      Close
    </button>
  </div>
)}
    </div>
  );
}

const cardStyle = {
  padding: '20px',
  background: '#f5f5f5',
  borderRadius: '10px',
  minWidth: '150px',
  textAlign: 'center',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
};
