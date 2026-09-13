import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach JWT token from localStorage to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});









// import axios from "axios";


// const BASE_URL = import.meta.env.VITE_API_BASE_URL 
//   ? `${import.meta.env.VITE_API_BASE_URL}/api`
//   : "http://localhost:5000/api";

// export const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Automatically attach JWT token from localStorage to outgoing requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });