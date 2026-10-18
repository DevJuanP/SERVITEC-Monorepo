import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

// Ruta que exige uno o más roles específicos.
// Si el usuario no tiene el rol requerido, muestra "Sin acceso" y redirige.
const RoleRoute = ({ children, roles = [] }) => {
  const { usuario, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const tieneRol = roles.includes(usuario?.rol);

  if (!tieneRol) {
    // Mostramos un mensaje breve y redirigimos al dashboard
    toast.error("No tiene permisos para acceder a esta sección");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;