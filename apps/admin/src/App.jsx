import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"
import ProtectedRoute from "./auth/ProtectedRoute"
import RoleRoute from "./auth/RoleRoute"
import AdminLayout from "./layouts/AdminLayout"
import Login from "./pages/login/Login"
import Dashboard from "./pages/dashboard/Dashboard"
import Catalogo from "./pages/catalogo/Catalogo"
import Citas from "./pages/citas/Citas"
import NuevaCita from "./pages/citas/NuevaCita"
import Usuarios from "./pages/usuarios/Usuarios"
import "./App.css"

// Componente para rutas públicas (login) que redirige si ya hay sesión
const PublicRoute = ({ children }) => {
  const { isAuthenticated, cargando } = useAuth()

  if (cargando) {
    return null // O un spinner
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Ruta pública: login */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Rutas protegidas con layout de admin */}
      <Route element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={
          <RoleRoute roles={["admin", "asesor"]}>
            <Dashboard />
          </RoleRoute>
        } />
        <Route path="/catalogo" element={
          <RoleRoute roles={["admin"]}>
            <Catalogo />
          </RoleRoute>
        } />
        <Route path="/citas" element={
          <RoleRoute roles={["admin", "asesor"]}>
            <Citas />
          </RoleRoute>
        } />
        <Route path="/citas/nueva" element={
          <RoleRoute roles={["admin"]}>
            <NuevaCita />
          </RoleRoute>
        } />
        <Route path="/usuarios" element={
          <RoleRoute roles={["admin"]}>
            <Usuarios />
          </RoleRoute>
        } />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App