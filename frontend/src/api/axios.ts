// src/api/axios.ts
import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const BASE_URL = configuredBaseUrl
  ? configuredBaseUrl.endsWith("/api")
    ? configuredBaseUrl
    : `${configuredBaseUrl}/api`
  : "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach JWT token & handle FormData requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FORCE Axios to leave Content-Type unset for FormData
  // This allows the browser to automatically set multipart/form-data with boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
  }

  return config;
});







// import axios from "axios";

// const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
// const BASE_URL = configuredBaseUrl
//   ? configuredBaseUrl.endsWith("/api")
//     ? configuredBaseUrl
//     : `${configuredBaseUrl}/api`
//   : "http://localhost:5000/api";

// export const api = axios.create({
//   baseURL: BASE_URL,
// });

// // Automatically attach JWT token from localStorage to outgoing requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });




