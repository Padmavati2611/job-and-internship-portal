export default function Spinner({ size = "md", className = "" }) {
  return (
    <span
      className={`spinner spinner-${size} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message = "Loading…" }) {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
      <p>{message}</p>
    </div>
  );
}

export function InlineLoader({ message = "Loading…" }) {
  return (
    <div className="inline-loader">
      <Spinner size="sm" />
      <span>{message}</span>
    </div>
  );
}
