import api from "./api";

// Servicios de autenticación para el panel de administración

export const authService = {
  // Login con correo y contraseña
  // Retorna { mensaje, token, usuario: { nombre, rol } }
  async login(correo, password) {
    const response = await api.post("/api/auth/login", { correo, password });
    return response.data;
  },

  // Logout: limpia localStorage
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("rolUsuario");
    localStorage.removeItem("nombreUsuario");
  },

  // Obtener token actual
  getToken() {
    return localStorage.getItem("token");
  },

  // Obtener rol actual
  getRol() {
    return localStorage.getItem("rolUsuario");
  },

  // Obtener nombre de usuario actual
  getNombre() {
    return localStorage.getItem("nombreUsuario");
  },

  // Verificar si hay sesión activa
  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  // Guardar datos de sesión tras login exitoso
  setSession({ token, usuario }) {
    localStorage.setItem("token", token);
    localStorage.setItem("rolUsuario", usuario.rol);
    localStorage.setItem("nombreUsuario", usuario.nombre);
  },

  // Validar sesión contra el backend (GET /api/user/myInfo)
  // Retorna el usuario actualizado o lanza error si la sesión es inválida
  async validateSession() {
    const response = await api.get("/api/user/myInfo");
    return response.data.usuario;
  },
};