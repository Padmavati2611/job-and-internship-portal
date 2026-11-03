import { useEffect, useState } from "react";
import { getCompany, updateCompany } from "../api/recruiter";
import { getErrorMessage, getFieldErrors } from "../api/client";
import Icon from "../components/Icon";
import { PageLoader } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { companyColor, initials } from "../utils/format";

const EMPTY_FORM = {
  name: "",
  tagline: "",
  industry: "",
  website: "",
  size: "",
  founded_year: "",
  location: "",
  description: "",
};

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export default function RecruiterCompanyPage() {
  const { success, error: showError } = useToast();
  const { setCompany } = useAuth();
  const [company, setCompanyData] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.title = "Company Profile | CareerConnect";
    let cancelled = false;
    getCompany()
      .then((data) => {
        if (cancelled) return;
        setCompanyData(data.company);
        setForm({
          name: data.company?.name || "",
          tagline: data.company?.tagline || "",
          industry: data.company?.industry || "",
          website: data.company?.website || "",
          size: data.company?.size || "",
          founded_year: data.company?.founded_year ?? "",
          location: data.company?.location || "",
          description: data.company?.description || "",
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
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFieldErrors({ name: "Company name is required." });
      showError("Please add your company name.");
      return;
    }

    setSaving(true);
    try {
      const data = await updateCompany({
        ...form,
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        founded_year: form.founded_year === "" ? null : Number(form.founded_year),
      });
      setCompanyData(data.company);
      setForm((current) => ({
        ...current,
        name: data.company?.name || "",
        founded_year: data.company?.founded_year ?? "",
      }));
      setCompany(data.company);
      success(data.message || "Company profile updated successfully.");
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading company profile…" />;
  }

  if (loadError) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <h2>Could not load company profile</h2>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  const colors = companyColor(form.name || "CareerConnect");

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Company</span>
          <h1>Company profile</h1>
          <p>This information is shown alongside every listing you post.</p>
        </div>
      </div>

      <div className="profile-layout">
        <form className="profile-form" onSubmit={handleSubmit}>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Company details</h2>
                <p>Tell students who you are and what you do.</p>
              </div>
              <span className="panel-icon">
                <Icon name="building" size={18} />
              </span>
            </div>

            <div className="form-grid">
              <div className="form-group form-span-2">
                <label className="label" htmlFor="company-name">
                  Company name <span className="required">*</span>
                </label>
                <input
                  id="company-name"
                  name="name"
                  className={`input ${fieldErrors.name ? "input-error" : ""}`}
                  placeholder="NovaTech Solutions"
                  value={form.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && (
                  <p className="error-text">{fieldErrors.name}</p>
                )}
              </div>

              <div className="form-group form-span-2">
                <label className="label" htmlFor="company-tagline">
                  Tagline
                </label>
                <input
                  id="company-tagline"
                  name="tagline"
                  className="input"
                  placeholder="Building the tools teams love to use"
                  maxLength={200}
                  value={form.tagline}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="company-industry">
                  Industry
                </label>
                <input
                  id="company-industry"
                  name="industry"
                  className="input"
                  placeholder="Software & Internet"
                  value={form.industry}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="company-website">
                  Website
                </label>
                <input
                  id="company-website"
                  name="website"
                  className="input"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="company-size">
                  Company size
                </label>
                <select
                  id="company-size"
                  name="size"
                  className="input select"
                  value={form.size}
                  onChange={handleChange}
                >
                  <option value="">Select company size</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="company-founded">
                  Founded year
                </label>
                <input
                  id="company-founded"
                  name="founded_year"
                  type="number"
                  min="1800"
                  max="2100"
                  className="input"
                  placeholder="2018"
                  value={form.founded_year}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-span-2">
                <label className="label" htmlFor="company-location">
                  Headquarters
                </label>
                <input
                  id="company-location"
                  name="location"
                  className="input"
                  placeholder="Bengaluru, India"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-span-2">
                <label className="label" htmlFor="company-description">
                  About the company
                </label>
                <textarea
                  id="company-description"
                  name="description"
                  rows={7}
                  maxLength={4000}
                  className="textarea"
                  placeholder="Share your mission, products, culture and what makes your team a great place to work."
                  value={form.description}
                  onChange={handleChange}
                />
                <p className="hint">{form.description.length}/4000 characters</p>
              </div>
            </div>
          </section>

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save company profile"}
            </button>
          </div>
        </form>

        <aside className="profile-sidebar">
          <section className="panel profile-preview">
            <span
              className="company-logo company-logo-lg"
              style={{ background: colors.background, color: colors.color }}
            >
              {initials(form.name || "CC")}
            </span>
            <h2>{form.name || "Your company"}</h2>
            <p>{form.tagline || "Add a tagline to stand out."}</p>
            {form.location && (
              <span className="preview-college">
                <Icon name="mapPin" size={14} />
                {form.location}
              </span>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Company snapshot</h2>
                <p>How your profile is performing.</p>
              </div>
            </div>
            <div className="company-snapshot">
              <div>
                <strong>{company?.job_count ?? 0}</strong>
                <span>Listings</span>
              </div>
              <div>
                <strong>{company?.active_job_count ?? 0}</strong>
                <span>Active</span>
              </div>
              <div>
                <strong>{company?.application_count ?? 0}</strong>
                <span>Applications</span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Profile tips</h2>
                <p>Complete details build candidate trust.</p>
              </div>
            </div>
            <ul className="tip-list">
              <li>
                <Icon name="checkCircle" size={16} />
                Add your website and headquarters.
              </li>
              <li>
                <Icon name="checkCircle" size={16} />
                Describe your mission in a short paragraph.
              </li>
              <li>
                <Icon name="checkCircle" size={16} />
                Keep your company name consistent with listings.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
