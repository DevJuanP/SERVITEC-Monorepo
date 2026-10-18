import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { citasService } from "../../servicios/citas";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import EstadoBadge from "../../components/EstadoBadge";
import { toast } from "react-toastify";
import "./Citas.css";

const Citas = () => {
  const { usuario, isAdmin } = useAuth();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({ asesorId: "", clienteId: "", estado: "" });
  const [asesores, setAsesores] = useState([]);
  const [modalDetalle, setModalDetalle] = useState(null);
  const [confirmarAccion, setConfirmarAccion] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [procesando, setProcesando] = useState(false);

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    try {
      const params = {};
      if (filtros.asesorId) params.asesorId = filtros.asesorId;
      if (filtros.clienteId) params.clienteId = filtros.clienteId;
      if (filtros.estado) params.estado = filtros.estado;
      // Si es asesor, forzar su ID
      if (!isAdmin) params.asesorId = usuario._id;

      const data = await citasService.listar(params);
      setCitas(data || []);
    } catch (err) {
      console.error("Error cargando citas:", err);
      toast.error("No se pudo cargar la agenda");
    } finally {
      setCargando(false);
    }
  }, [filtros, isAdmin, usuario._id]);

  const cargarAsesores = async () => {
    try {
      const data = await citasService.obtenerAsesores();
      setAsesores(data || []);
    } catch (err) {
      console.error("Error cargando asesores:", err);
    }
  };

  useEffect(() => {
    cargarCitas();
    cargarAsesores();
  }, [cargarCitas, cargarAsesores]);

  const formatearFecha = (fechaUTC) => {
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

  const puedeAprobar = (cita) => cita.estado === "Pendiente" && (isAdmin || cita.asesor?._id === usuario._id);
  const puedeCompletar = (cita) => cita.estado === "Aprobada" && (isAdmin || cita.asesor?._id === usuario._id);
  const puedeCancelar = (cita) => (cita.estado === "Pendiente" || cita.estado === "Aprobada") && (isAdmin || cita.asesor?._id === usuario._id);

  const handleAccion = async (tipo, cita) => {
    if (tipo === "completar") {
      setModalDetalle({ tipo, cita });
      setObservacion("");
      return;
    }

    setConfirmarAccion({ tipo, cita });
  };

  const ejecutarAccion = async () => {
    if (!confirmarAccion && !modalDetalle) return;
    setProcesando(true);
    try {
      const { tipo, cita } = confirmarAccion || modalDetalle;
      let msg = "";

      switch (tipo) {
        case "aprobar":
          await citasService.aprobar(cita._id);
          msg = "Cita aprobada";
          break;
        case "cancelar":
          await citasService.cancelar(cita._id);
          msg = "Cita cancelada";
          break;
        case "completar":
          if (!observacion.trim()) {
            toast.error("La observación es obligatoria para concluir la cita");
            setProcesando(false);
            return;
          }
          await citasService.completar(cita._id, observacion.trim());
          msg = "Cita concluida";
          break;
      }

      toast.success(msg);
      setConfirmarAccion(null);
      setModalDetalle(null);
      setObservacion("");
      cargarCitas();
    } catch (err) {
      console.error(`Error en acción ${confirmarAccion?.tipo || modalDetalle?.tipo}:`, err);
      const msg = err.response?.data?.error || "No se pudo realizar la acción";
      toast.error(msg);
    } finally {
      setProcesando(false);
    }
  };

  const columnas = [
    { key: "fechaCita", header: "Fecha", width: "160px", render: (c) => formatearFecha(c.fechaCita) },
    { key: "cliente", header: "Cliente", render: (c) => c.cliente?.nombre || "—" },
    { key: "asesor", header: "Asesor", render: (c) => c.asesor?.nombre || "—" },
    { key: "tipoCita", header: "Tipo", width: "120px", render: (c) => c.tipoCita?.type || "—" },
    { key: "estado", header: "Estado", width: "120px", render: (c) => <EstadoBadge estado={c.estado} /> },
    { key: "descripcion", header: "Descripción", render: (c) => c.descripcion || "—" },
    { key: "actions", header: "Acciones", width: "200px" },
  ];

  const renderAcciones = (cita) => {
    const acciones = [];
    if (puedeAprobar(cita)) {
      acciones.push(
        <button
          key="aprobar"
          type="button"
          className="btn-action btn-aprobar"
          onClick={() => handleAccion("aprobar", cita)}
          disabled={procesando}
          title="Aprobar"
        >
          ✅
        </button>
      );
    }
    if (puedeCompletar(cita)) {
      acciones.push(
        <button
          key="completar"
          type="button"
          className="btn-action btn-completar"
          onClick={() => handleAccion("completar", cita)}
          disabled={procesando}
          title="Concluir"
        >
          🏁
        </button>
      );
    }
    if (puedeCancelar(cita)) {
      acciones.push(
        <button
          key="cancelar"
          type="button"
          className="btn-action btn-cancelar"
          onClick={() => handleAccion("cancelar", cita)}
          disabled={procesando}
          title="Cancelar / Rechazar"
        >
          ❌
        </button>
      );
    }
    return <div className="acciones-cell">{acciones}</div>;
  };

  const asesoresFiltrados = isAdmin ? asesores : asesores.filter((a) => a._id === usuario._id);

  return (
    <div className="citas">
      <div className="citas-header">
        <h2>Agenda de Citas</h2>
        {isAdmin && (
          <a href="/citas/nueva" className="btn-nueva-cita">
            + Nueva Cita
          </a>
        )}
      </div>

      <div className="filtros">
        <div className="filtro-grupo">
          <label htmlFor="filtro-asesor">Asesor</label>
          <select
            id="filtro-asesor"
            value={filtros.asesorId}
            onChange={(e) => setFiltros((prev) => ({ ...prev, asesorId: e.target.value }))}
            disabled={!isAdmin || cargando}
          >
            <option value="">Todos</option>
            {asesoresFiltrados.map((a) => (
              <option key={a._id} value={a._id}>{a.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label htmlFor="filtro-estado">Estado</label>
          <select
            id="filtro-estado"
            value={filtros.estado}
            onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value }))}
            disabled={cargando}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Realizada">Realizada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        <button type="button" className="btn-limpiar" onClick={() => setFiltros({ asesorId: "", clienteId: "", estado: "" })} disabled={cargando}>
          Limpiar
        </button>
      </div>

      <DataTable
        data={citas}
        columns={columnas}
        renderRowActions={renderAcciones}
        emptyMessage="No hay citas con los filtros actuales"
        loading={cargando}
      />

      <ConfirmDialog
        isOpen={!!confirmarAccion}
        onClose={() => setConfirmarAccion(null)}
        onConfirm={ejecutarAccion}
        title={
          confirmarAccion?.tipo === "aprobar"
            ? "Aprobar Cita"
            : confirmarAccion?.tipo === "cancelar"
            ? "Cancelar / Rechazar Cita"
            : "Confirmar"
        }
        message={
          confirmarAccion?.tipo === "aprobar"
            ? `¿Aprobar la cita de ${confirmarAccion.cita.cliente?.nombre} para el ${formatearFecha(confirmarAccion.cita.fechaCita)}?`
            : `¿Cancelar/rechazar la cita de ${confirmarAccion?.cita?.cliente?.nombre}?`
        }
        confirmText={
          confirmarAccion?.tipo === "aprobar"
            ? "Aprobar"
            : "Cancelar / Rechazar"
        }
        variant={confirmarAccion?.tipo === "aprobar" ? "primary" : "danger"}
        loading={procesando}
      />

      <Modal
        isOpen={!!modalDetalle}
        onClose={() => { setModalDetalle(null); setObservacion(""); }}
        title="Concluir Cita"
        size="md"
      >
        <div className="completar-form">
          <p>Cita de <strong>{modalDetalle?.cita?.cliente?.nombre}</strong> para el <strong>{formatearFecha(modalDetalle?.cita?.fechaCita)}</strong></p>
          <div className="form-group">
            <label htmlFor="observacion">Observación *</label>
            <textarea
              id="observacion"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Describa el trabajo realizado, diagnóstico, etc."
              rows={4}
              required
              disabled={procesando}
            />
            <span className="helper-text">La observación es obligatoria para concluir la cita</span>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setModalDetalle(null); setObservacion(""); }} disabled={procesando}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={ejecutarAccion} disabled={procesando}>
              {procesando ? "Concluyendo..." : "Concluir Cita"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Citas;