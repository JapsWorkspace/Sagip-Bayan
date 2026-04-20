import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import logo from "../../assets/images/sagipbayanlogo.png";

import analyticswhite from "../../assets/images/analyticswhite.png";
import analyticsgreen from "../../assets/images/analyticsgreen.png";
import registerwhite from "../../assets/images/registerwhite.png";
import registergreen from "../../assets/images/registergreen.png";
import timewhite from "../../assets/images/timewhite.png";
import timegreen from "../../assets/images/timegreen.png";
import evacuationwhite from "../../assets/images/evacuationwhite.png";
import evacuationgreen from "../../assets/images/evacuationgreen.png";
import logoutwhite from "../../assets/images/logoutwhite.png";
import logoutgreen from "../../assets/images/logoutgreen.png";
import sunwhite from "../../assets/images/sunwhite.png";
import nightgreen from "../../assets/images/nightgreen.png";

export default function Sidebar({
  collapsed,
  onToggle,
  onLogout,
  onNavigateMobile,
  username,
  roleLabel,
}) {
  const { theme, toggleTheme } = useTheme();
  const useDark = theme === "dark";

  const links = [
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
  const themeLabel = useDark ? "Light mode" : "Dark mode";
  const logoutIcon = useDark ? logoutwhite : logoutgreen;

  return (
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
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

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

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          {!collapsed && <div className="sidebar-group-label">Preferences</div>}

          <button
            type="button"
            className="sidebar-link is-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={themeLabel}
          >
            <img src={themeIcon} alt="" className="sidebar-icon" />
            {!collapsed && <span>{themeLabel}</span>}
          </button>

          <button
            type="button"
            className="sidebar-link is-button sidebar-link-danger"
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