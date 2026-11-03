import { Link } from "react-router-dom";
import Icon from "./Icon";
import {
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  companyColor,
  deadlineLabel,
  initials,
} from "../utils/format";

export default function JobCard({ job }) {
  const colors = companyColor(job.company);
  const isUrgent =
    job.deadline &&
    new Date(`${job.deadline}T23:59:59`).getTime() - Date.now() <
      3 * 24 * 60 * 60 * 1000 &&
    new Date(`${job.deadline}T23:59:59`).getTime() > Date.now();

  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-top">
        <span
          className="company-logo"
          style={{ background: colors.background, color: colors.color }}
        >
          {initials(job.company)}
        </span>
        <div className="job-card-badges">
          {job.saved && <span className="badge badge-saved">Saved</span>}
          {job.applied && <span className="badge badge-applied">Applied</span>}
          <span className={`badge badge-${job.job_type}`}>
            {JOB_TYPE_LABELS[job.job_type] || job.job_type}
          </span>
        </div>
      </div>

      <h3 className="job-card-title">{job.title}</h3>
      <p className="job-card-company">{job.company}</p>

      <div className="job-card-meta">
        <span>
          <Icon name="mapPin" size={15} />
          {job.location}
        </span>
        <span>
          <Icon name="laptop" size={15} />
          {WORK_MODE_LABELS[job.work_mode] || job.work_mode}
        </span>
      </div>

      <div className="job-card-tags">
        {job.category && <span className="tag">{job.category}</span>}
        <span className="tag tag-muted">{job.experience_level}</span>
      </div>

      <div className="job-card-footer">
        <div>
          <p className="job-compensation">{job.compensation || "Competitive"}</p>
          <span className={`deadline ${isUrgent ? "deadline-urgent" : ""}`}>
            <Icon name="clock" size={14} />
            {deadlineLabel(job.deadline)}
          </span>
        </div>
        <span className="job-card-arrow">
          <Icon name="arrowUpRight" size={18} />
        </span>
      </div>
    </Link>
  );
}
