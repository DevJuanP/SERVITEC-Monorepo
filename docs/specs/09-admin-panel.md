# 09 — Panel de administración (segundo front)

## Objetivo
Definir el **panel de administración** de SERVITEC como un **segundo frontend** independiente
(`apps/admin`) con el mismo stack del front público (React 19 + Vite 7). Cubre catálogo e inventario,
gestión de citas y alta de asesores, y sustituye la página provisional `CitaAdmin.jsx` que hoy vive
dentro del front público.

## Decisión de arquitectura
- **Dos SPAs independientes** que consumen la **misma API** (`VITE_API_URL`): `apps/front` (público) y `apps/admin` (administración).
- `apps/admin` es **autónomo** (su propio `package.json`, Vite y despliegue), **sin workspaces npm por ahora**.
- **Deuda diferida (B-MONO):** extraer a futuro un paquete `packages/shared` (cliente axios, contexto de auth, constantes de estados/roles, formatters) mediante **npm workspaces** para eliminar la duplicación entre ambos fronts.

> Por qué un segundo front y no rutas admin en el público: separa superficie y despliegue (el panel no se publica al cliente final), evita arrastrar el layout/marketing público al panel y reduce el bundle de ambos.

## Alcance
Módulos:
1. **Autenticación y sesión** — login (admin/asesor), guardas de ruta por rol, cierre de sesión y manejo de `401`/`403`.
2. **Dashboard** — resumen de citas por estado, **conteo de productos por categoría** (calculado desde `GET /api/productos/admin`) y alertas de stock agotado.
3. **Catálogo e inventario** — CRUD de productos y control de `stock` (incluye agotados).
4. **Citas** — agenda con filtros, creación a nombre de un cliente, aprobar, cancelar/rechazar, concluir con observación; consulta de disponibilidad (día y semana).
5. **Usuarios** — listado, búsqueda de clientes por correo y **alta de asesores**.

Fuera de alcance: catálogo público y navegación de marketing (front público), pasarela de pago, chatbot.

### Roles y visibilidad
| Rol | Acceso |
|---|---|
| `admin` | Todos los módulos (catálogo, citas, usuarios, dashboard) |
| `asesor` | Solo **Citas** (su propia agenda + disponibilidad) y dashboard de su agenda. **Sin** catálogo ni usuarios |

## Stack
| Capa | Tecnología |
|---|---|
| UI | React 19 + Vite 7 (JS) |
| Ruteo | `react-router-dom` 7 |
| HTTP | `axios` (cliente único con interceptor `Bearer`) |
| Notificaciones | `react-toastify` |
| Puerto dev | `5174` (el público usa `5173`) |
| API | `VITE_API_URL` (por defecto `http://localhost:8080`) |

## Estructura prevista de `apps/admin`
```
apps/admin/
├─ package.json         name "servitec-admin"; scripts dev/build/lint/preview
├─ vite.config.js       server.port = 5174
├─ .env.example         VITE_API_URL=http://localhost:8080
├─ index.html
└─ src/
   ├─ main.jsx          BrowserRouter + rutas
   ├─ App.jsx           AdminLayout (guardas + Outlet)
   ├─ servicios/
   │  ├─ api.js         cliente axios + interceptor Bearer + manejo 401   (equivalente a apps/front)
   │  ├─ auth.js        login, logout, getToken, getRol, getNombre
   │  ├─ productos.js   CRUD catálogo (admin)
   │  ├─ citas.js       agenda, disponibilidad, cambios de estado
   │  └─ usuarios.js    listado, clientesPorCorreo, alta de asesores
   ├─ auth/
   │  ├─ AuthContext.jsx      estado de sesión (token/rol/nombre) desde localStorage
   │  ├─ ProtectedRoute.jsx   exige token; si no → /login
   │  └─ RoleRoute.jsx        exige rol(es); si no → 403/página "sin acceso"
   ├─ layouts/AdminLayout.jsx  sidebar (según rol) + header con usuario + Outlet
   ├─ components/              DataTable, Modal, ConfirmDialog, StockBadge, EstadoBadge, ProductoForm, CitaForm, DisponibilidadPicker
   └─ pages/
      ├─ login/Login.jsx
      ├─ dashboard/Dashboard.jsx
      ├─ catalogo/Catalogo.jsx        (tabla + alta/edición/baja + stock)
      ├─ citas/Citas.jsx              (agenda + filtros + acciones)
      ├─ citas/NuevaCita.jsx          (agregarCitaAdmin + disponibilidad)
      └─ usuarios/Usuarios.jsx        (listado, búsqueda clientes, alta de asesores)
```

