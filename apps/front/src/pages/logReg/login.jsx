import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../servicios/api";
import "./loginRegister.css";

function Login() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState({
    correo: "",
    password: "",
  });

  const handleChange = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const iniciarSesion = async (corr, pass) => {
    const result = await api.post("/api/auth/login", {
      correo: corr,
      password: pass,
    });

    return result.data;
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();
    try {
      const responseApi = await iniciarSesion(datos.correo, datos.password);

      if (responseApi.token) {
        localStorage.setItem("token", responseApi.token);
      }

      if (responseApi.usuario?.nombre) {
        localStorage.setItem("nombreUsuario", responseApi.usuario.nombre);
      }

      if (responseApi.usuario?.rol) {
        localStorage.setItem("rolUsuario", responseApi.usuario.rol);
      }

      if (responseApi.token || responseApi.mensaje === "Login exitoso" ) {
        alert(responseApi.mensaje || "Login exitoso");
        setDatos({
          correo: "",
          password: "",
        });
        navigate("/");
      } else {
        alert(responseApi.error || "No se pudo iniciar sesión");
      }
    } catch (error) {
      console.log({
        error: error.message,
      });
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Iniciar Sesión</h2>

        <form className="auth-form" onSubmit={handleLoginClick}>
          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={datos.correo}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={datos.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="auth-btn">
            Ingresar
          </button>

          <button
            type="button"
            className="auth-btn auth-btn-secondary"
            onClick={handleRegister}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>

        <div className="video-container">
          <iframe width="500" height="315" src="https://www.youtube.com/embed/Jqs5EaAaueA?si=krxdJZYfXsB3ykdQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
      </div>
    </div>
  );
}

export default Login;
