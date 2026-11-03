import api from "./client";

export const listNotifications = (params = {}) =>
  api.get("/notifications", { params }).then((response) => response.data);

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`).then((response) => response.data);

export const markAllNotificationsRead = () =>
  api.post("/notifications/read-all").then((response) => response.data);

export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`).then((response) => response.data);
