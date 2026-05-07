import axios from "axios";
import { getSession } from "next-auth/react";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://vadi-backend.onrender.com",
  withCredentials: true, // if using cookies
});

// Attach admin bearer token from NextAuth session
API.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = session?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;
