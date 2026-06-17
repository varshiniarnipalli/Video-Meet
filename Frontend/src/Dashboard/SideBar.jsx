import { NavLink, Link } from "react-router-dom";
import "./SideBar.css";

const navItems = [
  { to: "/dashboard", icon: "fa-home", label: "Dashboard", end: true },
  { to: "/dashboard/meetings", icon: "fa-calendar", label: "Meetings" },
  { to: "/dashboard/profile", icon: "fa-user", label: "Profile" },
];

const Sidebar = ({ isOpen, onClose, username }) => {
  return (
    <aside
      className={`sidebar ${isOpen ? "open" : ""}`}
      aria-hidden={isOpen ? "false" : "true"}
    >
      <div className="sidebar-logo">
        <span className="logo-badge">
          <i className="fa fa-video-camera" aria-hidden="true"></i>
        </span>
        <h2>VideoMeet</h2>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <p className="nav-label">Menu</p>
        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="profile-card">
          <div className="profile-avatar">{username
                ? username.charAt(0).toUpperCase()
                : "U"} </div>
          <div className="profile-info">
            <h4>{username}</h4>
            <p>
              <span className="status-dot" aria-hidden="true"></span>
              Online
            </p>
          </div>
        </div>

        <Link to="/login" className="logout-btn" onClick={onClose}>
          <i className="fa fa-sign-out" aria-hidden="true"></i>
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
