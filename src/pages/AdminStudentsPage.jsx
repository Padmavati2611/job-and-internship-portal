import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  downloadStudentResume,
  getStudent,
  listStudents,
} from "../api/admin";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import {
  formatDate,
  getInitialsColor,
  initials,
  profileCompletion,
  splitSkills,
} from "../utils/format";

export default function AdminStudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToast();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const queryString = searchParams.toString();

  const [searchInput, setSearchInput] = useState(q);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    document.title = "Students | CareerConnect";
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

    listStudents(params)
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

  useEffect(() => {
    if (!selectedId) return undefined;
    let cancelled = false;
    setDetailLoading(true);
    setDetail(null);
    setDetailError("");
    getStudent(selectedId)
      .then((response) => {
        if (!cancelled) setDetail(response);
      })
      .catch((err) => {
        if (!cancelled) setDetailError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("q", searchInput.trim());
    else next.delete("q");
    next.delete("page");
    setSearchParams(next);
  };

  const handleDownload = async (studentId, filename) => {
    setDownloadingId(studentId);
    try {
      await downloadStudentResume(studentId, filename || "resume.pdf");
      success("Resume download started.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const students = data.items || [];
  const pagination = data.pagination;
  const detailStudent = detail?.student;
  const detailProfile = detailStudent?.profile;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Students</span>
          <h1>Registered students</h1>
          <p>Review student profiles, resumes and application activity.</p>
        </div>
        <span className="count-pill">
          <Icon name="users" size={16} />
          {pagination?.total ?? 0} students
        </span>
      </div>

      <section className="panel">
        <div className="table-toolbar">
          <form className="table-search" onSubmit={handleSearch}>
            <Icon name="search" size={17} />
            <input
              type="text"
              placeholder="Search by name, email, college or location"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="table-search-clear"
                onClick={() => {
                  setSearchInput("");
                  const next = new URLSearchParams(searchParams);
                  next.delete("q");
                  next.delete("page");
                  setSearchParams(next);
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
            title="Could not load students"
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
        ) : students.length === 0 ? (
          <EmptyState
            icon="users"
            title={q ? "No students matched your search" : "No students registered yet"}
            message={
              q
                ? "Try a different name, email or college."
                : "Students will appear here after they create an account."
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Education</th>
                  <th>Applications</th>
                  <th>Profile</th>
                  <th>Resume</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const colors = getInitialsColor(student.name);
                  const profile = student.profile;
                  const completion = profileCompletion(profile);
                  return (
                    <tr key={student.id}>
                      <td data-label="Student">
                        <div className="table-user">
                          <span
                            className="avatar avatar-sm"
                            style={{ background: colors.background, color: colors.color }}
                          >
                            {initials(student.name)}
                          </span>
                          <div className="table-primary">
                            <strong>{student.name}</strong>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Education">
                        <div className="table-primary">
                          <strong>{profile?.college || "Not added"}</strong>
                          <span>
                            {[profile?.degree, profile?.branch]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </span>
                        </div>
                      </td>
                      <td data-label="Applications">
                        <span className="applicant-count">
                          <Icon name="clipboard" size={15} />
                          {student.application_count ?? 0}
                        </span>
                      </td>
                      <td data-label="Profile">
                        <div className="completion-mini">
                          <div className="progress-bar progress-bar-sm">
                            <span style={{ width: `${completion}%` }} />
                          </div>
                          <span>{completion}%</span>
                        </div>
                      </td>
                      <td data-label="Resume">
                        {profile?.resume_available ? (
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() =>
                              handleDownload(
                                student.id,
                                profile.resume_original_name
                              )
                            }
                            disabled={downloadingId === student.id}
                          >
                            {downloadingId === student.id ? (
                              <Spinner size="xs" />
                            ) : (
                              <Icon name="download" size={15} />
                            )}
                            Download
                          </button>
                        ) : (
                          <span className="muted small">Not uploaded</span>
                        )}
                      </td>
                      <td data-label="Actions" className="td-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedId(student.id)}
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
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null);
          setDetail(null);
        }}
        title="Student profile"
        subtitle={
          detailStudent
            ? `${detailStudent.name} · ${detailStudent.email}`
            : "Loading profile details…"
        }
        size="lg"
      >
        {detailLoading ? (
          <div className="modal-loader">
            <Spinner size="lg" />
            <p>Loading student details…</p>
          </div>
        ) : detailError ? (
          <EmptyState
            compact
            icon="alertCircle"
            title="Could not load student"
            message={detailError}
          />
        ) : detailStudent ? (
          <div className="student-detail">
            <div className="student-detail-head">
              <span className="avatar avatar-lg">{initials(detailStudent.name)}</span>
              <div>
                <h3>{detailStudent.name}</h3>
                <p>{detailStudent.email}</p>
                <span className="muted small">
                  Joined {formatDate(detailStudent.created_at)}
                </span>
              </div>
              <span className="completion-badge">
                {profileCompletion(detailProfile)}% complete
              </span>
            </div>

            <div className="student-detail-grid">
              <div>
                <h4>Contact</h4>
                <p>{detailProfile?.phone || "No phone added"}</p>
                <p>{detailProfile?.location || "No location added"}</p>
              </div>
              <div>
                <h4>Education</h4>
                <p>{detailProfile?.college || "Not added"}</p>
                <p>
                  {[detailProfile?.degree, detailProfile?.branch]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                  {detailProfile?.graduation_year
                    ? ` · ${detailProfile.graduation_year}`
                    : ""}
                </p>
              </div>
            </div>

            {detailProfile?.bio && (
              <div className="student-detail-block">
                <h4>About</h4>
                <p>{detailProfile.bio}</p>
              </div>
            )}

            {detailProfile?.skills && (
              <div className="student-detail-block">
                <h4>Skills</h4>
                <div className="skill-tags">
                  {splitSkills(detailProfile.skills).map((skill) => (
                    <span className="tag" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="student-detail-block">
              <h4>Links</h4>
              <div className="detail-links">
                {detailProfile?.linkedin && (
                  <a href={detailProfile.linkedin} target="_blank" rel="noreferrer">
                    <Icon name="link" size={15} /> LinkedIn
                  </a>
                )}
                {detailProfile?.github && (
                  <a href={detailProfile.github} target="_blank" rel="noreferrer">
                    <Icon name="code" size={15} /> GitHub
                  </a>
                )}
                {detailProfile?.portfolio && (
                  <a href={detailProfile.portfolio} target="_blank" rel="noreferrer">
                    <Icon name="globe" size={15} /> Portfolio
                  </a>
                )}
                {!detailProfile?.linkedin &&
                  !detailProfile?.github &&
                  !detailProfile?.portfolio && (
                    <span className="muted small">No links added.</span>
                  )}
              </div>
            </div>

            <div className="student-detail-block">
              <div className="student-detail-block-head">
                <h4>Resume</h4>
                {detailProfile?.resume_available ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      handleDownload(
                        detailStudent.id,
                        detailProfile.resume_original_name
                      )
                    }
                    disabled={downloadingId === detailStudent.id}
                  >
                    {downloadingId === detailStudent.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <Icon name="download" size={15} />
                    )}
                    Download resume
                  </button>
                ) : (
                  <span className="muted small">No resume uploaded.</span>
                )}
              </div>
            </div>

            <div className="student-detail-block">
              <h4>Applications ({detail.applications?.length || 0})</h4>
              {detail.applications?.length ? (
                <div className="mini-application-list">
                  {detail.applications.map((application) => (
                    <div className="mini-application" key={application.id}>
                      <div>
                        <strong>{application.job?.title}</strong>
                        <span>
                          {application.job?.company} · Applied{" "}
                          {formatDate(application.applied_at)}
                        </span>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted small">This student has not applied yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
