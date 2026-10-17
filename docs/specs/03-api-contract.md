# 03 — Contrato de API (back ↔ front)

## Objetivo
Definir la **superficie REST definitiva** que expone el backend (endpoints, cuerpos de request,
cuerpos de response, códigos y autenticación), preservando la compatibilidad con el front
reutilizado (`apps/front`). Este documento es la **fuente de verdad** del contrato: lo que el
backend implementa y lo que el front consume deben coincidir exactamente con lo aquí descrito.

## Convenciones generales
- **Base URL**: `http://localhost:8080` (configurable; el front apunta con `VITE_API_URL`).
- **Formato**: JSON UTF-8 (`Content-Type: application/json`).
- **Auth**: `Authorization: Bearer <jwt>` (HS256). Claims: `sub` (id de usuario), `rol`, `iat`, `exp` (2 h).
- **Formato de error**: `{ "error": "<mensaje>" }` (nunca se filtra stacktrace ni `password`).
- **CORS**: permite los orígenes `http://localhost:5173` (front público) y `http://localhost:5174` (panel admin).
- **Transporte**: HTTP en desarrollo local; HTTPS obligatorio en despliegue productivo (fuera del alcance actual; ver `07-install-guide.md`).
- **Códigos**: `200`, `201`, `400` (validación), `401` (sin token / token inválido), `403` (rol / propiedad), `404`, `409` (conflicto de agenda o duplicado), `500`.

## Compatibilidad obligatoria con el front

El front reutilizado parsea posiciones y claves concretas. El backend **debe preservarlas** tal cual:

| # | Quirk | Consumido en | Regla |
|---|---|---|---|
| C-1 | Productos exponen `id` (número) y `categoria: { name, Subcategoria }` (**`S` mayúscula**) | `servicios/productos.js:11` | `categoria.Subcategoria` literal |
| C-2 | Usuarios, asesores, tipos de cita y citas exponen la clave **`_id`** (no `id`) | `FormularioCitas.jsx`, panel admin (`apps/admin`) | `a._id`, `t._id`, `c._id` |
| C-3 | `GET /api/productos` devuelve un **array plano** (sin envoltorio) | `servicios/productos.js:5` | `response.data` es array |
| C-4 | Tipos de cita exponen el campo **`type`** (la columna es `nombre`) | `FormularioCitas.jsx:287` | `t.type` |
| C-5 | Listados envueltos por recurso: `usuarios`, `asesores`, `clientes`, `tiposCitas`, `citas`; el detalle de usuario en `usuario` | varios | `data.asesores`, `data.usuario`, … |
| C-6 | Producto expone `name`, `price`, `description` (array de strings), `img` | `Producto.jsx:7` | `description.map(...)` |
| C-7 | Cita expone `asesor.nombre`, `tipoCita.type`, `fechaCita`, `estado`, `descripcion` | `FormularioCitas.jsx:339-342` | |
| C-8 | Login responde con el mensaje **exacto** `"Login exitoso"` | `login.jsx:50` | comparación exacta de string |
| C-9 | Register responde con el mensaje **exacto** `"Usuario registrado con éxito"` | `register.jsx:42` | comparación exacta de string |
| C-10 | Citas se cancelan por **body** `{citaId}` (no por path param) | `FormularioCitas.jsx:257` | |
| C-11 | `estado` usa la nomenclatura canónica `Pendiente`/`Aprobada`/`Realizada`/`Cancelada` | `FormularioCitas.jsx:344` | cotejo contra `"Cancelada"`/`"Realizada"` |

> Cualquier cambio en `C-1`…`C-11` obliga a tocar el front; por eso son parte del contrato.

## Endpoints

### Autenticación

#### `POST /api/auth/register`
- Auth: — · Sin rol requerido.
- Request:
  ```json
  { "nombre": "Juan Pérez", "apellido": "Pérez Gómez", "correo": "juan@servitec.pe", "telefono": "999888777", "password": "secreto123" }
  ```
  Se **ignora** cualquier `rol` enviado: siempre se crea `cliente` (R-5). `apellido` y `telefono` son opcionales.