## Rutas
| Ruta | Página | Guarda |
|---|---|---|
| `/login` | Login | pública |
| `/login` → `/` | redirección si ya hay sesión | — |
| `/` | Dashboard | token |
| `/citas` | Agenda de citas | token (`admin`, `asesor`) |
| `/citas/nueva` | Nueva cita (a nombre de cliente) | `admin` |
| `/catalogo` | Catálogo e inventario | `admin` |
| `/usuarios` | Usuarios y alta de asesores | `admin` |
| `*` | 404 | — |

- Las guardas son **defensa en profundidad del lado cliente**; la autorización real la impone el backend (ver `04-backend-conventions.md`).

## Sesión y seguridad (front)
- Login en `POST /api/auth/login`; se guardan `token`, `rolUsuario` y `nombreUsuario` en `localStorage` (mismas claves que el front público).
- Interceptor de request inyecta `Authorization: Bearer <jwt>`.
- Interceptor de response: `401` → limpiar sesión y redirigir a `/login`; `403` → aviso "sin permisos".
- Al montar, si hay token se valida contra `GET /api/user/myInfo` (revalida vigencia y rol).
- `admin`/`asesor` son los únicos roles admitidos; un `cliente` autenticado se rechaza en `/login`.
- Contraseñas nunca se persisten; la sesión se cierra al expirar el JWT (2 h).

## Contrato consumido (ver `03-api-contract.md`)
| Uso | Endpoint | Rol |
|---|---|---|
| Login | `POST /api/auth/login` | — |
| Sesión | `GET /api/user/myInfo` | autenticado |
| Catálogo | `GET /api/productos/admin`, `POST /api/productos`, `PUT /api/productos/{id}`, `DELETE /api/productos/{id}` | admin |
| Categorías | `GET /api/categorias` | — |
| Agenda | `GET /api/cita?asesorId=&clienteId=&estado=` | admin/asesor |
| Tipos | `GET /api/cita/tipoCita` | — |
| Asesores | `GET /api/user/asesores` | autenticado |
| Disponibilidad | `GET /api/cita/disponibilidad?asesorId=&fecha=`, `GET /api/cita/disponibilidadSemana?asesorId=&desde=` | autenticado |
| Nueva cita | `POST /api/cita/agregarCitaAdmin` → `{clienteId, asesorId, tipoCitaId, fechaCita, descripcion?}` | admin |
| Estados | `POST /api/cita/aprobarCita` · `completarCita` · `cancelarCita` | asesor dueño / admin |
| Usuarios | `GET /api/user`, `GET /api/user/clientesPorCorreo/:texto`, `POST /api/user/asesores` | admin |

- Compatibilidad obligatoria del contrato: `_id` en usuarios/asesores/tipos/citas, `tipoCita.type`, `categoria.Subcategoria`, `estado` canónico (C-1…C-11).
- Endpoints que **no** usa el panel (permanecen en el front público): `POST /api/auth/register`, `GET /api/productos` (catálogo público), `POST /api/cita/agregarCita`.
- La vista **Nueva cita** elige **cliente y asesor** (`GET /api/user/clientesPorCorreo/:texto` + `GET /api/user/asesores`) y consulta las franjas con `GET /api/cita/disponibilidad` (que también usa el formulario del cliente en el front público, deuda B16).

