import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getJobsMeta, listJobs } from "../api/jobs";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import JobCard from "../components/JobCard";
import { JobCardSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import {
  companyColor,
  deadlineLabel,
  initials,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
} from "../utils/format";

const CATEGORY_CARDS = [
  {
    name: "Engineering",
    icon: "code",
    description: "Software, frontend, backend and cloud roles.",
  },
  {
    name: "Design",
    icon: "layout",
    description: "Product, UI/UX and visual design opportunities.",
  },
  {
    name: "Data & Analytics",
    icon: "chart",
    description: "Data science, analytics and machine learning.",
  },
  {
    name: "Marketing",
    icon: "target",
    description: "Growth, content, social and brand marketing.",
  },
  {
    name: "Sales & Business",
    icon: "briefcase",
    description: "Business development, sales and strategy.",
  },
  {
    name: "Human Resources",
    icon: "users",
    description: "People operations, recruiting and culture.",
  },
];

const POPULAR_SEARCHES = ["Frontend", "Data Analyst", "Design", "Marketing"];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([listJobs({ per_page: 6 }), getJobsMeta()]).then(
      ([jobsResult, metaResult]) => {
        if (cancelled) return;
        if (jobsResult.status === "fulfilled") {
          setJobs(jobsResult.value.items || []);
        } else {
          setLoadError(true);
        }
        if (metaResult.status === "fulfilled") {
          setMeta(metaResult.value);
        }
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const showcaseJob = jobs[0];
  const showcaseColors = useMemo(
    () => companyColor(showcaseJob?.company || "CareerConnect"),
    [showcaseJob]
  );

  const dashboardPath = user
    ? user.role === "admin"
      ? "/admin"
      : "/dashboard"
    : "/register";

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const quickSearch = (term) => {
    navigate(`/jobs?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">
              <span className="eyebrow-dot" />
              Your next opportunity starts here
            </span>
            <h1>
              Where ambition
              <br />
              meets <span className="hero-highlight">opportunity.</span>
            </h1>
            <p className="hero-subtitle">
              Discover handpicked jobs and internships, build a standout profile
              and track every application — all in one place built for students.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <label className="hero-search-field">
                <Icon name="search" size={19} />
                <span className="sr-only">Search roles or companies</span>
                <input
                  type="text"
                  placeholder="Role, company or skill"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <span className="hero-search-divider" />
              <label className="hero-search-field hero-search-location">
                <Icon name="mapPin" size={19} />
                <span className="sr-only">Location</span>
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </label>
              <button type="submit" className="btn btn-primary hero-search-btn">
                Search
                <Icon name="arrowRight" size={17} />
              </button>
            </form>

            <div className="hero-tags">
              <span>Popular:</span>
              {POPULAR_SEARCHES.map((term) => (
                <button key={term} type="button" onClick={() => quickSearch(term)}>
                  {term}
                </button>
              ))}
            </div>

            <div className="hero-actions">
              <Link to={dashboardPath} className="btn btn-light btn-lg">
                {user ? "Go to dashboard" : "Create free account"}
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link to="/jobs" className="btn btn-hero-ghost btn-lg">
                Browse opportunities
              </Link>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card hero-card-main">
              <div className="hero-card-top">
                <span
                  className="company-logo company-logo-lg"
                  style={{
                    background: showcaseColors.background,
                    color: showcaseColors.color,
                  }}
                >
                  {initials(showcaseJob?.company || "NovaTech")}
                </span>
                <div className="hero-card-heading">
                  <strong>
                    {showcaseJob?.title || "Frontend Developer Intern"}
                  </strong>
                  <span>{showcaseJob?.company || "NovaTech Solutions"}</span>
                </div>
                <span className="badge badge-internship">Internship</span>
              </div>
              <div className="hero-card-meta">
                <span>
                  <Icon name="mapPin" size={14} />
                  {showcaseJob?.location || "Bengaluru, India"}
                </span>
                <span>
                  <Icon name="laptop" size={14} />
                  {WORK_MODE_LABELS[showcaseJob?.work_mode] || "Hybrid"}
                </span>
                <span>
                  <Icon name="clock" size={14} />
                  {deadlineLabel(showcaseJob?.deadline)}
                </span>
              </div>
              <div className="hero-card-progress">
                <div className="hero-card-progress-head">
                  <span>Application progress</span>
                  <strong>75%</strong>
                </div>
                <div className="hero-progress-track">
                  <span style={{ width: "75%" }} />
                </div>
              </div>
              <div className="hero-card-actions">
                <span className="pill-soft">
                  <Icon name="checkCircle" size={14} /> Application ready
                </span>
                <span className="hero-card-button">Apply now</span>
              </div>
            </div>

            <div className="hero-float hero-float-top">
              <span className="float-icon float-icon-green">
                <Icon name="checkCircle" size={17} />
              </span>
              <div>
                <strong>Application shortlisted</strong>
                <span>Data Analyst · InsightEdge</span>
              </div>
            </div>

            <div className="hero-float hero-float-bottom">
              <span className="float-icon float-icon-blue">
                <Icon name="user" size={17} />
              </span>
              <div>
                <strong>Profile strength</strong>
                <span>92% complete</span>
              </div>
              <span className="float-score">92</span>
            </div>

            <span className="hero-orbit hero-orbit-one" />
            <span className="hero-orbit hero-orbit-two" />
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats-grid">
          <div className="mini-stat">
            <span className="mini-stat-icon">
              <Icon name="briefcase" size={20} />
            </span>
            <div>
              <h3>{meta?.counts?.total_jobs ?? "—"}+</h3>
              <p>Open full-time roles</p>
            </div>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-icon">
              <Icon name="graduation" size={20} />
            </span>
            <div>
              <h3>{meta?.counts?.total_internships ?? "—"}+</h3>
              <p>Internships hiring</p>
            </div>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-icon">
              <Icon name="building" size={20} />
            </span>
            <div>
              <h3>{meta?.counts?.total_companies ?? "—"}+</h3>
              <p>Companies on the platform</p>
            </div>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-icon">
              <Icon name="shield" size={20} />
            </span>
            <div>
              <h3>100%</h3>
              <p>Free for students</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Fresh opportunities</span>
              <h2>Handpicked roles, ready for you</h2>
              <p>
                Explore the latest jobs and internships from teams building
                what's next.
              </p>
            </div>
            <div className="section-heading-actions">
              <Link to="/jobs" className="btn btn-secondary">
                View all jobs <Icon name="arrowRight" size={16} />
              </Link>
              <Link to="/internships" className="btn btn-ghost">
                Browse internships <Icon name="arrowUpRight" size={16} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="jobs-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : loadError ? (
            <EmptyState
              icon="alertCircle"
              title="Could not load opportunities"
              message="Make sure the CareerConnect API is running, then refresh the page."
              action={
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              }
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title="No opportunities posted yet"
              message="New roles are added regularly. Check back soon or create an account to get started."
              action={
                <Link to="/register" className="btn btn-primary">
                  Create an account
                </Link>
              }
            />
          ) : (
            <div className="jobs-grid">
              {jobs.slice(0, 6).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading section-heading-center">
            <div>
              <span className="eyebrow">Explore by interest</span>
              <h2>Find work that fits your ambition</h2>
              <p>Browse opportunities across the fields students love most.</p>
            </div>
          </div>

          <div className="category-grid">
            {CATEGORY_CARDS.map((category) => (
              <Link
                key={category.name}
                to={`/jobs?category=${encodeURIComponent(category.name)}`}
                className="category-card"
              >
                <span className="category-icon">
                  <Icon name={category.icon} size={22} />
                </span>
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
                <span className="category-arrow">
                  <Icon name="arrowUpRight" size={17} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading section-heading-center">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>From first search to signed offer</h2>
              <p>Three simple steps to move your career forward.</p>
            </div>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <span className="step-icon">
                <Icon name="user" size={22} />
              </span>
              <h3>Create your profile</h3>
              <p>
                Add your education, skills and resume to help the right
                opportunities find you.
              </p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <span className="step-icon">
                <Icon name="search" size={22} />
              </span>
              <h3>Discover and apply</h3>
              <p>
                Search and filter roles by company, location, type and work
                mode, then apply in seconds.
              </p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <span className="step-icon">
                <Icon name="target" size={22} />
              </span>
              <h3>Track every application</h3>
              <p>
                Follow each application from pending to shortlisted, selected or
                rejected in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-glow" aria-hidden="true" />
            <div className="cta-copy">
              <span className="eyebrow eyebrow-light">Take the next step</span>
              <h2>Your future starts with one application.</h2>
              <p>
                Join students building their careers with CareerConnect. Create
                your free profile today.
              </p>
            </div>
            <div className="cta-actions">
              <Link to={dashboardPath} className="btn btn-light btn-lg">
                {user ? "Open dashboard" : "Create your profile"}
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link to="/jobs" className="btn btn-hero-ghost btn-lg">
                Explore roles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