- Response `201`:
  ```json
  {
    "mensaje": "Usuario registrado con éxito",
    "usuario": { "nombre": "Juan Pérez", "correo": "juan@servitec.pe", "rol": "cliente" }
  }
  ```
- Errores: `400` validación (nombre/correo/password), `409` correo duplicado.

#### `POST /api/auth/login`
- Auth: — · Sin rol requerido.
- Request:
  ```json
  { "correo": "juan@servitec.pe", "password": "secreto123" }
  ```
- Response `200`:
  ```json
  {
    "mensaje": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "usuario": { "nombre": "Juan Pérez", "rol": "cliente" }
  }
  ```
- Errores: `400` campos faltantes, `401` credenciales inválidas, `403` usuario inactivo (`activo = false`, R-8).

### Catálogo

| Método | Ruta | Auth | Rol | Notas |
|---|---|---|---|---|
| GET | `/api/categorias` | — | — | Árbol de categorías/subcategorías (filtros y formularios) |
| GET | `/api/productos` | — | — | Filtros opcionales `?categoria=` y `?subcategoria=` (por **nombre**); **excluye agotados** (`stock = 0`, R-10) |
| GET | `/api/productos/admin` | Bearer | admin | Igual, pero **incluye agotados** (HU-08) |
| POST | `/api/productos` | Bearer | admin | Alta con `stock` (HU-06/HU-08) |
| PUT | `/api/productos/{id}` | Bearer | admin | Actualización total, incluido `stock` (HU-06/HU-08) |
| DELETE | `/api/productos/{id}` | Bearer | admin | Baja **física**; `caracteristicas` cae en cascada (HU-06) |

- `GET /api/categorias` responde `200` con el árbol de las **3 categorías y sus 12 subcategorías reales**
  de la semilla (las mismas que usan el menú del front y `getTitleCategory`):
  ```json
  {
    "categorias": [
      { "name": "laptops", "Subcategoria": ["gaming", "otras"] },
      { "name": "pc", "Subcategoria": ["combos", "profesional", "oficinas"] },
      { "name": "componentes", "Subcategoria": ["monitores", "cases", "mb", "ram", "cpus", "memorias", "otros"] }
    ]
  }
  ```
  En `/api/categorias`, `Subcategoria` es un **array de nombres**; en el payload de un producto es un
  **string** (su única subcategoría), como en C-1. Puebla los filtros del catálogo y el formulario de
  productos del panel. **No** crea categorías: el catálogo es fijo (ver `02-data-model.md`).
- **Filtros** de `GET /api/productos`: `categoria` y `subcategoria` filtran por `name` exacto; sin
  coincidencia → array vacío (nunca `404`).

- `GET /api/productos` responde `200` con **array plano**:
  ```json
  [
    {
      "id": 1,
      "name": "Laptop Gamer X",
      "price": 3499.00,
      "stock": 5,
      "description": ["RTX 4060", "16 GB RAM", "SSD 1 TB"],
      "img": "https://...",
      "categoria": { "name": "laptops", "Subcategoria": "gaming" }
    }
  ]
  ```
- Request de alta/actualización:
  ```json
  {
    "name": "Laptop Gamer X",
    "price": 3499.00,
    "stock": 5,
    "description": ["RTX 4060", "16 GB RAM"],
    "img": "https://...",
    "categoria": { "name": "laptops", "Subcategoria": "gaming" }
  }
  ```
- **Resolución de `categoria`**: el backend ubica `subcategorias.name = categoria.Subcategoria` dentro de
  la categoría `categoria.name`; si esa subcategoría no existe → `400`. El alta **no** crea categorías.
- **`description`**: en `PUT` reemplaza por completo las `caracteristicas` (posición del array = `orden`).
- Respuestas:
  ```json
  // POST → 201
  { "mensaje": "Producto registrado con éxito",
    "producto": { "id": 61, "name": "...", "price": 0, "stock": 0, "description": ["..."], "img": "...",
                  "categoria": { "name": "laptops", "Subcategoria": "gaming" } } }
  // PUT → 200    { "mensaje": "Producto actualizado con éxito", "producto": { ... } }
  // DELETE → 200 { "mensaje": "Producto eliminado con éxito" }
  ```
