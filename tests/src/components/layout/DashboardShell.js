// src/components/layout/DashboardShell.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SidebarAdmin from "./Sidebar";
import SidebarDRRMO from "./SidebarDRRMO";
import SidebarBarangay from "./SidebarBarangay";

import "../css/sidebar.css";
import Confirm from "../common/Confirm";
import SplashScreen from "../splashscreen/SplashScreen";

export default function DashboardShell({ children, variant }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  // Pick which sidebar to render (or override with `variant` prop)
  const resolved =
    variant ??
    (pathname.startsWith("/drrmo") ? "drrmo"
      : pathname.startsWith("/barangay") ? "barangay"
      : "admin");

  const SidebarComp =
    resolved === "drrmo" ? SidebarDRRMO
    : resolved === "barangay" ? SidebarBarangay
    : SidebarAdmin;

  const requestLogout = () => setConfirmOpen(true);

  const doLogout = async () => {
    setConfirmOpen(false);
    setShowSplash(true); // 1) show SplashScreen immediately

    try {
      // Optional server logout (ignore network failure)
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } finally {
      // 2) clear client state so guards don’t bounce you away from /Login
      localStorage.clear();
      sessionStorage.clear();
      // If you keep user in context, also: setUser?.(null);

      // 3) give the splash a short beat, then navigate to /Login
      window.setTimeout(() => {
        setShowSplash(false);
        navigate("/Login", { replace: true }); // ⬅️ go to Login after splash
      }, 1200); // adjust to 800/1200/1500ms to taste
    }
  };

  const onToggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      document.querySelector(".admin-layout")?.classList.toggle("has-collapsed", next);
      return next;
    });
  };

  return (
    <div className="admin-layout" style={{ position: "relative" }}>
      <SidebarComp
        collapsed={collapsed}
        onToggle={onToggle}
        onLogout={requestLogout}
      />

      <main className="admin-content">{children}</main>

      {/* Confirm dialog */}
      <Confirm
        open={confirmOpen}
        title="Log out"
        message="Are you sure you want to log out?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doLogout}
      />

      {/* Splash overlay shown DURING logout, then we navigate to /Login */}
      {showSplash && (
        <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "#fff" }}>
          {/* We don't rely on SplashScreen's internal timer here;
              we simply show it, then navigate via the setTimeout above. */}
          <SplashScreen />
        </div>
      )}
    </div>
  );
}