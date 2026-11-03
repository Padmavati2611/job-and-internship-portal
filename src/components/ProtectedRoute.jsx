import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./Spinner";

export function homePathFor(role) {
  if (role === "admin") return "/admin";
  if (role === "recruiter") return "/recruiter";
  return "/dashboard";
}

export default function ProtectedRoute({ roles }) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  if (!initialized || loading) {
    return <PageLoader message="Preparing your workspace…" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return <PageLoader message="Loading…" />;
  }

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}
