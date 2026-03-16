import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(false);
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Attaching token to request:", config.url);
    } else {
      console.warn("No current user when making request:", config.url);
    }
  } catch (err) {
    console.error("Failed to get token:", err);
  }
  return config;
});

export default api;