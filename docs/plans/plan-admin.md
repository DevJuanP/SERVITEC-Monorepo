# Plan 03 — Panel de administración (`apps/admin`)
> Estado: 🔄 En curso · Depende de: Plan 02 Front público (✅) · Cubre: 09 §Alcance, 09 §Stack, 09 ##Rutas, 09 ##Sesión y seguridad, 09 ##Contrato consumido, 09 ##Criterios de aceptación, 03 §Catálogo/§Usuarios/§Citas/§Notificaciones, HU-04, HU-06, HU-08, HU-11, R-2, R-9, R-10, R-11, R-12, R-13, R-14, P06, P08, P09, P11, P12, P13 · Estimación: L

## 1. Objetivo
Implementar `apps/admin` como segundo front independiente (React 19 + Vite 7, puerto 5174) que consuma la API ya verificada en F1 y cubra catálogo e inventario (solo admin), gestión de citas (admin/asesor) y usuarios/alta de asesores (solo admin), con autenticación y guardas por rol.

## 2. Alcance
- **Incluye:** andamiaje Vite/React 19 en `:5174`, `api.js` con interceptor Bearer + manejo `401`, `AuthContext` (valida con `GET /api/user/myInfo`), `ProtectedRoute`/`RoleRoute`, `AdminLayout` (sidebar según rol) + ruteo; login (solo admin/asesor; cliente rechazado) + dashboard (conteos catálogo/stock solo admin; asesor ve su agenda); catálogo e inventario contra `GET /api/productos/admin` + CRUD con `stock`; citas: agenda con filtros, `NuevaCita` (`agregarCitaAdmin`), `aprobar`/`completar`/`cancelar` con `EstadoBadge`; usuarios: listado, búsqueda de clientes (`clientesPorCorreo`), alta de asesores; verificación `npm run dev` en `:5174` + `npm run build`.
- **No incluye:** catálogo público ni marketing (front público), pasarela de pago, chatbot; extracción `packages/shared` (B-MONO, deuda diferida A1); tests/CI (deuda diferida A4); refresh token / almacenamiento seguro (deuda diferida A3).

## 3. Referencias
- Specs: `09-admin-panel.md` (criterios de aceptación), `03-api-contract.md` (contrato ya probado), `07-install-guide.md` (credenciales), `01-functional.md` (HU/R), `04-backend-conventions.md` (seguridad/CORS).
- Skills: ninguna específica del repositorio.

## 4. Precondiciones
- Plan 01 Backend ✅ con `mvnw.cmd test` en verde (P01–P13); API arrancable con CORS `:5173`/`:5174`.
- Plan 02 Front público ✅ con `npm run build` en verde; `/admin` retirado; `VITE_ADMIN_URL` enlazado en `Header`.
- Backend corriendo en `:8080` con semilla aplicada (usuarios admin/asesor/cliente, asesores, tipos de cita, disponibilidad, productos).
- Node.js 20+ y npm; `VITE_API_URL` resoluble (`.env.example`).

## 5. Tareas

### T-3.1 — Andamiaje Vite/React 19 (`apps/admin`)
- **Objetivo:** crear proyecto `apps/admin` con `server.port = 5174`, `.env.example` (`VITE_API_URL`), estructura de carpetas, `package.json` con scripts `dev`/`build`/`preview`/`lint`, `vite.config.js`, `index.html`, `src/main.jsx` (BrowserRouter + rutas), `src/App.jsx` (AdminLayout + Outlet).
- **Archivos:** crear `apps/admin/` completo (ver estructura en `09 §Estructura prevista`).
- **Pasos:** `npm create vite@latest apps/admin -- --template react` → ajustar `vite.config.js` (puerto 5174, base `/`), crear `.env.example`, crear carpetas `src/{servicios,auth,layouts,components,pages}`, copiar/portar `api.js` del front público adaptando a `VITE_API_URL` (sin `VITE_ADMIN_URL`).
- **Criterios de aceptación:** `09 §Stack`, `09 §Estructura prevista`, `09 ##Rutas` (tabla).
- **Verificación:** V0 — `cd apps/admin && npm install && npm run dev` levanta en `:5174` sin errores; V2 — checklist: carga `index.html`, redirige a `/login` si no hay token.
- **Estado:** 🔄 En curso

