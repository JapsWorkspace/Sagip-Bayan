import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import logo from "../../assets/images/sagipbayanlogo.png";
import analyticswhite from "../../assets/images/analyticswhite.png";
import analyticsgreen from "../../assets/images/analyticsgreen.png";
<<<<<<< HEAD
import evacuationwhite from "../../assets/images/evacuationwhite.png";
import evacuationgreen from "../../assets/images/evacuationgreen.png";
=======
import reliefwhite from "../../assets/images/reliefwhite.png";
import reliefgreen from "../../assets/images/reliefgreen.png";
import evacuationwhite from "../../assets/images/evacuationwhite.png";
import evacuationgreen from "../../assets/images/evacuationgreen.png";
import messagewhite from "../../assets/images/messagewhite.png";
import messagegreen from "../../assets/images/messagegreen.png";
import auditwhite from "../../assets/images/auditwhite.png";
import auditgreen from "../../assets/images/auditgreen.png";
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
import logoutwhite from "../../assets/images/logoutwhite.png";
import logoutgreen from "../../assets/images/logoutgreen.png";
import sunwhite from "../../assets/images/sunwhite.png";
import nightgreen from "../../assets/images/nightgreen.png";

<<<<<<< HEAD
export default function SidebarDRRMO({ collapsed, onToggle, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  // IMPORTANT: All links are under /drrmo/... (no /admin)
  const links = [
    { to: "/drrmo/relief-lists",        label: "Relief Requests List",  icon: dark ? analyticswhite : analyticsgreen },
    { to: "/drrmo/evacuation-centers",  label: "Evacuation Management", icon: dark ? evacuationwhite: evacuationgreen },
    { to: "/drrmo/guidelines",          label: "Guidelines",            icon: dark ? analyticswhite : analyticsgreen },
    { to: "/drrmo/inventory",           label: "Inventory",             icon: dark ? analyticswhite : analyticsgreen },
  ];

  const themeIcon  = dark ? sunwhite : nightgreen;
=======
export default function SidebarDRRMO({
  collapsed,
  onToggle,
  onLogout,
  onNavigateMobile,
  username,
  roleLabel,
}) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const links = [
    {
      section: "Overview",
      items: [
        {
          to: "/drrmo/analytics",
          label: "Analytics",
          icon: dark ? analyticswhite : analyticsgreen,
        },
        {
          to: "/",
          label: "Landing Page",
          icon: dark ? messagewhite : messagegreen,
        },
      ],
    },
    {
      section: "Relief",
      items: [
        {
          to: "/drrmo/relief-lists",
          label: "Relief Requests",
          icon: dark ? reliefwhite : reliefgreen,
        },
        {
          to: "/drrmo/inventory",
          label: "Inventory",
          icon: dark ? analyticswhite : analyticsgreen,
        },
        {
          to: "/drrmo/inventory/add",
          label: "Add Donations",
          icon: dark ? reliefwhite : reliefgreen,
        },
      ],
    },
    {
      section: "Monitoring",
      items: [
        {
          to: "/drrmo/evacuation-centers",
          label: "Evacuation Centers",
          icon: dark ? evacuationwhite : evacuationgreen,
        },
        {
          to: "/drrmo/incident-report",
          label: "Incident Reports",
          icon: dark ? auditwhite : auditgreen,
        },
        {
          to: "/drrmo/guidelines",
          label: "Guidelines",
          icon: dark ? messagewhite : messagegreen,
        },
      ],
    },
  ];

  const themeIcon = dark ? sunwhite : nightgreen;
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
  const themeLabel = dark ? "Light mode" : "Dark mode";
  const logoutIcon = dark ? logoutwhite : logoutgreen;

  return (
<<<<<<< HEAD
    <aside className={`sidebar sidebar--drrmo ${collapsed ? "collapsed" : ""}`} aria-label="DRRMO navigation">
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" alt="" />
        {!collapsed && <h1 className="sidebar-title">DRRMO</h1>}
        <button onClick={onToggle} className="toggle-btn" aria-label="Collapse/Expand sidebar">
=======
    <aside
      className={`sidebar sidebar--drrmo ${collapsed ? "collapsed" : ""}`}
      aria-label="DRRMO navigation"
    >
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" alt="Sagip Bayan logo" />

        {!collapsed && (
          <div className="sidebar-brand">
            <h1 className="sidebar-title">DRRMO</h1>
            <p className="sidebar-subtitle">Operations Panel</p>
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
      <nav className="sidebar-nav" role="navigation">
        <div className="sidebar-group">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              <img src={l.icon} className="sidebar-icon" alt="" />
              {!collapsed && <span>{l.label}</span>}
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

      <nav className="sidebar-nav" role="navigation">
        {links.map((group) => (
          <div className="sidebar-group" key={group.section}>
            {!collapsed && (
              <div className="sidebar-group-label">{group.section}</div>
            )}

            {group.items.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={onNavigateMobile}
                className={({ isActive }) =>
                  "sidebar-link" + (isActive ? " active" : "")
                }
              >
                <img src={l.icon} className="sidebar-icon" alt="" />
                {!collapsed && <span>{l.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
<<<<<<< HEAD
=======
          {!collapsed && <div className="sidebar-group-label">Preferences</div>}

>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
          <button
            type="button"
            className="sidebar-link is-button"
            onClick={toggleTheme}
            title={themeLabel}
          >
            <img src={themeIcon} className="sidebar-icon" alt="" />
            {!collapsed && <span>{themeLabel}</span>}
          </button>

          <button
            type="button"
<<<<<<< HEAD
            className="sidebar-link is-button"
=======
            className="sidebar-link is-button sidebar-link-danger"
>>>>>>> 19fb3d6f3a5d17da00ac816e7d78291a6bd6694a
            onClick={onLogout}
            title="Log out"
          >
            <img src={logoutIcon} className="sidebar-icon" alt="" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}