- Errores: `400` (`name` requerido, `price > 0`, `stock` entero ≥ 0, subcategoría inexistente), `403` sin rol admin, `404` producto inexistente.

### Usuarios

| Método | Ruta | Auth | Rol | Respuesta |
|---|---|---|---|---|
| GET | `/api/user` | Bearer | admin | `{usuarios:[{_id, nombre, correo, rol, activo, fechaRegistro, citas}]}` (sin `password`) |
| GET | `/api/user/myInfo` | Bearer | autenticado | `{usuario:{_id, nombre, correo, rol, activo, citas:[...]}}` |
| GET | `/api/user/asesores` | Bearer | autenticado | `{asesores:[{_id, nombre}]}` |
| GET | `/api/user/clientesPorCorreo/:texto` | Bearer | admin | `{clientes:[{_id, nombre, correo}]}` |
| POST | `/api/user/asesores` | Bearer | admin | `201 {mensaje, usuario:{_id, nombre, correo, rol}}` |

- `GET /api/user/myInfo` → `200`:
  ```json
  {
    "usuario": {
      "_id": 12,
      "nombre": "Juan Pérez",
      "correo": "juan@servitec.pe",
      "rol": "cliente",
      "activo": true,
      "citas": [
        {
          "_id": 40,
          "fechaCita": "2026-07-06T14:00:00Z",
          "fechaCreacion": "2026-07-01T10:00:00Z",
          "estado": "Pendiente",
          "descripcion": "Mantenimiento de laptop",
          "observacion": null,
          "contacto": { "nombre": "Juan Pérez", "apellido": "Pérez Gómez", "correo": "juan@servitec.pe", "telefono": "999888777" },
          "asesor": { "_id": 2, "nombre": "Ana", "correo": "asesor@servitec.pe" },
          "tipoCita": { "_id": 1, "type": "Presencial" }
        }
      ]
    }
  }
  ```
- `myInfo.citas`: solo el rol `cliente` trae su historial; para `asesor`/`admin` el array va **vacío**
  (su agenda se consulta con `GET /api/cita`).
- `GET /api/user/asesores` → `200`:
  ```json
  { "asesores": [ { "_id": 2, "nombre": "Ana" }, { "_id": 3, "nombre": "Luis" } ] }
  ```
- `GET /api/user/clientesPorCorreo/:texto` → `200`:
  ```json
  { "clientes": [ { "_id": 12, "nombre": "Juan Pérez", "correo": "juan@servitec.pe" } ] }
  ```
- `POST /api/user/asesores` (HU-11)
  - Request:
    ```json
    { "nombre": "Ana", "correo": "ana@servitec.pe", "password": "secreto123" }
    ```
    No acepta `rol`: siempre se fuerza `asesor` y `activo = true`.
  - Response `201`:
    ```json
    {
      "mensaje": "Asesor registrado con éxito",
      "usuario": { "_id": 7, "nombre": "Ana", "correo": "ana@servitec.pe", "rol": "asesor" }
    }
    ```
  - Errores: `400` validación, `403` sin rol admin, `409` correo duplicado.

### Citas

| Método | Ruta | Auth | Rol | Cuerpo / Params | Respuesta |
|---|---|---|---|---|---|
| GET | `/api/cita/tipoCita` | — | — | — | `200 {tiposCitas:[{_id, type}]}` |
| GET | `/api/cita/disponibilidad` | Bearer | autenticado | `?asesorId=&fecha=YYYY-MM-DD` | `200 {asesorId, fecha, franjas:[{hora, disponible}]}` |
| GET | `/api/cita/disponibilidadSemana` | Bearer | autenticado | `?asesorId=&desde=YYYY-MM-DD` | `200 {asesorId, desde, dias:[{fecha, franjas:[{hora, disponible}]}]}` |
| GET | `/api/cita` | Bearer | admin/asesor | `?asesorId=&clienteId=&estado=` | `200 {citas:[...]}` ordenadas por `fechaCita` asc |
| POST | `/api/cita/agregarCita` | Bearer | cliente | `{asesorId, tipoCitaId, fechaCita, descripcion?, contacto?}` | `201 {mensaje, cita}` |
| POST | `/api/cita/agregarCitaAdmin` | Bearer | admin | `{clienteId, asesorId, tipoCitaId, fechaCita, descripcion?, contacto?}` | `201 {mensaje, cita}` |
| POST | `/api/cita/aprobarCita` | Bearer | asesor (dueño) / admin | `{citaId}` | `200 {mensaje, citaId}` |
| POST | `/api/cita/cancelarCita` | Bearer | cliente (dueño) / asesor (dueño) / admin | `{citaId}` | `200 {mensaje, citaId}` |
| POST | `/api/cita/completarCita` | Bearer | asesor (dueño) / admin | `{citaId, observacion}` | `200 {mensaje, citaId}` |

