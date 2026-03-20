import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import Header from '../Header';
function DRRMODashboard() {
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
      <h2>DRRMO Dashboard</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <DashboardCard
          title="Relief Requests List"
          description="Review, validate, and approve relief requests from barangays."
          onClick={() => navigate('/drrmo/relief-lists')}
        />
        
        <DashboardCard
          title="Evacuation Management"
          desc="View and manage evacuation sites."
          onClick={() => navigate('/evacuation')}
          icon="location"
        />

        <DashboardCard
          title="Incident Reports"
          desc="View and manage the reported incidents."
          onClick={() => navigate('/admin')}
          icon="location"
        />

        <DashboardCard
          title="Guidelines"
          desc="Create and manage disaster preparedness guidelines."
          onClick={() => navigate('/idk')}
          icon="location"
        />

        <DashboardCard
          title="Audit Trail"
          description="View logs of relief requests."
          onClick={() => navigate('/drrmo/audit-trail')}
        />

        {/* <DashboardCard
          title="Edit Accounts"
          description="View and manage your account."
          onClick={() => navigate('/drrmo/account-settings')}
        /> */}

      </div>
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default DRRMODashboard;