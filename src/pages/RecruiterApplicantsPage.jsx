import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  downloadApplicantResume,
  getApplicant,
  listApplications,
  updateApplicationStatus,
} from "../api/recruiter";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import {
  APPLICATION_STATUSES,
  formatDate,
  formatDateTime,
  getInitialsColor,
  initials,
} from "../utils/format";

const STATUS_TABS = [{ value: "", label: "All" }].concat(
  APPLICATION_STATUSES.map((status) => ({ value: status, label: status }))
);

export default function RecruiterApplicantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const jobId = searchParams.get("job_id") || "";
  const queryString = searchParams.toString();

  const [searchInput, setSearchInput] = useState(q);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    document.title = "Applicants | CareerConnect";
  }, []);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const params = { page, per_page: 10 };
    if (q) params.q = q;
    if (status) params.status = status;
    if (jobId) params.job_id = jobId;

    listApplications(params)
      .then((response) => {
        if (!cancelled) setData(response);
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
  }, [queryString, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    getApplicant(selected.student_id)
      .then((response) => {
        if (!cancelled) setDetail(response);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.student_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateParam("q", searchInput.trim());
  };

  const handleStatusChange = async (application, nextStatus) => {
    if (nextStatus === application.status) return;
    setUpdatingId(application.id);
    try {
      const response = await updateApplicationStatus(
        application.id,
        nextStatus
      );
      success(
        `${application.student?.name || "Application"} marked as ${nextStatus}.`
      );
      setSelected((current) =>
        current && current.id === application.id
          ? { ...current, status: nextStatus }
          : current
      );
      setData((current) => {
        const items = current.items
          .map((item) =>
            item.id === application.id
              ? { ...item, status: nextStatus }
              : item
          )
          .filter((item) => !status || item.status === status);
        return {
          ...current,
          items,
          pagination: current.pagination
            ? {
                ...current.pagination,
                total:
                  items.length !== current.items.length
                    ? Math.max(0, current.pagination.total - 1)
                    : current.pagination.total,
              }
            : current.pagination,
        };
      });
      return response;
    } catch (err) {
      showError(getErrorMessage(err));
      return null;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownload = async (application) => {
    setDownloadingId(application.student_id);
    try {
      await downloadApplicantResume(
        application.student_id,
        application.student?.profile?.resume_original_name || "resume.pdf"
      );
      success("Resume download started.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const applications = data.items || [];
  const pagination = data.pagination;
  const profile = detail?.student?.profile || selected?.student?.profile;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Applicants</span>
          <h1>Review candidates</h1>
          <p>Open applications, review profiles and update candidate status.</p>
        </div>
        <span className="count-pill">
          <Icon name="users" size={16} />
          {pagination?.total ?? 0} applicants
        </span>
      </div>

      <section className="panel">
        <div className="table-toolbar table-toolbar-stack">
          <form className="table-search" onSubmit={handleSearch}>
            <Icon name="search" size={17} />
            <input
              type="text"
              placeholder="Search by student, email or role"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="table-search-clear"
                onClick={() => {
                  setSearchInput("");
                  updateParam("q", "");
                }}
                aria-label="Clear search"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </form>

          <div className="segmented segmented-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value || "all"}
                type="button"
                className={status === tab.value ? "active" : ""}
                onClick={() => updateParam("status", tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {jobId && (
          <div className="filter-notice">
            <Icon name="briefcase" size={15} />
            Showing applicants for one listing.
            <button
              type="button"
              className="link-btn"
              onClick={() => updateParam("job_id", "")}
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <EmptyState
            icon="alertCircle"
            title="Could not load applicants"
            message={error}
            action={
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            }
          />
        ) : applications.length === 0 ? (
          <EmptyState
            icon="users"
            title="No applicants found"
            message={
              q || status || jobId
                ? "Try clearing the filters or searching for something else."
                : "Applicants will appear here when students apply to your listings."
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Opportunity</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => {
                  const colors = getInitialsColor(
                    application.student?.name || ""
                  );
                  return (
                    <tr key={application.id}>
                      <td data-label="Applicant">
                        <div className="table-user">
                          <span
                            className="avatar avatar-sm"
                            style={{
                              background: colors.background,
                              color: colors.color,
                            }}
                          >
                            {initials(application.student?.name || "")}
                          </span>
                          <div className="table-primary">
                            <strong>{application.student?.name}</strong>
                            <span>{application.student?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Opportunity">
                        <div className="table-primary">
                          <strong>{application.job?.title}</strong>
                          <span>
                            {application.job?.company} ·{" "}
                            {application.job?.job_type === "internship"
                              ? "Internship"
                              : "Full-time"}
                          </span>
                        </div>
                      </td>
                      <td data-label="Applied">
                        <div className="table-date">
                          <strong>{formatDate(application.applied_at)}</strong>
                          <span>{formatDateTime(application.applied_at)}</span>
                        </div>
                      </td>
                      <td data-label="Status">
                        <div className="status-cell">
                          <StatusBadge status={application.status} />
                          <select
                            className="status-select"
                            value={application.status}
                            aria-label={`Update status for ${application.student?.name}`}
                            disabled={updatingId === application.id}
                            onChange={(event) =>
                              handleStatusChange(application, event.target.value)
                            }
                          >
                            {APPLICATION_STATUSES.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td data-label="Actions" className="td-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelected(application)}
                        >
                          View <Icon name="arrowUpRight" size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <Pagination
            page={pagination?.page || 1}
            pages={pagination?.pages || 1}
            onChange={(nextPage) => {
              const next = new URLSearchParams(searchParams);
              if (nextPage <= 1) next.delete("page");
              else next.set("page", String(nextPage));
              setSearchParams(next);
            }}
          />
        )}
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Applicant details"
        subtitle={
          selected
            ? `${selected.student?.name} · ${selected.job?.title}`
            : ""
        }
        size="lg"
      >
        {selected && (
          <div className="application-detail">
            <div className="application-detail-head">
              <span
                className="company-logo"
                style={(() => {
                  const colors = getInitialsColor(
                    selected.student?.name || ""
                  );
                  return {
                    background: colors.background,
                    color: colors.color,
                  };
                })()}
              >
                {initials(selected.student?.name || "")}
              </span>
              <div>
                <h3>{selected.student?.name}</h3>
                <p>{selected.student?.email}</p>
                <span className="muted small">
                  Applied {formatDateTime(selected.applied_at)}
                </span>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            {detailLoading ? (
              <div className="inline-loader">
                <Spinner size="sm" /> Loading full profile…
              </div>
            ) : (
              <div className="application-detail-grid">
                <div>
                  <h4>Education</h4>
                  <p>{profile?.college || "Not added"}</p>
                  <p>
                    {[profile?.degree, profile?.branch]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  {profile?.graduation_year && (
                    <p>Graduating {profile.graduation_year}</p>
                  )}
                </div>
                <div>
                  <h4>Profile</h4>
                  <p>{profile?.location || "Location not added"}</p>
                  <p>{profile?.phone || "Phone not added"}</p>
                  <p>
                    {profile?.cgpa ? `CGPA ${profile.cgpa}` : "CGPA not added"}
                  </p>
                </div>
              </div>
            )}

            {profile?.skills && (
              <div className="application-detail-block">
                <h4>Skills</h4>
                <div className="tag-list">
                  {profile.skills
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <span className="tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div className="application-detail-block">
              <h4>Cover letter</h4>
              {selected.cover_letter ? (
                <p className="preline cover-letter-text">
                  {selected.cover_letter}
                </p>
              ) : (
                <p className="muted small">No cover letter was provided.</p>
              )}
            </div>

            <div className="application-detail-block">
              <h4>Candidate links</h4>
              <div className="detail-links">
                {profile?.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer">
                    <Icon name="link" size={15} /> LinkedIn
                  </a>
                )}
                {profile?.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer">
                    <Icon name="code" size={15} /> GitHub
                  </a>
                )}
                {profile?.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noreferrer">
                    <Icon name="globe" size={15} /> Portfolio
                  </a>
                )}
                {!profile?.linkedin && !profile?.github && !profile?.portfolio && (
                  <span className="muted small">No links added.</span>
                )}
              </div>
            </div>

            <div className="application-detail-block">
              <div className="application-detail-actions">
                <div>
                  <h4>Resume</h4>
                  {profile?.resume_available ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownload(selected)}
                      disabled={downloadingId === selected.student_id}
                    >
                      {downloadingId === selected.student_id ? (
                        <Spinner size="sm" />
                      ) : (
                        <Icon name="download" size={15} />
                      )}
                      Download resume
                    </button>
                  ) : (
                    <span className="muted small">No resume uploaded.</span>
                  )}
                </div>

                <div className="application-status-control">
                  <h4>Update status</h4>
                  <select
                    className="input select"
                    value={selected.status}
                    disabled={updatingId === selected.id}
                    onChange={(event) =>
                      handleStatusChange(selected, event.target.value)
                    }
                  >
                    {APPLICATION_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