#### `GET /api/cita/tipoCita`
- `200`:
  ```json
  { "tiposCitas": [ { "_id": 1, "type": "Presencial" }, { "_id": 2, "type": "Virtual" } ] }
  ```

#### `GET /api/cita/disponibilidad` (R-11/R-12)
- Params: `asesorId` (requerido), `fecha` en `YYYY-MM-DD` (requerido).
- `200`:
  ```json
  {
    "asesorId": 2,
    "fecha": "2026-07-06",
    "franjas": [
      { "hora": "09:00", "disponible": true },
      { "hora": "10:00", "disponible": false },
      { "hora": "11:00", "disponible": true },
      { "hora": "13:00", "disponible": true },
      { "hora": "14:00", "disponible": true },
      { "hora": "15:00", "disponible": true },
      { "hora": "16:00", "disponible": true }
    ]
  }
  ```
- 7 franjas de 1 hora (lun–vie, 09:00–17:00, hora de Lima, sin 12:00–13:00). Día no laborable → `franjas: []`.
- **Zona horaria**: la franja se calcula en **hora de Lima (UTC-5 fijo, sin horario de verano)**.
  `fechaCita` viaja en ISO 8601 UTC (R-7); el backend la convierte a UTC-5 para validar día/hora (R-12).
  El parámetro `fecha` (día) se interpreta como fecha **local de Lima**.
- Errores: `400` si falta `asesorId`/`fecha` o la fecha no cumple `YYYY-MM-DD`; `404` si el asesor no existe.

#### `GET /api/cita/disponibilidadSemana` (HU-03, R-11)
- Params: `asesorId` (requerido), `desde` en `YYYY-MM-DD` (requerido; si cae en fin de semana, la semana empieza el lunes siguiente).
- Devuelve **5 días laborables** desde `desde`, cada uno con sus 7 franjas (mismas reglas que `disponibilidad`).
- `200`:
  ```json
  {
    "asesorId": 2,
    "desde": "2026-07-06",
    "dias": [
      { "fecha": "2026-07-06", "franjas": [ { "hora": "09:00", "disponible": true }, { "hora": "10:00", "disponible": false } ] },
      { "fecha": "2026-07-07", "franjas": [ ... ] }
    ]
  }
  ```
- Errores: `400` si falta `asesorId`/`desde` o la fecha no cumple `YYYY-MM-DD`; `404` si el asesor no existe.

#### `GET /api/cita` (agenda admin/asesor, HU-04)
- Params opcionales: `asesorId`, `clienteId`, `estado`.
- El asesor solo ve sus citas: si envía `asesorId` de otro asesor → `403`; sin filtro, ve su propia
  agenda. El admin puede filtrar por cualquier asesor.
- `200`:
  ```json
  {
    "citas": [
      {
        "_id": 40,
        "fechaCita": "2026-07-06T14:00:00Z",
        "fechaCreacion": "2026-07-01T10:00:00Z",
        "estado": "Pendiente",
        "descripcion": "Mantenimiento de laptop",
        "observacion": null,
        "contacto": { "nombre": "Juan Pérez", "apellido": "Pérez Gómez", "correo": "juan@servitec.pe", "telefono": "999888777" },
        "cliente": { "_id": 12, "nombre": "Juan Pérez", "correo": "juan@servitec.pe" },
        "asesor": { "_id": 2, "nombre": "Ana", "correo": "asesor@servitec.pe" },
        "tipoCita": { "_id": 1, "type": "Presencial" }
      }
    ]
  }
  ```
