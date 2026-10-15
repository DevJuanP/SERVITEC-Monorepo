import React, { useState, useEffect } from "react";
import "./citas.css";
import jsPDF from "jspdf";
import api from "../../servicios/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormularioCitas = () => {
  const today = new Date().toISOString().slice(0, 10);

  const [cita, setCita] = useState({
    asesorId: "",
    tipoCita: "",
    fechaAtencion: "",
    estado: "Pendiente",
    descripcion: ""
  });

  const [citas, setCitas] = useState();
  const [userData, setUserData] = useState(null);
  const [asesores, setAsesores] = useState([]);
  const [tiposCitas, setTiposCitas] = useState([]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        await Promise.all([obtenerMiInfo(), obtenerAsesores(), obtenerTiposCitas()]);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    cargarDatosIniciales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCita({ ...cita, [name]: value });
  };

  const agregarCita = async (asesorId, tipoCitaId, fechaCita, descripcion) => {
    const payload = {
      asesorId,
      tipoCitaId: Number(tipoCitaId) || tipoCitaId,
      fechaCita: fechaCita instanceof Date ? fechaCita.toISOString() : new Date(fechaCita).toISOString(),
    };

    payload.descripcion = descripcion || "";

    const result = await api.post('/api/cita/agregarCita', payload);

    return result.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fechaCita = cita.fechaAtencion;
      await agregarCita(cita.asesorId, cita.tipoCita, fechaCita, cita.descripcion);

      alertaBonita("Cita agregada correctamente");

      await obtenerMiInfo();
    } catch (error) {
      console.log('Error al agregar la cita:', error);
    }
  };

  const alertaBonita = (mensaje) => {
    toast.success(mensaje, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  // formatea YYYY-MM-DD or Date into dd/mm/yyyy
  const formatDate = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.includes("-")) {
      const parts = value.split("-");
      if (parts.length >= 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(value);
    if (isNaN(d)) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  //formatea 2026-07-04T13:00:00.000Z a dd/mm/yyyy
  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return value;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hours}:${minutes}`;
  };

  const generarPDF = async () => {
    try {
      const usuario = await obtenerMiInfo();

      const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
      const margin = 36;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = margin;

      // Header
      doc.setFontSize(18);
      // Use bold font for the title poner el color de letra rojo oscuro
      doc.setTextColor(139, 30, 30); // dark red
      doc.setFont(undefined, 'bold');
      doc.text('Resumen de mis citas', pageWidth / 2, y, { align: 'center' });
      y += 24;

      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(20);
      const subtitle = `Cliente: ${usuario.nombre}    Correo: ${usuario.correo}    Fecha: ${formatDate(new Date().toISOString())}`;
      doc.text(subtitle, margin, y);
      y += 18;

      // Divider
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 14;

      // Table header (dark maroon with white text) - include Cliente and Correo
      const colWidths = [30, 140, 160, 110, 90, 70, 70, pageWidth - margin * 2 - (30 + 140 + 160 + 110 + 90 + 70 + 70)];
      const headers = ['#', 'Cliente', 'Correo', 'Fecha atención', 'Asesor', 'Tipo', 'Estado', 'Descripción'];

      doc.setFillColor(43, 11, 11); // dark maroon
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');

      let x = margin;
      for (let i = 0; i < headers.length; i++) {
        doc.setTextColor(255);
        doc.rect(x, y, colWidths[i], 18, 'F');
        doc.text(headers[i], x + 6, y + 13);
        x += colWidths[i];
      }
      y += 20;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);

      const rows = (usuario.citas || []).map((c, idx) => {
        return [
          String(idx + 1),
          usuario.nombre || '',
          usuario.correo || '',
          c.fechaCita ? formatDateTime(c.fechaCita) : '',
          c.asesor?.nombre || '',
          c.tipoCita?.type || '',
          c.estado || '',
          c.descripcion || ''
        ];
      });

      for (let rIndex = 0; rIndex < rows.length; rIndex++) {
        const row = rows[rIndex];
        x = margin;

        // estimate height of description cell
        const descLines = doc.splitTextToSize(String(row[5]), colWidths[5] - 10);
        const rowHeight = Math.max(16, descLines.length * 12 + 6);

        // alternate soft reddish background for better contrast
        if (rIndex % 2 === 0) {
          let fx = margin;
          doc.setFillColor(247, 233, 231); // light reddish
          for (let fi = 0; fi < colWidths.length; fi++) {
            doc.rect(fx, y, colWidths[fi], rowHeight, 'F');
            fx += colWidths[fi];
          }
        }

        if (y + rowHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        // draw cell borders and text
        for (let i = 0; i < row.length; i++) {
          doc.setDrawColor(180);
          doc.rect(x, y, colWidths[i], rowHeight);
          doc.setTextColor(20);
          if (i === 5) {
            doc.text(descLines, x + 6, y + 12);
          } else {
            doc.text(String(row[i]), x + 6, y + 12);
          }
          x += colWidths[i];
        }

        y += rowHeight + 6;
      }

      doc.save(`citas_${usuario.nombre.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('No se pudo generar el PDF');
    }
  };


  const obtenerMiInfo = async () => {
    try {
      const result = await api.get('/api/user/myInfo');
      setUserData(result.data.usuario);
      return result.data.usuario;
    } catch (error) {
      console.log('Error en obtenerMiInfo:', error);
      throw error;
    }
  };

  const obtenerAsesores = async () => {
    try {
      const result = await api.get('/api/user/asesores');

      setAsesores(result.data.asesores);
      return result.data.asesores;
    } catch (error) {
      console.log('Error en obtenerAsesores:', error);
      throw error;
    }
  };

  const obtenerTiposCitas = async () => {
    try {
      const result = await api.get('/api/cita/tipoCita');
      setTiposCitas(result.data.tiposCitas);
      return result.data.tiposCitas;
    } catch (error) {
      console.log('Error en obtenerTiposCitas:', error);
      throw error;
    }
  };



  const cancelarCita = async (id) => {
    try {
      // El id de la cita se pasa por body; el token lo inyecta el cliente api.
      const body = { citaId: id };
      await api.post('/api/cita/cancelarCita', body);
      toast.success('Cita cancelada con éxito');
      // Actualizar la lista de citas
      await obtenerMiInfo();
    } catch (error) {
      console.error('Error cancelando cita:', error);
      toast.error('No se pudo cancelar la cita');
    }
  };

  return (
    <div className="contenedorcc" style={{ display: "flex", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ flex: 1, minWidth: "300px" }}>
        <h2 className="titulo-cc">Registro de Citas</h2>

        <form onSubmit={handleSubmit} className="formulario-cc">
          <input type="text" name="nombreCliente" placeholder="Nombre del Cliente" value={userData?.nombre} required disabled />
          <input type="email" name="correo" placeholder="Correo electrónico" value={userData?.correo} required disabled />

          <select name="asesorId" value={cita.asesorId} onChange={handleChange} required>
            <option value="">Seleccione asesor</option>
            {asesores.map((a) => (
              <option key={a._id} value={a._id}>{a.nombre}</option>
            ))}
          </select>

          <select name="tipoCita" value={cita.tipoCita} onChange={handleChange} required>
            <option value="">Seleccione tipo de cita</option>
            {tiposCitas.map(t => (
              <option key={t._id} value={t._id}>{t.type}</option>
            ))}
          </select>

          {/* El estado se asigna automáticamente al crear la cita (Pendiente) */}

          <textarea name="descripcion" placeholder="Descripción (opcional)" value={cita.descripcion} onChange={handleChange} rows={3} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#333' }}>Fecha de atención:</label>
            <input type="date" name="fechaAtencion" value={cita.fechaAtencion} onChange={handleChange} style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc' }} required />
          </div>

          <button type="submit">Registrar Cita</button>
        </form>
      </div>

      <div className="reporte" style={{ flex: 3, minWidth: "500px" }}>
        <details className="citas-accordion" style={{ background: 'transparent' }}>
          <summary style={{ cursor: 'pointer', fontSize: '1.05rem', fontWeight: 700, padding: '0.5rem 0' }}>
            Ver todas mis citas ({userData?.citas?.length || 0})
          </summary>

          <div style={{ paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="titulo-cc" style={{ margin: 0 }}>Citas Registradas</h2>
              <button className="btn-pdf" onClick={generarPDF}>Generar PDF</button>
            </div>

            <div className="reporte-wrapper" style={{ marginTop: "1rem" }}>
              <table className="tabla-citas" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Asesor</th>
                    <th>Fecha de atención</th>
                    <th>Tipo de cita</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {userData?.citas.map((c) => {
                    //console.log('Cita:', c._id); // Agrega este log para ver los datos de cada cita
                    return (
                      <tr key={c._id}>
                        <td>{userData?.nombre}</td>
                        <td>{userData?.correo}</td>
                        <td>{c?.asesor?.nombre || ""}</td>
                        <td>{c?.fechaCita? formatDateTime(c.fechaCita) : ""}</td>
                        <td>{c?.tipoCita?.type || ""}</td>
                        <td>{c?.descripcion || ""}</td>
                        <td>{c?.estado || ""}</td>
                        <td>
                          {c.estado !== "Cancelada" && c.estado !== "Realizada" && (
                            <button style={{ background: '#c0392b', color: '#fff', padding: '6px 8px', borderRadius: 6, border: 'none', cursor: 'pointer' }} onClick={() => cancelarCita(c._id)}>Cancelar</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </div>
  );
};

export default FormularioCitas;
