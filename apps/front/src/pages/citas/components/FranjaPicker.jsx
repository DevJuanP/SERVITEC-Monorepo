import React, { useState, useEffect } from "react";
import api from "../../../servicios/api";
import "./FranjaPicker.css";

const FranjaPicker = ({ asesorId, fecha, onFranjaSeleccionada, franjaSeleccionada, deshabilitado }) => {
  const [franjas, setFranjas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [noLaborable, setNoLaborable] = useState(false);

  useEffect(() => {
    if (!asesorId || !fecha || deshabilitado) {
      setFranjas([]);
      setNoLaborable(false);
      return;
    }
    cargarFranjas();
  }, [asesorId, fecha, deshabilitado]);

  const cargarFranjas = async () => {
    setCargando(true);
    setError(null);
    setNoLaborable(false);
    try {
      const result = await api.get(`/api/cita/disponibilidad`, {
        params: { asesorId, fecha },
      });
      setFranjas(result.data.franjas || []);
      if (!result.data.franjas || result.data.franjas.length === 0) {
        setNoLaborable(true);
      }
    } catch (err) {
      console.error("Error cargando franjas:", err);
      setError("No se pudo cargar la disponibilidad");
      setFranjas([]);
    } finally {
      setCargando(false);
    }
  };

  const formatearHora = (hora) => {
    return hora.slice(0, 5);
  };

  if (cargando) {
    return (
      <div className="franja-picker-loading">
        <div className="skeleton-franjas">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="skeleton-franja" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="franja-picker-error">{error}</div>;
  }

  if (noLaborable) {
    return (
      <div className="franja-picker-no-laborable">
        <span className="icon">📅</span>
        <span>No hay atención ese día</span>
      </div>
    );
  }

  if (!franjas.length) {
    return (
      <div className="franja-picker-vacio">
        Seleccione un asesor y una fecha para ver franjas disponibles
      </div>
    );
  }

  return (
    <div className="franja-picker">
      <div className="franja-picker-header">
        <span className="franja-picker-title">Franjas disponibles</span>
        <span className="franja-picker-fecha">{new Date(fecha + "T00:00:00").toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" })}</span>
      </div>
      <div className="franja-picker-grid">
        {franjas.map((franja) => (
          <button
            key={franja.hora}
            type="button"
            className={`franja-picker-btn ${franja.disponible ? "disponible" : "ocupada"} ${franjaSeleccionada === franja.hora ? "seleccionada" : ""}`}
            onClick={() => franja.disponible && onFranjaSeleccionada(franja.hora)}
            disabled={!franja.disponible}
            aria-pressed={franjaSeleccionada === franja.hora}
            aria-label={franja.disponible ? `Franja ${formatearHora(franja.hora)} disponible` : `Franja ${formatearHora(franja.hora)} ocupada`}
          >
            <span className="franja-picker-hora">{formatearHora(franja.hora)}</span>
            <span className={`franja-picker-estado ${franja.disponible ? "libre" : "ocupada"}`}>
              {franja.disponible ? "Libre" : "Ocupada"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FranjaPicker;