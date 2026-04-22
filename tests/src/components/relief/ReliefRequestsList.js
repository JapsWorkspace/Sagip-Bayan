import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../layout/DashboardShell';
import '../css/ReliefRequestList.css';

const BASE_URL =
  process.env.REACT_APP_API_URL || 'https://gaganadapat.onrender.com';
<<<<<<< HEAD
=======

const INVENTORY_RELEASE_ROUTE = '/drrmo/inventory';

const EMPTY_SUMMARY = {
  totalInView: 0,
  pendingReview: 0,
  awaitingRelease: 0,
  partiallyReleased: 0,
  awaitingReceipt: 0,
  rejected: 0,
  completed: 0,
  highPriority: 0,
  mediumPriority: 0,
  normalPriority: 0
};

const normalize = (value) => String(value || '').trim().toLowerCase();

const formatStatusLabel = (value) =>
  String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '-';

const isResolvedStatus = (status) => {
  const normalized = normalize(status);
  return (
    normalized === 'received' ||
    normalized === 'completed' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'rejected'
  );
};

const getRequestIndividuals = (request) => {
  const totals = request?.totals || {};
  return (
    Number(totals.male || 0) +
    Number(totals.female || 0) +
    Number(totals.lgbtq || 0) +
    Number(totals.pwd || 0) +
    Number(totals.pregnant || 0) +
    Number(totals.senior || 0)
  );
};

const getVulnerableCount = (request) => {
  const priority = request?.prioritySnapshot || {};
  if (priority.vulnerableCount !== undefined) {
    return Number(priority.vulnerableCount || 0);
  }

  const totals = request?.totals || {};
  return (
    Number(totals.pwd || 0) +
    Number(totals.pregnant || 0) +
    Number(totals.senior || 0)
  );
};

const getEffectiveReceivedFoodPacks = (request) => {
  const requested = Number(request?.totals?.requestedFoodPacks || 0);
  const released = Number(request?.fulfillment?.releasedFoodPacks || 0);
  const received =
    request?.summary?.receivedFoodPacks !== undefined
      ? Number(request.summary.receivedFoodPacks || 0)
      : request?.receivedFoodPacks !== undefined
        ? Number(request.receivedFoodPacks || 0)
        : normalize(request?.status) === 'received'
          ? requested
          : 0;

  return Math.min(Math.max(received, 0), Math.max(requested, released, received));
};

const getFlowTone = (request) => {
  const status = normalize(request?.status);

  if (status === 'pending') return 'pending';
  if (status === 'approved') return 'approved';
  if (status === 'partially_released') return 'partial';
  if (status === 'released') return 'released';
  return 'default';
};

const getStatusOrder = (status) => {
  const normalized = normalize(status);

  if (normalized === 'pending') return 0;
  if (normalized === 'approved') return 1;
  if (normalized === 'released') return 2;
  if (normalized === 'partially_released') return 3;
  return 99;
};

const sortOperationalQueue = (items = []) =>
  [...items].sort((a, b) => {
    const statusDiff = getStatusOrder(a?.status) - getStatusOrder(b?.status);
    if (statusDiff !== 0) return statusDiff;

    const aTime = new Date(a?.requestDate || a?.createdAt || 0).getTime();
    const bTime = new Date(b?.requestDate || b?.createdAt || 0).getTime();
    return aTime - bTime;
  });
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

export default function ReliefRequestsList() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [search, setSearch] = useState('');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
=======
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [queueSummary, setQueueSummary] = useState(EMPTY_SUMMARY);

  const [queueFilter, setQueueFilter] = useState('active');
  const [barangayFilter, setBarangayFilter] = useState('');

  const [reviewDetails, setReviewDetails] = useState(null);
  const [feasibility, setFeasibility] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (!storedRole) {
      navigate('/');
    }
  }, [navigate]);

<<<<<<< HEAD
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/drrmo/requests/pending`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
=======
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const getPdfPath = (request) => {
    if (request?.pdfFile) return request.pdfFile;
    if (request?.requestNo) {
      return `/uploads/relief-requests/${request.requestNo}.pdf`;
    }
    return '';
  };

  const getQueueHeading = () => {
    if (queueFilter === 'pending') return 'Pending Review';
    if (queueFilter === 'approved') return 'Awaiting Release';
    if (queueFilter === 'partial') return 'Partially Released';
    if (queueFilter === 'released') return 'Awaiting Receipt';
    return 'Active Queue';
  };

  const fetchQueue = useCallback(async () => {
    try {
      setLoadingQueue(true);

      const params = new URLSearchParams();
      params.set('status', queueFilter === 'partial' ? 'active' : queueFilter);

      const res = await fetch(
        `${BASE_URL}/api/drrmo/requests/queue?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch request queue');
      }

      const data = await res.json();
      const requests = Array.isArray(data?.requests) ? data.requests : [];

      const cleaned = sortOperationalQueue(
        requests.filter((item) => !isResolvedStatus(item?.status))
      );

      setRows(cleaned);
      setQueueSummary(data?.summary || EMPTY_SUMMARY);

      setSelectedRequest((prev) => {
        if (!prev?._id) return cleaned[0] || null;
        return cleaned.find((item) => item._id === prev._id) || cleaned[0] || null;
      });
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
    } catch (err) {
      console.error(err);
      setRows([]);
      setQueueSummary(EMPTY_SUMMARY);
      setSelectedRequest(null);
    } finally {
      setLoadingQueue(false);
    }
