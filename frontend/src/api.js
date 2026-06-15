import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const getSummary = () => api.get("/api/summary").then((res) => res.data);
export const getTrends = () => api.get("/api/trends").then((res) => res.data);
export const getProducts = () => api.get("/api/products").then((res) => res.data);
export const postChat = (question) =>
  api.post("/api/chat", { question }).then((res) => res.data);