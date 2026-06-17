import { useState } from "react";
import Sidebar from "./SideBar";
import "./Dashboard.css";
import "./DashboardLayout.css";

const DashboardLayout = ({
  title,
  action,
  children,
  username,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <div className="dashboard-wrapper">
      <Sidebar isOpen={isOpen} onClose={closeSidebar} username={username} />

      {isOpen && (
        <div
          className="overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      <div className="dashboard-content">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <i
              className="fa fa-bars"
              aria-hidden="true"
            ></i>
          </button>

          <div className="topbar-title">
            <h2>{title}</h2>
          </div>

          {action && (
            <div className="topbar-action">
              {action}
            </div>
          )}

          <div className="topbar-user">
            <span className="topbar-name">
              {username}
            </span>

            <div className="topbar-avatar">
              {username
                ? username.charAt(0).toUpperCase()
                : "U"}
            </div>
          </div>
        </header>

        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
