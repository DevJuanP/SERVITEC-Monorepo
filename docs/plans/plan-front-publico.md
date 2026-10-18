# Plan 02 — Front público (`apps/front`)
> Estado: ⬜ Pendiente · Depende de: Plan 01 Backend (✅) · Cubre: 06 §B16, 06 §Configuración, 06 §Contrato, 06 §Criterios de aceptación, 10 §Alcance, 10 §Flujo de la interfaz, 10 §Estados y validaciones, 10 §Componentes previstos, 10 §Criterios de aceptación, 03 §Citas/§Usuarios/§Notificaciones, HU-03, HU-04, R-11, R-12, R-14, R-15, P03 · Estimación: M

## 1. Objetivo
Cerrar la deuda **B16** (`06-front-adaptation.md`, spec `10-front-publico-citas.md`): que el cliente
agende **siempre en una franja válida** (HU-03, R-11/R-12) consumiendo `disponibilidad`/`disponibilidadSemana`,
que envíe la cita en ISO 8601 UTC (Lima) con el snapshot de contacto (R-15), que gestione sus citas y
notificaciones (R-14), y que el **panel de administración se retire** del front público, dejando solo un
enlace a `apps/admin` vía `VITE_ADMIN_URL`.

## 2. Alcance
- **Incluye:** selects reales de asesor/tipo; calendario semanal por cupos; selector de franja;
  datos de contacto precargados y editables (snapshot R-15); conversión `(fecha, hora)` Lima → ISO UTC;
  manejo de `400`/`409` con `react-toastify`; "mis citas" con estado canónico y cancelación real;
  campana de notificaciones; retiro de la ruta `/admin` y de `CitaAdmin.jsx`; enlace al panel con
  `VITE_ADMIN_URL`; verificación de build y de ausencia de URLs `localhost` hardcodeadas.
- **No incluye:** aprobar/concluir citas (asesor → `apps/admin`, `09-admin-panel.md`, F3);
  implementación de `apps/admin` (`plan-admin.md`, F3); pagos; correo de notificaciones (diferido, R-14);
  deuda diferida de `06` B1–B15/B17/B18 (fuera de esta edición).

## 3. Referencias
- Specs: `10-front-publico-citas.md` (B16: flujo, estados, componentes y criterios), `06-front-adaptation.md`
  (adaptación base, contrato consumido y deuda), `03-api-contract.md` (endpoints que se consumen),
  `01-functional.md` (HU-03, HU-04, R-11/R-12/R-14/R-15), `07-install-guide.md` (credenciales).
- Skills: ninguna específica del repositorio.

## 4. Precondiciones
- Plan 01 Backend ✅ con `mvnw.cmd test` en verde (P01–P13); F2 no arranca sin ello (§8).
- Backend arrancable con CORS `:5173` y API de citas operativa; PostgreSQL con la semilla aplicada
  (datos de asesores, tipos y disponibilidad) para probar franjas.
- Entorno: JDK 21 y PostgreSQL disponibles (hoy el equipo tiene JDK 25 y PG sin levantar → apuntar).
- `apps/front` con `npm install` resuelto; `VITE_API_URL`/`VITE_ADMIN_URL` en `.env` (base: `.env.example`).
- Contrato de `03-api-contract.md` congelado.

## 5. Tareas

### T-2.1 — Selects de asesor y tipo reales
- **Objetivo:** `FormularioCitas.jsx` ofrece asesores (`GET /api/user/asesores`, `asesores[]._id`) y tipos
  (`GET /api/cita/tipoCita`, `tiposCitas[]._id` con texto `type`) con datos reales del contrato.
- **Archivos:** `apps/front/src/pages/citas/FormularioCitas.jsx`.
- **Pasos:** `10 §Alcance` y `10 §Flujo de la interfaz` (paso 1); cargar ambos catálogos al montar;
  quitar cualquier dato mock; usar `asesor.nombre` y `tipoCita.type` como etiquetas.
- **Criterios de aceptación:** `10 §Alcance`, `10 §Flujo de la interfaz` (1), `03 §Citas`, `03 §Usuarios`, HU-03.
- **Verificación:** V0 — `npm run build`; V2 — checklist: los selects se pueblan desde la API.
- **Estado:** [ ]

### T-2.2 — Calendario semanal por cupos (`CalendarioSemanal`)
- **Objetivo:** componente que muestra 5 días × 7 franjas con sus cupos libres desde
  `GET /api/cita/disponibilidadSemana?asesorId=&desde=YYYY-MM-DD`.
