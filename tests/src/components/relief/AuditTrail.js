import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';

const categoryLabels = {
  food: 'Food & Water',
  hygiene: 'Hygiene & Sanitation',
  clothing: 'Clothes & Warmth',
  furniture: 'Furniture',
  medicine: 'Medical & Safety'
};

export default function AuditTrail() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);

  const [logs, setLogs] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [openBarangay, setOpenBarangay] = useState(null);

  /* 🔹 Fetch audit history */
  const fetchAudit = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/audit');
      if (!res.ok) throw new Error('Failed to fetch audit');

      const data = await res.json();

      // newest first
      const sorted = data.sort(
        (a, b) => new Date(b.actionAt) - new Date(a.actionAt)
      );
      setLogs(sorted);

      // group by barangay
      const groupedData = {};
      sorted.forEach(log => {
        if (!groupedData[log.barangayName]) groupedData[log.barangayName] = [];
        groupedData[log.barangayName].push(log);
      });
      setGrouped(groupedData);
    } catch (err) {
      console.error(err);
      setLogs([]);
      setGrouped({});
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🔹 Polling for real-time updates every 5 seconds */
  useEffect(() => {
    fetchAudit(); // initial load
    const interval = setInterval(fetchAudit, 5000); // every 5 sec
    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchAudit]);

  if (loading) return <p>Loading audit trail...</p>;

  return (
    <div>
      <Header/>
      <h2>Relief Request Audit Trail</h2>
      
      {Object.keys(grouped).length === 0 ? (
        <p>No history found.</p>
      ) : (
        Object.entries(grouped).map(([barangay, records]) => (
          <div key={barangay} style={box}>
            {/* Barangay Header */}
            <div
              style={header}
              onClick={() =>
                setOpenBarangay(openBarangay === barangay ? null : barangay)
              }
            >
              <strong>{barangay}</strong>
              <span>{records.length} actions</span>
            </div>

            {/* Expand History */}
            {openBarangay === barangay && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Category</th>
                    <th style={th}>People Range</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action By</th>
                    <th style={th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td style={td}>{categoryLabels[r.category]}</td>
                      <td style={td}>{r.peopleRange}</td>
                      <td style={td}>{r.status}</td>
                      <td style={td}>{r.actionBy}</td>
                      <td style={td}>{new Date(r.actionAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}

      <button style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
        Back to Dashboard
      </button>
    </div>
  );
}

/* 🎨 simple clean styling */
const box = {
  border: '1px solid #ddd',
  borderRadius: 6,
  marginBottom: 12,
  overflow: 'hidden'
};

const header = {
  padding: 12,
  background: '#f5f5f5',
  display: 'flex',
  justifyContent: 'space-between',
  cursor: 'pointer'
};

const th = { borderBottom: '2px solid #ccc', textAlign: 'left', padding: 8 };
const td = { borderBottom: '1px solid #eee', padding: 8 };
