import React from 'react'
import './header.css'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Notificaciones from './Notificaciones'

const Header = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const nombreUsuario = localStorage.getItem('nombreUsuario') || localStorage.getItem('authUserName')
  const rolUsuario = localStorage.getItem('rolUsuario')
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nombreUsuario')
    localStorage.removeItem('authUserName')
    localStorage.removeItem('rolUsuario')
    navigate('/login')
  }

  return (
    <>
       <header>
      <div className="header-top">
        <div className="img-container">
          <Link to="/">
            <img src="https://raw.githubusercontent.com/DevJuanP/proyecto_CIBERTEC/refs/heads/main/img/logo.webp" alt="logo" />
          </Link>
        </div>

        <div className="Login-container">
          {token ? (
            <div className="login-link login-user">
              <span className="login-icon">👤</span>
              <div className="login-user-info">
                <span>{nombreUsuario || 'Usuario'}</span>
                <button type="button" className="logout-btn" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              <span className="login-icon">👤</span>
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>

      <nav className="header-bottom">
        <div className="menu-container">
          <ul className="menu">
            <li className="main-items">
              CATÁLOGO
              <ul className="submenu">
                <li className="Laptops">Laptops
                  <ul className="Laptops-submenu sub-submenu">
                    <li className="third-item">
                      <NavLink to="/productos/laptops_gaming">Laptops Gamer</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/laptops_otras">Otros</NavLink>
                    </li>
                  </ul>
                </li>

                <li className="armadas">PC Armadas
                  <ul className="armadas-submenu sub-submenu">
                    <li className="third-item">
                      <NavLink to="/productos/pc_combos">Combos Gamer</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/pc_profesional">PC Profesional</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/pc_oficinas">PC Oficina</NavLink>
                    </li>
                  </ul>
                </li>

                <li className="componentes">Componentes
                  <ul className="componentes-submenu sub-submenu">
                    <li className="third-item">
                      <NavLink to="/productos/componentes_monitores">Monitores</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/componentes_cases">Cases</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/componentes_mb">Placas madre</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/componentes_ram">Ram</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/componentes_cpus">CPU</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/componentes_memorias">Memorias HDD-SSD</NavLink>
                    </li>
                    <li className="third-item">
                      <NavLink to="/productos/componentes_otros">Otros</NavLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <h2>•</h2>
            <li className="main-items">
              <Link to="/servicios">NUESTROS SERVICIOS</Link>
            </li>

            <h2>•</h2>

            <li className="main-items">
              <Link to="/locales">NUESTROS LOCALES</Link>
            </li>

            <h2>•</h2>

            <li className="main-items">
              <Link to="/pago">MODALIDAD DE PAGO</Link>
            </li>

            <h2>•</h2>

            <li className="main-items">
              <Link to="/delivery">DELÍVERY</Link>
            </li>

            <h2>•</h2>

            <li className="main-items">
              <Link to="/negocio">MODELO DE NEGOCIO</Link>
            </li>

            {rolUsuario === 'cliente' && (
              <>
              <h2>•</h2>
              <li className="main-items">
                <Link to="/citas">CITAS</Link>
              </li>
              </>
            )}

            {(rolUsuario === 'admin' || rolUsuario === 'asesor') && (
              <>
                <h2>•</h2>
                <li className="main-items">
                  <a href={adminUrl} target="_blank" rel="noopener noreferrer">PANEL ADMIN</a>
                </li>
              </>
            )}

          </ul>
       
        </div>
      </nav>

      {token && <Notificaciones />}
    </header>
    </>
  )
}

export default Header