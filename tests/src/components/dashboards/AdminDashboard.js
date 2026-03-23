import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../layout/DashboardShell';

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
    <DashboardShell>
      <div className="admin-wrapper">
        <div className="admin-container">
          <h2 className="admin-title">Admin Dashboard</h2>

          {/* Quick Actions (replaces the old DashboardCard grid) */}
          <section className="quick-actions">
            <div className="qa-grid">
              <button className="qa-item" onClick={() => navigate('/admin/register')}>
                Register Account
              </button>

              <button className="qa-item" onClick={() => navigate('/admin/edit-accounts')}>
                Edit Accounts
              </button>

              <button className="qa-item" onClick={() => navigate('/admin/audit-trail')}>
                Audit Trail
              </button>

              <button className="qa-item" onClick={() => navigate('/admin/archived-accounts')}>
                Archived Accounts
              </button>

              <button className="qa-item" onClick={() => navigate('/evacuation')}>
                Evacuation Management
              </button>

<<<<<<< HEAD
              <button className="qa-item" onClick={() => navigate('/admin')}>
                Incident Reports
              </button>

              <button className="qa-item" onClick={() => navigate('/admin/time-in-time-out')}>
                Time-in / Time-out
              </button>

              <button className="qa-item" onClick={() => navigate('/admin/logs')}>
                Admin Logs
              </button>
            </div>
=======
            <DashboardCard
              title="Incident Reports"
              desc="View and manage the reported incidents."
              onClick={() => navigate('/admin')}
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

>>>>>>> 12fa248 (Initial commit)
          </section>
        </div>
      </div>
      
    </DashboardShell>
  );
}