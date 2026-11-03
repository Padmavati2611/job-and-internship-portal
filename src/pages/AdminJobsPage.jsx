import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { deleteJob, listJobs, updateJob } from "../api/admin";
import { getErrorMessage } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import { useToast } from "../context/ToastContext";
import {
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  deadlineLabel,
  formatDate,
} from "../utils/format";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AdminJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const jobType = searchParams.get("job_type") || "";
  const status = searchParams.get("status") || "all";
  const queryString = searchParams.toString();

  const [searchInput, setSearchInput] = useState(q);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    document.title = "Manage Listings | CareerConnect";
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
    if (jobType) params.job_type = jobType;
    if (status && status !== "all") params.status = status;

    listJobs(params)
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

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateParam("q", searchInput.trim());
  };

  const handleToggle = async (job) => {
    setTogglingId(job.id);
    try {
      const response = await updateJob(job.id, { is_active: !job.is_active });
      success(
        response.job.is_active
          ? "Listing is now active."
          : "Listing has been paused."
      );
      setReloadKey((key) => key + 1);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      const response = await deleteJob(deletingTarget.id);
      success(response.message || "Listing deleted successfully.");
      const wasLastItem = data.items.length === 1 && page > 1;
      setDeletingTarget(null);
      if (wasLastItem) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(page - 1));
        setSearchParams(next);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const items = data.items || [];
  const pagination = data.pagination;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Listings</span>
          <h1>Manage job listings</h1>
          <p>Create, update and manage every job and internship.</p>
        </div>
        <Link to="/admin/jobs/new" className="btn btn-primary">
          <Icon name="plus" size={17} /> New listing
        </Link>
      </div>

      <section className="panel">
        <div className="table-toolbar">
          <form className="table-search" onSubmit={handleSearch}>
            <Icon name="search" size={17} />
            <input
              type="text"
              placeholder="Search by title, company or location"
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

          <div className="toolbar-controls">
            <select
              className="input select"
              value={jobType}
              onChange={(event) => updateParam("job_type", event.target.value)}
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              <option value="job">Full-time</option>
              <option value="internship">Internship</option>
            </select>

            <div className="segmented">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={status === tab.value ? "active" : ""}
                  onClick={() => updateParam("status", tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <EmptyState
            icon="alertCircle"
            title="Could not load listings"
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
        ) : items.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="No listings found"
            message={
              q || jobType || status !== "all"
                ? "Try adjusting your filters or search term."
                : "Create your first listing to start receiving applications."
            }
            action={
              <Link to="/admin/jobs/new" className="btn btn-primary">
                <Icon name="plus" size={16} /> Create a listing
              </Link>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th>Deadline</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((job) => {
                  const displayStatus = !job.is_active
                    ? "Inactive"
                    : job.is_expired
                      ? "Expired"
                      : "Active";
                  return (
                    <tr key={job.id}>
                      <td data-label="Role">
                        <div className="table-primary">
                          <Link to={`/jobs/${job.id}`} className="table-title">
                            {job.title}
                          </Link>
                          <span>
                            {job.company} · {job.location}
                          </span>
                        </div>
                      </td>
                      <td data-label="Type">
                        <span className={`badge badge-${job.job_type}`}>
                          {JOB_TYPE_LABELS[job.job_type]}
                        </span>
                        <span className="table-sub">
                          {WORK_MODE_LABELS[job.work_mode]}
                        </span>
                      </td>
                      <td data-label="Status">
                        <span
                          className={`table-status table-status-${displayStatus.toLowerCase()}`}
                        >
                          <span className="status-dot" />
                          {displayStatus}
                        </span>
                      </td>
                      <td data-label="Applicants">
                        <span className="applicant-count">
                          <Icon name="users" size={15} />
                          {job.application_count ?? 0}
                        </span>
                      </td>
                      <td data-label="Deadline">
                        <div className="table-date">
                          <strong>{formatDate(job.deadline)}</strong>
                          <span>{deadlineLabel(job.deadline)}</span>
                        </div>
                      </td>
                      <td data-label="Actions" className="td-actions">
                        <div className="row-actions">
                          <Link
                            to={`/admin/jobs/${job.id}/edit`}
                            className="icon-btn"
                            aria-label={`Edit ${job.title}`}
                            title="Edit listing"
                          >
                            <Icon name="edit" size={16} />
                          </Link>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleToggle(job)}
                            disabled={togglingId === job.id}
                            aria-label={
                              job.is_active ? "Pause listing" : "Activate listing"
                            }
                            title={job.is_active ? "Pause listing" : "Activate listing"}
                          >
                            <Icon
                              name={job.is_active ? "eyeOff" : "eye"}
                              size={16}
                            />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            onClick={() => setDeletingTarget(job)}
                            aria-label={`Delete ${job.title}`}
                            title="Delete listing"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
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

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        title="Delete this listing?"
        message={
          deletingTarget
            ? `"${deletingTarget.title}" at ${deletingTarget.company} and all of its applications will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete listing"
        onConfirm={handleDelete}
        onClose={() => setDeletingTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
