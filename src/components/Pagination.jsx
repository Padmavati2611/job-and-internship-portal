import Icon from "./Icon";

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  let start = Math.max(1, page - 2);
  let end = Math.min(pages, start + 4);
  start = Math.max(1, end - 4);

  const pageNumbers = [];
  for (let index = start; index <= end; index += 1) {
    pageNumbers.push(index);
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <Icon name="chevronLeft" size={17} />
      </button>

      {start > 1 && (
        <>
          <button type="button" className="page-btn" onClick={() => onChange(1)}>
            1
          </button>
          {start > 2 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <button
          key={number}
          type="button"
          className={`page-btn ${number === page ? "page-btn-active" : ""}`}
          onClick={() => onChange(number)}
          aria-current={number === page ? "page" : undefined}
        >
          {number}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="page-ellipsis">…</span>}
          <button
            type="button"
            className="page-btn"
            onClick={() => onChange(pages)}
          >
            {pages}
          </button>
        </>
      )}

      <button
        type="button"
        className="page-btn"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <Icon name="chevronRight" size={17} />
      </button>
    </nav>
  );
}
