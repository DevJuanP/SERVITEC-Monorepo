import axios from "axios";
import { toast } from "react-toastify";

// Cliente HTTP único del panel de administración.
// La URL base proviene de VITE_API_URL (ver .env.example). Si no está definida,
// apunta al backend local de Spring Boot en http://localhost:8080.
// El token JWT se inyecta automáticamente en cada petición como Bearer.
// Maneja 401 (token expirado/inválido) → limpia sesión y redirige a /login.
// Maneja 403 (sin permisos) → muestra toast.

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Token expirado o inválido → limpiar sesión y redirigir a login
        localStorage.removeItem("token");
        localStorage.removeItem("rolUsuario");
        localStorage.removeItem("nombreUsuario");
        toast.error("Sesión expirada. Inicie sesión nuevamente.");
        // Usamos setTimeout para evitar problemas de navegación durante el render
        setTimeout(() => {
          window.location.href = "/login";
        }, 0);
      } else if (status === 403) {
        toast.error("No tiene permisos para realizar esta acción");
      }
    }
    return Promise.reject(error);
  }
);

export default api;