- **Archivos:** crear `apps/front/src/pages/citas/components/CalendarioSemanal.jsx`; integrar en `FormularioCitas.jsx`.
- **Pasos:** `10 §Flujo de la interfaz` (paso 2) y `10 §Componentes previstos`; recargar al cambiar de asesor;
  marcar cada día con sus cupos; estado de carga (spinner/skeleton) según `10 §Estados y validaciones`.
- **Criterios de aceptación:** `10 §Flujo de la interfaz` (2), `10 §Criterios de aceptación` (calendario 5×7), R-11, R-12.
- **Verificación:** V0 — `npm run build`; V2 — checklist: calendario refleja cupos por día (5×7).
- **Estado:** [ ]

### T-2.3 — Selector de franja (`FranjaPicker`)
- **Objetivo:** al cambiar asesor/fecha, consumir `GET /api/cita/disponibilidad?asesorId=&fecha=YYYY-MM-DD`
  y pintar franjas `disponible: true` seleccionables y `disponible: false` deshabilitadas.
- **Archivos:** crear `apps/front/src/pages/citas/components/FranjaPicker.jsx`; integrar en `FormularioCitas.jsx`.
- **Pasos:** `10 §Flujo de la interfaz` (paso 3) y `10 §Componentes previstos`; día no laborable (`franjas: []`)
  → mensaje "No hay atención ese día"; spinner/skeleton mientras carga (`10 §Estados y validaciones`).
- **Criterios de aceptación:** `10 §Flujo de la interfaz` (3), `10 §Criterios de aceptación` (franjas), R-11, R-12.
- **Verificación:** V0 — `npm run build`; V2 — checklist: libras/ocupadas y estado vacío de fin de semana.
- **Estado:** [ ]

### T-2.4 — Datos de contacto precargados y editables (R-15)
- **Objetivo:** precargar `nombre`, `apellido`, `correo`, `telefono` del perfil, permitir editarlos y
  enviarlos en `contacto` como snapshot de la cita.
- **Archivos:** `apps/front/src/pages/citas/FormularioCitas.jsx`.
- **Pasos:** `10 §Alcance`, `10 §Flujo de la interfaz` (paso 4) y `10 §Estados y validaciones`; precargar desde
  `GET /api/user/myInfo`; no bloquear los campos; incluir `contacto` en el payload de `agregarCita`.
- **Criterios de aceptación:** `10 §Flujo de la interfaz` (4), `10 §Estados y validaciones`, R-5, R-15.
- **Verificación:** V0 — `npm run build`; V2 — checklist: campos precargados, editables y en la cita creada.
- **Estado:** [ ]

### T-2.5 — Conversión Lima → ISO UTC y envío de la cita
- **Objetivo:** armar `fechaCita` como ISO 8601 UTC interpretando `fecha` + `hora` en Lima (UTC-5 fijo)
  y enviar `POST /api/cita/agregarCita` con `{asesorId, tipoCitaId, fechaCita, descripcion?, contacto}`.
- **Archivos:** `apps/front/src/pages/citas/FormularioCitas.jsx`.
- **Pasos:** `10 §Flujo de la interfaz` (pasos 5–6); usar `new Date(`${fecha}T${hora}:00-05:00`).toISOString()`;
  deshabilitar **Confirmar** hasta tener asesor + tipo + fecha + franja + sesión (`10 §Estados y validaciones`);
  en éxito (`201`) toast con `mensaje`, refrescar "mis citas" y resetear el formulario.
- **Criterios de aceptación:** `10 §Flujo de la interfaz` (5–7), R-11, R-12, P03.
- **Verificación:** V0 — `npm run build`; V2 — checklist: la cita creada cae en la franja elegida (sin `400`).
- **Estado:** [ ]

### T-2.6 — Toasts de error `400`/`409` y refresco de franjas
- **Objetivo:** `400` → "Elige una franja válida"; `409` → "Ese horario ya está ocupado" y refrescar franjas.
- **Archivos:** `apps/front/src/pages/citas/FormularioCitas.jsx` (+ `FranjaPicker.jsx` si refresca ahí).
- **Pasos:** `10 §Alcance` y `10 §Flujo de la interfaz` (paso 8); `react-toastify`; tras `409`, recargar `disponibilidad`.
- **Criterios de aceptación:** `10 §Flujo de la interfaz` (8), `10 §Criterios de aceptación` (409), P03.
- **Verificación:** V0 — `npm run build`; V2 — checklist: `409` comunicado y franjas refrescadas.
- **Estado:** [ ]