- Orden ascendente por `fechaCita`. `contacto` es el snapshot de la cita (R-15).

#### Creación de cita
- `POST /api/cita/agregarCita` (cliente): el `clienteId` sale del token; el `asesorId` viene del cuerpo.
  ```json
  { "asesorId": 2, "tipoCitaId": 1, "fechaCita": "2026-07-06T14:00:00.000Z", "descripcion": "...",
    "contacto": { "nombre": "Juan Pérez", "apellido": "Pérez Gómez", "correo": "juan@servitec.pe", "telefono": "999888777" } }
  ```
  `contacto` es opcional (R-15): si se omite, se toma del perfil del cliente autenticado.
- `POST /api/cita/agregarCitaAdmin` (admin): `clienteId` y `asesorId` vienen del cuerpo (el admin elige **cliente y asesor**; no hay asesor implícito en su token).
  ```json
  { "clienteId": 12, "asesorId": 2, "tipoCitaId": 1, "fechaCita": "2026-07-06T14:00:00.000Z", "descripcion": "..." }
  ```
- Ambas fuerzan `estado = Pendiente` y `fechaCreacion = now()`; `fechaCita` en ISO 8601 UTC (R-7) y en franja válida (R-12).
- Response `201`:
  ```json
  { "mensaje": "Cita registrada con éxito", "cita": { "_id": 41, "estado": "Pendiente", "...": "..." } }
  ```
- Errores: `400` fecha fuera de franja / malformada, `409` conflicto de agenda (R-3/R-4).

#### Cambios de estado
- `POST /api/cita/aprobarCita` — asesor dueño o admin; `Pendiente → Aprobada`; otra transición → `409`; cita ajena → `403`; **crea una notificación para el cliente** (R-14).
- `POST /api/cita/cancelarCita` — cliente dueño, asesor dueño o admin; desde `Pendiente`/`Aprobada` → `Cancelada` (el **rechazo** del asesor/admin es esta misma operación); ajena → `403`; ya cancelada → `409`; **crea una notificación para el cliente** (R-14).
- `POST /api/cita/completarCita` — asesor dueño o admin; `Aprobada → Realizada`; `observacion` no vacía **obligatoria** (R-13); otra transición → `409`.
- Request/response:
  ```json
  { "citaId": 41 }                                  // cancelar / aprobar  → 200 { "mensaje": "...", "citaId": 41 }
  { "citaId": 41, "observacion": "Equipo reparado" } // completar         → 200 { "mensaje": "...", "citaId": 41 }
  ```
- Mensajes: `aprobarCita` → `"Cita aprobada"`; `cancelarCita` → `"Cita cancelada"`; `completarCita` →
  `"Cita concluida"`; `agregarCita`/`agregarCitaAdmin` → `"Cita registrada con éxito"`.

### Notificaciones

| Método | Ruta | Auth | Rol | Cuerpo / Params | Respuesta |
|---|---|---|---|---|---|
| GET | `/api/notificaciones` | Bearer | autenticado | — | `200 {notificaciones:[...]}`, más recientes primero |
| POST | `/api/notificaciones/leer` | Bearer | autenticado | `{notificacionId}` o `{todas: true}` | `200 {mensaje}` |

- Se crean automáticamente al **aprobar** o **cancelar/rechazar** una cita (destinatario = `cliente_id`, R-14).
- `GET /api/notificaciones` → `200`:
  ```json
  {
    "notificaciones": [
      { "_id": 5, "tipo": "Cancelada", "mensaje": "Tu cita fue cancelada",
        "leida": false, "fecha": "2026-07-01T10:05:00Z", "citaId": 41 }
    ]
  }
  ```
- `POST /api/notificaciones/leer`:
  ```json
  { "notificacionId": 5 }   // ≥ marca una como leída
  { "todas": true }         // ≥ marca todas las del usuario
  ```
  `200 { "mensaje": "Notificaciones actualizadas" }`.
- Errores: `403` si la notificación no pertenece al usuario; `404` si no existe.

## Desajustes y su resolución

El panel de gestión de citas deja de vivir en el front público: se retiran la ruta `/admin` y el
archivo `CitaAdmin.jsx`, y se implementa el panel `apps/admin` (ver `09-admin-panel.md`). Por eso
D-1…D-3 **se resuelven construyendo el panel** con las formas canónicas; D-4 sigue en el front público.

