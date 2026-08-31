import axios from "axios";
import { API_BASE_URL } from "./networkmodule";
import { getShopLoginPath } from "./authRedirect";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// REQUEST INTERCEPTOR
// =========================
axiosInstance.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      try {
        const { accessToken } = JSON.parse(userData);

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Handle FormData correctly
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// RESPONSE INTERCEPTOR (with silent token refresh on 401)
// =========================
let isRefreshing = false;
let refreshSubscribers = [];

const notifySubscribers = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const forceLogout = () => {
  const loginPath = getShopLoginPath();
  localStorage.removeItem("userData");
  window.location.href = loginPath;
};

axiosInstance.interceptors.response.use(
  (response) => {
    // ✅ IMPORTANT FIX:
    // Always return backend payload directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error?.config;
    const isLoginRequest = originalRequest?.url?.includes("/auth/login");
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");

    if (
      error?.response?.status === 401 &&
      !isLoginRequest &&
      !isRefreshRequest &&
      !originalRequest?._retry
    ) {
      const userDataRaw = localStorage.getItem("userData");
      const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
      const refreshToken = userData?.refreshToken;

      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error?.response?.data || error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newToken) => {
            if (!newToken) {
              reject(error?.response?.data || error);
              return;
            }
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

        userData.accessToken = accessToken;
        userData.refreshToken = newRefreshToken;
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);

        isRefreshing = false;
        notifySubscribers(accessToken);

        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        notifySubscribers(null);
        forceLogout();
        return Promise.reject(error?.response?.data || error);
      }
    }

    if (error?.response?.status === 401 && !isLoginRequest) {
      forceLogout();
    }

    // Normalize error response
    return Promise.reject(error?.response?.data || error);
  }
);

// =========================
// HTTP SERVICE
// =========================
const httpService = {
  get: async (url, params = {}) => {
    try {
      return await axiosInstance.get(url, { params });
    } catch (error) {
      console.error("GET request error:", error);
      throw error;
    }
  },

  post: async (url, data = {}) => {
    try {
      return await axiosInstance.post(url, data);
    } catch (error) {
      console.error("POST request error:", error);
      throw error;
    }
  },

  put: async (url, data = {}) => {
    try {
      return await axiosInstance.put(url, data);
    } catch (error) {
      console.error("PUT request error:", error);
      throw error;
    }
  },

  patch: async (url, data = {}) => {
    try {
      return await axiosInstance.patch(url, data);
    } catch (error) {
      console.error("PATCH request error:", error);
      throw error;
    }
  },

  remove: async (url) => {
    try {
      return await axiosInstance.delete(url);
    } catch (error) {
      console.error("DELETE request error:", error);
      throw error;
    }
  },

  getFileUrl: (fileUrl) => {
    if (!fileUrl) return "";

    return `${API_BASE_URL}/event-requests/get-filecontent?url=${encodeURIComponent(
      fileUrl
    )}`;
  },
};

export default httpService;