<<<<<<< HEAD
  }, []);
=======
  }, [queueFilter]);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

<<<<<<< HEAD
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((row) => {
      const requestNo = String(row.requestNo || '').toLowerCase();
      const barangayName = String(row.barangayName || '').toLowerCase();
      const disaster = String(row.disaster || '').toLowerCase();
      const status = String(row.status || '').toLowerCase();

      return (
        requestNo.includes(q) ||
        barangayName.includes(q) ||
        disaster.includes(q) ||
        status.includes(q)
      );
    });
  }, [rows, search]);

  const handleAction = async (requestId, action, remarks = '') => {
    try {
      setSubmittingAction(true);

      const res = await fetch(
        `${BASE_URL}/api/drrmo/requests/${requestId}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action, remarks })
        }
      );
=======
  useEffect(() => {
    const loadSelectedRequestSupportData = async () => {
      if (!selectedRequest?._id) {
        setReviewDetails(null);
        setFeasibility(null);
        return;
      }

      try {
        setLoadingDetails(true);

        const [detailsRes, feasibilityRes] = await Promise.all([
          fetch(`${BASE_URL}/api/drrmo/requests/${selectedRequest._id}`, {
            credentials: 'include'
          }),
          fetch(`${BASE_URL}/api/drrmo/requests/${selectedRequest._id}/feasibility`, {
            credentials: 'include'
          })
        ]);

        const detailsData = detailsRes.ok ? await detailsRes.json() : null;
        const feasibilityData = feasibilityRes.ok ? await feasibilityRes.json() : null;

        setReviewDetails(detailsData);
        setFeasibility(feasibilityData);
      } catch (err) {
        console.error(err);
        setReviewDetails(null);
        setFeasibility(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadSelectedRequestSupportData();
  }, [selectedRequest]);

  const barangayOptions = useMemo(() => {
    return [
      ...new Set(
        rows
          .map((row) => String(row?.barangayName || '').trim())
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    let nextRows = [...rows];

    if (barangayFilter) {
      nextRows = nextRows.filter(
        (row) => String(row?.barangayName || '').trim() === barangayFilter
      );
    }

    if (queueFilter === 'pending') {
      nextRows = nextRows.filter((row) => normalize(row?.status) === 'pending');
    } else if (queueFilter === 'approved') {
      nextRows = nextRows.filter((row) => normalize(row?.status) === 'approved');
    } else if (queueFilter === 'partial') {
      nextRows = nextRows.filter(
        (row) => normalize(row?.status) === 'partially_released'
      );
    } else if (queueFilter === 'released') {
      nextRows = nextRows.filter((row) => normalize(row?.status) === 'released');
    }

    return sortOperationalQueue(nextRows);
  }, [rows, barangayFilter, queueFilter]);

  useEffect(() => {
    setSelectedRequest((prev) => {
      if (!filteredRows.length) return null;
      if (!prev?._id) return filteredRows[0];
      return filteredRows.find((item) => item._id === prev._id) || filteredRows[0];
    });
  }, [filteredRows]);

  const displayedRequest = reviewDetails?.request || selectedRequest || null;
  const inventorySummary =
    feasibility?.inventorySummary || reviewDetails?.inventorySummary || null;
  const templates = Array.isArray(feasibility?.templates)
    ? feasibility.templates
    : Array.isArray(reviewDetails?.templates)
      ? reviewDetails.templates
      : [];
  const lowStockWarnings = Array.isArray(feasibility?.lowStockWarnings)
    ? feasibility.lowStockWarnings
    : [];

  const topTotals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        const requested = Number(row?.totals?.requestedFoodPacks || 0);
        const released = Number(row?.fulfillment?.releasedFoodPacks || 0);
        const received = getEffectiveReceivedFoodPacks(row);
        const remaining = Math.max(0, requested - Math.max(released, received));

        acc.requests += 1;
        acc.pending += normalize(row?.status) === 'pending' ? 1 : 0;
        acc.awaitingRelease += normalize(row?.status) === 'approved' ? 1 : 0;
        acc.partial += normalize(row?.status) === 'partially_released' ? 1 : 0;
        acc.shortage += remaining > 0 ? 1 : 0;
        return acc;
      },
      {
        requests: 0,
        pending: 0,
        awaitingRelease: 0,
        partial: 0,
        shortage: 0
      }
    );
  }, [filteredRows]);

  const displayedRequested = Number(displayedRequest?.totals?.requestedFoodPacks || 0);
  const displayedReleased = Number(displayedRequest?.fulfillment?.releasedFoodPacks || 0);
  const displayedReceived = getEffectiveReceivedFoodPacks(displayedRequest);
  const displayedRemaining = Math.max(
    0,
    displayedRequested - Math.max(displayedReleased, displayedReceived)
  );

  const selectedIndividuals = displayedRequest ? getRequestIndividuals(displayedRequest) : 0;
  const selectedVulnerable = displayedRequest ? getVulnerableCount(displayedRequest) : 0;
  const selectedSubmittedAt =
    displayedRequest?.submittedAt ||
    displayedRequest?.createdAt ||
    displayedRequest?.requestDate ||
    null;

  const releaseProgress = displayedRequest?.fulfillment || {
    totalReleases: 0,
    releasedFoodPacks: 0,
    receivedReleases: 0,
    pendingReleases: 0,
    lastReleaseAt: null
  };

  const templateCount = templates.length;
  const lowStockCount = lowStockWarnings.length;
  const totalStockUnits = Number(inventorySummary?.totalStockUnits || 0);
  const totalGoodsEntries = Number(inventorySummary?.totalGoodsEntries || 0);

  const openReleasePlanner = (request) => {
    if (!request?._id) return;

    navigate(INVENTORY_RELEASE_ROUTE, {
      state: {
        openReleasePlanner: true,
        selectedReliefRequestId: request._id,
        selectedReliefRequest: request
      }
    });
  };

  const handleReject = async (requestId) => {
    try {
      setSubmittingAction(true);

      const res = await fetch(`${BASE_URL}/api/drrmo/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'reject',
          remarks: 'Rejected by DRRMO'
        })
      });
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

      const data = await res.json();

      if (!res.ok) {
<<<<<<< HEAD
        throw new Error(data.message || 'Failed to update request');
      }

      alert(
        action === 'accept'
          ? 'Request approved successfully.'
          : 'Request rejected successfully.'
      );

      setSelectedRequest(null);
      setPdfPreviewUrl('');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert(err.message);
