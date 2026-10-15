import React from 'react'
import "./Delivery.css"

const Delivery = () => {
  return (
    <div>
      <main className="delivery">
      <h1>🚚 Opciones de Delivery</h1>
      <hr />

      {/* Envío Express Lima */}
      <div className="lima">
        <h2>⚡ Envío Express (Solo Lima)</h2>
        <p>
          Realiza tu compra hoy y recibe tu pedido en menos de 24 horas dentro
          de Lima Metropolitana. 🏙️📦
          <br /><br />
          ✅ Servicio disponible de lunes a sábado. <br />
          ✅ Entregas rápidas y seguras. <br />
          ✅ Costo de envío según distrito. <br />
          📌 Consulta disponibilidad por zonas antes de comprar.
          <br /><br />
          ¡Compra ahora y recibe tu pedido sin esperar! 🛒✨
        </p>
        <div className="button-container1">
          <button>REALIZAR PEDIDO</button>
        </div>
      </div>

      <hr />

      {/* Envío a Provincia */}
      <div className="lima">
        <h2>✈️ Envío a Provincia</h2>
        <p>
          Realizamos envíos a todo el Perú con diferentes opciones según tu
          necesidad:
          <br /><br />
          ✅ Envío Estándar: 4 a 7 días hábiles. 📅<br />
          ✅ Envío Rápido: 2 a 4 días hábiles. ⚡<br />
          ✅ Envío por Agencia: Puedes elegir tu transportista de confianza
          (Olva Courier, Shalom, Marvisur, etc.). 🏢<br />
          <br />
          📌 Costos y tiempos varían según la ubicación.<br />
          📌 Verifica la cobertura y tarifas antes de realizar tu compra.<br />
          <br />
          ¡Compra con confianza y recibe tu pedido en cualquier parte del país! 🛒
        </p>
        <div className="button-container1">
          <button>REALIZAR PEDIDO</button>
        </div>
      </div>
    </main>
    </div>
  )
}

export default Delivery