import React from 'react'
import './Pago.css'
const Pago = () => {
  return (
    <>
      <h1>MODALIDADES DE PAGO</h1>
      <hr />
      <div className="section">
        <div className="img-pago">
          <img src="https://effervescent-concha-1ab1e8.netlify.app/img/PLIN%202.png" alt="plin" />
        </div>
        <div className="dato">
          <p>
            PLIN: <br />
            Cuenta Plin: 927-538-7421
          </p>
        </div>
      </div>
      <hr />
      <div className="section">
        <div className="img-pago">
          <img src="https://effervescent-concha-1ab1e8.netlify.app/img/YAPE.png" alt="plin" />
        </div>
        <div className="dato">
          <p>
            YAPE: <br />
            Cuenta yape: 987-452-613
          </p>
        </div>
      </div>
      <hr />
      <div className="section">
        <div className="img-pago">
          <img src="https://effervescent-concha-1ab1e8.netlify.app/img/BCP.png" alt="banco" />
        </div>
        <div className="dato dato-banco">
          <p>
            Cuenta en Soles (PEN) - BCP <br />
            CCI: 002-191-30456789231-10 <br />
            Número de Cuenta: <br /> 191-3045678923
          </p>
        </div>
        <div className="dato dato-banco">
          <p>
            Cuenta en Dólares (USD) - BCP <br />
            CCI: 002-191-30456789231-10 <br />
            Número de Cuenta: <br /> 191-3045678923
          </p>
        </div>
      </div>
      <hr />
      <div className="section">
        <div className="img-pago">
          <img src="https://effervescent-concha-1ab1e8.netlify.app/img/BBVA.png" alt="banco" />
        </div>
        <div className="dato dato-banco">
          <p>
            Cuenta en Soles (PEN) - BBVA <br />
            CCI: 002-191-30456789231-10 <br />
            Número de Cuenta: <br /> 191-3045678923
          </p>
        </div>
        <div className="dato dato-banco">
          <p>
            Cuenta en Dólares (USD) - BBVA <br />
            CCI: 002-191-30456789231-10 <br />
            Número de Cuenta: <br /> 191-3045678923
          </p>
        </div>
      </div>
    </>
  )
}

export default Pago