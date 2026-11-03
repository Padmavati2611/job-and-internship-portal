import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { getStats } from "../api/recruiter";
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

export default function RecruiterDashboardPage() {
  const { error: showError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Recruiter Dashboard | CareerConnect";
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
  const company = stats?.company;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Recruiter workspace</span>
          <h1>{company?.name || "Hiring overview"}</h1>
          <p>Track your listings, applicants and hiring pipeline.</p>
        </div>
        <div className="heading-actions">
          <Link to="/recruiter/company" className="btn btn-secondary">
            <Icon name="building" size={16} /> Company profile
          </Link>
          <Link to="/recruiter/jobs/new" className="btn btn-primary">
            <Icon name="plus" size={17} /> Post a job
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
              icon="briefcase"
              label="Total listings"
              value={loading ? "—" : totals.jobs ?? 0}
              hint="Jobs and internships created"
              tone="purple"
              to="/recruiter/jobs"
            />
            <StatCard
              icon="eye"
              label="Active listings"
              value={loading ? "—" : totals.active_jobs ?? 0}
              hint="Visible to students"
              tone="green"
              to="/recruiter/jobs?status=active"
            />
            <StatCard
              icon="clipboard"
              label="Applications"
              value={loading ? "—" : totalApplications}
              hint="Received in total"
              tone="blue"
              to="/recruiter/applicants"
            />
            <StatCard
              icon="clock"
              label="Pending review"
              value={loading ? "—" : totals.pending ?? 0}
              hint="Awaiting your decision"
              tone="amber"
              to="/recruiter/applicants?status=Pending"
            />
          </section>

          <div className="dashboard-two-col admin-dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Application pipeline</h2>
                  <p>Your candidates by current status.</p>
                </div>
                <Link to="/recruiter/applicants" className="link-btn">
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
                  <strong>{totalApplications}</strong> applications received
                  across your listings.
                </p>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Top listings</h2>
                  <p>Opportunities attracting the most applicants.</p>
                </div>
              </div>

              {loading ? (
                <div className="top-company-list">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div className="top-company" key={index}>
                      <Skeleton width={38} height={38} radius={11} />
                      <Skeleton width="60%" height={14} />
                    </div>
                  ))}
                </div>
              ) : stats?.top_jobs?.length ? (
                <div className="top-company-list">
                  {stats.top_jobs.map((job, index) => (
                    <Link
                      to={`/recruiter/jobs/${job.id}/edit`}
                      className="top-company"
                      key={job.id}
                    >
                      <span className="top-company-rank">{index + 1}</span>
                      <span className="company-logo company-logo-sm">
                        <Icon name="briefcase" size={17} />
                      </span>
                      <div className="top-company-copy">
                        <strong>{job.title}</strong>
                        <span>
                          {job.applications}{" "}
                          {job.applications === 1
                            ? "application"
                            : "applications"}
                        </span>
                      </div>
                      <Icon name="chevronRight" size={15} />
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon="briefcase"
                  title="No listings yet"
                  message="Post your first opportunity to start collecting applications."
                  action={
                    <Link
                      to="/recruiter/jobs/new"
                      className="btn btn-primary btn-sm"
                    >
                      Post a job
                    </Link>
                  }
                />
              )}
            </section>
          </div>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Recent applicants</h2>
                <p>The latest students who applied to your listings.</p>
              </div>
              <Link to="/recruiter/applicants" className="link-btn">
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
                  const colors = getInitialsColor(
                    application.student?.name || ""
                  );
                  return (
                    <Link
                      to="/recruiter/applicants"
                      className="admin-recent-row"
                      key={application.id}
                    >
                      <span
                        className="company-logo company-logo-sm"
                        style={{
                          background: colors.background,
                          color: colors.color,
                        }}
                      >
                        {initials(application.student?.name || "")}
                      </span>
                      <div className="admin-recent-copy">
                        <strong>{application.student?.name}</strong>
                        <span>
                          Applied for {application.job?.title}
                        </span>
                      </div>
                      <span className="admin-recent-date">
                        {formatDate(application.applied_at)}
                      </span>
                      <StatusBadge status={application.status} />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                compact
                icon="users"
                title="No applicants yet"
                message="Your applicants will appear here once students apply."
                action={
                  <Link to="/recruiter/jobs" className="btn btn-primary btn-sm">
                    Manage listings
                  </Link>
                }
              />
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Quick actions</h2>
                <p>Keep your hiring process moving.</p>
              </div>
            </div>
            <div className="quick-actions">
              <Link to="/recruiter/jobs/new" className="quick-action">
                <span className="quick-icon">
                  <Icon name="plus" size={20} />
                </span>
                <div>
                  <strong>Post an opportunity</strong>
                  <span>Create a job or internship listing</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/recruiter/jobs" className="quick-action">
                <span className="quick-icon">
                  <Icon name="briefcase" size={20} />
                </span>
                <div>
                  <strong>Manage listings</strong>
                  <span>Edit, pause or close postings</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/recruiter/applicants" className="quick-action">
                <span className="quick-icon">
                  <Icon name="users" size={20} />
                </span>
                <div>
                  <strong>Review applicants</strong>
                  <span>Shortlist and update candidates</span>
                </div>
                <Icon name="arrowUpRight" size={17} />
              </Link>
              <Link to="/recruiter/company" className="quick-action">
                <span className="quick-icon">
                  <Icon name="building" size={20} />
                </span>
                <div>
                  <strong>Company profile</strong>
                  <span>Present your company to students</span>
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
