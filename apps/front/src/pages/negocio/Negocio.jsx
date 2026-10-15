import React from 'react'
import { Link } from 'react-router-dom'
import './Negocio.css'

const Negocio = () => {
  return (
    <div className="modelo-container">
      <h1>MODELO DE NEGOCIO</h1>
      <p>
        Nuestro modelo de negocio se basa en ofrecer productos de alta calidad y servicios excepcionales a nuestros clientes. Nos enfocamos en la venta de computadoras, laptops y componentes, así como en brindar servicios de reparación y mantenimiento técnico.
      </p>

      <p>
        Además, contamos con un equipo de profesionales capacitados para asesorar a nuestros clientes en la elección de los productos que mejor se adapten a sus necesidades. Nuestro objetivo es garantizar la satisfacción del cliente a través de una experiencia de compra fluida y un servicio postventa confiable.
      </p>
      <p>
        En ServiTec, nos comprometemos a mantenernos actualizados con las últimas tendencias tecnológicas y a ofrecer productos innovadores que cumplan con los estándares más altos de calidad. Nuestro modelo de negocio se basa en la confianza, la transparencia y el compromiso con nuestros clientes.
      </p>

      <h2>¿Cómo elegir un telefono?</h2>
      <div className="video-container">
        <p>En este video te mostramos cómo elegir un teléfono adecuado para tus necesidades. Desde el procesador hasta la memoria RAM, te explicamos los aspectos clave a considerar al momento de comprar un smartphone.</p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/QQSbqBvhv10?si=LrD47_dJMBwkI0uQ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      </div>

      <h2>¿Cómo elegir una laptop?</h2>
      <div className="video-container">
        <p>En este video te mostramos cómo elegir una laptop adecuada para tus necesidades. Desde el procesador hasta la memoria RAM, te explicamos los aspectos clave a considerar al momento de comprar una laptop.</p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/2yVeZRTkw_Q?si=TopbihDb7P6GTPJ1" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      </div>

      <h2>¿Necesitas saber más fondo?</h2>
      <div className="video-container">
        <p>
          En este video te explicamos de manera sencilla la diferencia entre hardware y software. Descubre cómo estos dos conceptos fundamentales trabajan juntos para que tu computadora funcione correctamente. Ideal para quienes quieren entender mejor el mundo de la tecnología.
        </p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/rC2PFygrkSs?si=eIkv153Kh7HqXb_o" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      </div>

      <div className="button-container">
        <a href="https://wa.me/51974293850" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button aria-label="Escríbeme al whatsapp">Escríbeme al whatsapp</button>
        </a>
      </div>
    </div>
  )
}

export default Negocio