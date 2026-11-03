import api, { downloadFile } from "./client";

export const getStats = () =>
  api.get("/admin/stats").then((response) => response.data);

export const listJobs = (params = {}) =>
  api.get("/admin/jobs", { params }).then((response) => response.data);

export const createJob = (payload) =>
  api.post("/admin/jobs", payload).then((response) => response.data);

export const updateJob = (id, payload) =>
  api.put(`/admin/jobs/${id}`, payload).then((response) => response.data);

export const deleteJob = (id) =>
  api.delete(`/admin/jobs/${id}`).then((response) => response.data);

export const listStudents = (params = {}) =>
  api.get("/admin/students", { params }).then((response) => response.data);

export const getStudent = (id) =>
  api.get(`/admin/students/${id}`).then((response) => response.data);

export const downloadStudentResume = (id, name = "resume.pdf") =>
  downloadFile(`/admin/students/${id}/resume`, name);

export const listApplications = (params = {}) =>
  api
    .get("/admin/applications", { params })
    .then((response) => response.data);

export const updateApplicationStatus = (id, status) =>
  api
    .patch(`/admin/applications/${id}/status`, { status })
    .then((response) => response.data);

export const listUsers = (params = {}) =>
  api.get("/admin/users", { params }).then((response) => response.data);

export const updateUserStatus = (id, isActive) =>
  api
    .patch(`/admin/users/${id}/status`, { is_active: isActive })
    .then((response) => response.data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`).then((response) => response.data);

export const listCompanies = (params = {}) =>
  api.get("/admin/companies", { params }).then((response) => response.data);
