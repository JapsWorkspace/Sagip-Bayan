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
          </section>
        </div>
      </div>
      
    </DashboardShell>
  );
}