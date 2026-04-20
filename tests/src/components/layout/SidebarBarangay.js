import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

import logo from "../../assets/images/sagipbayanlogo.png";
import reliefwhite from "../../assets/images/reliefwhite.png";
import reliefgreen from "../../assets/images/reliefgreen.png";
import evacuationwhite from "../../assets/images/evacuationwhite.png";
import evacuationgreen from "../../assets/images/evacuationgreen.png";
import analyticswhite from "../../assets/images/analyticswhite.png";
import analyticsgreen from "../../assets/images/analyticsgreen.png";
import logoutwhite from "../../assets/images/logoutwhite.png";
import logoutgreen from "../../assets/images/logoutgreen.png";
import sunwhite from "../../assets/images/sunwhite.png";
import nightgreen from "../../assets/images/nightgreen.png";

export default function SidebarBarangay({
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
      section: "Relief",
      items: [
        {
          to: "/barangay/relief-request",
          label: "Relief Request",
          icon: dark ? reliefwhite : reliefgreen,
        },
      ],
    },
    {
      section: "Monitoring",
      items: [
        {
          to: "/barangay/evacuation-centers",
          label: "Evacuation Centers",
          icon: dark ? evacuationwhite : evacuationgreen,
        },
      ],
    },
  ];

  const themeIcon = dark ? sunwhite : nightgreen;
  const themeLabel = dark ? "Light mode" : "Dark mode";
  const logoutIcon = dark ? logoutwhite : logoutgreen;

  return (
    <aside
      className={`sidebar sidebar--barangay ${collapsed ? "collapsed" : ""}`}
      aria-label="Barangay navigation"
    >
      <div className="sidebar-header">
        <img src={logo} className="sidebar-logo" alt="Sagip Bayan logo" />

        {!collapsed && (
          <div className="sidebar-brand">
            <h1 className="sidebar-title">BARANGAY</h1>
            <p className="sidebar-subtitle">Local Panel</p>
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
                end
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

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          {!collapsed && <div className="sidebar-group-label">Preferences</div>}

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