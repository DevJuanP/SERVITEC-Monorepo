import axios from "axios";

// Cliente HTTP único del front.
// La URL base proviene de VITE_API_URL (ver .env.example). Si no está definida,
// apunta al backend local de Spring Boot en http://localhost:8080.
// El token JWT se inyecta automáticamente en cada petición como Bearer.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
