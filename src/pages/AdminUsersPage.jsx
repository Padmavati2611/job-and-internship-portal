import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  deleteUser,
  listUsers,
  updateUserStatus,
} from "../api/admin";
import { getErrorMessage } from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import { TableSkeleton } from "../components/Skeleton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  formatDate,
  getInitialsColor,
  initials,
} from "../utils/format";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const ROLE_LABELS = {
  student: "Student",
  recruiter: "Recruiter",
  admin: "Administrator",
};

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const queryString = searchParams.toString();

  const [searchInput, setSearchInput] = useState(q);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Users & Recruiters | CareerConnect";
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
    if (role) params.role = role;
    if (status) params.status = status;

    listUsers(params)
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

  const handleToggle = async (user) => {
    setUpdatingId(user.id);
    try {
      const response = await updateUserStatus(user.id, !user.is_active);
      success(response.message);
      setReloadKey((key) => key + 1);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      const response = await deleteUser(deletingTarget.id);
      success(response.message || "User deleted successfully.");
      const wasLastItem = data.items.length === 1 && page > 1;
      setDeletingTarget(null);
      if (wasLastItem) {
        const next = new URLSearchParams(searchParams);
        next.set("page", String(page - 1));
        setSearchParams(next);
      } else {
        setReloadKey((key) => key + 1);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const users = data.items || [];
  const pagination = data.pagination;

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Users & recruiters</h1>
          <p>Activate, deactivate and manage every account on the platform.</p>
        </div>
        <span className="count-pill">
          <Icon name="users" size={16} />
          {pagination?.total ?? 0} users
        </span>
      </div>

      <section className="panel">
        <div className="table-toolbar table-toolbar-stack">
          <form className="table-search" onSubmit={handleSearch}>
            <Icon name="search" size={17} />
            <input
              type="text"
              placeholder="Search by name or email"
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

          <div className="toolbar-controls">
            <select
              className="input select"
              value={role}
              onChange={(event) => updateParam("role", event.target.value)}
              aria-label="Filter by role"
            >
              <option value="">All roles</option>
              <option value="student">Students</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Administrators</option>
            </select>

            <div className="segmented">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value || "all"}
                  type="button"
                  className={status === tab.value ? "active" : ""}
                  onClick={() => updateParam("status", tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : error ? (
          <EmptyState
            icon="alertCircle"
            title="Could not load users"
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
        ) : users.length === 0 ? (
          <EmptyState
            icon="users"
            title="No users found"
            message="Try adjusting your filters or search term."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Activity</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const colors = getInitialsColor(user.name || "");
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id}>
                      <td data-label="User">
                        <div className="table-user">
                          <span
                            className="avatar avatar-sm"
                            style={{
                              background: colors.background,
                              color: colors.color,
                            }}
                          >
                            {initials(user.name || "")}
                          </span>
                          <div className="table-primary">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <span className={`badge role-badge role-${user.role}`}>
                          <Icon
                            name={
                              user.role === "admin"
                                ? "shield"
                                : user.role === "recruiter"
                                  ? "building"
                                  : "graduation"
                            }
                            size={13}
                          />
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                        {user.company?.name && (
                          <span className="table-sub">{user.company.name}</span>
                        )}
                      </td>
                      <td data-label="Activity">
                        <div className="table-date">
                          <strong>
                            {user.role === "student"
                              ? `${user.application_count ?? 0} applications`
                              : user.role === "recruiter"
                                ? `${user.job_count ?? 0} listings`
                                : "Platform admin"}
                          </strong>
                          <span>{user.is_active ? "Can sign in" : "Sign-in blocked"}</span>
                        </div>
                      </td>
                      <td data-label="Joined">{formatDate(user.created_at)}</td>
                      <td data-label="Status">
                        <span
                          className={`table-status table-status-${
                            user.is_active ? "active" : "inactive"
                          }`}
                        >
                          <span className="status-dot" />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td data-label="Actions" className="td-actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => handleToggle(user)}
                            disabled={isSelf || updatingId === user.id}
                            aria-label={
                              user.is_active
                                ? "Deactivate account"
                                : "Activate account"
                            }
                            title={
                              isSelf
                                ? "You cannot deactivate your own account"
                                : user.is_active
                                  ? "Deactivate account"
                                  : "Activate account"
                            }
                          >
                            <Icon
                              name={user.is_active ? "eyeOff" : "eye"}
                              size={16}
                            />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            onClick={() => setDeletingTarget(user)}
                            disabled={isSelf || user.role === "admin"}
                            aria-label={`Delete ${user.name}`}
                            title={
                              isSelf || user.role === "admin"
                                ? "This account cannot be deleted"
                                : "Delete account"
                            }
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
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

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        title="Delete this account?"
        message={
          deletingTarget
            ? `${deletingTarget.name} (${deletingTarget.email}) will be permanently deleted along with their related data. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete account"
        onConfirm={handleDelete}
        onClose={() => setDeletingTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
