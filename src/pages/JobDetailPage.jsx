import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getJob } from "../api/jobs";
import { applyForJob, saveJob, unsaveJob } from "../api/student";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import { PageLoader } from "../components/Spinner";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  companyColor,
  deadlineLabel,
  formatDate,
  initials,
  truncate,
} from "../utils/format";

export default function JobDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { user, isStudent, isAdmin } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    getJob(id)
      .then((data) => {
        if (cancelled) return;
        setJob(data.job);
        document.title = `${data.job.title} at ${data.job.company} | CareerConnect`;
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleApply = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await applyForJob({
        job_id: job.id,
        cover_letter: coverLetter.trim(),
      });
      setJob((current) => ({
        ...current,
        applied: true,
        application_status: "Pending",
        application_count: (current.application_count || 0) + 1,
      }));
      setModalOpen(false);
      setCoverLetter("");
      showSuccess(data.message || "Application submitted successfully.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    setSaving(true);
    try {
      if (job.saved) {
        const data = await unsaveJob(job.id);
        setJob((current) => ({ ...current, saved: false }));
        showSuccess(data.message || "Removed from saved jobs.");
      } else {
        const data = await saveJob(job.id);
        setJob((current) => ({ ...current, saved: true }));
        showSuccess(data.message || "Opportunity saved.");
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container section">
        <PageLoader message="Loading opportunity…" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container section">
        <EmptyState
          icon="briefcase"
          title="Opportunity unavailable"
          message={error || "This opportunity could not be found."}
          action={
            <Link to="/jobs" className="btn btn-primary">
              Browse all opportunities
            </Link>
          }
        />
      </div>
    );
  }

  const colors = companyColor(job.company);

  return (
    <section className="section section-tight">
      <div className="container">
        <Link to="/jobs" className="back-link">
          <Icon name="arrowLeft" size={16} /> Back to opportunities
        </Link>

        <div className="job-detail-grid">
          <div className="job-detail-main">
            <header className="job-detail-header">
              <div className="job-detail-title-row">
                <span
                  className="company-logo company-logo-lg"
                  style={{ background: colors.background, color: colors.color }}
                >
                  {initials(job.company)}
                </span>
                <div>
                  <div className="job-detail-badges">
                    <span className={`badge badge-${job.job_type}`}>
                      {JOB_TYPE_LABELS[job.job_type]}
                    </span>
                    {!job.is_active && <span className="badge badge-muted">Inactive</span>}
                    {job.is_expired && <span className="badge badge-danger">Closed</span>}
                  </div>
                  <h1>{job.title}</h1>
                  <p className="job-detail-company">
                    {job.company} <span>·</span> {job.location}
                  </p>
                </div>
              </div>

              <div className="job-detail-meta">
                <span>
                  <Icon name="laptop" size={16} />
                  {WORK_MODE_LABELS[job.work_mode]}
                </span>
                <span>
                  <Icon name="briefcase" size={16} />
                  {EXPERIENCE_LABELS[job.experience_level]}
                </span>
                <span>
                  <Icon name="clock" size={16} />
                  {deadlineLabel(job.deadline)}
                </span>
                <span>
                  <Icon name="calendar" size={16} />
                  Posted {formatDate(job.created_at)}
                </span>
              </div>
            </header>

            <div className="detail-card">
              <h2>About the role</h2>
              <p className="preline">{job.description}</p>
            </div>

            {job.responsibilities && (
              <div className="detail-card">
                <h2>What you'll do</h2>
                <p className="preline">{job.responsibilities}</p>
              </div>
            )}

            {job.requirements && (
              <div className="detail-card">
                <h2>What we're looking for</h2>
                <p className="preline">{job.requirements}</p>
              </div>
            )}

            <div className="detail-card detail-card-company">
              <h2>About {job.company}</h2>
              <div className="company-summary">
                <span
                  className="company-logo"
                  style={{ background: colors.background, color: colors.color }}
                >
                  {initials(job.company)}
                </span>
                <div>
                  <h3>{job.company}</h3>
                  <p>
                    {job.category
                      ? `${job.category} · ${job.location}`
                      : job.location}
                  </p>
                </div>
              </div>
              <p className="muted">
                This role is listed on CareerConnect by the {job.company} hiring
                team. All applications are reviewed directly by the company.
              </p>
            </div>
          </div>

          <aside className="job-detail-sidebar">
            <div className="apply-card">
              <div className="apply-card-head">
                <p className="apply-card-label">Compensation</p>
                <h2>{job.compensation || "Competitive"}</h2>
                <p className="muted">
                  {JOB_TYPE_LABELS[job.job_type]} · {WORK_MODE_LABELS[job.work_mode]}
                </p>
              </div>

              <div className="apply-facts">
                <div>
                  <span>Deadline</span>
                  <strong>{formatDate(job.deadline)}</strong>
                </div>
                <div>
                  <span>Openings</span>
                  <strong>{job.openings}</strong>
                </div>
                <div>
                  <span>Applicants</span>
                  <strong>{job.application_count ?? 0}</strong>
                </div>
                <div>
                  <span>Experience</span>
                  <strong>{EXPERIENCE_LABELS[job.experience_level]}</strong>
                </div>
              </div>

              {isStudent && job.applied ? (
                <div className="applied-panel">
                  <StatusBadge status={job.application_status} />
                  <p>Your application has been submitted.</p>
                  <Link to="/dashboard/applications" className="btn btn-secondary btn-block">
                    Track application
                  </Link>
                </div>
              ) : isStudent ? (
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  onClick={() => setModalOpen(true)}
                  disabled={!job.is_open}
                >
                  {job.is_open ? "Apply for this role" : "Applications closed"}
                  {job.is_open && <Icon name="arrowRight" size={17} />}
                </button>
              ) : isAdmin ? (
                <>
                  <div className="info-banner info-banner-blue">
                    <Icon name="shield" size={17} />
                    <span>You are viewing this listing as an administrator.</span>
                  </div>
                  <Link
                    to={`/admin/jobs/${job.id}/edit`}
                    className="btn btn-secondary btn-block"
                  >
                    <Icon name="edit" size={16} /> Edit listing
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="btn btn-primary btn-block btn-lg"
                  >
                    Log in to apply
                  </Link>
                  <p className="apply-card-login">
                    New to CareerConnect?{" "}
                    <Link to="/register">Create a free account</Link>
                  </p>
                </>
              )}

              {isStudent && (
                <button
                  type="button"
                  className={`btn btn-block ${job.saved ? "btn-saved" : "btn-secondary"}`}
                  onClick={handleToggleSave}
                  disabled={saving}
                >
                  <Icon name="bookmark" size={16} />
                  {job.saved ? "Saved to your list" : "Save for later"}
                </button>
              )}

              <div className="apply-card-note">
                <Icon name="info" size={15} />
                <span>
                  Always verify company details and never share sensitive
                  information when applying.
                </span>
              </div>
            </div>

            <div className="share-card">
              <h3>Role snapshot</h3>
              <ul className="snapshot-list">
                <li>
                  <Icon name="building" size={16} />
                  <span>Company</span>
                  <strong>{truncate(job.company, 24)}</strong>
                </li>
                <li>
                  <Icon name="mapPin" size={16} />
                  <span>Location</span>
                  <strong>{job.location}</strong>
                </li>
                <li>
                  <Icon name="briefcase" size={16} />
                  <span>Type</span>
                  <strong>{JOB_TYPE_LABELS[job.job_type]}</strong>
                </li>
                <li>
                  <Icon name="target" size={16} />
                  <span>Category</span>
                  <strong>{job.category || "General"}</strong>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Apply for ${job.title}`}
        subtitle={`${job.company} · ${job.location}`}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="apply-form"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : "Submit application"}
            </button>
          </>
        }
      >
        <form id="apply-form" onSubmit={handleApply} className="apply-form">
          <div className="info-banner info-banner-blue">
            <Icon name="fileText" size={17} />
            <span>
              Your profile and resume will be shared with the hiring team.
            </span>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="cover-letter">
              Cover letter <span className="optional">(optional)</span>
            </label>
            <textarea
              id="cover-letter"
              className="textarea"
              rows={6}
              maxLength={5000}
              placeholder="Tell the hiring team why you're a great fit for this role…"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
            />
            <p className="hint">{coverLetter.length}/5000 characters</p>
          </div>
        </form>
      </Modal>
    </section>
  );
}
