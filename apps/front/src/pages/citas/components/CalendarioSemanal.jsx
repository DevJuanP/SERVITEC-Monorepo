import React, { useState, useEffect } from "react";
import api from "../../../servicios/api";
import "./CalendarioSemanal.css";

const DIAS_LABORABLES = 5; // Lunes a Viernes
const FRANJAS_HORA = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

const CalendarioSemanal = ({ asesorId, onFechaSeleccionada, fechaSeleccionada }) => {
  const [semana, setSemana] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!asesorId) {
      setSemana([]);
      return;
    }
    cargarSemana();
  }, [asesorId]);

  const cargarSemana = async () => {
    setCargando(true);
    setError(null);
    try {
      const hoy = new Date();
      const desde = hoy.toISOString().slice(0, 10);
      const result = await api.get(`/api/cita/disponibilidadSemana`, {
        params: { asesorId, desde },
      });
      setSemana(result.data.dias || []);
    } catch (err) {
      console.error("Error cargando semana:", err);
      setError("No se pudo cargar la disponibilidad semanal");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    const d = new Date(fechaStr + "T00:00:00");
    return d.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit", month: "2-digit" });
  };

  const obtenerCuposLibres = (franjas) => {
    return franjas.filter((f) => f.disponible).length;
  };

  if (cargando) {
    return (
      <div className="calendario-semanal-loading">
        <div className="skeleton-grid">
          {[...Array(DIAS_LABORABLES)].map((_, i) => (
            <div key={i} className="skeleton-day">
              <div className="skeleton-day-header" />
              {[...Array(7)].map((_, j) => (
                <div key={j} className="skeleton-slot" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="calendario-semanal-error">{error}</div>;
  }

  if (!semana.length) {
    return <div className="calendario-semanal-vacio">Seleccione un asesor para ver disponibilidad</div>;
  }

  return (
    <div className="calendario-semanal">
      <div className="calendario-semanal-header">
        <span className="calendario-semanal-title">Disponibilidad semanal</span>
        <span className="calendario-semanal-subtitle">Cupos libres por día</span>
      </div>
      <div className="calendario-semanal-grid">
        {semana.map((dia) => {
          const cupos = obtenerCuposLibres(dia.franjas);
          const esHoy = dia.fecha === new Date().toISOString().slice(0, 10);
          const esSeleccionada = dia.fecha === fechaSeleccionada;
          const noLaborable = dia.franjas.length === 0;

          return (
            <div
              key={dia.fecha}
              className={`calendario-semanal-dia ${esHoy ? "hoy" : ""} ${esSeleccionada ? "seleccionado" : ""} ${noLaborable ? "no-laborable" : ""}`}
              onClick={() => !noLaborable && onFechaSeleccionada(dia.fecha)}
              role="button"
              tabIndex={noLaborable ? -1 : 0}
              onKeyDown={(e) => {
                if (!noLaborable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onFechaSeleccionada(dia.fecha);
                }
              }}
            >
              <div className="calendario-semanal-dia-header">
                <span className="calendario-semanal-dia-fecha">{formatearFecha(dia.fecha)}</span>
                {esHoy && <span className="calendario-semanal-badge">Hoy</span>}
              </div>
              <div className="calendario-semanal-dia-cupos">
                {noLaborable ? (
                  <span className="calendario-semanal-no-laborable">No hay atención</span>
                ) : (
                  <>
                    <span className="calendario-semanal-cupos">{cupos} cupos</span>
                    <div className="calendario-semanal-franjas-mini">
                      {FRANJAS_HORA.map((hora) => {
                        const franja = dia.franjas.find((f) => f.hora === hora);
                        return (
                          <span
                            key={hora}
                            className={`calendario-semanal-franja-mini ${franja?.disponible ? "libre" : "ocupada"}`}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarioSemanal;