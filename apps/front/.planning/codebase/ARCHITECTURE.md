# Architecture

## Overview

SERVITEC-Front (`pf-edw-servitec`) is a React 19 + Vite SPA for SERVITEC, a Peruvian
computer/laptop/components retailer with repair services. It is a marketing +
catalog + appointment-scheduling frontend backed by an external REST API at
`http://localhost:3000` (no backend code in this repo).

Entry point flow:

```
index.html (#root + /src/main.jsx)
  → src/main.jsx (createRoot, BrowserRouter + Routes, layout route <App/>)
    → src/App.jsx (Header, home-only banner, <Outlet/>, Servi chatbot, Footer)
      → route page from src/pages/… (Home, Productos, FormularioCitas, …)
```

- `index.html` mounts `#root` and loads `/src/main.jsx` as an ES module.
- `src/main.jsx` defines all routes inline (there is no separate router file);
  `App` is the layout route and every page renders through `<Outlet/>`.
- `src/App.jsx` always mounts `Header` (`src/componentes/header/Header.jsx`),
  `Servi` chatbot (`src/componentes/bot/chatBot.jsx`), and `Footer`
  (`src/componentes/footer/Footer.jsx`). It also renders a hero banner image
  only when `useLocation().pathname === '/'`.
- Global shell styles: `src/index.css` (body reset, `min-width: 1200px`) and
  `src/App.css` (`#root` background `#FFF3E0`, banner, `main` min-height).

## Layers

**Routing layer** — `src/main.jsx` only. `BrowserRouter` + `Routes` with one
layout route (`path="/" element={<App/>}`) and 12 child routes:

| Path | Element | Source |
|---|---|---|
| `/` (index) | `Home` | `src/pages/home/Home.jsx` |
| `/delivery` | `Delivery` | `src/pages/delivery/Delivery.jsx` |
| `/locales` | `Locales` | `src/pages/locales/Locales.jsx` |
| `/negocio` | `Negocio` | `src/pages/negocio/Negocio.jsx` |
| `/pago` | `Pago` | `src/pages/pago/Pago.jsx` |
| `/servicios` | `Sevicios` (sic, typo in import) | `src/pages/servicios/Servicios.jsx` |
| `/productos/:categoria` | `Productos` | `src/pages/productos/Productos.jsx` |
| `/citas` | `FormularioCitas` | `src/pages/citas/FormularioCitas.jsx` |
| `/login` | `Login` | `src/pages/logReg/login.jsx` |
| `/register` | `Register` | `src/pages/logReg/register.jsx` |
| `/mapsite` | `MapSite` | `src/pages/mapSite/MapSite.jsx` |
| `/admin` | `CitaAdmin` | `src/pages/citaAdmin/CitaAdmin.jsx` |

There are no route guards — role gating is UI-only in the header (see State).

**Pages/views** — `src/pages/` has 11 folders, one per route (plus shared
`citas/citasData.js` mock data and `citas/asesores.js` static advisor list).
Pages fall into three kinds: (1) static informational (`Home`, `Delivery`,
`Locales`, `Negocio`, `Pago`, `Servicios`, `MapSite`), (2) data-driven catalog
(`Productos` + `componentes/Producto/Producto.jsx` card), (3) authenticated
workflows (`login`/`register`, `citas/FormularioCitas`, `citaAdmin/CitaAdmin`).

**Components** — `src/componentes/` has 4 units, no shared UI kit:
- `header/Header.jsx` — logo, login/user block, full nav with CSS-only catalog
  dropdown (`NavLink` to `/productos/<categoria>_<sub>`), role-conditional
  `CITAS` (cliente) / `ADMIN` (admin) links.
- `footer/Footer.jsx` — contact info + `Link to="/mapSite"`.
- `Producto/Producto.jsx` — presentational catalog card (image, name,
  description list, price, `COMPRAR AHORA` button with no handler).
- `bot/chatBot.jsx` — `Servi` floating assistant (see Key Flows). Mounted on
  every page via `App.jsx`.

**State management** — no Context, Redux, Zustand, or React Query. All state is
local `useState` + `useEffect` per page plus props drilling (`Producto`
receives `producto` prop). Auth/session state lives in `localStorage`
(`token`, `nombreUsuario`/`authUserName`, `rolUsuario`) and is read
synchronously on render (not reactive).

**Data-access/services** — `src/servicios/productos.js` is the only service
module: `getProducts()` (axios GET `http://localhost:3000/api/productos`),
`getByCategory(category, productos)` (matches
`categoria.name + "_" + categoria.Subcategoria` against the URL param),
`getTitleCategory(category)` (param → display title switch). All other API
calls are inline axios calls inside pages (`login.jsx`, `register.jsx`,
`FormularioCitas.jsx`, `CitaAdmin.jsx`) with hardcoded
`http://localhost:3000/api/…` URLs and per-call `Authorization: Bearer` headers
— there is no shared axios instance, base-URL config, or env variable.

