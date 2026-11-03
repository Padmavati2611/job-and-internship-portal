import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function StatCard({
  icon = "chart",
  label,
  value,
  hint,
  tone = "blue",
  to,
}) {
  const content = (
    <>
      <span className={`stat-icon stat-icon-${tone}`}>
        <Icon name={icon} size={21} />
      </span>
      <div className="stat-copy">
        <p>{label}</p>
        <h3>{value}</h3>
        {hint && <span>{hint}</span>}
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="stat-card stat-card-link">
        {content}
        <Icon name="chevronRight" size={16} className="stat-arrow" />
      </Link>
    );
  }

  return <div className="stat-card">{content}</div>;
}
