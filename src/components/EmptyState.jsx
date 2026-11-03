import Icon from "./Icon";

export default function EmptyState({
  icon = "search",
  title = "Nothing here yet",
  message = "Try adjusting your filters or check back soon.",
  action = null,
  compact = false,
}) {
  return (
    <div className={`empty-state ${compact ? "empty-state-compact" : ""}`}>
      <span className="empty-icon">
        <Icon name={icon} size={compact ? 22 : 30} />
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
