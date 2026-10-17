# 01 — Especificación funcional

## Objetivo
Definir el alcance funcional del prototipo SERVITEC: qué puede hacer cada actor, con qué reglas de
negocio y cómo se verifica, de forma que cada historia de usuario se convierta en tareas
implementables y testeables.

## Alcance
Módulos incluidos:

1. **Identidad y accesos** — registro de clientes, login, roles (admin, asesor, cliente), alta de asesores por admin (HU-11) y autorización por token. El rol `asesor` equivale a "técnico".
2. **Catálogo** — consulta de productos por categoría y subcategoría.
3. **Citas (cliente)** — agendamiento con datos de contacto, disponibilidad semanal, consulta de citas propias, cancelación y notificaciones.
4. **Citas (admin/asesor)** — agenda del asesor, registro de cita a nombre de un cliente, aprobación, cancelación/rechazo y conclusión.
5. **Catálogo e inventario (admin)** — mantenimiento de productos y control de stock (HU-06, HU-08).

Fuera de alcance: pasarela de pago, carrito/checkout, telemetría diagnóstica y chatbot (se reutiliza tal cual desde el front). Las **notificaciones in-app** sí están en alcance; el **envío por correo** queda diferido (ver R-14).

### Actores / roles
| Rol | Descripción | Necesidades |
|---|---|---|
| `cliente` | Cliente final | Registrarse, iniciar sesión, consultar catálogo, agendar/consultar/cancelar sus citas |
| `asesor` | Técnico que atiende citas | Consultar su agenda (HU-04), aprobar (HU-09), cancelar/rechazar (HU-05) y concluir (HU-10) sus citas |
| `admin` | Administrador | Todo lo del asesor + mantenimiento de catálogo y gestión global de citas |

`admin` es un superconjunto de `asesor`. El asesor actúa sobre su propia agenda.

## Historias de usuario

### HU-01 — Login
> Como **cliente** quiero iniciar sesión para consultar mis citas.

Criterios de aceptación:
- Credenciales válidas → `200` con `token` y `usuario:{nombre, rol}`.
- Credenciales inválidas → `401`, sin token.
- Usuario inactivo (`activo = false`) → `403`.
- El rol devuelto es el nombre del rol (`admin`, `asesor`, `cliente`).

### HU-02 — Filtrar catálogo
> Como **cliente** quiero filtrar hardware para encontrar componentes.

Criterios de aceptación:
- El listado corresponde a la categoría y subcategoría solicitadas.
- Sin filtros, devuelve el catálogo completo.
- La respuesta conserva la forma `categoria:{name, Subcategoria}` (compatibilidad con el front).

### HU-03 — Solicitar cita
> Como **cliente** quiero solicitar una cita para recibir asesoría.

Criterios de aceptación:
- Cita creada con `estado = Pendiente` y `fecha_cita` futura.
- `fecha_cita` debe caer exactamente en una franja válida del asesor (R-11/R-12); fuera de franja → `400`.
- El `cliente` se toma del token; el formulario **precarga y permite editar** los datos de contacto (`nombre`, `apellido`, `correo`, `telefono`), que se guardan como **snapshot** en la cita (R-5, R-15).
- El calendario muestra el día y la semana con sus cupos mediante `GET /api/cita/disponibilidadSemana` (R-11).
- Si la franja ya está ocupada por el asesor, se rechaza (R-3) → `409`.
- Respuesta `201` con la cita creada.

### HU-04 — Agenda del asesor
> Como **asesor** quiero consultar mi agenda para organizar mi atención.

Criterios de aceptación:
- El asesor ve únicamente las citas donde él es `asesor`.
- Las citas se devuelven ordenadas por `fecha_cita` ascendente.
- El admin puede ver la agenda de cualquier asesor.
- La agenda muestra las solicitudes `Pendiente` (para aprobar, HU-09) y las `Aprobada` (para concluir, HU-10).

### HU-05 — Cancelar / rechazar cita
> Como **cliente** quiero cancelar una cita, y como **asesor/admin** quiero rechazarla, para liberar el horario.

Criterios de aceptación:
- La cita pasa a `estado = Cancelada` (desde `Pendiente` o `Aprobada`); **no se elimina** (trazabilidad). El rechazo del asesor/admin es una **cancelación** (mismo estado).
- Puede cancelarla el dueño (cliente), el asesor de la cita o un admin; otro actor → `403`.
- Una cita ya cancelada no puede volver a cancelarse (idempotente o `409`).
- La cancelación/rechazo genera una **notificación** para el cliente (R-14).

### HU-06 — Mantener catálogo
> Como **administrador** quiero mantener un catálogo confiable.

Criterios de aceptación:
- Altas y cambios validados (nombre y precio requeridos, precio > 0, `stock` entero ≥ 0).
- Un producto siempre pertenece a una subcategoría existente.
- Endpoints de escritura restringidos a rol `admin`.

### HU-07 — Anti-solapamiento
> Como **sistema** quiero bloquear solapamientos para evitar dobles reservas.

