import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import Header from '../Header';
import '../css/BarangayDashboard.css';

function BarangayDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);

  return (
    <div className="admin-wrapper">
      <Header />

      <div className="admin-container">
        {/* Page title (styled like admin) */}
        <h2 className="admin-title">Barangay Dashboard</h2>

        {/* EXACT same 3× desktop grid system as AdminDashboard */}
        <div className="cards-grid">
          {/* Each card sits on the same premium "card-surface" as Admin */}
          <div className="card-surface" role="button" onClick={() => navigate('/barangay/relief-request')} tabIndex={0}>
            <DashboardCard
              title="Relief Request"
              description="Submit relief requests to the DRRMO for affected residents."
              onClick={() => navigate('/barangay/relief-request')}
            />
          </div>

          <div className="card-surface" role="button" onClick={() => navigate('/barangay/messages')} tabIndex={0}>
            <DashboardCard
              title="Messages & Announcements"
              description="View messages and advisories from the DRRMO."
              onClick={() => navigate('/barangay/messages')}
            />
          </div>

          <div className="card-surface" role="button" onClick={() => navigate('/barangay/relief-status')} tabIndex={0}>
            <DashboardCard
              title="Relief Distribution Status"
              description="Track the status of requested and ongoing relief operations."
              onClick={() => navigate('/barangay/relief-status')}
            />
          </div>

          {/*
          // If/when you add more:
          <div className="card-surface" role="button" onClick={() => navigate('/barangay/account-settings')} tabIndex={0}>
            <DashboardCard
              title="Edit Accounts"
              description="View and manage your account."
              onClick={() => navigate('/barangay/account-settings')}
            />
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

export default BarangayDashboard;