import React from "react";
import "./EstadoBadge.css";

const EstadoBadge = ({ estado, size = "md" }) => {
  const config = {
    Pendiente: { label: "Pendiente", class: "pendiente" },
    Aprobada: { label: "Aprobada", class: "aprobada" },
    Realizada: { label: "Realizada", class: "realizada" },
    Cancelada: { label: "Cancelada", class: "cancelada" },
  };

  const { label, class: badgeClass } = config[estado] || { label: estado, class: "" };

  const sizeClasses = {
    sm: "estado-badge-sm",
    md: "estado-badge-md",
    lg: "estado-badge-lg",
  };

  return (
    <span className={`estado-badge ${badgeClass} ${sizeClasses[size]}`}>
      {label}
    </span>
  );
};

export default EstadoBadge;