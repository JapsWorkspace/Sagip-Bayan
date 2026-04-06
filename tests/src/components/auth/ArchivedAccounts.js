import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import DashboardShell from '../layout/DashboardShell';
=======
>>>>>>> upstream/myapp-update
import '../css/ArchivedAccounts.css';

export default function ArchivedAccounts() {
  const navigate = useNavigate();
  const BASE_URL =
    process.env.REACT_APP_API_URL || 'https://gaganadapat.onrender.com';

  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);

<<<<<<< HEAD
  // measure app header height only if you still render a top header elsewhere
  const appRef = useRef(null);
=======
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 8;
>>>>>>> upstream/myapp-update

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) navigate('/');
  }, [navigate]);

  useEffect(() => {
    fetchArchivedAccounts();
  }, []);

  useEffect(() => {
<<<<<<< HEAD
    const syncHeaderHeight = () => {
      const headerEl = document.querySelector('.app-header');
      const h = headerEl ? headerEl.getBoundingClientRect().height : 0;
      if (appRef.current) {
        appRef.current.style.setProperty('--app-header-h', `${Math.round(h)}px`);
      }
    };
    syncHeaderHeight();

    window.addEventListener('resize', syncHeaderHeight);
    const ro = new ResizeObserver(syncHeaderHeight);
    const headerEl = document.querySelector('.app-header');
    if (headerEl) ro.observe(headerEl);
    return () => {
      window.removeEventListener('resize', syncHeaderHeight);
      ro.disconnect();
    };
  }, []);
=======
    setPage(1);
  }, [search, roleFilter]);
>>>>>>> upstream/myapp-update

  const fetchArchivedAccounts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/auth/archived`, {
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
      setRestoringId(id);

      const res = await fetch(`${BASE_URL}/api/auth/restore/${id}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Account restored successfully');
        setArchived((prev) => prev.filter((a) => a._id !== id));
      } else {
        alert('Failed to restore account');
      }
    } catch (err) {
      console.error(err);
      alert('Error restoring account');
    } finally {
      setRestoringId(null);
    }
  };

