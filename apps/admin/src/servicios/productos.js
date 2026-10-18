import api from "./api";

// Servicios de catálogo e inventario (solo admin)

export const productosService = {
  // Listar todos los productos (incluye agotados)
  async listar() {
    const response = await api.get("/api/productos/admin");
    return response.data || [];
  },

  // Obtener categorías para el select del formulario
  async obtenerCategorias() {
    const response = await api.get("/api/categorias");
    return response.data?.categorias || [];
  },

  // Crear producto
  async crear(producto) {
    const response = await api.post("/api/productos", producto);
    return response.data;
  },

  // Actualizar producto
  async actualizar(id, producto) {
    const response = await api.put(`/api/productos/${id}`, producto);
    return response.data;
  },

  // Eliminar producto
  async eliminar(id) {
    const response = await api.delete(`/api/productos/${id}`);
    return response.data;
  },
};