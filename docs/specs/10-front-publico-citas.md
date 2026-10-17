# 10 — Citas del cliente en el front público (franjas)

## Objetivo
Especificar el **formulario de agendamiento del cliente** en `apps/front` para que la reserva caiga
siempre en una franja válida (HU-03, R-11/R-12) y para cerrar la deuda **B16** de
`06-front-adaptation.md`. Hoy `FormularioCitas.jsx` permite enviar una `fechaCita` arbitraria que el
backend rechaza con `400`.

## Alcance
- Selección de **asesor**, **tipo de cita**, **fecha** (día laborable) y **franja** disponible, con **calendario semanal por cupos**.
- Captura de **datos de contacto** (nombre, apellido, correo, teléfono), precargados del perfil y editables (R-15).
- Consumo de `GET /api/cita/disponibilidad` y `GET /api/cita/disponibilidadSemana` para pintar solo franjas libres.
- Envío de `POST /api/cita/agregarCita` con la franja elegida convertida a UTC.
- Manejo de errores `400` (fuera de franja) y `409` (ocupada) con `react-toastify`.
- Consulta y cancelación de citas propias (`GET /api/user/myInfo`, `POST /api/cita/cancelarCita`).
- **Campana de notificaciones** (`GET /api/notificaciones`, `POST /api/notificaciones/leer`), incluidas las de cancelación/rechazo.

Fuera de alcance: aprobar/concluir citas (asesor → panel `apps/admin`), pagos, notificaciones.

## Contrato consumido (ver `03-api-contract.md`)
| Uso | Endpoint | Rol |
|---|---|---|
| Asesores | `GET /api/user/asesores` | autenticado |
| Tipos | `GET /api/cita/tipoCita` | — |
| Franjas (día) | `GET /api/cita/disponibilidad?asesorId=&fecha=YYYY-MM-DD` | autenticado |
| Franjas (semana) | `GET /api/cita/disponibilidadSemana?asesorId=&desde=YYYY-MM-DD` | autenticado |
| Crear | `POST /api/cita/agregarCita` → `{asesorId, tipoCitaId, fechaCita, descripcion?, contacto?}` | cliente |
| Mis citas | `GET /api/user/myInfo` (campo `usuario.citas`) | autenticado |
| Cancelar | `POST /api/cita/cancelarCita` → `{citaId}` | cliente (dueño) |
| Notificaciones | `GET /api/notificaciones`, `POST /api/notificaciones/leer` | autenticado |

## Flujo de la interfaz
1. El cliente elige **tipo de cita** (`tiposCitas[]._id`, texto `type`) y **asesor** (`asesores[]._id`).
2. Según el asesor, se carga el **calendario semanal** con `disponibilidadSemana` (5 días × 7 franjas) y se marca cada día con sus cupos libres.
3. El cliente elige una **fecha** (día laborable, mínimo hoy en hora de Lima) y se pintan las franjas:
   - `disponible: true` → botón seleccionable (`hora`).
   - `disponible: false` → botón deshabilitado.
   - `franjas: []` (fin de semana / día no laborable) → mensaje "No hay atención ese día".
4. El formulario muestra los **datos de contacto** (`nombre`, `apellido`, `correo`, `telefono`) precargados del perfil y editables (R-15).
5. El cliente escribe una `descripcion` opcional y confirma.
6. `fechaCita` se arma como ISO 8601 **UTC**: `fecha` + `hora` interpretadas en **Lima (UTC-5 fijo)**
   → `new Date(`${fecha}T${hora}:00-05:00`).toISOString()`.
7. Éxito (`201`) → toast con el `mensaje`, refresco de "mis citas" y reset del formulario.
8. Error `400` → "Elige una franja válida"; error `409` → "Ese horario ya está ocupado" (refrescar franjas).

## Estados y validaciones
- Sin sesión → la vista invita a iniciar sesión (login).
- Botón **Confirmar** deshabilitado hasta tener asesor + tipo + fecha + franja + sesión.
- Mientras carga `disponibilidad`/`disponibilidadSemana` → spinner/skeleton en el calendario y las franjas.
- Los datos de contacto se **precargan** del perfil y son **editables**; se guardan como snapshot en la cita (R-5, R-15).
- La lista de "mis citas" muestra `asesor.nombre`, `tipoCita.type`, `fechaCita` (formateada a Lima) y
  `estado` (`Pendiente`/`Aprobada`/`Realizada`/`Cancelada`) y permite cancelar las `Pendiente`/`Aprobada`.
- La campana muestra las notificaciones no leídas y permite marcarlas como leídas.

## Componentes previstos
```
apps/front/src/pages/citas/
├─ FormularioCitas.jsx        (orquesta: selects + contacto + calendario semanal + franjas + descripción)
├─ components/CalendarioSemanal.jsx (días y cupos desde disponibilidadSemana)
├─ components/FranjaPicker.jsx  (lista de botones por franja; estado carga/vacío)
└─ components/MisCitas.jsx      (tabla de citas propias + estado + acción cancelar)
apps/front/src/componentes/header/
└─ Notificaciones.jsx           (campana + lista + marcar leídas)
```

## Criterios de aceptación
- Solo se ofrecen franjas con `disponible: true`; las ocupadas se ven deshabilitadas.
- Toda cita creada cae en una franja válida (P03) y nunca provoca `400` por formato/franja.
- Reservar una franja ya ocupada devuelve `409` y la UI lo comunica y refresca.
- La fecha enviada es ISO 8601 UTC y se interpreta en hora de Lima.
- Un día no laborable muestra el estado vacío, sin permitir confirmar.
- El calendario semanal refleja los cupos por día (5 días × 7 franjas).
- Al cancelar/rechazarse una cita, el cliente recibe una **notificación** y el estado pasa a `Cancelada`.

## Tareas derivables
1. Añadir en `FormularioCitas.jsx` los selects de asesor y tipo (datos reales del contrato).
2. Implementar `CalendarioSemanal` con `disponibilidadSemana` (días y cupos).
3. Implementar `FranjaPicker` que consuma `disponibilidad` al cambiar asesor/fecha.
4. Precargar y permitir editar los datos de contacto; enviarlos en `contacto` (R-15).
5. Convertir `(fecha, hora)` de Lima a ISO UTC antes de llamar a `agregarCita`.
6. Integrar toasts para `400`/`409` y refrescar franjas tras conflicto.
7. Integrar "mis citas" (`myInfo.citas`), el estado canónico y la cancelación real.
8. Implementar la campana de notificaciones (`GET /api/notificaciones`, marcar leídas).

## Dependencias
- Contrato: `03-api-contract.md`. Reglas: `01-functional.md` (HU-03, R-11/R-12).
- Backend de citas: `04-backend-conventions.md`. Deuda origen: `06-front-adaptation.md` (B16).

## Evidencia esperada
- Captura del formulario con franjas cargadas (libres/ocupadas).
- Cita creada visible en "mis citas" y en la agenda del asesor.
- Manejo visual del `409` al intentar reservar una franja ocupada.