Criterios de aceptación:
- Dos citas del mismo asesor en el mismo instante (ambas no canceladas) no coexisten; la segunda → `409`.
- Un cliente no puede tener dos citas no canceladas en el mismo instante → `409`.

### HU-08 — Control de stock
> Como **administrador** quiero controlar las existencias para no ofrecer productos agotados.

Criterios de aceptación:
- `stock` es un entero ≥ 0; el alta sin `stock` nace en `0` (agotado).
- Un producto agotado (`stock = 0`) **no se ofrece**: `GET /api/productos` lo excluye.
- El admin consulta también los agotados para reponerlos (`GET /api/productos/admin`).
- `stock` negativo en alta o actualización → `400`.

### HU-09 — Aprobar cita
> Como **asesor** quiero aprobar las solicitudes de mi agenda para confirmar las citas viables.

Criterios de aceptación:
- Solo citas `Pendiente` de su propia agenda (o cualquiera si es admin) pasan a `Aprobada`.
- Cita de otro asesor → `403`; cita en otro estado → `409`.
- El cambio de estado queda visible para el cliente.

### HU-10 — Concluir cita con observación
> Como **asesor** quiero concluir una cita aprobada registrando una observación para dejar constancia del servicio.

Criterios de aceptación:
- Solo citas `Aprobada` de su agenda (o cualquiera si es admin) pasan a `Realizada`.
- La `observacion` es obligatoria (no vacía) y queda persistida en la cita.
- Transición inválida → `409`; la cita nunca se elimina (R-2).

### HU-11 — Alta de asesores (admin)
> Como **administrador** quiero dar de alta nuevos asesores para ampliar la capacidad de atención.

Criterios de aceptación:
- `POST /api/user/asesores` (Bearer admin) crea el usuario con rol `asesor` y `activo = true`.
- El cuerpo no acepta `rol`: siempre se fuerza `asesor`.
- `correo` duplicado → `409`; datos inválidos → `400`; sin rol admin → `403`.
- El nuevo asesor aparece en `GET /api/user/asesores` y puede iniciar sesión.

### HU-13 — Notificaciones del cliente
> Como **cliente** quiero ver avisos cuando mi cita cambia de estado para enterarme sin volver a consultarla.

Criterios de aceptación:
- Al aprobar o **cancelar/rechazar** una cita se crea una notificación para el `cliente_id`.
- `GET /api/notificaciones` devuelve las notificaciones del usuario autenticado (más recientes primero).
- `POST /api/notificaciones/leer` marca como leídas una o todas las notificaciones.
- El envío por correo queda **diferido**: la notificación se persiste y podrá despacharse en una edición futura.

## Reglas de negocio

| ID | Regla |
|---|---|
| R-1 | Roles válidos: `admin`, `asesor`, `cliente`. Un usuario tiene exactamente un rol. |
| R-2 | Estados de cita: `Pendiente`, `Aprobada`, `Realizada`, `Cancelada`. Flujo: `Pendiente → Aprobada → Realizada`; cancelable/rechazable desde `Pendiente`/`Aprobada`. Cancelar o rechazar = mismo efecto (`Cancelada`), cambio de estado, nunca `DELETE`. |
| R-3 | Unicidad de agenda: `(asesor_id, fecha_cita)` único entre citas no canceladas (una cita por franja, R-11). |
| R-4 | Un cliente no puede tener dos citas no canceladas en el mismo instante. |
| R-5 | El registro público siempre crea usuarios con rol `cliente` (no se acepta `rol` del cliente). El alta de `asesor` solo la realiza un `admin` (HU-11); los usuarios `admin` se crean fuera de la aplicación (semilla/BD). |
| R-6 | Las contraseñas se almacenan con BCrypt y **nunca** se serializan en respuestas. |
| R-7 | `fecha_cita` se maneja en UTC (`timestamptz`); el front envía ISO 8601 (`toISOString()`). |
| R-8 | Un usuario inactivo (`activo = false`) no puede iniciar sesión. |
| R-9 | `productos.stock` es un entero ≥ 0; agotado = `stock = 0` (el producto no se borra: se repone). |
| R-10 | El catálogo público no ofrece agotados (`GET /api/productos` excluye `stock = 0`); el admin sí los ve (`GET /api/productos/admin`). |
| R-11 | Horario de atención: lunes a viernes 09:00–17:00 (hora de Lima, UTC-5), almuerzo 12:00–13:00 sin franjas. Cada asesor ofrece 7 franjas de 1 hora al día (máximo 7 citas/día/asesor). La consulta semanal (`disponibilidadSemana`) devuelve 5 días × 7 franjas. |
| R-12 | `fecha_cita` debe caer exactamente en una franja válida (en punto, día laborable, fuera del almuerzo); si no → `400`. |
| R-13 | Concluir una cita (`Aprobada → Realizada`) exige `observacion` no vacía, persistida en `citas.observacion`. |
| R-14 | Cada cambio de estado relevante (aprobación o cancelación/rechazo) genera una notificación persistida para el cliente; el envío por correo es diferido (fuera de alcance). |
| R-15 | Toda cita guarda un snapshot de contacto (`contacto_nombre`, `contacto_apellido`, `contacto_correo`, `contacto_telefono`) tomado del perfil del cliente y editable en el formulario. |