## Relación con el front público
- **Se retira** la ruta `/admin` y la página `apps/front/src/pages/citaAdmin/CitaAdmin.jsx` del front público.
- El `Header` público, para `admin`/`asesor`, enlaza al panel mediante `VITE_ADMIN_URL` (nueva variable; por defecto `http://localhost:5174`).
- **Backend/CORS:** los orígenes permitidos son `http://localhost:5173` (público) y `http://localhost:5174` (panel); ver `03-api-contract.md` y `04-backend-conventions.md`.

## Backlog del panel (nuevo)
| # | Deuda | Severidad | Impacto |
|---|---|---|---|
| A1 | `apps/admin` autónomo duplica `api.js`/auth respecto del público | Media | Mantenimiento → extraer `packages/shared` (B-MONO) |
| A2 | Guardas de ruta solo en cliente; el rol lo impone el backend | Media | Mitigado por autorización del backend |
| A3 | Token en `localStorage` (XSS, sin refresh) | Alta | Seguridad |
| A4 | Sin tests ni CI del panel | Media | Calidad |

> La deuda B5/B16/B17 de `06-front-adaptation.md` (panel admin con mock, franjas, alta de asesores) **se traslada a este panel**.

## Criterios de aceptación
- `npm run dev` en `apps/admin` levanta en `:5174` y consume `VITE_API_URL`.
- Login de `admin@servitec.pe` y `asesor@servitec.pe`; un `cliente` es rechazado.
- El `asesor` no ve Catálogo ni Usuarios; el `admin` ve todos los módulos.
- Catálogo lista también agotados y permite crear/editar/eliminar y ajustar `stock` (validación ≥ 0).
- Citas: filtrar por asesor/cliente/estado; crear a nombre de un cliente **eligiendo asesor, cliente, tipo y franja libre**; aprobar, cancelar/rechazar, concluir con observación; la lista queda ordenada por `fechaCita`.
- Dashboard: muestra el conteo de productos por categoría y las alertas de stock agotado.
- Alta de asesor (`POST /api/user/asesores`) → aparece en `GET /api/user/asesores` y puede iniciar sesión.
- Sin token → redirección a `/login`; `401` → cierre de sesión; `403` → aviso.
- El front público ya no expone `/admin`.

## Tareas derivables
1. Crear `apps/admin` (Vite + React 19) con `server.port=5174` y `.env.example`.
2. Portar `api.js` con interceptor `Bearer` + manejo de `401`.
3. Implementar `AuthContext` y las guardas `ProtectedRoute`/`RoleRoute`.
4. Construir `AdminLayout` (sidebar por rol) y los componentes de tabla/modal/formularios.
5. Implementar login y dashboard.
6. Implementar Catálogo (CRUD + stock) contra `/api/productos/admin`.
7. Implementar Citas (agenda, filtros, nueva cita, aprobar/concluir/cancelar-rechazar, disponibilidad semanal).
8. Implementar Usuarios (listado, búsqueda de clientes, alta de asesores).
9. Retirar `/admin` del front público y enlazar `VITE_ADMIN_URL` desde el `Header`.
10. Configurar el CORS del backend para `:5173` y `:5174` (ver `04-backend-conventions.md`).
11. *(Futuro)* Extraer `packages/shared` con npm workspaces (B-MONO/A1).

## Dependencias
- Contrato: `03-api-contract.md`. Seguridad/CORS: `04-backend-conventions.md`.
- Adaptación del front: `06-front-adaptation.md`. Reglas y HUs: `01-functional.md`.
- Instalación/credenciales: `07-install-guide.md`.

## Evidencia esperada
- `apps/admin` levantado consumiendo `VITE_API_URL`.
- Capturas de login, catálogo (con agotados), citas (aprobación/conclusión) y alta de asesor.
- `npm run build` del panel sin errores.
