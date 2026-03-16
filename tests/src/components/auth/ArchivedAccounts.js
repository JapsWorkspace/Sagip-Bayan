import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../css/ArchivedAccounts.css';       // keep your original styles if needed
import '../css/ArchivedAccounts.css';   // NEW: add the TIO layout CSS below

export default function ArchivedAccounts() {
  const navigate = useNavigate();

  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);

  // measure header height so the table region fits the viewport perfectly
  const appRef = useRef(null);

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) navigate('/');
  }, [navigate]);

  useEffect(() => {
    fetchArchivedAccounts();
  }, []);

  useEffect(() => {
    // set --app-header-h dynamically from actual header height
    const syncHeaderHeight = () => {
      const headerEl = document.querySelector('.app-header');
      const h = headerEl ? headerEl.getBoundingClientRect().height : 0;
      if (appRef.current) {
        appRef.current.style.setProperty('--app-header-h', `${Math.round(h)}px`);
      }
    };
    syncHeaderHeight();
    // update on resize or when fonts load
    window.addEventListener('resize', syncHeaderHeight);
    const ro = new ResizeObserver(syncHeaderHeight);
    const headerEl = document.querySelector('.app-header');
    if (headerEl) ro.observe(headerEl);
    return () => {
      window.removeEventListener('resize', syncHeaderHeight);
      ro.disconnect();
    };
  }, []);

  const fetchArchivedAccounts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/archived', {
        credentials: 'include'
      });
      const data = await res.json();
      setArchived(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch archived accounts');
    } finally {
      setLoading(false);
    }
  };

  const restoreAccount = async (id) => {
    if (!window.confirm('Restore this account?')) return;

    try {
      const res = await fetch(`http://localhost:8000/api/auth/restore/${id}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Account restored successfully');
        setArchived(prev => prev.filter(a => a._id !== id));
      } else {
        alert('Failed to restore account');
      }
    } catch (err) {
      console.error(err);
      alert('Error restoring account');
    }
  };

  return (
    <div className="tio-app" ref={appRef}>
      <Header />

      {/* Toolbar */}
      <div className="tio-toolbar" style={{ height: 'var(--tio-toolbar-h)' }}>
        <div className="tio-toolbar-left">
          <h2 className="tio-title">Archived Accounts</h2>
          <span className="tio-meta">
            {loading ? 'Loading…' : `${archived.length} record${archived.length === 1 ? '' : 's'}`}
          </span>
        </div>
        <div className="tio-toolbar-right">
          <button
            className="tio-btn"
            onClick={() => navigate(-1)}
            title="Back"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main area (no page scroll) */}
      <main className="tio-main">
        <div className="tio-table-region">
          <div className="tio-table-wrap">
            <table className="tio-table">
              <thead>
                <tr>
                  <th style={{ width: '18ch' }}>Username</th>
                  <th style={{ width: '26ch' }}>Email</th>
                  <th style={{ width: '14ch' }}>Phone</th>
                  <th>Address</th>
                  <th style={{ width: '12ch' }}>Role</th>
                  <th style={{ width: '12ch' }}></th>
                </tr>
              </thead>

              {/* SINGLE tbody now contains probe + dynamic rows */}
              <tbody>
                {/* Probe row */}
                <tr className="tio-probe-row">
                  <td>username_example</td>
                  <td>name@example.com</td>
                  <td>09123456789</td>
                  <td>Barangay San Nicolas, Jaen</td>
                  <td>DRRMO</td>
                  <td></td>
                </tr>

                {loading && (
                  <tr className="tio-empty-row">
                    <td colSpan={6}>
                      <div className="tio-empty-inline">
                        <span className="tio-empty-emoji">⏳</span>
                        <div className="tio-empty-text">
                          <strong>Loading archived accounts…</strong>
                          <span className="tio-muted">Please wait</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && archived.length === 0 && (
                  <tr className="tio-empty-row">
                    <td colSpan={6}>
                      <div className="tio-empty-inline">
                        <span className="tio-empty-emoji">📂</span>
                        <div className="tio-empty-text">
                          <strong>No Archived Accounts</strong>
                          <span className="tio-muted">
                            Accounts that are archived will appear here.
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && archived.length > 0 && archived.map(acc => (
                  <tr key={acc._id}>
                    <td title={acc.username ?? ''}>{acc.username}</td>
                    <td title={acc.email ?? ''} style={{ color: '#0b4dbb', fontWeight: 700, cursor: 'pointer' }}>
                      {acc.email}
                    </td>
                    <td title={acc.phoneNumber ?? ''}>{acc.phoneNumber}</td>
                    <td title={acc.address ?? ''}>{acc.address}</td>
                    <td title={acc.role ?? ''}>{acc.role}</td>
                    <td>
                      <button
                        className="tio-btn"
                        style={{
                          background: '#2e7d32',
                          color: '#fff',
                          borderColor: '#2e7d32',
                          fontWeight: 800
                        }}
                        onClick={() => restoreAccount(acc._id)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination row */}
          <div className="tio-pagination">
            <button className="tio-btn" disabled>Prev</button>
            <span className="tio-page">Page 1</span>
            <button className="tio-btn" disabled>Next</button>
          </div>
        </div>
      </main>
    </div>
  );
}
