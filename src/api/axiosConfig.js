import axios from "axios";
import { API_URL } from "./config";

// =====================================
// AUTHENTICATED AXIOS
// =====================================

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// =====================================
// REFRESH TOKEN INSTANCE
// =====================================

const refreshOnlyInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// =====================================
// REQUEST INTERCEPTOR
// =====================================

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =====================================
// RESPONSE INTERCEPTOR
// =====================================

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Already retried
    if (originalRequest?._retry) {
      return Promise.reject(error);
    }

    // Ignore login/signup
    if (
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/signup")
    ) {
      return Promise.reject(error);
    }

    // Refresh only on 401
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refreshOnlyInstance.post("/auth/refresh");

        const newToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.accessToken;

        if (!newToken) {
          throw new Error("Refresh token failed");
        }

        localStorage.setItem("accessToken", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Refresh Failed", refreshError);

        localStorage.removeItem("accessToken");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
