import React, { useState } from "react";
import { Chatbot, createChatBotMessage } from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import productosUrl from "/productos.json?url";

let productos = [];

const cargarProductos = async () => {
  try {
    const response = await fetch(productosUrl);
    const data = await response.json();
    productos = data.productos || [];
  } catch (error) {
    console.error("No se pudieron cargar los productos del chatbot:", error);
    productos = [];
  }
};

void cargarProductos();

const obtenerProductosPorCategoria = (categoria) => {
  const filtro = categoria.toLowerCase();
  return productos.filter((producto) => {
    const nombreCategoria = producto.categoria?.name?.toLowerCase() || "";
    const subcategoria = producto.categoria?.Subcategoria?.toLowerCase() || "";
    return nombreCategoria.includes(filtro) || subcategoria.includes(filtro);
  });
};

const obtenerProductosPorPresupuesto = (maximo) => {
  const presupuesto = Number(maximo);
  return productos
    .filter((producto) => producto.price <= presupuesto)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);
};

const obtenerProductoPorNombre = (texto) => {
  const busqueda = texto.toLowerCase();
  return productos.find((producto) => producto.name.toLowerCase().includes(busqueda));
};

const construirMensajeProductos = (titulo, lista) => {
  if (!lista.length) {
    return `No encontré opciones con esos criterios en este momento. Puedo ayudarte con laptops, PCs gamer, oficina o workstation.`;
  }

  return `${titulo}\n\n${lista
    .map((producto, index) => `${index + 1}. ${producto.name}\n   Precio: S/ ${producto.price}\n   ${producto.categoria?.Subcategoria || ""}`)
    .join("\n\n")}`;
};

const config = {
  initialMessages: [
    createChatBotMessage("Holaaa, soy tu asistente de ServiTec. Te puedo ayudar a encontrar laptops, PCs, gaming o workstation según tu necesidad.")
  ],
  botName: "Servi",
};

function MessageParser({ children, actions }) {
  const parse = (mensaje) => {
    const texto = mensaje.toLowerCase();

    if (texto.includes("hola") || texto.includes("buenas") || texto.includes("buenos")) {
      actions.saludar();
    } else if (texto.includes("gaming") || texto.includes("gamer") || texto.includes("juegos")) {
      actions.recomendarGaming();
    } else if (texto.includes("oficina") || texto.includes("trabajo") || texto.includes("estudio") || texto.includes("estudiar")) {
      actions.recomendarOficina();
    } else if (texto.includes("laptop") || texto.includes("portátil") || texto.includes("notebook")) {
      actions.recomendarLaptops();
    } else if (texto.includes("pc") || texto.includes("computador") || texto.includes("equipo")) {
      actions.recomendarPC();
    } else if (texto.includes("presupuesto") || texto.includes("barato") || texto.includes("económico") || texto.includes("caro") || /\b\d{3,4}\b/.test(texto)) {
      actions.recomendarPorPresupuesto(texto);
    } else if (texto.includes("mejor") || texto.includes("destacado") || texto.includes("recomendado") || texto.includes("top")) {
      actions.destacados();
    } else if (texto.includes("contacto") || texto.includes("llamar") || texto.includes("whatsapp")) {
      actions.contacto();
    } else if (texto.includes("asesor") || texto.includes("ayuda") || texto.includes("ayúdame")) {
      actions.asesoria();
    } else {
      const productoEncontrado = obtenerProductoPorNombre(texto);
      if (productoEncontrado) {
        actions.buscarProducto(productoEncontrado.name);
      } else {
        actions.NiIdea();
      }
    }
  };

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { parse, actions })
      )}
    </>
  );
}

function ActionProvider({ createChatBotMessage, setState, children }) {
  const agregarMensaje = (mensaje) => {
    const nuevoMensaje = createChatBotMessage(mensaje);
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, nuevoMensaje],
    }));
  };

  const saludar = () => {
    agregarMensaje("¡Hola! Puedo recomendarte laptops, PCs gamer, equipos de oficina o workstation. También te ayudo a elegir por presupuesto o por tipo de uso.");
  };

  const asesoria = () => {
    agregarMensaje(
      "Para elegir bien, revisa estos puntos:\n\n👉 Rendimiento: procesador y RAM\n👉 Almacenamiento: SSD para mayor rapidez\n👉 Uso: gaming, oficina o diseño\n👉 Presupuesto: te puedo recomendar opciones reales según tu dinero"
    );
  };

  const contacto = () => {
    agregarMensaje("Puedes contactarnos directamente al número 📲 974293850 o escribirnos para agendar una asesoría personalizada.");
  };

  const recomendarGaming = () => {
    const recomendados = obtenerProductosPorCategoria("gaming").slice(0, 3);
    agregarMensaje(construirMensajeProductos("Para gaming te recomiendo estas opciones:", recomendados));
  };

  const recomendarOficina = () => {
    const recomendados = obtenerProductosPorCategoria("oficinas").slice(0, 3);
    agregarMensaje(construirMensajeProductos("Para oficina o estudio te recomiendo:", recomendados));
  };

  const recomendarLaptops = () => {
    const recomendados = obtenerProductosPorCategoria("laptops").slice(0, 3);
    agregarMensaje(construirMensajeProductos("Estas son laptops recomendables:", recomendados));
  };

  const recomendarPC = () => {
    const recomendados = obtenerProductosPorCategoria("pc").slice(0, 3);
    agregarMensaje(construirMensajeProductos("Estas son opciones de PC recomendables:", recomendados));
  };

  const recomendarPorPresupuesto = (texto) => {
    const match = texto.match(/\b(\d{3,5})\b/);
    const presupuesto = match ? Number(match[1]) : 1500;
    const recomendados = obtenerProductosPorPresupuesto(presupuesto);
    agregarMensaje(construirMensajeProductos(`Te recomiendo estas opciones hasta S/ ${presupuesto}:`, recomendados));
  };

  const destacados = () => {
    const recomendados = productos.slice(0, 3);
    agregarMensaje(construirMensajeProductos("Los más destacados por ahora son:", recomendados));
  };

  const buscarProducto = (nombre) => {
    const producto = obtenerProductoPorNombre(nombre);
    if (!producto) {
      agregarMensaje("No encontré ese producto, pero puedo ayudarte con laptops, PCs gamer, oficina o workstation.");
      return;
    }

    agregarMensaje(
      `${producto.name}\nPrecio: S/ ${producto.price}\n\n${producto.description.join("\n")}`
    );
  };

  const NiIdea = () => {
    agregarMensaje("Puedo ayudarte con recomendaciones de productos, precios, gaming, oficina y workstation. Prueba decir: 'laptops', 'gaming', 'presupuesto 1500' o 'alienware'.");
  };

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          actions: {
            saludar,
            asesoria,
            contacto,
            recomendarGaming,
            recomendarOficina,
            recomendarLaptops,
            recomendarPC,
            recomendarPorPresupuesto,
            destacados,
            buscarProducto,
            NiIdea,
          },
        })
      )}
    </>
  );
}

export default function Servi() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
          zIndex: 1001,
        }}
      >
        💬
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "370px",
            maxWidth: "90%",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}
    </div>
  );
}
