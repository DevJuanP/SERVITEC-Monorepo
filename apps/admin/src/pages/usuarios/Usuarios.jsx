import React, { useState, useEffect, useCallback } from "react";
import { usuariosService } from "../../servicios/usuarios";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { toast } from "react-toastify";
import "./Usuarios.css";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscarCliente, setBuscarCliente] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [modalAsesorAbierto, setModalAsesorAbierto] = useState(false);
  const [asesorForm, setAsesorForm] = useState({ nombre: "", correo: "", password: "" });
  const [creandoAsesor, setCreandoAsesor] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const data = await usuariosService.listar();
      setUsuarios(data || []);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      toast.error("No se pudo cargar la lista de usuarios");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleBuscarClientes = async () => {
    if (!buscarCliente.trim() || buscarCliente.length < 3) {
      setClientesEncontrados([]);
      return;
    }
    setBuscando(true);
    try {
      const data = await usuariosService.buscarClientes(buscarCliente.trim());
      setClientesEncontrados(data || []);
    } catch (err) {
      console.error("Error buscando clientes:", err);
      setClientesEncontrados([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleCrearAsesor = async (e) => {
    e.preventDefault();
    if (!asesorForm.nombre.trim() || !asesorForm.correo.trim() || !asesorForm.password) {
      toast.error("Complete todos los campos");
      return;
    }
    if (asesorForm.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setCreandoAsesor(true);
    try {
      await usuariosService.crearAsesor({
        nombre: asesorForm.nombre.trim(),
        correo: asesorForm.correo.trim(),
        password: asesorForm.password,
      });
      toast.success("Asesor registrado con éxito");
      setAsesorForm({ nombre: "", correo: "", password: "" });
      setModalAsesorAbierto(false);
      cargarUsuarios();
    } catch (err) {
      console.error("Error creando asesor:", err);
      const msg = err.response?.data?.error || "No se pudo crear el asesor";
      toast.error(msg);
    } finally {
      setCreandoAsesor(false);
    }
  };

  const handleEliminar = (usuario) => {
    if (usuario.rol === "admin") {
      toast.error("No se puede eliminar un administrador");
      return;
    }
    setConfirmarEliminar(usuario);
  };

  const confirmarEliminacion = async () => {
    // Nota: No hay endpoint DELETE /api/user/{id} en el contrato actual
    // Solo mostramos mensaje informativo
    toast.info("La eliminación de usuarios no está implementada en esta versión (solo alta de asesores)");
    setConfirmarEliminar(null);
  };

  const getRolBadge = (rol) => {
    const config = {
      admin: { label: "Administrador", class: "rol-admin" },
      asesor: { label: "Asesor", class: "rol-asesor" },
      cliente: { label: "Cliente", class: "rol-cliente" },
    };
    const { label, class: badgeClass } = config[rol] || { label: rol, class: "" };
    return <span className={`rol-badge ${badgeClass}`}>{label}</span>;
  };

  const getActivoBadge = (activo) => (
    <span className={`activo-badge ${activo ? "activo" : "inactivo"}`}>
      {activo ? "Activo" : "Inactivo"}
    </span>
  );

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const columnas = [
    { key: "_id", header: "ID", width: "70px" },
    { key: "nombre", header: "Nombre" },
    { key: "correo", header: "Correo" },
    { key: "rol", header: "Rol", width: "130px", render: (u) => getRolBadge(u.rol) },
    { key: "activo", header: "Estado", width: "100px", render: (u) => getActivoBadge(u.activo) },
    { key: "fechaRegistro", header: "Registro", width: "130px", render: (u) => formatearFecha(u.fechaRegistro) },
    { key: "actions", header: "Acciones", width: "100px" },
  ];

  const renderAcciones = (usuario) => (
    <div className="acciones-cell">
      {usuario.rol !== "admin" && (
        <button
          type="button"
          className="btn-icon btn-eliminar"
          onClick={() => handleEliminar(usuario)}
          title="Eliminar"
          aria-label={`Eliminar ${usuario.nombre}`}
        >
          🗑️
        </button>
      )}
    </div>
  );

  if (cargando) {
    return (
      <div className="usuarios-loading">
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
              <div className="skeleton-cell" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios">
      <div className="usuarios-header">
        <h2>Usuarios</h2>
        <button type="button" className="btn-nuevo" onClick={() => setModalAsesorAbierto(true)}>
          + Nuevo Asesor
        </button>
      </div>

      <div className="busqueda-clientes">
        <h3>Buscar Clientes</h3>
        <div className="search-wrapper">
          <div className="form-group">
            <label htmlFor="buscar-cliente">Correo del cliente</label>
            <div className="search-input-wrapper">
              <input
                type="email"
                id="buscar-cliente"
                value={buscarCliente}
                onChange={(e) => {
                  setBuscarCliente(e.target.value);
                  if (e.target.value.length >= 3) handleBuscarClientes();
                }}
                placeholder="Ingrese al menos 3 caracteres..."
                disabled={buscando}
              />
              {buscando && <span className="search-spinner" />}
            </div>
          </div>
        </div>
        {clientesEncontrados.length > 0 && (
          <div className="clientes-resultados">
            <p className="resultados-label">{clientesEncontrados.length} cliente(s) encontrado(s):</p>
            <div className="clientes-grid">
              {clientesEncontrados.map((c) => (
                <div key={c._id} className="cliente-card">
                  <span className="cliente-nombre">{c.nombre}</span>
                  <span className="cliente-correo">{c.correo}</span>
                  <span className="cliente-id">ID: {c._id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DataTable
        data={usuarios}
        columns={columnas}
        renderRowActions={renderAcciones}
        emptyMessage="No hay usuarios registrados"
        loading={cargando}
      />

      <Modal
        isOpen={modalAsesorAbierto}
        onClose={() => setModalAsesorAbierto(false)}
        title="Nuevo Asesor"
        size="md"
      >
        <form onSubmit={handleCrearAsesor} className="asesor-form" noValidate>
          <div className="form-group">
            <label htmlFor="asesor-nombre">Nombre *</label>
            <input
              type="text"
              id="asesor-nombre"
              value={asesorForm.nombre}
              onChange={(e) => setAsesorForm((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Ana Gómez"
              required
              disabled={creandoAsesor}
            />
          </div>
          <div className="form-group">
            <label htmlFor="asesor-correo">Correo *</label>
            <input
              type="email"
              id="asesor-correo"
              value={asesorForm.correo}
              onChange={(e) => setAsesorForm((prev) => ({ ...prev, correo: e.target.value }))}
              placeholder="ana@servitec.pe"
              required
              disabled={creandoAsesor}
            />
          </div>
          <div className="form-group">
            <label htmlFor="asesor-password">Contraseña *</label>
            <input
              type="password"
              id="asesor-password"
              value={asesorForm.password}
              onChange={(e) => setAsesorForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
              disabled={creandoAsesor}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAsesorAbierto(false)} disabled={creandoAsesor}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={creandoAsesor}>
              {creandoAsesor ? "Creando..." : "Crear Asesor"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmarEliminar}
        onClose={() => setConfirmarEliminar(null)}
        onConfirm={confirmarEliminacion}
        title="Eliminar Usuario"
        message={`¿Eliminar a ${confirmarEliminar?.nombre} (${confirmarEliminar?.correo})?`}
        confirmText="Eliminar"
        variant="danger"
        loading={creandoAsesor}
      />
    </div>
  );
};

export default Usuarios;