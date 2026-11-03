import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getJobsMeta, listJobs } from "../api/jobs";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import JobCard from "../components/JobCard";
import Pagination from "../components/Pagination";
import { JobCardSkeleton } from "../components/Skeleton";
import {
  EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  pluralize,
} from "../utils/format";

const DEFAULT_FILTERS = {
  q: "",
  location: "",
  company: "",
  category: "",
  job_type: "",
  work_mode: "",
  experience_level: "",
  skill: "",
  salary_min: "",
  salary_max: "",
  sort: "newest",
};

export default function JobsPage({ lockedType }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [meta, setMeta] = useState({ companies: [], locations: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [locationInput, setLocationInput] = useState(
    searchParams.get("location") || ""
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const filters = useMemo(() => {
    const values = {};
    Object.keys(DEFAULT_FILTERS).forEach((key) => {
      values[key] = searchParams.get(key) || DEFAULT_FILTERS[key];
    });
    if (lockedType) values.job_type = lockedType;
    return values;
  }, [searchParams, lockedType]);

  const page = Number(searchParams.get("page") || 1);
  const queryString = searchParams.toString();

  const isInternships = lockedType === "internship";
  const pageTitle = isInternships
    ? "Internships that launch careers"
    : "Jobs and internships worth applying for";

  useEffect(() => {
    document.title = isInternships
      ? "Internships | CareerConnect"
      : "Jobs & Internships | CareerConnect";
  }, [isInternships]);

  useEffect(() => {
    setSearchInput(searchParams.get("q") || "");
    setLocationInput(searchParams.get("location") || "");
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    getJobsMeta()
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const params = { page, per_page: 9, sort: filters.sort };
    [
      "q",
      "location",
      "company",
      "category",
      "job_type",
      "work_mode",
      "experience_level",
      "skill",
      "salary_min",
      "salary_max",
    ].forEach(
      (key) => {
        if (filters[key]) params[key] = filters[key];
      }
    );

    listJobs(params)
      .then((data) => {
        if (cancelled) return;
        setJobs(data.items || []);
        setPagination(data.pagination || null);
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
  }, [queryString, lockedType, page, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  };

  const applySearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("q", searchInput.trim());
    else next.delete("q");
    if (locationInput.trim()) next.set("location", locationInput.trim());
    else next.delete("location");
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput("");
    setLocationInput("");
    setSearchParams({});
  };

  const activeFilters = [
    filters.q && { key: "q", label: `Search: ${filters.q}` },
    filters.location && { key: "location", label: `Location: ${filters.location}` },
    !lockedType &&
      filters.job_type && {
        key: "job_type",
        label: JOB_TYPE_LABELS[filters.job_type] || filters.job_type,
      },
    filters.work_mode && {
      key: "work_mode",
      label: WORK_MODE_LABELS[filters.work_mode] || filters.work_mode,
    },
    filters.experience_level && {
      key: "experience_level",
      label: EXPERIENCE_LABELS[filters.experience_level] || filters.experience_level,
    },
    filters.company && { key: "company", label: filters.company },
    filters.category && { key: "category", label: filters.category },
    filters.skill && { key: "skill", label: `Skill: ${filters.skill}` },
    filters.salary_min && {
      key: "salary_min",
      label: `Salary from ${filters.salary_min}`,
    },
    filters.salary_max && {
      key: "salary_max",
      label: `Salary up to ${filters.salary_max}`,
    },
  ].filter(Boolean);

  const total = pagination?.total ?? 0;

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-glow" aria-hidden="true" />
        <div className="container">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {isInternships ? "Internship opportunities" : "Explore opportunities"}
          </span>
          <h1>{pageTitle}</h1>
          <p>
            {isInternships
              ? "Gain real experience, learn from mentors and take the first step in your career."
              : "Discover roles that match your skills, goals and preferred way of working."}
          </p>

          <form className="jobs-search-bar" onSubmit={applySearch}>
            <label className="jobs-search-field">
              <Icon name="search" size={19} />
              <span className="sr-only">Search opportunities</span>
              <input
                type="text"
                placeholder="Search by role, company or keyword"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </label>
            <label className="jobs-search-field jobs-search-location">
              <Icon name="mapPin" size={19} />
              <span className="sr-only">Location</span>
              <input
                type="text"
                placeholder="Location"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
              />
            </label>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container jobs-layout">
          <aside className={`filters ${filtersOpen ? "filters-open" : ""}`}>
            <div className="filters-header">
              <h2>
                <Icon name="sliders" size={18} /> Filters
              </h2>
              {activeFilters.length > 0 && (
                <button type="button" className="link-btn" onClick={clearFilters}>
                  Clear all
                </button>
              )}
            </div>

            {!lockedType && (
              <div className="filter-group">
                <span className="filter-label">Opportunity type</span>
                {[
                  { value: "", label: "All opportunities" },
                  { value: "job", label: "Full-time jobs" },
                  { value: "internship", label: "Internships" },
                ].map((option) => (
                  <label key={option.value || "all"} className="radio-row">
                    <input
                      type="radio"
                      name="job_type"
                      checked={filters.job_type === option.value}
                      onChange={() => updateParam("job_type", option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            )}

            {lockedType && (
              <div className="filter-note">
                <Icon name="graduation" size={16} />
                Showing internships only
              </div>
            )}

            <div className="filter-group">
              <span className="filter-label">Work mode</span>
              {[
                { value: "", label: "Any mode" },
                { value: "onsite", label: "On-site" },
                { value: "remote", label: "Remote" },
                { value: "hybrid", label: "Hybrid" },
              ].map((option) => (
                <label key={option.value || "any"} className="radio-row">
                  <input
                    type="radio"
                    name="work_mode"
                    checked={filters.work_mode === option.value}
                    onChange={() => updateParam("work_mode", option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-experience">
                Experience level
              </label>
              <select
                id="filter-experience"
                className="input select"
                value={filters.experience_level}
                onChange={(event) =>
                  updateParam("experience_level", event.target.value)
                }
              >
                <option value="">Any experience</option>
                {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-company">
                Company
              </label>
              <select
                id="filter-company"
                className="input select"
                value={filters.company}
                onChange={(event) => updateParam("company", event.target.value)}
              >
                <option value="">All companies</option>
                {meta.companies?.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-category">
                Category
              </label>
              <select
                id="filter-category"
                className="input select"
                value={filters.category}
                onChange={(event) => updateParam("category", event.target.value)}
              >
                <option value="">All categories</option>
                {meta.categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label" htmlFor="filter-skill">
                Skill
              </label>
              <input
                id="filter-skill"
                type="text"
                className="input"
                placeholder="e.g. React, Python"
                defaultValue={filters.skill}
                onBlur={(event) => updateParam("skill", event.target.value.trim())}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    updateParam("skill", event.currentTarget.value.trim());
                  }
                }}
              />
            </div>

            <div className="filter-group">
              <span className="filter-label">Salary range (annual)</span>
              <div className="filter-range">
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Min"
                  defaultValue={filters.salary_min}
                  onBlur={(event) => updateParam("salary_min", event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="Max"
                  defaultValue={filters.salary_max}
                  onBlur={(event) => updateParam("salary_max", event.target.value)}
                />
              </div>
            </div>

            <div className="filter-tip">
              <Icon name="sparkles" size={16} />
              <p>Tip: use fewer filters to see more opportunities.</p>
            </div>
          </aside>

          <div className="jobs-results">
            <div className="results-toolbar">
              <div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm filter-toggle"
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  <Icon name="filter" size={16} />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="filter-count">{activeFilters.length}</span>
                  )}
                </button>
                <p className="results-count">
                  {loading ? (
                    "Searching for opportunities…"
                  ) : (
                    <>
                      <strong>{total}</strong>{" "}
                      {pluralize(total, "opportunity", "opportunities")} found
                    </>
                  )}
                </p>
              </div>
              <label className="sort-control">
                <span>Sort by</span>
                <select
                  className="input select"
                  value={filters.sort}
                  onChange={(event) => updateParam("sort", event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="deadline">Closing soon</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </label>
            </div>

            {activeFilters.length > 0 && (
              <div className="active-filters">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className="filter-chip"
                    onClick={() => updateParam(filter.key, "")}
                  >
                    {filter.label}
                    <Icon name="close" size={13} />
                  </button>
                ))}
                <button type="button" className="filter-chip clear" onClick={clearFilters}>
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="jobs-grid jobs-grid-two">
                {Array.from({ length: 6 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon="alertCircle"
                title="Something went wrong"
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
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="search"
                title="No matching opportunities"
                message="Try removing a filter, searching for a broader term, or exploring all opportunities."
                action={
                  <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                    Clear filters
                  </button>
                }
              />
            ) : (
              <>
                <div className="jobs-grid jobs-grid-two">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <Pagination
                  page={pagination?.page || 1}
                  pages={pagination?.pages || 1}
                  onChange={(nextPage) => {
                    const next = new URLSearchParams(searchParams);
                    if (nextPage <= 1) next.delete("page");
                    else next.set("page", String(nextPage));
                    setSearchParams(next);
                    window.scrollTo({ top: 320, behavior: "smooth" });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
