import React, { useState, useEffect, useCallback } from "react";
import { productosService } from "../../servicios/productos";
import { toast } from "react-toastify";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ProductoForm from "../../components/ProductoForm";
import ConfirmDialog from "../../components/ConfirmDialog";
import "./Catalogo.css";

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        productosService.listar(),
        productosService.obtenerCategorias(),
      ]);
      setProductos(productosRes || []);
      setCategorias(categoriasRes || []);
    } catch (err) {
      console.error("Error cargando catálogo:", err);
      toast.error("No se pudo cargar el catálogo");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleNuevo = () => {
    setProductoEditando(null);
    setModalAbierto(true);
  };

  const handleEditar = (producto) => {
    setProductoEditando(producto);
    setModalAbierto(true);
  };

  const handleEliminar = (producto) => {
    setConfirmarEliminar(producto);
  };

  const confirmarEliminacion = async () => {
    if (!confirmarEliminar) return;
    try {
      await productosService.eliminar(confirmarEliminar.id);
      toast.success("Producto eliminado con éxito");
      setConfirmarEliminar(null);
      cargarDatos();
    } catch (err) {
      console.error("Error eliminando producto:", err);
      const msg = err.response?.data?.error || "No se pudo eliminar el producto";
      toast.error(msg);
    }
  };

  const handleGuardarProducto = async (datosProducto) => {
    setGuardando(true);
    try {
      if (productoEditando) {
        await productosService.actualizar(productoEditando.id, datosProducto);
        toast.success("Producto actualizado con éxito");
      } else {
        await productosService.crear(datosProducto);
        toast.success("Producto registrado con éxito");
      }
      setModalAbierto(false);
      setProductoEditando(null);
      cargarDatos();
    } catch (err) {
      console.error("Error guardando producto:", err);
      const msg = err.response?.data?.error || "No se pudo guardar el producto";
      toast.error(msg);
      throw err; // Para que el formulario no se cierre
    } finally {
      setGuardando(false);
    }
  };

  const columnas = [
    { key: "id", header: "ID", width: "60px" },
    { key: "name", header: "Nombre", render: (p) => <strong>{p.name}</strong> },
    { key: "price", header: "Precio", render: (p) => `S/ ${Number(p.price).toFixed(2)}` },
    {
      key: "stock",
      header: "Stock",
      render: (p) => (
        <span className={`stock-badge ${p.stock === 0 ? "agotado" : p.stock <= 5 ? "bajo" : ""}`}>
          {p.stock}
        </span>
      ),
    },
    {
      key: "categoria",
      header: "Categoría",
      render: (p) => (
        <span>
          {p.categoria?.name} / {p.categoria?.Subcategoria}
        </span>
      ),
    },
    { key: "actions", header: "Acciones", width: "140px" },
  ];

  const renderAcciones = (producto) => (
    <div className="acciones-cell">
      <button
        type="button"
        className="btn-icon btn-editar"
        onClick={() => handleEditar(producto)}
        aria-label={`Editar ${producto.name}`}
        title="Editar"
      >
        ✏️
      </button>
      <button
        type="button"
        className="btn-icon btn-eliminar"
        onClick={() => handleEliminar(producto)}
        aria-label={`Eliminar ${producto.name}`}
        title="Eliminar"
      >
        🗑️
      </button>
    </div>
  );

  if (cargando) {
    return (
      <div className="catalogo-loading">
        <div className="skeleton-table">
          <div className="skeleton-header" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="catalogo">
      <div className="catalogo-header">
        <h2>Catálogo e Inventario</h2>
        <button type="button" className="btn-nuevo" onClick={handleNuevo}>
          + Nuevo Producto
        </button>
      </div>

      <DataTable
        data={productos}
        columns={columnas}
        renderRowActions={renderAcciones}
        emptyMessage="No hay productos registrados"
        loading={cargando}
      />

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={productoEditando ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
      >
        <ProductoForm
          categorias={categorias}
          initialData={productoEditando}
          onSubmit={handleGuardarProducto}
          loading={guardando}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmarEliminar}
        onClose={() => setConfirmarEliminar(null)}
        onConfirm={confirmarEliminacion}
        title="Eliminar Producto"
        message={`¿Está seguro de eliminar "${confirmarEliminar?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={guardando}
      />
    </div>
  );
};

export default Catalogo;