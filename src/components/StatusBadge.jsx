const STATUS_CLASS = {
  Pending: "pending",
  Shortlisted: "shortlisted",
  Rejected: "rejected",
  Selected: "selected",
};

export default function StatusBadge({ status }) {
  const className = STATUS_CLASS[status] || "pending";
  return (
    <span className={`status-badge status-${className}`}>
      <span className="status-dot" />
      {status || "Pending"}
    </span>
  );
}
