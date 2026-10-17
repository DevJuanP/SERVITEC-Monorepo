# Plan — Panel de administración (`apps/admin`)

Espejo de `09-admin-panel.md`. Segundo front independiente (React 19 + Vite 7) en el puerto `5174`,
autónomo (sin workspaces). Consume la misma API (`VITE_API_URL`).

## Fase A1 — Andamiaje
- [ ] Crear `apps/admin` (Vite + React 19) con `server.port = 5174` y `.env.example` (`VITE_API_URL`).
- [ ] `api.js` (axios + interceptor `Bearer` + manejo `401` → logout/redirect).
- [ ] `AuthContext`, `ProtectedRoute`, `RoleRoute`; `AuthContext` valida contra `GET /api/user/myInfo`.
- [ ] `AdminLayout` (sidebar según rol) + `index.html` + ruteo (`react-router-dom` 7).

## Fase A2 — Auth y dashboard
- [ ] `Login.jsx` (`POST /api/auth/login`; solo `admin`/`asesor`; `cliente` rechazado).
- [ ] `Dashboard.jsx` (resumen de citas por estado + alertas de stock agotado).

## Fase A3 — Catálogo e inventario
- [ ] `Catalogo.jsx` contra `GET /api/productos/admin` (incluye agotados) con `StockBadge`.
- [ ] `ProductoForm.jsx` con selects de `GET /api/categorias`; `POST`/`PUT`/`DELETE` (validación `stock ≥ 0`, `price > 0`).

## Fase A4 — Citas
- [ ] `Citas.jsx`: `GET /api/cita` con filtros asesor/cliente/estado; orden por `fechaCita`.
- [ ] `NuevaCita.jsx`: cliente (`clientesPorCorreo`) + asesor (`asesores`) + tipo + franja (`disponibilidad`) → `agregarCitaAdmin`.
- [ ] Acciones `aprobarCita` / `completarCita` (observación obligatoria) / `cancelarCita` con `EstadoBadge`.

## Fase A5 — Usuarios
- [ ] `Usuarios.jsx`: `GET /api/user`, búsqueda de clientes (`clientesPorCorreo`) y alta de asesores (`POST /api/user/asesores`).

## Fase A6 — Verificación
- [ ] `npm run dev` en `:5174` y `npm run build` sin errores.
- [ ] `asesor` no ve Catálogo/Usuarios; `admin` ve todo.

## DoD panel
- Criterios de aceptación de `09-admin-panel.md` cumplidos.
- CORS `:5174` operativo contra el backend.

## Deuda diferida (fuera de alcance)
- A1 → extraer `packages/shared` (B-MONO); A2 guardas solo cliente (mitigado en backend);
  A3 token en `localStorage`; A4 sin tests/CI.

## Evidencia
- Capturas de login, catálogo con agotados, citas (aprobación/conclusión) y alta de asesor.
