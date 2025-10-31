import axios from "axios";

/**
 * Global Axios instance for client-side API calls
 */
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