### T-3.2 — Autenticación y guardas
- **Objetivo:** `servicios/auth.js` (login, logout, getToken, getRol, getNombre); `AuthContext` (estado token/rol/nombre desde `localStorage`, valida contra `GET /api/user/myInfo` al montar); `ProtectedRoute` (exige token; si no → `/login`); `RoleRoute` (exige rol/es; si no → 403/página "sin acceso"); interceptor de response en `api.js`: `401` → limpiar sesión y redirigir a `/login`; `403` → toast "sin permisos".
- **Archivos:** `src/servicios/auth.js`, `src/auth/AuthContext.jsx`, `src/auth/ProtectedRoute.jsx`, `src/auth/RoleRoute.jsx`, actualizar `src/servicios/api.js`.
- **Pasos:** `09 ##Sesión y seguridad`; login en `POST /api/auth/login`; guardar `token`, `rolUsuario`, `nombreUsuario` en `localStorage` (mismas claves que front público); rechazar `cliente` en `/login`; revalidar con `GET /api/user/myInfo`.
- **Criterios de aceptación:** `09 ##Sesión y seguridad`, `09 ##Rutas` (guarda pública `/login`, redirección si hay sesión).
- **Verificación:** V0 — `npm run build`; V2 — checklist: login con `admin@servitec.pe`/`Servitec123` → dashboard; login con `cliente@servitec.pe` → rechazo; sin token → `/login`; token expirado (`401`) → logout.
- **Estado:** ⬜ Pendiente

### T-3.3 — Login y Dashboard
- **Objetivo:** `pages/login/Login.jsx` (formulario, validación, llamada a `auth.login`, toast errores, redirección a `/`); `pages/dashboard/Dashboard.jsx` (si `admin`: conteo de productos por categoría vía `GET /api/productos/admin` + alertas stock agotado; si `asesor`: resumen de su agenda vía `GET /api/cita` sin filtros); `AdminLayout` (sidebar: `admin` ve Catálogo/Citas/Usuarios; `asesor` ve solo Citas; header con usuario + logout).
- **Archivos:** `src/pages/login/Login.jsx`, `src/pages/dashboard/Dashboard.jsx`, `src/layouts/AdminLayout.jsx`, `src/components/Sidebar.jsx`, `src/components/HeaderAdmin.jsx`.
- **Pasos:** `09 ##Rutas` (`/login`, `/`); `09 ##Criterios de aceptación` (login admin/asesor, cliente rechazado; dashboard admin vs asesor).
- **Verificación:** V0 — `npm run build`; V2 — checklist: admin ve conteos por categoría + stock agotado; asesor ve solo su agenda; sidebar correcto por rol.
- **Estado:** ⬜ Pendiente

### T-3.4 — Catálogo e inventario (admin)
- **Objetivo:** `pages/catalogo/Catalogo.jsx` (DataTable contra `GET /api/productos/admin` — incluye agotados; columnas: id, name, price, stock, categoria.Subcategoria, acciones); `components/ProductoForm.jsx` (Modal: alta/edición con selects de `GET /api/categorias` para `categoria.Subcategoria`, validación `stock ≥ 0`, `price > 0`); CRUD: `POST`/`PUT`/`DELETE /api/productos/{id}`; `components/StockBadge` (verde/rojo según stock).
- **Archivos:** `src/pages/catalogo/Catalogo.jsx`, `src/components/ProductoForm.jsx`, `src/components/DataTable.jsx`, `src/components/Modal.jsx`, `src/components/StockBadge.jsx`, `src/servicios/productos.js` (CRUD admin).
- **Pasos:** `09 ##Contrato consumido` (catálogo), `09 ##Criterios de aceptación` (lista agotados, CRUD con stock ≥ 0).
- **Verificación:** V0 — `npm run build`; V3 — auditoría `03` sobre payloads/responses (`id`, `categoria: {name, Subcategoria}`, `description` array, `stock` entero); V2 — checklist: crear producto con stock 0 → aparece en tabla; editar stock → persiste; eliminar → desaparece.
- **Estado:** ⬜ Pendiente

