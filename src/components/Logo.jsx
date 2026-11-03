import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function Logo({ light = false, to = "/", compact = false }) {
  return (
    <Link
      to={to}
      className={`logo ${light ? "logo-light" : ""} ${compact ? "logo-compact" : ""}`}
      aria-label="CareerConnect home"
    >
      <span className="logo-mark">
        <Icon name="briefcase" size={20} strokeWidth={2} />
      </span>
      {!compact && (
        <span className="logo-text">
          Career<span>Connect</span>
        </span>
      )}
    </Link>
  );
}
