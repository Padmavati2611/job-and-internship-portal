import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listCompanies } from "../api/admin";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import {
  companyColor,
  formatDate,
  initials,
} from "../utils/format";

export default function AdminCompaniesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const queryString = searchParams.toString();

  const [searchInput, setSearchInput] = useState(q);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = "Companies | CareerConnect";
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

    listCompanies(params)
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
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    updateParam("q", searchInput.trim());
  };

  const companies = data.items || [];
  const pagination = data.pagination;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Companies</span>
          <h1>Companies</h1>
          <p>Review recruiter companies and their hiring activity.</p>
        </div>
        <span className="count-pill">
          <Icon name="building" size={16} />
          {pagination?.total ?? 0} companies
        </span>
      </div>

      <section className="panel">
        <div className="table-toolbar">
          <form className="table-search" onSubmit={handleSearch}>
            <Icon name="search" size={17} />
            <input
              type="text"
              placeholder="Search by company, industry or location"
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
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <EmptyState
            icon="alertCircle"
            title="Could not load companies"
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
        ) : companies.length === 0 ? (
          <EmptyState
            icon="building"
            title="No companies found"
            message={
              q
                ? "Try a different search term."
                : "Companies appear here when recruiters register."
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Listings</th>
                  <th>Applications</th>
                  <th>Joined</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const colors = companyColor(company.name || "");
                  return (
                    <tr key={company.id}>
                      <td data-label="Company">
                        <div className="table-user">
                          <span
                            className="avatar avatar-sm"
                            style={{
                              background: colors.background,
                              color: colors.color,
                            }}
                          >
                            {initials(company.name || "")}
                          </span>
                          <div className="table-primary">
                            <strong>{company.name}</strong>
                            <span>{company.location || "Location not added"}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Industry">
                        <div className="table-primary">
                          <strong>{company.industry || "—"}</strong>
                          <span>{company.size || "Size not added"}</span>
                        </div>
                      </td>
                      <td data-label="Listings">
                        <div className="table-date">
                          <strong>{company.job_count ?? 0} total</strong>
                          <span>{company.active_job_count ?? 0} active</span>
                        </div>
                      </td>
                      <td data-label="Applications">
                        <span className="applicant-count">
                          <Icon name="clipboard" size={15} />
                          {company.application_count ?? 0}
                        </span>
                      </td>
                      <td data-label="Joined">{formatDate(company.created_at)}</td>
                      <td data-label="Actions" className="td-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelected(company)}
                        >
                          View <Icon name="arrowUpRight" size={14} />
                        </button>
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

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name || "Company details"}
        subtitle={selected?.tagline || selected?.industry || ""}
        size="lg"
      >
        {selected && (
          <div className="company-detail">
            <div className="application-detail-head">
              <span
                className="company-logo"
                style={(() => {
                  const colors = companyColor(selected.name || "");
                  return {
                    background: colors.background,
                    color: colors.color,
                  };
                })()}
              >
                {initials(selected.name || "")}
              </span>
              <div>
                <h3>{selected.name}</h3>
                <p>{selected.industry || "Industry not added"}</p>
                <span className="muted small">
                  Added {formatDate(selected.created_at)}
                </span>
              </div>
            </div>

            <div className="company-detail-stats">
              <div>
                <strong>{selected.job_count ?? 0}</strong>
                <span>Listings</span>
              </div>
              <div>
                <strong>{selected.active_job_count ?? 0}</strong>
                <span>Active</span>
              </div>
              <div>
                <strong>{selected.application_count ?? 0}</strong>
                <span>Applications</span>
              </div>
            </div>

            <div className="application-detail-grid">
              <div>
                <h4>Company</h4>
                <p>{selected.location || "Location not added"}</p>
                <p>{selected.size || "Size not added"}</p>
                <p>
                  {selected.founded_year
                    ? `Founded ${selected.founded_year}`
                    : "Founded year not added"}
                </p>
              </div>
              <div>
                <h4>Links</h4>
                {selected.website ? (
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-link"
                  >
                    <Icon name="globe" size={15} /> {selected.website}
                  </a>
                ) : (
                  <p className="muted small">No website added.</p>
                )}
              </div>
            </div>

            <div className="application-detail-block">
              <h4>About</h4>
              {selected.description ? (
                <p className="preline">{selected.description}</p>
              ) : (
                <p className="muted small">No company description added.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
