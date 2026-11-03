import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";
import { formatDateTime } from "../utils/format";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = async (nextFilter = filter) => {
    setLoading(true);
    setError("");
    try {
      const data = await listNotifications({
        limit: 100,
        unread_only: nextFilter === "unread",
      });
      setItems(data.items || []);
      setUnread(data.unread_count || 0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Notifications | CareerConnect";
    load("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (nextFilter) => {
    setFilter(nextFilter);
    load(nextFilter);
  };

  const handleOpen = async (item) => {
    if (!item.is_read) {
      setBusyId(item.id);
      try {
        await markNotificationRead(item.id);
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, is_read: true } : entry
          )
        );
        setUnread((count) => Math.max(0, count - 1));
      } catch (err) {
        showError(getErrorMessage(err));
      } finally {
        setBusyId(null);
      }
    }
    if (item.link) navigate(item.link);
  };

  const handleDelete = async (item) => {
    setBusyId(item.id);
    try {
      await deleteNotification(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (!item.is_read) setUnread((count) => Math.max(0, count - 1));
      success("Notification removed.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setUnread(0);
      setItems((current) =>
        current.map((entry) => ({ ...entry, is_read: true }))
      );
      success("All notifications marked as read.");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Updates</span>
          <h1>Notifications</h1>
          <p>Application updates and activity across your account.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleMarkAll}
          disabled={unread === 0 || markingAll}
        >
          <Icon name="checkCircle" size={16} />
          {markingAll ? "Marking…" : "Mark all read"}
        </button>
      </div>

      <section className="panel">
        <div className="table-toolbar">
          <div className="segmented">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => handleFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={filter === "unread" ? "active" : ""}
              onClick={() => handleFilter("unread")}
            >
              Unread {unread > 0 ? `(${unread})` : ""}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="inline-loader">
            <Spinner size="sm" /> Loading notifications…
          </div>
        ) : error ? (
          <EmptyState
            icon="alertCircle"
            title="Could not load notifications"
            message={error}
            action={
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => load(filter)}
              >
                Try again
              </button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="bell"
            title={filter === "unread" ? "No unread notifications" : "You're all caught up"}
            message="New application updates will appear here."
          />
        ) : (
          <div className="notification-page-list">
            {items.map((item) => (
              <div
                className={`notification-page-item ${item.is_read ? "" : "unread"}`}
                key={item.id}
              >
                <button
                  type="button"
                  className="notification-page-main"
                  onClick={() => handleOpen(item)}
                  disabled={busyId === item.id}
                >
                  <span className={`notification-icon category-${item.category}`}>
                    <Icon
                      name={
                        item.category === "application" ||
                        item.category === "status"
                          ? "clipboard"
                          : item.category === "job"
                            ? "briefcase"
                            : "bell"
                      }
                      size={17}
                    />
                  </span>
                  <span className="notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>{formatDateTime(item.created_at)}</small>
                  </span>
                  {!item.is_read && <span className="unread-dot" />}
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  aria-label="Delete notification"
                  title="Delete notification"
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.id}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
