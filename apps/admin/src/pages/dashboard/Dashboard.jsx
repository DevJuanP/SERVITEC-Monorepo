import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import api from "../../servicios/api";
import { toast } from "react-toastify";
import "./Dashboard.css";

const Dashboard = () => {
  const { usuario, isAdmin, isAsesor } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [error, setError] = useState(null);

  const cargarDashboard = async () => {
    setCargando(true);
    setError(null);
    try {
      if (isAdmin) {
        // Admin: conteo de productos por categoría + alertas stock agotado
        const [productosRes, categoriasRes] = await Promise.all([
          api.get("/api/productos/admin"),
          api.get("/api/categorias"),
        ]);
        const productos = productosRes.data || [];
        const categorias = categoriasRes.data?.categorias || [];

        // Contar por categoría
        const conteoPorCategoria = {};
        let agotados = 0;

        productos.forEach((p) => {
          const catKey = p.categoria?.name || "sin categoria";
          conteoPorCategoria[catKey] = (conteoPorCategoria[catKey] || 0) + 1;
          if (p.stock === 0) agotados++;
        });

        // Mapear a estructura con nombres bonitos
        const categoriasConConteo = categorias.map((cat) => ({
          nombre: cat.name,
          subcategorias: cat.Subcategoria || [],
          total: conteoPorCategoria[cat.name] || 0,
        }));

        setStats({
          totalProductos: productos.length,
          categorias: categoriasConConteo,
          agotados,
        });
      }

      // Agenda del usuario (admin ve todas, asesor ve las suyas)
      const params = isAsesor && !isAdmin ? { asesorId: usuario._id } : {};
      const citasRes = await api.get("/api/cita", { params });
      const citas = citasRes.data?.citas || [];

      // Resumen por estado
      const resumen = {
        Pendiente: 0,
        Aprobada: 0,
        Realizada: 0,
        Cancelada: 0,
      };
      citas.forEach((c) => {
        if (resumen[c.estado] !== undefined) resumen[c.estado]++;
      });

      // Próximas 5 citas
      const proximas = citas
        .filter((c) => c.estado === "Pendiente" || c.estado === "Aprobada")
        .slice(0, 5);

      setAgenda({ resumen, proximas });
    } catch (err) {
      console.error("Error cargando dashboard:", err);
      setError("No se pudo cargar el dashboard");
      toast.error("Error cargando el dashboard");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, [usuario, isAdmin, isAsesor]);

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

  if (cargando) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton-stats">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
        <div className="skeleton-agenda" />
      </div>
    );
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Bienvenido, {usuario?.nombre}</h2>
        <span className="rol-badge">{usuario?.rol === "admin" ? "Administrador" : "Asesor"}</span>
      </div>

      {isAdmin && stats && (
        <section className="dashboard-section">
          <h3>Catálogo e Inventario</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalProductos}</span>
              <span className="stat-label">Total productos</span>
            </div>
            <div className="stat-card warning">
              <span className="stat-value">{stats.agotados}</span>
              <span className="stat-label">Agotados (stock 0)</span>
            </div>
            {stats.categorias.map((cat) => (
              <div key={cat.nombre} className="stat-card">
                <span className="stat-value">{cat.total}</span>
                <span className="stat-label">{cat.nombre}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <h3>{isAdmin ? "Resumen de Citas" : "Mi Agenda"}</h3>
        {agenda && (
          <>
            <div className="resumen-estados">
              <div className="estado-card pendiente">
                <span className="estado-count">{agenda.resumen.Pendiente}</span>
                <span className="estado-label">Pendientes</span>
              </div>
              <div className="estado-card aprobada">
                <span className="estado-count">{agenda.resumen.Aprobada}</span>
                <span className="estado-label">Aprobadas</span>
              </div>
              <div className="estado-card realizada">
                <span className="estado-count">{agenda.resumen.Realizada}</span>
                <span className="estado-label">Realizadas</span>
              </div>
              <div className="estado-card cancelada">
                <span className="estado-count">{agenda.resumen.Cancelada}</span>
                <span className="estado-label">Canceladas</span>
              </div>
            </div>

            <div className="proximas-citas">
              <h4>Próximas citas</h4>
              {agenda.proximas.length === 0 ? (
                <p className="sin-citas">No hay citas próximas</p>
              ) : (
                <table className="citas-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Asesor</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agenda.proximas.map((c) => (
                      <tr key={c._id}>
                        <td>{formatearFecha(c.fechaCita)}</td>
                        <td>{c.cliente?.nombre || "—"}</td>
                        <td>{c.asesor?.nombre || "—"}</td>
                        <td>{c.tipoCita?.type || "—"}</td>
                        <td>
                          <span className={`estado-badge ${c.estado.toLowerCase()}`}>{c.estado}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Dashboard;