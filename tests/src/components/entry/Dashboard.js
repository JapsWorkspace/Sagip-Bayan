import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaCloudSun,
  FaEdit,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFacebookF,
  FaMapMarkedAlt,
  FaPhoneAlt,
  FaSave,
  FaShieldAlt,
  FaSms,
  FaTimes,
  FaTrash,
  FaExclamationTriangle,
  FaMap,
  FaBullhorn,
  FaLocationArrow,
  FaWind,
  FaTint,
  FaHome,
} from "react-icons/fa";
import "../css/Dashboard.css";

import jaenlogo from "../../assets/images/jaenlogo.png";
import hero1 from "../../assets/images/hero1.jpg";
import hero2 from "../../assets/images/hero2.jpg";
import hero3 from "../../assets/images/hero3.jpg";
import EvacMap from "../map/Map";

const BASE_URL =
  (process.env.REACT_APP_API_URL || "https://gaganadapat.onrender.com").replace(
    /\/+$/,
    ""
  );

const JAEN_COORDS = {
  latitude: 15.3274,
  longitude: 120.9192,
};

const heroImages = [hero2, hero1, hero3];

const DEFAULT_SITE_CONTENT = {
  hero: {
    title: "Jaen MDRRMO Public Information Portal",
    subtitle:
      "Official weather, evacuation areas, advisories, emergency contacts, and barangay-focused public safety information for Jaen, Nueva Ecija.",
    primaryCtaLabel: "View Weather",
    secondaryCtaLabel: "Emergency Contacts",
  },
  alert: {
    enabled: true,
    level: "Advisory",
    text: "Monitor official weather updates and keep emergency contact lines accessible.",
  },
  announcements: [
    {
      id: `ann-${Date.now()}-1`,
      title: "Preparedness Reminder",
      body: "Keep go-bags ready, secure important documents, and monitor MDRRMO advisories during unstable weather.",
      tag: "Public Advisory",
    },
    {
      id: `ann-${Date.now()}-2`,
      title: "Evacuation Readiness",
      body: "Barangays should review local evacuation areas and identify households needing priority assistance.",
      tag: "Operations",
    },
  ],
  tips: [
    { id: "tip-1", text: "Prepare a go-bag for each household member." },
    { id: "tip-2", text: "Keep flashlights, batteries, and water ready." },
    { id: "tip-3", text: "Save emergency numbers on every family phone." },
    { id: "tip-4", text: "Follow official advisories and avoid rumor-based posts." },
  ],
  hotlines: [
    {
      id: "hot-1",
      label: "Emergency Hotline",
      number: "0999-000-0000",
      type: "call",
    },
    {
      id: "hot-2",
      label: "SMS Hotline",
      number: "0999-000-0001",
      type: "sms",
    },
    {
      id: "hot-3",
      label: "Email",
      number: "jaenmdrrmo@example.com",
      type: "email",
    },
    {
      id: "hot-4",
      label: "Facebook Page",
      number: "https://facebook.com/",
      type: "link",
    },
  ],
  office: {
    name: "Jaen MDRRMO",
    address: "Jaen, Nueva Ecija",
    hours: "Office hours may vary during emergencies.",
    email: "jaenmdrrmo@example.com",
    facebook: "https://facebook.com/",
  },
};

const LIMITS = {
  announcements: 5,
  tips: 6,
  hotlines: 4,
};

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "weather", label: "Weather" },
  { id: "public-evac-map", label: "Evacuation" },
  { id: "hazard-focus", label: "Hazard" },
  { id: "incident-focus", label: "Incidents" },
  { id: "updates", label: "Updates" },
  { id: "footer-info", label: "Contacts" },
];

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function safeLower(value) {
  return String(value || "").toLowerCase().trim();
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

function weatherCodeLabel(code) {
  const map = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Severe thunderstorm",
  };
  return map[code] || "Weather update";
}

function weatherIconTone(code) {
  if ([95, 96, 99].includes(code)) return "storm";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([45, 48].includes(code)) return "fog";
  if ([0, 1, 2].includes(code)) return "clear";
  return "cloud";
}

function getRainAdvisory(rainChance) {
  const value = Number(rainChance || 0);
  if (value >= 70) return "High likelihood of rain today";
  if (value >= 40) return "Possible rain later today";
  if (value >= 20) return "Low to moderate chance of rain";
  return "Minimal chance of rain today";
}

function normalizeSitePayload(payload) {
  return {
    hero: {
      ...DEFAULT_SITE_CONTENT.hero,
      ...(payload?.hero || {}),
    },
    alert: {
      ...DEFAULT_SITE_CONTENT.alert,
      ...(payload?.alert || {}),
    },
    announcements: Array.isArray(payload?.announcements)
      ? payload.announcements.slice(0, LIMITS.announcements)
      : DEFAULT_SITE_CONTENT.announcements,
    tips: Array.isArray(payload?.tips)
      ? payload.tips.slice(0, LIMITS.tips)
      : DEFAULT_SITE_CONTENT.tips,
    hotlines: Array.isArray(payload?.hotlines)
      ? payload.hotlines.slice(0, LIMITS.hotlines)
      : DEFAULT_SITE_CONTENT.hotlines,
    office: {
      ...DEFAULT_SITE_CONTENT.office,
      ...(payload?.office || {}),
    },
  };
}