### T-3.5 — Citas (agenda, nueva, acciones)
- **Objetivo:** `pages/citas/Citas.jsx` (DataTable con filtros asesor/cliente/estado; `GET /api/cita?asesorId=&clienteId=&estado=` ordenado por `fechaCita` asc; columnas: asesor, cliente, tipo, fecha, estado, descripción, acciones); `pages/citas/NuevaCita.jsx` (solo `admin`): busca cliente (`clientesPorCorreo`), elige asesor (`asesores`), tipo (`tipoCita`), fecha → consulta `disponibilidad` → `FranjaPicker` reutilizado → `POST /api/cita/agregarCitaAdmin` con `contacto` opcional; acciones en fila: `aprobarCita` (Pendiente→Aprobada), `completarCita` (Aprobada→Realizada, `observacion` obligatoria), `cancelarCita` (Pendiente/Aprobada→Cancelada, rechazo); `components/EstadoBadge`, `components/ConfirmDialog`, `components/FranjaPicker` (reutilizado/adaptado del front público).
- **Archivos:** `src/pages/citas/Citas.jsx`, `src/pages/citas/NuevaCita.jsx`, `src/components/EstadoBadge.jsx`, `src/components/ConfirmDialog.jsx`, `src/components/FranjaPicker.jsx` (adaptado), `src/servicios/citas.js` (agenda, disponibilidad, estados).
- **Pasos:** `09 ##Contrato consumido` (citas), `09 ##Criterios de aceptación` (filtros, nueva cita con franja libre, aprobar/concluir/cancelar, orden por `fechaCita`).
- **Verificación:** V0 — `npm run build`; V3 — auditoría `03` (payloads `_id`, `type`, estados canónicos, `observacion` obligatoria en completar); V2 — checklist: admin crea cita a cliente eligiendo franja libre → 201; asesor aprueba → notificación; asesor concluye con observación → Realizada; asesor/admin cancelan → Cancelada + notificación; filtro por asesor/cliente/estado funciona.
- **Estado:** ⬜ Pendiente

### T-3.6 — Usuarios y alta de asesores (admin)
- **Objetivo:** `pages/usuarios/Usuarios.jsx` (DataTable `GET /api/user`; columnas: nombre, correo, rol, activo, fechaRegistro; búsqueda de clientes `GET /api/user/clientesPorCorreo/:texto` con debounce; formulario alta de asesor `POST /api/user/asesores` con nombre/correo/password → valida `201` y aparece en lista y en `GET /api/user/asesores`).
- **Archivos:** `src/pages/usuarios/Usuarios.jsx`, `src/components/AsesorForm.jsx`, `src/servicios/usuarios.js`.
- **Pasos:** `09 ##Contrato consumido` (usuarios), `09 ##Criterios de aceptación` (listado, búsqueda clientes, alta asesor visible y logueable).
- **Verificación:** V0 — `npm run build`; V3 — auditoría `03` (`_id` en usuarios/asesores, `rol` forzado `asesor`); V2 — checklist: alta de asesor → login con nuevas credenciales funciona; aparece en `GET /api/user/asesores`; duplicado → `409`.
- **Estado:** ⬜ Pendiente

### T-3.7 — Verificación final del panel
- **Objetivo:** `npm run dev` en `:5174` + `npm run build` sin errores; CORS `:5174` operativo contra backend; criterios de `09 §Criterios de aceptación` todos cubiertos.
- **Archivos:** `apps/admin/**` (verificación; sin cambios de código esperados).
- **Pasos:** `09 ##Criterios de aceptación` (130–138); `09 ##Evidencia esperada`.
- **Criterios de aceptación:** `09 §Criterios de aceptación`.
- **Verificación:** V0 — `npm run build`; V2 — checklist completo (130–138); V4 — smoke test con backend real.
- **Estado:** ⬜ Pendiente

