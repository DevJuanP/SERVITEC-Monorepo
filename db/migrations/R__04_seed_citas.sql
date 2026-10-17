INSERT INTO citas (cliente_id, asesor_id, tipo_cita_id, estado, fecha_creacion, fecha_cita, descripcion, observacion)
SELECT cl.id, a.id, 1, 'Pendiente', now(), '2026-07-06T14:00:00Z'::timestamptz, 'Diagnóstico por lentitud del equipo', NULL
FROM usuarios cl
JOIN usuarios a ON a.correo = 'asesor@servitec.pe'
WHERE cl.correo = 'cliente@servitec.pe'
  AND NOT EXISTS (
      SELECT 1 FROM citas c
      WHERE c.cliente_id = cl.id AND c.fecha_cita = '2026-07-06T14:00:00Z'::timestamptz
  );

INSERT INTO citas (cliente_id, asesor_id, tipo_cita_id, estado, fecha_creacion, fecha_cita, descripcion, observacion)
SELECT cl.id, a.id, 2, 'Aprobada', now(), '2026-07-07T15:00:00Z'::timestamptz, 'Asesoría virtual para compra de componentes', NULL
FROM usuarios cl
JOIN usuarios a ON a.correo = 'asesor@servitec.pe'
WHERE cl.correo = 'cliente@servitec.pe'
  AND NOT EXISTS (
      SELECT 1 FROM citas c
      WHERE c.cliente_id = cl.id AND c.fecha_cita = '2026-07-07T15:00:00Z'::timestamptz
  );

INSERT INTO citas (cliente_id, asesor_id, tipo_cita_id, estado, fecha_creacion, fecha_cita, descripcion, observacion)
SELECT cl.id, a.id, 1, 'Realizada', now(), '2026-07-08T16:00:00Z'::timestamptz, 'Mantenimiento y limpieza de PC', 'Cambio de pasta térmica y limpieza interna'
FROM usuarios cl
JOIN usuarios a ON a.correo = 'asesor2@servitec.pe'
WHERE cl.correo = 'cliente@servitec.pe'
  AND NOT EXISTS (
      SELECT 1 FROM citas c
      WHERE c.cliente_id = cl.id AND c.fecha_cita = '2026-07-08T16:00:00Z'::timestamptz
  );

INSERT INTO citas (cliente_id, asesor_id, tipo_cita_id, estado, fecha_creacion, fecha_cita, descripcion, observacion)
SELECT cl.id, a.id, 2, 'Cancelada', now(), '2026-07-08T18:00:00Z'::timestamptz, 'Revisión de conectividad de red', NULL
FROM usuarios cl
JOIN usuarios a ON a.correo = 'asesor2@servitec.pe'
WHERE cl.correo = 'cliente@servitec.pe'
  AND NOT EXISTS (
      SELECT 1 FROM citas c
      WHERE c.cliente_id = cl.id AND c.fecha_cita = '2026-07-08T18:00:00Z'::timestamptz
  );

INSERT INTO citas (cliente_id, asesor_id, tipo_cita_id, estado, fecha_creacion, fecha_cita, descripcion, observacion)
SELECT cl.id, a.id, 1, 'Pendiente', now(), '2026-07-09T14:00:00Z'::timestamptz, 'Instalación de sistema operativo', NULL
FROM usuarios cl
JOIN usuarios a ON a.correo = 'asesor3@servitec.pe'
WHERE cl.correo = 'cliente@servitec.pe'
  AND NOT EXISTS (
      SELECT 1 FROM citas c
      WHERE c.cliente_id = cl.id AND c.fecha_cita = '2026-07-09T14:00:00Z'::timestamptz
  );

-- Notificación de ejemplo para la cita cancelada (R-14, HU-13)
INSERT INTO notificaciones (usuario_id, cita_id, tipo, mensaje, leida, fecha)
SELECT c.cliente_id, c.id, 'Cancelada', 'Tu cita fue cancelada', false, c.fecha_creacion
FROM citas c
JOIN usuarios u ON u.id = c.cliente_id
WHERE u.correo = 'cliente@servitec.pe'
  AND c.fecha_cita = '2026-07-08T18:00:00Z'::timestamptz
  AND NOT EXISTS (
      SELECT 1 FROM notificaciones n WHERE n.cita_id = c.id
  );
