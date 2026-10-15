import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../servicios/api";
import "./loginRegister.css";

function Register() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({
    nombre: "",
    correo: "",
    password: "",
  });

  const handleChange = (e) => {
    setUsuario({
      ...usuario,
      [e.target.name]: e.target.value,
    });
  };

  const registrarUsuario = async (nom, corr, pass) => {
    // El backend fuerza rol "cliente" en el registro público: el rol no se envía.
    const result = await api.post("/api/auth/register", {
      nombre: nom,
      correo: corr,
      password: pass,
    });

    return result.data;
  };

  const handleRegisterClick = async (e) => {
    e.preventDefault();

    try {
      const responseApi = await registrarUsuario(
        usuario.nombre,
        usuario.correo,
        usuario.password
      );

      if (responseApi.mensaje === "Usuario registrado con éxito") {
        alert("AHORA PUEDES INICIAR SESION :)");
        setUsuario({
          nombre: "",
          correo: "",
          password: "",
        });
        navigate("/login");
      } else {
        alert(responseApi.mensaje || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.log({
        error: error.message,
      });
      alert("Error al registrar usuario");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Registro de Usuario</h2>

        <form className="auth-form" onSubmit={handleRegisterClick}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={usuario.nombre}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={usuario.correo}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={usuario.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