## Plan mínimo de pruebas técnicas → criterios de aceptación

| Código | Escenario | Resultado esperado |
|---|---|---|
| P01 | Login válido | `200` + token + rol correcto |
| P02 | Acceso no autorizado (sin token / rol insuficiente) | `401` / `403` |
| P03 | Crear cita disponible | `201`, fila en BD y visible en la interfaz |
| P04 | Conflicto de horario | `409`, sin duplicar la cita |
| P05 | Cancelar cita | Estado `Cancelada` persistido, cita aún presente |
| P06 | Consultar catálogo por categoría | Listado coherente con BD |
| P07 | API sin conexión a BD | Error controlado (`500`) y registrado en log |
| P08 | Producto agotado no se ofrece | `stock = 0` excluido del catálogo público; visible en `/api/productos/admin`; `stock` negativo → `400` |
| P09 | Consultar citas | Cliente ve sus citas; asesor/admin ven la agenda ordenada por `fechaCita` |
| P10 | Consultar disponibilidad | 7 franjas de 1 hora (sin 12–13) con las ocupadas en `disponible: false`; fecha malformada → `400` |
| P11 | Ciclo de estados de la cita | `Pendiente → Aprobada → Realizada` con observación persistida; transición inválida → `409` |
| P12 | Alta de asesor por admin | `201` con rol `asesor`; visible en `/api/user/asesores`; sin admin → `403`; correo duplicado → `409` |
| P13 | Cancelar/rechazar por asesor o admin | `Pendiente`/`Aprobada → Cancelada` con **notificación** creada para el cliente; cita ajena → `403`; ya cancelada → `409` |

> **Diferido:** la medición de los objetivos SMART del entregable (reducción ≥30% en registro de citas, ≤3 s de respuesta promedio y usabilidad ≥4/5) no forma parte de esta edición; su plan de medición (planillas de cronometraje, rendimiento y usabilidad) se documentará en una edición futura.

## Tareas derivables

1. Modelar y crear la tabla `roles` + `usuario.rol_id`; sembrar admin/asesor/cliente.
2. Implementar `POST /api/auth/register` (fuerza rol `cliente`, BCrypt, validación).
3. Implementar `POST /api/auth/login` (verificación BCrypt, emisión JWT, chequeo `activo`).
4. Configurar Spring Security + Resource Server (HS256, authorities `ROLE_*`).
5. Implementar el catálogo público (`GET /api/productos` con filtros opcionales).
6. Implementar CRUD de catálogo para `admin` (HU-06) y el control de stock (HU-08): columna `stock`, validación ≥ 0, filtro de agotados y `GET /api/productos/admin`.
7. Implementar `GET /api/user/myInfo`, `GET /api/user/asesores`, `GET /api/user/clientesPorCorreo/:texto` y `POST /api/user/asesores` (HU-11, rol forzado `asesor`, correo único).
8. Implementar `GET /api/cita/tipoCita`.
9. Implementar `POST /api/cita/agregarCita` (cliente) y `POST /api/cita/agregarCitaAdmin` (admin).
10. Implementar `GET /api/cita` con filtros (asesor/cliente/estado) y orden por `fecha_cita`.
11. Implementar cambio de estado (`POST /api/cita/cancelarCita` y completar).
12. Implementar las reglas R-3 y R-4 (índice único parcial + validación de servicio → `409`).
13. Escribir las pruebas P01–P12 (JUnit + MockMvc).
14. Implementar `GET /api/cita/disponibilidad` (franjas de R-11) y las transiciones `aprobarCita`/`completarCita` con `observacion` (HU-09/HU-10).
15. Sembrar los 3 asesores demo y citas en los cuatro estados (ver `07-install-guide.md`).
16. Permitir cancelar/rechazar (`POST /api/cita/cancelarCita`) al cliente dueño, al asesor de la cita y al admin.
17. Implementar las **notificaciones** (`notificaciones`, `GET /api/notificaciones`, `POST /api/notificaciones/leer`), disparadas en aprobar/cancelar.
18. Implementar `GET /api/cita/disponibilidadSemana` (5 días × 7 franjas).
19. Añadir `apellido`/`telefono` a `usuarios` y el snapshot `contacto_*` en `citas` (R-15).

## Dependencias
- Modelo de datos y migraciones: `02-data-model.md`, `05-db-migrations.md`.
- Contrato de endpoints: `03-api-contract.md`.
- Convenciones de código y seguridad: `04-backend-conventions.md`.

## Evidencia esperada
- Suite de pruebas que cubra P01–P12 (salida de `mvn test`).
- Capturas/logs de los escenarios P01–P12 contra la API levantada.
- Tabla de historias de usuario con su criterio de aceptación marcado.
