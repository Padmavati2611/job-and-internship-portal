import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApplications } from "../api/student";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { PageLoader } from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import {
  APPLICATION_STATUSES,
  formatDate,
  getInitialsColor,
  initials,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
} from "../utils/format";

export default function MyApplicationsPage() {
  const { error: showError } = useToast();
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    document.title = "My Applications | CareerConnect";
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

  const filtered = useMemo(() => {
    if (filter === "all") return applications;
    return applications.filter((application) => application.status === filter);
  }, [applications, filter]);

  const total = summary?.total ?? applications.length;

  if (loading) {
    return <PageLoader message="Loading your applications…" />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Applications</span>
          <h1>My applications</h1>
          <p>Track every opportunity you've applied to in one place.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          <Icon name="search" size={17} /> Find more opportunities
        </Link>
      </div>

      <section className="stat-grid stat-grid-compact">
        <div className="mini-stat-card">
          <span className="mini-stat-card-icon">
            <Icon name="clipboard" size={19} />
          </span>
          <div>
            <strong>{total}</strong>
            <span>Total</span>
          </div>
        </div>
        {APPLICATION_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            className={`mini-stat-card mini-stat-card-btn ${
              filter === status ? "active" : ""
            }`}
            onClick={() => setFilter(status)}
          >
            <span className={`mini-stat-card-dot dot-${status.toLowerCase()}`} />
            <div>
              <strong>{summary?.[status] ?? 0}</strong>
              <span>{status}</span>
            </div>
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              {filter === "all"
                ? "All applications"
                : `${filter} applications`}
            </h2>
            <p>
              {filtered.length}{" "}
              {filtered.length === 1 ? "application" : "applications"}
            </p>
          </div>
          {filter !== "all" && (
            <button
              type="button"
              className="link-btn"
              onClick={() => setFilter("all")}
            >
              Show all <Icon name="close" size={13} />
            </button>
          )}
        </div>

        {error ? (
          <EmptyState
            icon="alertCircle"
            title="Could not load applications"
            message={error}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="clipboard"
            title={
              filter === "all"
                ? "No applications yet"
                : `No ${filter.toLowerCase()} applications`
            }
            message={
              filter === "all"
                ? "Start exploring jobs and internships and apply to your first opportunity."
                : "Switch to 'All' to see your other applications."
            }
            action={
              <Link to="/jobs" className="btn btn-primary">
                Browse opportunities
              </Link>
            }
          />
        ) : (
          <div className="application-table">
            {filtered.map((application) => {
              const colors = getInitialsColor(application.job?.company || "");
              return (
                <div className="application-row" key={application.id}>
                  <div className="application-main">
                    <span
                      className="company-logo"
                      style={{ background: colors.background, color: colors.color }}
                    >
                      {initials(application.job?.company || "")}
                    </span>
                    <div className="application-info">
                      <div className="application-head">
                        <Link to={`/jobs/${application.job_id}`}>
                          <h3>{application.job?.title}</h3>
                        </Link>
                        <StatusBadge status={application.status} />
                      </div>
                      <p>
                        {application.job?.company} · {application.job?.location}
                      </p>
                      <div className="application-meta">
                        <span>
                          <Icon name="briefcase" size={14} />
                          {JOB_TYPE_LABELS[application.job?.job_type]}
                        </span>
                        <span>
                          <Icon name="laptop" size={14} />
                          {WORK_MODE_LABELS[application.job?.work_mode]}
                        </span>
                        <span>
                          <Icon name="calendar" size={14} />
                          Applied {formatDate(application.applied_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="application-actions">
                    <Link
                      to={`/jobs/${application.job_id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      View role <Icon name="arrowUpRight" size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Application tips</h2>
            <p>Small improvements can go a long way.</p>
          </div>
        </div>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">
              <Icon name="fileText" size={18} />
            </span>
            <div>
              <h3>Keep your resume current</h3>
              <p>
                Update your resume with recent projects and skills before
                applying to competitive roles.
              </p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">
              <Icon name="mail" size={18} />
            </span>
            <div>
              <h3>Add a tailored cover letter</h3>
              <p>
                A short, role-specific cover letter shows intent and helps you
                stand out.
              </p>
            </div>
          </div>
          <div className="tip-card">
            <span className="tip-icon">
              <Icon name="target" size={18} />
            </span>
            <div>
              <h3>Apply to relevant roles</h3>
              <p>
                Focus on roles where your skills match — quality beats quantity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
