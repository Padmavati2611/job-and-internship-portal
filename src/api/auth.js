import api from "./client";

export const login = (payload) =>
  api.post("/auth/login", payload).then((response) => response.data);

export const register = (payload) =>
  api.post("/auth/register", payload).then((response) => response.data);

export const getMe = () =>
  api.get("/auth/me").then((response) => response.data);

export const changePassword = (payload) =>
  api.post("/auth/change-password", payload).then((response) => response.data);

export const updateAccount = (payload) =>
  api.patch("/auth/me", payload).then((response) => response.data);
