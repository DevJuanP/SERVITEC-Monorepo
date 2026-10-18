import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { usuario, logout, isAdmin, isAsesor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>SERVITEC Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                <span className="nav-icon">📊</span> Dashboard
              </NavLink>
            </li>
            {isAdmin && (
              <>
                <li>
                  <NavLink to="/catalogo" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">📦</span> Catálogo
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/usuarios" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    <span className="nav-icon">👥</span> Usuarios
                  </NavLink>
                </li>
              </>
            )}
            {(isAdmin || isAsesor) && (
              <li>
                <NavLink to="/citas" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  <span className="nav-icon">📅</span> Citas
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-rol">{usuario?.rol === "admin" ? "Administrador" : "Asesor"}</span>
            <span className="user-name">{usuario?.nombre}</span>
          </div>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="page-title">Panel de Administración</h1>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;