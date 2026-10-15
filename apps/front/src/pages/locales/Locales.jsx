import React from 'react'
import './Locales.css'
const Locales = () => {
return (
  <>
    <h1 style={{ textAlign: "center", fontSize: "250%" }}>
      calle Teodoro Valcarcel 183 Galería El Edén, Santiago de Surco 15023
    </h1>
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31206.608191126998!2d-77.01730802929148!3d-12.124053327704909!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c7d2e23d00b3%3A0x1133bbcdfb76ec90!2sServitec%20Total!5e0!3m2!1ses-419!2spe!4v1739769654072!5m2!1ses-419!2spe"
      width="600"
      height="450"
      style={{ border: 0, width: "100%" }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Mapa Servitec Total"
    ></iframe>
    <img
      src="https://effervescent-concha-1ab1e8.netlify.app/img/cede%20servitec.jpg"
      style={{ width: "100%", height: "600px", objectFit: "fill" }}
      alt="Cede Servitec"
    />
    <hr
      style={{
        width: "1100px",
        backgroundColor: "black",
        height: "4px",
        marginTop: "80px",
      }}
    />
    <h1 style={{ textAlign: "center", fontSize: "250%" }}>
      Jr. Camaná 1178, Lima 15001
    </h1>
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.826534011238!2d-77.04020732517465!3d-12.055453388182054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c95c52ec6209%3A0x9f690f7b812a5006!2sWilson%20centro%20c%C3%B3mputo%20compras!5e0!3m2!1ses-419!2spe!4v1739771003542!5m2!1ses-419!2spe"
      width="600"
      height="450"
      style={{ border: 0, width: "100%" }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Mapa Wilson Centro Computo"
    ></iframe>
    <img
      src="https://effervescent-concha-1ab1e8.netlify.app/img/images.jpeg"
      style={{ width: "100%", height: "600px", objectFit: "fill" }}
      alt="Wilson Centro Computo"
    />
  </>
)
}

export default Locales