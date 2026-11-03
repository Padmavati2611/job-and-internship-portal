import api, { downloadFile } from "./client";

export const getProfile = () =>
  api.get("/student/profile").then((response) => response.data);

export const updateProfile = (payload) =>
  api.put("/student/profile", payload).then((response) => response.data);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return api
    .post("/student/resume", formData)
    .then((response) => response.data);
};

export const downloadResume = () =>
  downloadFile("/student/resume", "resume.pdf");

export const getApplications = (params = {}) =>
  api.get("/student/applications", { params }).then((response) => response.data);

export const applyForJob = (payload) =>
  api.post("/student/applications", payload).then((response) => response.data);

export const withdrawApplication = (id) =>
  api.delete(`/student/applications/${id}`).then((response) => response.data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api
    .post("/student/avatar", formData)
    .then((response) => response.data);
};

export const getSavedJobs = () =>
  api.get("/student/saved-jobs").then((response) => response.data);

export const saveJob = (jobId) =>
  api
    .post("/student/saved-jobs", { job_id: jobId })
    .then((response) => response.data);

export const unsaveJob = (jobId) =>
  api.delete(`/student/saved-jobs/${jobId}`).then((response) => response.data);
