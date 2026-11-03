import api from "./client";

export const listJobs = (params = {}) =>
  api.get("/jobs", { params }).then((response) => response.data);

export const getJob = (id) =>
  api.get(`/jobs/${id}`).then((response) => response.data);

export const getJobsMeta = () =>
  api.get("/jobs/meta").then((response) => response.data);