| # | Origen (histórico) | Situación anterior | Resolución |
|---|---|---|---|
| D-1 | `CitaAdmin.jsx:78` | `agregarCitaAdmin` enviaba `{nombreCliente, clienteId, tipoCita, fechaAtencion, descripcion}` | En `apps/admin` se envía `{clienteId, asesorId, tipoCitaId, fechaCita, descripcion}` |
| D-2 | `CitaAdmin.jsx:17` | tabla con datos mock y `cita.id`/`cita.asesorId` | El panel consume `GET /api/cita` y usa `_id`/`cita.asesor._id` |
| D-3 | `CitaAdmin.jsx:39-44` | `cancelarCitaAction`/`completarCitaAction` mutaban estado local | El panel llama a `aprobarCita`/`completarCita`/`cancelarCita` reales |
| D-4 | `servicios/productos.js` (chatbot del front) | usa `public/productos.json` | Fuente única = `GET /api/productos` (deuda B13 de `06`) |

## Criterios de aceptación
| Código | Verificación |
|---|---|
| P01 | `POST /api/auth/login` válido → `200` + `mensaje "Login exitoso"` + token + rol |
| P02 | Sin token → `401`; rol insuficiente → `403` |
| P03 | `POST /api/cita/agregarCita` → `201` y persiste |
| P04 | Cita en horario ocupado → `409` |
| P05 | `POST /api/cita/cancelarCita` → `200` y estado `Cancelada` |
| P06 | `GET /api/productos?categoria=laptops` → coherente con BD (array plano) |
| P07 | BD caída → `500` controlado y registrado |
| P08 | Producto agotado excluido de `/api/productos` e incluido en `/api/productos/admin`; `stock` negativo → `400` |
| P09 | `GET /api/cita` y `myInfo` → el cliente ve sus citas y el asesor/admin la agenda, ordenadas por `fechaCita` |
| P10 | `GET /api/cita/disponibilidad` → 7 franjas con las ocupadas marcadas; fecha malformada → `400` |
| P11 | Flujo `Pendiente → Aprobada → Realizada` con observación persistida; transición inválida → `409` |
| P12 | `POST /api/user/asesores` → `201` con rol `asesor`; visible en `GET /api/user/asesores`; sin admin → `403`; correo duplicado → `409` |
| P13 | `POST /api/cita/cancelarCita` por asesor o admin → `200`, estado `Cancelada` y notificación creada; cita ajena → `403`; ya cancelada → `409` |

## Tareas derivables
1. Implementar cada endpoint con su DTO de request/response (respetando `_id`, `type`, `Subcategoria`).
2. Fijar los mensajes exactos de `login` (`"Login exitoso"`) y `register` (`"Usuario registrado con éxito"`).
3. Configurar autorización por rol por endpoint.
4. Implementar el `@RestControllerAdvice` con el formato `{error}`.
5. Escribir las pruebas MockMvc para P01–P13.
6. Implementar `apps/admin` con las formas canónicas (resuelve D-1…D-3) y unificar la fuente de productos del chatbot (D-4, B13 de `06`).
7. Implementar `GET /api/categorias` (árbol) para los filtros del catálogo y el formulario del panel.
8. Ampliar `POST /api/cita/cancelarCita` (cliente/asesor dueño/admin) y crear notificaciones en aprobar/cancelar (R-14).
9. Implementar `GET /api/cita/disponibilidadSemana` (5 días × 7 franjas).
10. Implementar `GET /api/notificaciones` y `POST /api/notificaciones/leer`.
11. Aceptar `contacto` opcional en `agregarCita`/`agregarCitaAdmin` y devolver `contacto` en las citas (R-15).

## Dependencias
- Modelo: `02-data-model.md`. Reglas: `01-functional.md`. Convenciones: `04-backend-conventions.md`.
- Consumo del front: `06-front-adaptation.md`. Panel admin: `09-admin-panel.md`.

## Evidencia esperada
- Colección de peticiones (curl/Postman) por endpoint con su respuesta.
- Salida de las pruebas P01–P13.
