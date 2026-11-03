import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSavedJobs, unsaveJob } from "../api/student";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import JobCard from "../components/JobCard";
import Skeleton from "../components/Skeleton";
import { useToast } from "../context/ToastContext";

export default function StudentSavedJobsPage() {
  const { success, error: showError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    document.title = "Saved Jobs | CareerConnect";
    let cancelled = false;
    getSavedJobs()
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
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
  }, []);

  const handleRemove = async (job) => {
    setRemovingId(job.id);
    try {
      const data = await unsaveJob(job.id);
      setItems((current) => current.filter((item) => item.id !== job.id));
      success(data.message || "Opportunity removed from saved jobs.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Saved opportunities</span>
          <h1>Saved jobs</h1>
          <p>Keep track of roles you want to revisit and apply to later.</p>
        </div>
        <Link to="/jobs" className="btn btn-secondary">
          <Icon name="search" size={16} /> Browse jobs
        </Link>
      </div>

      {loading ? (
        <div className="jobs-grid jobs-grid-two">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="job-card" key={index}>
              <Skeleton width={48} height={48} radius={14} />
              <Skeleton width="70%" height={18} />
              <Skeleton width="45%" height={13} />
              <Skeleton width="100%" height={13} />
              <Skeleton width="100%" height={42} radius={12} />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="alertCircle"
          title="Could not load saved jobs"
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
      ) : items.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No saved jobs yet"
          message="Save interesting opportunities while browsing and they will appear here."
          action={
            <Link to="/jobs" className="btn btn-primary">
              <Icon name="search" size={16} /> Find opportunities
            </Link>
          }
        />
      ) : (
        <div className="jobs-grid jobs-grid-two">
          {items.map((job) => (
            <div className="saved-job-item" key={job.id}>
              <JobCard job={job} />
              <button
                type="button"
                className="btn btn-secondary btn-sm saved-job-remove"
                onClick={() => handleRemove(job)}
                disabled={removingId === job.id}
              >
                <Icon name="bookmark" size={14} />
                {removingId === job.id ? "Removing…" : "Remove from saved"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