<<<<<<< HEAD
  return (
    <DashboardShell>
      {/* NOTE: we add tio-no-toolbar to switch height calc to “no toolbar” mode */}
      <div className="tio-app tio-no-toolbar" ref={appRef}>
        {/* ❌ Toolbar removed — we show a slim count bar inside main instead */}

        <main className="tio-main">
          {/* thin count bar (like Edit view’s countbar) */}
          <div className="tio-headbar">
            <span>
              {loading ? 'Loading…' : `${archived.length} record${archived.length === 1 ? '' : 's'}`}
            </span>
          </div>

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
=======
  const filteredArchived = useMemo(() => {
    const term = search.trim().toLowerCase();

    return archived.filter((acc) => {
      const matchesSearch =
        !term ||
        String(acc.username || '').toLowerCase().includes(term) ||
        String(acc.email || '').toLowerCase().includes(term) ||
        String(acc.phoneNumber || '').toLowerCase().includes(term) ||
        String(acc.address || '').toLowerCase().includes(term) ||
        String(acc.role || '').toLowerCase().includes(term);

      const matchesRole =
        !roleFilter || String(acc.role || '').toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [archived, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredArchived.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedArchived = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredArchived.slice(start, start + PAGE_SIZE);
  }, [filteredArchived, safePage]);

  const roleCounts = useMemo(() => {
    return archived.reduce(
      (acc, item) => {
        const role = String(item.role || '').toLowerCase();
        if (role === 'barangay') acc.barangay += 1;
        if (role === 'drrmo') acc.drrmo += 1;
        return acc;
      },
      { barangay: 0, drrmo: 0 }
    );
  }, [archived]);

  const formatRole = (role) => {
    if (!role) return '-';
    if (String(role).toLowerCase() === 'drrmo') return 'DRRMO';
    if (String(role).toLowerCase() === 'barangay') return 'Barangay';
    return role;
  };

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
      <div className="archived-page">
        <div className="archived-shell">
          <div className="archived-hero">
            <div className="archived-hero-copy">
              <span className="archived-kicker">Administration Module</span>
              <h1 className="archived-title">Archived Accounts</h1>
              <p className="archived-subtitle">
                Review archived user records and restore accounts when access needs
                to be reactivated. Use search and filtering to quickly find archived
                DRRMO and barangay accounts.
              </p>
            </div>

            <div className="archived-stats">
              <div className="archived-stat-card">
                <span>Total Archived</span>
                <strong>{loading ? '—' : archived.length}</strong>
              </div>
              <div className="archived-stat-card">
                <span>Barangay</span>
                <strong>{loading ? '—' : roleCounts.barangay}</strong>
              </div>
              <div className="archived-stat-card">
                <span>DRRMO</span>
                <strong>{loading ? '—' : roleCounts.drrmo}</strong>
              </div>
              <div className="archived-stat-card emphasis">
                <span>Filtered Results</span>
                <strong>{loading ? '—' : filteredArchived.length}</strong>
              </div>
            </div>
          </div>

          <section className="archived-panel">
            <div className="archived-panel-head">
              <div>
                <h2>Archived Account Records</h2>
                <p>
                  Search archived accounts, review user details, and restore records
                  individually when needed.
                </p>
              </div>
            </div>

            <div className="archived-toolbar">
              <input
                className="archived-search"
                type="text"
                placeholder="Search by username, email, phone, address, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="archived-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="barangay">Barangay</option>
                <option value="drrmo">DRRMO</option>
              </select>
            </div>

            <div className="archived-table-wrap">
              <table className="archived-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Action</th>
>>>>>>> upstream/myapp-update
                  </tr>
                </thead>

                <tbody>
<<<<<<< HEAD
                  {/* Probe row for column sizing */}
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
=======
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="archived-empty-cell">
                        <div className="archived-empty-state">
                          <span className="archived-empty-icon">⏳</span>
                          <div>
                            <strong>Loading archived accounts...</strong>
                            <p>Please wait while records are being fetched.</p>
>>>>>>> upstream/myapp-update
                          </div>
                        </div>
                      </td>
                    </tr>
<<<<<<< HEAD
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
=======
                  ) : paginatedArchived.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="archived-empty-cell">
                        <div className="archived-empty-state">
                          <span className="archived-empty-icon">📂</span>
                          <div>
                            <strong>No archived accounts found</strong>
                            <p>
                              Archived users will appear here. Try adjusting your
                              search or role filter.
                            </p>
>>>>>>> upstream/myapp-update
                          </div>
                        </div>
                      </td>
                    </tr>
<<<<<<< HEAD
                  )}

                  {!loading && archived.length > 0 && archived.map(acc => (
                    <tr key={acc._id}>
                      <td title={acc.username ?? ''}>{acc.username}</td>
                      <td
                        title={acc.email ?? ''}
                        style={{ color: '#0b4dbb', fontWeight: 700, cursor: 'pointer' }}
                      >
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
=======
                  ) : (
                    paginatedArchived.map((acc) => (
                      <tr key={acc._id}>
                        <td title={acc.username || ''}>{acc.username || '-'}</td>
                        <td className="archived-email" title={acc.email || ''}>
                          {acc.email || '-'}
                        </td>
                        <td title={acc.phoneNumber || ''}>{acc.phoneNumber || '-'}</td>
                        <td title={acc.address || ''}>{acc.address || '-'}</td>
                        <td>
                          <span
                            className={`archived-role-pill ${
                              String(acc.role || '').toLowerCase() === 'barangay'
                                ? 'barangay'
                                : 'drrmo'
                            }`}
                          >
                            {formatRole(acc.role)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="archived-restore-btn"
                            onClick={() => restoreAccount(acc._id)}
                            disabled={restoringId === acc._id}
                          >
                            {restoringId === acc._id ? 'Restoring...' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
>>>>>>> upstream/myapp-update
                </tbody>
              </table>
            </div>

<<<<<<< HEAD
            {/* Pagination row */}
            <div className="tio-pagination">
              <button className="tio-btn" disabled>Prev</button>
              <span className="tio-page">Page 1</span>
              <button className="tio-btn" disabled>Next</button>
            </div>
          </div>
        </main>
      </div>
    </DashboardShell>
=======
            <div className="archived-pagination">
              <button
                className="archived-page-btn"
                disabled={!canPrev}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                ← Prev
              </button>

              <span className="archived-page-label">
                Page {safePage} of {totalPages}
              </span>

              <button
                className="archived-page-btn"
                disabled={!canNext}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next →
              </button>
            </div>
          </section>
        </div>
      </div>
>>>>>>> upstream/myapp-update
  );
}