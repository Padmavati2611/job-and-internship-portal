import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { initials } from "../utils/format";
import Icon from "./Icon";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout, isStudent, isRecruiter } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "recruiter"
        ? "/recruiter"
        : "/dashboard";

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    success("You have been logged out.");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />

        <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <div className="nav-links">
            <NavLink to="/" end className="nav-link">
              Home
            </NavLink>
            <NavLink to="/jobs" className="nav-link">
              Jobs
            </NavLink>
            <NavLink to="/internships" className="nav-link">
              Internships
            </NavLink>
          </div>

          <div className="nav-mobile-actions">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn btn-secondary btn-block">
                  Dashboard
                </Link>
                {isStudent && (
                  <Link to="/dashboard/profile" className="btn btn-ghost btn-block">
                    My profile
                  </Link>
                )}
                {isRecruiter && (
                  <Link to="/recruiter/jobs" className="btn btn-ghost btn-block">
                    Manage jobs
                  </Link>
                )}
                <button type="button" className="btn btn-ghost btn-block" onClick={handleLogout}>
                  <Icon name="logout" size={17} /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-block">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-block">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <Link to={dashboardPath} className="btn btn-primary btn-sm nav-dashboard-btn">
                Dashboard
              </Link>
              <button
                type="button"
                className="user-chip"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <span className="avatar avatar-sm">{initials(user.name)}</span>
                <span className="user-chip-name">{user.name.split(" ")[0]}</span>
                <Icon name="chevronDown" size={15} />
              </button>
              {userMenuOpen && (
                <div className="dropdown-menu" role="menu">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to={dashboardPath} role="menuitem">
                    <Icon name="dashboard" size={16} /> Dashboard
                  </Link>
                  {isStudent && (
                    <Link to="/dashboard/profile" role="menuitem">
                      <Icon name="user" size={16} /> My profile
                    </Link>
                  )}
                  {isStudent && (
                    <Link to="/dashboard/applications" role="menuitem">
                      <Icon name="clipboard" size={16} /> Applications
                    </Link>
                  )}
                  {isRecruiter && (
                    <Link to="/recruiter/jobs" role="menuitem">
                      <Icon name="briefcase" size={16} /> Manage jobs
                    </Link>
                  )}
                  {isRecruiter && (
                    <Link to="/recruiter/applicants" role="menuitem">
                      <Icon name="users" size={16} /> Applicants
                    </Link>
                  )}
                  <button type="button" role="menuitem" onClick={handleLogout}>
                    <Icon name="logout" size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-login">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </div>
          )}

          <button
            type="button"
            className="nav-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
