import React, { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
=======
import { useLocation, useNavigate } from "react-router-dom";
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../css/Inventory.css";
import DashboardShell from "../layout/DashboardShell";

const BASE_URL =
  process.env.REACT_APP_API_URL || "https://gaganadapat.onrender.com";

<<<<<<< HEAD
export default function Inventory() {
  const { user } = useAuth();
  const role = user?.role || "";
  const canSeeCentralInventory = role === "admin" || role === "drrmo";

  const [inventory, setInventory] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [error, setError] = useState("");

=======
const TABLE_PAGE_SIZE = 8;
const ARCHIVE_PAGE_SIZE = 10;
const RELEASE_CATALOG_PAGE_SIZE = 8;
const TEMPLATE_PAGE_SIZE = 6;

export default function Inventory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || "";
  const canSeeCentralInventory = role === "admin" || role === "drrmo";
  const canRelease = role === "drrmo";
  const canManageTemplates = role === "admin" || role === "drrmo";

  const [activeItems, setActiveItems] = useState([]);
  const [archivedItems, setArchivedItems] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [foodPackTemplates, setFoodPackTemplates] = useState([]);

  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [loadingReleaseQueue, setLoadingReleaseQueue] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [releaseSubmitting, setReleaseSubmitting] = useState(false);
  const [templateSubmitting, setTemplateSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [releaseError, setReleaseError] = useState("");
  const [releaseSuccess, setReleaseSuccess] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [templateSuccess, setTemplateSuccess] = useState("");

  const [mode, setMode] = useState("active");
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const [viewType, setViewType] = useState("goods");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

<<<<<<< HEAD
  const [requestSearch, setRequestSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [releaseRemarks, setReleaseRemarks] = useState("");
  const [releaseInputs, setReleaseInputs] = useState({});
  const [releaseItems, setReleaseItems] = useState([]);

  const [barangayStock, setBarangayStock] = useState([]);
  const [activeTab, setActiveTab] = useState("storage");

  const [evacPlaces, setEvacPlaces] = useState([]);
  const [selectedEvac, setSelectedEvac] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [selectedStockId, setSelectedStockId] = useState(null);

  const normalize = (val) => (val || "").toString().toLowerCase();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/inventory`, {
        withCredentials: true,
      });
      setInventory(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch inventory.");
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get(
        `${BASE_URL}/api/relief-releases/approved-requests`,
        {
          withCredentials: true,
        }
      );
      setApprovedRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch approved requests:", err);
      setApprovedRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchBarangayStock = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/barangay-stock`, {
        withCredentials: true,
      });
      setBarangayStock(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Stock fetch error:", err);
      setBarangayStock([]);
    }
  };

  const fetchEvacPlaces = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/evacs`, {
        withCredentials: true,
      });
      setEvacPlaces(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Evac fetch error:", err);
      setEvacPlaces([]);
    }
  };

  useEffect(() => {
    if (canSeeCentralInventory) {
      setActiveTab("inventory");
    } else {
      setActiveTab("storage");
    }
  }, [canSeeCentralInventory]);

  useEffect(() => {
    fetchBarangayStock();
    fetchEvacPlaces();

    if (canSeeCentralInventory) {
      fetchInventory();
      fetchApprovedRequests();
    } else {
      setInventory([]);
      setApprovedRequests([]);
      setSelectedRequestId("");
      setReleaseItems([]);
      setReleaseInputs({});
      setReleaseRemarks("");
      setError("");
      setLoading(false);
      setLoadingRequests(false);
    }
  }, [canSeeCentralInventory]);

  const goodsInventory = useMemo(() => {
    return inventory.filter((item) => normalize(item.type) === "goods");
  }, [inventory]);

  const monetaryInventory = useMemo(() => {
    return inventory.filter((item) => normalize(item.type) === "monetary");
  }, [inventory]);

  const currentInventory =
    viewType === "goods" ? goodsInventory : monetaryInventory;

  const filteredInventory = useMemo(() => {
    return currentInventory.filter((item) => {
      const matchesSearch =
        normalize(item.name).includes(normalize(search)) ||
        normalize(item.category).includes(normalize(search)) ||
        normalize(item.description).includes(normalize(search)) ||
        normalize(item.sourceType).includes(normalize(search)) ||
        normalize(item.sourceName).includes(normalize(search)) ||
        normalize(item.addedBy).includes(normalize(search)) ||
        normalize(item.unit).includes(normalize(search));

      const matchesCategory =
        viewType !== "goods" || !categoryFilter
          ? true
          : normalize(item.category) === normalize(categoryFilter);

      const matchesSourceType = sourceTypeFilter
        ? normalize(item.sourceType) === normalize(sourceTypeFilter)
        : true;

      return matchesSearch && matchesCategory && matchesSourceType;
    });
  }, [currentInventory, search, categoryFilter, sourceTypeFilter, viewType]);

  const sortFunction = (a, b) => {
=======
  const [selectedItem, setSelectedItem] = useState(null);
  const [tablePage, setTablePage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);
  const [releaseCatalogPage, setReleaseCatalogPage] = useState(1);

  const [operationsOpen, setOperationsOpen] = useState(false);

  const [plannerOpen, setPlannerOpen] = useState(false);
  const [selectedReleaseRequestId, setSelectedReleaseRequestId] = useState("");
  const [releaseMode, setReleaseMode] = useState("manual");
  const [releaseRemarks, setReleaseRemarks] = useState("");
  const [isFinalRelease, setIsFinalRelease] = useState(false);

  const [manualReleaseSearch, setManualReleaseSearch] = useState("");
  const [manualSelections, setManualSelections] = useState([]);
  const [manualFoodPacksEquivalent, setManualFoodPacksEquivalent] = useState("");

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [foodPacksToRelease, setFoodPacksToRelease] = useState("");

  // Template management
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateBuilderSearch, setTemplateBuilderSearch] = useState("");
  const [templateItems, setTemplateItems] = useState([]);
  const [selectedTemplateCardId, setSelectedTemplateCardId] = useState("");
  const [templatePage, setTemplatePage] = useState(1);

  // Release queue filtering
  const [releaseBarangayFilter, setReleaseBarangayFilter] = useState("");

  // Inventory display mode
  const [goodsDisplayMode, setGoodsDisplayMode] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState({});

  const normalize = (val) => (val || "").toString().trim().toLowerCase();

const buildGoodsMergeKey = (item = {}) =>
  [normalize(item.name), normalize(item.category), normalize(item.unit)].join("||");

const fetchActiveInventory = async () => {
  try {
    setLoadingActive(true);
    const res = await axios.get(`${BASE_URL}/api/inventory`, {
      withCredentials: true,
    });
    setActiveItems(Array.isArray(res.data) ? res.data : []);
    setError("");
  } catch (err) {
    console.error("Fetch active inventory error:", err);
    setActiveItems([]);
    setError("Failed to fetch active inventory.");
  } finally {
    setLoadingActive(false);
  }
};

const fetchArchivedInventory = async () => {
  try {
    setLoadingArchived(true);
    const res = await axios.get(`${BASE_URL}/api/inventory/archived`, {
      withCredentials: true,
    });
    setArchivedItems(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Fetch archived inventory error:", err);
    setArchivedItems([]);
  } finally {
    setLoadingArchived(false);
  }
};

const fetchApprovedRequests = async () => {
  if (!canRelease) {
    setApprovedRequests([]);
    return;
  }

  try {
    setLoadingReleaseQueue(true);
    const res = await axios.get(
      `${BASE_URL}/api/relief-releases/approved-requests`,
      {
        withCredentials: true,
      }
    );
    setApprovedRequests(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("Fetch approved requests error:", err);
    setApprovedRequests([]);
  } finally {
    setLoadingReleaseQueue(false);
  }
};

const fetchFoodPackTemplates = async () => {
  if (!canManageTemplates && !canRelease) {
    setFoodPackTemplates([]);
    return;
  }

  try {
    setLoadingTemplates(true);
    const res = await axios.get(`${BASE_URL}/api/food-pack-templates`, {
      withCredentials: true,
    });
    const incoming = Array.isArray(res.data) ? res.data : [];
    const activeOnly = incoming.filter(
      (template) => !template.isArchived && template.isActive !== false
    );
    setFoodPackTemplates(activeOnly);
  } catch (err) {
    console.error("Fetch food pack templates error:", err);
    setFoodPackTemplates([]);
  } finally {
    setLoadingTemplates(false);
  }
};

const refreshAll = async () => {
  await Promise.all([
    fetchActiveInventory(),
    fetchArchivedInventory(),
    fetchApprovedRequests(),
    fetchFoodPackTemplates(),
  ]);
};

useEffect(() => {
  if (!canSeeCentralInventory) {
    setActiveItems([]);
    setArchivedItems([]);
    setApprovedRequests([]);
    setFoodPackTemplates([]);
    setError("");
    return;
  }
  refreshAll();
}, [canSeeCentralInventory, canRelease, canManageTemplates]);

useEffect(() => {
  setTablePage(1);
  setArchivePage(1);
  setReleaseCatalogPage(1);
}, [
  mode,
  viewType,
  search,
  categoryFilter,
  sourceTypeFilter,
  sortBy,
  sortOrder,
  manualReleaseSearch,
  goodsDisplayMode,
]);

useEffect(() => {
  setTemplatePage(1);
}, [foodPackTemplates.length]);

useEffect(() => {
  if (!canRelease) return;

  const incoming = location.state || {};
  const incomingOpen = Boolean(incoming.openReleasePlanner);
  const incomingRequestId =
    incoming.selectedReliefRequestId || incoming.selectedReliefRequest?._id || "";

  if (incomingOpen) {
    setOperationsOpen(true);
    setPlannerOpen(true);
    setMode("active");
    setViewType("goods");
  }

  if (incomingRequestId) {
    setSelectedReleaseRequestId(incomingRequestId);
  }

  if (incomingOpen || incomingRequestId) {
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state, canRelease, navigate, location.pathname]);

const activeGoods = useMemo(() => {
  return activeItems.filter((item) => normalize(item.type) === "goods");
}, [activeItems]);

const activeMonetary = useMemo(() => {
  return activeItems.filter((item) => normalize(item.type) === "monetary");
}, [activeItems]);

const mergedActiveGoods = useMemo(() => {
  const grouped = new Map();

  activeGoods.forEach((item) => {
    const key = buildGoodsMergeKey(item);
    const quantity = Number(item.quantity || 0);

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...item,
        _mergeKey: key,
        _mergedIds: [item._id],
        _sourceTypes: [normalize(item.sourceType)].filter(Boolean),
        _sourceNames: [normalize(item.sourceName)].filter(Boolean),
        quantity,
      });
      return;
    }

    const existing = grouped.get(key);

    existing.quantity = Number(existing.quantity || 0) + quantity;
    existing._mergedIds = [...existing._mergedIds, item._id];

    const nextSourceType = normalize(item.sourceType);
    const nextSourceName = normalize(item.sourceName);

    if (nextSourceType && !existing._sourceTypes.includes(nextSourceType)) {
      existing._sourceTypes.push(nextSourceType);
    }

    if (nextSourceName && !existing._sourceNames.includes(nextSourceName)) {
      existing._sourceNames.push(nextSourceName);
    }

    const existingCreatedAt = existing.createdAt
      ? new Date(existing.createdAt).getTime()
      : 0;
    const incomingCreatedAt = item.createdAt
      ? new Date(item.createdAt).getTime()
      : 0;

    if (incomingCreatedAt > existingCreatedAt) {
      existing.createdAt = item.createdAt;
      existing.updatedAt = item.updatedAt;
    }
  });

  return Array.from(grouped.values());
}, [activeGoods]);

const archivedGoods = useMemo(() => {
  return archivedItems.filter((item) => normalize(item.type) === "goods");
}, [archivedItems]);

const archivedMonetary = useMemo(() => {
  return archivedItems.filter((item) => normalize(item.type) === "monetary");
}, [archivedItems]);

const activeSummary = useMemo(() => {
  const totalGoodsQuantity = mergedActiveGoods.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalMonetaryAmount = activeMonetary.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const lowStockCount = mergedActiveGoods.filter((item) => {
    const qty = Number(item.quantity || 0);
    return qty > 0 && qty < 20;
  }).length;

  const outOfStockCount = mergedActiveGoods.filter(
    (item) => Number(item.quantity || 0) <= 0
  ).length;

  const categoryCount = new Set(
    mergedActiveGoods.map((item) => normalize(item.category)).filter(Boolean)
  ).size;

  return {
    totalRecords: activeItems.length,
    goodsCount: mergedActiveGoods.length,
    monetaryCount: activeMonetary.length,
    totalGoodsQuantity,
    totalMonetaryAmount,
    lowStockCount,
    outOfStockCount,
    categoryCount,
  };
}, [activeItems, mergedActiveGoods, activeMonetary]);

const archivedSummary = useMemo(() => {
  return {
    totalRecords: archivedItems.length,
    goodsCount: archivedGoods.length,
    monetaryCount: archivedMonetary.length,
  };
}, [archivedItems, archivedGoods, archivedMonetary]);

const selectedReleaseRequest = useMemo(() => {
  return (
    approvedRequests.find(
      (request) => String(request._id) === String(selectedReleaseRequestId)
    ) || null
  );
}, [approvedRequests, selectedReleaseRequestId]);

useEffect(() => {
  if (!canRelease) return;
  if (!approvedRequests.length) {
    setSelectedReleaseRequestId("");
    return;
  }

  const exists = approvedRequests.some(
    (request) => String(request._id) === String(selectedReleaseRequestId)
  );

  if (!selectedReleaseRequestId || !exists) {
    setSelectedReleaseRequestId(approvedRequests[0]._id);
  }
}, [approvedRequests, selectedReleaseRequestId, canRelease]);

useEffect(() => {
  setManualSelections([]);
  setManualFoodPacksEquivalent("");
  setReleaseRemarks("");
  setIsFinalRelease(false);
  setSelectedTemplateId("");
  setFoodPacksToRelease("");
  setReleaseError("");
  setReleaseSuccess("");
}, [selectedReleaseRequestId, releaseMode]);

const activeSourceOptions = useMemo(() => {
  return [
    ...new Set(
      activeItems.map((item) => normalize(item.sourceType)).filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}, [activeItems]);

const archivedSourceOptions = useMemo(() => {
  return [
    ...new Set(
      archivedItems.map((item) => normalize(item.sourceType)).filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}, [archivedItems]);

const sourceOptions =
  mode === "active" ? activeSourceOptions : archivedSourceOptions;

const filteredActiveGoods = useMemo(() => {
  let items = [...mergedActiveGoods];

  if (search.trim()) {
    const q = normalize(search);
    items = items.filter((item) => {
      return (
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.sourceType).includes(q) ||
        normalize(item.sourceName).includes(q) ||
        normalize(item.addedBy).includes(q) ||
        normalize(item.unit).includes(q) ||
        (Array.isArray(item._sourceTypes) &&
          item._sourceTypes.some((value) => value.includes(q))) ||
        (Array.isArray(item._sourceNames) &&
          item._sourceNames.some((value) => value.includes(q)))
      );
    });
  }

  if (categoryFilter) {
    items = items.filter(
      (item) => normalize(item.category) === normalize(categoryFilter)
    );
  }

  if (sourceTypeFilter) {
    const q = normalize(sourceTypeFilter);
    items = items.filter((item) => {
      return (
        normalize(item.sourceType) === q ||
        (Array.isArray(item._sourceTypes) && item._sourceTypes.includes(q))
      );
    });
  }

  items.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "quantity") {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (sortBy === "createdAt") {
      valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return items;
}, [
  mergedActiveGoods,
  search,
  categoryFilter,
  sourceTypeFilter,
  sortBy,
  sortOrder,
]);

const activeMonetaryRows = useMemo(() => {
  let items = [...activeMonetary];

  if (search.trim()) {
    const q = normalize(search);
    items = items.filter((item) => {
      return (
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q) ||
        normalize(item.sourceType).includes(q) ||
        normalize(item.sourceName).includes(q) ||
        normalize(item.addedBy).includes(q)
      );
    });
  }

  if (sourceTypeFilter) {
    items = items.filter(
      (item) => normalize(item.sourceType) === normalize(sourceTypeFilter)
    );
  }

  items.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "amount") {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (sortBy === "createdAt") {
      valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return items;
}, [activeMonetary, search, sourceTypeFilter, sortBy, sortOrder]);

const archivedRows = useMemo(() => {
  const sourceData = viewType === "goods" ? archivedGoods : archivedMonetary;
  let items = [...sourceData];

  if (search.trim()) {
    const q = normalize(search);
    items = items.filter((item) => {
      return (
        normalize(item.name).includes(q) ||
        normalize(item.description).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.sourceType).includes(q) ||
        normalize(item.sourceName).includes(q) ||
        normalize(item.addedBy).includes(q) ||
        normalize(item.unit).includes(q)
      );
    });
  }

  if (viewType === "goods" && categoryFilter) {
    items = items.filter(
      (item) => normalize(item.category) === normalize(categoryFilter)
    );
  }

  if (sourceTypeFilter) {
    items = items.filter(
      (item) => normalize(item.sourceType) === normalize(sourceTypeFilter)
    );
  }

  items.sort((a, b) => {
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === "quantity" || sortBy === "amount") {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (sortBy === "createdAt") {
      valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
<<<<<<< HEAD
  };

  const sortedInventory = useMemo(() => {
    return [...filteredInventory].sort(sortFunction);
  }, [filteredInventory, sortBy, sortOrder]);

  const groupedGoods = useMemo(() => {
    const groups = {};

    goodsInventory.forEach((item) => {
      const category = item.category || "uncategorized";

      if (!groups[category]) {
        groups[category] = {
          category,
          totalQuantity: 0,
          totalItems: 0,
        };
      }

      groups[category].totalItems += 1;
      groups[category].totalQuantity += Number(item.quantity || 0);
    });

    return Object.values(groups).sort((a, b) =>
      a.category.localeCompare(b.category)
    );
  }, [goodsInventory]);

  const summary = useMemo(() => {
    return {
      totalRecords: inventory.length,
      goodsCount: goodsInventory.length,
      monetaryCount: monetaryInventory.length,
      totalQuantity: goodsInventory.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
      totalAmount: monetaryInventory.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
      categoryCount: new Set(goodsInventory.map((item) => item.category)).size,
    };
  }, [inventory, goodsInventory, monetaryInventory]);

  const storageSummary = useMemo(() => {
    const totalStockRows = barangayStock.length;
    const totalStockQuantity = barangayStock.reduce(
      (sum, item) => sum + Number(item.quantityAvailable || 0),
      0
    );
    const lowStockCount = barangayStock.filter((item) => {
      const qty = Number(item.quantityAvailable || 0);
      return qty > 0 && qty < 20;
    }).length;
    const emptyStockCount = barangayStock.filter(
      (item) => Number(item.quantityAvailable || 0) <= 0
    ).length;

    return {
      totalStockRows,
      totalStockQuantity,
      lowStockCount,
      emptyStockCount,
    };
  }, [barangayStock]);

  const filteredApprovedRequests = useMemo(() => {
    const q = normalize(requestSearch);

    if (!q) return approvedRequests;

    return approvedRequests.filter((req) => {
      return (
        normalize(req.requestNo).includes(q) ||
        normalize(req.barangayName).includes(q) ||
        normalize(req.disaster).includes(q) ||
        normalize(req.status).includes(q)
      );
    });
  }, [approvedRequests, requestSearch]);

  const selectedRequest = useMemo(() => {
    return approvedRequests.find((req) => req._id === selectedRequestId) || null;
  }, [approvedRequests, selectedRequestId]);

  const selectedRequestTotalIndividuals = useMemo(() => {
    if (!selectedRequest?.totals) return 0;

    return (
      Number(selectedRequest.totals.male || 0) +
      Number(selectedRequest.totals.female || 0) +
      Number(selectedRequest.totals.lgbtq || 0) +
      Number(selectedRequest.totals.pwd || 0) +
      Number(selectedRequest.totals.pregnant || 0) +
      Number(selectedRequest.totals.senior || 0)
    );
  }, [selectedRequest]);

  const plannedReleaseTotal = useMemo(() => {
    return releaseItems.reduce(
      (sum, item) => sum + Number(item.quantityReleased || 0),
      0
    );
  }, [releaseItems]);

  const fulfillmentPercent = useMemo(() => {
    const requested = Number(selectedRequest?.totals?.requestedFoodPacks || 0);
    if (!requested) return 0;
    return Math.min(100, Math.round((plannedReleaseTotal / requested) * 100));
  }, [selectedRequest, plannedReleaseTotal]);

  const getRequestStatusLabel = (status) => {
    if (!status) return "Unknown";
    return status.replace(/_/g, " ");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const clearReleaseWorkspace = () => {
    setSelectedRequestId("");
    setRequestSearch("");
    setReleaseRemarks("");
    setReleaseInputs({});
    setReleaseItems([]);
  };

  const clearAllocationWorkspace = () => {
    setSelectedStockId(null);
    setSelectedEvac("");
    setStockQty("");
  };

  const handleReleaseInputChange = (itemId, value) => {
    setReleaseInputs((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const addItemToRelease = (item) => {
    if (!selectedRequest) {
      alert("Please select an approved relief request first.");
      return;
    }

    const rawQty = releaseInputs[item._id];
    const qty = Number(rawQty);

    if (!rawQty || Number.isNaN(qty) || qty <= 0) {
      alert("Enter a valid release quantity first.");
      return;
    }

    const available = Number(item.quantity || 0);

    if (qty > available) {
      alert(`Release quantity cannot exceed available stock (${available}).`);
      return;
    }

    setReleaseItems((prev) => {
      const existingIndex = prev.findIndex(
        (releaseItem) => releaseItem.inventoryItemId === item._id
      );

      const payload = {
        inventoryItemId: item._id,
        itemName: item.name || "",
        category: item.category || "",
        quantityReleased: qty,
        unit: item.unit || "",
        availableQuantity: available,
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = payload;
        return updated;
      }

      return [...prev, payload];
    });

    setReleaseInputs((prev) => ({
      ...prev,
      [item._id]: "",
    }));
  };

  const removeReleaseItem = (inventoryItemId) => {
    setReleaseItems((prev) =>
      prev.filter((item) => item.inventoryItemId !== inventoryItemId)
    );
  };

  const handleReleaseDraftChange = (inventoryItemId, value) => {
    const qty = Number(value);

    setReleaseItems((prev) =>
      prev.map((item) => {
        if (item.inventoryItemId !== inventoryItemId) return item;

        if (value === "") {
          return { ...item, quantityReleased: "" };
        }

        if (Number.isNaN(qty) || qty < 0) {
          return item;
        }

        if (qty > Number(item.availableQuantity || 0)) {
          return {
            ...item,
            quantityReleased: Number(item.availableQuantity || 0),
          };
        }

        return { ...item, quantityReleased: qty };
      })
    );
  };

  const handleSubmitRelease = async () => {
    if (!selectedRequest) {
      alert("Please select an approved request.");
      return;
    }

    if (!releaseItems.length) {
      alert("Please add at least one inventory item to the release list.");
      return;
    }

    const invalidItem = releaseItems.find((item) => {
      const qty = Number(item.quantityReleased);
      return (
        Number.isNaN(qty) ||
        qty <= 0 ||
        qty > Number(item.availableQuantity || 0)
      );
    });

    if (invalidItem) {
      alert("Please review the release quantities before submitting.");
      return;
    }

    try {
      setReleaseLoading(true);

      const payload = {
        reliefRequestId: selectedRequest._id,
        items: releaseItems.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          itemName: item.itemName,
          category: item.category,
          quantityReleased: Number(item.quantityReleased),
          unit: item.unit,
        })),
        remarks: releaseRemarks.trim(),
      };

      const res = await axios.post(`${BASE_URL}/api/relief-releases`, payload, {
        withCredentials: true,
      });

      alert(res.data?.message || "Relief goods released successfully.");

      clearReleaseWorkspace();
      fetchInventory();
      fetchApprovedRequests();
      fetchBarangayStock();
    } catch (err) {
      console.error("Release error:", err);
      alert(
        err.response?.data?.message || "Failed to release goods from inventory."
      );
    } finally {
      setReleaseLoading(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedStockId) {
      alert("Please choose a stock item first.");
      return;
    }

    if (!selectedEvac || !stockQty) {
      alert("Select an evacuation place and quantity.");
      return;
    }

    const qty = Number(stockQty);
    if (Number.isNaN(qty) || qty <= 0) {
      alert("Enter a valid allocation quantity.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/evacs/${selectedEvac}/allocate`,
        {
          stockId: selectedStockId,
          quantity: qty,
        },
        { withCredentials: true }
      );

      alert("Stock allocated successfully.");
      fetchBarangayStock();
      fetchEvacPlaces();
      clearAllocationWorkspace();
    } catch (err) {
      console.error("Allocate stock error:", err);
      alert(err.response?.data?.message || "Allocation failed.");
    }
  };

  const handleDistribute = async (stockId) => {
    const qty = prompt("Enter quantity to distribute:");
    if (!qty) return;

    const qtyNum = Number(qty);
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/barangay-stock/distribute`,
        {
          stockId,
          quantity: qtyNum,
        },
        { withCredentials: true }
      );

      alert("Stock distributed successfully.");
      fetchBarangayStock();
      fetchEvacPlaces();
    } catch (err) {
      console.error("Distribute stock error:", err);
      alert(err.response?.data?.message || "Distribution failed.");
    }
  };

  const getRowAlreadyAdded = (itemId) => {
    return releaseItems.find((item) => item.inventoryItemId === itemId);
  };

  const selectedStock = useMemo(() => {
    return barangayStock.find((item) => item._id === selectedStockId) || null;
  }, [barangayStock, selectedStockId]);

  const filteredEvacPlacesForAllocation = useMemo(() => {
    if (!selectedStock) return evacPlaces;

    return evacPlaces.filter(
      (place) => String(place.barangayId) === String(selectedStock.barangayId)
    );
  }, [evacPlaces, selectedStock]);

  return (
    <DashboardShell>
      <div className="inventory-page">
        <div className="inventory-shell">
          <div className="inventory-tabs">
            {canSeeCentralInventory && (
              <button
                className={activeTab === "inventory" ? "active" : ""}
                onClick={() => {
                  setActiveTab("inventory");
                  clearAllocationWorkspace();
                }}
              >
                DRRMO Inventory
              </button>
            )}

            <button
              className={activeTab === "storage" ? "active" : ""}
              onClick={() => {
                setActiveTab("storage");
                clearReleaseWorkspace();
              }}
            >
              Barangay Storage
            </button>
          </div>

          <div className="inventory-header inventory-header-elevated">
            <div>
              <span className="inventory-kicker">
                {activeTab === "inventory"
                  ? "DRRMO Inventory & Release Console"
                  : "Barangay Storage & Allocation Console"}
              </span>
              <h1 className="inventory-title">Inventory Management</h1>
              <p className="inventory-subtitle">
                {activeTab === "inventory"
                  ? "Monitor donation stock, review available resources, and release inventory directly against approved barangay relief requests."
                  : "Review barangay storage, distribute received goods, and allocate stock to evacuation centers."}
              </p>
            </div>
          </div>

          {canSeeCentralInventory && activeTab === "inventory" && (
            <>
              <div className="inventory-summary summary-grid">
                <div className="summary-card">
                  <p className="summary-label">Total Inventory Records</p>
                  <h3 className="summary-value">{summary.totalRecords}</h3>
                  <span className="summary-note">Active donation entries</span>
                </div>

                <div className="summary-card">
                  <p className="summary-label">Goods Records</p>
                  <h3 className="summary-value">{summary.goodsCount}</h3>
                  <span className="summary-note">
                    Total stock: {summary.totalQuantity.toLocaleString()}
                  </span>
                </div>

                <div className="summary-card">
                  <p className="summary-label">Monetary Records</p>
                  <h3 className="summary-value">{summary.monetaryCount}</h3>
                  <span className="summary-note">
                    ₱{summary.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="summary-card">
                  <p className="summary-label">Goods Categories</p>
                  <h3 className="summary-value">{summary.categoryCount}</h3>
                  <span className="summary-note">Food, clothing, hygiene</span>
                </div>
              </div>

              <div className="inventory-release-console inventory-card">
                <div className="section-header compact inventory-release-header">
                  <div>
                    <span className="section-kicker">
                      Approved Request Release
                    </span>
                    <h2 className="section-title">Release Workspace</h2>
                    <p className="section-subtitle">
                      Search approved barangay requests, select one, then
                      prepare the inventory items you want to release.
                    </p>
                  </div>
                </div>

                <div className="inventory-release-topbar">
                  <div className="inventory-request-search">
                    <label>Select Approved Request</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Search request no., barangay, disaster..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                    />
                  </div>

                  <div className="inventory-release-meta">
                    <span className="inventory-meta-pill">
                      {loadingRequests
                        ? "Loading requests..."
                        : `${approvedRequests.length} approved request(s)`}
                    </span>
                  </div>
                </div>

                <div className="inventory-request-results">
                  {filteredApprovedRequests.length === 0 ? (
                    <div className="inventory-empty-inline">
                      No approved requests matched your search.
                    </div>
                  ) : (
                    filteredApprovedRequests.slice(0, 6).map((req) => (
                      <button
                        key={req._id}
                        type="button"
                        className={`inventory-request-chip ${
                          selectedRequestId === req._id ? "active" : ""
                        }`}
                        onClick={() => setSelectedRequestId(req._id)}
                      >
                        <strong>{req.requestNo}</strong>
                        <span>{req.barangayName}</span>
                        <small>{req.disaster}</small>
                      </button>
                    ))
                  )}
                </div>

                {selectedRequest && (
                  <div className="inventory-release-workspace">
                    <div className="inventory-release-request-card">
                      <div className="inventory-release-card-head">
                        <div>
                          <h3>Selected Request</h3>
                          <p>
                            Release goods against this approved barangay request.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={clearReleaseWorkspace}
                        >
                          Clear Selection
                        </button>
                      </div>

                      <div className="inventory-release-request-grid">
                        <div className="inventory-request-info">
                          <span>Request No.</span>
                          <strong>{selectedRequest.requestNo || "-"}</strong>
                        </div>
                        <div className="inventory-request-info">
                          <span>Barangay</span>
                          <strong>{selectedRequest.barangayName || "-"}</strong>
                        </div>
                        <div className="inventory-request-info">
                          <span>Disaster</span>
                          <strong>{selectedRequest.disaster || "-"}</strong>
                        </div>
                        <div className="inventory-request-info">
                          <span>Status</span>
                          <strong>
                            {getRequestStatusLabel(selectedRequest.status)}
                          </strong>
                        </div>
                        <div className="inventory-request-info">
                          <span>Requested Food Packs</span>
                          <strong>
                            {Number(
                              selectedRequest?.totals?.requestedFoodPacks || 0
                            ).toLocaleString()}
                          </strong>
                        </div>
                        <div className="inventory-request-info">
                          <span>Total Individuals</span>
                          <strong>
                            {selectedRequestTotalIndividuals.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <div className="inventory-release-progress">
                        <div className="inventory-release-progress-head">
                          <span>Planned Release Progress</span>
                          <strong>{fulfillmentPercent}%</strong>
                        </div>
                        <div className="inventory-release-progress-bar">
                          <span style={{ width: `${fulfillmentPercent}%` }} />
                        </div>
                        <p>
                          Planned quantity:{" "}
                          <strong>{plannedReleaseTotal.toLocaleString()}</strong>{" "}
                          / Requested:
                          <strong>
                            {" "}
                            {Number(
                              selectedRequest?.totals?.requestedFoodPacks || 0
                            ).toLocaleString()}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="inventory-release-draft-card">
                      <div className="inventory-release-card-head">
                        <div>
                          <h3>Release Draft</h3>
                          <p>
                            Control exactly which items and quantities will be
                            released to the selected barangay.
                          </p>
                        </div>
                      </div>

                      {releaseItems.length === 0 ? (
                        <div className="inventory-empty-inline">
                          No inventory items added to the release draft yet.
                        </div>
                      ) : (
                        <div className="inventory-release-draft-list">
                          {releaseItems.map((item) => (
                            <div
                              className="inventory-release-draft-item"
                              key={item.inventoryItemId}
                            >
                              <div className="inventory-release-draft-main">
                                <strong>{item.itemName}</strong>
                                <span>
                                  {item.category} • Available:{" "}
                                  {Number(
                                    item.availableQuantity || 0
                                  ).toLocaleString()}{" "}
                                  {item.unit}
                                </span>
                              </div>

                              <div className="inventory-release-draft-actions">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.availableQuantity}
                                  value={item.quantityReleased}
                                  onChange={(e) =>
                                    handleReleaseDraftChange(
                                      item.inventoryItemId,
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    removeReleaseItem(item.inventoryItemId)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="inventory-release-remarks">
                        <label>Release Remarks</label>
                        <textarea
                          rows="4"
                          placeholder="Add release notes, allocation notes, or delivery instructions..."
                          value={releaseRemarks}
                          onChange={(e) => setReleaseRemarks(e.target.value)}
                        />
                      </div>

                      <div className="inventory-release-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setReleaseItems([]);
                            setReleaseInputs({});
                            setReleaseRemarks("");
                          }}
                          disabled={releaseLoading}
                        >
                          Clear Draft
                        </button>

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmitRelease}
                          disabled={releaseLoading || !selectedRequest}
                        >
                          {releaseLoading ? "Releasing..." : "Release to Barangay"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="inventory-card">
                <div className="inventory-controls">
                  <div className="type-switch">
                    <button
                      className={viewType === "goods" ? "active" : ""}
                      onClick={() => setViewType("goods")}
                    >
                      Goods
                    </button>
                    <button
                      className={viewType === "monetary" ? "active" : ""}
                      onClick={() => setViewType("monetary")}
                    >
                      Monetary
                    </button>
                  </div>

                  <input
                    type="text"
                    className="input inventory-control-input"
                    placeholder={
                      viewType === "goods"
                        ? "Search item, category, source, notes..."
                        : "Search donor, source, notes..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  {viewType === "goods" && (
                    <select
                      className="input inventory-control-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="food">Food</option>
                      <option value="clothing">Clothing</option>
                      <option value="hygiene">Hygiene</option>
                    </select>
                  )}

                  <select
                    className="input inventory-control-select"
                    value={sourceTypeFilter}
                    onChange={(e) => setSourceTypeFilter(e.target.value)}
                  >
                    <option value="">All Sources</option>
                    <option value="external">External</option>
                    <option value="government">Government</option>
                    <option value="internal">Internal</option>
                  </select>

                  <select
                    className="input inventory-control-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="createdAt">Date</option>
                    <option value="name">Name</option>
                    <option value="quantity">Quantity</option>
                    <option value="amount">Amount</option>
                    <option value="sourceType">Source Type</option>
                  </select>

                  <select
                    className="input inventory-control-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>

              {viewType === "goods" && (
                <div className="inventory-card inventory-category-overview">
                  <div className="section-header compact">
                    <div>
                      <h2 className="section-title">Goods Category Overview</h2>
                      <p className="section-subtitle">
                        Aggregated inventory by category for faster stock
                        assessment.
                      </p>
                    </div>
                  </div>

                  <div className="inventory-category-grid">
                    {groupedGoods.map((group) => (
                      <div
                        className="inventory-category-tile"
                        key={group.category}
                      >
                        <span className="inventory-category-label">
                          {String(group.category || "-").toUpperCase()}
                        </span>
                        <strong>{group.totalQuantity.toLocaleString()}</strong>
                        <small>{group.totalItems} item record(s)</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="inventory-card">
                <div className="section-header compact">
                  <div>
                    <h2 className="section-title">
                      {viewType === "goods"
                        ? "Goods Inventory"
                        : "Monetary Records"}
                    </h2>
                    <p className="section-subtitle">
                      {viewType === "goods"
                        ? "Review stock details and add selected items into the release draft."
                        : "Track monetary donations and funding intake records."}
                    </p>
                  </div>
                </div>

                {loading && <p className="inventory-state">Loading inventory...</p>}
                {error && <p className="inventory-state error">{error}</p>}

                {!loading && viewType === "goods" && (
                  <div className="table-wrapper inventory-release-table-wrap">
                    <table className="inventory-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Category</th>
                          <th>Available Qty</th>
                          <th>Unit</th>
                          <th>Source</th>
                          <th>Added By</th>
                          <th>Date</th>
                          <th>Files</th>
                          <th>Release Qty</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedInventory.length === 0 ? (
                          <tr>
                            <td colSpan="10">
                              <div className="table-empty">
                                <h4>No goods inventory found</h4>
                                <p>
                                  Try adjusting your filters or add new goods
                                  donations.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          sortedInventory.map((item) => {
                            const draftItem = getRowAlreadyAdded(item._id);

                            return (
                              <tr key={item._id}>
                                <td>
                                  <div className="cell-main">
                                    {item.name || "-"}
                                  </div>
                                  {item.description ? (
                                    <small className="cell-sub">
                                      {item.description}
                                    </small>
                                  ) : null}
                                </td>
                                <td>
                                  <span className="badge badge-category">
                                    {item.category || "-"}
                                  </span>
                                </td>
                                <td>
                                  {Number(item.quantity || 0).toLocaleString()}
                                </td>
                                <td>{item.unit || "-"}</td>
                                <td>
                                  <div className="source-cell">
                                    <strong>{item.sourceType || "-"}</strong>
                                    <small>
                                      {item.sourceName || "No source name"}
                                    </small>
                                  </div>
                                </td>
                                <td>{item.addedBy || "-"}</td>
                                <td>{formatDate(item.createdAt)}</td>
                                <td>
                                  {item.proofFiles?.length > 0 ? (
                                    <div className="proof-list">
                                      {item.proofFiles.map((file, i) => (
                                        <a
                                          key={i}
                                          href={`${BASE_URL}/uploads/proofs/${file}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="file-link"
                                        >
                                          File {i + 1}
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="muted-text">No files</span>
                                  )}
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    max={Number(item.quantity || 0)}
                                    className="inventory-release-input"
                                    placeholder="0"
                                    value={
                                      releaseInputs[item._id] !== undefined
                                        ? releaseInputs[item._id]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleReleaseInputChange(
                                        item._id,
                                        e.target.value
                                      )
                                    }
                                    disabled={!selectedRequest}
                                  />
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      draftItem
                                        ? "btn-secondary"
                                        : "btn-primary"
                                    }`}
                                    onClick={() => addItemToRelease(item)}
                                    disabled={!selectedRequest}
                                  >
                                    {draftItem ? "Update Draft" : "Add to Draft"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && viewType === "monetary" && (
                  <div className="table-wrapper">
                    <table className="inventory-table">
                      <thead>
                        <tr>
                          <th>Name / Donor</th>
                          <th>Amount</th>
                          <th>Source</th>
                          <th>Description</th>
                          <th>Added By</th>
                          <th>Date</th>
                          <th>Files</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedInventory.length === 0 ? (
                          <tr>
                            <td colSpan="7">
                              <div className="table-empty">
                                <h4>No monetary records found</h4>
                                <p>
                                  There are no monetary donation records for this
                                  view.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          sortedInventory.map((item) => (
                            <tr key={item._id}>
                              <td>{item.name || "-"}</td>
                              <td>
                                ₱{Number(item.amount || 0).toLocaleString()}
                              </td>
                              <td>
                                <div className="source-cell">
                                  <strong>{item.sourceType || "-"}</strong>
                                  <small>
                                    {item.sourceName || "No source name"}
                                  </small>
                                </div>
                              </td>
                              <td>{item.description || "-"}</td>
                              <td>{item.addedBy || "-"}</td>
                              <td>{formatDate(item.createdAt)}</td>
                              <td>
                                {item.proofFiles?.length > 0 ? (
                                  <div className="proof-list">
                                    {item.proofFiles.map((file, i) => (
                                      <a
                                        key={i}
                                        href={`${BASE_URL}/uploads/proofs/${file}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="file-link"
                                      >
                                        File {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="muted-text">No files</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "storage" && (
            <>
              <div className="inventory-summary summary-grid">
                <div className="summary-card">
                  <p className="summary-label">Storage Records</p>
                  <h3 className="summary-value">
                    {storageSummary.totalStockRows}
                  </h3>
                  <span className="summary-note">Barangay stock entries</span>
                </div>

                <div className="summary-card">
                  <p className="summary-label">Total Available Quantity</p>
                  <h3 className="summary-value">
                    {storageSummary.totalStockQuantity.toLocaleString()}
                  </h3>
                  <span className="summary-note">Current storage balance</span>
                </div>

                <div className="summary-card">
                  <p className="summary-label">Low Stock Items</p>
                  <h3 className="summary-value">
                    {storageSummary.lowStockCount}
                  </h3>
                  <span className="summary-note">Below threshold</span>
                </div>

                <div className="summary-card">
                  <p className="summary-label">Empty Stock Items</p>
                  <h3 className="summary-value">
                    {storageSummary.emptyStockCount}
                  </h3>
                  <span className="summary-note">No available balance</span>
                </div>
              </div>

              <div className="inventory-card">
                <div className="section-header compact">
                  <div>
                    <h2 className="section-title">Barangay Storage</h2>
                    <p className="section-subtitle">
                      Review received relief goods, distribute them directly, or
                      allocate stock to evacuation centers.
                    </p>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Barangay</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Last Updated By</th>
                        <th>Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barangayStock.length === 0 ? (
                        <tr>
                          <td colSpan="9">
                            <div className="table-empty">
                              <h4>No barangay stock found</h4>
                              <p>
                                Barangay storage will appear here after relief
                                releases are received.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        barangayStock.map((stock) => {
                          const qty = Number(stock.quantityAvailable || 0);

                          let status = "Available";
                          if (qty === 0) status = "Empty";
                          else if (qty < 20) status = "Low";

                          const rowSelected = selectedStockId === stock._id;

                          return (
                            <tr key={stock._id}>
                              <td>{stock.itemName || "-"}</td>
                              <td>
                                <span className="badge badge-category">
                                  {stock.category || "-"}
                                </span>
                              </td>
                              <td>{stock.barangayName || "-"}</td>
                              <td>{qty.toLocaleString()}</td>
                              <td>{stock.unit || "-"}</td>
                              <td>
                                <span
                                  className={`badge ${status.toLowerCase()}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td>{stock.lastUpdatedBy || "-"}</td>
                              <td>{formatDate(stock.updatedAt)}</td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${
                                      rowSelected
                                        ? "btn-secondary"
                                        : "btn-primary"
                                    }`}
                                    onClick={() => {
                                      if (rowSelected) {
                                        clearAllocationWorkspace();
                                      } else {
                                        setSelectedStockId(stock._id);
                                        setSelectedEvac("");
                                        setStockQty("");
                                      }
                                    }}
                                  >
                                    {rowSelected
                                      ? "Cancel Allocation"
                                      : "Allocate"}
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleDistribute(stock._id)}
                                    disabled={qty <= 0}
                                  >
                                    Distribute
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedStock && (
                <div className="inventory-card">
                  <div className="section-header compact">
                    <div>
                      <h2 className="section-title">
                        Allocate to Evacuation Center
                      </h2>
                      <p className="section-subtitle">
                        Assign stock from barangay storage directly to a selected
                        evacuation place.
                      </p>
                    </div>
                  </div>

                  <div
                    className="inventory-release-request-grid"
                    style={{ marginBottom: "18px" }}
                  >
                    <div className="inventory-request-info">
                      <span>Selected Item</span>
                      <strong>{selectedStock.itemName || "-"}</strong>
                    </div>
                    <div className="inventory-request-info">
                      <span>Category</span>
                      <strong>{selectedStock.category || "-"}</strong>
                    </div>
                    <div className="inventory-request-info">
                      <span>Barangay</span>
                      <strong>{selectedStock.barangayName || "-"}</strong>
                    </div>
                    <div className="inventory-request-info">
                      <span>Available</span>
                      <strong>
                        {Number(
                          selectedStock.quantityAvailable || 0
                        ).toLocaleString()}{" "}
                        {selectedStock.unit || ""}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 220px auto",
                      gap: "14px",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                        }}
                      >
                        Select Evacuation Center
                      </label>
                      <select
                        className="input inventory-control-select"
                        value={selectedEvac}
                        onChange={(e) => setSelectedEvac(e.target.value)}
                      >
                        <option value="">Select Evac Place</option>
                        {filteredEvacPlacesForAllocation.map((place) => (
                          <option key={place._id} value={place._id}>
                            {place.name} ({place.barangayName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontWeight: 600,
                        }}
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={Number(selectedStock.quantityAvailable || 0)}
                        className="input inventory-control-input"
                        placeholder="0"
                        value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAllocate}
                      >
                        Confirm Allocation
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={clearAllocationWorkspace}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
=======
  });

  return items;
}, [
  archivedGoods,
  archivedMonetary,
  viewType,
  search,
  categoryFilter,
  sourceTypeFilter,
  sortBy,
  sortOrder,
]);

const archivedCategoryOptions = useMemo(() => {
  return [
    ...new Set(
      archivedGoods.map((item) => normalize(item.category)).filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}, [archivedGoods]);

const activeCategoryOptions = useMemo(() => {
  return [
    ...new Set(
      mergedActiveGoods.map((item) => normalize(item.category)).filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}, [mergedActiveGoods]);

const tableRows =
  mode === "active"
    ? viewType === "goods"
      ? filteredActiveGoods
      : activeMonetaryRows
    : archivedRows;

const tablePageCount =
  mode === "active"
    ? Math.max(1, Math.ceil(tableRows.length / TABLE_PAGE_SIZE))
    : Math.max(1, Math.ceil(tableRows.length / ARCHIVE_PAGE_SIZE));

const paginatedTableRows = useMemo(() => {
  if (mode === "active") {
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return tableRows.slice(start, start + TABLE_PAGE_SIZE);
  }

  const start = (archivePage - 1) * ARCHIVE_PAGE_SIZE;
  return tableRows.slice(start, start + ARCHIVE_PAGE_SIZE);
}, [tableRows, mode, tablePage, archivePage]);

useEffect(() => {
  if (tablePage > tablePageCount) setTablePage(1);
  if (archivePage > tablePageCount) setArchivePage(1);
}, [tablePageCount, tablePage, archivePage]);

const groupedGoodsRows = useMemo(() => {
  const groups = filteredActiveGoods.reduce((acc, item) => {
    const key = normalize(item.category) || "uncategorized";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
}, [filteredActiveGoods]);

useEffect(() => {
  if (goodsDisplayMode !== "grouped") return;

  setExpandedCategories((prev) => {
    const next = { ...prev };
    groupedGoodsRows.forEach(([categoryKey]) => {
      if (typeof next[categoryKey] === "undefined") {
        next[categoryKey] = true;
      }
    });
    return next;
  });
}, [groupedGoodsRows, goodsDisplayMode]);

const manualReleaseCatalog = useMemo(() => {
  let items = mergedActiveGoods.filter((item) => Number(item.quantity || 0) > 0);

  if (manualReleaseSearch.trim()) {
    const q = normalize(manualReleaseSearch);
    items = items.filter((item) => {
      return (
        normalize(item.name).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.sourceName).includes(q) ||
        normalize(item.sourceType).includes(q) ||
        (Array.isArray(item._sourceNames) &&
          item._sourceNames.some((value) => value.includes(q))) ||
        (Array.isArray(item._sourceTypes) &&
          item._sourceTypes.some((value) => value.includes(q)))
      );
    });
  }

  items.sort((a, b) => {
    const nameA = normalize(a.name);
    const nameB = normalize(b.name);
    return nameA.localeCompare(nameB);
  });

  return items;
}, [mergedActiveGoods, manualReleaseSearch]);

const releaseCatalogPageCount = Math.max(
  1,
  Math.ceil(manualReleaseCatalog.length / RELEASE_CATALOG_PAGE_SIZE)
);

const paginatedReleaseCatalog = useMemo(() => {
  const start = (releaseCatalogPage - 1) * RELEASE_CATALOG_PAGE_SIZE;
  return manualReleaseCatalog.slice(start, start + RELEASE_CATALOG_PAGE_SIZE);
}, [manualReleaseCatalog, releaseCatalogPage]);

useEffect(() => {
  if (releaseCatalogPage > releaseCatalogPageCount) {
    setReleaseCatalogPage(1);
  }
}, [releaseCatalogPage, releaseCatalogPageCount]);

const selectedTemplate = useMemo(() => {
  return (
    foodPackTemplates.find(
      (template) => String(template._id) === String(selectedTemplateId)
    ) || null
  );
}, [foodPackTemplates, selectedTemplateId]);

const computedTemplateItems = useMemo(() => {
  if (!selectedTemplate) return [];
  const packCount = Number(foodPacksToRelease || 0);
  if (packCount <= 0) return [];

  return (selectedTemplate.items || []).map((item) => ({
    inventoryItemId: item.inventoryItemId,
    itemName: item.itemName,
    category: item.category,
    unit: item.unit,
    quantityReleased: Number(item.quantityPerPack || 0) * packCount,
    quantityPerPack: Number(item.quantityPerPack || 0),
    remarks: item.remarks || "",
  }));
}, [selectedTemplate, foodPacksToRelease]);

const releasePreviewSummary = useMemo(() => {
  if (releaseMode === "template") {
    return computedTemplateItems.reduce(
      (acc, item) => {
        acc.lineItems += 1;
        acc.totalQuantity += Number(item.quantityReleased || 0);
        return acc;
      },
      { lineItems: 0, totalQuantity: 0 }
    );
  }

  return manualSelections.reduce(
    (acc, item) => {
      acc.lineItems += 1;
      acc.totalQuantity += Number(item.quantityReleased || 0);
      return acc;
    },
    { lineItems: 0, totalQuantity: 0 }
  );
}, [releaseMode, computedTemplateItems, manualSelections]);

const templateCatalog = useMemo(() => {
  let items = activeGoods.filter((item) => Number(item.quantity || 0) > 0);

  if (templateBuilderSearch.trim()) {
    const q = normalize(templateBuilderSearch);
    items = items.filter((item) => {
      return (
        normalize(item.name).includes(q) ||
        normalize(item.category).includes(q) ||
        normalize(item.sourceName).includes(q) ||
        normalize(item.sourceType).includes(q) ||
        normalize(item.unit).includes(q)
      );
    });
  }

  items.sort((a, b) => normalize(a.name).localeCompare(normalize(b.name)));
  return items;
}, [activeGoods, templateBuilderSearch]);

const selectedTemplateCard = useMemo(() => {
  return (
    foodPackTemplates.find(
      (template) => String(template._id) === String(selectedTemplateCardId)
    ) || null
  );
}, [foodPackTemplates, selectedTemplateCardId]);

const templatePageCount = Math.max(
  1,
  Math.ceil(foodPackTemplates.length / TEMPLATE_PAGE_SIZE)
);

const paginatedTemplates = useMemo(() => {
  const start = (templatePage - 1) * TEMPLATE_PAGE_SIZE;
  return foodPackTemplates.slice(start, start + TEMPLATE_PAGE_SIZE);
}, [foodPackTemplates, templatePage]);

useEffect(() => {
  if (templatePage > templatePageCount) {
    setTemplatePage(1);
  }
}, [templatePage, templatePageCount]);

const barangayOptions = useMemo(() => {
  return [
    ...new Set(
      approvedRequests
        .map((request) => String(request.barangayName || "").trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}, [approvedRequests]);

const filteredApprovedRequests = useMemo(() => {
  if (!releaseBarangayFilter) return approvedRequests;
  return approvedRequests.filter(
    (request) =>
      String(request.barangayName || "").trim() === releaseBarangayFilter
  );
}, [approvedRequests, releaseBarangayFilter]);

useEffect(() => {
  if (!filteredApprovedRequests.length) return;

  const exists = filteredApprovedRequests.some(
    (request) => String(request._id) === String(selectedReleaseRequestId)
  );

  if (!exists) {
    setSelectedReleaseRequestId(filteredApprovedRequests[0]._id);
  }
}, [filteredApprovedRequests, selectedReleaseRequestId]);

const addManualReleaseItem = (inventoryItem) => {
  const selectionId =
    inventoryItem._mergeKey || inventoryItem._id || buildGoodsMergeKey(inventoryItem);

  setManualSelections((prev) => {
    const exists = prev.some(
      (item) => String(item.inventoryItemId) === String(selectionId)
    );
    if (exists) return prev;

    return [
      ...prev,
      {
        inventoryItemId: selectionId,
        sourceInventoryIds: Array.isArray(inventoryItem._mergedIds)
          ? inventoryItem._mergedIds
          : [inventoryItem._id].filter(Boolean),
        itemName: inventoryItem.name,
        category: inventoryItem.category,
        availableQuantity: Number(inventoryItem.quantity || 0),
        quantityReleased: "",
        unit: inventoryItem.unit || "",
        remarks: "",
      },
    ];
  });
};

const updateManualSelection = (inventoryItemId, field, value) => {
  setManualSelections((prev) =>
    prev.map((item) =>
      String(item.inventoryItemId) === String(inventoryItemId)
        ? { ...item, [field]: value }
        : item
    )
  );
};

const removeManualSelection = (inventoryItemId) => {
  setManualSelections((prev) =>
    prev.filter(
      (item) => String(item.inventoryItemId) !== String(inventoryItemId)
    )
  );
};

const openCreateTemplateModal = () => {
  setEditingTemplateId("");
  setTemplateName("");
  setTemplateDescription("");
  setTemplateBuilderSearch("");
  setTemplateItems([]);
  setTemplateError("");
  setTemplateSuccess("");
  setTemplateModalOpen(true);
};

const openEditTemplateModal = (template) => {
  setEditingTemplateId(template?._id || "");
  setTemplateName(template?.name || "");
  setTemplateDescription(template?.description || "");
  setTemplateBuilderSearch("");
  setTemplateItems(
    Array.isArray(template?.items)
      ? template.items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          itemName: item.itemName,
          category: item.category,
          quantityPerPack: String(Number(item.quantityPerPack || 0)),
          unit: item.unit || "",
          remarks: item.remarks || "",
        }))
      : []
  );
  setTemplateError("");
  setTemplateSuccess("");
  setTemplateModalOpen(true);
};

const closeTemplateModal = () => {
  if (templateSubmitting) return;
  setTemplateModalOpen(false);
  setEditingTemplateId("");
  setTemplateName("");
  setTemplateDescription("");
  setTemplateBuilderSearch("");
  setTemplateItems([]);
  setTemplateError("");
  setTemplateSuccess("");
};

const addTemplateItem = (inventoryItem) => {
  setTemplateItems((prev) => {
    const exists = prev.some(
      (item) => String(item.inventoryItemId) === String(inventoryItem._id)
    );
    if (exists) return prev;

    return [
      ...prev,
      {
        inventoryItemId: inventoryItem._id,
        itemName: inventoryItem.name,
        category: inventoryItem.category || "",
        quantityPerPack: "1",
        unit: inventoryItem.unit || "",
        remarks: "",
      },
    ];
  });
};

const updateTemplateItem = (inventoryItemId, field, value) => {
  setTemplateItems((prev) =>
    prev.map((item) =>
      String(item.inventoryItemId) === String(inventoryItemId)
        ? { ...item, [field]: value }
        : item
    )
  );
};

const removeTemplateItem = (inventoryItemId) => {
  setTemplateItems((prev) =>
    prev.filter(
      (item) => String(item.inventoryItemId) !== String(inventoryItemId)
    )
  );
};

const saveTemplate = async () => {
  setTemplateError("");
  setTemplateSuccess("");

  const cleanName = String(templateName || "").trim();
  const cleanDescription = String(templateDescription || "").trim();

  if (!cleanName) {
    setTemplateError("Template name is required.");
    return;
  }

  const preparedItems = templateItems
    .map((item) => ({
      inventoryItemId: item.inventoryItemId,
      itemName: String(item.itemName || "").trim(),
      category: String(item.category || "").trim(),
      quantityPerPack: Number(item.quantityPerPack || 0),
      unit: String(item.unit || "").trim(),
      remarks: String(item.remarks || "").trim(),
    }))
    .filter((item) => item.inventoryItemId);

  if (!preparedItems.length) {
    setTemplateError("Add at least one goods item to the template.");
    return;
  }

  const invalidItem = preparedItems.find(
    (item) =>
      !item.itemName ||
      !item.category ||
      !item.unit ||
      Number(item.quantityPerPack || 0) <= 0
  );

  if (invalidItem) {
    setTemplateError(
      `Complete all required fields and use quantity per pack greater than 0 for "${invalidItem.itemName || "item"}".`
    );
    return;
  }

  try {
    setTemplateSubmitting(true);

    const payload = {
      name: cleanName,
      description: cleanDescription,
      items: preparedItems,
    };

    if (editingTemplateId) {
      await axios.put(
        `${BASE_URL}/api/food-pack-templates/${editingTemplateId}`,
        payload,
        { withCredentials: true }
      );
      setTemplateSuccess("Food pack template updated successfully.");
    } else {
      await axios.post(`${BASE_URL}/api/food-pack-templates`, payload, {
        withCredentials: true,
      });
      setTemplateSuccess("Food pack template created successfully.");
    }

    await fetchFoodPackTemplates();

    setTimeout(() => {
      closeTemplateModal();
    }, 700);
  } catch (err) {
    console.error("Save template error:", err);
    setTemplateError(
      err.response?.data?.message || "Failed to save food pack template."
    );
  } finally {
    setTemplateSubmitting(false);
  }
};

const archiveTemplate = async (templateId) => {
  const ok = window.confirm("Archive this food pack template?");
  if (!ok) return;

  try {
    setActionLoading(true);
    await axios.delete(`${BASE_URL}/api/food-pack-templates/${templateId}`, {
      withCredentials: true,
    });

    if (selectedTemplateId === templateId) {
      setSelectedTemplateId("");
    }
    if (selectedTemplateCardId === templateId) {
      setSelectedTemplateCardId("");
    }

    await fetchFoodPackTemplates();
  } catch (err) {
    console.error("Archive template error:", err);
    alert(
      err.response?.data?.message || "Failed to archive food pack template."
    );
  } finally {
    setActionLoading(false);
  }
};

const clearFilters = () => {
  setSearch("");
  setCategoryFilter("");
  setSortBy("createdAt");
  setSortOrder("desc");
  setTablePage(1);
  setArchivePage(1);
};

const clearReleasePlanner = () => {
  setManualSelections([]);
  setManualFoodPacksEquivalent("");
  setSelectedTemplateId("");
  setFoodPacksToRelease("");
  setReleaseRemarks("");
  setIsFinalRelease(false);
  setReleaseError("");
  setReleaseSuccess("");
  setManualReleaseSearch("");
  setReleaseCatalogPage(1);
};

const toggleCategoryExpanded = (categoryKey) => {
  setExpandedCategories((prev) => ({
    ...prev,
    [categoryKey]: !prev[categoryKey],
  }));
};

const getCategoryLabel = (value) => {
  const v = normalize(value);
  if (!v) return "Uncategorized";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const getSourceLabel = (value) => {
  const v = normalize(value);
  if (!v) return "-";
  return v.charAt(0).toUpperCase() + v.slice(1);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const handleArchive = async (id) => {
  const ok = window.confirm("Archive this inventory record?");
  if (!ok) return;

  try {
    setActionLoading(true);
    await axios.delete(`${BASE_URL}/api/inventory/${id}`, {
      withCredentials: true,
    });
    await refreshAll();
    if (selectedItem?._id === id) setSelectedItem(null);
  } catch (err) {
    console.error("Archive error:", err);
    alert(err.response?.data?.message || "Failed to archive record.");
  } finally {
    setActionLoading(false);
  }
};

const handleRestore = async (id) => {
  try {
    setActionLoading(true);
    await axios.patch(
      `${BASE_URL}/api/inventory/${id}/restore`,
      {},
      { withCredentials: true }
    );
    await refreshAll();
    if (selectedItem?._id === id) setSelectedItem(null);
  } catch (err) {
    console.error("Restore error:", err);
    alert(err.response?.data?.message || "Failed to restore record.");
  } finally {
    setActionLoading(false);
  }
};

const handlePermanentDelete = async (id) => {
  const ok = window.confirm(
    "Permanently delete this archived record? This cannot be undone."
  );
  if (!ok) return;

  try {
    setActionLoading(true);
    await axios.delete(`${BASE_URL}/api/inventory/${id}/permanent`, {
      withCredentials: true,
    });
    await refreshAll();
    if (selectedItem?._id === id) setSelectedItem(null);
  } catch (err) {
    console.error("Permanent delete error:", err);
    alert(err.response?.data?.message || "Failed to delete record.");
  } finally {
    setActionLoading(false);
  }
};

const renderProofFiles = (proofFiles) => {
  if (!Array.isArray(proofFiles) || proofFiles.length === 0) {
    return <span className="muted-text">No files</span>;
  }

  return (
    <div className="proof-list">
      {proofFiles.map((file, index) => {
        const fileName = typeof file === "string" ? file : file?.filename;
        const path = typeof file === "string" ? file : file?.path;

        const href = path
          ? path.startsWith("http")
            ? path
            : `${BASE_URL}/${path.replace(/^\/+/, "")}`
          : fileName
          ? `${BASE_URL}/uploads/${fileName}`
          : "#";

        return (
          <a
            key={`${fileName || "file"}-${index}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="file-link"
          >
            View File {index + 1}
          </a>
        );
      })}
    </div>
  );
};

const renderRowActions = (item) => {
  if (mode === "active") {
    return (
      <button
        type="button"
        className="btn btn-outline btn-sm"
        disabled={actionLoading}
        onClick={() => handleArchive(item._id)}
      >
        Archive
      </button>
    );
  }

  return (
    <div className="row-actions">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={actionLoading}
        onClick={() => handleRestore(item._id)}
      >
        Restore
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        disabled={actionLoading}
        onClick={() => handlePermanentDelete(item._id)}
      >
        Delete
      </button>
    </div>
  );
};

const submitRelease = async () => {
  if (!selectedReleaseRequest?._id) {
    setReleaseError("Select a request first.");
    return;
  }

  setReleaseError("");
  setReleaseSuccess("");

  try {
    setReleaseSubmitting(true);

    let payload = {
      reliefRequestId: selectedReleaseRequest._id,
      remarks: releaseRemarks,
      isFinalRelease,
    };

    if (releaseMode === "template") {
      if (!selectedTemplateId) {
        throw new Error("Select a food pack template.");
      }

      const packCount = Number(foodPacksToRelease || 0);
      if (packCount <= 0) {
        throw new Error("Food packs to release must be greater than 0.");
      }

      payload = {
        ...payload,
        releaseMode: "template",
        foodPackTemplateId: selectedTemplateId,
        foodPacksToRelease: packCount,
      };
    } else {
      const preparedItems = manualSelections
        .map((item) => ({
          inventoryItemId:
            Array.isArray(item.sourceInventoryIds) && item.sourceInventoryIds.length
              ? item.sourceInventoryIds[0]
              : item.inventoryItemId,
          itemName: item.itemName,
          category: item.category,
          quantityReleased: Number(item.quantityReleased || 0),
          unit: item.unit,
          remarks: item.remarks || "",
        }))
        .filter((item) => item.quantityReleased > 0);

      if (!preparedItems.length) {
        throw new Error("Add at least one manual release item.");
      }

      const overLimit = manualSelections.find(
        (item) =>
          Number(item.quantityReleased || 0) >
          Number(item.availableQuantity || 0)
      );

      if (overLimit) {
        throw new Error(
          `Release quantity cannot exceed available stock for "${overLimit.itemName}".`
        );
      }

      const packEquivalent = Number(manualFoodPacksEquivalent || 0);

      if (
        Number(selectedReleaseRequest?.totals?.requestedFoodPacks || 0) > 0 &&
        packEquivalent <= 0
      ) {
        throw new Error(
          "Enter Food Packs Equivalent for manual release before submitting."
        );
      }

      payload = {
        ...payload,
        releaseMode: "manual",
        foodPacksToRelease: packEquivalent,
        items: preparedItems,
      };
    }

    const res = await axios.post(`${BASE_URL}/api/relief-releases`, payload, {
      withCredentials: true,
    });

    setReleaseSuccess(res.data?.message || "Relief goods released successfully.");
    setManualSelections([]);
    setManualFoodPacksEquivalent("");
    setSelectedTemplateId("");
    setFoodPacksToRelease("");
    setReleaseRemarks("");
    setIsFinalRelease(false);

    await refreshAll();
  } catch (err) {
    console.error("Release submit error:", err);
    setReleaseError(
      err.response?.data?.message || err.message || "Failed to submit release."
    );
  } finally {
    setReleaseSubmitting(false);
  }
};

const releaseStatusLabel = selectedReleaseRequest?.status
  ? selectedReleaseRequest.status.replace(/_/g, " ")
  : "-";

const loadingCurrent =
  (mode === "active" && loadingActive) || (mode === "archived" && loadingArchived);

  return (
  <DashboardShell>
    <div className="inventory-page">
      <div className="inventory-shell">
        <div className="inventory-hero">
          <div className="inventory-hero-head">
            <div className="inventory-title-group">
              <h1 className="inventory-title">
                {canRelease ? "Inventory & Release Preparation" : "Inventory"}
              </h1>

              <div className="inventory-title-meta">
                <span className="inventory-top-pill">
                  {mode === "active"
                    ? `${activeSummary.totalRecords} active`
                    : `${archivedSummary.totalRecords} archived`}
                </span>

                <span className="inventory-top-pill subtle">
                  {viewType === "goods" ? "goods" : "monetary"}
                </span>

                {canRelease && (
                  <span className="inventory-top-pill subtle">
                    {approvedRequests.length} releasable request(s)
                  </span>
                )}

                {canManageTemplates && (
                  <span className="inventory-top-pill subtle">
                    {foodPackTemplates.length} active template(s)
                  </span>
                )}
              </div>
            </div>

            <div className="inventory-hero-actions">
              {canRelease && (
                <button
                  type="button"
                  className={`btn ${operationsOpen ? "btn-secondary" : "btn-primary"}`}
                  onClick={() => setOperationsOpen((prev) => !prev)}
                >
                  {operationsOpen ? "Hide Operations" : "Release Preparation"}
                </button>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                onClick={refreshAll}
                disabled={
                  loadingActive ||
                  loadingArchived ||
                  loadingReleaseQueue ||
                  loadingTemplates
                }
              >
                Refresh
              </button>
            </div>
          </div>

          {mode === "active" && (
            <div className="inventory-summary">
              <div className="summary-card summary-card-emphasis">
                <span className="summary-label">Goods Stock</span>
                <h3 className="summary-value">
                  {activeSummary.totalGoodsQuantity.toLocaleString()}
                </h3>
                <span className="summary-note">
                  {activeSummary.goodsCount} goods record(s)
                </span>
              </div>

              <div className="summary-card">
                <span className="summary-label">Monetary Total</span>
                <h3 className="summary-value">
                  ₱{activeSummary.totalMonetaryAmount.toLocaleString()}
                </h3>
                <span className="summary-note">
                  {activeSummary.monetaryCount} monetary record(s)
                </span>
              </div>

              <div className="summary-card">
                <span className="summary-label">Low Stock</span>
                <h3 className="summary-value">
                  {activeSummary.lowStockCount.toLocaleString()}
                </h3>
                <span className="summary-note">Below 20 units</span>
              </div>

              <div className="summary-card">
                <span className="summary-label">Out of Stock</span>
                <h3 className="summary-value">
                  {activeSummary.outOfStockCount.toLocaleString()}
                </h3>
                <span className="summary-note">Zero remaining quantity</span>
              </div>
            </div>
          )}

          {mode === "archived" && (
            <div className="inventory-summary inventory-summary-archived">
              <div className="summary-card">
                <span className="summary-label">Archived Records</span>
                <h3 className="summary-value">
                  {archivedSummary.totalRecords.toLocaleString()}
                </h3>
                <span className="summary-note">Historical inventory entries</span>
              </div>

              <div className="summary-card">
                <span className="summary-label">Goods</span>
                <h3 className="summary-value">
                  {archivedSummary.goodsCount.toLocaleString()}
                </h3>
                <span className="summary-note">Archived goods records</span>
              </div>

              <div className="summary-card">
                <span className="summary-label">Monetary</span>
                <h3 className="summary-value">
                  {archivedSummary.monetaryCount.toLocaleString()}
                </h3>
                <span className="summary-note">Archived monetary records</span>
              </div>
            </div>
          )}
        </div>

        {!canSeeCentralInventory ? (
          <div className="inventory-card inventory-empty-surface">
            <div className="table-empty">
              <h4>Inventory access is not available for this account.</h4>
              <p>This page is for central inventory monitoring only.</p>
            </div>
          </div>
        ) : (
          <>
            {canRelease && operationsOpen && (
              <div className="inventory-operations-stack">
                {canManageTemplates && viewType === "goods" && mode === "active" && (
                  <div className="inventory-card release-shell">
                    <div className="release-shell-head">
                      <div>
                        <h2>Food Pack Templates</h2>
                        <p>
                          Build reusable food pack templates from current goods
                          inventory.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={openCreateTemplateModal}
                      >
                        Create Template
                      </button>
                    </div>

                    {loadingTemplates ? (
                      <div className="release-empty">Loading templates...</div>
                    ) : foodPackTemplates.length === 0 ? (
                      <div className="release-empty">
                        No food pack templates yet. Create your first template.
                      </div>
                    ) : (
                      <>
                        <div className="template-card-grid">
                          {paginatedTemplates.map((template) => (
                            <button
                              type="button"
                              key={template._id}
                              className={`template-summary-card ${
                                selectedTemplateCardId === template._id ? "active" : ""
                              }`}
                              onClick={() =>
                                setSelectedTemplateCardId((prev) =>
                                  prev === template._id ? "" : template._id
                                )
                              }
                            >
                              <div className="template-summary-top">
                                <div>
                                  <strong>{template.name}</strong>
                                  <span>{template.description || "No description."}</span>
                                </div>
                                <span className="badge available">
                                  {(template.items || []).length} item(s)
                                </span>
                              </div>

                              <div className="template-summary-meta">
                                <div>
                                  <label>Created By</label>
                                  <b>{template.createdBy || "-"}</b>
                                </div>
                                <div>
                                  <label>Updated By</label>
                                  <b>{template.updatedBy || "-"}</b>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>

                        {templatePageCount > 1 && (
                          <div className="pager">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={templatePage === 1}
                              onClick={() => setTemplatePage((prev) => prev - 1)}
                            >
                              Prev
                            </button>
                            <span>
                              Page {templatePage} of {templatePageCount}
                            </span>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              disabled={templatePage === templatePageCount}
                              onClick={() => setTemplatePage((prev) => prev + 1)}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {selectedTemplateCard ? (
                      <div className="template-detail-panel">
                        <div className="template-detail-head">
                          <div>
                            <h3>{selectedTemplateCard.name}</h3>
                            <p>{selectedTemplateCard.description || "No description."}</p>
                          </div>

                          <div className="row-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => openEditTemplateModal(selectedTemplateCard)}
                            >
                              Edit Template
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              disabled={actionLoading}
                              onClick={() => archiveTemplate(selectedTemplateCard._id)}
                            >
                              Archive Template
                            </button>
                          </div>
                        </div>

                        <div className="table-wrapper">
                          <table className="inventory-table">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Per Pack</th>
                                <th>Unit</th>
                                <th>Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(selectedTemplateCard.items || []).length === 0 ? (
                                <tr>
                                  <td colSpan="5">No template items found.</td>
                                </tr>
                              ) : (
                                selectedTemplateCard.items.map((item, index) => (
                                  <tr key={`${item.inventoryItemId}-${index}`}>
                                    <td>{item.itemName || "-"}</td>
                                    <td>{getCategoryLabel(item.category)}</td>
                                    <td>{Number(item.quantityPerPack || 0)}</td>
                                    <td>{item.unit || "-"}</td>
                                    <td>{item.remarks || "-"}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="inventory-card release-shell">
                  <div className="release-shell-head">
                    <div>
                      <h2>Release Preparation</h2>
                      <p>
                        Select a request, choose release mode, prepare goods, then
                        submit.
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`btn ${plannerOpen ? "btn-secondary" : "btn-outline"}`}
                      onClick={() => setPlannerOpen((prev) => !prev)}
                    >
                      {plannerOpen ? "Collapse" : "Open Planner"}
                    </button>
                  </div>

                  {plannerOpen ? (
                    <div className="release-layout">
                      <aside className="release-queue">
                        <div className="release-queue-head">
                          <h3>Requests Ready for Release</h3>
                          <span>{filteredApprovedRequests.length}</span>
                        </div>

                        <div className="release-queue-filter">
                          <label className="release-selection-field">
                            <span>Barangay</span>
                            <select
                              className="input"
                              value={releaseBarangayFilter}
                              onChange={(e) => setReleaseBarangayFilter(e.target.value)}
                            >
                              <option value="">All Barangays</option>
                              {barangayOptions.map((barangay) => (
                                <option key={barangay} value={barangay}>
                                  {barangay}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        {loadingReleaseQueue ? (
                          <div className="release-empty">Loading requests...</div>
                        ) : filteredApprovedRequests.length === 0 ? (
                          <div className="release-empty">
                            No approved or partially released requests found.
                          </div>
                        ) : (
                          <div className="release-request-list">
                            {filteredApprovedRequests.map((request) => {
                              const isActive =
                                String(request._id) === String(selectedReleaseRequestId);

                              return (
                                <button
                                  type="button"
                                  key={request._id}
                                  className={`release-request-card ${
                                    isActive ? "active" : ""
                                  }`}
                                  onClick={() => setSelectedReleaseRequestId(request._id)}
                                >
                                  <strong>{request.barangayName || "-"}</strong>
                                  <span>{request.disaster || "-"}</span>
                                  <small>{request.requestNo || "-"}</small>

                                  <div className="release-request-meta">
                                    <div>
                                      <label>Packs</label>
                                      <b>
                                        {Number(request?.totals?.requestedFoodPacks || 0)}
                                      </b>
                                    </div>
                                    <div>
                                      <label>Centers</label>
                                      <b>{request?.rows?.length || 0}</b>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </aside>

                      <section className="release-main">
                        {!selectedReleaseRequest ? (
                          <div className="release-empty release-empty-main">
                            Select a request to prepare a release.
                          </div>
                        ) : (
                          <>
                            <div className="release-summary-bar">
                              <div className="release-summary-card">
                                <span>Request</span>
                                <strong>{selectedReleaseRequest.requestNo}</strong>
                              </div>
                              <div className="release-summary-card">
                                <span>Barangay</span>
                                <strong>{selectedReleaseRequest.barangayName}</strong>
                              </div>
                              <div className="release-summary-card">
                                <span>Status</span>
                                <strong className="caps">{releaseStatusLabel}</strong>
                              </div>
                              <div className="release-summary-card">
                                <span>Requested Packs</span>
                                <strong>
                                  {Number(
                                    selectedReleaseRequest?.totals?.requestedFoodPacks || 0
                                  )}
                                </strong>
                              </div>
                              <div className="release-summary-card">
                                <span>People</span>
                                <strong>
                                  {[
                                    "male",
                                    "female",
                                    "lgbtq",
                                    "pwd",
                                    "pregnant",
                                    "senior",
                                  ].reduce(
                                    (sum, key) =>
                                      sum +
                                      Number(selectedReleaseRequest?.totals?.[key] || 0),
                                    0
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="release-mode-switch">
                              <button
                                type="button"
                                className={releaseMode === "manual" ? "active" : ""}
                                onClick={() => setReleaseMode("manual")}
                              >
                                Release Manual Goods
                              </button>
                              <button
                                type="button"
                                className={releaseMode === "template" ? "active" : ""}
                                onClick={() => setReleaseMode("template")}
                              >
                                Release Food Pack
                              </button>
                            </div>

                            {releaseMode === "manual" ? (
                              <div className="release-mode-layout">
                                <div className="release-panel">
                                  <div className="release-panel-head">
                                    <h3>Available Goods</h3>
                                    <input
                                      type="text"
                                      className="input"
                                      placeholder="Search item, category, source..."
                                      value={manualReleaseSearch}
                                      onChange={(e) => setManualReleaseSearch(e.target.value)}
                                    />
                                  </div>

                                  {paginatedReleaseCatalog.length === 0 ? (
                                    <div className="release-empty">No goods found.</div>
                                  ) : (
                                    <>
                                      <div className="table-wrapper release-table-wrap">
                                        <table className="inventory-table release-table">
                                          <thead>
                                            <tr>
                                              <th>Item</th>
                                              <th>Category</th>
                                              <th>Stock</th>
                                              <th>Unit</th>
                                              <th />
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {paginatedReleaseCatalog.map((item) => (
                                              <tr key={item._mergeKey || item._id}>
                                                <td>
                                                  <div className="table-main-cell">
                                                    <strong>{item.name || "-"}</strong>
                                                    {Array.isArray(item._sourceTypes) &&
                                                    item._sourceTypes.length > 0 ? (
                                                      <span>
                                                        {item._sourceTypes
                                                          .map((value) =>
                                                            getSourceLabel(value)
                                                          )
                                                          .join(" • ")}
                                                      </span>
                                                    ) : null}
                                                  </div>
                                                </td>
                                                <td>{getCategoryLabel(item.category)}</td>
                                                <td>{Number(item.quantity || 0)}</td>
                                                <td>{item.unit || "-"}</td>
                                                <td>
                                                  <button
                                                    type="button"
                                                    className="btn btn-outline btn-sm"
                                                    onClick={() => addManualReleaseItem(item)}
                                                  >
                                                    Add
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {releaseCatalogPageCount > 1 && (
                                        <div className="pager">
                                          <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            disabled={releaseCatalogPage === 1}
                                            onClick={() =>
                                              setReleaseCatalogPage((prev) => prev - 1)
                                            }
                                          >
                                            Prev
                                          </button>
                                          <span>
                                            Page {releaseCatalogPage} of{" "}
                                            {releaseCatalogPageCount}
                                          </span>
                                          <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            disabled={
                                              releaseCatalogPage ===
                                              releaseCatalogPageCount
                                            }
                                            onClick={() =>
                                              setReleaseCatalogPage((prev) => prev + 1)
                                            }
                                          >
                                            Next
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>

                                <div className="release-panel">
                                  <div className="release-panel-head">
                                    <h3>Release List</h3>
                                    <span>{manualSelections.length} line item(s)</span>
                                  </div>

                                  <div className="release-selection-field release-selection-field-pack">
                                    <label>Food Packs Equivalent</label>
                                    <input
                                      type="number"
                                      min="0"
                                      className="input"
                                      value={manualFoodPacksEquivalent}
                                      onChange={(e) =>
                                        setManualFoodPacksEquivalent(e.target.value)
                                      }
                                      placeholder="Enter how many food packs this manual release fulfills"
                                    />
                                  </div>

                                  {manualSelections.length === 0 ? (
                                    <div className="release-empty release-empty-compact">
                                      Add goods from the inventory list.
                                    </div>
                                  ) : (
                                    <div className="release-selection-list">
                                      {manualSelections.map((item) => (
                                        <div
                                          className="release-selection-card"
                                          key={item.inventoryItemId}
                                        >
                                          <div className="release-selection-head">
                                            <div>
                                              <strong>{item.itemName}</strong>
                                              <span>
                                                {getCategoryLabel(item.category)} •{" "}
                                                {item.unit}
                                              </span>
                                            </div>

                                            <button
                                              type="button"
                                              className="btn btn-danger btn-sm"
                                              onClick={() =>
                                                removeManualSelection(item.inventoryItemId)
                                              }
                                            >
                                              Remove
                                            </button>
                                          </div>

                                          <div className="release-selection-grid release-selection-grid-tight">
                                            <div className="release-selection-field">
                                              <label>Available</label>
                                              <div className="release-static-value">
                                                {item.availableQuantity}
                                              </div>
                                            </div>

                                            <div className="release-selection-field">
                                              <label>Release Qty</label>
                                              <input
                                                type="number"
                                                min="0"
                                                className="input"
                                                value={item.quantityReleased}
                                                onChange={(e) =>
                                                  updateManualSelection(
                                                    item.inventoryItemId,
                                                    "quantityReleased",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </div>

                                            <div className="release-selection-field release-selection-field-wide">
                                              <label>Remarks</label>
                                              <input
                                                type="text"
                                                className="input"
                                                value={item.remarks}
                                                onChange={(e) =>
                                                  updateManualSelection(
                                                    item.inventoryItemId,
                                                    "remarks",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="release-mode-layout single">
                                <div className="release-panel">
                                  <div className="release-panel-head">
                                    <h3>Food Pack Release</h3>
                                    <span>
                                      {loadingTemplates
                                        ? "Loading templates..."
                                        : `${foodPackTemplates.length} template(s)`}
                                    </span>
                                  </div>

                                  <div className="template-config-grid">
                                    <div className="release-selection-field">
                                      <label>Template</label>
                                      <select
                                        className="input"
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                      >
                                        <option value="">Select template</option>
                                        {foodPackTemplates.map((template) => (
                                          <option key={template._id} value={template._id}>
                                            {template.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="release-selection-field">
                                      <label>Food Packs to Release</label>
                                      <input
                                        type="number"
                                        min="0"
                                        className="input"
                                        value={foodPacksToRelease}
                                        onChange={(e) =>
                                          setFoodPacksToRelease(e.target.value)
                                        }
                                      />
                                    </div>
                                  </div>

                                  {selectedTemplate ? (
                                    <div className="template-preview-wrap">
                                      <div className="template-preview-head">
                                        <strong>{selectedTemplate.name}</strong>
                                        <span>
                                          {selectedTemplate.description ||
                                            "No description."}
                                        </span>
                                      </div>

                                      {computedTemplateItems.length === 0 ? (
                                        <div className="release-empty">
                                          Enter a food pack count to preview generated
                                          release items.
                                        </div>
                                      ) : (
                                        <div className="table-wrapper">
                                          <table className="inventory-table release-table">
                                            <thead>
                                              <tr>
                                                <th>Item</th>
                                                <th>Per Pack</th>
                                                <th>Total Release</th>
                                                <th>Unit</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {computedTemplateItems.map((item, index) => (
                                                <tr key={`${item.itemName}-${index}`}>
                                                  <td>{item.itemName}</td>
                                                  <td>{item.quantityPerPack}</td>
                                                  <td>{item.quantityReleased}</td>
                                                  <td>{item.unit || "-"}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="release-empty">
                                      Select a food pack template to continue.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="release-footer-card">
                              <div className="release-footer-grid">
                                <div className="release-footer-box">
                                  <span>Line Items</span>
                                  <strong>{releasePreviewSummary.lineItems}</strong>
                                </div>
                                <div className="release-footer-box">
                                  <span>Total Quantity</span>
                                  <strong>{releasePreviewSummary.totalQuantity}</strong>
                                </div>
                                <div className="release-footer-box">
                                  <span>
                                    {releaseMode === "template"
                                      ? "Food Packs"
                                      : "Pack Equivalent"}
                                  </span>
                                  <strong>
                                    {releaseMode === "template"
                                      ? Number(foodPacksToRelease || 0)
                                      : Number(manualFoodPacksEquivalent || 0)}
                                  </strong>
                                </div>
                              </div>

                              <div className="release-remarks-wrap">
                                <label>Release Remarks</label>
                                <textarea
                                  className="release-textarea"
                                  value={releaseRemarks}
                                  onChange={(e) => setReleaseRemarks(e.target.value)}
                                  placeholder="Add notes for this release..."
                                />
                              </div>

                              <label className="release-check">
                                <input
                                  type="checkbox"
                                  checked={isFinalRelease}
                                  onChange={(e) => setIsFinalRelease(e.target.checked)}
                                />
                                Mark as final release for this request
                              </label>

                              {releaseError ? (
                                <div className="release-feedback error">{releaseError}</div>
                              ) : null}

                              {releaseSuccess ? (
                                <div className="release-feedback success">
                                  {releaseSuccess}
                                </div>
                              ) : null}

                              <div className="release-submit-row">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={clearReleasePlanner}
                                  disabled={releaseSubmitting}
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary release-submit-btn"
                                  onClick={submitRelease}
                                  disabled={releaseSubmitting}
                                >
                                  {releaseSubmitting ? "Submitting..." : "Submit Release"}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </section>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

                    <div className="mode-switch inventory-mode-switch-compact">
          <button
            type="button"
            className={mode === "active" ? "active" : ""}
            onClick={() => setMode("active")}
          >
            Active
          </button>
          <button
            type="button"
            className={mode === "archived" ? "active" : ""}
            onClick={() => setMode("archived")}
          >
            Archived
          </button>
        </div>

            <div className="inventory-card inventory-workspace">
  <div className="inventory-toolbar">
    <div className="inventory-toolbar-top inventory-toolbar-top-split inventory-toolbar-top-clean">
      <div className="inventory-toolbar-left-cluster inventory-toolbar-left-cluster-clean">

        <div className="type-switch inventory-type-switch-compact">
          <button
            type="button"
            className={viewType === "goods" ? "active" : ""}
            onClick={() => setViewType("goods")}
          >
            Goods
          </button>
          <button
            type="button"
            className={viewType === "monetary" ? "active" : ""}
            onClick={() => setViewType("monetary")}
          >
            Monetary
          </button>
        </div>

        {mode === "active" && viewType === "goods" && (
          <div className="type-switch inventory-display-switch">
            <button
              type="button"
              className={goodsDisplayMode === "all" ? "active" : ""}
              onClick={() => setGoodsDisplayMode("all")}
            >
              See All Items
            </button>
            <button
              type="button"
              className={goodsDisplayMode === "grouped" ? "active" : ""}
              onClick={() => setGoodsDisplayMode("grouped")}
            >
              Group by Category
            </button>
          </div>
        )}
      </div>

      <div className="inventory-meta-row">
        <span className="inventory-meta-pill">
          {loadingCurrent ? "Loading..." : `${tableRows.length} visible`}
        </span>
      </div>
    </div>

    <div className="inventory-controls inventory-controls-clean inventory-controls-image-match">
      <input
        type="text"
        className="input inventory-control-input inventory-control-search"
        placeholder={
          viewType === "goods"
            ? "Search item, category, source, notes..."
            : "Search donation, source, description..."
        }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {viewType === "goods" ? (
        <select
          className="input inventory-control-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {(mode === "active"
            ? activeCategoryOptions
            : archivedCategoryOptions
          ).map((category) => (
            <option key={category} value={category}>
              {getCategoryLabel(category)}
            </option>
          ))}
        </select>
      ) : (
        <div className="inventory-control-placeholder" />
      )}

      <select
        className="input inventory-control-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        {viewType === "goods" ? (
          <>
            <option value="createdAt">Date</option>
            <option value="name">Item</option>
            <option value="category">Category</option>
            <option value="quantity">Quantity</option>
          </>
        ) : (
          <>
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
            <option value="amount">Amount</option>
          </>
        )}
      </select>

      <select
        className="input inventory-control-select"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>

      <button
        type="button"
        className="btn btn-secondary inventory-clear-btn"
        onClick={clearFilters}
      >
        Clear
      </button>
    </div>
  </div>

              {loadingCurrent ? (
                <div className="release-empty">Loading inventory...</div>
              ) : error ? (
                <div className="release-feedback error">{error}</div>
              ) : tableRows.length === 0 ? (
                <div className="inventory-empty-surface table-empty">
                  <h4>No records found.</h4>
                  <p>Try adjusting your filters or search keyword.</p>
                </div>
              ) : mode === "active" &&
                viewType === "goods" &&
                goodsDisplayMode === "grouped" ? (
                <div className="inventory-category-groups">
                  {groupedGoodsRows.map(([categoryKey, items]) => {
                    const isExpanded = expandedCategories[categoryKey] !== false;

                    return (
                      <div className="inventory-category-card" key={categoryKey}>
                        <button
                          type="button"
                          className="inventory-category-head"
                          onClick={() => toggleCategoryExpanded(categoryKey)}
                        >
                          <div className="inventory-category-head-main">
                            <strong>{getCategoryLabel(categoryKey)}</strong>
                            <span>
                              {items.length} item(s) •{" "}
                              {items.reduce(
                                (sum, item) => sum + Number(item.quantity || 0),
                                0
                              )}{" "}
                              total stock
                            </span>
                          </div>
                          <span className="inventory-category-toggle">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="table-wrapper">
                            <table className="inventory-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Quantity</th>
                                  <th>Unit</th>
                                  <th>Source</th>
                                  <th>Description</th>
                                  <th>Proof</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item) => (
                                  <tr key={item._mergeKey || item._id}>
                                    <td>
                                      <button
                                        type="button"
                                        className="cell-link"
                                        onClick={() => setSelectedItem(item)}
                                      >
                                        <div className="table-main-cell">
                                          <strong>{item.name || "-"}</strong>
                                          <span>{formatDate(item.createdAt)}</span>
                                        </div>
                                      </button>
                                    </td>
                                    <td>
                                      <span
                                        className={`badge ${
                                          Number(item.quantity || 0) <= 0
                                            ? "empty"
                                            : Number(item.quantity || 0) < 20
                                            ? "low"
                                            : "available"
                                        }`}
                                      >
                                        {Number(item.quantity || 0)}
                                      </span>
                                    </td>
                                    <td>{item.unit || "-"}</td>
                                    <td>
                                      <div className="table-mini-stack">
                                        <strong>
                                          {Array.isArray(item._sourceTypes) &&
                                          item._sourceTypes.length > 0
                                            ? item._sourceTypes
                                                .map((value) => getSourceLabel(value))
                                                .join(", ")
                                            : getSourceLabel(item.sourceType)}
                                        </strong>
                                        <span>
                                          {Array.isArray(item._sourceNames) &&
                                          item._sourceNames.length > 0
                                            ? item._sourceNames.join(", ")
                                            : item.sourceName || "-"}
                                        </span>
                                      </div>
                                    </td>
                                    <td>{item.description || "-"}</td>
                                    <td>{renderProofFiles(item.proofFiles)}</td>
                                    <td>{renderRowActions(item)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="table-wrapper">
                    <table className="inventory-table">
                      <thead>
                        {viewType === "goods" ? (
                          <tr>
                            <th>Item</th>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Source</th>
                            <th>Description</th>
                            <th>Proof</th>
                            <th>Actions</th>
                          </tr>
                        ) : (
                          <tr>
                            <th>Name</th>
                            <th>Amount</th>
                            <th>Source</th>
                            <th>Description</th>
                            <th>Proof</th>
                            <th>Actions</th>
                          </tr>
                        )}
                      </thead>

                      <tbody>
                        {paginatedTableRows.map((item) =>
                          viewType === "goods" ? (
                            <tr key={item._mergeKey || item._id}>
                              <td>
                                <button
                                  type="button"
                                  className="cell-link"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  <div className="table-main-cell">
                                    <strong>{item.name || "-"}</strong>
                                    <span>{formatDate(item.createdAt)}</span>
                                  </div>
                                </button>
                              </td>
                              <td>{getCategoryLabel(item.category)}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    Number(item.quantity || 0) <= 0
                                      ? "empty"
                                      : Number(item.quantity || 0) < 20
                                      ? "low"
                                      : "available"
                                  }`}
                                >
                                  {Number(item.quantity || 0)}
                                </span>
                              </td>
                              <td>{item.unit || "-"}</td>
                              <td>
                                <div className="table-mini-stack">
                                  <strong>
                                    {Array.isArray(item._sourceTypes) &&
                                    item._sourceTypes.length > 0
                                      ? item._sourceTypes
                                          .map((value) => getSourceLabel(value))
                                          .join(", ")
                                      : getSourceLabel(item.sourceType)}
                                  </strong>
                                  <span>
                                    {Array.isArray(item._sourceNames) &&
                                    item._sourceNames.length > 0
                                      ? item._sourceNames.join(", ")
                                      : item.sourceName || "-"}
                                  </span>
                                </div>
                              </td>
                              <td>{item.description || "-"}</td>
                              <td>{renderProofFiles(item.proofFiles)}</td>
                              <td>{renderRowActions(item)}</td>
                            </tr>
                          ) : (
                            <tr key={item._id}>
                              <td>
                                <button
                                  type="button"
                                  className="cell-link"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  <div className="table-main-cell">
                                    <strong>{item.name || "-"}</strong>
                                    <span>{formatDate(item.createdAt)}</span>
                                  </div>
                                </button>
                              </td>
                              <td className="money-cell">
                                ₱{Number(item.amount || 0).toLocaleString()}
                              </td>
                              <td>
                                <div className="table-mini-stack">
                                  <strong>{getSourceLabel(item.sourceType)}</strong>
                                  <span>{item.sourceName || "-"}</span>
                                </div>
                              </td>
                              <td>{item.description || "-"}</td>
                              <td>{renderProofFiles(item.proofFiles)}</td>
                              <td>{renderRowActions(item)}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {tablePageCount > 1 && (
                    <div className="pager">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={(mode === "active" ? tablePage : archivePage) === 1}
                        onClick={() =>
                          mode === "active"
                            ? setTablePage((prev) => prev - 1)
                            : setArchivePage((prev) => prev - 1)
                        }
                      >
                        Prev
                      </button>
                      <span>
                        Page {mode === "active" ? tablePage : archivePage} of{" "}
                        {tablePageCount}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={
                          (mode === "active" ? tablePage : archivePage) ===
                          tablePageCount
                        }
                        onClick={() =>
                          mode === "active"
                            ? setTablePage((prev) => prev + 1)
                            : setArchivePage((prev) => prev + 1)
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedItem && (
              <div
                className="inventory-modal-backdrop"
                onClick={() => setSelectedItem(null)}
              >
                <div
                  className="inventory-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="inventory-modal-head">
                    <div>
                      <h3>{selectedItem.name || "Inventory Details"}</h3>
                      <p>
                        {viewType === "goods"
                          ? getCategoryLabel(selectedItem.category)
                          : "Monetary donation"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inventory-modal-close"
                      onClick={() => setSelectedItem(null)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="inventory-modal-grid">
                    {viewType === "goods" ? (
                      <>
                        <div className="modal-stat">
                          <span>Quantity</span>
                          <strong>{Number(selectedItem.quantity || 0)}</strong>
                        </div>
                        <div className="modal-stat">
                          <span>Unit</span>
                          <strong>{selectedItem.unit || "-"}</strong>
                        </div>
                      </>
                    ) : (
                      <div className="modal-stat">
                        <span>Amount</span>
                        <strong>
                          ₱{Number(selectedItem.amount || 0).toLocaleString()}
                        </strong>
                      </div>
                    )}

                    <div className="modal-stat">
                      <span>Source Type</span>
                      <strong>
                        {Array.isArray(selectedItem._sourceTypes) &&
                        selectedItem._sourceTypes.length > 0
                          ? selectedItem._sourceTypes
                              .map((value) => getSourceLabel(value))
                              .join(", ")
                          : getSourceLabel(selectedItem.sourceType)}
                      </strong>
                    </div>

                    <div className="modal-stat">
                      <span>Source Name</span>
                      <strong>
                        {Array.isArray(selectedItem._sourceNames) &&
                        selectedItem._sourceNames.length > 0
                          ? selectedItem._sourceNames.join(", ")
                          : selectedItem.sourceName || "-"}
                      </strong>
                    </div>

                    <div className="modal-stat">
                      <span>Added By</span>
                      <strong>{selectedItem.addedBy || "-"}</strong>
                    </div>

                    <div className="modal-stat">
                      <span>Date Added</span>
                      <strong>{formatDate(selectedItem.createdAt)}</strong>
                    </div>
                  </div>

                  <div className="inventory-modal-section">
                    <h4>Description</h4>
                    <p>{selectedItem.description || "No description provided."}</p>
                  </div>

                  <div className="inventory-modal-section">
                    <h4>Proof Files</h4>
                    {renderProofFiles(selectedItem.proofFiles)}
                  </div>

                  <div className="inventory-modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedItem(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {templateModalOpen && (
              <div
                className="inventory-modal-backdrop"
                onClick={closeTemplateModal}
              >
                <div
                  className="inventory-modal template-builder-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="inventory-modal-head">
                    <div>
                      <h3>
                        {editingTemplateId ? "Edit Food Pack Template" : "Create Food Pack Template"}
                      </h3>
                      <p>
                        Configure reusable goods combinations for faster release
                        preparation.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="inventory-modal-close"
                      onClick={closeTemplateModal}
                    >
                      ×
                    </button>
                  </div>

                  <div className="template-builder-form">
                    <div className="inventory-modal-grid">
                      <div className="release-selection-field">
                        <label>Template Name</label>
                        <input
                          type="text"
                          className="input"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Enter template name"
                        />
                      </div>

                      <div className="release-selection-field">
                        <label>Description</label>
                        <input
                          type="text"
                          className="input"
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>

                    <div className="release-mode-layout">
                      <div className="release-panel">
                        <div className="release-panel-head">
                          <h3>Available Goods</h3>
                          <input
                            type="text"
                            className="input"
                            value={templateBuilderSearch}
                            onChange={(e) => setTemplateBuilderSearch(e.target.value)}
                            placeholder="Search goods..."
                          />
                        </div>

                        {templateCatalog.length === 0 ? (
                          <div className="release-empty">No goods found.</div>
                        ) : (
                          <div className="table-wrapper">
                            <table className="inventory-table">
                              <thead>
                                <tr>
                                  <th>Item</th>
                                  <th>Category</th>
                                  <th>Stock</th>
                                  <th>Unit</th>
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {templateCatalog.map((item) => (
                                  <tr key={item._id}>
                                    <td>{item.name || "-"}</td>
                                    <td>{getCategoryLabel(item.category)}</td>
                                    <td>{Number(item.quantity || 0)}</td>
                                    <td>{item.unit || "-"}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-outline btn-sm"
                                        onClick={() => addTemplateItem(item)}
                                      >
                                        Add
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="release-panel">
                        <div className="release-panel-head">
                          <h3>Template Items</h3>
                          <span>{templateItems.length} item(s)</span>
                        </div>

                        {templateItems.length === 0 ? (
                          <div className="release-empty">
                            Add goods from the inventory list.
                          </div>
                        ) : (
                          <div className="release-selection-list">
                            {templateItems.map((item) => (
                              <div
                                className="release-selection-card"
                                key={item.inventoryItemId}
                              >
                                <div className="release-selection-head">
                                  <div>
                                    <strong>{item.itemName}</strong>
                                    <span>
                                      {getCategoryLabel(item.category)} • {item.unit}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                      removeTemplateItem(item.inventoryItemId)
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="release-selection-grid">
                                  <div className="release-selection-field">
                                    <label>Quantity Per Pack</label>
                                    <input
                                      type="number"
                                      min="1"
                                      className="input"
                                      value={item.quantityPerPack}
                                      onChange={(e) =>
                                        updateTemplateItem(
                                          item.inventoryItemId,
                                          "quantityPerPack",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="release-selection-field">
                                    <label>Unit</label>
                                    <input
                                      type="text"
                                      className="input"
                                      value={item.unit}
                                      onChange={(e) =>
                                        updateTemplateItem(
                                          item.inventoryItemId,
                                          "unit",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>

                                  <div className="release-selection-field release-selection-field-wide">
                                    <label>Remarks</label>
                                    <input
                                      type="text"
                                      className="input"
                                      value={item.remarks}
                                      onChange={(e) =>
                                        updateTemplateItem(
                                          item.inventoryItemId,
                                          "remarks",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {templateError ? (
                      <div className="release-feedback error">{templateError}</div>
                    ) : null}

                    {templateSuccess ? (
                      <div className="release-feedback success">{templateSuccess}</div>
                    ) : null}

                    <div className="inventory-modal-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={closeTemplateModal}
                        disabled={templateSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={saveTemplate}
                        disabled={templateSubmitting}
                      >
                        {templateSubmitting ? "Saving..." : "Save Template"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </DashboardShell>
);
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
}