function sanitizeSearchInput(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function PublicMapLegend() {
  return (
    <div className="public-map-legend" aria-label="Map legend">
      <div className="public-map-legend-title">Map Legend</div>

      <div className="public-map-legend-items">
        <div className="public-map-legend-item">
          <span className="public-map-dot available" />
          <span>Available</span>
        </div>

        <div className="public-map-legend-item">
          <span className="public-map-dot limited" />
          <span>Limited</span>
        </div>

        <div className="public-map-legend-item">
          <span className="public-map-dot full" />
          <span>Full</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [currentHero, setCurrentHero] = useState(0);

  const [siteContent, setSiteContent] = useState(DEFAULT_SITE_CONTENT);
  const [draftContent, setDraftContent] = useState(DEFAULT_SITE_CONTENT);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [activeSection, setActiveSection] = useState("home");

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isVisitorMode, setIsVisitorMode] = useState(false);

  const [publicPlaces, setPublicPlaces] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");
  const [selectedPublicPlaceId, setSelectedPublicPlaceId] = useState(null);
  const [publicBarangayFilter, setPublicBarangayFilter] = useState("all");

  const observerRef = useRef(null);
  const navigate = useNavigate();

  const isPrivilegedUser = useMemo(() => {
    return ["drrmo", "admin"].includes(safeLower(userRole));
  }, [userRole]);

  const canEdit = isPrivilegedUser && !isVisitorMode;
  const heroBg = heroImages[currentHero] || null;
  const topWeather = weather?.current || null;

  const todaySummary = useMemo(() => {
    if (!weather?.daily) {
      return {
        high: "--",
        low: "--",
        rain: "--",
      };
    }

    return {
      high: Math.round(weather.daily.temperature_2m_max?.[0] || 0),
      low: Math.round(weather.daily.temperature_2m_min?.[0] || 0),
      rain: weather.daily.precipitation_probability_max?.[0] ?? 0,
    };
  }, [weather]);

  const forecastCards = useMemo(() => {
    const days = weather?.daily?.time || [];
    return days.slice(0, 3).map((day, idx) => ({
      key: day,
      label:
        idx === 0
          ? "Today"
          : idx === 1
          ? "Tomorrow"
          : new Date(day).toLocaleDateString("en-PH", { weekday: "short" }),
      condition: weatherCodeLabel(weather?.daily?.weather_code?.[idx]),
      high: Math.round(weather?.daily?.temperature_2m_max?.[idx] || 0),
      low: Math.round(weather?.daily?.temperature_2m_min?.[idx] || 0),
      rain: weather?.daily?.precipitation_probability_max?.[idx] ?? 0,
      code: weather?.daily?.weather_code?.[idx],
    }));
  }, [weather]);

  const publicBarangayOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        publicPlaces
          .map((item) => String(item?.barangayName || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return names;
  }, [publicPlaces]);

  const filteredPublicPlaces = useMemo(() => {
    if (publicBarangayFilter === "all") return publicPlaces;

    return publicPlaces.filter(
      (item) =>
        safeLower(item?.barangayName) === safeLower(publicBarangayFilter)
    );
  }, [publicPlaces, publicBarangayFilter]);

  const publicMapSummary = useMemo(() => {
    const source = filteredPublicPlaces;

    const availableCount = source.filter(
      (item) => safeLower(item?.capacityStatus) === "available"
    ).length;

    const limitedCount = source.filter(
      (item) => safeLower(item?.capacityStatus) === "limited"
    ).length;

    const fullCount = source.filter(
      (item) => safeLower(item?.capacityStatus) === "full"
    ).length;

    return {
      total: source.length,
      availableCount,
      limitedCount,
      fullCount,
    };
  }, [filteredPublicPlaces]);

  const selectedPublicPlace = useMemo(() => {
    return (
      filteredPublicPlaces.find(
        (item) => String(item?._id) === String(selectedPublicPlaceId)
      ) || null
    );
  }, [filteredPublicPlaces, selectedPublicPlaceId]);

  const focusedBarangayLabel =
    publicBarangayFilter === "all" ? "All Barangays" : publicBarangayFilter;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPublicContent();
    detectRole();
    fetchWeather();
    fetchPublicPlaces();
  }, []);

  useEffect(() => {
    if (!canEdit && isEditorOpen) {
      setIsEditorOpen(false);
    }
  }, [canEdit, isEditorOpen]);

  useEffect(() => {
    if (!filteredPublicPlaces.length) {
      setSelectedPublicPlaceId(null);
      return;
    }

    const stillExists = filteredPublicPlaces.some(
      (item) => String(item?._id) === String(selectedPublicPlaceId)
    );

    if (!stillExists) {
      setSelectedPublicPlaceId(filteredPublicPlaces[0]?._id || null);
    }
  }, [filteredPublicPlaces, selectedPublicPlaceId]);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.8],
      }
    );

    elements.forEach((element) => observerRef.current.observe(element));

    return () => observerRef.current?.disconnect();
  }, [filteredPublicPlaces.length, weatherLoading, mapLoading]);

  const scrollToId = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToWeather = () => scrollToId("weather");
  const scrollToMap = () => scrollToId("public-evac-map");
  const scrollToUpdates = () => scrollToId("updates");
  const scrollToPreparedness = () => scrollToId("preparedness");
  const scrollToFooter = () => scrollToId("footer-info");

  function handleNavClick(id) {
    setActiveSection(id);
    scrollToId(id);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const value = sanitizeSearchInput(searchText).toLowerCase();

    if (!value) return;

    setSearchText(value);

    if (
      value.includes("weather") ||
      value.includes("rain") ||
      value.includes("forecast") ||
      value.includes("wind")
    ) {
      scrollToWeather();
      return;
    }

    if (
      value.includes("evac") ||
      value.includes("map") ||
      value.includes("barangay") ||
      value.includes("shelter")
    ) {
      scrollToMap();
      return;
    }

    if (
      value.includes("hazard") ||
      value.includes("flood") ||
      value.includes("risk")
    ) {
      scrollToId("hazard-focus");
      return;
    }

    if (
      value.includes("incident") ||
      value.includes("report") ||
      value.includes("emergency case")
    ) {
      scrollToId("incident-focus");
      return;
    }

    if (
      value.includes("announcement") ||
      value.includes("update") ||
      value.includes("advisory")
    ) {
      scrollToUpdates();
      return;
    }

    if (
      value.includes("prepared") ||
      value.includes("guide") ||
      value.includes("tip") ||
      value.includes("safety")
    ) {
      scrollToPreparedness();
      return;
    }

    if (
      value.includes("contact") ||
      value.includes("office") ||
      value.includes("hotline") ||
      value.includes("email")
    ) {
      scrollToFooter();
      return;
    }

    scrollToId("home");
  }

  async function detectRole() {
    try {
      const res = await fetch(`${BASE_URL}/api/debug-session`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUserRole("");
        return;
      }

      const data = await res.json();
      const sessionRole = safeLower(data?.role || data?.session?.role || "");

      if (sessionRole === "admin" || sessionRole === "drrmo") {
        setUserRole(sessionRole);
        return;
      }

      setUserRole("");
    } catch (err) {
      setUserRole("");
    }
  }

  function goBackToModules() {
    const role = safeLower(userRole);

    if (role === "admin") {
      navigate("/admin/dashboard");
      return;
    }

    if (role === "drrmo") {
      navigate("/drrmo/dashboard");
      return;
    }

    navigate(-1);
  }

  async function loadPublicContent() {
    try {
      const res = await fetch(`${BASE_URL}/api/public-site`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const source = data?.data || data;
        const normalized = normalizeSitePayload(source);

        setSiteContent(normalized);
        setDraftContent(normalized);
        localStorage.setItem("publicSiteContent", JSON.stringify(normalized));
        return;
      }
    } catch (err) {
      // fallback below
    }

    const localData = safeJsonParse(
      localStorage.getItem("publicSiteContent"),
      DEFAULT_SITE_CONTENT
    );

    const normalized = normalizeSitePayload(localData);
    setSiteContent(normalized);
    setDraftContent(normalized);
  }

  async function fetchWeather() {
    setWeatherLoading(true);
    setWeatherError("");

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${JAEN_COORDS.latitude}` +
        `&longitude=${JAEN_COORDS.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
        `&timezone=auto&forecast_days=3`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || data?.error) {
        throw new Error(data?.reason || "Unable to load weather.");
      }

      setWeather({
        current: data.current,
        daily: data.daily,
      });
    } catch (err) {
      setWeatherError("Weather unavailable right now.");
    } finally {
      setWeatherLoading(false);
    }
  }

  async function fetchPublicPlaces() {
    setMapLoading(true);
    setMapError("");

    try {
      const res = await fetch(`${BASE_URL}/evacs/public`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load public evacuation areas.");
      }

      const data = await res.json();
      const payload = Array.isArray(data) ? data : [];

      setPublicPlaces(payload);

      if (payload.length && !selectedPublicPlaceId) {
        setSelectedPublicPlaceId(payload[0]._id);
      }
    } catch (err) {
      console.error("fetchPublicPlaces error:", err);
      setMapError("Public evacuation map is unavailable right now.");
      setPublicPlaces([]);
    } finally {
      setMapLoading(false);
    }
  }

  function updateDraft(path, value) {
    setDraftContent((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let ref = next;

      for (let i = 0; i < keys.length - 1; i += 1) {
        ref = ref[keys[i]];
      }

      ref[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function addItem(section, template) {
    setDraftContent((prev) => {
      if (prev[section].length >= LIMITS[section]) return prev;

      return {
        ...prev,
        [section]: [
          ...prev[section],
          {
            id: `${section}-${Date.now()}`,
            ...template,
          },
        ],
      };
    });
  }

  function removeItem(section, id) {
    setDraftContent((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  }

  async function saveSiteContent() {
    if (!canEdit) return;

    setIsSaving(true);
    setSaveMessage("");

    const trimmedPayload = normalizeSitePayload({
      ...draftContent,
      announcements: draftContent.announcements.map((item) => ({
        ...item,
        title: item.title?.slice(0, 80) || "",
        body: item.body?.slice(0, 180) || "",
        tag: item.tag?.slice(0, 32) || "",
      })),
      tips: draftContent.tips.map((item) => ({
        ...item,
        text: item.text?.slice(0, 120) || "",
      })),
      hotlines: draftContent.hotlines.map((item) => ({
        ...item,
        label: item.label?.slice(0, 40) || "",
        number: item.number?.slice(0, 120) || "",
      })),
      hero: {
        ...draftContent.hero,
        title: draftContent.hero.title?.slice(0, 90) || "",
        subtitle: draftContent.hero.subtitle?.slice(0, 180) || "",
        primaryCtaLabel: draftContent.hero.primaryCtaLabel?.slice(0, 24) || "",
        secondaryCtaLabel:
          draftContent.hero.secondaryCtaLabel?.slice(0, 24) || "",
      },
      alert: {
        ...draftContent.alert,
        level: draftContent.alert.level?.slice(0, 20) || "",
        text: draftContent.alert.text?.slice(0, 180) || "",
      },
      office: {
        ...draftContent.office,
        name: draftContent.office.name?.slice(0, 50) || "",
        address: draftContent.office.address?.slice(0, 120) || "",
        hours: draftContent.office.hours?.slice(0, 120) || "",
        email: draftContent.office.email?.slice(0, 80) || "",
        facebook: draftContent.office.facebook?.slice(0, 120) || "",
      },
    });

    try {
      const res = await fetch(`${BASE_URL}/api/public-site`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(trimmedPayload),
      });

      if (!res.ok) {
        throw new Error("Failed to save.");
      }

      const result = await res.json();
      const normalized = normalizeSitePayload(result?.data || trimmedPayload);

      setSiteContent(normalized);
      setDraftContent(normalized);
      localStorage.setItem("publicSiteContent", JSON.stringify(normalized));
      setSaveMessage("Landing page updated.");
    } catch (err) {
      localStorage.setItem("publicSiteContent", JSON.stringify(trimmedPayload));
      setSiteContent(trimmedPayload);
      setDraftContent(trimmedPayload);
      setSaveMessage("Saved locally. Check API if database save is unavailable.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="dashboard-header-shell">
            <div className="brand-left">
              {jaenlogo ? (
                <img src={jaenlogo} alt="Jaen Logo" className="logo-img" />
              ) : (
                <div className="logo-fallback">LOGO</div>
              )}

              <div className="brand-text">
                <div className="brand-topline">MUNICIPALITY OF JAEN</div>
                <div className="brand-name">JAEN, NUEVA ECIJA</div>
                <div className="brand-sub">MDRRMO Public Safety and Information Portal</div>
              </div>
            </div>

            <div className="header-right">
              <form className="header-search-wrap" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  className="header-search"
                  placeholder="Search weather, hazard, incident, barangay, contacts..."
                  value={searchText}
                  onChange={(e) => setSearchText(sanitizeSearchInput(e.target.value))}
                />
              </form>

              {isPrivilegedUser && (
                <div className="mode-toggle-wrap">
                  <button
                    type="button"
                    className={`mode-toggle-btn ${!isVisitorMode ? "active" : ""}`}
                    onClick={() => setIsVisitorMode(false)}
                  >
                    <FaEdit />
                    <span>Editor Mode</span>
                  </button>

                  <button
                    type="button"
                    className={`mode-toggle-btn ${isVisitorMode ? "active" : ""}`}
                    onClick={() => {
                      setIsVisitorMode(true);
                      setIsEditorOpen(false);
                    }}
                  >
                    <FaEye />
                    <span>Visitor Mode</span>
                  </button>
                </div>
              )}

              {canEdit && (
                <button
                  className="editor-toggle-btn"
                  onClick={() => setIsEditorOpen((prev) => !prev)}
                  type="button"
                >
                  <FaEdit />
                  <span>{isEditorOpen ? "Close Editor" : "Edit Landing"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-nav-shell">
            <nav className="nav-links" aria-label="Primary navigation">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-link-btn ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="nav-current-indicator">
              <span>Current section</span>
              <strong>
                {NAV_ITEMS.find((item) => item.id === activeSection)?.label || "Home"}
              </strong>
            </div>
          </div>
        </header>

        {isPrivilegedUser && (
          <section className="mode-preview-bar">
            <div className="mode-preview-left">
              {isVisitorMode ? <FaEye /> : <FaEyeSlash />}
              <strong>{isVisitorMode ? "Visitor Mode" : "Editor Mode"}</strong>
            </div>

            <p>
              {isVisitorMode
                ? "You are previewing the public landing page exactly like a normal visitor."
                : "You can edit the landing page. Switch to Visitor Mode to preview the public view without logging out."}
            </p>
          </section>
        )}

        {siteContent.alert.enabled && (
          <section className="alert-strip" aria-label="Public advisory">
            <div className="alert-left">
              <FaBell />
              <span
                className={`alert-badge alert-${safeLower(
                  siteContent.alert.level
                )}`}
              >
                {siteContent.alert.level}
              </span>
            </div>
            <p>{siteContent.alert.text}</p>
          </section>
        )}

        <section
          className={`landing-hero ${heroBg ? "landing-hero-has-bg" : ""}`}
          style={heroBg ? { backgroundImage: `url(${heroBg})` } : {}}
          id="home"
        >
          <div className="landing-hero-overlay">
            <div className="landing-wide-shell">
              <div className="landing-hero-grid">
                <div className="landing-hero-copy">
                  <div className="hero-kicker">
                    Municipal Disaster Risk Reduction and Management Office
                  </div>

                  <h1>{siteContent.hero.title}</h1>
                  <p>{siteContent.hero.subtitle}</p>

                  <div className="landing-hero-actions">
                    <button
                      type="button"
                      className="hero-btn primary"
                      onClick={scrollToWeather}
                    >
                      {siteContent.hero.primaryCtaLabel || "View Weather"}
                    </button>

                    <button
                      type="button"
                      className="hero-btn secondary"
                      onClick={scrollToMap}
                    >
                      View Evacuation Map
                    </button>

                    <button
                      type="button"
                      className="hero-btn ghost"
                      onClick={scrollToFooter}
                    >
                      {siteContent.hero.secondaryCtaLabel || "Emergency Contacts"}
                    </button>
                  </div>

                  <div className="hero-highlights">
                    <div className="hero-highlight-card">
                      <FaCloudSun />
                      <div>
                        <strong>Live Weather Outlook</strong>
                        <span>Quick rain, wind, and temperature view for Jaen.</span>
                      </div>
                    </div>

                    <div className="hero-highlight-card">
                      <FaMap />
                      <div>
                        <strong>Barangay-Based Public Map</strong>
                        <span>Focus the page on a specific barangay when needed.</span>
                      </div>
                    </div>

                    <div className="hero-highlight-card">
                      <FaBell />
                      <div>
                        <strong>Official Advisories</strong>
                        <span>Updates, preparedness, contacts, and public guidance.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="landing-hero-side">
                  <div className="hero-status-panel">
                    <div className="hero-status-head">
                      <span>Current focus</span>
                      <strong>{focusedBarangayLabel}</strong>
                    </div>

                    {weatherLoading ? (
                      <div className="weather-loading-box">Loading weather…</div>
                    ) : weatherError ? (
                      <div className="weather-loading-box error">{weatherError}</div>
                    ) : (
                      <div className={`hero-weather-compact tone-${weatherIconTone(topWeather?.weather_code)}`}>
                        <div className="hero-weather-compact-main">
                          <div className="hero-weather-icon">
                            <FaCloudSun />
                          </div>

                          <div className="hero-weather-compact-copy">
                            <strong>{Math.round(topWeather?.temperature_2m || 0)}°C</strong>
                            <span>{weatherCodeLabel(topWeather?.weather_code)}</span>
                          </div>

                          <div className="hero-weather-compact-rain">
                            <label>Rain</label>
                            <b>{todaySummary.rain}%</b>
                          </div>
                        </div>

                        <div className="hero-weather-compact-grid">
                          <div>
                            <label>High / Low</label>
                            <strong>
                              {todaySummary.high}° / {todaySummary.low}°
                            </strong>
                          </div>
                          <div>
                            <label>Feels Like</label>
                            <strong>{Math.round(topWeather?.apparent_temperature || 0)}°</strong>
                          </div>
                          <div>
                            <label>Humidity</label>
                            <strong>{topWeather?.relative_humidity_2m ?? 0}%</strong>
                          </div>
                          <div>
                            <label>Wind</label>
                            <strong>{Math.round(topWeather?.wind_speed_10m || 0)} km/h</strong>
                          </div>
                        </div>

                        <div className="hero-weather-note">
                          {getRainAdvisory(todaySummary.rain)}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              <div className="hero-slide-indicators" aria-hidden="true">
                {heroImages.map((_, index) => (
                  <span
                    key={`hero-dot-${index}`}
                    className={`hero-slide-dot ${currentHero === index ? "active" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <main className="landing-main">
          <div className="landing-wide-shell">
            <section className="weather-landing-section" id="weather">
              <div className="landing-section-head landing-section-head-spread">
                <div>
                  <span className="section-kicker">Weather Overview</span>
                  <h2>Local Weather Forecast</h2>
                  <p>Today’s conditions, rain outlook, and short-term forecast for Jaen.</p>
                </div>

                <button
                  className="inline-action-btn"
                  onClick={fetchWeather}
                  type="button"
                >
                  Refresh
                </button>
              </div>

              {weatherLoading ? (
                <div className="panel-empty">Loading weather…</div>
              ) : weatherError ? (
                <div className="panel-empty error">{weatherError}</div>
              ) : (
                <section className={`weather-connected-surface tone-${weatherIconTone(topWeather?.weather_code)}`}>
                  <div className="weather-connected-main">
                    <div className="weather-connected-summary">
                      <div className="weather-connected-heading">
                        <span className="muted-label">Now in {focusedBarangayLabel}</span>
                        <div className="weather-connected-pill">
                          <FaCloudSun />
                          <span>{todaySummary.rain}% rain chance</span>
                        </div>
                      </div>

                      <div className="weather-connected-temp-row">
                        <div className="weather-connected-temp-block">
                          <h3>{Math.round(topWeather?.temperature_2m || 0)}°C</h3>
                          <p>{weatherCodeLabel(topWeather?.weather_code)}</p>
                        </div>

                        <div className="weather-connected-story">
                          <strong>Today at a glance</strong>
                          <span>
                            {getRainAdvisory(todaySummary.rain)} with expected high of{" "}
                            {todaySummary.high}° and low of {todaySummary.low}°.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="weather-connected-stats">
                      <div className="weather-connected-stat">
                        <label>Feels Like</label>
                        <strong>
                          {Math.round(topWeather?.apparent_temperature || 0)}°C
                        </strong>
                      </div>

                      <div className="weather-connected-stat">
                        <label>Humidity</label>
                        <strong>{topWeather?.relative_humidity_2m ?? 0}%</strong>
                      </div>

                      <div className="weather-connected-stat">
                        <label>Wind</label>
                        <strong>
                          {Math.round(topWeather?.wind_speed_10m || 0)} km/h
                        </strong>
                      </div>

                      <div className="weather-connected-stat">
                        <label>High / Low</label>
                        <strong>
                          {todaySummary.high}° / {todaySummary.low}°
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="weather-connected-forecast">
                    {forecastCards.map((item) => (
                      <article
                        key={item.key}
                        className={`weather-outlook-card tone-${weatherIconTone(item.code)}`}
                      >
                        <div className="weather-outlook-head">
                          <div>
                            <span>{item.label}</span>
                            <small>{item.condition}</small>
                          </div>
                        </div>

                        <div className="weather-outlook-temp">
                          <strong>{item.high}°</strong>
                          <span>{item.low}°</span>
                        </div>

                        <div className="weather-outlook-rain">{item.rain}% rain</div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </section>

            <section className="landing-content-grid">
              <section className="landing-map-column" id="public-evac-map">
                <div className="landing-map-shell">
                  <div className="landing-section-head">
                    <div>
                      <span className="section-kicker">Evacuation Areas</span>
                      <h2>Public Evacuation Map</h2>
                      <p>View public evacuation areas and capacity status by barangay.</p>
                    </div>
                  </div>

                  <div className="public-map-toolbar">
                    <label className="public-map-filter">
                      <span>Barangay</span>
                      <select
                        value={publicBarangayFilter}
                        onChange={(e) => setPublicBarangayFilter(e.target.value)}
                      >
                        <option value="all">All Barangays</option>
                        {publicBarangayOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="public-map-mini-summary">
                      <span className="mini-status available">
                        {formatNumber(publicMapSummary.availableCount)} available
                      </span>
                      <span className="mini-status limited">
                        {formatNumber(publicMapSummary.limitedCount)} limited
                      </span>
                      <span className="mini-status full">
                        {formatNumber(publicMapSummary.fullCount)} full
                      </span>
                    </div>
                  </div>

                  {mapLoading ? (
                    <div className="panel-empty">Loading evacuation map…</div>
                  ) : mapError ? (
                    <div className="panel-empty error">{mapError}</div>
                  ) : (
                    <>
                      <div className="landing-map-stage">
                        <PublicMapLegend />

                        <EvacMap
                          places={filteredPublicPlaces}
                          pickMode={false}
                          publicMode={true}
                          onSelectLocation={() => {}}
                          onSelectPlace={(place) => {
                            if (!place?._id) return;
                            setSelectedPublicPlaceId(place._id);
                          }}
                        />
                      </div>

                      {selectedPublicPlace && (
                        <div className="selected-place-summary">
                          <div className="selected-place-copy">
                            <strong>{selectedPublicPlace.name}</strong>
                            <span>
                              {selectedPublicPlace.barangayName || "Jaen"} •{" "}
                              {selectedPublicPlace.location || "No location provided"}
                            </span>
                          </div>

                          <div
                            className={`selected-place-status ${safeLower(
                              selectedPublicPlace.capacityStatus
                            )}`}
                          >
                            {selectedPublicPlace.capacityStatus || "Available"}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>

              <aside className="landing-side-column">
                <section className="landing-side-card" id="hazard-focus">
                  <div className="landing-section-head">
                    <div>
                      <span className="section-kicker">Hazard Focus</span>
                      <h2>Hazard Monitoring</h2>
                    </div>
                  </div>

                  <div className="focus-status-panel">
                    <div className="focus-status-row">
                      <FaExclamationTriangle />
                      <div>
                        <strong>{focusedBarangayLabel}</strong>
                        <span>
                          Public hazard map section is now placed here for barangay-focused viewing.
                        </span>
                      </div>
                    </div>

                    <div className="focus-grid">
                      <div className="focus-card">
                        <span>Focused Barangay</span>
                        <strong>{focusedBarangayLabel}</strong>
                      </div>
                      <div className="focus-card">
                        <span>Evac Areas Visible</span>
                        <strong>{formatNumber(publicMapSummary.total)}</strong>
                      </div>
                    </div>

                    <div className="focus-placeholder">
                      <FaMapMarkedAlt />
                      <div>
                        <strong>Hazard map layer ready</strong>
                        <span>
                          Connect your real hazard layer or endpoint here later for flood, storm surge, or risk overlays.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="landing-side-card" id="incident-focus">
                  <div className="landing-section-head">
                    <div>
                      <span className="section-kicker">Incident Focus</span>
                      <h2>Incident Monitoring</h2>
                    </div>
                  </div>

                  <div className="focus-status-panel">
                    <div className="focus-status-row">
                      <FaBullhorn />
                      <div>
                        <strong>Barangay-centered incident section</strong>
                        <span>
                          The layout is ready for per-barangay incident visualization and public-facing summaries.
                        </span>
                      </div>
                    </div>

                    <div className="focus-grid">
                      <div className="focus-card">
                        <span>Current Focus</span>
                        <strong>{focusedBarangayLabel}</strong>
                      </div>
                      <div className="focus-card">
                        <span>Page Mode</span>
                        <strong>Public Information</strong>
                      </div>
                    </div>

                    <div className="focus-placeholder">
                      <FaMap />
                      <div>
                        <strong>Incident map slot ready</strong>
                        <span>
                          Plug in your incident data source here to show clustered or per-barangay incidents.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </aside>
            </section>

            <section className="lower-info-grid">
              <section className="landing-side-card" id="updates">
                <div className="landing-section-head">
                  <div>
                    <span className="section-kicker">Official Notices</span>
                    <h2>More Official Updates</h2>
                  </div>
                </div>

                <div className="landing-update-list landing-update-list-wide">
                  {siteContent.announcements.slice(0, 4).map((item, index) => (
                    <article
                      key={item.id || item._id || `${item.title}-${index}`}
                      className="landing-update-card"
                    >
                      <div className="announcement-tag">{item.tag || "Update"}</div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="landing-side-card" id="preparedness">
                <div className="landing-section-head">
                  <div>
                    <span className="section-kicker">Preparedness</span>
                    <h2>What to Prepare</h2>
                  </div>
                </div>

                <div className="landing-tip-list landing-tip-grid">
                  {siteContent.tips.map((tip, index) => (
                    <div
                      key={tip.id || `${tip.text}-${index}`}
                      className="landing-tip-item"
                    >
                      <FaShieldAlt />
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </section>
          </div>
        </main>

        <footer className="dashboard-footer site-footer" id="footer-info">
          <div className="landing-wide-shell">
            <div className="site-footer-main">
              <div className="site-footer-brand">
                <div className="site-footer-brand-top">
                  {jaenlogo ? (
                    <img src={jaenlogo} alt="Jaen Logo" className="site-footer-logo" />
                  ) : (
                    <div className="site-footer-logo-fallback">J</div>
                  )}

                  <div>
                    <strong>{siteContent.office.name}</strong>
                    <span>{siteContent.office.address}</span>
                  </div>
                </div>

                <p className="site-footer-description">
                  Official public portal for weather, advisories, evacuation information,
                  and emergency contact access in Jaen, Nueva Ecija.
                </p>
              </div>

              <div className="site-footer-center">
                <h3>Emergency Contacts</h3>

                <div className="site-contact-list compact">
  {siteContent.hotlines.map((item, index) => (
    <div
      key={item.id || `${item.label}-${index}`}
      className="site-contact-row single-icon-layout"
    >
      <div className="site-contact-action-left">
        <span className="site-contact-icon-badge">
          {item.type === "call" && <FaPhoneAlt />}
          {item.type === "sms" && <FaSms />}
          {item.type === "email" && <FaEnvelope />}
          {item.type === "link" && <FaFacebookF />}
        </span>

        <div className="site-contact-copy">
          <strong>{item.label}</strong>
          <span>{item.number}</span>
        </div>
      </div>
    </div>
  ))}
</div>
              </div>

              <div className="site-footer-right">
                <h3>Office Information</h3>

                <div className="site-office-list compact">
                  <div className="site-office-row">
                    <FaMapMarkedAlt />
                    <span>{siteContent.office.address}</span>
                  </div>

                  <div className="site-office-row">
                    <FaHome />
                    <span>{siteContent.office.hours}</span>
                  </div>

                  <div className="site-office-row">
                    <FaEnvelope />
                    <span>{siteContent.office.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="site-footer-bottom site-footer-bottom-simple">
  <div className="site-footer-meta">
    <span>Privacy</span>
    <span>Terms</span>
    <span>© 2026 Jaen MDRRMO</span>
  </div>
</div>
          </div>
        </footer>

        {canEdit && isEditorOpen && (
          <div
            className="landing-editor-backdrop"
            onClick={() => setIsEditorOpen(false)}
            role="presentation"
          >
            <aside
              className="landing-editor"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="landing-editor-header">
                <div>
                  <h3>Edit Landing Page</h3>
                  <p>Update the public content shown on the page.</p>
                </div>

                <button
                  type="button"
                  className="editor-close-btn"
                  onClick={() => setIsEditorOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="landing-editor-body">
                <section className="editor-group">
                  <h4>Hero</h4>

                  <div className="editor-field">
                    <span>Title</span>
                    <input
                      value={draftContent.hero.title}
                      onChange={(e) => updateDraft("hero.title", e.target.value)}
                    />
                  </div>

                  <div className="editor-field">
                    <span>Subtitle</span>
                    <textarea
                      rows={4}
                      value={draftContent.hero.subtitle}
                      onChange={(e) => updateDraft("hero.subtitle", e.target.value)}
                    />
                  </div>

                  <div className="editor-inline-grid">
                    <div className="editor-field">
                      <span>Primary Button</span>
                      <input
                        value={draftContent.hero.primaryCtaLabel}
                        onChange={(e) =>
                          updateDraft("hero.primaryCtaLabel", e.target.value)
                        }
                      />
                    </div>

                    <div className="editor-field">
                      <span>Secondary Button</span>
                      <input
                        value={draftContent.hero.secondaryCtaLabel}
                        onChange={(e) =>
                          updateDraft("hero.secondaryCtaLabel", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="editor-group">
                  <h4>Alert</h4>

                  <div className="toggle-wrap">
                    <input
                      id="alert-enabled"
                      type="checkbox"
                      checked={Boolean(draftContent.alert.enabled)}
                      onChange={(e) =>
                        updateDraft("alert.enabled", e.target.checked)
                      }
                    />
                    <label htmlFor="alert-enabled">Show public alert strip</label>
                  </div>

                  <div className="editor-inline-grid">
                    <div className="editor-field">
                      <span>Level</span>
                      <input
                        value={draftContent.alert.level}
                        onChange={(e) => updateDraft("alert.level", e.target.value)}
                      />
                    </div>

                    <div className="editor-field">
                      <span>Text</span>
                      <input
                        value={draftContent.alert.text}
                        onChange={(e) => updateDraft("alert.text", e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                <section className="editor-group">
                  <div className="editor-group-head">
                    <h4>Announcements</h4>
                    <button
                      type="button"
                      className="editor-mini-btn"
                      onClick={() =>
                        addItem("announcements", {
                          title: "",
                          body: "",
                          tag: "Update",
                        })
                      }
                    >
                      <FaEdit />
                      Add
                    </button>
                  </div>

                  {draftContent.announcements.map((item, index) => (
                    <div
                      key={item.id || `announcement-${index}`}
                      className="editor-repeat-card"
                    >
                      <div className="editor-repeat-head">
                        <strong>Announcement {index + 1}</strong>
                        <button
                          type="button"
                          className="editor-danger-btn"
                          onClick={() => removeItem("announcements", item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="editor-field">
                        <span>Tag</span>
                        <input
                          value={item.tag || ""}
                          onChange={(e) => {
                            const next = [...draftContent.announcements];
                            next[index] = { ...next[index], tag: e.target.value };
                            setDraftContent((prev) => ({ ...prev, announcements: next }));
                          }}
                        />
                      </div>

                      <div className="editor-field">
                        <span>Title</span>
                        <input
                          value={item.title || ""}
                          onChange={(e) => {
                            const next = [...draftContent.announcements];
                            next[index] = { ...next[index], title: e.target.value };
                            setDraftContent((prev) => ({ ...prev, announcements: next }));
                          }}
                        />
                      </div>

                      <div className="editor-field">
                        <span>Body</span>
                        <textarea
                          rows={3}
                          value={item.body || ""}
                          onChange={(e) => {
                            const next = [...draftContent.announcements];
                            next[index] = { ...next[index], body: e.target.value };
                            setDraftContent((prev) => ({ ...prev, announcements: next }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="editor-group">
                  <div className="editor-group-head">
                    <h4>Preparedness Tips</h4>
                    <button
                      type="button"
                      className="editor-mini-btn"
                      onClick={() =>
                        addItem("tips", {
                          text: "",
                        })
                      }
                    >
                      <FaEdit />
                      Add
                    </button>
                  </div>

                  {draftContent.tips.map((item, index) => (
                    <div
                      key={item.id || `tip-${index}`}
                      className="editor-repeat-card"
                    >
                      <div className="editor-repeat-head">
                        <strong>Tip {index + 1}</strong>
                        <button
                          type="button"
                          className="editor-danger-btn"
                          onClick={() => removeItem("tips", item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="editor-field">
                        <span>Text</span>
                        <input
                          value={item.text || ""}
                          onChange={(e) => {
                            const next = [...draftContent.tips];
                            next[index] = { ...next[index], text: e.target.value };
                            setDraftContent((prev) => ({ ...prev, tips: next }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="editor-group">
                  <div className="editor-group-head">
                    <h4>Hotlines</h4>
                  </div>

                  {draftContent.hotlines.map((item, index) => (
                    <div
                      key={item.id || `hotline-${index}`}
                      className="editor-repeat-card"
                    >
                      <div className="editor-repeat-head">
                        <strong>Hotline {index + 1}</strong>
                      </div>

                      <div className="editor-inline-grid">
                        <div className="editor-field">
                          <span>Label</span>
                          <input
                            value={item.label || ""}
                            onChange={(e) => {
                              const next = [...draftContent.hotlines];
                              next[index] = { ...next[index], label: e.target.value };
                              setDraftContent((prev) => ({ ...prev, hotlines: next }));
                            }}
                          />
                        </div>

                        <div className="editor-field">
                          <span>Type</span>
                          <input
                            value={item.type || ""}
                            onChange={(e) => {
                              const next = [...draftContent.hotlines];
                              next[index] = { ...next[index], type: e.target.value };
                              setDraftContent((prev) => ({ ...prev, hotlines: next }));
                            }}
                          />
                        </div>
                      </div>

                      <div className="editor-field">
                        <span>Value</span>
                        <input
                          value={item.number || ""}
                          onChange={(e) => {
                            const next = [...draftContent.hotlines];
                            next[index] = { ...next[index], number: e.target.value };
                            setDraftContent((prev) => ({ ...prev, hotlines: next }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="editor-group">
                  <h4>Office</h4>

                  <div className="editor-field">
                    <span>Office Name</span>
                    <input
                      value={draftContent.office.name}
                      onChange={(e) => updateDraft("office.name", e.target.value)}
                    />
                  </div>

                  <div className="editor-field">
                    <span>Address</span>
                    <input
                      value={draftContent.office.address}
                      onChange={(e) => updateDraft("office.address", e.target.value)}
                    />
                  </div>

                  <div className="editor-inline-grid">
                    <div className="editor-field">
                      <span>Hours</span>
                      <input
                        value={draftContent.office.hours}
                        onChange={(e) => updateDraft("office.hours", e.target.value)}
                      />
                    </div>

                    <div className="editor-field">
                      <span>Email</span>
                      <input
                        value={draftContent.office.email}
                        onChange={(e) => updateDraft("office.email", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="editor-field">
                    <span>Facebook Link</span>
                    <input
                      value={draftContent.office.facebook}
                      onChange={(e) => updateDraft("office.facebook", e.target.value)}
                    />
                  </div>
                </section>
              </div>

              <div className="editor-footer">
                <div className="editor-save-status">
                  {saveMessage || "Changes here affect the public landing page content."}
                </div>

                <div className="editor-footer-actions">
                  <button
                    type="button"
                    className="editor-mini-btn"
                    onClick={() => {
                      setDraftContent(siteContent);
                      setSaveMessage("Draft reset to current saved content.");
                    }}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    className="save-btn"
                    onClick={saveSiteContent}
                    disabled={isSaving}
                  >
                    <FaSave />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}