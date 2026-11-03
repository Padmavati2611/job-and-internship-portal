import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createJob, updateJob } from "../api/admin";
import { getJob } from "../api/jobs";
import {
  createJob as createRecruiterJob,
  getJob as getRecruiterJob,
  updateJob as updateRecruiterJob,
} from "../api/recruiter";
import { getErrorMessage, getFieldErrors } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Spinner, { PageLoader } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  EXPERIENCE_LABELS,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  companyColor,
  deadlineLabel,
  formatDate,
  initials,
} from "../utils/format";

const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  job_type: "job",
  work_mode: "onsite",
  experience_level: "fresher",
  category: "",
  compensation: "",
  openings: 1,
  deadline: "",
  description: "",
  requirements: "",
  responsibilities: "",
  skills: "",
  salary_min: "",
  salary_max: "",
  is_active: true,
};

const CATEGORY_SUGGESTIONS = [
  "Engineering",
  "Design",
  "Data & Analytics",
  "Marketing",
  "Sales & Business",
  "Human Resources",
  "Finance",
  "Operations",
];

export default function JobFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { isRecruiter, company } = useAuth();
  const basePath = isRecruiter ? "/recruiter" : "/admin";
  const jobsPath = `${basePath}/jobs`;

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.title = isEdit
      ? "Edit listing | CareerConnect"
      : "New listing | CareerConnect";
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    (isRecruiter ? getRecruiterJob(id) : getJob(id))
      .then((data) => {
        if (cancelled) return;
        const job = data.job;
        setForm({
          title: job.title || "",
          company: job.company || "",
          location: job.location || "",
          job_type: job.job_type || "job",
          work_mode: job.work_mode || "onsite",
          experience_level: job.experience_level || "fresher",
          category: job.category || "",
          compensation: job.compensation || "",
          openings: job.openings || 1,
          deadline: job.deadline || "",
          description: job.description || "",
          requirements: job.requirements || "",
          responsibilities: job.responsibilities || "",
          skills: job.skills || "",
          salary_min: job.salary_min ?? "",
          salary_max: job.salary_max ?? "",
          is_active: job.is_active ?? true,
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, isRecruiter]);

  const displayCompany = isRecruiter ? company?.name || "" : form.company;
  const previewColors = useMemo(
    () => companyColor(displayCompany || "CareerConnect"),
    [displayCompany]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Job title is required.";
    if (!isRecruiter && !form.company.trim()) {
      errors.company = "Company name is required.";
    }
    if (isRecruiter && !company?.name) {
      errors.company = "Complete your company profile first.";
    }
    if (!form.location.trim()) errors.location = "Location is required.";
    if (!form.description.trim()) {
      errors.description = "A role description is required.";
    }
    if (form.openings && Number(form.openings) < 1) {
      errors.openings = "Openings must be at least 1.";
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showError("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      category: form.category.trim(),
      compensation: form.compensation.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      responsibilities: form.responsibilities.trim(),
      openings: Number(form.openings) || 1,
      deadline: form.deadline || null,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
      is_active: Boolean(form.is_active),
    };

    if (isRecruiter) {
      payload.company = company?.name || form.company;
    }

    try {
      if (isEdit) {
        const data = isRecruiter
          ? await updateRecruiterJob(id, payload)
          : await updateJob(id, payload);
        success(data.message || "Listing updated successfully.");
      } else {
        const data = isRecruiter
          ? await createRecruiterJob(payload)
          : await createJob(payload);
        success(data.message || "Listing created successfully.");
      }
      navigate(jobsPath);
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading listing…" />;
  }

  if (loadError) {
    return (
      <EmptyState
        icon="alertCircle"
        title="Could not load listing"
        message={loadError}
        action={
          <Link to={jobsPath} className="btn btn-primary">
            Back to listings
          </Link>
        }
      />
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">{isEdit ? "Edit listing" : "New listing"}</span>
          <h1>{isEdit ? `Edit "${form.title}"` : "Post a new opportunity"}</h1>
          <p>
            {isEdit
              ? "Update the details students see when browsing."
              : "Reach students with a clear, complete job description."}
          </p>
        </div>
        <Link to={jobsPath} className="btn btn-secondary">
          <Icon name="arrowLeft" size={16} /> Back to listings
        </Link>
      </div>

      <form className="listing-form-layout" onSubmit={handleSubmit} noValidate>
        <div className="listing-form-main">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Role basics</h2>
                <p>The essentials students see first.</p>
              </div>
              <span className="panel-icon">
                <Icon name="briefcase" size={18} />
              </span>
            </div>

            <div className="form-grid">
              <div className="form-group form-span-2">
                <label className="label" htmlFor="job-title">
                  Job title <span className="required">*</span>
                </label>
                <input
                  id="job-title"
                  name="title"
                  className={`input ${fieldErrors.title ? "input-error" : ""}`}
                  placeholder="Frontend Developer"
                  value={form.title}
                  onChange={handleChange}
                />
                {fieldErrors.title && (
                  <p className="error-text">{fieldErrors.title}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-company">
                  Company <span className="required">*</span>
                </label>
                <input
                  id="job-company"
                  name="company"
                  className={`input ${fieldErrors.company ? "input-error" : ""}`}
                  placeholder="NovaTech Solutions"
                  value={isRecruiter ? company?.name || "" : form.company}
                  onChange={handleChange}
                  disabled={isRecruiter}
                />
                {fieldErrors.company && (
                  <p className="error-text">{fieldErrors.company}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-location">
                  Location <span className="required">*</span>
                </label>
                <input
                  id="job-location"
                  name="location"
                  className={`input ${fieldErrors.location ? "input-error" : ""}`}
                  placeholder="Bengaluru, India or Remote"
                  value={form.location}
                  onChange={handleChange}
                />
                {fieldErrors.location && (
                  <p className="error-text">{fieldErrors.location}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-type">
                  Opportunity type
                </label>
                <select
                  id="job-type"
                  name="job_type"
                  className="input select"
                  value={form.job_type}
                  onChange={handleChange}
                >
                  <option value="job">Full-time job</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-work-mode">
                  Work mode
                </label>
                <select
                  id="job-work-mode"
                  name="work_mode"
                  className="input select"
                  value={form.work_mode}
                  onChange={handleChange}
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-experience">
                  Experience level
                </label>
                <select
                  id="job-experience"
                  name="experience_level"
                  className="input select"
                  value={form.experience_level}
                  onChange={handleChange}
                >
                  {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-category">
                  Category
                </label>
                <input
                  id="job-category"
                  name="category"
                  className="input"
                  list="category-suggestions"
                  placeholder="Engineering"
                  value={form.category}
                  onChange={handleChange}
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-compensation">
                  Compensation
                </label>
                <input
                  id="job-compensation"
                  name="compensation"
                  className="input"
                  placeholder="INR 6 - 9 LPA or INR 25,000 / month"
                  value={form.compensation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-skills">
                  Key skills
                </label>
                <input
                  id="job-skills"
                  name="skills"
                  className="input"
                  placeholder="React, TypeScript, REST APIs"
                  value={form.skills}
                  onChange={handleChange}
                />
                <p className="hint">Separate skills with commas.</p>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-salary-min">
                  Minimum salary (annual, numeric)
                </label>
                <input
                  id="job-salary-min"
                  name="salary_min"
                  type="number"
                  min="0"
                  className="input"
                  placeholder="600000"
                  value={form.salary_min}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-salary-max">
                  Maximum salary (annual, numeric)
                </label>
                <input
                  id="job-salary-max"
                  name="salary_max"
                  type="number"
                  min="0"
                  className="input"
                  placeholder="900000"
                  value={form.salary_max}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-openings">
                  Openings
                </label>
                <input
                  id="job-openings"
                  name="openings"
                  type="number"
                  min="1"
                  max="9999"
                  className={`input ${fieldErrors.openings ? "input-error" : ""}`}
                  value={form.openings}
                  onChange={handleChange}
                />
                {fieldErrors.openings && (
                  <p className="error-text">{fieldErrors.openings}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label" htmlFor="job-deadline">
                  Application deadline
                </label>
                <input
                  id="job-deadline"
                  name="deadline"
                  type="date"
                  className="input"
                  value={form.deadline}
                  onChange={handleChange}
                />
                <p className="hint">Leave empty to accept applications ongoing.</p>
              </div>

              <div className="form-group form-span-2">
                <label className="switch-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />
                  <span className="switch">
                    <span />
                  </span>
                  <span>
                    <strong>Publish this listing</strong>
                    <small>
                      Active listings are visible to students immediately.
                    </small>
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Role details</h2>
                <p>Help students understand the opportunity.</p>
              </div>
              <span className="panel-icon">
                <Icon name="fileText" size={18} />
              </span>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="job-description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="job-description"
                name="description"
                rows={7}
                maxLength={10000}
                className={`textarea ${
                  fieldErrors.description ? "input-error" : ""
                }`}
                placeholder="Describe the role, the team and the impact the student will have…"
                value={form.description}
                onChange={handleChange}
              />
              <div className="field-foot">
                {fieldErrors.description ? (
                  <p className="error-text">{fieldErrors.description}</p>
                ) : (
                  <span />
                )}
                <p className="hint">{form.description.length}/10000</p>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="job-responsibilities">
                Responsibilities
              </label>
              <textarea
                id="job-responsibilities"
                name="responsibilities"
                rows={5}
                maxLength={5000}
                className="textarea"
                placeholder="List the day-to-day responsibilities, one per line…"
                value={form.responsibilities}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="job-requirements">
                Requirements
              </label>
              <textarea
                id="job-requirements"
                name="requirements"
                rows={5}
                maxLength={5000}
                className="textarea"
                placeholder="List skills, qualifications and experience, one per line…"
                value={form.requirements}
                onChange={handleChange}
              />
            </div>
          </section>

          <div className="profile-form-actions">
            <Link to={jobsPath} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" /> Saving…
                </>
              ) : (
                <>
                  <Icon name="check" size={17} />
                  {isEdit ? "Save changes" : "Publish listing"}
                </>
              )}
            </button>
          </div>
        </div>

        <aside className="listing-form-side">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Live preview</h2>
                <p>How this listing will look.</p>
              </div>
            </div>
            <div className="job-card preview-card">
              <div className="job-card-top">
                <span
                  className="company-logo"
                  style={{
                    background: previewColors.background,
                    color: previewColors.color,
                  }}
                >
                  {initials(displayCompany || "CC")}
                </span>
                <span className={`badge badge-${form.job_type}`}>
                  {JOB_TYPE_LABELS[form.job_type]}
                </span>
              </div>
              <h3 className="job-card-title">
                {form.title || "Your job title"}
              </h3>
              <p className="job-card-company">
                {displayCompany || "Company name"}
              </p>
              <div className="job-card-meta">
                <span>
                  <Icon name="mapPin" size={15} />
                  {form.location || "Location"}
                </span>
                <span>
                  <Icon name="laptop" size={15} />
                  {WORK_MODE_LABELS[form.work_mode]}
                </span>
              </div>
              <div className="job-card-tags">
                {form.category && <span className="tag">{form.category}</span>}
                <span className="tag tag-muted">
                  {EXPERIENCE_LABELS[form.experience_level]}
                </span>
              </div>
              <div className="job-card-footer">
                <div>
                  <p className="job-compensation">
                    {form.compensation || "Competitive"}
                  </p>
                  <span className="deadline">
                    <Icon name="clock" size={14} />
                    {deadlineLabel(form.deadline)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Publishing checklist</h2>
                <p>A complete listing gets more applicants.</p>
              </div>
            </div>
            <ul className="profile-checklist">
              <li className={form.title ? "done" : ""}>
                <Icon
                  name={form.title ? "checkCircle" : "circle"}
                  size={16}
                />
                Clear job title
              </li>
              <li className={form.description ? "done" : ""}>
                <Icon
                  name={form.description ? "checkCircle" : "circle"}
                  size={16}
                />
                Detailed description
              </li>
              <li className={form.compensation ? "done" : ""}>
                <Icon
                  name={form.compensation ? "checkCircle" : "circle"}
                  size={16}
                />
                Compensation range
              </li>
              <li className={form.deadline ? "done" : ""}>
                <Icon
                  name={form.deadline ? "checkCircle" : "circle"}
                  size={16}
                />
                Application deadline
              </li>
              <li className={form.requirements ? "done" : ""}>
                <Icon
                  name={form.requirements ? "checkCircle" : "circle"}
                  size={16}
                />
                Requirements listed
              </li>
            </ul>
            {form.deadline && (
              <p className="hint">
                Closes on {formatDate(form.deadline)} ·{" "}
                {deadlineLabel(form.deadline)}
              </p>
            )}
          </section>

          <div className="info-banner info-banner-blue">
            <Icon name="info" size={17} />
            <span>
              Use clear, inclusive language and avoid asking for sensitive
              personal information.
            </span>
          </div>
        </aside>
      </form>
    </div>
  );
}
