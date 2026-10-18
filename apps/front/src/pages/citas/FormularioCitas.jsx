import React, { useState, useEffect, useCallback } from "react";
import "./citas.css";
import api from "../../servicios/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CalendarioSemanal from "./components/CalendarioSemanal";
import FranjaPicker from "./components/FranjaPicker";
import MisCitas from "./components/MisCitas";

const FormularioCitas = () => {
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [userData, setUserData] = useState(null);
  const [asesores, setAsesores] = useState([]);
  const [tiposCitas, setTiposCitas] = useState([]);

  const [cita, setCita] = useState({
    asesorId: "",
    tipoCitaId: "",
    fecha: "",
    franja: "",
    descripcion: "",
  });

  const [contacto, setContacto] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
  });

  // Cargar datos iniciales
  const cargarDatosIniciales = useCallback(async () => {
    try {
      await Promise.all([obtenerMiInfo(), obtenerAsesores(), obtenerTiposCitas()]);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
      toast.error("No se pudo cargar la información inicial");
    } finally {
      setCargandoInicial(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Precargar contacto del perfil cuando llegan los datos de usuario
  useEffect(() => {
    if (userData) {
      setContacto({
        nombre: userData.nombre?.split(" ")[0] || "",
        apellido: userData.nombre?.split(" ").slice(1).join(" ") || "",
        correo: userData.correo || "",
        telefono: "",
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contacto.")) {
      setContacto((prev) => ({ ...prev, [name.split(".")[1]]: value }));
    } else {
      setCita((prev) => ({ ...prev, [name]: value }));
    }
  };

  const obtenerMiInfo = async () => {
    try {
      const result = await api.get("/api/user/myInfo");
      setUserData(result.data.usuario);
      return result.data.usuario;
    } catch (error) {
      console.error("Error en obtenerMiInfo:", error);
      throw error;
    }
  };

  const obtenerAsesores = async () => {
    try {
      const result = await api.get("/api/user/asesores");
      setAsesores(result.data.asesores || []);
      return result.data.asesores;
    } catch (error) {
      console.error("Error en obtenerAsesores:", error);
      throw error;
    }
  };

  const obtenerTiposCitas = async () => {
    try {
      const result = await api.get("/api/cita/tipoCita");
      setTiposCitas(result.data.tiposCitas || []);
      return result.data.tiposCitas;
    } catch (error) {
      console.error("Error en obtenerTiposCitas:", error);
      throw error;
    }
  };

  // Conversión: fecha (YYYY-MM-DD) + hora (HH:mm) en hora de Lima (UTC-5) → ISO UTC
  const convertirALimaUTC = (fecha, hora) => {
    // fecha: "2026-07-06", hora: "09:00"
    // Interpretamos como hora de Lima (UTC-5 fijo)
    return new Date(`${fecha}T${hora}:00-05:00`).toISOString();
  };

  const agregarCita = async (payload) => {
    const result = await api.post("/api/cita/agregarCita", payload);
    return result.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones previas
    if (!cita.asesorId || !cita.tipoCitaId || !cita.fecha || !cita.franja) {
      toast.error("Complete todos los campos obligatorios");
      return;
    }
    if (!userData) {
      toast.error("Debe iniciar sesión para agendar una cita");
      return;
    }

    setEnviando(true);
    try {
      const fechaCitaISO = convertirALimaUTC(cita.fecha, cita.franja);

      const payload = {
        asesorId: Number(cita.asesorId),
        tipoCitaId: Number(cita.tipoCitaId),
        fechaCita: fechaCitaISO,
        descripcion: cita.descripcion || "",
        contacto: {
          nombre: contacto.nombre,
          apellido: contacto.apellido,
          correo: contacto.correo,
          telefono: contacto.telefono,
        },
      };

      const result = await agregarCita(payload);
      toast.success(result.mensaje || "Cita registrada con éxito");

      // Resetear formulario (mantener asesor y tipo para agilizar otra cita)
      setCita((prev) => ({ ...prev, fecha: "", franja: "", descripcion: "" }));

      // Refrescar mis citas
      await obtenerMiInfo();
    } catch (error) {
      console.error("Error al agregar la cita:", error);
      const status = error.response?.status;
      const msg = error.response?.data?.error;

      if (status === 400) {
        toast.error("Elige una franja válida");
      } else if (status === 409) {
        toast.error("Ese horario ya está ocupado");
        // Refrescar franjas automáticamente
        // El FranjaPicker se recargará por el cambio de fecha/asesor
      } else {
        toast.error(msg || "No se pudo registrar la cita");
      }
    } finally {
      setEnviando(false);
    }
  };

  const formatearFechaLima = (fechaUTC) => {
    if (!fechaUTC) return "";
    const d = new Date(fechaUTC);
    return d.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Lima",
    });
  };

  // Botón Confirmar deshabilitado hasta tener todo
  const formularioCompleto =
    userData &&
    cita.asesorId &&
    cita.tipoCitaId &&
    cita.fecha &&
    cita.franja;

  // Fecha mínima: hoy en hora de Lima
  const hoyLima = new Date().toLocaleString("en-CA", { timeZone: "America/Lima" }).slice(0, 10);

  if (cargandoInicial) {
    return (
      <div className="contenedorcc" style={{ display: "flex", gap: "2rem", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <h2 className="titulo-cc">Registro de Citas</h2>
          <div className="formulario-cc skeleton-form">
            <div className="skeleton-field" />
            <div className="skeleton-field" />
            <div className="skeleton-field" />
            <div className="skeleton-field" />
            <div className="skeleton-field" />
            <div className="skeleton-field" />
            <div className="skeleton-field" />
            <div className="skeleton-field" />
          </div>
        </div>
        <div className="reporte" style={{ flex: 3, minWidth: "500px" }}>
          <div className="skeleton-calendar" />
          <div className="skeleton-picker" />
        </div>
      </div>
    );
  }

  return (
    <div className="contenedorcc" style={{ display: "flex", gap: "2rem", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <div style={{ flex: 1, minWidth: "300px" }}>
        <h2 className="titulo-cc">Registro de Citas</h2>

        <form onSubmit={handleSubmit} className="formulario-cc">
          <div className="form-section">
            <h3>Datos del cliente</h3>
            <input
              type="text"
              name="contacto.nombre"
              placeholder="Nombre"
              value={contacto.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="contacto.apellido"
              placeholder="Apellido"
              value={contacto.apellido}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="contacto.correo"
              placeholder="Correo electrónico"
              value={contacto.correo}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="contacto.telefono"
              placeholder="Teléfono"
              value={contacto.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="form-section">
            <h3>Detalles de la cita</h3>
            <select name="asesorId" value={cita.asesorId} onChange={handleChange} required>
              <option value="">Seleccione asesor</option>
              {asesores.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.nombre}
                </option>
              ))}
            </select>

            <select name="tipoCitaId" value={cita.tipoCitaId} onChange={handleChange} required>
              <option value="">Seleccione tipo de cita</option>
              {tiposCitas.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.type}
                </option>
              ))}
            </select>

            <CalendarioSemanal
              asesorId={cita.asesorId ? Number(cita.asesorId) : null}
              onFechaSeleccionada={(fecha) => setCita((prev) => ({ ...prev, fecha, franja: "" }))}
              fechaSeleccionada={cita.fecha}
            />

            <FranjaPicker
              asesorId={cita.asesorId ? Number(cita.asesorId) : null}
              fecha={cita.fecha}
              onFranjaSeleccionada={(franja) => setCita((prev) => ({ ...prev, franja }))}
              franjaSeleccionada={cita.franja}
              deshabilitado={!cita.asesorId || !cita.fecha}
            />

            <textarea
              name="descripcion"
              placeholder="Descripción (opcional)"
              value={cita.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={!formularioCompleto || enviando}
            className="btn-confirmar"
          >
            {enviando ? "Registrando..." : "Confirmar cita"}
          </button>
        </form>
      </div>

      <div className="reporte" style={{ flex: 3, minWidth: "500px" }}>
        <MisCitas citas={userData?.citas} onCancelar={async () => {}} onRefrescar={obtenerMiInfo} />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
};

export default FormularioCitas;