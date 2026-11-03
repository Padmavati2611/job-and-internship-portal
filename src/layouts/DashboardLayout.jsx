import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Icon from "../components/Icon";
import NotificationBell from "../components/NotificationBell";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { initials } from "../utils/format";

const STUDENT_NAV = [
  { to: "/dashboard", label: "Overview", icon: "dashboard", end: true },
  { to: "/dashboard/profile", label: "My profile", icon: "user" },
  { to: "/dashboard/applications", label: "My applications", icon: "clipboard" },
  { to: "/dashboard/saved-jobs", label: "Saved jobs", icon: "bookmark" },
];

const RECRUITER_NAV = [
  { to: "/recruiter", label: "Overview", icon: "dashboard", end: true },
  { to: "/recruiter/jobs", label: "Manage jobs", icon: "briefcase" },
  { to: "/recruiter/applicants", label: "Applicants", icon: "users" },
  { to: "/recruiter/company", label: "Company profile", icon: "building" },
];

const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: "dashboard", end: true },
  { to: "/admin/jobs", label: "Manage listings", icon: "briefcase" },
  { to: "/admin/students", label: "Students", icon: "users" },
  { to: "/admin/applications", label: "Applications", icon: "clipboard" },
  { to: "/admin/users", label: "Users & recruiters", icon: "shield" },
  { to: "/admin/companies", label: "Companies", icon: "building" },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin, isRecruiter } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = isAdmin
    ? ADMIN_NAV
    : isRecruiter
      ? RECRUITER_NAV
      : STUDENT_NAV;
  const roleLabel = isAdmin
    ? "Admin console"
    : isRecruiter
      ? "Recruiter workspace"
      : "Student workspace";
  const homePath = isAdmin ? "/admin" : isRecruiter ? "/recruiter" : "/dashboard";

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    success("You have been logged out.");
    navigate("/");
  };

  return (
    <div className="dashboard-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Logo to={homePath} />
          <button
            type="button"
            className="icon-btn sidebar-close"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <span className="sidebar-role">{roleLabel}</span>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="sidebar-link"
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <Link to="/jobs" className="sidebar-link">
            <Icon name="search" size={19} />
            <span>Browse opportunities</span>
          </Link>
          <Link to="/" className="sidebar-link">
            <Icon name="globe" size={19} />
            <span>View website</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar avatar-sm">{initials(user?.name || "")}</span>
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <Icon name="logout" size={17} />
            Log out
          </button>
        </div>
      </aside>

      <div className="dashboard-body">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-btn topbar-menu"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="menu" size={21} />
            </button>
            <div>
              <span className="topbar-eyebrow">{roleLabel}</span>
              <strong className="topbar-title">CareerConnect</strong>
            </div>
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <span className={`badge role-badge role-${user?.role || "student"}`}>
              <Icon
                name={isAdmin ? "shield" : isRecruiter ? "building" : "graduation"}
                size={14}
              />
              {isAdmin ? "Administrator" : isRecruiter ? "Recruiter" : "Student"}
            </span>
            <span className="topbar-avatar">
              <span className="avatar avatar-xs">{initials(user?.name || "")}</span>
              <span className="topbar-name">{user?.name?.split(" ")[0]}</span>
            </span>
          </div>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
