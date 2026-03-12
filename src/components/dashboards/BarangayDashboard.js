import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../../components/DashboardCard';
import Header from '../Header';

function BarangayDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/'); // redirect to login
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // clear session
    navigate('/'); // redirect to login
  };

  return (
    <div>
      <Header/>
      <h2>Barangay Dashboard</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <DashboardCard
          title="Relief Request"
          description="Submit relief requests to the DRRMO for affected residents."
          onClick={() => navigate('/barangay/relief-request')}
        />

        <DashboardCard
          title="Messages & Announcements"
          description="View messages and advisories from the DRRMO."
          onClick={() => navigate('/barangay/messages')}
        />

        <DashboardCard
          title="Relief Distribution Status"
          description="Track the status of requested and ongoing relief operations."
          onClick={() => navigate('/barangay/relief-status')}
        />
        
        {/* <DashboardCard
          title="Edit Accounts"
          description="View and manage your account."
          onClick={() => navigate('/barangay/account-settings')}
        />  */}
      </div>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default BarangayDashboard;
