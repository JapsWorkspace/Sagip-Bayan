<<<<<<< HEAD
// src/components/layout/DashboardShell.jsx
import { useState } from "react";
=======
import { useEffect, useMemo, useState } from "react";
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import { useLocation, useNavigate } from "react-router-dom";

import SidebarAdmin from "./Sidebar";
import SidebarDRRMO from "./SidebarDRRMO";
import SidebarBarangay from "./SidebarBarangay";

<<<<<<< HEAD

=======
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import "../css/sidebar.css";
import Confirm from "../common/Confirm";
import SplashScreen from "../splashscreen/SplashScreen";

export default function DashboardShell({ children, variant }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
<<<<<<< HEAD

  const BASE_URL = process.env.REACT_APP_API_URL || "https://gaganadapat.onrender.com";

  // Pick which sidebar to render (or override with `variant` prop)
=======
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState("");

  const BASE_URL =
    process.env.REACT_APP_API_URL || "https://gaganadapat.onrender.com";

>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const resolved =
    variant ??
    (pathname.startsWith("/drrmo")
      ? "drrmo"
      : pathname.startsWith("/barangay")
      ? "barangay"
      : "admin");

<<<<<<< HEAD
=======
  const roleLabel = useMemo(() => {
    if (resolved === "drrmo") return "DRRMO";
    if (resolved === "barangay") return "Barangay";
    return "Administrator";
  }, [resolved]);

>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const SidebarComp =
    resolved === "drrmo"
      ? SidebarDRRMO
      : resolved === "barangay"
      ? SidebarBarangay
      : SidebarAdmin;

  const requestLogout = () => setConfirmOpen(true);

  const doLogout = async () => {
    setConfirmOpen(false);
    setShowSplash(true);

    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      localStorage.clear();
      sessionStorage.clear();

      window.setTimeout(() => {
        setShowSplash(false);
        navigate("/Login", { replace: true });
      }, 1200);
    }
  };

  const onToggle = () => {
<<<<<<< HEAD
    setCollapsed((prev) => {
      const next = !prev;
      document
        .querySelector(".admin-layout")
        ?.classList.toggle("has-collapsed", next);
      return next;
    });
  };

  return (
    <div className="admin-layout">
      {/* Sidebar (fixed width) */}
      <SidebarComp collapsed={collapsed} onToggle={onToggle} onLogout={requestLogout} />

      {/* Main content column (flex) */}
      <main className="admin-main">
        {/* Optional: top header area for page titles/toolbars (non-scrolling) */}
        {/* <header className="admin-header">{...}</header> */}

        {/* Scrolling content area — this is where every page (children) renders */}
        <section className="admin-content">{children}</section>
      </main>

      {/* Confirm dialog */}
=======
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const storedUsername =
      localStorage.getItem("username") ||
      sessionStorage.getItem("username") ||
      localStorage.getItem("name") ||
      sessionStorage.getItem("name") ||
      "";

    setUsername(storedUsername);
  }, []);

  return (
    <div
      className={`admin-layout ${collapsed ? "has-collapsed" : ""} ${
        mobileOpen ? "has-mobile-sidebar" : ""
      }`}
    >
      <button
        type="button"
        className="mobile-sidebar-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <div className={`sidebar-shell ${mobileOpen ? "is-open" : ""}`}>
        <SidebarComp
          collapsed={collapsed}
          onToggle={onToggle}
          onLogout={requestLogout}
          onNavigateMobile={() => setMobileOpen(false)}
          username={username}
          roleLabel={roleLabel}
        />
      </div>

      <main className="admin-main">
        <section className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </section>
      </main>

>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
      <Confirm
        open={confirmOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doLogout}
      />

<<<<<<< HEAD
      {/* Splash overlay during logout */}
      {showSplash && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#fff" }}>
=======
      {showSplash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "#fff",
          }}
        >
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
          <SplashScreen />
        </div>
      )}
    </div>
  );
}