**Styling approach** — plain CSS files co-located with each component/page
(e.g. `header/header.css`, `pages/pago/Pago.css`), plus heavy use of inline
`style={{…}}` props (`Servicios.jsx`, `Locales.jsx`, `Home.jsx` banner margins,
`chatBot.jsx` floating button/panel). `styled-components@4.4.1` is declared in
`package.json` but **never imported anywhere in `src/`** (dead dependency).
Supporting libs: `react-chatbot-kit` (chat), `jspdf` (PDF export),
`react-toastify` (toasts), `react-router-dom@7`.

## Key Flows

### 1. Catalog browsing — Header → Productos → Producto card
1. User opens the `CATÁLOGO` dropdown in `componentes/header/Header.jsx` and
   clicks e.g. `NavLink to="/productos/laptops_gaming"`.
2. Router (`src/main.jsx`) renders `pages/productos/Productos.jsx`; `useParams`
   gives `categoria = "laptops_gaming"`.
3. `useEffect [categoria]` calls `getProducts()` from
   `src/servicios/productos.js` → axios GET
   `http://localhost:3000/api/productos`.
4. `getByCategory(categoria, data)` filters on
   `p.categoria.name + "_" + p.categoria.Subcategoria`; `getTitleCategory`
   renders the `<h1>` (e.g. `LAPTOPS GAMER`).
5. Each result renders `componentes/Producto/Producto.jsx` (image, specs,
   `s/ {price}.00`, `COMPRAR AHORA` — currently a no-op button). Empty results
   show `No products found`.

### 2. Auth + role-gated nav — login/register → Header → citas/admin
1. `pages/logReg/register.jsx` POSTs
   `http://localhost:3000/api/auth/register` with `{nombre, correo, password,
   rol: "cliente"}` (role hardcoded), then navigates to `/login`.
2. `pages/logReg/login.jsx` POSTs `/api/auth/login`, stores `token`,
   `nombreUsuario`, `rolUsuario` in `localStorage`, then navigates to `/`.
3. `componentes/header/Header.jsx` reads those keys on render: logged-in users
   see name + `Cerrar sesión` (clears keys, navigates `/login`); `rol ===
   'cliente'` reveals `CITAS`, `rol === 'admin'` reveals `ADMIN`. No router
   guard blocks direct URL access to `/citas` or `/admin`.

### 3. Client appointment scheduling + PDF — FormularioCitas
1. `pages/citas/FormularioCitas.jsx` mounts and fires `Promise.all`:
   `obtenerMiInfo()` (GET `/api/user/myInfo`), `obtenerAsesores()` (GET
   `/api/user/asesores`), `obtenerTiposCitas()` (GET `/api/cita/tipoCita`).
2. Form (advisor select, appointment-type select, date, optional description;
   name/email shown disabled from `userData`) submits via `agregarCita()` →
   POST `/api/cita/agregarCita` with `{asesorId, tipoCitaId, fechaCita (ISO),
   descripcion}` + Bearer token; success toast via `react-toastify`, then
   refetches `myInfo`.
3. The "Ver todas mis citas" accordion lists `userData.citas` (filtering out
   `estado === "eliminado"`) with per-row `Cancelar` → POST
   `/api/cita/cancelarCita` `{citaId}` + refetch.
4. `Generar PDF` re-fetches `myInfo`, builds a landscape-A4 table with `jspdf`
   (title, client header, 8 columns, alternating row shading, page breaks) and
   saves `citas_<nombre>.pdf`.

### 4. Chatbot recommendations — Servi (all pages)
1. `App.jsx` always mounts `Servi` from `src/componentes/bot/chatBot.jsx`: a
   fixed 💬 button toggling a `react-chatbot-kit` `<Chatbot/>` panel.
2. At module load, `cargarProductos()` fetches `/productos.json?url` (Vite
   asset import resolving to `public/productos.json`, a 60-item static catalog
   copy) into a module-level array — independent of the backend API used by
   `Productos.jsx`.
3. `MessageParser.parse` keyword-routes user text (gaming/gamer, oficina,
   laptop, pc, budget numbers `/\b\d{3,4}\b/`, mejor/top, contacto, asesor,
   greetings; falls back to product-name substring match, else `NiIdea`).
4. `ActionProvider` actions (`recomendarGaming`, `recomendarOficina`,
   `recomendarLaptops`, `recomendarPC`, `recomendarPorPresupuesto`,
   `destacados`, `buscarProducto`, `contacto`, `asesoria`, …) format matches via
   `construirMensajeProductos` and append with `setState`.

## State & Data

