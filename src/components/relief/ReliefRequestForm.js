import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import Header from '../Header';

export default function ReliefRequestForm() {
  const navigate = useNavigate();
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);
  const categories = [
    { key: 'food', label: 'Food & Water' },
    { key: 'hygiene', label: 'Hygiene & Sanitation' },
    { key: 'clothing', label: 'Clothes & Warmth' },
    { key: 'furniture', label: 'Furniture' },
    { key: 'medicine', label: 'Medical & Safety' }
  ];

  const peopleRanges = ['10–20', '20–50', '50–100', '100–300'];

  const [reliefReq, setReliefReq] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [peopleRange, setPeopleRange] = useState('');

  async function fetchMyRequests() {
    try {
      const res = await fetch(
        'http://localhost:8000/api/barangays/me',
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to load requests');
      const data = await res.json();
      setReliefReq(data.reliefReq || {});
    } catch (err) {
      console.error(err);
    }
  }

  // 🔁 Real-time polling
  useEffect(() => {
    fetchMyRequests();

    const interval = setInterval(fetchMyRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  function isLocked(categoryKey) {
    return reliefReq[categoryKey]?.active;
  }

  async function confirmRequest() {
    if (!activeCategory || !peopleRange) return;

    const key = activeCategory.key;

    if (isLocked(key)) {
      alert('You already have a pending request for this category.');
      return;
    }

    try {
      const res = await fetch(
        'http://localhost:8000/api/barangays/relief-request',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ categoryKey: key, peopleRange })
        }
      );

      if (!res.ok) throw new Error('Failed to submit request');

      fetchMyRequests(); // 🔄 sync immediately
      setActiveCategory(null);
      setPeopleRange('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div>
      <Header/>
      <h2>Relief Request</h2>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {categories.map(category => {
          const locked = isLocked(category.key);
          return (
            <DashboardCard
              key={category.key}
              title={category.label}
              description={locked ? 'Pending / In Progress' : 'Request relief'}
              onClick={() => !locked && setActiveCategory(category)}
            />
          );
        })}
      </div>

      {activeCategory && (
        <div style={{ marginTop: 30 }}>
          <h3>{activeCategory.label}</h3>

          {peopleRanges.map(range => (
            <label key={range} style={{ display: 'block' }}>
              <input
                type="radio"
                checked={peopleRange === range}
                onChange={() => setPeopleRange(range)}
              />
              {range} people
            </label>
          ))}

          <button disabled={!peopleRange} onClick={confirmRequest}>
            Confirm Request
          </button>
        </div>
      )}

      <button style={{ marginTop: 40 }} onClick={() => navigate('/barangay/dashboard')}>
        Go Back to Dashboard
      </button>
    </div>
  );
}
