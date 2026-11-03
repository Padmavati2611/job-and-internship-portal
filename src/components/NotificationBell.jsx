import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { formatDateTime } from "../utils/format";
import Icon from "./Icon";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const load = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await listNotifications({ limit: 8 });
      setItems(data.items || []);
      setUnread(data.unread_count || 0);
    } catch {
      setItems([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((value) => !value);
    if (!open) load(true);
  };

  const handleItem = async (item) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        setUnread((count) => Math.max(count - 1, 0));
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id ? { ...entry, is_read: true } : entry
          )
        );
      } catch {
        // Ignore notification errors; navigation should still work.
      }
    }
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setUnread(0);
      setItems((current) => current.map((entry) => ({ ...entry, is_read: true })));
    } catch {
      // Ignore.
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        type="button"
        className="icon-btn notification-trigger"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Icon name="bell" size={19} />
        {unread > 0 && <span className="notification-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="notification-panel" role="menu">
          <div className="notification-head">
            <div>
              <strong>Notifications</strong>
              <span>{unread} unread</span>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={handleMarkAll}
              disabled={unread === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="notification-list">
            {loading ? (
              <p className="notification-empty">Loading…</p>
            ) : items.length === 0 ? (
              <p className="notification-empty">You're all caught up.</p>
            ) : (
              items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`notification-item ${item.is_read ? "" : "unread"}`}
                  onClick={() => handleItem(item)}
                >
                  <span className={`notification-icon category-${item.category}`}>
                    <Icon
                      name={
                        item.category === "application" || item.category === "status"
                          ? "clipboard"
                          : item.category === "job"
                            ? "briefcase"
                            : "bell"
                      }
                      size={16}
                    />
                  </span>
                  <span className="notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>{formatDateTime(item.created_at)}</small>
                  </span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            className="notification-footer"
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
