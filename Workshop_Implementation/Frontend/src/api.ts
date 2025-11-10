import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:8080/api/";
export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
});