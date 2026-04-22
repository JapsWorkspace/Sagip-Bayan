<<<<<<< HEAD

// src/components/relief/ReliefRequestForm.js

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../layout/DashboardShell';

=======
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import DashboardShell from '../layout/DashboardShell';
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import '../css/ReliefRequestForm.css';

const BASE_URL =
  process.env.REACT_APP_API_URL || 'https://gaganadapat.onrender.com';

<<<<<<< HEAD
const createEmptyRow = () => ({
  evacPlaceId: '',
  evacuationCenterName: '',
  households: 0,
  families: 0,
  male: 0,
  female: 0,
  lgbtq: 0,
  pwd: 0,
  pregnant: 0,
  senior: 0,
  requestedFoodPacks: 0
});

=======
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
const numberFields = [
  'households',
  'families',
  'male',
  'female',
  'lgbtq',
  'pwd',
  'pregnant',
  'senior',
  'requestedFoodPacks'
];

<<<<<<< HEAD
const sanitizeText = (value) => String(value || '').trim();
=======
const STAGE_STEPS = [
  { key: 'prepare', label: 'Prepare' },
  { key: 'review', label: 'Under Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'to_receive', label: 'To Receive' },
  { key: 'received', label: 'Received' }
];

const IMPORT_HEADER_ALIASES = {
  evacuationCenterName: [
    'evacuationcentername',
    'evacuation center name',
    'evacuation center',
    'evacuationcenter',
    'centername',
    'center name',
    'evacuation site',
    'evacuationsite',
    'evac name',
    'name'
  ],
  households: ['households', 'household'],
  families: ['families', 'family'],
  male: ['male', 'males'],
  female: ['female', 'females'],
  lgbtq: ['lgbtq', 'lgbt', 'lgbtqia', 'lgbtqia+'],
  pwd: ['pwd', 'pwds', 'personswithdisability', 'personwithdisability'],
  pregnant: ['pregnant', 'pregnantwomen', 'pregnant woman', 'pregnant women'],
  senior: ['senior', 'seniors', 'seniorcitizen', 'senior citizen', 'seniorcitizens'],
  requestedFoodPacks: [
    'requestedfoodpacks',
    'requested food packs',
    'foodpacks',
    'food packs',
    'requestedpacks',
    'packsrequested',
    'packs'
  ],
  rowRemarks: ['rowremarks', 'row remarks', 'remarks', 'notes', 'comment', 'comments']
};

const createPreparedRow = (row = {}) => ({
  evacPlaceId: row.evacPlaceId || row._id || '',
  evacuationCenterName: String(row.evacuationCenterName || row.name || '').trim(),
  households: Number(row.households || 0),
  families: Number(row.families || 0),
  male: Number(row.male || 0),
  female: Number(row.female || 0),
  lgbtq: Number(row.lgbtq || 0),
  pwd: Number(row.pwd || 0),
  pregnant: Number(row.pregnant || 0),
  senior: Number(row.senior || 0),
  requestedFoodPacks: Number(row.requestedFoodPacks || 0),
  isActiveRow: row.isActiveRow !== undefined ? Boolean(row.isActiveRow) : true,
  rowRemarks: String(row.rowRemarks || '').trim()
});

const buildRowsFromRequest = (request) => {
  const sourceRows = Array.isArray(request?.rows) ? request.rows : [];
  return sourceRows.map((row) => createPreparedRow(row));
};

const buildRowsFromEvacs = (evacs = []) =>
  evacs.map((place) =>
    createPreparedRow({
      evacPlaceId: place._id,
      evacuationCenterName: place.name,
      households: 0,
      families: 0,
      male: 0,
      female: 0,
      lgbtq: 0,
      pwd: 0,
      pregnant: 0,
      senior: 0,
      requestedFoodPacks: 0,
      isActiveRow: true,
      rowRemarks: ''
    })
  );

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '-';
  }
};

const formatDateTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
};

const normalizeStage = (stage) => String(stage || '').toLowerCase();

const normalizeValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const getStageMeta = (stage) => {
  switch (normalizeStage(stage)) {
    case 'pending_review':
      return { label: 'Under Review', tone: 'pending', activeStep: 2, completedSteps: 1 };
    case 'approved_waiting_release':
      return { label: 'Approved', tone: 'approved', activeStep: 3, completedSteps: 2 };
    case 'partially_released':
      return { label: 'To Be Received', tone: 'released', activeStep: 4, completedSteps: 3 };
    case 'released_waiting_receipt':
      return { label: 'To Be Received', tone: 'released', activeStep: 4, completedSteps: 3 };
    case 'completed':
      return { label: 'Received', tone: 'completed', activeStep: 5, completedSteps: 4 };
    case 'rejected':
      return { label: 'Rejected', tone: 'rejected', activeStep: 2, completedSteps: 1 };
    case 'cancelled':
    case 'canceled':
    case 'preparation':
    default:
      return { label: 'Prepare Request', tone: 'draft', activeStep: 1, completedSteps: 0 };
  }
};

const parseSafeNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
};

const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');

const resolveHeaderKey = (rawHeader) => {
  const normalized = normalizeHeader(rawHeader);
  const entries = Object.entries(IMPORT_HEADER_ALIASES);

  for (const [field, aliases] of entries) {
    if (aliases.includes(normalized)) return field;
  }

  return '';
};

const buildImportSummaryText = (summary) => {
  if (!summary) return '';
  return `${summary.totalRows} row${summary.totalRows === 1 ? '' : 's'} imported • ${summary.matchedRows} matched • ${summary.unmatchedRows} unmatched`;
};

const serializeRowsForCompare = (rows = []) =>
  rows.map((row) => ({
    evacPlaceId: row.evacPlaceId || '',
    evacuationCenterName: String(row.evacuationCenterName || '').trim(),
    households: Number(row.households || 0),
    families: Number(row.families || 0),
    male: Number(row.male || 0),
    female: Number(row.female || 0),
    lgbtq: Number(row.lgbtq || 0),
    pwd: Number(row.pwd || 0),
    pregnant: Number(row.pregnant || 0),
    senior: Number(row.senior || 0),
    requestedFoodPacks: Number(row.requestedFoodPacks || 0),
    isActiveRow: Boolean(row.isActiveRow),
    rowRemarks: String(row.rowRemarks || '').trim()
  }));

const isJourneyResolved = (journeyData = {}) => {
  const normalizedStage = normalizeStage(journeyData?.stage);
  const normalizedStatus = normalizeStage(journeyData?.request?.status);

  const finalStates = [
    'completed',
    'received',
    'rejected',
    'cancelled',
    'canceled'
  ];

  return (
    Boolean(journeyData?.canRequestAgain) &&
    !Boolean(journeyData?.canEdit) &&
    !Boolean(journeyData?.canCancel) &&
    !Boolean(journeyData?.canReceiveAnyRelease) &&
    (finalStates.includes(normalizedStage) || finalStates.includes(normalizedStatus))
  );
};
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

