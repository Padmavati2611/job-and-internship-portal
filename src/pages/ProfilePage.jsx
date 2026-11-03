import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  downloadResume,
  getProfile,
  updateProfile,
  uploadResume,
} from "../api/student";
import { getErrorMessage } from "../api/client";
import Icon from "../components/Icon";
import Spinner, { InlineLoader, PageLoader } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  formatDate,
  initials,
  profileCompletion,
  splitSkills,
} from "../utils/format";

const EMPTY_FORM = {
  phone: "",
  college: "",
  degree: "",
  branch: "",
  graduation_year: "",
  location: "",
  skills: "",
  bio: "",
  linkedin: "",
  github: "",
  portfolio: "",
};

const PROFILE_CHECKS = [
  { key: "phone", label: "Phone number" },
  { key: "college", label: "College details" },
  { key: "skills", label: "Skills" },
  { key: "bio", label: "Short bio" },
  { key: "resume_available", label: "Resume uploaded" },
];

export default function ProfilePage() {
  const { user, profile, updateProfileState } = useAuth();
  const { success, error: showError } = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = "My Profile | CareerConnect";
    let cancelled = false;
    getProfile()
      .then((data) => {
        if (cancelled) return;
        updateProfileState(data.profile);
        const next = { ...EMPTY_FORM };
        Object.keys(EMPTY_FORM).forEach((key) => {
          next[key] = data.profile?.[key] ?? "";
        });
        if (data.profile?.graduation_year === null) next.graduation_year = "";
        setForm(next);
      })
      .catch((err) => {
        showError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (form.graduation_year) {
      const year = Number(form.graduation_year);
      if (
        Number.isNaN(year) ||
        year < 1950 ||
        year > new Date().getFullYear() + 10
      ) {
        showError("Please enter a valid graduation year.");
        return;
      }
    }

    setSaving(true);
    try {
      const data = await updateProfile({
        ...form,
        graduation_year: form.graduation_year
          ? Number(form.graduation_year)
          : null,
      });
      updateProfileState(data.profile);
      success(data.message || "Profile updated successfully.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setResumeError("");
    if (!file) {
      setResumeFile(null);
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(extension)) {
      setResumeError("Please choose a PDF, DOC or DOCX file.");
      setResumeFile(null);
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Your resume must be smaller than 5 MB.");
      setResumeFile(null);
      event.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      setResumeError("Please choose a resume file first.");
      return;
    }
    setUploading(true);
    setResumeError("");
    try {
      const data = await uploadResume(resumeFile);
      updateProfileState(data.profile);
      setResumeFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      success(data.message || "Resume uploaded successfully.");
    } catch (err) {
      const message = getErrorMessage(err);
      setResumeError(message);
      showError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadResume();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading your profile…" />;
  }

  const completion = profileCompletion(profile);
  const skillTags = splitSkills(form.skills);

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Profile</span>
          <h1>My profile</h1>
          <p>Keep your details current so employers get the full picture.</p>
        </div>
        <span className={`completion-badge ${completion === 100 ? "complete" : ""}`}>
          <Icon name={completion === 100 ? "checkCircle" : "target"} size={16} />
          {completion}% complete
        </span>
      </div>

      <div className="profile-layout">
        <form className="profile-form" onSubmit={handleSave}>
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Basic information</h2>
                <p>How employers can reach you.</p>
              </div>
              <span className="panel-icon">
                <Icon name="user" size={18} />
              </span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="label" htmlFor="profile-name">
                  Full name
                </label>
                <input
                  id="profile-name"
                  className="input"
                  value={user?.name || ""}
                  disabled
                />
                <p className="hint">Name is tied to your account.</p>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-email">
                  Email address
                </label>
                <input
                  id="profile-email"
                  className="input"
                  value={user?.email || ""}
                  disabled
                />
                <p className="hint">Contact support to change your email.</p>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-phone">
                  Phone number
                </label>
                <input
                  id="profile-phone"
                  name="phone"
                  className="input"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-location">
                  Current location
                </label>
                <input
                  id="profile-location"
                  name="location"
                  className="input"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Education</h2>
                <p>Your academic background.</p>
              </div>
              <span className="panel-icon">
                <Icon name="graduation" size={18} />
              </span>
            </div>

            <div className="form-grid">
              <div className="form-group form-span-2">
                <label className="label" htmlFor="profile-college">
                  College / university
                </label>
                <input
                  id="profile-college"
                  name="college"
                  className="input"
                  placeholder="National Institute of Technology"
                  value={form.college}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-degree">
                  Degree
                </label>
                <input
                  id="profile-degree"
                  name="degree"
                  className="input"
                  placeholder="B.Tech"
                  value={form.degree}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-branch">
                  Branch / specialisation
                </label>
                <input
                  id="profile-branch"
                  name="branch"
                  className="input"
                  placeholder="Computer Science"
                  value={form.branch}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-graduation">
                  Graduation year
                </label>
                <input
                  id="profile-graduation"
                  name="graduation_year"
                  type="number"
                  min="1950"
                  max={new Date().getFullYear() + 10}
                  className="input"
                  placeholder="2026"
                  value={form.graduation_year}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Skills and summary</h2>
                <p>Show employers what makes you a great fit.</p>
              </div>
              <span className="panel-icon">
                <Icon name="zap" size={18} />
              </span>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="profile-skills">
                Skills
              </label>
              <input
                id="profile-skills"
                name="skills"
                className="input"
                placeholder="React, Python, SQL, Figma"
                value={form.skills}
                onChange={handleChange}
              />
              <p className="hint">Separate skills with commas.</p>
              {skillTags.length > 0 && (
                <div className="skill-tags">
                  {skillTags.map((skill) => (
                    <span className="tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="profile-bio">
                About you
              </label>
              <textarea
                id="profile-bio"
                name="bio"
                className="textarea"
                rows={5}
                maxLength={2000}
                placeholder="A short summary of your interests, goals and what you're looking for…"
                value={form.bio}
                onChange={handleChange}
              />
              <p className="hint">{form.bio.length}/2000 characters</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Links</h2>
                <p>Share your work and professional profiles.</p>
              </div>
              <span className="panel-icon">
                <Icon name="link" size={18} />
              </span>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="label" htmlFor="profile-linkedin">
                  LinkedIn
                </label>
                <div className="input-icon-wrap">
                  <Icon name="link" size={16} className="input-icon" />
                  <input
                    id="profile-linkedin"
                    name="linkedin"
                    className="input input-with-icon"
                    placeholder="https://linkedin.com/in/username"
                    value={form.linkedin}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="profile-github">
                  GitHub
                </label>
                <div className="input-icon-wrap">
                  <Icon name="code" size={16} className="input-icon" />
                  <input
                    id="profile-github"
                    name="github"
                    className="input input-with-icon"
                    placeholder="https://github.com/username"
                    value={form.github}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group form-span-2">
                <label className="label" htmlFor="profile-portfolio">
                  Portfolio / personal website
                </label>
                <div className="input-icon-wrap">
                  <Icon name="globe" size={16} className="input-icon" />
                  <input
                    id="profile-portfolio"
                    name="portfolio"
                    className="input input-with-icon"
                    placeholder="https://yourwebsite.com"
                    value={form.portfolio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="profile-form-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" /> Saving…
                </>
              ) : (
                <>
                  <Icon name="check" size={17} /> Save changes
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="profile-sidebar">
          <section className="panel profile-preview">
            <span className="avatar avatar-xl">{initials(user?.name || "")}</span>
            <h2>{user?.name}</h2>
            <p>{form.degree || "Student"}{form.branch ? ` · ${form.branch}` : ""}</p>
            {form.college && (
              <span className="preview-college">
                <Icon name="graduation" size={14} /> {form.college}
              </span>
            )}
            <div className="preview-progress">
              <div className="progress-bar">
                <span style={{ width: `${completion}%` }} />
              </div>
              <span>{completion}% complete</span>
            </div>
            {skillTags.length > 0 && (
              <div className="skill-tags preview-skills">
                {skillTags.slice(0, 6).map((skill) => (
                  <span className="tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Profile checklist</h2>
                <p>Items employers look for.</p>
              </div>
            </div>
            <ul className="profile-checklist">
              {PROFILE_CHECKS.map((item) => {
                const done = Boolean(profile?.[item.key]);
                return (
                  <li key={item.key} className={done ? "done" : ""}>
                    <Icon
                      name={done ? "checkCircle" : "circle"}
                      size={16}
                    />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>Resume</h2>
                <p>PDF, DOC or DOCX up to 5 MB.</p>
              </div>
              <span className="panel-icon">
                <Icon name="fileText" size={18} />
              </span>
            </div>

            {profile?.resume_available ? (
              <div className="resume-card resume-card-compact">
                <span className="resume-icon">
                  <Icon name="fileText" size={20} />
                </span>
                <div>
                  <strong>{profile.resume_original_name}</strong>
                  <span>Uploaded {formatDate(profile.resume_uploaded_at)}</span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={handleDownload}
                  disabled={downloading}
                  aria-label="Download resume"
                >
                  {downloading ? <Spinner size="sm" /> : <Icon name="download" size={17} />}
                </button>
              </div>
            ) : (
              <p className="muted small">
                No resume on file yet. Upload one to complete your profile.
              </p>
            )}

            <label className="upload-dropzone">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <Icon name="upload" size={20} />
              <span>
                {resumeFile ? resumeFile.name : "Choose a resume file"}
              </span>
              <small>PDF, DOC or DOCX · max 5 MB</small>
            </label>

            {resumeError && <p className="error-text">{resumeError}</p>}

            {uploading ? (
              <InlineLoader message="Uploading resume…" />
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleUpload}
                disabled={!resumeFile}
              >
                <Icon name="upload" size={16} />
                {profile?.resume_available ? "Replace resume" : "Upload resume"}
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
