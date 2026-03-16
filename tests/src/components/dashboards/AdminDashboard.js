import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../css/AdminDashboard.css';
import DashboardCard from '../../components/DashboardCard';
import '../css/DashboardCard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      console.log('No role found → redirecting to login');
      navigate('/');
    }
  }, [navigate]);

  return (
    <div>
      <Header />

      <div className="admin-wrapper">
        <div className="admin-container">
          <h2 className="admin-title">Admin Dashboard</h2>

          {/* Cards Grid */}
          <section className="cards-grid">
            <DashboardCard
              title="Register Account"
              desc="Register accounts for Barangay and DRRMO."
              onClick={() => navigate('/admin/register')}
              icon="user-add"
            />

            <DashboardCard
              title="Edit Accounts"
              desc="View and manage existing user accounts."
              onClick={() => navigate('/admin/edit-accounts')}
              icon="settings"
            />

            <DashboardCard
              title="Audit Trail"
              desc="View logs of relief requests and actions taken."
              onClick={() => navigate('/admin/audit-trail')}
              icon="clipboard"
            />

            <DashboardCard
              title="Archived Accounts"
              desc="View and manage archived accounts."
              onClick={() => navigate('/admin/archived-accounts')}
              icon="archive"
            />

            <DashboardCard
              title="Evacuation Management"
              desc="View and manage evacuation sites."
              onClick={() => navigate('/evacuation')}
              icon="location"
            />

            <DashboardCard
              title="Time-in / Time-out"
              desc="Manage attendance for admin accounts."
              onClick={() => navigate('/admin/time-in-time-out')}
              icon="clock"
            />

            <DashboardCard
              title="Admin Logs"
              desc="View administrative activity logs."
              onClick={() => navigate('/admin/logs')}
              icon="shield"
            />
          </section>
        </div>
      </div>
    </div>
  );
}