# 01 — Especificación funcional

## Objetivo
Definir el alcance funcional del prototipo SERVITEC: qué puede hacer cada actor, con qué reglas de
negocio y cómo se verifica, de forma que cada historia de usuario se convierta en tareas
implementables y testeables.

## Alcance
Módulos incluidos:

1. **Identidad y accesos** — registro, login, roles (admin, asesor, cliente), autorización por token.
2. **Catálogo** — consulta de productos por categoría y subcategoría.
3. **Citas (cliente)** — agendamiento, consulta de citas propias y cancelación.
4. **Citas (admin/asesor)** — agenda del asesor, registro de cita a nombre de un cliente y cambio de estado.
5. **Catálogo (admin)** — mantenimiento de productos (HU-06).

Fuera de alcance: pasarela de pago, carrito/checkout, telemetría diagnóstica, notificaciones por
correo, chatbot (se reutiliza tal cual desde el front).

### Actores / roles
| Rol | Descripción | Necesidades |
|---|---|---|
| `cliente` | Cliente final | Registrarse, iniciar sesión, consultar catálogo, agendar/consultar/cancelar sus citas |
| `asesor` | Técnico que atiende citas | Consultar su agenda (HU-04) |
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
- El `cliente` se toma del token (no del cuerpo).
- Si el horario ya está ocupado por el asesor, se rechaza (ver regla R-3).
- Respuesta `201` con la cita creada.

### HU-04 — Agenda del asesor
> Como **asesor** quiero consultar mi agenda para organizar mi atención.

Criterios de aceptación:
- El asesor ve únicamente las citas donde él es `asesor`.
- Las citas se devuelven ordenadas por `fecha_cita` ascendente.
- El admin puede ver la agenda de cualquier asesor.

### HU-05 — Cancelar cita
> Como **cliente** quiero cancelar una cita para liberar el horario.

Criterios de aceptación:
- La cita pasa a `estado = Cancelada`; **no se elimina** (trazabilidad).
- Solo el dueño de la cita (o un admin) puede cancelarla; otro cliente → `403`.
- Una cita ya cancelada no puede volver a cancelarse (idempotente o `409`).

### HU-06 — Mantener catálogo
> Como **administrador** quiero mantener un catálogo confiable.

Criterios de aceptación:
- Altas y cambios validados (nombre y precio requeridos, precio > 0).
- Un producto siempre pertenece a una subcategoría existente.
- Endpoints de escritura restringidos a rol `admin`.

### HU-07 — Anti-solapamiento
> Como **sistema** quiero bloquear solapamientos para evitar dobles reservas.

Criterios de aceptación:
- Dos citas del mismo asesor en el mismo instante (ambas no canceladas) no coexisten; la segunda → `409`.
- Un cliente no puede tener dos citas no canceladas en el mismo instante → `409`.

## Reglas de negocio

| ID | Regla |
|---|---|
| R-1 | Roles válidos: `admin`, `asesor`, `cliente`. Un usuario tiene exactamente un rol. |
| R-2 | Estados de cita: `Pendiente`, `Realizada`, `Cancelada`. Cancelar = cambio de estado, nunca `DELETE`. |
| R-3 | Unicidad de agenda: `(asesor_id, fecha_cita)` único entre citas no canceladas. |
| R-4 | Un cliente no puede tener dos citas no canceladas en el mismo instante. |
| R-5 | El registro público siempre crea usuarios con rol `cliente` (no se acepta `rol` del cliente). |
| R-6 | Las contraseñas se almacenan con BCrypt y **nunca** se serializan en respuestas. |
| R-7 | `fecha_cita` se maneja en UTC (`timestamptz`); el front envía ISO 8601 (`toISOString()`). |
| R-8 | Un usuario inactivo (`activo = false`) no puede iniciar sesión. |

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

## Tareas derivables

1. Modelar y crear la tabla `roles` + `usuario.rol_id`; sembrar admin/asesor/cliente.
2. Implementar `POST /api/auth/register` (fuerza rol `cliente`, BCrypt, validación).
3. Implementar `POST /api/auth/login` (verificación BCrypt, emisión JWT, chequeo `activo`).
4. Configurar Spring Security + Resource Server (HS256, authorities `ROLE_*`).
5. Implementar el catálogo público (`GET /api/productos` con filtros opcionales).
6. Implementar CRUD de catálogo para `admin` (HU-06).
7. Implementar `GET /api/user/myInfo`, `GET /api/user/asesores`, `GET /api/user/clientesPorCorreo/:texto`.
8. Implementar `GET /api/cita/tipoCita`.
9. Implementar `POST /api/cita/agregarCita` (cliente) y `POST /api/cita/agregarCitaAdmin` (admin).
10. Implementar `GET /api/cita` con filtros (asesor/cliente/estado) y orden por `fecha_cita`.
11. Implementar cambio de estado (`POST /api/cita/cancelarCita` y completar).
12. Implementar las reglas R-3 y R-4 (índice único parcial + validación de servicio → `409`).
13. Escribir las pruebas P01–P07 (JUnit + MockMvc).

## Dependencias
- Modelo de datos y migraciones: `02-data-model.md`, `05-db-migrations.md`.
- Contrato de endpoints: `03-api-contract.md`.
- Convenciones de código y seguridad: `04-backend-conventions.md`.

## Evidencia esperada
- Suite de pruebas que cubra P01–P07 (salida de `mvn test`).
- Capturas/logs de los escenarios P01–P07 contra la API levantada.
- Tabla de historias de usuario con su criterio de aceptación marcado.
