import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardShell from "./layout/DashboardShell";
import EvacMap from "./map/Map";
import "../components/css/EManagement.css";

const BASE_URL =
  process.env.REACT_APP_API_URL || "https://gaganadapat.onrender.com";

const initialFormState = {
  name: "",
  location: "",
  barangayId: "",
  barangayName: "",
  latitude: null,
  longitude: null,
  capacityIndividual: "",
  capacityFamily: "",
  bedCapacity: "",
  floorArea: "",
  femaleCR: false,
  maleCR: false,
  commonCR: false,
  potableWater: false,
  nonPotableWater: false,
  isPermanent: false,
  isCovidFacility: false,
  showOnLanding: true,
  remarks: "",
};

const sanitizeText = (value) => String(value ?? "").trim();

const safeLower = (value) => String(value ?? "").toLowerCase().trim();

const formatNumber = (value) => {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "0";
  return new Intl.NumberFormat().format(num);
};

const numberOrZero = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const normalizeBarangayKey = (value) =>
  safeLower(value).replace(/\s+/g, " ").trim();

const getStoredRole = () => localStorage.getItem("role") || "";
const getStoredUserId = () => localStorage.getItem("userId") || "";
const getStoredBarangayName = () =>
  localStorage.getItem("barangayName") ||
  localStorage.getItem("username") ||
  "";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getStatusClass = (status) => {
  const normalized = safeLower(status);
  if (normalized === "available") return "available";
  if (normalized === "limited") return "limited";
  return "full";
};

const getHistoryAccentClass = (action) => {
  const normalized = safeLower(action);
  if (["add", "create"].includes(normalized)) return "success";
  if (["update", "edit", "status_update", "allocate"].includes(normalized))
    return "warning";
  if (["delete", "archive", "remove"].includes(normalized)) return "danger";
  return "neutral";
};