- **Local component state everywhere**: `useState`/`useEffect` in
  `Productos` (product list + param refetch with cleanup `setProductos([])`),
  `FormularioCitas` (`cita` form object, `userData`, `asesores`, `tiposCitas`),
  `CitaAdmin` (`formData`, `citas`, `clients`, `emailSearch`), `Login`/`Register`
  (form objects), `Servi` (`isOpen` boolean). No `createContext`/`useContext`,
  no custom hooks directory, no global store.
- **Props drilling (shallow)**: only `Producto.jsx` (`{producto}` → destructured
  `name/price/description/img`) and chatbot `MessageParser`/`ActionProvider`
  children cloning with `{parse, actions}`.
- **Server state handling**: manual fetch-in-`useEffect` with no caching,
  deduplication, loading skeletons, or error boundaries. Loading states are
  mostly absent (`Productos` shows `No products found` while loading/empty;
  `FormularioCitas` silently logs errors). Verbose `console.log` calls remain in
  `App.jsx`, `productos.js`, `Productos.jsx`, `FormularioCitas.jsx`,
  `CitaAdmin.jsx`, `login.jsx`.
- **Persistence**: `localStorage` is the session store (`token`,
  `nombreUsuario`, `authUserName` legacy fallback, `rolUsuario`). Reads are
  synchronous per render, so login/logout UI only updates on navigation/remount.
  No refresh-token or expiry handling.
- **Dual product data sources**: live backend (`GET /api/productos`, via axios)
  for the catalog page vs. static `public/productos.json` (via `fetch`) for the
  chatbot — they share the same `{id, name, price, description[],
  categoria{name, Subcategoria}, img}` shape but can drift out of sync.
- **Backend contract assumed** (all `http://localhost:3000`): `GET
  /api/productos`, `POST /api/auth/{login,register}`, `GET
  /api/user/{myInfo,asesores,clientesPorCorreo/:email}`, `GET
  /api/cita/tipoCita`, `POST /api/cita/{agregarCita,cancelarCita,crear}`.

## Decisions & Rationale

- **Layout route + `<Outlet/>` in `main.jsx`/`App.jsx`**: standard
  react-router pattern giving persistent Header/Footer/chatbot. Tradeoff: routes
  live in the entry file, so adding a page means editing `main.jsx` (no route
  registry abstraction) — simple for this size, harder to lazy-load later.
- **Co-located plain CSS per page/component**: zero-setup styling matching the
  static-site origin of the project. Tradeoff: no design tokens/shared classes;
  duplicated inline styles and per-page CSS make visual consistency manual.
  The unused `styled-components` dependency suggests a planned CSS-in-JS move
  that never happened — it should be removed or adopted.
- **Hardcoded `localhost:3000` axios calls, no shared client**: fastest path to
  wire a local backend. Tradeoff: base URL, token header, and error handling are
  copy-pasted across 4+ files; moving to staging/prod requires editing every
  call site (should become one `axios.create` + `.env`).
- **localStorage session + UI-only role gating**: simple auth without a provider.
  Tradeoff: token readable by any script (XSS-sensitive), UI lags renders, and
  `/admin`/`/citas` are reachable by URL regardless of role — real protection
  must come from the backend.
- **Chatbot on static JSON, catalog on live API**: lets the assistant work
  offline/demo without backend. Tradeoff: two sources of truth; price/name
  answers from Servi can disagree with the shop listing.
- **CitaAdmin renders local mock data** (`citasData.js`, `asesores.js`) with
  client-side cancel/complete, while its create/search calls hit the real API:
  pragmatic for UI development without backend seed data, but the list never
  reflects the server (and `tiposCitasList`/`obtenerMiInfo` there are dead
  code) — easy to mistake the mock for live data.
- **Client-side jsPDF report**: no backend report endpoint needed. Tradeoff: the
  PDF table layout code (~100 lines in `FormularioCitas.jsx`) is brittle
  (fixed column widths, description text mapped from the wrong column index)
  and untested.
- **Fixed `min-width: 1200px` + remote hotlinked images** (GitHub/Netlify URLs,
  Google Maps/YouTube iframes): desktop-first brochureware. Tradeoff: poor
  mobile experience and dependence on third-party hosts; `/img/…` paths in
  `Servicios.jsx` point to files that do not exist in `public/`.

## Generated summary

Architecture mapper (codebase): React 19 + Vite SPA, routes inline in
`src/main.jsx` under an `App` layout (Header/Outlet/chatbot/Footer); 11 page
folders + 4 component units; local useState/useEffect state with localStorage
session, no Context/store; catalog via `src/servicios/productos.js` + inline
axios to `localhost:3000`, chatbot on static `public/productos.json`, citas
CRUD + jsPDF export in `FormularioCitas.jsx`; co-located plain CSS with
`styled-components` declared but unused.
