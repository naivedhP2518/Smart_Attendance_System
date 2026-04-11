import axios from "axios";

const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");

export const getBaseUrl = () => {
  const envBaseUrl = trimTrailingSlash(process.env.REACT_APP_API_BASE_URL || "");
  if (envBaseUrl) {
    return envBaseUrl;
  }

  if (process.env.NODE_ENV === "development") {
    return "/api";
  }

  if (typeof window !== "undefined") {
    return `${trimTrailingSlash(window.location.origin)}/api`;
  }

  return "/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
