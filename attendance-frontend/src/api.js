import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "/api";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

const API = axios.create({
  baseURL,
  timeout: 20000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();
    const isTokenError =
      status === 401 &&
      (message.includes("token") || message.includes("expired") || message.includes("no token"));

    if (isTokenError) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("employeeId");
      localStorage.removeItem("pages");

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default API;