function MapLegend() {
  return (
    <div className="map-legend-card" aria-label="Map legend">
      <div className="map-legend-title">Map Legend</div>
      <div className="map-legend-items">
        <div className="map-legend-item">
          <span className="map-legend-dot available" />
          <span>Available</span>
        </div>
        <div className="map-legend-item">
          <span className="map-legend-dot limited" />
          <span>Limited</span>
        </div>
        <div className="map-legend-item">
          <span className="map-legend-dot full" />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
}

export default function EManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const nameRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [me, setMe] = useState(null);

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [landingToggleLoading, setLandingToggleLoading] = useState(false);
  const [bulkLandingLoading, setBulkLandingLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [sortBy, setSortBy] = useState("capacity");

  const [selectedBarangayName, setSelectedBarangayName] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [panelView, setPanelView] = useState("areas");

  const [notifications, setNotifications] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [pickMode, setPickMode] = useState(false);

  const [formData, setFormData] = useState(initialFormState);

      const pushNotification = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setNotifications((prev) => {
      const next = [...prev, { id, message, type }];
      return next.slice(-3);
    });

    window.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 10000);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

    const visibleNotifications = useMemo(() => {
    return [...notifications].reverse();
  }, [notifications]);

  const getNotificationIcon = useCallback((type) => {
    if (type === "success") return "✓";
    if (type === "error") return "!";
    if (type === "info") return "i";
    return "•";
  }, []);

  const storedRole = getStoredRole();
  const storedUserId = getStoredUserId();

  const routeSaysBarangay = location.pathname.startsWith("/barangay");
  const meRole = me?.role || "";
  const isBarangayRole =
    routeSaysBarangay ||
    safeLower(storedRole) === "barangay" ||
    safeLower(meRole) === "barangay";

  const isPrivilegedOps =
    !isBarangayRole &&
    (safeLower(storedRole) === "admin" ||
      safeLower(storedRole) === "drrmo" ||
      safeLower(meRole) === "admin" ||
      safeLower(meRole) === "drrmo");

  const localUserId = me?._id || storedUserId || "";
  const localBarangayName = me?.barangayName || getStoredBarangayName() || "";

  const normalizeBarangayItem = useCallback((item) => {
    const id = item?._id || item?.id || item?.barangayId || item?.value || "";

    const name =
      item?.barangayName ||
      item?.name ||
      item?.barangay ||
      item?.username ||
      item?.email ||
      item?.label ||
      "";

    return {
      _id: String(id || ""),
      name: String(name || ""),
      raw: item,
    };
  }, []);

  const buildEvacQueryParams = useCallback(() => {
    const params = {};

    if (!isBarangayRole) {
      const selectedBarangay = barangayFilter !== "all" ? barangayFilter : "";
      if (selectedBarangay) params.barangayName = selectedBarangay;
    }

    if (statusFilter !== "all") params.status = statusFilter;
    if (sanitizeText(search)) params.search = sanitizeText(search);

    return params;
  }, [isBarangayRole, barangayFilter, statusFilter, search]);

  const buildFallbackMe = useCallback(() => {
    const role = safeLower(storedRole);
    return {
      _id: storedUserId || "",
      role: role || "",
      barangayName: getStoredBarangayName() || "",
      username: localStorage.getItem("username") || "",
      name: localStorage.getItem("name") || "",
    };
  }, [storedRole, storedUserId]);

  const fetchMe = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/barangays/me`, {
        withCredentials: true,
      });

      const payload = res.data || null;
      setMe(payload);
      return payload;
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 401) {
        const fallback = buildFallbackMe();
        setMe(fallback);
        return fallback;
      }

      console.error("Fetch me error:", error);
      const fallback = buildFallbackMe();
      setMe(fallback);
      return fallback;
    }
  }, [buildFallbackMe]);

    const fetchPlaces = useCallback(async (overrideParams = null) => {
    try {
      const params = overrideParams || {};
      const res = await axios.get(`${BASE_URL}/evacs`, {
        withCredentials: true,
        params,
      });

      const payload = Array.isArray(res.data) ? res.data : [];
      setPlaces(payload);
      return payload;
    } catch (error) {
      console.error("Fetch places error:", error);
      setPlaces([]);
      return [];
    }
  }, []);

  const fetchAllPlaces = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/evacs`, {
        withCredentials: true,
      });

      const payload = Array.isArray(res.data) ? res.data : [];
      setAllPlaces(payload);
      return payload;
    } catch (error) {
      console.error("Fetch all places error:", error);
      setAllPlaces([]);
      return [];
    }
  }, []);

  const fetchBarangays = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/barangays`, {
        withCredentials: true,
      });

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.barangays)
        ? res.data.barangays
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const mapped = raw
        .map(normalizeBarangayItem)
        .filter((item) => item._id && item.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      setBarangays(mapped);
      return mapped;
    } catch (error) {
      console.error("Fetch barangays error:", error);
      setBarangays([]);
      return [];
    }
  }, [normalizeBarangayItem]);

    const fetchHistory = useCallback(async (overrideParams = null) => {
    try {
      const params = overrideParams || {};
      const res = await axios.get(`${BASE_URL}/evacs/history/logs`, {
        withCredentials: true,
        params,
      });

      const payload = Array.isArray(res.data) ? res.data : [];
      setHistory(payload);
      return payload;
    } catch (error) {
      console.error("Fetch history error:", error);
      setHistory([]);
      return [];
    }
  }, []);

    const fetchAnalytics = useCallback(async (overrideParams = null) => {
    try {
      const params = overrideParams || {};
      const res = await axios.get(`${BASE_URL}/evacs/analytics/summary`, {
        withCredentials: true,
        params,
      });

      setAnalytics(res.data || null);
      return res.data || null;
    } catch (error) {
      console.error("Fetch analytics error:", error);
      setAnalytics(null);
      return null;
    }
  }, []);

    const fetchAllData = useCallback(async () => {
    setLoadingPage(true);
    try {
      await Promise.all([
        fetchMe(),
        fetchPlaces(),
        fetchAllPlaces(),
        fetchBarangays(),
        fetchHistory(),
        fetchAnalytics(),
      ]);
    } catch (error) {
      console.error("Fetch all EManagement data error:", error);
    } finally {
      setLoadingPage(false);
    }
  }, [
    fetchMe,
    fetchPlaces,
    fetchAllPlaces,
    fetchBarangays,
    fetchHistory,
    fetchAnalytics,
  ]);

  useEffect(() => {
    const role = getStoredRole();
    if (!role && !routeSaysBarangay) {
      navigate("/");
      return;
    }
    fetchAllData();
  }, [fetchAllData, navigate, routeSaysBarangay]);

  useEffect(() => {
    if ((showAddForm || showEditForm) && nameRef.current) {
      const timer = setTimeout(() => {
        nameRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showAddForm, showEditForm]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      const isField =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable;

      if (e.key === "Escape" && !isField) {
        if (showAddForm) setShowAddForm(false);
        if (showEditForm) setShowEditForm(false);
        if (showArchiveConfirm) setShowArchiveConfirm(false);
        if (pickMode) setPickMode(false);
        if (panelView === "history") setPanelView("main");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showAddForm, showEditForm, showArchiveConfirm, pickMode]);

  useEffect(() => {
    document.body.style.cursor = pickMode ? "crosshair" : "default";
    return () => {
      document.body.style.cursor = "default";
    };
  }, [pickMode]);

  const resolveOwnBarangay = useCallback(() => {
    if (!barangays.length) {
      if (localBarangayName) {
        return {
          _id: localUserId || "",
          name: localBarangayName,
          raw: {},
        };
      }
      return null;
    }

    const own = barangays.find((item) => {
      const idMatch = localUserId && String(item._id) === String(localUserId);

      const nameMatch =
        normalizeBarangayKey(item.name) ===
          normalizeBarangayKey(localBarangayName) ||
        normalizeBarangayKey(item.raw?.barangayName) ===
          normalizeBarangayKey(localBarangayName) ||
        normalizeBarangayKey(item.raw?.username) ===
          normalizeBarangayKey(localBarangayName);

      return idMatch || nameMatch;
    });

    if (own) return own;

    if (localBarangayName) {
      return {
        _id: localUserId || "",
        name: localBarangayName,
        raw: {},
      };
    }

    return null;
  }, [barangays, localUserId, localBarangayName]);

  const visiblePlacesBase = useMemo(() => {
    if (!Array.isArray(places)) return [];

    if (!isBarangayRole) return places;

    return places.filter((place) => {
      const sameBarangayId =
        localUserId && String(place?.barangayId) === String(localUserId);

      const sameBarangayName =
        localBarangayName &&
        normalizeBarangayKey(place?.barangayName) ===
          normalizeBarangayKey(localBarangayName);

      return sameBarangayId || sameBarangayName;
    });
  }, [places, isBarangayRole, localUserId, localBarangayName]);

  const computedPlaces = useMemo(() => {
    return visiblePlacesBase.map((place) => ({
      ...place,
      totalCapacity:
        Number(place?.capacityIndividual || 0) +
        Number(place?.capacityFamily || 0) +
        Number(place?.bedCapacity || 0),
      facilitiesCount: [
        place?.femaleCR,
        place?.maleCR,
        place?.commonCR,
        place?.potableWater,
        place?.nonPotableWater,
      ].filter(Boolean).length,
    }));
  }, [visiblePlacesBase]);

    const barangayCards = useMemo(() => {
    if (isBarangayRole) return [];

    const sourceList = Array.isArray(allPlaces) ? allPlaces : [];
    const map = new Map();

    sourceList.forEach((place) => {
      const key = place?.barangayName || "Unknown Barangay";

      if (!map.has(key)) {
        map.set(key, {
          barangayName: key,
          placesCount: 0,
          availableCount: 0,
          limitedCount: 0,
          fullCount: 0,
        });
      }

      const entry = map.get(key);
      entry.placesCount += 1;

      if (safeLower(place?.capacityStatus) === "available") {
        entry.availableCount += 1;
      }

      if (safeLower(place?.capacityStatus) === "limited") {
        entry.limitedCount += 1;
      }

      if (safeLower(place?.capacityStatus) === "full") {
        entry.fullCount += 1;
      }
    });

    const cards = Array.from(map.values()).sort((a, b) =>
      a.barangayName.localeCompare(b.barangayName)
    );

    const term = safeLower(search);
    if (!term) return cards;

    return cards.filter((item) =>
      safeLower(item.barangayName).includes(term)
    );
  }, [allPlaces, isBarangayRole, search]);

  useEffect(() => {
    if (isBarangayRole) {
      setSelectedBarangayName(localBarangayName || "");
      return;
    }

    const availableNames = barangayCards.map((item) => item.barangayName);

    if (!availableNames.length) {
      setSelectedBarangayName("");
      return;
    }

    if (barangayFilter !== "all") {
      setSelectedBarangayName(barangayFilter);
      return;
    }

    if (
      !selectedBarangayName ||
      !availableNames.includes(selectedBarangayName)
    ) {
      setSelectedBarangayName("");
    }
  }, [
    barangayCards,
    isBarangayRole,
    localBarangayName,
    selectedBarangayName,
    barangayFilter,
  ]);

  const filteredPlaces = useMemo(() => {
    let list = [...computedPlaces];
    const term = safeLower(search);

    if (term) {
      list = list.filter((place) => {
        return (
          safeLower(place?.name).includes(term) ||
          safeLower(place?.location).includes(term) ||
          safeLower(place?.barangayName).includes(term) ||
          safeLower(place?.remarks).includes(term)
        );
      });
    }

    if (statusFilter !== "all") {
      list = list.filter(
        (place) => safeLower(place?.capacityStatus) === safeLower(statusFilter)
      );
    }

    if (!isBarangayRole && barangayFilter !== "all") {
      list = list.filter(
        (place) =>
          normalizeBarangayKey(place?.barangayName) ===
          normalizeBarangayKey(barangayFilter)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "capacity") {
        return Number(b.totalCapacity || 0) - Number(a.totalCapacity || 0);
      }

      if (sortBy === "status") {
        const order = { available: 1, limited: 2, full: 3 };
        return (
          (order[safeLower(a.capacityStatus)] || 99) -
          (order[safeLower(b.capacityStatus)] || 99)
        );
      }

      if (sortBy === "barangay") {
        return safeLower(a.barangayName).localeCompare(
          safeLower(b.barangayName)
        );
      }

      return safeLower(a.name).localeCompare(safeLower(b.name));
    });

    return list;
  }, [
    computedPlaces,
    search,
    statusFilter,
    barangayFilter,
    isBarangayRole,
    sortBy,
  ]);

  useEffect(() => {
    if (!filteredPlaces.length) {
      setSelectedId(null);
      return;
    }

    if (!selectedId) return;

    const stillExists = filteredPlaces.some(
      (place) => String(place._id) === String(selectedId)
    );

    if (!stillExists) setSelectedId(null);
  }, [filteredPlaces, selectedId]);

  const selectedPlace = useMemo(() => {
    return (
      filteredPlaces.find((item) => String(item._id) === String(selectedId)) ||
      null
    );
  }, [filteredPlaces, selectedId]);

  const selectedPlaceHistory = useMemo(() => {
    if (!selectedPlace) return [];

    return history.filter((item) => {
      return (
        safeLower(item?.placeName) === safeLower(selectedPlace?.name) ||
        safeLower(item?.barangayName) === safeLower(selectedPlace?.barangayName)
      );
    });
  }, [history, selectedPlace]);

  const recentSelectedPlaceHistory = useMemo(() => {
    return selectedPlaceHistory.slice(0, 4);
  }, [selectedPlaceHistory]);

  const overallSummary = useMemo(() => {
    const totalPlaces = allPlaces.length;

    const availableCount = allPlaces.filter(
      (item) => safeLower(item.capacityStatus) === "available"
    ).length;

    const limitedCount = allPlaces.filter(
      (item) => safeLower(item.capacityStatus) === "limited"
    ).length;

    const fullCount = allPlaces.filter(
      (item) => safeLower(item.capacityStatus) === "full"
    ).length;

    const totalIndividualCapacity = allPlaces.reduce(
      (sum, item) => sum + Number(item.capacityIndividual || 0),
      0
    );

    const totalFamilyCapacity = allPlaces.reduce(
      (sum, item) => sum + Number(item.capacityFamily || 0),
      0
    );

    const totalBedCapacity = allPlaces.reduce(
      (sum, item) => sum + Number(item.bedCapacity || 0),
      0
    );

    const allShownOnLanding =
      totalPlaces > 0 && allPlaces.every((item) => item.showOnLanding !== false);

    return {
      totalPlaces,
      availableCount,
      limitedCount,
      fullCount,
      totalIndividualCapacity,
      totalFamilyCapacity,
      totalBedCapacity,
      allShownOnLanding,
    };
  }, [allPlaces]);

  const summary = useMemo(() => {
    const baseList =
      !isBarangayRole && barangayFilter !== "all"
        ? computedPlaces.filter(
            (item) =>
              normalizeBarangayKey(item.barangayName) ===
              normalizeBarangayKey(barangayFilter)
          )
        : computedPlaces;

    const totalPlaces = baseList.length;
    const availableCount = baseList.filter(
      (item) => safeLower(item.capacityStatus) === "available"
    ).length;
    const limitedCount = baseList.filter(
      (item) => safeLower(item.capacityStatus) === "limited"
    ).length;
    const fullCount = baseList.filter(
      (item) => safeLower(item.capacityStatus) === "full"
    ).length;
    const permanentCount = baseList.filter((item) => item.isPermanent).length;
    const covidFacilities = baseList.filter(
      (item) => item.isCovidFacility
    ).length;

    const totalIndividualCapacity = baseList.reduce(
      (sum, item) => sum + Number(item.capacityIndividual || 0),
      0
    );
    const totalFamilyCapacity = baseList.reduce(
      (sum, item) => sum + Number(item.capacityFamily || 0),
      0
    );
    const totalBedCapacity = baseList.reduce(
      (sum, item) => sum + Number(item.bedCapacity || 0),
      0
    );

    return {
      totalPlaces,
      availableCount,
      limitedCount,
      fullCount,
      permanentCount,
      covidFacilities,
      totalIndividualCapacity,
      totalFamilyCapacity,
      totalBedCapacity,
    };
  }, [computedPlaces, isBarangayRole, barangayFilter]);

  const effectiveAnalytics = useMemo(() => {
    if (!analytics) return summary;

    if (barangayFilter === "all" || isBarangayRole) {
      return {
        totalPlaces: analytics.totalPlaces ?? summary.totalPlaces,
        availableCount:
          analytics.statusCounts?.available ?? summary.availableCount,
        limitedCount: analytics.statusCounts?.limited ?? summary.limitedCount,
        fullCount: analytics.statusCounts?.full ?? summary.fullCount,
        permanentCount: analytics.permanentCount ?? summary.permanentCount,
        covidFacilities: analytics.covidFacilities ?? summary.covidFacilities,
        totalIndividualCapacity:
          analytics.totalIndividualCapacity ?? summary.totalIndividualCapacity,
        totalFamilyCapacity:
          analytics.totalFamilyCapacity ?? summary.totalFamilyCapacity,
        totalBedCapacity:
          analytics.totalBedCapacity ?? summary.totalBedCapacity,
      };
    }

    const match = analytics.barangayBreakdown?.find(
      (b) =>
        normalizeBarangayKey(b.barangayName) ===
        normalizeBarangayKey(barangayFilter)
    );

    if (!match) return summary;

    return {
      totalPlaces: match.totalPlaces,
      availableCount: match.available,
      limitedCount: match.limited,
      fullCount: match.full,
      permanentCount: summary.permanentCount,
      covidFacilities: summary.covidFacilities,
      totalIndividualCapacity: match.totalIndividualCapacity,
      totalFamilyCapacity: match.totalFamilyCapacity,
      totalBedCapacity: match.totalBedCapacity,
    };
  }, [analytics, summary, barangayFilter, isBarangayRole]);

  const warningInsights = useMemo(() => {
    const alerts = [];

    if (
      effectiveAnalytics?.availableCount === 0 &&
      effectiveAnalytics?.totalPlaces > 0
    ) {
      alerts.push({
        tone: "danger",
        title: "No available evacuation areas",
        text: "All tracked evacuation areas are currently limited or full.",
      });
    }

    if (effectiveAnalytics?.fullCount > 0) {
      alerts.push({
        tone: "warning",
        title: "Full evacuation areas detected",
        text: `${formatNumber(
          effectiveAnalytics.fullCount
        )} evacuation area(s) are marked full and may need reallocation support.`,
      });
    }

    if (
      effectiveAnalytics?.totalPlaces > 0 &&
      effectiveAnalytics?.fullCount >=
        Math.ceil(effectiveAnalytics.totalPlaces / 2)
    ) {
      alerts.push({
        tone: "danger",
        title: "High occupancy pressure",
        text: "Half or more of the evacuation areas are already full.",
      });
    }

    return alerts;
  }, [effectiveAnalytics]);

  const updateFormField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTextFieldChange = (e) => {
    const { name, value } = e.target;
    updateFormField(name, sanitizeText(value));
  };

  const handleNumericFieldChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      updateFormField(name, "");
      return;
    }
    updateFormField(name, value.replace(/[^\d.]/g, ""));
  };

  const handleLatitudeChange = (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      updateFormField("latitude", null);
      return;
    }
    const num = Number(value);
    if (!Number.isNaN(num)) updateFormField("latitude", num);
  };

  const handleLongitudeChange = (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      updateFormField("longitude", null);
      return;
    }
    const num = Number(value);
    if (!Number.isNaN(num)) updateFormField("longitude", num);
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
  }, []);

  const cancelPickMode = useCallback(() => {
    setPickMode(false);
    pushNotification("Map selection cancelled.", "info");
  }, [pushNotification]);

  const handleBarangaySelect = useCallback((name) => {
    setBarangayFilter(name);
    setSelectedBarangayName(name === "all" ? "" : name);
    setSelectedId(null);
    setPanelView("areas");
  }, []);

  const handleStartPick = () => {
    const baseForm = { ...initialFormState };

    if (isBarangayRole) {
      const ownBarangay = resolveOwnBarangay();

      if (ownBarangay) {
        baseForm.barangayId = ownBarangay._id;
        baseForm.barangayName = ownBarangay.name;
      } else if (localBarangayName) {
        baseForm.barangayName = localBarangayName;
      }
    } else if (barangayFilter !== "all") {
      const matchedBarangay =
        barangays.find(
          (item) =>
            normalizeBarangayKey(item.name) ===
            normalizeBarangayKey(barangayFilter)
        ) || null;

      if (matchedBarangay) {
        baseForm.barangayId = matchedBarangay._id;
        baseForm.barangayName = matchedBarangay.name;
      } else {
        baseForm.barangayName = barangayFilter;
      }
    }

    setFormData(baseForm);
    setShowAddForm(false);
    setShowEditForm(false);
    setPickMode(true);
    pushNotification(
      "Pick a point on the map or cancel if this was accidental.",
      "info"
    );
  };

  const openEditModal = () => {
    if (!selectedPlace) return;

    setFormData({
      name: selectedPlace.name || "",
      location: selectedPlace.location || "",
      barangayId: selectedPlace.barangayId || "",
      barangayName: selectedPlace.barangayName || "",
      latitude:
        selectedPlace.latitude === null || selectedPlace.latitude === undefined
          ? null
          : Number(selectedPlace.latitude),
      longitude:
        selectedPlace.longitude === null || selectedPlace.longitude === undefined
          ? null
          : Number(selectedPlace.longitude),
      capacityIndividual: String(selectedPlace.capacityIndividual || ""),
      capacityFamily: String(selectedPlace.capacityFamily || ""),
      bedCapacity: String(selectedPlace.bedCapacity || ""),
      floorArea: String(selectedPlace.floorArea || ""),
      femaleCR: Boolean(selectedPlace.femaleCR),
      maleCR: Boolean(selectedPlace.maleCR),
      commonCR: Boolean(selectedPlace.commonCR),
      potableWater: Boolean(selectedPlace.potableWater),
      nonPotableWater: Boolean(selectedPlace.nonPotableWater),
      isPermanent: Boolean(selectedPlace.isPermanent),
      isCovidFacility: Boolean(selectedPlace.isCovidFacility),
      showOnLanding:
        selectedPlace.showOnLanding === undefined
          ? true
          : Boolean(selectedPlace.showOnLanding),
      remarks: selectedPlace.remarks || "",
    });

    setShowAddForm(false);
    setShowEditForm(true);
  };

  // Fly helper — used ONL
  // Normalize args from Map -> supports {latlng:{lat,lng}, label?} or (label, lat, lng)
  const normalizeMapArgs = (...args) => {
    let locationLabel = "";
    let lat = null;
    let lng = null;

    if (args.length === 1 && args[0]?.latlng) {
      lat = args[0].latlng.lat;
      lng = args[0].latlng.lng;
      locationLabel =
        args[0].label || args[0].location || args[0].locationLabel || "";
    } else if (args.length === 1 && typeof args[0] === "object") {
      lat = Number(args[0]?.lat);
      lng = Number(args[0]?.lng);
      locationLabel =
        args[0]?.label || args[0]?.location || args[0]?.locationLabel || "";
    } else if (args.length >= 3) {
      locationLabel = args[0];
      lat = Number(args[1]);
      lng = Number(args[2]);
    } else if (args.length >= 2) {
      lat = Number(args[0]);
      lng = Number(args[1]);
    }

    return {
      locationLabel: sanitizeText(locationLabel),
      lat,
      lng,
    };
  };

  const flyTo = (lat, lng, zoom = 17) => {
    if (
      lat === null ||
      lng === null ||
      lat === undefined ||
      lng === undefined
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("emap:flyTo", {
        detail: { lat, lng, zoom },
      })
    );
  };

  const handleMapSelectLocation = useCallback(
    (...args) => {
      const { locationLabel, lat, lng } = normalizeMapArgs(...args);

      if (lat === null || lng === null || Number.isNaN(lat) || Number.isNaN(lng))
        return;

      if (pickMode) {
        setFormData((prev) => ({
          ...prev,
          location: locationLabel || prev.location,
          latitude: lat,
          longitude: lng,
        }));
        setPickMode(false);
        setShowAddForm(true);
        flyTo(lat, lng, 18);
        pushNotification(
          "Location selected. Complete the form and save the area.",
          "success"
        );
      }
    },
    [pickMode, pushNotification]
  );

  useEffect(() => {
    if (!selectedPlace) return;

    const lat = Number(selectedPlace.latitude);
    const lng = Number(selectedPlace.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    flyTo(lat, lng, 17);
  }, [selectedId, selectedPlace]);

  const validateForm = () => {
    if (!sanitizeText(formData.name)) {
      pushNotification("Evacuation area name is required.", "error");
      return false;
    }

    if (!sanitizeText(formData.location)) {
      pushNotification("Location is required.", "error");
      return false;
    }

    if (!formData.barangayId && !sanitizeText(formData.barangayName)) {
      pushNotification("Barangay is required.", "error");
      return false;
    }

    if (formData.latitude === null || formData.longitude === null) {
      pushNotification("Latitude and longitude are required.", "error");
      return false;
    }

    if (Number(formData.latitude) < -90 || Number(formData.latitude) > 90) {
      pushNotification("Latitude must be between -90 and 90.", "error");
      return false;
    }

    if (Number(formData.longitude) < -180 || Number(formData.longitude) > 180) {
      pushNotification("Longitude must be between -180 and 180.", "error");
      return false;
    }

    return true;
  };

  const buildPayload = () => {
    const barangayRecord =
      barangays.find(
        (item) =>
          String(item._id) === String(formData.barangayId) ||
          normalizeBarangayKey(item.name) ===
            normalizeBarangayKey(formData.barangayName)
      ) || null;

    const finalBarangayId =
      formData.barangayId || barangayRecord?._id || localUserId || "";
    const finalBarangayName =
      formData.barangayName || barangayRecord?.name || localBarangayName || "";

    return {
      name: sanitizeText(formData.name),
      location: sanitizeText(formData.location),
      barangayId: finalBarangayId,
      barangayName: sanitizeText(finalBarangayName),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      capacityIndividual: numberOrZero(formData.capacityIndividual),
      capacityFamily: numberOrZero(formData.capacityFamily),
      bedCapacity: numberOrZero(formData.bedCapacity),
      floorArea: numberOrZero(formData.floorArea),
      femaleCR: Boolean(formData.femaleCR),
      maleCR: Boolean(formData.maleCR),
      commonCR: Boolean(formData.commonCR),
      potableWater: Boolean(formData.potableWater),
      nonPotableWater: Boolean(formData.nonPotableWater),
      isPermanent: Boolean(formData.isPermanent),
      isCovidFacility: Boolean(formData.isCovidFacility),
      showOnLanding: Boolean(formData.showOnLanding),
      remarks: sanitizeText(formData.remarks),
    };
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingSave(true);
    try {
      await axios.post(`${BASE_URL}/evacs/make`, buildPayload(), {
        withCredentials: true,
      });

      resetForm();
      setShowAddForm(false);
      setPickMode(false);
      await fetchAllData();
      pushNotification("Evacuation area added successfully.", "success");
    } catch (error) {
      console.error("Add place error:", error);
      pushNotification(
        error?.response?.data?.message || "Failed to add evacuation area.",
        "error"
      );
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedPlace) return;
    if (!validateForm()) return;

    setLoadingSave(true);
    try {
      await axios.put(`${BASE_URL}/evacs/${selectedPlace._id}`, buildPayload(), {
        withCredentials: true,
      });

      resetForm();
      setShowEditForm(false);
      await fetchAllData();
      pushNotification("Evacuation area updated successfully.", "success");
    } catch (error) {
      console.error("Edit place error:", error);
      pushNotification(
        error?.response?.data?.message || "Failed to update evacuation area.",
        "error"
      );
    } finally {
      setLoadingSave(false);
    }
  };

  const handleArchivePlace = async () => {
    if (!selectedPlace) return;

    setLoadingSave(true);
    try {
      await axios.delete(`${BASE_URL}/evacs/${selectedPlace._id}`, {
        withCredentials: true,
      });

      setShowArchiveConfirm(false);
      setSelectedId(null);
      setPanelView("areas");
      await fetchAllData();
      pushNotification("Evacuation area archived successfully.", "success");
    } catch (error) {
      console.error("Archive place error:", error);
      pushNotification(
        error?.response?.data?.message || "Failed to archive evacuation area.",
        "error"
      );
    } finally {
      setLoadingSave(false);
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedPlace) return;
    if (safeLower(selectedPlace.capacityStatus) === safeLower(status)) return;

    try {
      await axios.put(
        `${BASE_URL}/evacs/${selectedPlace._id}/status`,
        { capacityStatus: status },
        { withCredentials: true }
      );

      await fetchAllData();
      pushNotification(`Status updated to ${status}.`, "success");
    } catch (error) {
      console.error("Update status error:", error);
      pushNotification(
        error?.response?.data?.message || "Failed to update status.",
        "error"
      );
    }
  };

  const handleLandingVisibilityToggle = async () => {
    if (!selectedPlace || !isPrivilegedOps) return;

    setLandingToggleLoading(true);
    try {
      const nextValue = !Boolean(selectedPlace.showOnLanding);

      await axios.put(
        `${BASE_URL}/evacs/${selectedPlace._id}/landing-visibility`,
        { showOnLanding: nextValue },
        { withCredentials: true }
      );

      await fetchAllData();
      pushNotification(
        nextValue
          ? "Selected evacuation area is now visible on the public page."
          : "Selected evacuation area was hidden from the public page.",
        "success"
      );
    } catch (error) {
      console.error("Update landing visibility error:", error);
      pushNotification(
        error?.response?.data?.message ||
          "Failed to update landing page visibility.",
        "error"
      );
    } finally {
      setLandingToggleLoading(false);
    }
  };

  const handleShowAllOnLanding = async () => {
    if (!isPrivilegedOps || !allPlaces.length) return;

    const hiddenPlaces = allPlaces.filter((item) => item.showOnLanding === false);

    if (!hiddenPlaces.length) {
      pushNotification(
        "All evacuation areas are already shown on the public page.",
        "info"
      );
      return;
    }

    setBulkLandingLoading(true);
    try {
      await Promise.all(
        hiddenPlaces.map((place) =>
          axios.put(
            `${BASE_URL}/evacs/${place._id}/landing-visibility`,
            { showOnLanding: true },
            { withCredentials: true }
          )
        )
      );

      await fetchAllData();
      pushNotification(
        "All evacuation areas are now shown on the public page.",
        "success"
      );
    } catch (error) {
      console.error("Bulk landing visibility error:", error);
      pushNotification(
        error?.response?.data?.message ||
          "Failed to show all evacuation areas on the public page.",
        "error"
      );
    } finally {
      setBulkLandingLoading(false);
    }
  };

  const facilityItems = useMemo(() => {
    if (!selectedPlace) return [];

    return [
      { label: "Female CR", value: !!selectedPlace.femaleCR },
      { label: "Male CR", value: !!selectedPlace.maleCR },
      { label: "Common CR", value: !!selectedPlace.commonCR },
      { label: "Potable Water", value: !!selectedPlace.potableWater },
      { label: "Non-potable Water", value: !!selectedPlace.nonPotableWater },
      { label: "Permanent Facility", value: !!selectedPlace.isPermanent },
      { label: "COVID Facility", value: !!selectedPlace.isCovidFacility },
    ];
  }, [selectedPlace]);

  const renderPlaceModal = (modeType) => {
    const isEdit = modeType === "edit";
    const onSubmit = isEdit ? handleSubmitEdit : handleSubmitAdd;
    const isOpen = isEdit ? showEditForm : showAddForm;
    const title = isEdit ? "Edit Evacuation Area" : "Add Evacuation Area";

    if (!isOpen) return null;

    return createPortal(
      <div
        className="evac-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={() => {
          if (isEdit) setShowEditForm(false);
          else setShowAddForm(false);
        }}
      >
        <div className="evac-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="evac-modal-header">
            <div>
              <h3>{title}</h3>
              <p>
                {isEdit
                  ? "Update the selected evacuation area details."
                  : "Create a new evacuation area and pin it on the map."}
              </p>
            </div>
            <button
              type="button"
              className="evac-modal-close"
              onClick={() => {
                if (isEdit) setShowEditForm(false);
                else setShowAddForm(false);
              }}
            >
              ✕
            </button>
          </div>

          <form className="evac-modal-form" onSubmit={onSubmit}>
            <div className="evac-form-grid">
              <div className="evac-form-section">
                <div className="section-title">Basic Information</div>

                <label className="field">
                  <span>Evacuation Area Name</span>
                  <input
                    ref={nameRef}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleTextFieldChange}
                    autoComplete="off"
                  />
                </label>

                <label className="field">
                  <span>Location</span>
                  <textarea
                    name="location"
                    rows={2}
                    value={formData.location}
                    onChange={handleTextFieldChange}
                    autoComplete="off"
                  />
                </label>

                <label className="field">
                  <span>Barangay</span>
                  {isBarangayRole ? (
                    <input
                      type="text"
                      value={
                        formData.barangayName ||
                        resolveOwnBarangay()?.name ||
                        me?.barangayName ||
                        localBarangayName ||
                        ""
                      }
                      readOnly
                    />
                  ) : (
                    <select
                      value={formData.barangayId}
                      onChange={(e) => {
                        const record =
                          barangays.find(
                            (item) => String(item._id) === String(e.target.value)
                          ) || null;

                        setFormData((prev) => ({
                          ...prev,
                          barangayId: record?._id || "",
                          barangayName: record?.name || "",
                        }));
                      }}
                    >
                      <option value="">Select barangay</option>
                      {barangays.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  )}
                </label>

                <div className="inline-field-row two">
                  <label className="field">
                    <span>Latitude</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude ?? ""}
                      onChange={handleLatitudeChange}
                    />
                  </label>

                  <label className="field">
                    <span>Longitude</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude ?? ""}
                      onChange={handleLongitudeChange}
                    />
                  </label>
                </div>
              </div>

              <div className="evac-form-section">
                <div className="section-title">Capacity</div>

                <div className="inline-field-row three">
                  <label className="field">
                    <span>Individual</span>
                    <input
                      type="text"
                      name="capacityIndividual"
                      value={formData.capacityIndividual}
                      onChange={handleNumericFieldChange}
                    />
                  </label>

                  <label className="field">
                    <span>Family</span>
                    <input
                      type="text"
                      name="capacityFamily"
                      value={formData.capacityFamily}
                      onChange={handleNumericFieldChange}
                    />
                  </label>

                  <label className="field">
                    <span>Beds</span>
                    <input
                      type="text"
                      name="bedCapacity"
                      value={formData.bedCapacity}
                      onChange={handleNumericFieldChange}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Floor Area</span>
                  <input
                    type="text"
                    name="floorArea"
                    value={formData.floorArea}
                    onChange={handleNumericFieldChange}
                  />
                </label>

                <label className="field">
                  <span>Remarks</span>
                  <textarea
                    name="remarks"
                    rows={5}
                    value={formData.remarks}
                    onChange={handleTextFieldChange}
                    placeholder="Add notes about the evacuation area"
                  />
                </label>
              </div>

              <div className="evac-form-section">
                <div className="section-title">Facilities</div>

                <div className="checkbox-grid">
                  {[
                    ["femaleCR", "Female CR"],
                    ["maleCR", "Male CR"],
                    ["commonCR", "Common CR"],
                    ["potableWater", "Potable Water"],
                    ["nonPotableWater", "Non-potable Water"],
                    ["isPermanent", "Permanent Facility"],
                    ["isCovidFacility", "COVID Facility"],
                  ].map(([key, label]) => (
                    <label key={key} className="check-chip">
                      <input
                        type="checkbox"
                        checked={Boolean(formData[key])}
                        onChange={(e) =>
                          updateFormField(key, e.target.checked)
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                {!isBarangayRole && (
                  <label className="check-chip single-toggle">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.showOnLanding)}
                      onChange={(e) =>
                        updateFormField("showOnLanding", e.target.checked)
                      }
                    />
                    <span>Show on public page</span>
                  </label>
                )}
              </div>
            </div>

            <div className="evac-modal-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  if (isEdit) setShowEditForm(false);
                  else setShowAddForm(false);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={loadingSave}
              >
                {loadingSave ? "Saving..." : isEdit ? "Save Changes" : "Save Area"}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderArchiveConfirm = () => {
    if (!showArchiveConfirm || !selectedPlace) return null;

    return createPortal(
      <div
        className="evac-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Archive evacuation area"
        onClick={() => setShowArchiveConfirm(false)}
      >
        <div
          className="evac-modal-card confirm-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="evac-modal-header">
            <div>
              <h3>Archive Evacuation Area</h3>
              <p>
                This will archive <strong>{selectedPlace.name}</strong>.
              </p>
            </div>
            <button
              type="button"
              className="evac-modal-close"
              onClick={() => setShowArchiveConfirm(false)}
            >
              ✕
            </button>
          </div>

          <div className="confirm-copy">
            Archived evacuation areas will no longer appear in the active list.
          </div>

          <div className="evac-modal-actions">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowArchiveConfirm(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="danger-btn"
              onClick={handleArchivePlace}
              disabled={loadingSave}
            >
              {loadingSave ? "Archiving..." : "Archive"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  if (loadingPage) {
    return (
      <DashboardShell>
        <div className="evac-dashboard-page">
          <div className="empty-state-card">Loading evacuation management...</div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div
        className={`evac-dashboard-page ${
          isBarangayRole ? "barangay-mode-page" : ""
        }`}
      >
                <div
          className={`notification-stack ${pickMode ? "pick-mode-offset" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {visibleNotifications.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`notification-toast ${item.type || "success"}`}
              onClick={() => dismissNotification(item.id)}
              title="Dismiss notification"
            >
              <span className="notification-icon" aria-hidden="true">
                {getNotificationIcon(item.type)}
              </span>

              <span className="notification-text">
                {item.message}
              </span>
            </button>
          ))}
        </div>

        <section className="evac-dashboard-header">
          <div className="evac-dashboard-heading">
            <div className="eyebrow">Operations</div>
            <h1>Evacuation Management</h1>
          </div>

          <div className="evac-dashboard-actions">
            {!isBarangayRole && (
              <button
                type="button"
                className="ghost-btn public-toggle-header-btn bulk-public-btn"
                onClick={handleShowAllOnLanding}
                disabled={bulkLandingLoading || !isPrivilegedOps || !allPlaces.length}
                title="Show all evacuation areas on public landing page"
              >
                {bulkLandingLoading ? "Showing All..." : "Show All Public"}
              </button>
            )}

            {!isBarangayRole && (
              <button
                type="button"
                className={`ghost-btn public-toggle-header-btn ${
                  selectedPlace?.showOnLanding === false ? "is-off" : "is-on"
                }`}
                onClick={handleLandingVisibilityToggle}
                disabled={!selectedPlace || landingToggleLoading || !isPrivilegedOps}
                title={
                  !selectedPlace
                    ? "Select an evacuation area first"
                    : selectedPlace?.showOnLanding === false
                    ? "Show selected area on public page"
                    : "Hide selected area from public page"
                }
              >
                {landingToggleLoading
                  ? "Saving..."
                  : !selectedPlace
                  ? "Selected Public"
                  : selectedPlace?.showOnLanding === false
                  ? "Show Selected"
                  : "Hide Selected"}
              </button>
            )}

            {isPrivilegedOps && (
              <button
                type="button"
                className="primary-btn"
                onClick={handleStartPick}
                disabled={pickMode}
              >
                {pickMode ? "Pick Mode Active" : "Add Area"}
              </button>
            )}
          </div>
        </section>

        {!!warningInsights.length && (
          <section className="warning-stack">
            {warningInsights.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className={`warning-banner ${item.tone}`}
              >
                <div className="warning-banner-title">{item.title}</div>
                <div className="warning-banner-text">{item.text}</div>
              </div>
            ))}
          </section>
        )}

        <section className="evac-summary-grid-six">
          <div className="summary-card accent">
            <div className="summary-label">Evacuation Areas</div>
            <div className="summary-value">
              {formatNumber(
                barangayFilter === "all" || isBarangayRole
                  ? overallSummary.totalPlaces
                  : effectiveAnalytics.totalPlaces
              )}
            </div>
            <div className="summary-sub">Tracked active areas</div>
          </div>

          <div className="summary-card success">
            <div className="summary-label">Available</div>
            <div className="summary-value">
              {formatNumber(
                barangayFilter === "all" || isBarangayRole
                  ? overallSummary.availableCount
                  : effectiveAnalytics.availableCount
              )}
            </div>
            <div className="summary-sub">Ready for use</div>
          </div>

          <div className="summary-card warning">
            <div className="summary-label">Limited</div>
            <div className="summary-value">
              {formatNumber(
                barangayFilter === "all" || isBarangayRole
                  ? overallSummary.limitedCount
                  : effectiveAnalytics.limitedCount
              )}
            </div>
            <div className="summary-sub">Needs monitoring</div>
          </div>

          <div className="summary-card danger">
            <div className="summary-label">Full</div>
            <div className="summary-value">
              {formatNumber(
                barangayFilter === "all" || isBarangayRole
                  ? overallSummary.fullCount
                  : effectiveAnalytics.fullCount
              )}
            </div>
            <div className="summary-sub">At capacity</div>
          </div>

          <div className="summary-card muted">
            <div className="summary-label">Family Capacity</div>
            <div className="summary-value">
              {formatNumber(
                barangayFilter === "all" || isBarangayRole
                  ? overallSummary.totalFamilyCapacity
                  : effectiveAnalytics.totalFamilyCapacity
              )}
            </div>
            <div className="summary-sub">Total family slots</div>
          </div>

          <div className="summary-card muted">
            <div className="summary-label">Beds</div>
            <div className="summary-value">
              {formatNumber(
                barangayFilter === "all" || isBarangayRole
                  ? overallSummary.totalBedCapacity
                  : effectiveAnalytics.totalBedCapacity
              )}
            </div>
            <div className="summary-sub">Total bed count</div>
          </div>
        </section>

        <section
          className={`evac-top-filters ${isBarangayRole ? "barangay-mode" : ""}`}
        >
          <label className="filter-field">
            <span>Search</span>
            <input
              type="text"
              placeholder="Search area, location, barangay, or remarks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          {!isBarangayRole && (
            <label className="filter-field">
              <span>Barangay</span>
              <select
                value={barangayFilter}
                onChange={(e) => handleBarangaySelect(e.target.value)}
              >
                <option value="all">All Barangays</option>
                {barangayCards.map((item) => (
                  <option key={item.barangayName} value={item.barangayName}>
                    {item.barangayName}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="filter-field">
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSelectedId(null);
                setPanelView("areas");
              }}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
            </select>
          </label>

          <label className="filter-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="capacity">Capacity</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              {!isBarangayRole && <option value="barangay">Barangay</option>}
            </select>
          </label>
        </section>

        <section
          className={`evac-main-layout ${isBarangayRole ? "barangay-layout" : ""}`}
        >
          {!isBarangayRole && (
            <aside className="evac-left-panel">
              <div className="panel-head">
                <div>
                  <h2>Barangay Overview</h2>
                  <p>Select a barangay first, then review its evacuation areas.</p>
                </div>
              </div>

              <div className="barangay-list scroll-panel">
                <button
                  type="button"
                  className={`barangay-card ${
                    barangayFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => handleBarangaySelect("all")}
                >
                  <div className="barangay-card-top">
                    <strong>All Barangays</strong>
                    <span>{formatNumber(overallSummary.totalPlaces)} areas</span>
                  </div>

                  <div className="barangay-card-statuses barangay-card-statuses-compact">
                    <span className="mini-status available">
                      {formatNumber(overallSummary.availableCount)} available
                    </span>
                    <span className="mini-status limited">
                      {formatNumber(overallSummary.limitedCount)} limited
                    </span>
                    <span className="mini-status full">
                      {formatNumber(overallSummary.fullCount)} full
                    </span>
                  </div>
                </button>

                {barangayCards.map((item) => (
                  <button
                    type="button"
                    key={item.barangayName}
                    className={`barangay-card ${
                      normalizeBarangayKey(barangayFilter) ===
                      normalizeBarangayKey(item.barangayName)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleBarangaySelect(item.barangayName)}
                  >
                    <div className="barangay-card-top">
                      <strong>{item.barangayName}</strong>
                      <span>{formatNumber(item.placesCount)} areas</span>
                    </div>

                    <div className="barangay-card-statuses barangay-card-statuses-compact">
                      <span className="mini-status available">
                        {formatNumber(item.availableCount)} available
                      </span>
                      <span className="mini-status limited">
                        {formatNumber(item.limitedCount)} limited
                      </span>
                      <span className="mini-status full">
                        {formatNumber(item.fullCount)} full
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          )}

          <section className="evac-map-panel">
            <div className="panel-head compact">
              <div>
                <h2>Evacuation Map</h2>
                <p>
                  {pickMode
                    ? "Pick a location on the map or cancel pick mode."
                    : selectedPlace
                    ? "Selected evacuation area is highlighted on the map."
                    : "Browse and select an evacuation area."}
                </p>
              </div>

              <div className="map-panel-actions">
                {isPrivilegedOps && !pickMode && (
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={handleStartPick}
                  >
                    Pick on Map
                  </button>
                )}

                {isPrivilegedOps && pickMode && (
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={cancelPickMode}
                  >
                    Cancel Pick
                  </button>
                )}
              </div>
            </div>

            <div className="map-stage">
              {pickMode && (
                <div className="pick-mode-banner">
                  Pick mode is active. Click anywhere on the map to capture the
                  evacuation area location.
                </div>
              )}

              <EvacMap
                places={filteredPlaces}
                selectedPlaceId={selectedId}
                onSelectLocation={handleMapSelectLocation}
                onSelectPlace={(place) => {
                  if (!place?._id) return;
                  setSelectedId(place._id);
                  setPanelView("details");
                }}
                pickMode={pickMode}
              />

              <MapLegend />

              {isPrivilegedOps && !pickMode && (
                <button
                  type="button"
                  className="map-add-place-floating"
                  onClick={handleStartPick}
                >
                  <div className="map-add-place-icon">+</div>
                  <div className="map-add-place-content">
                    <div className="map-add-place-title">Add Evacuation Area</div>
                    <div className="map-add-place-sub">
                      Start by pinning the location on the map.
                    </div>
                  </div>
                </button>
              )}

              {isPrivilegedOps && pickMode && (
                <button
                  type="button"
                  className="map-cancel-pick-floating"
                  onClick={cancelPickMode}
                >
                  Cancel Pick
                </button>
              )}
            </div>
          </section>

          <aside className="evac-right-panel">
            <div className="side-panel-sticky-head">
              <div className="side-panel-tabs">
                <button
                  type="button"
                  className={`tab-btn ${panelView === "areas" ? "active" : ""}`}
                  onClick={() => setPanelView("areas")}
                >
                  Areas
                </button>
                <button
                  type="button"
                  className={`tab-btn ${panelView === "details" ? "active" : ""}`}
                  onClick={() => setPanelView("details")}
                  disabled={!selectedPlace}
                >
                  Details
                </button>
                <button
                  type="button"
                  className={`tab-btn ${panelView === "history" ? "active" : ""}`}
                  onClick={() => setPanelView("history")}
                >
                  History
                </button>
              </div>
            </div>

            <div className="side-panel-body">
              {panelView === "areas" && (
                <div className="side-block">
                  <div className="side-block-header">
                    <h3>
                      {isBarangayRole
                        ? "Evacuation Areas"
                        : barangayFilter === "all"
                        ? "All Evacuation Areas"
                        : `${selectedBarangayName || barangayFilter} Areas`}
                    </h3>
                    <span>{formatNumber(filteredPlaces.length)} results</span>
                  </div>

                  <div className="place-list expanded">
                    {!filteredPlaces.length && (
                      <div className="empty-state-card">
                        No evacuation areas match the current filters.
                      </div>
                    )}

                    {filteredPlaces.map((place) => (
                      <button
                        type="button"
                        key={place._id}
                        className={`place-card ${
                          String(selectedId) === String(place._id) ? "selected" : ""
                        }`}
                        onClick={() => {
                          setSelectedId(place._id);
                          setPanelView("details");
                        }}
                      >
                        <div className="place-card-top">
                          <div>
                            <div className="place-card-title">{place.name}</div>
                            <div className="place-card-subtitle">
                              {place.location || "-"}
                            </div>
                          </div>

                          <div className="place-badge-stack">
                            <span className={`status-pill ${getStatusClass(place.capacityStatus)}`}>
                              {place.capacityStatus || "Full"}
                            </span>
                            {!isBarangayRole && (
                              <span className="mini-neutral-badge">
                                {place.barangayName || "-"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="place-card-meta">
                          <span>
                            Families: {formatNumber(place.capacityFamily || 0)}
                          </span>
                          <span>
                            Beds: {formatNumber(place.bedCapacity || 0)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {panelView === "details" && (
                <>
                  {!selectedPlace ? (
                    <div className="empty-state-card">
                      Select an evacuation area first to view its details.
                    </div>
                  ) : (
                    <div className="details-stack">
                      <div className="side-block details-overview-block">
                        <div className="details-hero refined">
                          <div className="details-hero-main">
                            <div className="details-hero-eyebrow">
                              Evacuation Area
                            </div>
                            <h3>{selectedPlace.name}</h3>
                            <div className="place-card-subtitle">
                              {selectedPlace.location || "-"}
                            </div>
                          </div>

                          <div className="details-hero-badges">
                            <span
                              className={`status-pill ${getStatusClass(
                                selectedPlace.capacityStatus
                              )}`}
                            >
                              {selectedPlace.capacityStatus || "Full"}
                            </span>

                            {!isBarangayRole && (
                              <span
                                className={`landing-visibility-badge ${
                                  selectedPlace.showOnLanding === false
                                    ? "hidden"
                                    : "visible"
                                }`}
                              >
                                {selectedPlace.showOnLanding === false
                                  ? "Hidden from Public"
                                  : "Shown on Public"}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="side-panel-body">
                          <div className="details-kpi-grid">
                            <div className="detail-kpi-card">
                              <span>Individual</span>
                              <strong>
                                {formatNumber(selectedPlace.capacityIndividual || 0)}
                              </strong>
                            </div>
                            <div className="detail-kpi-card">
                              <span>Family</span>
                              <strong>
                                {formatNumber(selectedPlace.capacityFamily || 0)}
                              </strong>
                            </div>
                            <div className="detail-kpi-card">
                              <span>Beds</span>
                              <strong>
                                {formatNumber(selectedPlace.bedCapacity || 0)}
                              </strong>
                            </div>
                            <div className="detail-kpi-card">
                              <span>Floor Area</span>
                              <strong>
                                {formatNumber(selectedPlace.floorArea || 0)}
                              </strong>
                            </div>
                          </div>

                          <div className="details-ops-grid">
                            <div className="ops-card">
                              <div className="ops-card-title">Status</div>
                              <div className="status-action-grid">
                                {["available", "limited", "full"].map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    className={`status-action-btn ${status} ${
                                      safeLower(selectedPlace.capacityStatus) === status
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={() => handleStatusChange(status)}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {!isBarangayRole && (
                              <div className="ops-card">
                                <div className="ops-card-title">Public Page</div>
                                <div className="landing-toggle-row">
                                  <div className="landing-toggle-copy">
                                    <strong>Selected area visibility</strong>
                                    <span>
                                      Keep this manual control even when all areas are
                                      shown on the public page.
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    className={`landing-toggle-btn ${
                                      selectedPlace.showOnLanding === false
                                        ? "off"
                                        : "on"
                                    }`}
                                    onClick={handleLandingVisibilityToggle}
                                    disabled={landingToggleLoading}
                                  >
                                    {landingToggleLoading
                                      ? "Saving..."
                                      : selectedPlace.showOnLanding === false
                                      ? "Show"
                                      : "Hide"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="side-block">
                            <div className="side-block-header">
                              <h3>Facilities</h3>
                            </div>

                            <div className="facility-chip-group">
                              {facilityItems.map((item) => (
                                <span
                                  key={item.label}
                                  className={`facility-chip ${
                                    item.value ? "active" : "inactive"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="details-two-grid refined-two-grid">
                            <div className="meta-card">
                              <div className="side-block-header">
                                <h3>Information</h3>
                              </div>

                              <div className="meta-list">
                                <div className="meta-row">
                                  <span>Barangay</span>
                                  <strong>{selectedPlace.barangayName || "-"}</strong>
                                </div>
                                <div className="meta-row">
                                  <span>Latitude</span>
                                  <strong>{selectedPlace.latitude ?? "-"}</strong>
                                </div>
                                <div className="meta-row">
                                  <span>Longitude</span>
                                  <strong>{selectedPlace.longitude ?? "-"}</strong>
                                </div>
                              </div>
                            </div>

                            <div className="meta-card">
                              <div className="side-block-header">
                                <h3>Remarks</h3>
                              </div>

                              <div className="remarks-box">
                                {selectedPlace.remarks ? (
                                  <p>{selectedPlace.remarks}</p>
                                ) : (
                                  <span className="remarks-empty">
                                    No remarks provided.
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {isPrivilegedOps && (
                            <div className="details-actions refined-actions">
                              <button
                                type="button"
                                className="ghost-btn"
                                onClick={openEditModal}
                              >
                                Edit Area
                              </button>
                              <button
                                type="button"
                                className="danger-btn"
                                onClick={() => setShowArchiveConfirm(true)}
                              >
                                Archive
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {panelView === "history" && (
                <div className="side-block">
                  <div className="side-block-header">
                    <h3>{selectedPlace ? `${selectedPlace.name} History` : "Activity History"}</h3>
                    <span>
                      {formatNumber(
                        selectedPlace ? selectedPlaceHistory.length : history.length
                      )}{" "}
                      logs
                    </span>
                  </div>

                  <div className="history-list">
                    {(selectedPlace ? recentSelectedPlaceHistory : history).length === 0 && (
                      <div className="empty-state-card">No history available.</div>
                    )}

                    {(selectedPlace ? recentSelectedPlaceHistory : history).map(
                      (item, index) => (
                        <div
                          key={`${item._id || item.createdAt || index}`}
                          className={`history-card ${getHistoryAccentClass(
                            item.action
                          )}`}
                        >
                          <div className="history-card-top">
                            <strong>{item.action || "Activity"}</strong>
                            <span>{formatDateTime(item.createdAt)}</span>
                          </div>
                          <div className="history-card-body">
                            <div>{item.placeName || selectedPlace?.name || "-"}</div>
                            {item.details && <p>{item.details}</p>}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>

        {renderPlaceModal("add")}
        {renderPlaceModal("edit")}
        {renderArchiveConfirm()}
      </div>
    </DashboardShell>
  );
}