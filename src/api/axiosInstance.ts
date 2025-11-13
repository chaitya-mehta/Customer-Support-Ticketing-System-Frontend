import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
let navigateFn: ((path: string) => void) | null = null;

export const setNavigate = (navigate: (path: string) => void) => {
  navigateFn = navigate;
};

export const navigateTo = (path: string) => {
  if (navigateFn) navigateFn(path);
  else window.location.href = path;
};
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigateTo("/login");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
