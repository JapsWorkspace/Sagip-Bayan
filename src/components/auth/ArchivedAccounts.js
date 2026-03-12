import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../css/ArchivedAccounts.css';

export default function ArchivedAccounts() {
  const navigate = useNavigate()

  const [archived, setArchived] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    if (!storedRole) {
      navigate('/')
    }
  }, [navigate])

  useEffect(() => {
    fetchArchivedAccounts()
  }, [])

  const fetchArchivedAccounts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/archived', {
        credentials: 'include'
      })

      const data = await res.json()
      setArchived(data)
    } catch (err) {
      console.error(err)
      alert('Failed to fetch archived accounts')
    } finally {
      setLoading(false)
    }
  }

  const restoreAccount = async id => {
    if (!window.confirm('Restore this account?')) return

    try {
      const res = await fetch(
        `http://localhost:8000/api/auth/restore/${id}`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      )

      if (res.ok) {
        alert('Account restored successfully')
        setArchived(prev => prev.filter(a => a._id !== id))
      } else {
        alert('Failed to restore account')
      }
    } catch (err) {
      console.error(err)
      alert('Error restoring account')
    }
  }

  return (
    <div className="archived-accounts">
      <Header />

      <div className="aa-toolbar">
        <h2 className="aa-title">Archived Accounts</h2>
        <button
          className="aa-back"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="aa-content">

        {loading && (
          <div className="aa-loading">
            Loading archived accounts...
          </div>
        )}

        {!loading && archived.length === 0 && (
          <div className="aa-empty">
            <div className="aa-empty-title">
              No Archived Accounts
            </div>

            <div className="aa-empty-sub">
              Accounts that are archived will appear here.
            </div>
          </div>
        )}

        {!loading && archived.length > 0 &&
          archived.map(acc => (
            <div key={acc._id} className="aa-card">

              <strong>
                {acc.username} ({acc.role})
              </strong>

              <p>Email: {acc.email}</p>
              <p>Phone: {acc.phoneNumber}</p>
              <p>Address: {acc.address}</p>

              <div className="aa-actions">
                <button
                  className="aa-btn aa-btn-restore"
                  onClick={() => restoreAccount(acc._id)}
                >
                  Restore Account
                </button>
              </div>

            </div>
          ))
        }

      </div>

    </div>
  )
}