### T-2.7 — "Mis citas" y cancelación real (`MisCitas`)
- **Objetivo:** listar `usuario.citas` (`GET /api/user/myInfo`) con `asesor.nombre`, `tipoCita.type`,
  `fechaCita` formateada a Lima y `estado` canónico; cancelar `Pendiente`/`Aprobada` con `POST /api/cita/cancelarCita`.
- **Archivos:** crear `apps/front/src/pages/citas/components/MisCitas.jsx`; integrar en `FormularioCitas.jsx`.
- **Pasos:** `10 §Alcance`, `10 §Estados y validaciones` y `10 §Componentes previstos`; estados canónicos
  `Pendiente`/`Aprobada`/`Realizada`/`Cancelada`; refresco tras cancelar.
- **Criterios de aceptación:** `10 §Estados y validaciones`, `10 §Criterios de aceptación`, HU-05, P05.
- **Verificación:** V0 — `npm run build`; V2 — checklist: cita visible y cancelada desde la tabla.
- **Estado:** [ ]

### T-2.8 — Campana de notificaciones (`Notificaciones`)
- **Objetivo:** campana con `GET /api/notificaciones`, indicador de no leídas y marcar leídas
  (`POST /api/notificaciones/leer`), incluidas las de cancelación/rechazo (R-14).
- **Archivos:** crear `apps/front/src/componentes/header/Notificaciones.jsx`; integrar en `Header.jsx`.
- **Pasos:** `10 §Alcance`, `10 §Estados y validaciones` y `10 §Componentes previstos`; refresco/estado leído.
- **Criterios de aceptación:** `10 §Estados y validaciones`, HU-12, R-14, `03 §Notificaciones`.
- **Verificación:** V0 — `npm run build`; V2 — checklist: la notificación de cancelación aparece y se marca leída.
- **Estado:** [ ]

### T-2.9 — Retirar el panel del front público
- **Objetivo:** eliminar la ruta `/admin`, el archivo `CitaAdmin.jsx` y sus imports/entradas de menú.
- **Archivos:** `apps/front/src/main.jsx`, `apps/front/src/pages/citaAdmin/CitaAdmin.jsx` (eliminar),
  `apps/front/src/componentes/header/Header.jsx`.
- **Pasos:** `06 §Contrato consumido` y `06 §Tareas derivables` (3); quitar `CitaAdmin` de `main.jsx` y del `Header`.
- **Criterios de aceptación:** `10 §Criterios de aceptación` (`/admin` inexistente), `06 §Tareas derivables` (3).
- **Verificación:** V0 — `npm run build`; V2 — checklist: navegar a `/admin` no renderiza el panel.
- **Estado:** [ ]

### T-2.10 — Enlace al panel con `VITE_ADMIN_URL`
- **Objetivo:** para `admin`/`asesor`, el `Header` enlaza `apps/admin` mediante `VITE_ADMIN_URL`.
- **Archivos:** `apps/front/src/componentes/header/Header.jsx`, `apps/front/.env.example`.
- **Pasos:** `06 §Configuración` y `06 §Tareas derivables` (3); usar `import.meta.env.VITE_ADMIN_URL`;
  nada de URL `localhost` hardcodeada; mostrar el enlace solo a `admin`/`asesor` (HU-04).
- **Criterios de aceptación:** `06 §Configuración`, `06 §Criterios de aceptación` (sin localhost), HU-04.
- **Verificación:** V0 — `npm run build`; V2 — checklist: el enlace aparece solo para `admin`/`asesor`.
- **Estado:** [ ]

### T-2.11 — Confirmar que el front público no consume endpoints de admin
- **Objetivo:** verificar que `apps/front` ya no llama rutas de administración.
- **Archivos:** `apps/front/src/**` (auditoría; sin cambios esperados).
- **Pasos:** `06 §Contrato consumido`; `grep` de `agregarCitaAdmin`, `GET /api/cita`, `/api/user`,
  `/api/productos/admin` y CRUD en `src/`.
- **Criterios de aceptación:** `06 §Contrato consumido`, `06 §Tareas derivables` (3).
- **Verificación:** V3 — auditoría de contrato `03` sobre los archivos del front (grep sin resultados).
- **Estado:** [ ]

