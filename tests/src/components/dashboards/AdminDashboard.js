import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../css/AdminDashboard.css'; // <-- make sure this path is correct
import DashboardCard from '../../components/DashboardCard';
import '../css/DashboardCard.css'
export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      console.log('No role found → redirecting to login');
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      {/* Top header (your existing component) */}
      <Header />

      {/* Page body */}
      <div className="admin-wrapper">
        <div className="admin-container">
          <h2 className="admin-title">Admin Dashboard</h2>


          {/* Cards grid */}
          <section className="cards-grid">
            <DashboardCard
              className="card-surface"
              title="Register Account"
              description="Register accounts for Barangay and DRRMO."
              onClick={() => navigate('/admin/register')}
            />

            <DashboardCard
              className="card-surface"
              title="Edit Accounts"
              description="View and manage existing user accounts."
              onClick={() => navigate('/admin/edit-accounts')}
            />

            <DashboardCard
              className="card-surface"
              title="Audit Trail"
              description="View logs of relief requests and actions taken."
              onClick={() => navigate('/admin/audit-trail')}
            />

            <DashboardCard
              className="card-surface"
              title="Archived Accounts"
              description="View and manage archived user accounts."
              onClick={() => navigate('/admin/archived-accounts')}
            />

            <DashboardCard
              className="card-surface"
              title="Evacuation Management"
              description="View and manage evacuation places."
              onClick={() => navigate('/evacuation')}
            />

            <DashboardCard
              className="card-surface"
              title="Time in and Time out"
              description="Manage time in and time out for administrative accounts."
              onClick={() => navigate('/admin/time-in-time-out')}
            />

            <DashboardCard
              className="card-surface"
              title="Admin Logs"
              description="View admin activity logs."
              onClick={() => navigate('/admin/logs')}
            />
            
          </section>
        </div>
      </div>
    </div>
  );
}