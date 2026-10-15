# 03 — Contrato de API

## Objetivo
Definir la superficie REST que expone el backend (endpoints, cuerpos, respuestas, autenticación y
roles), preservando la compatibilidad con el front reutilizado.

## Convenciones generales
- **Base URL**: `http://localhost:8080` (configurable; el front apunta con `VITE_API_URL`).
- **Formato**: JSON UTF-8.
- **Auth**: `Authorization: Bearer <jwt>` (HS256). Claims: `sub` (id de usuario), `rol`, `iat`, `exp` (2 h).
- **Formato de error**: `{ "error": "<mensaje>" }`.
- **CORS**: permite el origen `http://localhost:5173`.
- **Códigos**: `200`, `201`, `400` (validación), `401` (sin/ token inválido), `403` (rol/ propiedad), `404`, `409` (conflicto de agenda), `500`.

### Compatibilidad con el front (obligatoria)
Los siguientes detalles **deben preservarse** para no tocar el parseo del front:

- Los productos exponen `id` y `categoria: { name, Subcategoria }` (**`S` mayúscula**).
- Usuarios, asesores, tipos de cita y citas exponen la clave **`_id`** (no `id`).
- Los listados van envueltos según el recurso (`usuarios`, `asesores`, `clientes`, `tiposCitas`, `citas`) y el detalle de usuario en `usuario`.
- `GET /api/productos` devuelve un **array plano**.
- Los tipos de cita exponen el campo **`type`** (la columna es `nombre`).

## Endpoints

### Autenticación
| Método | Ruta | Auth | Rol | Cuerpo | Respuesta |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | — | — | `{nombre, correo, password}` | `201 {mensaje, usuario:{nombre, correo, rol}}` |
| POST | `/api/auth/login` | — | — | `{correo, password}` | `200 {mensaje, token, usuario:{nombre, rol}}` |

- `register` **ignora** cualquier `rol` enviado y siempre crea `cliente` (R-5).
- `login` con credenciales inválidas → `401`; usuario inactivo → `403`.

### Catálogo
| Método | Ruta | Auth | Rol | Notas |
|---|---|---|---|---|
| GET | `/api/productos` | — | — | Filtros opcionales `?categoria=` y `?subcategoria=`; sin filtros devuelve todo |
| POST | `/api/productos` | Bearer | admin | Alta (HU-06) |
| PUT | `/api/productos/{id}` | Bearer | admin | Actualización (HU-06) |
| DELETE | `/api/productos/{id}` | Bearer | admin | Baja (HU-06) |

Respuesta de producto:
```json
{
  "id": 1,
  "name": "Laptop Gamer X",
  "price": 3499.00,
  "description": ["RTX 4060", "16 GB RAM"],
  "img": "https://...",
  "categoria": { "name": "laptops", "Subcategoria": "gaming" }
}
```

### Usuarios
| Método | Ruta | Auth | Rol | Respuesta |
|---|---|---|---|---|
| GET | `/api/user` | Bearer | admin | `{usuarios:[{_id, nombre, correo, rol, activo, fechaRegistro, citas}]}` (sin `password`) |
| GET | `/api/user/myInfo` | Bearer | autenticado | `{usuario:{_id, nombre, correo, rol, activo, citas:[...]}}` |
| GET | `/api/user/asesores` | Bearer | autenticado | `{asesores:[{_id, nombre}]}` |
| GET | `/api/user/clientesPorCorreo/:texto` | Bearer | admin | `{clientes:[{_id, nombre, correo}]}` |

Cita embebida en `myInfo`:
```json
{
  "_id": 12,
  "fechaCita": "2026-07-04T13:00:00Z",
  "fechaCreacion": "2026-07-01T10:00:00Z",
  "estado": "Pendiente",
  "descripcion": "...",
  "asesor": { "_id": 2, "nombre": "Ana", "correo": "asesor@servitec.pe" },
  "tipoCita": { "_id": 1, "type": "Presencial" }
}
```

### Citas
| Método | Ruta | Auth | Rol | Cuerpo / Params | Respuesta |
|---|---|---|---|---|---|
| GET | `/api/cita/tipoCita` | — | — | — | `200 {tiposCitas:[{_id, type}]}` |
| GET | `/api/cita` | Bearer | admin/asesor | `?asesorId=&clienteId=&estado=` | `200 {citas:[...]}` ordenadas por `fechaCita` asc |
| POST | `/api/cita/agregarCita` | Bearer | cliente | `{asesorId, tipoCitaId, fechaCita, descripcion?}` | `201 {mensaje, cita}` |
| POST | `/api/cita/agregarCitaAdmin` | Bearer | admin | `{clienteId, tipoCitaId, fechaCita, descripcion?}` | `201 {mensaje, cita}` |
| POST | `/api/cita/cancelarCita` | Bearer | cliente (dueño) / admin | `{citaId}` | `200 {mensaje, citaId}` |
| POST | `/api/cita/completarCita` | Bearer | admin/asesor | `{citaId}` | `200 {mensaje, citaId}` |

Reglas asociadas:
- En `agregarCita` el `clienteId` sale del token; en `agregarCitaAdmin` el `asesorId` sale del token y el `clienteId` del cuerpo.
- Todas las creaciones fuerzan `estado = Pendiente` y `fechaCreacion = now()`.
- Conflicto de agenda (R-3 / R-4) → `409` con `{error}`.
- `cancelarCita` solo permite al dueño de la cita o a un admin (si no → `403`).

## Criterios de aceptación
| Código | Verificación |
|---|---|
| P01 | `POST /api/auth/login` válido → `200` + token + rol |
| P02 | Sin token → `401`; rol insuficiente → `403` |
| P03 | `POST /api/cita/agregarCita` → `201` y persiste |
| P04 | Cita en horario ocupado → `409` |
| P05 | `POST /api/cita/cancelarCita` → `200` y estado `Cancelada` |
| P06 | `GET /api/productos?categoria=laptops` → coherente con BD |
| P07 | BD caída → `500` controlado y registrado |

## Tareas derivables
1. Implementar cada endpoint con su DTO de request/response (respetando `_id`, `type`, `Subcategoria`).
2. Configurar autorización por rol por endpoint.
3. Implementar el `@RestControllerAdvice` con el formato `{error}`.
4. Escribir las pruebas MockMvc para P01–P07.

## Dependencias
- Modelo: `02-data-model.md`. Reglas: `01-functional.md`. Convenciones: `04-backend-conventions.md`.

## Evidencia esperada
- Colección de peticiones (curl/Postman) por endpoint con su respuesta.
- Salida de las pruebas P01–P07.
