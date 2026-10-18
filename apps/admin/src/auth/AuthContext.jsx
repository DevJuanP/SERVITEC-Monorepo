import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../servicios/auth";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Validar sesión al montar si hay token
  const validarSesion = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setCargando(false);
      return;
    }
    try {
      const userData = await authService.validateSession();
      // Solo admin y asesor pueden acceder al panel
      if (userData.rol === "cliente") {
        authService.logout();
        toast.error("Acceso denegado: solo administradores y asesores");
        setCargando(false);
        return;
      }
      setUsuario({
        _id: userData._id,
        nombre: userData.nombre,
        correo: userData.correo,
        rol: userData.rol,
      });
    } catch (error) {
      console.error("Error validando sesión:", error);
      authService.logout();
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    validarSesion();
  }, [validarSesion]);

  const login = async (correo, password) => {
    const data = await authService.login(correo, password);
    // El backend ya valida que no sea cliente, pero verificamos por seguridad
    if (data.usuario.rol === "cliente") {
      throw new Error("Acceso denegado: solo administradores y asesores");
    }
    authService.setSession({ token: data.token, usuario: data.usuario });
    setUsuario({
      _id: data.usuario._id,
      nombre: data.usuario.nombre,
      correo: data.usuario.correo,
      rol: data.usuario.rol,
    });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const value = {
    usuario,
    login,
    logout,
    cargando,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === "admin",
    isAsesor: usuario?.rol === "asesor",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};