export default function ReliefRequestForm() {
  const navigate = useNavigate();
  const location = useLocation();
<<<<<<< HEAD
=======
  const fileInputRef = useRef(null);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

  const editMode = location.state?.mode === 'edit';
  const editingRequest = location.state?.request || null;

  const [loadingPage, setLoadingPage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
<<<<<<< HEAD

  const [requestId, setRequestId] = useState('');
  const [requestNo, setRequestNo] = useState('Auto-generated upon submit');
  const [barangayId, setBarangayId] = useState('');
  const [barangayName, setBarangayName] = useState('');
=======
  const [refreshingJourney, setRefreshingJourney] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [barangayName, setBarangayName] = useState('');
  const [requestId, setRequestId] = useState('');
  const [requestNo, setRequestNo] = useState('Auto-generated');
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const [disaster, setDisaster] = useState('');
  const [requestDate, setRequestDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [remarks, setRemarks] = useState('');
<<<<<<< HEAD
  const [rows, setRows] = useState([createEmptyRow()]);
  const [evacPlaces, setEvacPlaces] = useState([]);

  useEffect(() => {
  const checkSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/barangays/me`, {
        credentials: 'include'
      });

      if (!res.ok) {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  };

  checkSession();
}, [navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        setLoadingPage(true);

        const [barangayRes, evacRes] = await Promise.all([
          fetch(`${BASE_URL}/api/barangays/me`, {
            credentials: 'include'
          }),
          fetch(`${BASE_URL}/evacs`, {
            credentials: 'include'
          })
        ]);

        if (!barangayRes.ok) {
          throw new Error('Failed to load barangay information');
        }

        if (!evacRes.ok) {
          throw new Error('Failed to load evacuation places');
        }

        const barangayData = await barangayRes.json();
        const evacData = await evacRes.json();

        if (!mounted) return;

        setBarangayId(barangayData._id || '');
        setBarangayName(barangayData.barangayName || '');

        const normalizedEvacPlaces = Array.isArray(evacData)
          ? evacData.map((place) => ({
              _id: place._id || '',
              name: sanitizeText(place.name),
              location: sanitizeText(place.location),
              barangayId: place.barangayId || '',
              barangayName: sanitizeText(place.barangayName)
            }))
          : [];

        setEvacPlaces(normalizedEvacPlaces);

        if (editMode && editingRequest) {
          setRequestId(editingRequest._id || '');
          setRequestNo(editingRequest.requestNo || 'Auto-generated upon submit');
          setDisaster(editingRequest.disaster || '');
          setRequestDate(
            editingRequest.requestDate
              ? new Date(editingRequest.requestDate).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10)
          );
          setRemarks(editingRequest.remarks || '');
          setRows(
            Array.isArray(editingRequest.rows) && editingRequest.rows.length > 0
              ? editingRequest.rows.map((row) => ({
                  evacPlaceId: row.evacPlaceId || '',
                  evacuationCenterName: row.evacuationCenterName || '',
                  households: Number(row.households || 0),
                  families: Number(row.families || 0),
                  male: Number(row.male || 0),
                  female: Number(row.female || 0),
                  lgbtq: Number(row.lgbtq || 0),
                  pwd: Number(row.pwd || 0),
                  pregnant: Number(row.pregnant || 0),
                  senior: Number(row.senior || 0),
                  requestedFoodPacks: Number(row.requestedFoodPacks || 0)
                }))
              : [createEmptyRow()]
          );
        }
      } catch (err) {
        console.error(err);
        alert(err.message || 'Failed to load request form data.');
      } finally {
        if (mounted) setLoadingPage(false);
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, [editMode, editingRequest]);

  const evacPlaceOptions = useMemo(() => {
    return [...evacPlaces].sort((a, b) => a.name.localeCompare(b.name));
  }, [evacPlaces]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.households += Number(row.households) || 0;
        acc.families += Number(row.families) || 0;
        acc.male += Number(row.male) || 0;
        acc.female += Number(row.female) || 0;
        acc.lgbtq += Number(row.lgbtq) || 0;
        acc.pwd += Number(row.pwd) || 0;
        acc.pregnant += Number(row.pregnant) || 0;
        acc.senior += Number(row.senior) || 0;
        acc.requestedFoodPacks += Number(row.requestedFoodPacks) || 0;
=======
  const [rows, setRows] = useState([]);
  const [bootstrapRows, setBootstrapRows] = useState([]);

  const [journey, setJourney] = useState({
    request: null,
    releases: [],
    stage: 'preparation',
    canEdit: false,
    canCancel: false,
    canReceiveAnyRelease: false,
    canRequestAgain: false,
    summary: null
  });

  const [pageError, setPageError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showRequestTable, setShowRequestTable] = useState(false);

  const [formFeedback, setFormFeedback] = useState({
    type: '',
    message: ''
  });

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    action: ''
  });

  const [importingFile, setImportingFile] = useState(false);
  const [importInfo, setImportInfo] = useState({
    hasImported: false,
    fileName: '',
    summary: null,
    issues: [],
    source: 'manual'
  });

  const fetchLatestBootstrapRows = useCallback(async () => {
  const res = await fetch(`${BASE_URL}/api/relief-requests/bootstrap`, {
    credentials: 'include'
  });

  const data = res.ok ? await res.json() : null;

  if (!res.ok || !data) {
    throw new Error('Failed to refresh evacuation center rows.');
  }

  const freshRows = Array.isArray(data.rows)
    ? data.rows.map((row) => createPreparedRow(row))
    : [];

  setBootstrapRows(freshRows);
  return freshRows;
}, []);

  const loadJourneyData = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoadingPage(true);
          setPageError('');
        } else {
          setRefreshingJourney(true);
        }

        const sessionRes = await fetch(`${BASE_URL}/api/debug-session`, {
  credentials: 'include'
});

console.log('debug-session status:', sessionRes.status);

if (!sessionRes.ok) {
  console.log('Redirecting: debug-session not ok');
  navigate('/');
  return;
}

const sessionData = await sessionRes.json();
console.log('debug-session data:', sessionData);

const role = String(sessionData?.role || '').toLowerCase();
console.log('resolved role:', role);

if (role !== 'barangay') {
  console.log('Redirecting: role is not barangay');
  navigate('/');
  return;
}

const barangayRes = await fetch(`${BASE_URL}/api/barangays/me`, {
  credentials: 'include'
});

console.log('barangays/me status:', barangayRes.status);

        const barangayData = barangayRes.ok ? await barangayRes.json() : null;

        if (!barangayRes.ok || !barangayData) {
          throw new Error('Failed to load barangay information.');
        }

        setBarangayName(barangayData.barangayName || barangayData.name || '');

        const [bootstrapRes, journeyRes, evacsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/relief-requests/bootstrap`, {
            credentials: 'include'
          }),
          fetch(`${BASE_URL}/api/relief-requests/journey/current`, {
            credentials: 'include'
          }),
          fetch(`${BASE_URL}/evacs`, {
            credentials: 'include'
          })
        ]);

        const bootstrapData = bootstrapRes.ok ? await bootstrapRes.json() : null;
        const journeyData = journeyRes.ok ? await journeyRes.json() : null;
        const evacsData = evacsRes.ok ? await evacsRes.json() : [];

        if (!journeyRes.ok || !journeyData) {
          throw new Error('Failed to load request status.');
        }

        const bootstrapPrepared = Array.isArray(bootstrapData?.rows)
          ? bootstrapData.rows.map((row) => createPreparedRow(row))
          : [];

        const fallbackEvacs = Array.isArray(evacsData)
          ? evacsData
              .filter((place) => {
                const placeBarangayId = String(place.barangayId || '');
                const currentBarangayId = String(barangayData._id || '');
                const isVisible =
                  place.isRequestVisible === undefined
                    ? true
                    : Boolean(place.isRequestVisible);

                return (
                  !place.isArchived &&
                  isVisible &&
                  (!placeBarangayId ||
                    !currentBarangayId ||
                    placeBarangayId === currentBarangayId)
                );
              })
              .map((place) => ({
                _id: place._id,
                name: place.name
              }))
          : [];

        const resolvedBootstrapRows =
          bootstrapPrepared.length > 0
            ? bootstrapPrepared
            : buildRowsFromEvacs(fallbackEvacs);

        const shouldResetResolvedJourney = !editMode && isJourneyResolved(journeyData);

        const sanitizedJourney = shouldResetResolvedJourney
          ? {
              request: null,
              releases: [],
              stage: 'preparation',
              canEdit: false,
              canCancel: false,
              canReceiveAnyRelease: false,
              canRequestAgain: true,
              summary: null
            }
          : {
              request: journeyData.request || null,
              releases: Array.isArray(journeyData.releases) ? journeyData.releases : [],
              stage: journeyData.stage || 'preparation',
              canEdit: Boolean(journeyData.canEdit),
              canCancel: Boolean(journeyData.canCancel),
              canReceiveAnyRelease: Boolean(journeyData.canReceiveAnyRelease),
              canRequestAgain: Boolean(journeyData.canRequestAgain),
              summary: journeyData.summary || null
            };

        setBootstrapRows(resolvedBootstrapRows);
        setJourney(sanitizedJourney);

        if (editMode && editingRequest) {
          setRequestId(editingRequest._id || '');
          setRequestNo(editingRequest.requestNo || 'Auto-generated');
          setDisaster(editingRequest.disaster || '');
          setRequestDate(
            editingRequest.requestDate
              ? new Date(editingRequest.requestDate).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10)
          );
          setRemarks(editingRequest.remarks || '');
          setRows(buildRowsFromRequest(editingRequest));
          setShowEditor(true);
          setImportInfo({
            hasImported: editingRequest.entryMode === 'excel_import',
            fileName: '',
            summary: null,
            issues: [],
            source: editingRequest.entryMode === 'excel_import' ? 'excel_import' : 'manual'
          });
          return;
        }

        if (sanitizedJourney.request && sanitizedJourney.canEdit) {
          setRequestId(sanitizedJourney.request._id || '');
          setRequestNo(sanitizedJourney.request.requestNo || 'Auto-generated');
          setDisaster(sanitizedJourney.request.disaster || '');
          setRequestDate(
            sanitizedJourney.request.requestDate
              ? new Date(sanitizedJourney.request.requestDate).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10)
          );
          setRemarks(sanitizedJourney.request.remarks || '');
          setRows(buildRowsFromRequest(sanitizedJourney.request));
          setShowEditor(false);
          setImportInfo({
            hasImported: sanitizedJourney.request.entryMode === 'excel_import',
            fileName: '',
            summary: null,
            issues: [],
            source:
              sanitizedJourney.request.entryMode === 'excel_import' ? 'excel_import' : 'manual'
          });
          return;
        }

        setRequestId('');
        setRequestNo('Auto-generated');
        setDisaster('');
        setRequestDate(new Date().toISOString().slice(0, 10));
        setRemarks('');
        setRows(resolvedBootstrapRows);
        setShowEditor(false);
        setImportInfo({
          hasImported: false,
          fileName: '',
          summary: null,
          issues: [],
          source: 'manual'
        });
      } catch (err) {
        console.error(err);
        setPageError(err.message || 'Failed to load request page.');
      } finally {
        setLoadingPage(false);
        setRefreshingJourney(false);
      }
    },
    [editMode, editingRequest, navigate]
  );

  useEffect(() => {
    loadJourneyData();
  }, [loadJourneyData]);

  useEffect(() => {
    if (!journey.canEdit && !editMode) {
      setShowEditor(false);
    }
  }, [journey.canEdit, editMode]);

  const latestRequest = useMemo(() => journey.request || null, [journey.request]);

  const stageMeta = useMemo(() => {
    if (editMode || showEditor) return getStageMeta('preparation');
    if (!latestRequest) return getStageMeta('preparation');
    return getStageMeta(journey.stage);
  }, [editMode, showEditor, latestRequest, journey.stage]);

  const preparedRows = useMemo(() => rows.map((row) => createPreparedRow(row)), [rows]);

  const activeRows = useMemo(
    () => preparedRows.filter((row) => row.isActiveRow),
    [preparedRows]
  );

  const evacNameMap = useMemo(() => {
    const map = new Map();

    bootstrapRows.forEach((row) => {
      const normalizedName = normalizeValue(row.evacuationCenterName);
      if (normalizedName) {
        map.set(normalizedName, createPreparedRow(row));
      }
    });

    return map;
  }, [bootstrapRows]);

  const totals = useMemo(() => {
    return activeRows.reduce(
      (acc, row) => {
        acc.households += Number(row.households || 0);
        acc.families += Number(row.families || 0);
        acc.male += Number(row.male || 0);
        acc.female += Number(row.female || 0);
        acc.lgbtq += Number(row.lgbtq || 0);
        acc.pwd += Number(row.pwd || 0);
        acc.pregnant += Number(row.pregnant || 0);
        acc.senior += Number(row.senior || 0);
        acc.requestedFoodPacks += Number(row.requestedFoodPacks || 0);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
        return acc;
      },
      {
        households: 0,
        families: 0,
        male: 0,
        female: 0,
        lgbtq: 0,
        pwd: 0,
        pregnant: 0,
        senior: 0,
        requestedFoodPacks: 0
      }
    );
<<<<<<< HEAD
  }, [rows]);
