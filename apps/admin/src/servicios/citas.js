import api from "./api";

// Servicios de citas para el panel de administración

export const citasService = {
  // Listar citas con filtros (admin ve todas, asesor ve las suyas)
  async listar(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.asesorId) params.append("asesorId", filtros.asesorId);
    if (filtros.clienteId) params.append("clienteId", filtros.clienteId);
    if (filtros.estado) params.append("estado", filtros.estado);
    const response = await api.get(`/api/cita?${params.toString()}`);
    return response.data?.citas || [];
  },

  // Obtener tipos de cita
  async obtenerTiposCita() {
    const response = await api.get("/api/cita/tipoCita");
    return response.data?.tiposCitas || [];
  },

  // Obtener asesores
  async obtenerAsesores() {
    const response = await api.get("/api/user/asesores");
    return response.data?.asesores || [];
  },

  // Buscar clientes por correo
  async buscarClientes(texto) {
    const response = await api.get(`/api/user/clientesPorCorreo/${encodeURIComponent(texto)}`);
    return response.data?.clientes || [];
  },

  // Disponibilidad de un asesor en una fecha
  async obtenerDisponibilidad(asesorId, fecha) {
    const response = await api.get("/api/cita/disponibilidad", {
      params: { asesorId, fecha },
    });
    return response.data?.franjas || [];
  },

  // Disponibilidad semanal
  async obtenerDisponibilidadSemana(asesorId, desde) {
    const response = await api.get("/api/cita/disponibilidadSemana", {
      params: { asesorId, desde },
    });
    return response.data?.dias || [];
  },

  // Crear cita como admin (agregarCitaAdmin)
  async crearCitaAdmin(datos) {
    const response = await api.post("/api/cita/agregarCitaAdmin", datos);
    return response.data;
  },

  // Aprobar cita
  async aprobar(citaId) {
    const response = await api.post("/api/cita/aprobarCita", { citaId });
    return response.data;
  },

  // Cancelar/rechazar cita
  async cancelar(citaId) {
    const response = await api.post("/api/cita/cancelarCita", { citaId });
    return response.data;
  },

  // Completar cita (requiere observación)
  async completar(citaId, observacion) {
    const response = await api.post("/api/cita/completarCita", { citaId, observacion });
    return response.data;
  },
};