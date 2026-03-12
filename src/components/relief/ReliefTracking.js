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

export default function ReliefTracking() {
  const navigate = useNavigate();
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);

  const [viewerType, setViewerType] = useState('');
  const [rows, setRows] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 🔹 Fetch tracking data */
  const fetchRelief = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/relief-tracking', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();

      // BARANGAY response
      if (data.rows) {
        setViewerType('barangay');
        setRows(data.rows);
        setHistory(data.history || []);
      } 
      // DRRMO response
      else {
        setViewerType('drrmo');
        setRows(data);
      }

    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* 🔹 BARANGAY ACTIONS */
  const handleBarangayAction = async (categoryKey, action) => {
    try {
      const res = await fetch(
        'http://localhost:8000/api/barangays/relief-request-action',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ categoryKey, action })
        }
      );
      if (!res.ok) throw new Error('Action failed');

      await fetchRelief();
    } catch (err) {
      alert(err.message);
    }
  };

  /* 🔹 DRRMO CANCEL APPROVAL */
  const handleCancelApproval = async (barangayId, categoryKey) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/drrmo/relief-request-status/${barangayId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ categoryKey, action: 'cancel' })
        }
      );
      if (!res.ok) throw new Error('Cancel failed');

      fetchRelief();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRelief();
    const i = setInterval(fetchRelief, 5000);
    return () => clearInterval(i);
  }, [fetchRelief]);

  if (loading) return <p>Loading relief tracking…</p>;

  return (
    <div>
      <Header/>
      <h2>Relief Tracking</h2>

      {rows.length === 0 ? (
        <p>No active requests.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Barangay</th>
              <th style={th}>Category</th>
              <th style={th}>People Range</th>
              <th style={th}>Status</th>
              <th style={th}>Requested At</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={`${r.barangayId}-${r.categoryKey}`}>
                <td style={td}>{r.barangayName}</td>
                <td style={td}>{categoryLabels[r.categoryKey]}</td>
                <td style={td}>{r.peopleRange}</td>
                <td style={td}>{r.status}</td>
                <td style={td}>
                  {r.requestedAt ? new Date(r.requestedAt).toLocaleString() : '-'}
                </td>
                <td style={td}>
  {/* BARANGAY */}
  {viewerType === 'barangay' && r.status === 'requested' && (
    <button onClick={() => handleBarangayAction(r.categoryKey, 'cancel')}>
      Cancel Request
    </button>
  )}

  {viewerType === 'barangay' && r.status === 'approved' && (
    <button onClick={() => handleBarangayAction(r.categoryKey, 'received')}>
      Relief Goods Received
    </button>
  )}

  {/* DRRMO */}
  {viewerType === 'drrmo' && r.status === 'approved' && (
    <button
      onClick={() => handleCancelApproval(r.barangayId, r.categoryKey)}
    >
      Cancel Approval
    </button>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* BARANGAY HISTORY ONLY */}
      {viewerType === 'barangay' && history.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>History</h3>
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
              {history.map((h, i) => (
                <tr key={i}>
                  <td style={td}>{categoryLabels[h.category]}</td>
                  <td style={td}>{h.peopleRange}</td>
                  <td style={td}>{h.status}</td>
                  <td style={td}>{h.actionBy}</td>
                  <td style={td}>{new Date(h.actionAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
        Go Back to Dashboard
      </button>
    </div>
  );
}

const th = { borderBottom: '2px solid #ccc', textAlign: 'left', padding: 8 };
const td = { borderBottom: '1px solid #eee', padding: 8 };
