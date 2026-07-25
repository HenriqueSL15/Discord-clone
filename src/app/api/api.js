import axios from "axios";

const api = axios.create({
  baseURL: process.env.FRONTEND_URL | "/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
