import axios from "axios";
import { getSession } from "next-auth/react";

/**
 * Global Axios instance for client-side API calls
 *  - Automatically points to /api
 *  - Injects accessToken from NextAuth session if available
 */
const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // ✅ helps for secure cookies (NextAuth sessions)
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  async (config) => {
    try {
      // Only try to fetch session in the browser
      if (typeof window !== "undefined") {
        const session = await getSession();
        if (session?.user?.accessToken) {
          config.headers.Authorization = `Bearer ${session.user.accessToken}`;
        }
      }
    } catch (err) {
      console.warn("⚠️ Unable to attach session token:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
