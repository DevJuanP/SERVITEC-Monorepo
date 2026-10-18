import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../servicios/api";
import "./MisCitas.css";

const MisCitas = ({ citas, onCancelar, onRefrescar }) => {
  const [cancelando, setCancelando] = useState(null);

  const handleCancelar = async (citaId) => {
    setCancelando(citaId);
    try {
      await api.post("/api/cita/cancelarCita", { citaId });
      toast.success("Cita cancelada con éxito");
      onRefrescar();
    } catch (err) {
      console.error("Error cancelando cita:", err);
      const msg = err.response?.data?.error || "No se pudo cancelar la cita";
      toast.error(msg);
    } finally {
      setCancelando(null);
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

  const estadoClass = (estado) => {
    switch (estado) {
      case "Pendiente": return "estado-pendiente";
      case "Aprobada": return "estado-aprobada";
      case "Realizada": return "estado-realizada";
      case "Cancelada": return "estado-cancelada";
      default: return "";
    }
  };

  const puedeCancelar = (estado) => {
    return estado === "Pendiente" || estado === "Aprobada";
  };

  if (!citas || !citas.length) {
    return (
      <div className="mis-citas-vacio">
        <span className="icon">📋</span>
        <p>No tienes citas registradas</p>
      </div>
    );
  }

  return (
    <div className="mis-citas">
      <div className="mis-citas-header">
        <h3 className="mis-citas-title">Mis citas ({citas.length})</h3>
      </div>
      <div className="mis-citas-tabla-wrapper">
        <table className="mis-citas-tabla">
          <thead>
            <tr>
              <th>Asesor</th>
              <th>Tipo de cita</th>
              <th>Fecha de atención</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c._id}>
                <td>{c.asesor?.nombre || "—"}</td>
                <td>{c.tipoCita?.type || "—"}</td>
                <td>{formatearFechaLima(c.fechaCita)}</td>
                <td>
                  <span className={`mis-citas-estado ${estadoClass(c.estado)}`}>
                    {c.estado}
                  </span>
                </td>
                <td className="mis-citas-descripcion">{c.descripcion || "—"}</td>
                <td>
                  {puedeCancelar(c.estado) && (
                    <button
                      type="button"
                      className="mis-citas-btn-cancelar"
                      onClick={() => handleCancelar(c._id)}
                      disabled={cancelando === c._id}
                      aria-label={`Cancelar cita ${c._id}`}
                    >
                      {cancelando === c._id ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MisCitas;