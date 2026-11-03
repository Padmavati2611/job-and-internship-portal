export default function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  className = "",
}) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="job-card job-card-skeleton" aria-hidden="true">
      <div className="job-card-top">
        <Skeleton width={52} height={52} radius={14} />
        <Skeleton width={80} height={24} radius={999} />
      </div>
      <Skeleton width="82%" height={20} />
      <Skeleton width="55%" height={14} />
      <div className="skeleton-row">
        <Skeleton width={110} height={14} />
        <Skeleton width={90} height={14} />
      </div>
      <div className="skeleton-row">
        <Skeleton width={70} height={22} radius={999} />
        <Skeleton width={80} height={22} radius={999} />
      </div>
      <div className="skeleton-row skeleton-row-between">
        <Skeleton width={100} height={18} />
        <Skeleton width={34} height={34} radius={999} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div className="table-skeleton-row" key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton
              key={columnIndex}
              width={columnIndex === 0 ? "70%" : "45%"}
              height={14}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
