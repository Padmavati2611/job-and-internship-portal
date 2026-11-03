import api, { downloadFile } from "./client";

export const getCompany = () =>
  api.get("/recruiter/company").then((response) => response.data);

export const updateCompany = (payload) =>
  api.put("/recruiter/company", payload).then((response) => response.data);

export const getStats = () =>
  api.get("/recruiter/stats").then((response) => response.data);

export const listJobs = (params = {}) =>
  api.get("/recruiter/jobs", { params }).then((response) => response.data);

export const getJob = (id) =>
  api.get(`/recruiter/jobs/${id}`).then((response) => response.data);

export const createJob = (payload) =>
  api.post("/recruiter/jobs", payload).then((response) => response.data);

export const updateJob = (id, payload) =>
  api.put(`/recruiter/jobs/${id}`, payload).then((response) => response.data);

export const updateJobStatus = (id, isActive) =>
  api
    .patch(`/recruiter/jobs/${id}/status`, { is_active: isActive })
    .then((response) => response.data);

export const deleteJob = (id) =>
  api.delete(`/recruiter/jobs/${id}`).then((response) => response.data);

export const listApplications = (params = {}) =>
  api.get("/recruiter/applications", { params }).then((response) => response.data);

export const updateApplicationStatus = (id, status) =>
  api
    .patch(`/recruiter/applications/${id}/status`, { status })
    .then((response) => response.data);

export const getApplicant = (id) =>
  api.get(`/recruiter/applicants/${id}`).then((response) => response.data);

export const downloadApplicantResume = (id, name = "resume.pdf") =>
  downloadFile(`/recruiter/applicants/${id}/resume`, name);
