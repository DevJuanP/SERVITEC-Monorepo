import React from 'react'
import './Servicios.css'

function Servicios() {
  return (
    <div>
      <h1>Nuestros servicios</h1>
      <h1 style={{
        backgroundColor: 'rgba(109, 35, 35, 1)',
        width: '250px',
        textAlign: 'center',
        fontSize: '250%',
        padding: '30px 70px',
        color: 'white',
        borderRadius: '5px',
        marginTop: '100px'
      }}>
        Reparacion y mantenimiento
      </h1>
      <h1 style={{ textAlign: 'center', marginTop: '100px' }}>
        ¡No te preocupes! En ServiTec tenemos la solución. Reparamos computadoras, laptops, celulares y más.
        No dejes que un fallo te detenga. ¡Visítanos hoy y deja tu equipo en manos de expertos!
      </h1>
      <div className="DefinicionServicio">
        <img style={{ padding: '0px 20px' }} src="/img/servicios.png" alt="" />
        <h2>
          🛠️ Realizamos reparación rápida, 🔄
          mantenimiento preventivo y 🚀 optimización de rendimiento.
          Confía en nuestros expertos para que tu equipo vuelva a funcionar al 100%. 💻✅
        </h2>
      </div>
      <a href="/pages/nuestros_locales.html" className="boton">UBICANOS</a>
      <hr style={{ width: '1100px', backgroundColor: 'black', height: '4px', marginTop: '80px' }} />

      <h1 style={{
        backgroundColor: 'rgba(109, 35, 35, 1)',
        width: '250px',
        textAlign: 'center',
        fontSize: '250%',
        padding: '30px 70px',
        color: 'white',
        borderRadius: '5px',
        marginTop: '100px'
      }}>
        Soporte tecnico.
      </h1>
      <h1 style={{ textAlign: 'center', marginTop: '100px' }}>
        ¡No te preocupes! En ServiTec tenemos la solución. Reparamos computadoras, laptops, celulares y más.
        No dejes que un fallo te detenga. ¡Visítanos hoy y deja tu equipo en manos de expertos!
      </h1>
      <div className="DefinicionServicio">
        <img style={{ padding: '0px 20px' }} src="/img/ServicioTecnico.png" alt="" />
        <h2>
          🛠️ Realizamos reparación rápida, 🔄
          mantenimiento preventivo y 🚀 optimización de rendimiento.
          Confía en nuestros expertos para que tu equipo vuelva a funcionar al 100%. 💻✅
        </h2>
      </div>
      <h1 style={{ textAlign: 'center', fontSize: '280%' }}>
        Agenda tu cita
      </h1>
      <div className="form1">
        <form action="" id="formulario">
          <label style={{ fontSize: 'x-large', marginLeft: '6px' }}>Nombres</label>
          <input type="text" /><br /><br />
          <label style={{ fontSize: 'x-large' }}>Apellidos</label>
          <input type="text" /><br /><br />
          <label style={{ fontSize: 'x-large', marginLeft: '35px' }}>Email</label>
          <input type="text" /><br /><br />
          <label style={{ fontSize: 'x-large', marginLeft: '35px' }}>Fecha</label>
          <input type="date" /><br /><br />
          <input type="submit" style={{ marginLeft: '219px' }} />
        </form>
        <div id="fondoPantalla"></div>
        <div id="estiloDeAlerta">
          <p>Cita agendada con éxito</p>
          <button id="cerrarAlert">Cerrar</button>
        </div>
      </div>
      <div>Servicios</div>
    </div>
  )
}

export default Servicios