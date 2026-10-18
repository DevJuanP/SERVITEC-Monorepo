import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home.jsx'
import Sevicios from './pages/servicios/Servicios.jsx'
import Productos from './pages/productos/Productos.jsx'
import Delivery from './pages/delivery/Delivery.jsx'
import Locales from './pages/Locales/Locales.jsx'
import Negocio from './pages/negocio/Negocio.jsx'
import Pago from './pages/pago/Pago.jsx'
import MapSite from  './pages/mapSite/MapSite.jsx'
import FormularioCitas from './pages/citas/FormularioCitas.jsx'
import Login from './pages/logReg/login.jsx'
import Register from './pages/logReg/register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route index element={<Home/>} />
          <Route path="/delivery" element={<Delivery/>} />
          <Route path="/locales" element={<Locales/>} />
          <Route path="/negocio" element={<Negocio/>} />
          <Route path="/pago" element={<Pago/>} />
          <Route path="/servicios" element={<Sevicios/>} />
          <Route path="/productos/:categoria" element={<Productos/>} />
          <Route path="/citas" element={<FormularioCitas/>} />
           <Route path="/login" element={<Login/>} />
           <Route path="/register" element={<Register/>} />
          <Route path="/mapsite" element={<MapSite/>} />
        </Route>
      </Routes>    
    </BrowserRouter>
  </StrictMode>,
)
