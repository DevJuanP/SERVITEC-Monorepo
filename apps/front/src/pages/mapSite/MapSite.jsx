import React from 'react'
import { Link } from 'react-router-dom'
import './MapSite.css'

const MapSite = () => {
  return (
    <div>
       <main className='mapSITE'>
        <div className="mapasite">
          <ul style={{ paddingLeft: "45px" }} className="mapa">
            <li>
              <Link to="/index">Inicio</Link>
              <ul>
                <li>
                  Catálogo
                  <ul>
                    <li>
                      Laptops
                      <ul>
                        <li>
                          <Link to="/pages/productos/laptops_gamer">Laptops Gamer</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/laptos_otras">Otras Laptops</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      Pc Armadas
                      <ul>
                        <li>
                          <Link to="/pages/productos/combos_gamer">Combos Gamer</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/pc_profesional">PC Profesional</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/pc_oficina">PC de Oficina</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      Componentes
                      <ul>
                        <li>
                          <Link to="/pages/productos/monitores">Monitores</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/cases">Cases</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/placas_madre">Placas Madre</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/ram">Ram</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/cpus">CPUs</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/memorias">Memorias</Link>
                        </li>
                        <li>
                          <Link to="/pages/productos/otros_comp">Otros</Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/servicios">Nuestros servicios</Link>
                </li>
                <li>
                  <Link to="/locales">Nuestros Locales</Link>
                </li>
                <li>
                  <Link to="/pago">Modalidad de pago</Link>
                </li>
                <li>
                  <Link to="/delivery">Delivery</Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default MapSite