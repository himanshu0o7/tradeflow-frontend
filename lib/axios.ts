import axios from "axios";

/**
 * Base API URL strategy:
 * - Prefer NEXT_PUBLIC_API_BASE if defined
 * - Otherwise fallback to Next.js rewrite (/api)
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE && process.env.NEXT_PUBLIC_API_BASE.length > 0
    ? process.env.NEXT_PUBLIC_API_BASE
    : "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds safety
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Optional: Global response error handler
 * Keeps frontend errors consistent
 */
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "API request failed";

    return Promise.reject(new Error(message));
  }
);