import { Route, Routes } from "react-router-dom";
import ProtectedRoute, { GuestRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminApplicationsPage from "./pages/AdminApplicationsPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminJobsPage from "./pages/AdminJobsPage";
import AdminStudentsPage from "./pages/AdminStudentsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobFormPage from "./pages/JobFormPage";
import JobsPage from "./pages/JobsPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import RecruiterApplicantsPage from "./pages/RecruiterApplicantsPage";
import RecruiterCompanyPage from "./pages/RecruiterCompanyPage";
import RecruiterDashboardPage from "./pages/RecruiterDashboardPage";
import RecruiterJobsPage from "./pages/RecruiterJobsPage";
import RegisterPage from "./pages/RegisterPage";
import StudentOverviewPage from "./pages/StudentOverviewPage";
import StudentSavedJobsPage from "./pages/StudentSavedJobsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/internships" element={<JobsPage lockedType="internship" />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<StudentOverviewPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="saved-jobs" element={<StudentSavedJobsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["recruiter"]} />}>
        <Route path="/recruiter" element={<DashboardLayout />}>
          <Route index element={<RecruiterDashboardPage />} />
          <Route path="jobs" element={<RecruiterJobsPage />} />
          <Route path="jobs/new" element={<JobFormPage />} />
          <Route path="jobs/:id/edit" element={<JobFormPage />} />
          <Route path="applicants" element={<RecruiterApplicantsPage />} />
          <Route path="company" element={<RecruiterCompanyPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["student", "recruiter", "admin"]} />}>
        <Route path="/notifications" element={<DashboardLayout />}>
          <Route index element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="jobs/new" element={<JobFormPage />} />
          <Route path="jobs/:id/edit" element={<JobFormPage />} />
          <Route path="students" element={<AdminStudentsPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="companies" element={<AdminCompaniesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