=======
        throw new Error(data.message || 'Failed to reject request');
      }

      setPdfPreviewUrl('');
      setReviewDetails(null);
      setFeasibility(null);
      await fetchQueue();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to reject request.');
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
    } finally {
      setSubmittingAction(false);
    }
  };

<<<<<<< HEAD
  const getTotalIndividuals = (request) => {
    const totals = request?.totals || {};
    return (
      Number(totals.male || 0) +
      Number(totals.female || 0) +
      Number(totals.lgbtq || 0) +
      Number(totals.pwd || 0) +
      Number(totals.pregnant || 0) +
      Number(totals.senior || 0)
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString();
    } catch {
      return '-';
    }
  };

  const getPdfPath = (request) => {
    if (request?.pdfFile) return request.pdfFile;
    if (request?.requestNo) {
      return `/uploads/relief-requests/${request.requestNo}.pdf`;
    }
    return '';
=======
  const handleApprove = async (request) => {
    try {
      setSubmittingAction(true);

      const res = await fetch(`${BASE_URL}/api/drrmo/requests/${request._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'accept',
          remarks: 'Approved by DRRMO'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to approve request');
      }

      await fetchQueue();

      navigate(INVENTORY_RELEASE_ROUTE, {
        state: {
          openReleasePlanner: true,
          selectedReliefRequestId: request._id,
          selectedReliefRequest: data?.request || request
        }
      });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to approve request.');
    } finally {
      setSubmittingAction(false);
    }
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  };

  const openPdfInNewTab = (pdfPath) => {
    if (!pdfPath) {
      alert('No PDF file available for this request yet.');
      return;
    }

    window.open(`${BASE_URL}${pdfPath}`, '_blank', 'noopener,noreferrer');
  };

  const previewPdfInModal = (pdfPath) => {
    if (!pdfPath) {
      alert('No PDF file available for this request yet.');
      return;
    }

    setPdfPreviewUrl(`${BASE_URL}${pdfPath}`);
  };

  const closePdfPreview = () => {
    setPdfPreviewUrl('');
  };

<<<<<<< HEAD
  const totalFoodPacks = filteredRows.reduce(
    (sum, row) => sum + Number(row?.totals?.requestedFoodPacks || 0),
    0
  );

  const avgFoodPacks = filteredRows.length
    ? Math.round(totalFoodPacks / filteredRows.length)
    : 0;

  const selectedIndividuals = selectedRequest
    ? getTotalIndividuals(selectedRequest)
    : 0;

  return (
    <DashboardShell>
      <div className="rrl-page">
        <div className="rrl-shell">
          <div className="rrl-header-card">
            <div>
              <span className="rrl-kicker">DRRMO Review Module</span>
              <h1 className="rrl-title">Pending Relief Requests</h1>
              <p className="rrl-subtitle">
                Review, validate, and approve barangay-submitted evacuation-based
                relief requests before release processing.
              </p>
            </div>

            <div className="rrl-header-actions">
              <button
                className="rrl-btn rrl-btn-secondary"
                onClick={() => navigate('/drrmo/dashboard')}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          <div className="rrl-top-grid">
            <section className="rrl-card">
              <div className="rrl-card-head">
                <h2>Request Queue</h2>
                <p>
                  Search pending requests, inspect submitted request sheets, and
                  validate them for release processing.
                </p>
              </div>

              <div className="rrl-search-row">
                <input
                  className="rrl-search"
                  type="text"
                  placeholder="Search by request no., barangay, disaster..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="rrl-table-wrapper">
                <table className="rrl-table">
                  <thead>
                    <tr>
                      <th>Request No.</th>
                      <th>Barangay</th>
                      <th>Disaster</th>
                      <th>Date</th>
                      <th>Centers</th>
                      <th>Food Packs</th>
                      <th>Status</th>
                      <th>Review</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="rrl-empty-cell">
                          Loading pending requests...
                        </td>
                      </tr>
                    ) : filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="rrl-empty-cell">
                          No pending requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
                        <tr key={row._id}>
                          <td>{row.requestNo || '-'}</td>
                          <td>{row.barangayName || '-'}</td>
                          <td>{row.disaster || '-'}</td>
                          <td>{formatDate(row.requestDate)}</td>
                          <td>{row.rows?.length || 0}</td>
                          <td>{row.totals?.requestedFoodPacks || 0}</td>
                          <td>
                            <span className="rrl-status-pill">
                              {row.status || 'pending'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="rrl-btn rrl-btn-outline rrl-btn-sm"
                              onClick={() => {
                                setSelectedRequest(row);
                                setPdfPreviewUrl('');
                              }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="rrl-card rrl-summary-card">
              <div className="rrl-card-head">
                <h2>Queue Summary</h2>
                <p>Quick operational overview of the current pending queue.</p>
              </div>

              <div className="rrl-summary-list">
                <div className="rrl-summary-item">
                  <span>Total Pending Requests</span>
                  <strong>{rows.length}</strong>
                </div>
                <div className="rrl-summary-item">
                  <span>Filtered Results</span>
                  <strong>{filteredRows.length}</strong>
                </div>
                <div className="rrl-summary-item">
                  <span>Average Food Packs</span>
                  <strong>{avgFoodPacks}</strong>
                </div>
                <div className="rrl-summary-item emphasis">
                  <span>Total Requested Food Packs</span>
                  <strong>{totalFoodPacks}</strong>
                </div>
              </div>
            </aside>
          </div>

          {selectedRequest && (
            <section className="rrl-card rrl-details-card">
              <div className="rrl-card-head rrl-details-head">
                <div>
                  <h2>Request Review Details</h2>
                  <p>
                    Inspect the request sheet carefully before approving or rejecting
                    the submission.
                  </p>
                </div>

                <button
                  className="rrl-btn rrl-btn-secondary"
                  onClick={() => {
                    setSelectedRequest(null);
                    setPdfPreviewUrl('');
                  }}
=======
  const selectedTone = getFlowTone(displayedRequest);

  const canApprove = normalize(displayedRequest?.status) === 'pending';
  const canOpenPlanner =
    normalize(displayedRequest?.status) === 'approved' ||
    normalize(displayedRequest?.status) === 'partially_released';
  const canReject =
    normalize(displayedRequest?.status) === 'pending' ||
    normalize(displayedRequest?.status) === 'approved';

  return (
  <DashboardShell>
    <div className="rrl-page">
      <div className="rrl-shell">
        <section className="rrl-header-card">
          <div className="rrl-header-main">
            <span className="rrl-kicker">DRRMO Operations</span>
            <h1 className="rrl-header-title">Relief Request Review</h1>
          </div>

          <div className="rrl-header-side">
            <div className="rrl-header-status-guide">
              <div className="rrl-status-guide-item">
                <span className="rrl-status-guide-dot pending" />
                <strong>Pending Review</strong>
              </div>
              <div className="rrl-status-guide-item">
                <span className="rrl-status-guide-dot approved" />
                <strong>Awaiting Release</strong>
              </div>
              <div className="rrl-status-guide-item">
                <span className="rrl-status-guide-dot released" />
                <strong>Awaiting Receipt</strong>
              </div>
              <div className="rrl-status-guide-item">
                <span className="rrl-status-guide-dot partial" />
                <strong>Partial</strong>
              </div>
            </div>
          </div>  
        </section>

          <section className="rrl-totals-row rrl-totals-row-compact">
            <div className="rrl-total-card">
              <span>In Queue</span>
              <strong>{topTotals.requests}</strong>
            </div>
            <div className="rrl-total-card pending">
              <span>Pending Review</span>
              <strong>{topTotals.pending}</strong>
            </div>
            <div className="rrl-total-card warning">
              <span>Awaiting Release</span>
              <strong>{topTotals.awaitingRelease}</strong>
            </div>
            <div className="rrl-total-card success">
              <span>Partially Released</span>
              <strong>{topTotals.partial}</strong>
            </div>
            <div className="rrl-total-card danger">
              <span>With Remaining Balance</span>
              <strong>{topTotals.shortage}</strong>
            </div>
          </section>

          <section className="rrl-board rrl-board-tight">
            <div className="rrl-board-left">
  <section className="rrl-card rrl-queue-card">
    <div className="rrl-toolbar">
      <div className="rrl-toolbar-top">
        <div className="rrl-toolbar-title">
          <h2>{getQueueHeading()}</h2>
        </div>
      </div>

      <div className="rrl-toolbar-filters">
        <button
          type="button"
          className={`rrl-filter-chip ${queueFilter === 'active' ? 'active' : ''}`}
          onClick={() => setQueueFilter('active')}
        >
          Active
        </button>
        <button
          type="button"
          className={`rrl-filter-chip ${queueFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setQueueFilter('pending')}
        >
          Pending Review
        </button>
        <button
          type="button"
          className={`rrl-filter-chip ${queueFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setQueueFilter('approved')}
        >
          Awaiting Release
        </button>
        <button
          type="button"
          className={`rrl-filter-chip ${queueFilter === 'partial' ? 'active' : ''}`}
          onClick={() => setQueueFilter('partial')}
        >
          Partial
        </button>
        <button
          type="button"
          className={`rrl-filter-chip ${queueFilter === 'released' ? 'active' : ''}`}
          onClick={() => setQueueFilter('released')}
        >
          Awaiting Receipt
        </button>
      </div>

      <div className="rrl-toolbar-controls rrl-toolbar-controls-single">
        <div className="rrl-control">
          <select
            className="rrl-select"
            value={barangayFilter}
            onChange={(e) => setBarangayFilter(e.target.value)}
          >
            <option value="">All barangays</option>
            {barangayOptions.map((barangay) => (
              <option key={barangay} value={barangay}>
                {barangay}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    <div className="rrl-queue-list-wrap">
      <div className="rrl-queue-list">
        {loadingQueue ? (
          <div className="rrl-empty-state">Loading request queue...</div>
        ) : filteredRows.length === 0 ? (
          <div className="rrl-empty-state">No requests found.</div>
        ) : (
          filteredRows.map((row) => {
            const isActive = selectedRequest?._id === row._id;
            const submittedAt =
              row?.submittedAt || row?.createdAt || row?.requestDate || null;
            const requested = Number(row?.totals?.requestedFoodPacks || 0);
            const released = Number(row?.fulfillment?.releasedFoodPacks || 0);
            const received = getEffectiveReceivedFoodPacks(row);
            const tone = getFlowTone(row);

            return (
              <button
                type="button"
                key={row._id}
                className={`rrl-queue-item ${isActive ? 'active' : ''} rrl-queue-${tone}`}
                onClick={() => {
                  setSelectedRequest(row);
                  setPdfPreviewUrl('');
                }}
              >
                <div className="rrl-queue-top">
                  <div className="rrl-queue-main">
                    <div className="rrl-queue-barangay">
                      {row.barangayName || '-'}
                    </div>
                    <div className="rrl-queue-disaster">
                      {row.disaster || '-'}
                    </div>
                    <div className="rrl-queue-requestno">
                      {row.requestNo || '-'}
                    </div>
                  </div>
                </div>

                <div className="rrl-queue-middle rrl-queue-middle-fulfillment">
                  <div className="rrl-queue-metric">
                    <span>Requested</span>
                    <strong>{requested}</strong>
                  </div>
                  <div className="rrl-queue-metric">
                    <span>Released</span>
                    <strong>{released}</strong>
                  </div>
                  <div className="rrl-queue-metric">
                    <span>Received</span>
                    <strong>{received}</strong>
                  </div>
                </div>

                <div className="rrl-queue-bottom">
                  <div className="rrl-queue-inline-meta">
                    <span>{row?.rows?.length || 0} center(s)</span>
                    <span>{getRequestIndividuals(row)} people</span>
                  </div>

                  <div className="rrl-queue-datetime">
                    <strong>{formatDate(submittedAt)}</strong>
                    <span>{formatTime(submittedAt)}</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  </section>
</div>

            <div className="rrl-board-right">
  {!displayedRequest ? (
    <section className="rrl-card rrl-placeholder-card">
      <div className="rrl-placeholder-inner">
        <h2>No selected request</h2>
      </div>
    </section>
  ) : (
    <section className="rrl-card rrl-details-card rrl-details-card-compact">
  <div className="rrl-details-head rrl-details-head-compact">
    <div className="rrl-details-heading">
      <div className="rrl-details-barangay">
        {displayedRequest.barangayName || '-'}
      </div>
      <div className="rrl-details-disaster">
        {displayedRequest.disaster || '-'}
      </div>
      <div className="rrl-details-requestno">
        {displayedRequest.requestNo || '-'}
      </div>
    </div>

    <div className={`rrl-status-banner rrl-status-banner-${selectedTone}`}>
      {formatStatusLabel(displayedRequest.status)}
    </div>
  </div>

  <div className="rrl-meta-strip">
    <div className="rrl-meta-chip">
      <span>Request Date</span>
      <strong>{formatDate(displayedRequest.requestDate)}</strong>
    </div>
    <div className="rrl-meta-chip">
      <span>Submitted</span>
      <strong>{formatDateTime(selectedSubmittedAt)}</strong>
    </div>
    <div className="rrl-meta-chip">
      <span>People</span>
      <strong>{selectedIndividuals}</strong>
    </div>
    <div className="rrl-meta-chip">
      <span>Centers</span>
      <strong>{displayedRequest?.rows?.length || 0}</strong>
    </div>
  </div>

  <div className="rrl-balance-strip">
    <div className="rrl-balance-chip">
      <span>Requested</span>
      <strong>{displayedRequested}</strong>
    </div>
    <div className="rrl-balance-chip">
      <span>Released</span>
      <strong>{displayedReleased}</strong>
    </div>
    <div className="rrl-balance-chip">
      <span>Received</span>
      <strong>{displayedReceived}</strong>
    </div>
  </div>

  <div className="rrl-review-layout-focused">
    <div className="rrl-review-main">
      <div className="rrl-panel">
        <div className="rrl-section-head">
          <h3>Evacuation Rows</h3>
        </div>

        <div className="rrl-table-wrapper">
          <table className="rrl-table rrl-detail-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Evacuation Center</th>
                <th>Households</th>
                <th>Families</th>
                <th>Male</th>
                <th>Female</th>
                <th>LGBTQ</th>
                <th>PWD</th>
                <th>Pregnant</th>
                <th>Senior</th>
                <th>Food Packs</th>
              </tr>
            </thead>
            <tbody>
              {(displayedRequest.rows || []).length === 0 ? (
                <tr>
                  <td colSpan="11" className="rrl-empty-cell">
                    No evacuation rows found.
                  </td>
                </tr>
              ) : (
                (displayedRequest.rows || []).map((row, index) => (
                  <tr key={`${row.evacuationCenterName}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{row.evacuationCenterName || '-'}</td>
                    <td>{row.households || 0}</td>
                    <td>{row.families || 0}</td>
                    <td>{row.male || 0}</td>
                    <td>{row.female || 0}</td>
                    <td>{row.lgbtq || 0}</td>
                    <td>{row.pwd || 0}</td>
                    <td>{row.pregnant || 0}</td>
                    <td>{row.senior || 0}</td>
                    <td>{row.requestedFoodPacks || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="rrl-total-label">
                  Total
                </td>
                <td>{displayedRequest?.totals?.households || 0}</td>
                <td>{displayedRequest?.totals?.families || 0}</td>
                <td>{displayedRequest?.totals?.male || 0}</td>
                <td>{displayedRequest?.totals?.female || 0}</td>
                <td>{displayedRequest?.totals?.lgbtq || 0}</td>
                <td>{displayedRequest?.totals?.pwd || 0}</td>
                <td>{displayedRequest?.totals?.pregnant || 0}</td>
                <td>{displayedRequest?.totals?.senior || 0}</td>
                <td>{displayedRequest?.totals?.requestedFoodPacks || 0}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="rrl-panel rrl-remarks-panel">
        <div className="rrl-section-head">
          <h3>Remarks</h3>
        </div>
        <div className="rrl-remarks-box">
          <p>{displayedRequest?.remarks || 'No remarks provided.'}</p>
        </div>
      </div>
    </div>

    <div className="rrl-review-side">
      <div className="rrl-panel rrl-decision-panel">
        <div className="rrl-section-head">
          <h3>Decision Panel</h3>
        </div>

        <div className="rrl-readiness-compact">
          <div className="rrl-readiness-compact-row">
            <span>Stock Units</span>
            <strong>{totalStockUnits}</strong>
          </div>
          <div className="rrl-readiness-compact-row">
            <span>Templates</span>
            <strong>{templateCount}</strong>
          </div>
          <div className={`rrl-readiness-compact-row ${lowStockCount > 0 ? 'warn' : ''}`}>
            <span>Low Stock</span>
            <strong>{lowStockCount}</strong>
          </div>
        </div>

        <div className="rrl-decision-actions">
          {canReject ? (
            <button
              type="button"
              className="rrl-btn rrl-btn-danger"
              disabled={submittingAction}
              onClick={() => handleReject(displayedRequest._id)}
            >
              Reject
            </button>
          ) : null}

          {canApprove ? (
            <button
              type="button"
              className="rrl-btn rrl-btn-approve"
              disabled={submittingAction}
              onClick={() => handleApprove(displayedRequest)}
            >
              Approve
            </button>
          ) : null}

          {canOpenPlanner ? (
            <button
              type="button"
              className="rrl-btn rrl-btn-primary"
              disabled={submittingAction}
              onClick={() => openReleasePlanner(displayedRequest)}
            >
              Open Release Planner
            </button>
          ) : null}
        </div>

        <div className="rrl-pdf-inline">
  <button
    type="button"
    className="rrl-btn rrl-btn-secondary"
    onClick={() => previewPdfInModal(getPdfPath(displayedRequest))}
  >
    Preview PDF
  </button>

  <button
    type="button"
    className="rrl-btn rrl-btn-secondary"
    onClick={() => openPdfInNewTab(getPdfPath(displayedRequest))}
  >
    Open PDF
  </button>

  <a
    className="rrl-btn rrl-btn-secondary"
    href={`${BASE_URL}${getPdfPath(displayedRequest)}`}
    target="_blank"
    rel="noreferrer"
    download
  >
    Download PDF
  </a>
</div>
      </div>
    </div>
  </div>
</section>
  )}
</div>
          </section>
        </div>

        {pdfPreviewUrl ? (
          <div className="rrl-pdf-modal-overlay" onClick={closePdfPreview}>
            <div className="rrl-pdf-modal" onClick={(e) => e.stopPropagation()}>
              <div className="rrl-pdf-modal-header">
                <div>
                  <h3>Relief Request PDF</h3>
                </div>

                <button
                  type="button"
                  className="rrl-btn rrl-btn-secondary"
                  onClick={closePdfPreview}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
                >
                  Close
                </button>
              </div>

<<<<<<< HEAD
              <div className="rrl-info-grid">
                <div className="rrl-info-box">
                  <span>Request No.</span>
                  <strong>{selectedRequest.requestNo || '-'}</strong>
                </div>
                <div className="rrl-info-box">
                  <span>Barangay</span>
                  <strong>{selectedRequest.barangayName || '-'}</strong>
                </div>
                <div className="rrl-info-box">
                  <span>Disaster</span>
                  <strong>{selectedRequest.disaster || '-'}</strong>
                </div>
                <div className="rrl-info-box">
                  <span>Date Submitted</span>
                  <strong>{formatDateTime(selectedRequest.requestDate)}</strong>
                </div>
              </div>

              <div className="rrl-pdf-toolbar">
                <div className="rrl-pdf-copy">
                  <h3>Request PDF</h3>
                  <p>
                    Open the generated PDF copy of this relief request for review,
                    printing, or download.
                  </p>
                </div>

                <div className="rrl-pdf-actions">
                  <button
                    type="button"
                    className="rrl-btn rrl-btn-outline"
                    onClick={() => previewPdfInModal(getPdfPath(selectedRequest))}
                    disabled={!getPdfPath(selectedRequest)}
                  >
                    Preview PDF
                  </button>

                  {getPdfPath(selectedRequest) ? (
                    <a
                      className="rrl-btn rrl-btn-primary"
                      href={`${BASE_URL}${getPdfPath(selectedRequest)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      Download PDF
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="rrl-btn rrl-btn-secondary"
                      disabled
                    >
                      No PDF Yet
                    </button>
                  )}

                  <button
                    type="button"
                    className="rrl-btn rrl-btn-secondary"
                    onClick={() => openPdfInNewTab(getPdfPath(selectedRequest))}
                    disabled={!getPdfPath(selectedRequest)}
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>

              <div className="rrl-review-layout">
                <div className="rrl-review-main">
                  <div className="rrl-subhead">
                    <h3>Evacuation Request Table</h3>
                    <p>Submitted evacuation center details and requested food packs.</p>
                  </div>

                  <div className="rrl-table-wrapper">
                    <table className="rrl-table rrl-detail-table">
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>Evacuation Center</th>
                          <th>Households</th>
                          <th>Families</th>
                          <th>Male</th>
                          <th>Female</th>
                          <th>LGBTQ</th>
                          <th>PWD</th>
                          <th>Pregnant</th>
                          <th>Senior</th>
                          <th>Food Packs</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(selectedRequest.rows || []).map((row, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{row.evacuationCenterName || '-'}</td>
                            <td>{row.households || 0}</td>
                            <td>{row.families || 0}</td>
                            <td>{row.male || 0}</td>
                            <td>{row.female || 0}</td>
                            <td>{row.lgbtq || 0}</td>
                            <td>{row.pwd || 0}</td>
                            <td>{row.pregnant || 0}</td>
                            <td>{row.senior || 0}</td>
                            <td>{row.requestedFoodPacks || 0}</td>
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr>
                          <td colSpan="2" className="rrl-total-label">
                            TOTAL
                          </td>
                          <td>{selectedRequest.totals?.households || 0}</td>
                          <td>{selectedRequest.totals?.families || 0}</td>
                          <td>{selectedRequest.totals?.male || 0}</td>
                          <td>{selectedRequest.totals?.female || 0}</td>
                          <td>{selectedRequest.totals?.lgbtq || 0}</td>
                          <td>{selectedRequest.totals?.pwd || 0}</td>
                          <td>{selectedRequest.totals?.pregnant || 0}</td>
                          <td>{selectedRequest.totals?.senior || 0}</td>
                          <td>{selectedRequest.totals?.requestedFoodPacks || 0}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <aside className="rrl-review-side">
                  <div className="rrl-subhead">
                    <h3>Validation Summary</h3>
                    <p>Use this summary to help decide whether to approve the request.</p>
                  </div>

                  <div className="rrl-summary-list">
                    <div className="rrl-summary-item">
                      <span>Evacuation Centers</span>
                      <strong>{selectedRequest.rows?.length || 0}</strong>
                    </div>
                    <div className="rrl-summary-item">
                      <span>Total Households</span>
                      <strong>{selectedRequest.totals?.households || 0}</strong>
                    </div>
                    <div className="rrl-summary-item">
                      <span>Total Families</span>
                      <strong>{selectedRequest.totals?.families || 0}</strong>
                    </div>
                    <div className="rrl-summary-item">
                      <span>Total Individuals</span>
                      <strong>{selectedIndividuals}</strong>
                    </div>
                    <div className="rrl-summary-item emphasis">
                      <span>Requested Food Packs</span>
                      <strong>{selectedRequest.totals?.requestedFoodPacks || 0}</strong>
                    </div>
                  </div>

                  <div className="rrl-remarks-box">
                    <span>Remarks</span>
                    <p>{selectedRequest.remarks?.trim() || 'No remarks provided.'}</p>
                  </div>

                  <div className="rrl-action-card">
                    <div className="rrl-action-copy">
                      <h4>Decision Actions</h4>
                      <p>
                        Approve if the submitted figures are valid and ready for release
                        planning. Reject if the request needs correction or cannot be
                        processed yet.
                      </p>
                    </div>

                    <div className="rrl-actions rrl-actions-stacked">
                      <button
                        className="rrl-btn rrl-btn-danger"
                        disabled={submittingAction}
                        onClick={() =>
                          handleAction(selectedRequest._id, 'reject', 'Rejected by DRRMO')
                        }
                      >
                        {submittingAction ? 'Processing...' : 'Reject'}
                      </button>

                      <button
                        className="rrl-btn rrl-btn-primary"
                        disabled={submittingAction}
                        onClick={() =>
                          handleAction(selectedRequest._id, 'accept', 'Approved by DRRMO')
                        }
                      >
                        {submittingAction ? 'Processing...' : 'Approve Request'}
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </section>
          )}
        </div>
      </div>

      {pdfPreviewUrl && (
        <div className="rrl-pdf-modal-overlay" onClick={closePdfPreview}>
          <div
            className="rrl-pdf-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rrl-pdf-modal-header">
              <div>
                <h3>Relief Request PDF Preview</h3>
                <p>Review the generated request form before taking action.</p>
              </div>

              <button
                type="button"
                className="rrl-btn rrl-btn-secondary"
                onClick={closePdfPreview}
              >
                Close
              </button>
            </div>

            <iframe
              src={pdfPreviewUrl}
              title="Relief Request PDF Preview"
              className="rrl-pdf-iframe"
            />
          </div>
        </div>
      )}
=======
              <iframe
                title="Relief Request PDF Preview"
                src={pdfPreviewUrl}
                className="rrl-pdf-frame"
              />
            </div>
          </div>
        ) : null}
      </div>
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
    </DashboardShell>
  );
}