## 6. Matriz de trazabilidad del plan
| ID / sección | Tarea(s) |
|---|---|
| 09 §Alcance (módulos 1–5) | T-3.1, T-3.2, T-3.3, T-3.4, T-3.5, T-3.6 |
| 09 §Stack | T-3.1 |
| 09 ##Rutas | T-3.1, T-3.2, T-3.3 |
| 09 ##Sesión y seguridad | T-3.2 |
| 09 ##Contrato consumido | T-3.3, T-3.4, T-3.5, T-3.6 |
| 09 ##Criterios de aceptación | T-3.3, T-3.4, T-3.5, T-3.6, T-3.7 |
| 09 ##Estructura prevista | T-3.1 |
| 03 §Catálogo (admin) | T-3.4 |
| 03 §Usuarios (myInfo, asesores, clientesPorCorreo, alta asesores) | T-3.2, T-3.3, T-3.6 |
| 03 §Citas (agenda, disponibilidad, agregarCitaAdmin, estados) | T-3.3, T-3.5 |
| 03 §Notificaciones (creadas en aprobar/cancelar) | T-3.5 |
| HU-04 (Agenda del asesor) | T-3.3, T-3.5 |
| HU-06 (Mantener catálogo) | T-3.4 |
| HU-08 (Control de stock) | T-3.4 |
| HU-11 (Alta de asesores) | T-3.6 |
| R-2 (Transiciones de estado) | T-3.5 |
| R-9, R-10 (Stock, filtro agotados) | T-3.4 |
| R-11, R-12 (Franjas UTC-5, disponibilidad) | T-3.5 |
| R-13 (Observación obligatoria en conclusión) | T-3.5 |
| R-14 (Notificación en aprobación/cancelación) | T-3.5 |
| P06, P08 (Catálogo, stock) | T-3.4 |
| P09 (Agenda ordenada) | T-3.5 |
| P11 (Flujo estados con observación) | T-3.5 |
| P12 (Alta asesor) | T-3.6 |
| P13 (Cancelar por asesor/admin → notificación) | T-3.5 |

## 7. Verificación final del plan
- [ ] `npm run dev` en `:5174` levanta y consume `VITE_API_URL`.
- [ ] `npm run build` sin errores.
- [ ] Login `admin@servitec.pe` / `Servitec123` → dashboard con conteos por categoría + stock agotado.
- [ ] Login `asesor@servitec.pe` / `Servitec123` → dashboard con su agenda (sin catálogo/usuarios).
- [ ] Login `cliente@servitec.pe` → rechazado en `/login`.
- [ ] Catálogo (admin): lista agotados, CRUD con `stock ≥ 0`, `price > 0`, subcategoría válida.
- [ ] Citas: filtros por asesor/cliente/estado; orden por `fechaCita`; nueva cita con franja libre (`agregarCitaAdmin`); aprobar (`Pendiente→Aprobada`); concluir (`Aprobada→Realizada` con observación); cancelar/rechazar (`Pendiente/Aprobada→Cancelada` + notificación).
- [ ] Usuarios (admin): listado, búsqueda clientes por correo, alta de asesor → visible y logueable.
- [ ] Sin token → `/login`; `401` → logout; `403` → aviso "sin permisos".
- [ ] CORS `:5174` operativo (backend ya configurado en F1).

## 8. Registro de desvíos y decisiones
- **D-1 (2026-10-18) — Normalización a §4:** este plan se reescribe a la plantilla obligatoria del contrato (cabecera, §1–§8, IDs `T-3.M`, matriz del plan, registro). Cambio editorial de estructura; no altera alcance ni requisitos. El archivo anterior (formato legacy con fases A1–A6 y checkboxes simples) se reemplaza.
- **D-2 (2026-10-18) — Precondiciones verificadas:** F1 ✅ (`mvnw.cmd test` 14 tests verdes P01–P13), F2 ✅ (`npm run build` verde, `/admin` retirado, `VITE_ADMIN_URL` en `Header`). Backend corriendo en `:8080` con semilla. F3 habilitada.