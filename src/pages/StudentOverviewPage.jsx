import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications } from "../api/student";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  APPLICATION_STATUSES,
  formatDate,
  getInitialsColor,
  initials,
  profileCompletion,
} from "../utils/format";

export default function StudentOverviewPage() {
  const { user, profile } = useAuth();
  const { error: showError } = useToast();
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Student Dashboard | CareerConnect";
    let cancelled = false;
    getApplications()
      .then((data) => {
        if (cancelled) return;
        setApplications(data.items || []);
        setSummary(data.summary || null);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = getErrorMessage(err);
        setError(message);
        showError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completion = profileCompletion(profile);
  const firstName = user?.name?.split(" ")[0] || "there";
  const recent = applications.slice(0, 4);
  const missingFields = profile
    ? [
        !profile.phone && "phone number",
        !profile.college && "college",
        !profile.skills && "skills",
        !profile.bio && "bio",
        !profile.resume_available && "resume",
      ].filter(Boolean)
    : [];

  const total = summary?.total ?? applications.length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Your workspace</span>
          <h1>Welcome back, {firstName}</h1>
          <p>Here's a snapshot of your applications and profile progress.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          <Icon name="search" size={17} /> Find opportunities
        </Link>
      </div>

      <section className="welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow eyebrow-light">Keep going</span>
          <h2>
            {total > 0
              ? `You have ${total} application${total === 1 ? "" : "s"} in progress.`
              : "Your next opportunity is one search away."}
          </h2>
          <p>
            {completion === 100
              ? "Your profile is complete — great work. Keep exploring new roles."
              : "Complete your profile to stand out to hiring teams and improve your chances."}
          </p>
          <div className="welcome-actions">
            <Link to="/dashboard/profile" className="btn btn-light">
              {completion === 100 ? "Review profile" : "Complete profile"}
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link to="/dashboard/applications" className="btn btn-hero-ghost">
              View applications
            </Link>
          </div>
        </div>
        <div className="welcome-progress">
          <div className="progress-ring" style={{ "--progress": completion }}>
            <div className="progress-ring-inner">
              <strong>{completion}%</strong>
              <span>Profile complete</span>
            </div>
          </div>
          {missingFields.length > 0 && (
            <p className="welcome-missing">
              Add your {missingFields.slice(0, 2).join(" and ")} to improve.
            </p>
          )}
        </div>
      </section>

      <section className="stat-grid">
        <StatCard
          icon="clipboard"
          label="Total applications"
          value={loading ? "—" : total}
          hint="Across all opportunities"
          tone="blue"
          to="/dashboard/applications"
        />
        <StatCard
          icon="clock"
          label="Pending review"
          value={loading ? "—" : summary?.Pending ?? 0}
          hint="Awaiting a response"
          tone="amber"
        />
        <StatCard
          icon="star"
          label="Shortlisted"
          value={loading ? "—" : summary?.Shortlisted ?? 0}
          hint="Moving forward"
          tone="purple"
        />
        <StatCard
          icon="award"
          label="Selected"
          value={loading ? "—" : summary?.Selected ?? 0}
          hint="Congratulations"
          tone="green"
        />
      </section>

      <div className="dashboard-two-col">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent applications</h2>
              <p>Your latest submissions and their status.</p>
            </div>
            <Link to="/dashboard/applications" className="link-btn">
              View all <Icon name="arrowRight" size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="application-skeleton-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="application-skeleton" key={index}>
                  <Skeleton width={42} height={42} radius={12} />
                  <div>
                    <Skeleton width="65%" height={15} />
                    <Skeleton width="40%" height={12} />
                  </div>
                  <Skeleton width={84} height={26} radius={999} />
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              compact
              icon="alertCircle"
              title="Could not load applications"
              message={error}
            />
          ) : recent.length === 0 ? (
            <EmptyState
              compact
              icon="clipboard"
              title="No applications yet"
              message="Explore opportunities and submit your first application."
              action={
                <Link to="/jobs" className="btn btn-primary btn-sm">
                  Browse jobs
                </Link>
              }
            />
          ) : (
            <div className="recent-list">
              {recent.map((application) => {
                const colors = getInitialsColor(application.job?.company || "");
                return (
                  <Link
                    to={`/jobs/${application.job_id}`}
                    key={application.id}
                    className="recent-item"
                  >
                    <span
                      className="company-logo company-logo-sm"
                      style={{ background: colors.background, color: colors.color }}
                    >
                      {initials(application.job?.company || "")}
                    </span>
                    <div className="recent-copy">
                      <strong>{application.job?.title}</strong>
                      <span>
                        {application.job?.company} · Applied{" "}
                        {formatDate(application.applied_at)}
                      </span>
                    </div>
                    <StatusBadge status={application.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <div className="dashboard-stack">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Resume</h2>
                <p>Keep an up-to-date resume on file.</p>
              </div>
            </div>
            {profile?.resume_available ? (
              <div className="resume-card">
                <span className="resume-icon">
                  <Icon name="fileText" size={22} />
                </span>
                <div>
                  <strong>{profile.resume_original_name}</strong>
                  <span>
                    Uploaded {formatDate(profile.resume_uploaded_at)}
                  </span>
                </div>
                <span className="badge badge-success">Ready</span>
              </div>
            ) : (
              <div className="resume-missing">
                <Icon name="upload" size={22} />
                <p>No resume uploaded yet. Add one so employers can review it.</p>
              </div>
            )}
            <Link to="/dashboard/profile" className="btn btn-secondary btn-block">
              <Icon name="upload" size={16} />
              {profile?.resume_available ? "Update resume" : "Upload resume"}
            </Link>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Application pipeline</h2>
                <p>Where your applications stand.</p>
              </div>
            </div>
            <div className="pipeline">
              {APPLICATION_STATUSES.map((status) => {
                const count = summary?.[status] ?? 0;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div className="pipeline-row" key={status}>
                    <div className="pipeline-label">
                      <StatusBadge status={status} />
                      <span>{count}</span>
                    </div>
                    <div className="pipeline-track">
                      <span
                        className={`pipeline-fill pipeline-${status.toLowerCase()}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Quick actions</h2>
            <p>Everything you need, one click away.</p>
          </div>
        </div>
        <div className="quick-actions">
          <Link to="/jobs?job_type=job" className="quick-action">
            <span className="quick-icon">
              <Icon name="briefcase" size={20} />
            </span>
            <div>
              <strong>Find full-time jobs</strong>
              <span>Browse open roles hiring now</span>
            </div>
            <Icon name="arrowUpRight" size={17} />
          </Link>
          <Link to="/internships" className="quick-action">
            <span className="quick-icon">
              <Icon name="graduation" size={20} />
            </span>
            <div>
              <strong>Explore internships</strong>
              <span>Gain experience while you study</span>
            </div>
            <Icon name="arrowUpRight" size={17} />
          </Link>
          <Link to="/dashboard/profile" className="quick-action">
            <span className="quick-icon">
              <Icon name="user" size={20} />
            </span>
            <div>
              <strong>Update your profile</strong>
              <span>Make a stronger first impression</span>
            </div>
            <Icon name="arrowUpRight" size={17} />
          </Link>
          <Link to="/dashboard/applications" className="quick-action">
            <span className="quick-icon">
              <Icon name="clipboard" size={20} />
            </span>
            <div>
              <strong>Track applications</strong>
              <span>See every status update in one place</span>
            </div>
            <Icon name="arrowUpRight" size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
