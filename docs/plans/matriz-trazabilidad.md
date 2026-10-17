# Matriz de trazabilidad — SERVITEC

Cruza **historia de usuario → endpoint → regla → prueba → spec**, para verificar cobertura antes de
implementar y para guiar las pruebas P01–P12.

## HU → contrato → regla → prueba
| HU | Endpoint(s) | Regla(s) | Prueba(s) | Specs |
|---|---|---|---|---|
| Registro (R-5) | `POST /api/auth/register` | R-5, R-6 | P02 | 01, 03, 04 |
| HU-01 Login | `POST /api/auth/login` | R-6, R-8 | P01, P02 | 01, 03, 04 |
| HU-02 Filtrar catálogo | `GET /api/productos`, `GET /api/categorias` | R-9, R-10 | P06 | 01, 02, 03 |
| HU-03 Solicitar cita | `GET /api/cita/disponibilidad`, `/tipoCita`, `GET /api/user/asesores`, `POST /api/cita/agregarCita` | R-3, R-4, R-7, R-11, R-12 | P03, P04, P10 | 01, 03, 10 |
| HU-04 Agenda del asesor | `GET /api/cita` | R-3 | P09 | 01, 03 |
| HU-05 Cancelar / rechazar cita | `POST /api/cita/cancelarCita` (cliente/asesor dueño/admin) | R-2, R-14 | P05, P13 | 01, 03 |
| HU-06 Mantener catálogo | `GET /api/categorias`, `POST`/`PUT`/`DELETE /api/productos` | validación, R-10 | P06, P08 | 01, 02, 03 |
| HU-07 Anti-solapamiento | `POST /api/cita/agregarCita` / `agregarCitaAdmin` | R-3, R-4 | P04 | 01, 02, 03 |
| HU-08 Control de stock | `GET /api/productos`, `/api/productos/admin`, `POST`/`PUT /api/productos` | R-9, R-10 | P08 | 01, 02, 03 |
| HU-09 Aprobar cita | `POST /api/cita/aprobarCita` | R-2, R-14 | P11 | 01, 03 |
| HU-10 Concluir cita | `POST /api/cita/completarCita` | R-2, R-13 | P11 | 01, 03 |
| HU-11 Alta de asesores | `POST /api/user/asesores`, `GET /api/user/asesores` | R-5 | P12 | 01, 03 |
| HU-13 Notificaciones del cliente | `GET /api/notificaciones`, `POST /api/notificaciones/leer` | R-14 | P13 | 01, 03 |

## Prueba → verificación
| Código | Verificación | Specs |
|---|---|---|
| P01 | Login válido → token + rol | 01, 03, 04 |
| P02 | Sin token `401` / rol insuficiente `403` | 01, 03, 04 |
| P03 | Crear cita disponible → `201` + persistida | 01, 03, 10 |
| P04 | Conflicto de horario → `409` | 01, 02, 03 |
| P05 | Cancelar cita → estado `Cancelada` | 01, 03 |
| P06 | Catálogo por categoría coherente con BD | 01, 02, 03 |
| P07 | BD caída → `500` controlado y logueado | 01, 04, 05 |
| P08 | Agotado excluido de público, incluido en admin; `stock` negativo `400` | 01, 02, 03, 05 |
| P09 | Cliente ve sus citas; asesor/admin su agenda ordenada | 01, 03 |
| P10 | Disponibilidad 7 franjas; fecha malformada `400` | 01, 03 |
| P11 | `Pendiente → Aprobada → Realizada` con observación; transición inválida `409` | 01, 03 |
| P12 | Alta de asesor → `201`; visible; sin admin `403`; duplicado `409` | 01, 03 |
| P13 | Cancelar/rechazar por asesor o admin → `Cancelada` + notificación; ajena `403`; ya cancelada `409` | 01, 02, 03 |

## Reglas → dónde se garantizan
| Regla | Garantía | Specs |
|---|---|---|
| R-1, R-5 | Seguridad + registro/alta | 01, 03, 04 |
| R-2 | Transiciones de estado (servicio) | 01, 02, 03 |
| R-3 | Índice único parcial `citas` | 01, 02, 03, 05 |
| R-4 | Validación de servicio | 01, 03 |
| R-6 | BCrypt, sin serializar password | 03, 04 |
| R-7 | `timestamptz` UTC + conversión Lima | 01, 02, 03 |
| R-8 | `activo = false` bloquea login | 01, 03, 04 |
| R-9, R-10 | `stock` + filtro de agotados | 01, 02, 03 |
| R-11, R-12 | Franjas (UTC-5) + validación de `fechaCita` | 01, 03, 10 |
| R-13 | Observación obligatoria en conclusión | 01, 03 |
| R-14 | Notificación al cliente en aprobación/cancelación (correo diferido) | 01, 02, 03 |
| R-15 | Snapshot de contacto en la cita | 01, 02, 03, 10 |