### T-2.12 — Verificación final del front público
- **Objetivo:** build en verde, sin URLs `localhost` hardcodeadas y flujo completo funcionando.
- **Archivos:** `apps/front/**` (verificación; sin cambios de código esperados).
- **Pasos:** `06 §Criterios de aceptación` y `10 §Criterios de aceptación`; correr `npm run build`;
  `grep "localhost:3000" src/` vacío; flujo: login cliente → agendar en franja → ver "mis citas" → cancelar.
- **Criterios de aceptación:** `10 §Criterios de aceptación`, `06 §Criterios de aceptación`.
- **Verificación:** V0 — `npm run build`; V2 — checklist del flujo completo; V4 — solo si hay release.
- **Estado:** [ ]

## 6. Matriz de trazabilidad del plan
| ID / sección | Tarea(s) |
|---|---|
| 06 §B16 | T-2.1, T-2.2, T-2.3, T-2.4, T-2.5, T-2.6, T-2.7, T-2.8 |
| 06 §Configuración | T-2.10 |
| 06 §Contrato consumido | T-2.9, T-2.11 |
| 06 §Criterios de aceptación | T-2.10, T-2.11, T-2.12 |
| 06 §Tareas derivables (3) | T-2.9, T-2.10, T-2.11 |
| 10 §Alcance | T-2.1, T-2.4, T-2.6, T-2.7, T-2.8 |
| 10 §Flujo de la interfaz | T-2.1, T-2.2, T-2.3, T-2.4, T-2.5, T-2.6 |
| 10 §Estados y validaciones | T-2.4, T-2.5, T-2.7, T-2.8 |
| 10 §Componentes previstos | T-2.2, T-2.3, T-2.7, T-2.8 |
| 10 §Criterios de aceptación | T-2.5, T-2.6, T-2.7, T-2.9, T-2.12 |
| 03 §Citas, §Usuarios, §Notificaciones | T-2.1, T-2.5, T-2.7, T-2.8 |
| HU-03 | T-2.1, T-2.2, T-2.3, T-2.5, T-2.6 |
| HU-04 | T-2.10 |
| HU-05 | T-2.7 |
| HU-12 | T-2.8 |
| R-11, R-12 | T-2.2, T-2.3, T-2.5 |
| R-14 | T-2.8 |
| R-15 | T-2.4 |
| P03 | T-2.5, T-2.6, T-2.12 |
| P05 | T-2.7 |

## 7. Verificación final del plan
- [ ] `npm run build` sin errores.
- [ ] Sin URLs `localhost` hardcodeadas en `apps/front` (`grep "localhost:3000" src/` vacío).
- [ ] Reserva siempre en franja válida (sin `400` por formato/franja) y `409` manejado.
- [ ] `/admin` inexistente; el enlace al panel aparece solo para `admin`/`asesor`.
- [ ] Flujo completo: login cliente → agendar en franja → ver "mis citas" → cancelar.
- [ ] `06-front-adaptation.md` criterios de aceptación cumplidos.
- [ ] Evidencia: capturas del formulario (franjas libres/ocupadas) y del `409` manejado; diff de archivos retirados.

## 8. Registro de desvíos y decisiones
- **D-1 (2026-10-17) — Normalización a §4:** este plan se reescribió a la plantilla obligatoria del
  contrato (cabecera, §1–§8, IDs `T-2.M`, matriz y registro), siguiendo el precedente de
  `plan-backend.md`. Cambio editorial de estructura; no altera alcance ni requisitos.
- **D-2 (2026-10-17) — Numeración y IDs:** se adopta `Plan 02` y `T-2.M` (backend = `Plan 01`/`T-1.M`),
  coherente con `plan-backend.md`. Se conserva el nombre de archivo `plan-front-publico.md` para no
  romper referencias en `README.md`, `00-roadmap.md`, `01-guia-de-ejecucion.md` y `prompts-ejecucion.md`.
  Colisión de `NN` con `01-guia-de-ejecucion.md` pendiente de resolver (§3 del contrato).
- **D-3 (2026-10-17) — Estado observado del repo:** en `FormularioCitas.jsx` los selects de asesor/tipo ya
  consumen datos reales (parcial de T-2.1), pero siguen presentes la ruta `/admin`, `CitaAdmin.jsx` y el
  enlace `/admin` en `Header.jsx`; no existen `CalendarioSemanal`/`FranjaPicker`/`MisCitas`/`Notificaciones`.
  Las tareas se dejan en ⬜; su verificación real se hará al ejecutar (§8 del contrato).