=======
  }, [activeRows]);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

  const totalIndividuals = useMemo(() => {
    return (
      totals.male +
      totals.female +
      totals.lgbtq +
      totals.pwd +
      totals.pregnant +
      totals.senior
    );
  }, [totals]);

<<<<<<< HEAD
  const hasInvalidRows = useMemo(() => {
    if (!rows.length) return true;

    return rows.some((row) => {
      if (!row.evacuationCenterName.trim()) return true;
=======
  const vulnerableCount = useMemo(
    () => totals.pwd + totals.pregnant + totals.senior,
    [totals]
  );

  const hasInvalidRows = useMemo(() => {
    if (!preparedRows.length) return true;

    const enabledRows = preparedRows.filter((row) => row.isActiveRow);
    if (!enabledRows.length) return true;

    return enabledRows.some((row) => {
      if (!String(row.evacuationCenterName || '').trim()) return true;
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

      return numberFields.some((field) => {
        const value = Number(row[field]);
        return Number.isNaN(value) || value < 0;
      });
    });
<<<<<<< HEAD
  }, [rows]);

=======
  }, [preparedRows]);

  const baselineSource = useMemo(() => {
    if (editMode && editingRequest) {
      return {
        disaster: editingRequest.disaster || '',
        requestDate: editingRequest.requestDate
          ? new Date(editingRequest.requestDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        remarks: editingRequest.remarks || '',
        rows: buildRowsFromRequest(editingRequest)
      };
    }

    if (journey.request && journey.canEdit) {
      return {
        disaster: journey.request.disaster || '',
        requestDate: journey.request.requestDate
          ? new Date(journey.request.requestDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        remarks: journey.request.remarks || '',
        rows: buildRowsFromRequest(journey.request)
      };
    }

    return {
      disaster: '',
      requestDate: new Date().toISOString().slice(0, 10),
      remarks: '',
      rows: bootstrapRows.map((row) => createPreparedRow(row))
    };
  }, [editMode, editingRequest, journey.request, journey.canEdit, bootstrapRows]);

    const isDirty = useMemo(() => {
    const current = JSON.stringify({
      disaster: disaster.trim(),
      requestDate,
      remarks: remarks.trim(),
      rows: serializeRowsForCompare(preparedRows)
    });

    const baseline = JSON.stringify({
      disaster: String(baselineSource.disaster || '').trim(),
      requestDate: baselineSource.requestDate,
      remarks: String(baselineSource.remarks || '').trim(),
      rows: serializeRowsForCompare(baselineSource.rows || [])
    });

    return current !== baseline;
  }, [disaster, requestDate, remarks, preparedRows, baselineSource]);

  const isEditingExisting = Boolean(editMode || requestId);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const isSubmitDisabled =
    submitting ||
    loadingPage ||
    !barangayName.trim() ||
    !disaster.trim() ||
    !requestDate ||
<<<<<<< HEAD
    rows.length === 0 ||
    hasInvalidRows ||
    (editMode && !requestId);

  const handleEvacPlaceChange = (index, selectedId) => {
    const selectedPlace =
      evacPlaceOptions.find(
        (place) => String(place._id) === String(selectedId)
      ) || null;

    setRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              evacPlaceId: selectedPlace?._id || '',
              evacuationCenterName: selectedPlace?.name || ''
            }
          : row
      )
    );
  };

  const handleRowTextChange = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updated = { ...row, [field]: value };

        if (field === 'evacuationCenterName') {
          const matchedPlace =
            evacPlaceOptions.find(
              (place) =>
                sanitizeText(place.name).toLowerCase() ===
                sanitizeText(value).toLowerCase()
            ) || null;

          updated.evacPlaceId = matchedPlace?._id || '';
          updated.evacuationCenterName = value;
        }

        return updated;
      })
    );
