import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../servicios/api";
import "./Notificaciones.css";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const result = await api.get("/api/notificaciones");
      const lista = result.data.notificaciones || [];
      setNotificaciones(lista);
      setNoLeidas(lista.filter((n) => !n.leida).length);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setCargando(false);
    }
  };

  const marcarLeida = async (notificacionId) => {
    try {
      await api.post("/api/notificaciones/leer", { notificacionId });
      setNotificaciones((prev) =>
        prev.map((n) => (n._id === notificacionId ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marcando notificación:", err);
      toast.error("No se pudo actualizar la notificación");
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.post("/api/notificaciones/leer", { todas: true });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch (err) {
      console.error("Error marcando todas:", err);
      toast.error("No se pudo actualizar");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Ahora";
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHoras < 24) return `hace ${diffHoras} h`;
    if (diffDias < 7) return `hace ${diffDias} d`;
    return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setAbierto(!abierto);
    if (!abierto) {
      cargarNotificaciones();
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setAbierto(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [abierto]);

  return (
    <div className="notificaciones-wrapper">
      <button
        type="button"
        className={`notificaciones-btn ${noLeidas > 0 ? "tiene-no-leidas" : ""}`}
        onClick={toggleDropdown}
        aria-label={noLeidas > 0 ? `${noLeidas} notificaciones sin leer` : "Notificaciones"}
        aria-expanded={abierto}
        aria-haspopup="true"
      >
        <span className="notificaciones-icon">🔔</span>
        {noLeidas > 0 && (
          <span className="notificaciones-badge" aria-live="polite">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="notificaciones-dropdown" role="menu">
          <div className="notificaciones-dropdown-header">
            <h4 className="notificaciones-dropdown-title">Notificaciones</h4>
            {noLeidas > 0 && (
              <button
                type="button"
                className="notificaciones-marcar-todas"
                onClick={(e) => { e.stopPropagation(); marcarTodasLeidas(); }}
              >
                Marcar todas leídas
              </button>
            )}
          </div>
          <div className="notificaciones-lista">
            {cargando ? (
              <div className="notificaciones-loading">
                <div className="skeleton-notificacion" />
                <div className="skeleton-notificacion" />
                <div className="skeleton-notificacion" />
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="notificaciones-vacio">No hay notificaciones</div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n._id}
                  className={`notificacion-item ${!n.leida ? "no-leida" : ""}`}
                  role="menuitem"
                >
                  <div className="notificacion-contenido">
                    <span className="notificacion-tipo">{n.tipo}</span>
                    <span className="notificacion-mensaje">{n.mensaje}</span>
                    <span className="notificacion-fecha">{formatearFecha(n.fecha)}</span>
                  </div>
                  {!n.leida && (
                    <button
                      type="button"
                      className="notificacion-btn-leer"
                      onClick={(e) => { e.stopPropagation(); marcarLeida(n._id); }}
                      aria-label="Marcar como leída"
                    >
                      ✓
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;