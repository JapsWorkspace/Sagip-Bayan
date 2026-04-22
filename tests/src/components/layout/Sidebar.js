<<<<<<< HEAD
// src/components/layout/Sidebar.js
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

// LOGO
import logo from "../../assets/images/sagipbayanlogo.png";

// ICONS (white for dark mode, green for light mode)
import analyticswhite from "../../assets/images/analyticswhite.png";
import analyticsgreen from "../../assets/images/analyticsgreen.png";
import reliefwhite from "../../assets/images/reliefwhite.png";
import reliefgreen from "../../assets/images/reliefgreen.png";
import registerwhite from "../../assets/images/registerwhite.png";
import registergreen from "../../assets/images/registergreen.png";
import auditwhite from "../../assets/images/auditwhite.png";
import auditgreen from "../../assets/images/auditgreen.png";
import timewhite from "../../assets/images/timewhite.png";
import timegreen from "../../assets/images/timegreen.png";
import messagewhite from "../../assets/images/messagewhite.png";
import messagegreen from "../../assets/images/messagegreen.png";
=======
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import logo from "../../assets/images/sagipbayanlogo.png";

import analyticswhite from "../../assets/images/analyticswhite.png";
import analyticsgreen from "../../assets/images/analyticsgreen.png";
import registerwhite from "../../assets/images/registerwhite.png";
import registergreen from "../../assets/images/registergreen.png";
import timewhite from "../../assets/images/timewhite.png";
import timegreen from "../../assets/images/timegreen.png";
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import evacuationwhite from "../../assets/images/evacuationwhite.png";
import evacuationgreen from "../../assets/images/evacuationgreen.png";
import logoutwhite from "../../assets/images/logoutwhite.png";
import logoutgreen from "../../assets/images/logoutgreen.png";
import sunwhite from "../../assets/images/sunwhite.png";
import nightgreen from "../../assets/images/nightgreen.png";

<<<<<<< HEAD
export default function Sidebar({ collapsed, onToggle, onLogout }) {
=======
export default function Sidebar({
  collapsed,
  onToggle,
  onLogout,
  onNavigateMobile,
  username,
  roleLabel,
}) {
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const { theme, toggleTheme } = useTheme();
  const useDark = theme === "dark";

  const links = [
<<<<<<< HEAD

    { to: "/admin/analytics", label: "Analytics", icon: useDark ? analyticswhite : analyticsgreen },

    { to: "/admin/accounts", label: "Account Management", icon: useDark ? registerwhite : registergreen },

    { to: "/evacuation", label: "Evacuation Center Management", icon: useDark ? evacuationwhite : evacuationgreen },
    { to: "/Incident-Report", label: "Incident Reports", icon: useDark ? auditwhite : auditgreen },
    { to: "/admin/inventory",           label: "Inventory",             icon: useDark ? analyticswhite : analyticsgreen },
    { to: "/admin/inventory/add",       label: "Add Donations",         icon: useDark ? analyticswhite : analyticsgreen },
    { to: "/admin/time-in-time-out", label: "Time in & Time out", icon: useDark ? timewhite : timegreen },


  ];

  const themeIcon  = useDark ? sunwhite : nightgreen;
=======
    {
      section: "Overview",
      items: [
        {
          to: "/admin/analytics",
          label: "Analytics",
          icon: useDark ? analyticswhite : analyticsgreen,
        },
      ],
    },
    {
      section: "Management",
      items: [
        {
          to: "/admin/accounts",
          label: "Account Management",
          icon: useDark ? registerwhite : registergreen,
        },
        {
          to: "/evacuation",
          label: "Evacuation Centers",
          icon: useDark ? evacuationwhite : evacuationgreen,
        },
      ],
    },
    {
      section: "Inventory",
      items: [
        {
          to: "/admin/inventory",
          label: "Inventory",
          icon: useDark ? analyticswhite : analyticsgreen,
        },
      ],
    },
    {
      section: "Operations",
      items: [
        {
          to: "/admin/time-in-time-out",
          label: "Time In & Time Out",
          icon: useDark ? timewhite : timegreen,
        },
      ],
    },
  ];

  const themeIcon = useDark ? sunwhite : nightgreen;
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const themeLabel = useDark ? "Light mode" : "Dark mode";
  const logoutIcon = useDark ? logoutwhite : logoutgreen;

  return (
<<<<<<< HEAD
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} aria-label="Main navigation">
      {/* Header */}
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" alt="App logo" />
        {!collapsed && <h1 className="sidebar-title">SAGIP BAYAN</h1>}
        <button onClick={onToggle} className="toggle-btn" aria-label="Collapse/Expand sidebar">
=======
    <aside
      className={`sidebar sidebar--admin ${collapsed ? "collapsed" : ""}`}
      aria-label="Main navigation"
    >
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" alt="Sagip Bayan logo" />

        {!collapsed && (
          <div className="sidebar-brand">
            <h1 className="sidebar-title">SAGIP BAYAN</h1>
            <p className="sidebar-subtitle">Admin Panel</p>
          </div>
        )}

        <button
          onClick={onToggle}
          className="toggle-btn"
          aria-label="Collapse or expand sidebar"
          type="button"
        >
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

<<<<<<< HEAD
      {/* Body + Footer (bottom pinned) */}
      <nav className="sidebar-nav">
        <div className="sidebar-group">
          {links.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              <img src={item.icon} className="sidebar-icon" alt="" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
=======
      {!collapsed && (
  <div className="sidebar-role-card">
    <div className="sidebar-role-avatar">
      {(username || roleLabel || "U").charAt(0).toUpperCase()}
    </div>
    <div className="sidebar-role-meta">
      <span className="sidebar-role-kicker">Signed in as</span>
      <strong className="sidebar-role-name">
        {username || "Unknown User"}
      </strong>
      <span className="sidebar-role-subtext">{roleLabel}</span>
    </div>
  </div>
)}

      <nav className="sidebar-nav">
        {links.map((group) => (
          <div className="sidebar-group" key={group.section}>
            {!collapsed && (
              <div className="sidebar-group-label">{group.section}</div>
            )}

            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigateMobile}
                className={({ isActive }) =>
                  "sidebar-link" + (isActive ? " active" : "")
                }
              >
                <img src={item.icon} className="sidebar-icon" alt="" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
<<<<<<< HEAD
          <button type="button" className="sidebar-link is-button" onClick={toggleTheme} aria-label="Toggle theme">
=======
          {!collapsed && <div className="sidebar-group-label">Preferences</div>}

          <button
            type="button"
            className="sidebar-link is-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={themeLabel}
          >
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
            <img src={themeIcon} alt="" className="sidebar-icon" />
            {!collapsed && <span>{themeLabel}</span>}
          </button>

<<<<<<< HEAD
          <button type="button" className="sidebar-link is-button" onClick={onLogout}>
=======
          <button
            type="button"
            className="sidebar-link is-button sidebar-link-danger"
            onClick={onLogout}
            title="Log out"
          >
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
            <img src={logoutIcon} className="sidebar-icon" alt="" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}