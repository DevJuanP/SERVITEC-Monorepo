# 06 — Adaptación del front y backlog de deuda técnica

## Objetivo
Documentar la **adaptación mínima** aplicada al front reutilizado (`apps/front`) para apuntarlo al
backend nuevo y alinear el contrato, y dejar registrada toda la deuda técnica diferida.

## Alcance
Front React 19 + Vite copiado desde `SERVITEC-Front`. Se adapta solo lo necesario para el contrato;
**no** se refactoriza la deuda.

## Cambios aplicados

| # | Cambio | Archivos |
|---|---|---|
| 1 | Nuevo **cliente HTTP único** `api.js` (baseURL `VITE_API_URL`, timeout 10 s, interceptor que inyecta `Authorization: Bearer`) | `src/servicios/api.js` *(nuevo)* |
| 2 | Se eliminan las URLs hardcodeadas `http://localhost:3000` | `src/servicios/productos.js`, `src/pages/logReg/login.jsx`, `src/pages/logReg/register.jsx`, `src/pages/citas/FormularioCitas.jsx`, `src/pages/citaAdmin/CitaAdmin.jsx` |
| 3 | Se eliminan los headers `Authorization` manuales (los pone el interceptor) | login, FormularioCitas, CitaAdmin |
| 4 | `register` deja de enviar `rol` (el backend lo fuerza a `cliente`, R-5) | `src/pages/logReg/register.jsx` |
| 5 | Endpoint de creación de cita del admin alineado: `/api/cita/crear` → **`/api/cita/agregarCitaAdmin`** | `src/pages/citaAdmin/CitaAdmin.jsx` |
| 6 | El panel admin carga los **tipos de cita reales** (`GET /api/cita/tipoCita`); antes el select estaba siempre vacío | `src/pages/citaAdmin/CitaAdmin.jsx` |
| 7 | Estados alineados a la nomenclatura canónica: `cancelado`→`Cancelada`, `Completada`→`Realizada`; se elimina el filtro muerto por `"eliminado"` | FormularioCitas, CitaAdmin |
| 8 | El enlace ADMIN también se muestra al rol **`asesor`** (HU-04) | `src/componentes/header/Header.jsx` |
| 9 | `getByCategory` usa comparación estricta (`===`) | `src/servicios/productos.js` |
| 10 | Se corrigen `console.log` de depuración en los puntos de llamada modificados y el estado vacío de la tabla admin | varios |
| 11 | Nueva configuración de entorno (`VITE_API_URL`) | `.env.example` *(nuevo)* |

## Configuración
- `apps/front/.env.example` → `VITE_API_URL=http://localhost:8080`.
- `api.js` usa `import.meta.env.VITE_API_URL` con fallback a `http://localhost:8080`.
- El token sigue guardándose en `localStorage` (clave `token`), `nombreUsuario` y `rolUsuario`.

## Contrato consumido por el front
`/api/auth/login`, `/api/auth/register`, `/api/productos`, `/api/user/myInfo`, `/api/user/asesores`,
`/api/user/clientesPorCorreo/:texto`, `/api/cita/tipoCita`, `/api/cita/agregarCita`,
`/api/cita/agregarCitaAdmin`, `/api/cita/cancelarCita`.

El front depende de estas formas: `categoria.Subcategoria` (S mayúscula), `_id` en usuarios/asesores/tipos/citas, `tipoCita.type`, y listados envueltos (`asesores`, `tiposCitas`, `usuario`). El backend debe preservarlas (ver `03-api-contract.md`).

## Backlog de deuda técnica (diferido)
| # | Deuda | Severidad | Impacto |
|---|---|---|---|
| B1 | Sin guardas de ruta; `/admin` accesible por URL sin rol | Alta | Seguridad (mitigado por autorización en backend) |
| B2 | Token e identidad en `localStorage` (XSS, sin expiración) | Alta | Seguridad |
| B3 | Imports con mayúsculas incorrectas (`App.jsx` → `header.jsx`; `main.jsx` → `pages/Locales/Locales.jsx`) | Alta | Rompe builds en Linux/CI |
| B4 | Sin error boundary ni ruta `*` (404) | Alta | UX/robustez |
| B5 | Panel admin sigue renderizando **datos mock** (`citasData.js`); falta conectarlo a `GET /api/cita` y a cancelar/completar reales | Alta | Trazabilidad |
| B6 | Bugs del PDF (el alto de fila se calcula sobre la columna equivocada) | Media | Reporte |
| B7 | Sin manejo de 401/expirado; `alert()` en auth y admin | Media | UX |
| B8 | `styled-components@4` (dependencia muerta) + `@types` | Media | Mantenimiento/React 19 |
| B9 | Código muerto (`citas` state en FormularioCitas, datos mock, `tiposCitasList` ya resuelto) | Media | Mantenimiento |
| B10 | Sin `React.lazy` de rutas ni import dinámico de `jspdf` | Media | Performance |
| B11 | Accesibilidad: dropdowns no focusables, `lang="en"`, alts vacíos, FAB sin `aria-label` | Media | Accesibilidad |
| B12 | Enlaces muertos en `MapSite.jsx`/`Servicios.jsx`; CTAs sin handler; `/img/*` inexistentes | Media | UX |
| B13 | Doble fuente de productos (API vs `public/productos.json` del chatbot) | Media | Consistencia |
| B14 | Sin tests ni CI en el front | Media | Calidad |
| B15 | `console.log` restantes en otras zonas | Baja | Ruido |

> Cada ítem puede convertirse en un plan de ejecución propio cuando se decida abordarlo.

## Criterios de aceptación
- El front no contiene ninguna URL `localhost` hardcodeada.
- Toda llamada HTTP pasa por `api.js`.
- `npm run dev` levanta el front apuntando a `VITE_API_URL`.

## Tareas derivables
1. *(Hecho)* Cliente único + env.
2. *(Hecho)* Alineación de endpoints, roles y estados.
3. Conectar el panel admin a la API real (B5) — requiere `GET /api/cita` del backend.
4. Abordar B3 (case-sensitive) y B4 antes de cualquier despliegue.
5. Abordar B1/B2 cuando se cierre el alcance de seguridad.

## Dependencias
- Contrato de API: `03-api-contract.md`. Backend: `04-backend-conventions.md`.

## Evidencia esperada
- Diff de los archivos adaptados.
- `grep "localhost:3000" src/` → sin resultados.
- Captura del front levantado consumiendo `VITE_API_URL`.
