import axios from "axios";

export const TOKEN_KEY = "careerconnect_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthAttempt =
      url.includes("/auth/login") || url.includes("/auth/register");
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("careerconnect:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }
  if (!error?.response) {
    return "Cannot reach the server. Make sure the backend is running.";
  }
  return "Something went wrong. Please try again.";
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors || {};
}

function filenameFromHeaders(headers, fallback) {
  const disposition = headers?.["content-disposition"] || "";
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(disposition);
  if (!match) return fallback;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return fallback;
  }
}

export async function downloadFile(path, fallbackName = "download") {
  const response = await api.get(path, { responseType: "blob" });
  const filename = filenameFromHeaders(
    response.headers,
    fallbackName
  );
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default api;