=======
    !preparedRows.length ||
    hasInvalidRows ||
    (isEditingExisting && !isDirty);

  const requestStatusLabel = useMemo(() => {
    const normalizedStage = String(journey?.stage || '').trim().toLowerCase();
    const normalizedStatus = String(latestRequest?.status || '').trim().toLowerCase();

    if (
      normalizedStage === 'pending_review' ||
      normalizedStatus === 'pending' ||
      normalizedStatus === 'pending_review'
    ) {
      return 'Under Review';
    }

    if (
      normalizedStage === 'approved_waiting_release' ||
      normalizedStatus === 'approved'
    ) {
      return 'Approved';
    }

    if (
      normalizedStage === 'released_waiting_receipt' ||
      normalizedStage === 'partially_released'
    ) {
      return 'To Be Received';
    }

    if (
      normalizedStage === 'completed' ||
      normalizedStatus === 'received' ||
      normalizedStatus === 'completed'
    ) {
      return 'Received';
    }

    if (normalizedStage === 'rejected' || normalizedStatus === 'rejected') {
      return 'Rejected';
    }

    if (
      normalizedStage === 'cancelled' ||
      normalizedStage === 'canceled' ||
      normalizedStatus === 'cancelled' ||
      normalizedStatus === 'canceled'
    ) {
      return 'Prepare Request';
    }

    return stageMeta.label || 'Prepare Request';
  }, [journey?.stage, latestRequest?.status, stageMeta.label]);

  const receiptMeta = useMemo(() => {
    const receivedAt = journey.summary?.receivedAt || latestRequest?.receivedAt;
    const releasedPacks = Number(journey.summary?.releasedFoodPacks || 0);
    const receivedPacks = Number(journey.summary?.receivedFoodPacks || 0);
    const normalizedStage = String(journey?.stage || '').trim().toLowerCase();

    if (receivedAt) {
      return {
        label: 'Received Date',
        value: formatDateTime(receivedAt),
        tone: 'completed'
      };
    }

    if (
      normalizedStage === 'released_waiting_receipt' ||
      normalizedStage === 'partially_released' ||
      releasedPacks > receivedPacks
    ) {
      return {
        label: 'Receipt',
        value: 'Awaiting confirmation',
        tone: 'released'
      };
    }

    return {
      label: 'Receipt',
      value: 'Not yet released',
      tone: 'draft'
    };
  }, [
    journey?.stage,
    journey.summary?.receivedAt,
    journey.summary?.releasedFoodPacks,
    journey.summary?.receivedFoodPacks,
    latestRequest?.receivedAt
  ]);

  const canShowRequestAgainButton = useMemo(() => {
    if (journey.canRequestAgain) return true;
    if (!latestRequest) return true;

    const normalizedStatus = String(latestRequest?.status || '')
      .trim()
      .toLowerCase();

    const normalizedStage = String(journey?.stage || '')
      .trim()
      .toLowerCase();

    return [
      'completed',
      'received',
      'rejected',
      'cancelled',
      'canceled'
    ].includes(normalizedStatus) || [
      'completed',
      'received',
      'rejected',
      'cancelled',
      'canceled'
    ].includes(normalizedStage);
  }, [journey.canRequestAgain, journey.stage, latestRequest]);

  const clearFeedback = () => {
    setFormFeedback({ type: '', message: '' });
  };

  const setSuccessFeedback = (message) => {
    setFormFeedback({ type: 'success', message });
  };

  const setErrorFeedback = (message) => {
    setFormFeedback({ type: 'error', message });
  };

  const openConfirmation = ({ title, message, action }) => {
    setConfirmState({
      open: true,
      title,
      message,
      action
    });
  };

  const closeConfirmation = () => {
    setConfirmState({
      open: false,
      title: '',
      message: '',
      action: ''
    });
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  };

  const handleRowNumberChange = (index, field, value) => {
    const sanitized =
      value === '' ? '' : Math.max(0, Number.isNaN(Number(value)) ? 0 : Number(value));

    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: sanitized } : row))
    );
  };

