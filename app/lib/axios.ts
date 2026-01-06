import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Vercel rewrite handles backend
  timeout: 10000,
});

export default api;