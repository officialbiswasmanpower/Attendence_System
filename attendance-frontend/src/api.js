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

export default API;
