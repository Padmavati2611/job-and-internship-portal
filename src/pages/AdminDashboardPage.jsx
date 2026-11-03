import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../api/admin";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Skeleton from "../components/Skeleton";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import {
  APPLICATION_STATUSES,
  formatDate,
  getInitialsColor,
  initials,
} from "../utils/format";

export default function AdminDashboardPage() {
  const { error: showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Admin Dashboard | CareerConnect";
    let cancelled = false;
    getStats()
      .then((data) => {
        if (!cancelled) setStats(data);
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

  const totals = stats?.totals || {};
  const statusCounts = stats?.status_counts || {};
  const totalApplications = totals.applications || 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Admin console</span>
          <h1>Platform overview</h1>
          <p>Monitor listings, students and application activity.</p>
        </div>
        <div className="heading-actions">
          <Link to="/admin/applications" className="btn btn-secondary">
            <Icon name="clipboard" size={16} /> Applications
          </Link>
          <Link to="/admin/jobs/new" className="btn btn-primary">
            <Icon name="plus" size={17} /> Post a listing
          </Link>
        </div>
      </div>

      {error && !stats ? (
        <EmptyState
          icon="alertCircle"
          title="Could not load dashboard"
          message={error}
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          }
        />
      ) : (
        <>
          <section className="stat-grid">
            <StatCard
              icon="users"
              label="Registered students"
              value={loading ? "—" : totals.students ?? 0}
              hint="Students on the platform"
              tone="blue"
              to="/admin/students"
            />
            <StatCard
              icon="briefcase"
              label="Active jobs"
              value={loading ? "—" : totals.active_jobs ?? 0}
              hint="Full-time listings live"
              tone="purple"
              to="/admin/jobs?status=active"
            />
            <StatCard
              icon="graduation"
              label="Active internships"
              value={loading ? "—" : totals.active_internships ?? 0}
              hint="Internships live"
              tone="green"
              to="/admin/jobs?status=active"
            />
            <StatCard
              icon="clipboard"
              label="Applications"
              value={loading ? "—" : totalApplications}
              hint="Received in total"
              tone="amber"
              to="/admin/applications"
            />
          </section>

          <div className="dashboard-two-col admin-dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Application pipeline</h2>
                  <p>Current distribution across all statuses.</p>
                </div>
                <Link to="/admin/applications" className="link-btn">
                  Manage <Icon name="arrowRight" size={14} />
                </Link>
              </div>

              <div className="pipeline pipeline-large">
                {APPLICATION_STATUSES.map((status) => {
                  const count = statusCounts[status] ?? 0;
                  const percent =
                    totalApplications > 0
                      ? Math.round((count / totalApplications) * 100)
                      : 0;
                  return (
                    <div className="pipeline-row" key={status}>
                      <div className="pipeline-label">
                        <StatusBadge status={status} />
                        <span>
                          {count} · {percent}%
                        </span>
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

              <div className="pipeline-summary">
                <Icon name="chart" size={18} />
                <p>
                  <strong>{totalApplications}</strong> applications received in
                  total across all listings.
                </p>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Top companies</h2>
                  <p>Companies receiving the most applications.</p>
                </div>
              </div>

              {loading ? (
                <div className="top-company-list">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div className="top-company" key={index}>
                      <Skeleton width={38} height={38} radius={11} />
                      <Skeleton width="55%" height={14} />
                    </div>
                  ))}
                </div>
              ) : stats?.top_companies?.length ? (
                <div className="top-company-list">
                  {stats.top_companies.map((company, index) => {
                    const colors = getInitialsColor(company.company);
                    return (
                      <div className="top-company" key={company.company}>
                        <span className="top-company-rank">{index + 1}</span>
                        <span
                          className="company-logo company-logo-sm"
                          style={{
                            background: colors.background,
                            color: colors.color,
                          }}
                        >
                          {initials(company.company)}
                        </span>
                        <div className="top-company-copy">
                          <strong>{company.company}</strong>
                          <span>
                            {company.applications}{" "}
                            {company.applications === 1
                              ? "application"
                              : "applications"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="building"
                  title="No application data yet"
                  message="Applications will appear here once students start applying."
                />
              )}
            </section>
          </div>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Recent applications</h2>
                <p>The latest submissions from students.</p>
              </div>
              <Link to="/admin/applications" className="link-btn">
                View all <Icon name="arrowRight" size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="application-skeleton-list">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="application-skeleton" key={index}>
                    <Skeleton width={42} height={42} radius={12} />
                    <div>
                      <Skeleton width="60%" height={15} />
                      <Skeleton width="35%" height={12} />
                    </div>
                    <Skeleton width={84} height={26} radius={999} />
                  </div>
                ))}
              </div>
            ) : stats?.recent_applications?.length ? (
              <div className="admin-recent-list">
                {stats.recent_applications.map((application) => {
                  const colors = getInitialsColor(application.student?.name || "");
                  return (
                    <div className="admin-recent-row" key={application.id}>
                      <span
                        className="company-logo company-logo-sm"
                        style={{ background: colors.background, color: colors.color }}
                      >
                        {initials(application.student?.name || "")}
                      </span>
                      <div className="admin-recent-copy">
                        <strong>{application.student?.name}</strong>
                        <span>
                          Applied for {application.job?.title} at{" "}
                          {application.job?.company}
                        </span>
                      </div>
                      <span className="admin-recent-date">
                        {formatDate(application.applied_at)}
                      </span>
                      <StatusBadge status={application.status} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                compact
                icon="clipboard"
                title="No applications yet"
                message="Share your listings with students to start receiving applications."
                action={
                  <Link to="/admin/jobs/new" className="btn btn-primary btn-sm">
                    Post a listing
                  </Link>
                }
              />
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Quick actions</h2>
                <p>Common admin tasks.</p>
              </div>
            </div>
            <div className="quick-actions">
              <Link to="/admin/jobs/new" className="quick-action">
                <span className="quick-icon">
                  <Icon name="plus" size={20} />
                </span>
                <div>
                  <strong>Create a listing</strong>
                  <span>Post a new job or internship</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/admin/jobs" className="quick-action">
                <span className="quick-icon">
                  <Icon name="briefcase" size={20} />
                </span>
                <div>
                  <strong>Manage listings</strong>
                  <span>Edit, pause or remove opportunities</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/admin/students" className="quick-action">
                <span className="quick-icon">
                  <Icon name="users" size={20} />
                </span>
                <div>
                  <strong>Browse students</strong>
                  <span>Review profiles and resumes</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/admin/applications" className="quick-action">
                <span className="quick-icon">
                  <Icon name="clipboard" size={20} />
                </span>
                <div>
                  <strong>Review applications</strong>
                  <span>Update candidate statuses</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