<<<<<<< HEAD
  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (index) => {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    if (editMode && editingRequest) {
      setRequestId(editingRequest._id || '');
      setRequestNo(editingRequest.requestNo || 'Auto-generated upon submit');
      setDisaster(editingRequest.disaster || '');
      setRequestDate(
        editingRequest.requestDate
          ? new Date(editingRequest.requestDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
      setRemarks(editingRequest.remarks || '');
      setRows(
        Array.isArray(editingRequest.rows) && editingRequest.rows.length > 0
          ? editingRequest.rows.map((row) => ({
              evacPlaceId: row.evacPlaceId || '',
              evacuationCenterName: row.evacuationCenterName || '',
              households: Number(row.households || 0),
              families: Number(row.families || 0),
              male: Number(row.male || 0),
              female: Number(row.female || 0),
              lgbtq: Number(row.lgbtq || 0),
              pwd: Number(row.pwd || 0),
              pregnant: Number(row.pregnant || 0),
              senior: Number(row.senior || 0),
              requestedFoodPacks: Number(row.requestedFoodPacks || 0)
            }))
          : [createEmptyRow()]
      );
      return;
    }

    setRequestId('');
    setRequestNo('Auto-generated upon submit');
    setDisaster('');
    setRequestDate(new Date().toISOString().slice(0, 10));
    setRemarks('');
    setRows([createEmptyRow()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitDisabled) {
      alert('Please complete the required fields before submitting.');
=======
  const handleRowRemarksChange = (index, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, rowRemarks: value } : row))
    );
  };

  const handleToggleRow = (index) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const nextState = !row.isActiveRow;

        if (!nextState) {
          return {
            ...row,
            isActiveRow: false,
            households: 0,
            families: 0,
            male: 0,
            female: 0,
            lgbtq: 0,
            pwd: 0,
            pregnant: 0,
            senior: 0,
            requestedFoodPacks: 0,
            rowRemarks: ''
          };
        }

        return {
          ...row,
          isActiveRow: true
        };
      })
    );
  };

  const resetImportState = () => {
    setImportInfo({
      hasImported: false,
      fileName: '',
      summary: null,
      issues: [],
      source: 'manual'
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetForm = () => {
    clearFeedback();
    setDisaster(baselineSource.disaster || '');
    setRequestDate(baselineSource.requestDate);
    setRemarks(baselineSource.remarks || '');
    setRows((baselineSource.rows || []).map((row) => createPreparedRow(row)));
    resetImportState();
  };

  const buildPayload = () => ({
    disaster: disaster.trim(),
    requestDate,
    remarks: remarks.trim(),
    rows: preparedRows.map((row) => ({
      evacPlaceId: row.evacPlaceId || null,
      evacuationCenterName: row.evacuationCenterName.trim(),
      households: Number(row.households || 0),
      families: Number(row.families || 0),
      male: Number(row.male || 0),
      female: Number(row.female || 0),
      lgbtq: Number(row.lgbtq || 0),
      pwd: Number(row.pwd || 0),
      pregnant: Number(row.pregnant || 0),
      senior: Number(row.senior || 0),
      requestedFoodPacks: Number(row.requestedFoodPacks || 0),
      isActiveRow: Boolean(row.isActiveRow),
      rowRemarks: String(row.rowRemarks || '').trim()
    })),
    entryMode: importInfo.source === 'excel_import' ? 'excel_import' : 'manual',
    rowSource:
      importInfo.source === 'excel_import' ? 'manual_override' : 'evac_place_snapshot'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (isSubmitDisabled) {
      if (isEditingExisting && !isDirty) {
        setErrorFeedback('No changes to save.');
        return;
      }
      setErrorFeedback('Please complete the request before saving.');
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      return;
    }

    try {
      setSubmitting(true);

<<<<<<< HEAD
      const payload = {
        requestNo,
        barangayId,
        barangayName,
        disaster: disaster.trim(),
        requestDate,
        rows: rows.map((row) => ({
          evacPlaceId: row.evacPlaceId || null,
          evacuationCenterName: row.evacuationCenterName.trim(),
          households: Number(row.households) || 0,
          families: Number(row.families) || 0,
          male: Number(row.male) || 0,
          female: Number(row.female) || 0,
          lgbtq: Number(row.lgbtq) || 0,
          pwd: Number(row.pwd) || 0,
          pregnant: Number(row.pregnant) || 0,
          senior: Number(row.senior) || 0,
          requestedFoodPacks: Number(row.requestedFoodPacks) || 0
        })),
        remarks: remarks.trim()
      };

      const url = editMode
        ? `${BASE_URL}/api/relief-requests/${requestId}`
        : `${BASE_URL}/api/relief-requests`;

      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
=======
      const endpoint =
        isEditingExisting
          ? `${BASE_URL}/api/relief-requests/${requestId}`
          : `${BASE_URL}/api/relief-requests`;

      const method = isEditingExisting ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildPayload())
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      });

      const data = await res.json();

      if (!res.ok) {
<<<<<<< HEAD
        throw new Error(
          data.message ||
            (editMode
              ? 'Failed to update relief request'
              : 'Failed to submit relief request')
        );
      }

      alert(
        data.message ||
          (editMode
            ? 'Relief request updated successfully.'
            : 'Relief request submitted successfully.')
      );

      if (data?.request?.requestNo) {
        setRequestNo(data.request.requestNo);
      }

      resetForm();
      navigate('/barangay/relief-tracking');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(false);
=======
        throw new Error(data?.message || 'Failed to save relief request.');
      }

      setSuccessFeedback(
        data?.message ||
          (method === 'POST'
            ? 'Relief request submitted successfully.'
            : 'Relief request updated successfully.')
      );

      if (data?.request?._id) {
        setRequestId(data.request._id);
      }

      await loadJourneyData({ silent: true });
      setShowEditor(false);
    } catch (err) {
      console.error(err);
      setErrorFeedback(err.message || 'Failed to save relief request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmState.action) return;

    try {
      setSubmittingAction(true);
      clearFeedback();

      if (confirmState.action === 'cancel') {
        const res = await fetch(`${BASE_URL}/api/relief-requests/${latestRequest?._id}/cancel`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    remarks: remarks.trim()
  })
});

const contentType = res.headers.get('content-type') || '';
const rawText = await res.text();

let data = {};
if (contentType.includes('application/json')) {
  try {
    data = JSON.parse(rawText);
  } catch {
    data = {};
  }
}

if (!res.ok) {
  throw new Error(
    data?.message ||
      (rawText.startsWith('<!DOCTYPE') || rawText.startsWith('<html')
        ? 'Cancel route returned HTML instead of JSON. Check the backend route or server error.'
        : 'Failed to cancel request.')
  );
}

        setSuccessFeedback(data?.message || 'Relief request cancelled successfully.');

        setJourney({
          request: null,
          releases: [],
          stage: 'preparation',
          canEdit: false,
          canCancel: false,
          canReceiveAnyRelease: false,
          canRequestAgain: true,
          summary: null
        });

        setRequestId('');
        setRequestNo('Auto-generated');
        setDisaster('');
        setRequestDate(new Date().toISOString().slice(0, 10));
        setRemarks('');
        setRows(bootstrapRows.map((row) => createPreparedRow(row)));
        setShowEditor(false);
        setShowRequestTable(false);
        resetImportState();

        await loadJourneyData({ silent: true });
      }

      if (confirmState.action === 'receive') {
  const res = await fetch(`${BASE_URL}/api/relief-requests/${latestRequest?._id}/received`, {
  method: 'PUT',
  credentials: 'include'
});

  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();

  let data = {};
  if (contentType.includes('application/json')) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = {};
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
    }
  };

  if (loadingPage) {
    return (
      <DashboardShell>
        <div className="rrf-page">
          <div className="rrf-loading-card">
            <div className="rrf-spinner" />
            <p>Loading relief request form...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

<<<<<<< HEAD
  return (
    <DashboardShell>
      <div className="rrf-page">
        <div className="rrf-shell">
          <div className="rrf-header-card">
            <div>
              <span className="rrf-kicker">Barangay Relief Module</span>
              <h1 className="rrf-title">
                {editMode ? 'Edit Relief Request' : 'Relief Request Form'}
              </h1>
              <p className="rrf-subtitle">
                {editMode
                  ? 'Update your pending evacuation-based food pack request before DRRMO review.'
                  : 'Submit evacuation-based food pack requests to DRRMO using a structured request sheet.'}
              </p>
            </div>

            <div className="rrf-header-actions">
              <button
                type="button"
                className="rrf-btn rrf-btn-secondary"
                onClick={() => navigate('/barangay/relief-tracking')}
              >
                ← Back to Tracking
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rrf-form">
            <div className="rrf-top-grid">
              <section className="rrf-card">
                <div className="rrf-card-head">
                  <h2>Request Information</h2>
                  <p>Review the basic request details before filling out the table.</p>
                </div>

                <div className="rrf-info-grid">
                  <div className="rrf-field">
                    <label>Relief Request No.</label>
                    <input
                      type="text"
                      value={requestNo}
                      readOnly
                      placeholder="Auto-generated"
                    />
                  </div>

                  <div className="rrf-field">
                    <label>Barangay</label>
                    <input type="text" value={barangayName} readOnly />
                  </div>

                  <div className="rrf-field">
                    <label>Disaster</label>
                    <input
                      type="text"
                      value={disaster}
                      onChange={(e) => setDisaster(e.target.value)}
                      placeholder="e.g. Flood, Typhoon, Fire"
                      required
                    />
                  </div>

                  <div className="rrf-field">
                    <label>Date</label>
                    <input
                      type="date"
                      value={requestDate}
                      onChange={(e) => setRequestDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </section>

              <aside className="rrf-card rrf-summary-card">
                <div className="rrf-card-head">
                  <h2>Request Summary</h2>
                  <p>Totals update automatically as you edit the rows below.</p>
                </div>

                <div className="rrf-summary-list">
                  <div className="rrf-summary-item">
                    <span>Evacuation Centers</span>
                    <strong>{rows.length}</strong>
                  </div>
                  <div className="rrf-summary-item">
                    <span>Total Households</span>
                    <strong>{totals.households}</strong>
                  </div>
                  <div className="rrf-summary-item">
                    <span>Total Families</span>
                    <strong>{totals.families}</strong>
                  </div>
                  <div className="rrf-summary-item">
                    <span>Total Individuals</span>
                    <strong>{totalIndividuals}</strong>
                  </div>
                  <div className="rrf-summary-item emphasis">
                    <span>Requested Food Packs</span>
                    <strong>{totals.requestedFoodPacks}</strong>
                  </div>
                </div>
              </aside>
            </div>

            <section className="rrf-card">
              <div className="rrf-card-head rrf-table-head">
                <div>
                  <h2>Evacuation Request Details</h2>
                  <p>
                    Add one row per evacuation center and fill in the affected
                    population data.
                  </p>
                </div>

                <button
                  type="button"
                  className="rrf-btn rrf-btn-primary"
                  onClick={addRow}
                >
                  + Add Row
                </button>
              </div>

              <div className="rrf-table-wrapper">
                <table className="rrf-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Name of Evacuation Center/s</th>
                      <th>No. of Households</th>
                      <th>No. of Family</th>
                      <th>Male</th>
                      <th>Female</th>
                      <th>LGBTQ</th>
                      <th>PWD</th>
                      <th>Pregnant</th>
                      <th>Senior</th>
                      <th>No. of Requested Food Packs</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td className="rrf-row-number">{index + 1}</td>

                        <td className="rrf-cell-wide">
                          <div className="rrf-evac-cell">
                            <select
                              value={row.evacPlaceId}
                              onChange={(e) =>
                                handleEvacPlaceChange(index, e.target.value)
                              }
                            >
                              <option value="">Select evacuation center</option>
                              {evacPlaceOptions.map((place) => (
                                <option key={place._id} value={place._id}>
                                  {place.name}
                                </option>
                              ))}
                            </select>

                            <input
                              type="text"
                              value={row.evacuationCenterName}
                              onChange={(e) =>
                                handleRowTextChange(
                                  index,
                                  'evacuationCenterName',
                                  e.target.value
                                )
                              }
                              placeholder="Evacuation center name will auto-fill"
                            />
                          </div>
                        </td>

                        {numberFields.map((field) => (
                          <td key={field}>
                            <input
                              type="number"
                              min="0"
                              value={row[field]}
                              onChange={(e) =>
                                handleRowNumberChange(index, field, e.target.value)
                              }
                            />
                          </td>
                        ))}

                        <td>
                          <button
                            type="button"
                            className="rrf-icon-btn"
                            onClick={() => removeRow(index)}
                            disabled={rows.length === 1}
                            title="Remove row"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td colSpan="2" className="rrf-total-label">
                        TOTAL
                      </td>
                      <td>{totals.households}</td>
                      <td>{totals.families}</td>
                      <td>{totals.male}</td>
                      <td>{totals.female}</td>
                      <td>{totals.lgbtq}</td>
                      <td>{totals.pwd}</td>
                      <td>{totals.pregnant}</td>
                      <td>{totals.senior}</td>
                      <td>{totals.requestedFoodPacks}</td>
                      <td>-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <section className="rrf-card">
              <div className="rrf-card-head">
                <h2>Remarks</h2>
                <p>Add any supporting notes or special instructions for DRRMO.</p>
              </div>

              <div className="rrf-field">
                <textarea
                  rows="5"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional remarks..."
                />
              </div>
            </section>

            <div className="rrf-actions">
              <button
                type="button"
                className="rrf-btn rrf-btn-secondary"
                onClick={() => navigate('/barangay/relief-tracking')}
              >
                Cancel
              </button>

              <button
                type="button"
                className="rrf-btn rrf-btn-outline"
                onClick={resetForm}
              >
                Reset
              </button>

              <button
                type="submit"
                className="rrf-btn rrf-btn-primary"
                disabled={isSubmitDisabled}
              >
                {submitting
                  ? editMode
                    ? 'Updating...'
                    : 'Submitting...'
                  : editMode
                  ? 'Save Changes'
                  : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
=======
  if (!res.ok) {
    throw new Error(
      data?.message ||
        (rawText.startsWith('<!DOCTYPE') || rawText.startsWith('<html')
          ? 'Receive route returned HTML instead of JSON. Check the backend route or server error.'
          : 'Failed to mark request as received.')
    );
  }

  setSuccessFeedback(
    data?.message || 'Received deliveries updated successfully.'
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  );
  await loadJourneyData({ silent: true });
}
    } catch (err) {
      console.error(err);
      setErrorFeedback(err.message || 'Action failed.');
    } finally {
      setSubmittingAction(false);
      closeConfirmation();
    }
  };

  const handleRefreshJourney = async () => {
    clearFeedback();
    await loadJourneyData({ silent: true });
  };

  const handleStartNewRequest = async () => {
  try {
    clearFeedback();

    const freshRows = await fetchLatestBootstrapRows();

    setShowEditor(true);
    setShowRequestTable(false);
    setRows(freshRows.map((row) => createPreparedRow(row)));
    setRequestId('');
    setRequestNo('Auto-generated');
    setDisaster('');
    setRequestDate(new Date().toISOString().slice(0, 10));
    setRemarks('');
    resetImportState();
  } catch (err) {
    console.error(err);
    setErrorFeedback(err.message || 'Failed to prepare a new request.');
  }
};

  const handleChooseFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCloseEditor = () => {
    clearFeedback();
    setShowEditor(false);
    setShowRequestTable(false);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearFeedback();
    setImportingFile(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames?.[0];

      if (!firstSheetName) {
        throw new Error('The selected file does not contain a worksheet.');
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
        raw: false
      });

      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        throw new Error('The selected file does not contain any data rows.');
      }

      const mappedRows = [];
      const issues = [];
      let matchedRows = 0;
      let unmatchedRows = 0;

      rawRows.forEach((rawRow, index) => {
        const mapped = {};

        Object.keys(rawRow || {}).forEach((header) => {
          const resolvedKey = resolveHeaderKey(header);
          if (resolvedKey) {
            mapped[resolvedKey] = rawRow[header];
          }
        });

        const evacuationCenterName = String(
          mapped.evacuationCenterName || ''
        ).trim();

        if (!evacuationCenterName) {
          issues.push(`Row ${index + 2}: Missing evacuation center name.`);
          return;
        }

        const matchedBootstrapRow = evacNameMap.get(normalizeValue(evacuationCenterName));

        if (matchedBootstrapRow) {
          matchedRows += 1;
        } else {
          unmatchedRows += 1;
          issues.push(
            `Row ${index + 2}: "${evacuationCenterName}" did not match an existing evacuation center.`
          );
        }

        mappedRows.push(
          createPreparedRow({
            evacPlaceId: matchedBootstrapRow?.evacPlaceId || '',
            evacuationCenterName:
              matchedBootstrapRow?.evacuationCenterName || evacuationCenterName,
            households: parseSafeNumber(mapped.households),
            families: parseSafeNumber(mapped.families),
            male: parseSafeNumber(mapped.male),
            female: parseSafeNumber(mapped.female),
            lgbtq: parseSafeNumber(mapped.lgbtq),
            pwd: parseSafeNumber(mapped.pwd),
            pregnant: parseSafeNumber(mapped.pregnant),
            senior: parseSafeNumber(mapped.senior),
            requestedFoodPacks: parseSafeNumber(mapped.requestedFoodPacks),
            isActiveRow: true,
            rowRemarks: String(mapped.rowRemarks || '').trim()
          })
        );
      });

      if (!mappedRows.length) {
        throw new Error('No valid data rows were found in the file.');
      }

      const matchedNames = new Set(
        mappedRows.map((row) => normalizeValue(row.evacuationCenterName))
      );

      const untouchedBootstrapRows = bootstrapRows
        .filter((row) => !matchedNames.has(normalizeValue(row.evacuationCenterName)))
        .map((row) => createPreparedRow(row));

      setRows([...mappedRows, ...untouchedBootstrapRows]);

      const summary = {
        totalRows: mappedRows.length,
        matchedRows,
        unmatchedRows
      };

      setImportInfo({
        hasImported: true,
        fileName: file.name,
        summary,
        issues,
        source: 'excel_import'
      });

      setSuccessFeedback(`Import complete. ${buildImportSummaryText(summary)}.`);
    } catch (err) {
      console.error(err);
      setErrorFeedback(err.message || 'Failed to import file.');
      setImportInfo({
        hasImported: false,
        fileName: '',
        summary: null,
        issues: [],
        source: 'manual'
      });
    } finally {
      setImportingFile(false);
      if (event.target) event.target.value = '';
    }
  };

  const showEditorSection = showEditor || editMode;

  return (
    <DashboardShell>
      <div className="rrf-page">
        <div className="rrf-shell">
          {loadingPage && !sessionChecked ? (
            <div className="rrf-loading-card">
              <div className="rrf-spinner" />
              <h2>Loading request</h2>
            </div>
          ) : (
            <>
              <section className="rrf-header-card">
                <div className="rrf-header-copy">
                  <span className="rrf-kicker">Barangay Relief Request</span>
                  <h1 className="rrf-title">Request, track, and confirm relief delivery</h1>
                </div>

                <div className="rrf-header-actions">
                  {refreshingJourney ? (
                    <span className="rrf-refresh-indicator">Refreshing…</span>
                  ) : null}

                  <button
                    type="button"
                    className="rrf-btn rrf-btn-secondary"
                    onClick={handleRefreshJourney}
                    disabled={refreshingJourney || loadingPage}
                  >
                    Refresh
                  </button>
                </div>
              </section>

              <section className="rrf-progress-card rrf-progress-card-compact">
                <div className="rrf-progress-head">
                  <div>
                    <span className="rrf-progress-kicker">Journey Progress</span>
                    <h2>Current request status</h2>
                  </div>
                                    <div className="rrf-stage-head">
                    <span className={`rrf-stage-badge rrf-stage-${stageMeta.tone}`}>
                      {stageMeta.label}
                    </span>
                  </div>
                </div>

                <div className="rrf-progress-steps five-step">
                  {STAGE_STEPS.map((step, index) => {
                    const stepNumber = index + 1;
                    const isDone = stageMeta.completedSteps >= stepNumber;
                    const isActive = stageMeta.activeStep === stepNumber;
                    const isIdle = !isDone && !isActive;

                    return (
                      <div
                        key={step.key}
                        className={`rrf-step ${isDone ? 'done' : ''} ${
                          isActive ? 'active' : ''
                        } ${isIdle ? 'idle' : ''}`}
                      >
                        <span>{stepNumber}</span>
                        <div>
                          <strong>{step.label}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {pageError ? (
                <section className="rrf-card rrf-empty-card">
                  <div className="rrf-empty-state">
                    <h2>Unable to load request page</h2>
                    <p>{pageError}</p>
                  </div>
                </section>
              ) : null}

              {formFeedback.message ? (
                <section className={`rrf-feedback-card ${formFeedback.type}`}>
                  <p>{formFeedback.message}</p>
                </section>
              ) : null}

              <div className="rrf-layout-single">
                {showEditorSection ? (
                  <form className="rrf-form" onSubmit={handleSubmit}>
                    <section className="rrf-card">
                      <div className="rrf-panel-head">
                        <div>
                          <h2>{isEditingExisting ? 'Edit Request' : 'Prepare Request'}</h2>
                        </div>

                        <div className="rrf-inline-actions">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleImportFile}
                            className="rrf-hidden-input"
                          />

                          <button
                            type="button"
                            className="rrf-btn rrf-btn-secondary"
                            onClick={handleChooseFile}
                            disabled={importingFile || submitting}
                          >
                            {importingFile ? 'Importing…' : 'Import Excel / CSV'}
                          </button>

                          <button
                            type="button"
                            className="rrf-btn rrf-btn-secondary"
                            onClick={handleResetForm}
                            disabled={submitting}
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {importInfo.hasImported ? (
                        <div className="rrf-import-strip">
                          <div className="rrf-import-strip-main">
                            <strong>{importInfo.fileName || 'Imported file'}</strong>
                            <span>{buildImportSummaryText(importInfo.summary)}</span>
                          </div>

                          {importInfo.issues?.length ? (
                            <small>{importInfo.issues.length} issue(s)</small>
                          ) : (
                            <small>Applied</small>
                          )}
                        </div>
                      ) : null}

                      <div className="rrf-editor-grid">
                        <div className="rrf-editor-main">
                          <div className="rrf-form-grid">
                            <div className="rrf-field">
                              <label htmlFor="requestNo">Request No.</label>
                              <input id="requestNo" type="text" value={requestNo} readOnly />
                            </div>

                            <div className="rrf-field">
                              <label htmlFor="barangayName">Barangay</label>
                              <input
                                id="barangayName"
                                type="text"
                                value={barangayName}
                                readOnly
                              />
                            </div>

                            <div className="rrf-field">
                              <label htmlFor="disaster">Disaster / Incident</label>
                              <input
                                id="disaster"
                                type="text"
                                value={disaster}
                                onChange={(e) => setDisaster(e.target.value)}
                              />
                            </div>

                            <div className="rrf-field">
                              <label htmlFor="requestDate">Request Date</label>
                              <input
                                id="requestDate"
                                type="date"
                                value={requestDate}
                                onChange={(e) => setRequestDate(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="rrf-field rrf-remarks-field">
                            <label htmlFor="remarks">Overall Remarks</label>
                            <textarea
                              id="remarks"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="rrf-editor-side">
                          <div className="rrf-card rrf-summary-card rrf-summary-card-compact">
                            <div className="rrf-panel-head rrf-panel-head-tight">
                              <div>
                                <h2>Live Totals</h2>
                              </div>
                            </div>

                            <div className="rrf-summary-list">
                              <div className="rrf-summary-item">
                                <span>Centers</span>
                                <strong>{activeRows.length}</strong>
                              </div>
                              <div className="rrf-summary-item">
                                <span>Families</span>
                                <strong>{totals.families}</strong>
                              </div>
                              <div className="rrf-summary-item">
                                <span>Individuals</span>
                                <strong>{totalIndividuals}</strong>
                              </div>
                              <div className="rrf-summary-item">
                                <span>Vulnerable</span>
                                <strong>{vulnerableCount}</strong>
                              </div>
                              <div className="rrf-summary-item emphasis">
                                <span>Food Packs</span>
                                <strong>{totals.requestedFoodPacks}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rrf-table-card">
                        <div className="rrf-subsection-head">
                          <div>
                            <span className="rrf-subsection-kicker">Evacuation center rows</span>
                            <h3>Review and update row data</h3>
                          </div>
                        </div>

                        <div className="rrf-table-wrapper rrf-table-wrapper-tall">
                          <table className="rrf-table rrf-table-compact">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Status</th>
                                <th className="rrf-left-cell">Evacuation Center</th>
                                <th>Households</th>
                                <th>Families</th>
                                <th>Male</th>
                                <th>Female</th>
                                <th>LGBTQ</th>
                                <th>PWD</th>
                                <th>Pregnant</th>
                                <th>Senior</th>
                                <th>Food Packs</th>
                                <th className="rrf-left-cell">Row Remarks</th>
                              </tr>
                            </thead>

                            <tbody>
                              {preparedRows.map((row, index) => (
                                <tr
                                  key={`${row.evacuationCenterName}-${index}`}
                                  className={!row.isActiveRow ? 'rrf-row-muted' : ''}
                                >
                                  <td className="rrf-row-number">{index + 1}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`rrf-toggle-btn ${row.isActiveRow ? 'active' : ''}`}
                                      onClick={() => handleToggleRow(index)}
                                    >
                                      {row.isActiveRow ? 'On' : 'Off'}
                                    </button>
                                  </td>

                                  <td className="rrf-left-cell">
                                    <div className="rrf-evac-static">
                                      <strong>{row.evacuationCenterName || 'Unnamed center'}</strong>
                                    </div>
                                  </td>

                                  {numberFields.map((field) => (
                                    <td key={`${field}-${index}`} className="rrf-number-cell">
                                      <input
                                        type="number"
                                        min="0"
                                        value={row[field]}
                                        onChange={(e) =>
                                          handleRowNumberChange(index, field, e.target.value)
                                        }
                                        disabled={!row.isActiveRow}
                                      />
                                    </td>
                                  ))}

                                  <td className="rrf-left-cell rrf-cell-remarks">
                                    <input
                                      type="text"
                                      value={row.rowRemarks || ''}
                                      onChange={(e) =>
                                        handleRowRemarksChange(index, e.target.value)
                                      }
                                      disabled={!row.isActiveRow}
                                      placeholder="Optional"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>

                            <tfoot>
                              <tr>
                                <td colSpan="3" className="rrf-total-label">
                                  Total
                                </td>
                                <td>{totals.households}</td>
                                <td>{totals.families}</td>
                                <td>{totals.male}</td>
                                <td>{totals.female}</td>
                                <td>{totals.lgbtq}</td>
                                <td>{totals.pwd}</td>
                                <td>{totals.pregnant}</td>
                                <td>{totals.senior}</td>
                                <td>{totals.requestedFoodPacks}</td>
                                <td />
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      <div className="rrf-submit-row">
                        <button
                          type="button"
                          className="rrf-btn rrf-btn-secondary"
                          onClick={handleCloseEditor}
                          disabled={submitting}
                        >
                          Close Editor
                        </button>

                        <button
                          type="submit"
                          className="rrf-btn rrf-btn-primary"
                          disabled={isSubmitDisabled}
                        >
                          {submitting
                            ? isEditingExisting
                              ? 'Saving…'
                              : 'Submitting…'
                            : isEditingExisting
                              ? 'Save Changes'
                              : 'Submit Request'}
                        </button>
                      </div>
                    </section>
                  </form>
                ) : null}

                {!showEditorSection && latestRequest ? (
                  <section className="rrf-card">
                    <div className="rrf-panel-head rrf-panel-head-tight">
                      <div>
                        <h2>Current request</h2>
                      </div>

                      <div className="rrf-inline-actions">
                        {journey.canEdit ? (
                          <button
                            type="button"
                            className="rrf-btn rrf-btn-secondary"
                            onClick={() => setShowEditor(true)}
                          >
                            Edit Request
                          </button>
                        ) : null}

                        {journey.canCancel ? (
                          <button
                            type="button"
                            className="rrf-btn rrf-btn-danger"
                            onClick={() =>
                              openConfirmation({
                                title: 'Cancel this request?',
                                message: 'This request will no longer continue in the queue.',
                                action: 'cancel'
                              })
                            }
                            disabled={submittingAction}
                          >
                            Cancel Request
                          </button>
                        ) : null}

                        {journey.canReceiveAnyRelease ? (
                          <button
                            type="button"
                            className="rrf-btn rrf-btn-primary"
                            onClick={() =>
                              openConfirmation({
                                title: 'Confirm received deliveries?',
                                message:
                                  'Only the currently released deliveries will be marked as received. The request will stay open if there is still a remaining balance.',
                                action: 'receive'
                              })
                            }
                            disabled={submittingAction}
                          >
                            Confirm Received
                          </button>
                        ) : null}

                        {canShowRequestAgainButton ? (
                          <button
                            type="button"
                            className="rrf-btn rrf-btn-primary"
                            onClick={handleStartNewRequest}
                          >
                            Prepare New Request
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="rrf-current-request-hero">
                      <div className="rrf-hero-main">
                        <div className="rrf-hero-label">Request No.</div>
                        <div className="rrf-hero-value">{latestRequest.requestNo || '-'}</div>
                      </div>

                      <div className="rrf-hero-side">
                        <div className="rrf-hero-meta">
                          <span>Request Date</span>
                          <strong>
                            {formatDate(
                              journey.summary?.requestDate || latestRequest.requestDate
                            )}
                          </strong>
                        </div>

                        <div
                          className={`rrf-hero-meta rrf-hero-meta-receipt rrf-hero-meta-${receiptMeta.tone}`}
                        >
                          <span>{receiptMeta.label}</span>
                          <strong>{receiptMeta.value}</strong>
                        </div>

                        <div className="rrf-hero-meta rrf-hero-meta-status">
                          <span>Request Status</span>
                          <strong>
                            <span
                              className={`rrf-inline-status rrf-inline-status-${stageMeta.tone}`}
                            >
                              {requestStatusLabel}
                            </span>
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="rrf-review-delivery-strip">
                      <div className="rrf-review-delivery-card primary">
                        <span>Requested Packs</span>
                        <strong>{journey.summary?.requestedFoodPacks || 0}</strong>
                      </div>

                      <div className="rrf-review-delivery-card emphasis">
                        <span>To Be Received</span>
                        <strong>
                          {Math.max(
                            0,
                            Number(journey.summary?.releasedFoodPacks || 0) -
                              Number(journey.summary?.receivedFoodPacks || 0)
                          )}
                        </strong>
                      </div>

                      <div className="rrf-review-delivery-card">
                        <span>Received Packs</span>
                        <strong>{journey.summary?.receivedFoodPacks || 0}</strong>
                      </div>
                    </div>

                    <div className="rrf-compact-meta-grid">
                      <div className="rrf-compact-meta-card">
                        <span>Disaster</span>
                        <strong>{latestRequest.disaster || '-'}</strong>
                      </div>
                      <div className="rrf-compact-meta-card">
                        <span>Entry Mode</span>
                        <strong>
                          {String(latestRequest.entryMode || 'manual')
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </strong>
                      </div>
                      <div className="rrf-compact-meta-card">
                        <span>Total Affected</span>
                        <strong>{journey.summary?.totalAffected || 0}</strong>
                      </div>
                      <div className="rrf-compact-meta-card">
                        <span>Vulnerable Count</span>
                        <strong>{journey.summary?.vulnerableCount || 0}</strong>
                      </div>
                    </div>

                    <div className="rrf-collapsible-head">
                      <div>
                        <span className="rrf-subsection-kicker">Request rows</span>
                        <h3>Evacuation center snapshot</h3>
                      </div>

                      <button
                        type="button"
                        className="rrf-btn rrf-btn-secondary rrf-btn-small"
                        onClick={() => setShowRequestTable((prev) => !prev)}
                      >
                        {showRequestTable ? 'Hide Table' : 'Show Table'}
                      </button>
                    </div>

                    {showRequestTable ? (
                      <div className="rrf-table-wrapper rrf-table-wrapper-tall">
                        <table className="rrf-table rrf-detail-table rrf-table-compact">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th className="rrf-left-cell">Evacuation Center</th>
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
                            {(latestRequest.rows || []).map((row, index) => (
                              <tr key={`${row.evacuationCenterName}-${index}`}>
                                <td>{index + 1}</td>
                                <td className="rrf-left-cell">{row.evacuationCenterName || '-'}</td>
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
                        </table>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {!showEditorSection && !latestRequest ? (
                  <section className="rrf-card rrf-empty-card">
                    <div className="rrf-empty-inline">
                      <div>
                        <h2>No active request</h2>
                      </div>

                      <button
                        type="button"
                        className="rrf-btn rrf-btn-primary"
                        onClick={handleStartNewRequest}
                      >
                        Prepare New Request
                      </button>
                    </div>
                  </section>
                ) : null}
              </div>

              {confirmState.open ? (
                <div className="rrf-modal-backdrop">
                  <div className="rrf-modal-card">
                    <h3>{confirmState.title}</h3>
                    <p>{confirmState.message}</p>

                    <div className="rrf-modal-actions">
                      <button
                        type="button"
                        className="rrf-btn rrf-btn-secondary"
                        onClick={closeConfirmation}
                        disabled={submittingAction}
                      >
                        Go Back
                      </button>
                      <button
                        type="button"
                        className={`rrf-btn ${
                          confirmState.action === 'cancel'
                            ? 'rrf-btn-danger'
                            : 'rrf-btn-primary'
                        }`}
                        onClick={handleConfirmAction}
                        disabled={submittingAction}
                      >
                        {submittingAction ? 'Processing…' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}