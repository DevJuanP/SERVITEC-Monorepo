import React, { useState, useEffect, useCallback } from "react";
import { citasService } from "../../servicios/citas";
import { toast } from "react-toastify";
import FranjaPicker from "../../components/FranjaPicker";
import EstadoBadge from "../../components/EstadoBadge";
import "./NuevaCita.css";

const NuevaCita = ({ onSuccess, onCancel }) => {
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [tiposCita, setTiposCita] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [buscarCliente, setBuscarCliente] = useState("");
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  const [formData, setFormData] = useState({
    clienteId: "",
    asesorId: "",
    tipoCitaId: "",
    fecha: "",
    franja: "",
    descripcion: "",
    contacto: {
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
    },
  });

  const [enviando, setEnviando] = useState(false);
  const [errorCliente, setErrorCliente] = useState("");

  const cargarInicial = useCallback(async () => {
    setCargandoInicial(true);
    try {
      const [tiposRes, asesoresRes] = await Promise.all([
        citasService.obtenerTiposCita(),
        citasService.obtenerAsesores(),
      ]);
      setTiposCita(tiposRes || []);
      setAsesores(asesoresRes || []);
    } catch (err) {
      console.error("Error cargando datos iniciales:", err);
      toast.error("No se pudo cargar la información inicial");
    } finally {
      setCargandoInicial(false);
    }
  }, []);

  useEffect(() => {
    cargarInicial();
  }, [cargarInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contacto.")) {
      setFormData((prev) => ({
        ...prev,
        contacto: { ...prev.contacto, [name.split(".")[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Reset franja si cambia asesor o fecha
    if (name === "asesorId" || name === "fecha") {
      setFormData((prev) => ({ ...prev, franja: "" }));
    }
  };

  const handleBuscarCliente = async () => {
    if (!buscarCliente.trim() || buscarCliente.length < 3) {
      setClientes([]);
      return;
    }
    setBuscandoCliente(true);
    try {
      const data = await citasService.buscarClientes(buscarCliente.trim());
      setClientes(data || []);
      if (!data.length) setErrorCliente("No se encontraron clientes con ese correo");
      else setErrorCliente("");
    } catch (err) {
      console.error("Error buscando cliente:", err);
      setErrorCliente("Error en la búsqueda");
      setClientes([]);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handleClienteSelect = (cliente) => {
    setFormData((prev) => ({
      ...prev,
      clienteId: cliente._id,
      contacto: {
        ...prev.contacto,
        nombre: cliente.nombre?.split(" ")[0] || "",
        apellido: cliente.nombre?.split(" ").slice(1).join(" ") || "",
        correo: cliente.correo || "",
        telefono: "",
      },
    }));
    setClientes([]);
    setBuscarCliente("");
    setErrorCliente("");
  };

  const validar = () => {
    if (!formData.clienteId) {
      toast.error("Seleccione un cliente");
      return false;
    }
    if (!formData.asesorId) {
      toast.error("Seleccione un asesor");
      return false;
    }
    if (!formData.tipoCitaId) {
      toast.error("Seleccione un tipo de cita");
      return false;
    }
    if (!formData.fecha) {
      toast.error("Seleccione una fecha");
      return false;
    }
    if (!formData.franja) {
      toast.error("Seleccione una franja horaria");
      return false;
    }
    return true;
  };

  const convertirALimaUTC = (fecha, hora) => {
    // fecha: "2026-07-06", hora: "09:00"
    return new Date(`${fecha}T${hora}:00-05:00`).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    try {
      const fechaCitaISO = convertirALimaUTC(formData.fecha, formData.franja);

      const payload = {
        clienteId: Number(formData.clienteId),
        asesorId: Number(formData.asesorId),
        tipoCitaId: Number(formData.tipoCitaId),
        fechaCita: fechaCitaISO,
        descripcion: formData.descripcion || "",
        contacto: {
          nombre: formData.contacto.nombre,
          apellido: formData.contacto.apellido,
          correo: formData.contacto.correo,
          telefono: formData.contacto.telefono,
        },
      };

      const result = await citasService.crearCitaAdmin(payload);
      toast.success(result.mensaje || "Cita registrada con éxito");

      if (onSuccess) onSuccess();
      // Resetear formulario (mantener asesor y tipo)
      setFormData((prev) => ({
        ...prev,
        clienteId: "",
        fecha: "",
        franja: "",
        descripcion: "",
        contacto: { nombre: "", apellido: "", correo: "", telefono: "" },
      }));
      setBuscarCliente("");
      setClientes([]);
    } catch (err) {
      console.error("Error creando cita:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (status === 400) toast.error("Elige una franja válida");
      else if (status === 409) toast.error("Ese horario ya está ocupado");
      else toast.error(msg || "No se pudo registrar la cita");
    } finally {
      setEnviando(false);
    }
  };

  const hoyLima = new Date().toLocaleString("en-CA", { timeZone: "America/Lima" }).slice(0, 10);

  if (cargandoInicial) {
    return (
      <div className="nueva-cita-loading">
        <div className="skeleton-form">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-field" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="nueva-cita">
      <div className="nueva-cita-header">
        <h2>Nueva Cita (Administrador)</h2>
        {onCancel && (
          <button type="button" className="btn-volver" onClick={onCancel}>
            ← Volver a Citas
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="nueva-cita-form" noValidate>
        <div className="form-section">
          <h3>Datos del Cliente</h3>
          <div className="cliente-search">
            <div className="form-group">
              <label htmlFor="buscar-cliente">Buscar cliente por correo</label>
              <div className="search-input-wrapper">
                <input
                  type="email"
                  id="buscar-cliente"
                  value={buscarCliente}
                  onChange={(e) => {
                    setBuscarCliente(e.target.value);
                    if (e.target.value.length >= 3) handleBuscarCliente();
                  }}
                  placeholder="Ingrese al menos 3 caracteres del correo..."
                  disabled={buscandoCliente}
                />
                {buscandoCliente && <span className="search-spinner" />}
              </div>
              {errorCliente && <span className="error-text">{errorCliente}</span>}
            </div>
            {clientes.length > 0 && (
              <div className="clientes-resultados">
                {clientes.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    className="cliente-item"
                    onClick={() => handleClienteSelect(c)}
                  >
                    <span className="cliente-nombre">{c.nombre}</span>
                    <span className="cliente-correo">{c.correo}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {formData.clienteId && (
            <div className="cliente-seleccionado">
              <span className="label">Cliente seleccionado:</span>
              <span className="valor">
                {clientes.find((c) => c._id === formData.clienteId)?.nombre || "Cliente"}
                ({clientes.find((c) => c._id === formData.clienteId)?.correo || ""})
              </span>
              <button type="button" className="btn-cambiar" onClick={() => setFormData((prev) => ({ ...prev, clienteId: "" }))}>
                Cambiar
              </button>
            </div>
          )}

          <div className="contacto-grid">
            <div className="form-group">
              <label htmlFor="contacto-nombre">Nombre *</label>
              <input
                type="text"
                id="contacto-nombre"
                name="contacto.nombre"
                value={formData.contacto.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contacto-apellido">Apellido *</label>
              <input
                type="text"
                id="contacto-apellido"
                name="contacto.apellido"
                value={formData.contacto.apellido}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contacto-correo">Correo *</label>
              <input
                type="email"
                id="contacto-correo"
                name="contacto.correo"
                value={formData.contacto.correo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contacto-telefono">Teléfono</label>
              <input
                type="tel"
                id="contacto-telefono"
                name="contacto.telefono"
                value={formData.contacto.telefono}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Detalles de la Cita</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="asesorId">Asesor *</label>
              <select
                id="asesorId"
                name="asesorId"
                value={formData.asesorId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione asesor</option>
                {asesores.map((a) => (
                  <option key={a._id} value={a._id}>{a.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipoCitaId">Tipo de cita *</label>
              <select
                id="tipoCitaId"
                name="tipoCitaId"
                value={formData.tipoCitaId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo</option>
                {tiposCita.map((t) => (
                  <option key={t._id} value={t._id}>{t.type}</option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="fecha">Fecha *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={hoyLima}
                required
                disabled={!formData.asesorId}
              />
              {!formData.asesorId && <span className="helper-text">Seleccione un asesor primero</span>}
            </div>

            <div className="form-group full-width">
              <FranjaPicker
                asesorId={formData.asesorId ? Number(formData.asesorId) : null}
                fecha={formData.fecha}
                onFranjaSeleccionada={(franja) => setFormData((prev) => ({ ...prev, franja }))}
                franjaSeleccionada={formData.franja}
                deshabilitado={!formData.asesorId || !formData.fecha}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="descripcion">Descripción (opcional)</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Motivo de la cita, notas adicionales..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Registrando..." : "Registrar Cita"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevaCita;