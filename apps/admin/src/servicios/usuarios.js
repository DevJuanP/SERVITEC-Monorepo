import api from "./api";

// Servicios de usuarios para el panel de administración

export const usuariosService = {
  // Listar todos los usuarios
  async listar() {
    const response = await api.get("/api/user");
    return response.data?.usuarios || [];
  },

  // Buscar clientes por correo
  async buscarClientes(texto) {
    const response = await api.get(`/api/user/clientesPorCorreo/${encodeURIComponent(texto)}`);
    return response.data?.clientes || [];
  },

  // Alta de asesor
  async crearAsesor(datos) {
    const response = await api.post("/api/user/asesores", datos);
    return response.data;
  },
};