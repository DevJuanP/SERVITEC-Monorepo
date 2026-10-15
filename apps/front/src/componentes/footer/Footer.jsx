import React from 'react'
import { Link } from 'react-router-dom'

import './footer.css'

const Footer = () => {  
  return (
    <>
       <footer>
      <div className="footer-top">
        <div className="info">
          <h4>
            CONTACTANOS: <br />
            📧 contacto@servitec.com <br />
            📧 soporte@servitec.com (para atención técnica) <br />
            📧 ventas@servitec.com (para consultas de compra)
          </h4>
        </div>

        <hr className="sepador-footer" />

        <div className="info">
          <h4>
            Síguenos en: <br />
            📘 Facebook: @Servitec <br />
            📸 Instagram: @Servitec <br />
          </h4>
        </div>

        <hr className="sepador-footer" />

        <div className="info info-right">
          <h4>
            📞 Teléfono: +51 987 654 321 <br />
            🕒 Horario: Lunes - Sábado, 9:00 AM - 6:00 PM <br />
            <Link to="/mapSite">MAPA DE SITIO</Link> <br />
          </h4>
        </div>
      </div>

      <div className="footer-bottom">
        <h3>SERVITEC</h3>
      </div>
      
    </footer>
   
    </>
  )
}

export default Footer