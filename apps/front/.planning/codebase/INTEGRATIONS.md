# Integrations

## APIs & Backends (base URLs, axios instances/interceptors, auth headers — check src/ for api/, services/, lib/)

- **No `api/` / `lib/` layer, no axios instance, no interceptors.** There is one service module, `src/servicios/productos.js`, which uses the default `axios` import directly. Every other call site also imports default `axios` and hardcodes the full URL.
- **Base URL (hardcoded everywhere):** `http://localhost:3000` — no `.env`, no `import.meta.env`, no proxy in `vite.config.js`. A stale alternative (`http://localhost:8080/api/productos`) survives only as a comment in `src/servicios/productos.js:4`.
- **Endpoint inventory (all absolute URLs in source):**

| Method | URL | Call site | Auth |
|---|---|---|---|
| GET | `http://localhost:3000/api/productos` | `src/servicios/productos.js:5` (`getProducts()`), consumed by `src/pages/productos/Productos.jsx:16` | None |
| POST | `http://localhost:3000/api/auth/login` `{correo, password}` | `src/pages/logReg/login.jsx:25` | None |
| POST | `http://localhost:3000/api/auth/register` `{nombre, correo, password, rol: "cliente"}` | `src/pages/logReg/register.jsx:22` | None |
| GET | `http://localhost:3000/api/user/myInfo` | `src/pages/citas/FormularioCitas.jsx:228`; `src/pages/citaAdmin/CitaAdmin.jsx:57` | `Authorization: Bearer <token>` from `localStorage` |
| GET | `http://localhost:3000/api/user/asesores` | `src/pages/citas/FormularioCitas.jsx:245` | `Authorization: Bearer <token>` |
| GET | `http://localhost:3000/api/user/clientesPorCorreo/:email` | `src/pages/citaAdmin/CitaAdmin.jsx:36` | Bearer token if present, else unauthenticated (`CitaAdmin.jsx:36-38`) |
| GET | `http://localhost:3000/api/cita/tipoCita` | `src/pages/citas/FormularioCitas.jsx:262` | None |
| POST | `http://localhost:3000/api/cita/agregarCita` `{asesorId, tipoCitaId, fechaCita, descripcion}` | `src/pages/citas/FormularioCitas.jsx:51` | `Authorization: Bearer <token>` |
| POST | `http://localhost:3000/api/cita/crear` `(formData)` | `src/pages/citaAdmin/CitaAdmin.jsx:75` | `Authorization: Bearer <token>` |
| POST | `http://localhost:3000/api/cita/cancelarCita` `{citaId}` | `src/pages/citas/FormularioCitas.jsx:281-289` | `Authorization: Bearer <token>` |

- **Auth header pattern:** `headers: { Authorization: \`Bearer ${token}\` }` with `token = localStorage.getItem('token')` at each call site (`FormularioCitas.jsx:63,227,244,276`; `CitaAdmin.jsx:35,56,74`). No refresh flow, no 401 handling, no request/response interceptors.
- **Client-side filtering helpers:** `getByCategory` / `getTitleCategory` in `src/servicios/productos.js:11-48` filter the full product list by `categoria.name + "_" + categoria.Subcategoria` (e.g. `laptops_gaming`, `componentes_ram`).

## Third-party Services (chatbot, toast, pdf, etc. — how each is wired)

- **Chatbot (`react-chatbot-kit@^2.2.2`) — rule-based, fully local.** Implemented in `src/componentes/bot/chatBot.jsx:1-244`: keyword `MessageParser` (`parse`, lines 61-90) dispatches to an `ActionProvider` (lines 101-193) with canned recommenders (gaming/oficina/laptops/PC/presupuesto/destacados/contacto/asesoría). Product knowledge comes from `public/productos.json` fetched at module load via `fetch(productosUrl)` where `productosUrl` is `"/productos.json?url"` (lines 4-19) — no backend call, no AI API. Rendered on every page via `<Servi />` in `src/App.jsx:5,22`, behind a fixed 💬 toggle button (lines 195-243). Contact fallback is a hardcoded phone number (`chatBot.jsx:121`).
- **Toasts (`react-toastify@^11.1.0`) — citas page only.** `toast.success` / `toast.error` + `<ToastContainer>` live exclusively in `src/pages/citas/FormularioCitas.jsx:5-6,77-84,220,290,295,390`. Login/register/admin flows use native `alert()` instead (`login.jsx:51,58,64`; `register.jsx:44`; `CitaAdmin.jsx:80,91`).
- **PDF (`jspdf@^4.2.0`) — citas report.** `generarPDF` in `src/pages/citas/FormularioCitas.jsx:114-222` builds a landscape A4 report (`new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })`) from `obtenerMiInfo()` data and saves `citas_<nombre>.pdf`. Triggered by the "Generar PDF" button (line 344).
- **`styled-components` — installed, not wired.** In `package.json:20` but never imported in `src/`.
- **External content (no SDK, plain URLs/embeds):**
  - Images: `raw.githubusercontent.com/DevJuanP/...` (logo in `Header.jsx:25`, banner in `App.jsx:17`), `m.media-amazon.com/...` (all 60 `productos.json` images), `effervescent-concha-1ab1e8.netlify.app/img/...` (payment logos in `Pago.jsx:10,23,33,53`).
  - YouTube iframe embed in `src/pages/logReg/login.jsx:106`.
- **Routing (`react-router-dom`)** is the only navigation integration — route table in `src/main.jsx:22-38` (see STACK.md).

## Data Flow (where API calls originate, how responses flow to UI)

- **Product catalog:** `Productos.jsx:14-26` (`useEffect` on `:categoria` param) → `getProducts()` (`axios.get /api/productos`) → `getByCategory(categoria, data)` → `setProductos(p)` → renders `<Producto>` list; title via `getTitleCategory(categoria)`. No caching, no pagination; unmount clears state. Empty result renders "No products found".
- **Auth (login):** form state in `login.jsx:8-18` → `iniciarSesion()` posts to `/api/auth/login` → on `responseApi.token`, writes `token`, `nombreUsuario`, `rolUsuario` to `localStorage` (lines 38-48) → `alert` + `navigate("/")`. `Header.jsx:7-9` reads those keys on each render to show user chip / logout and to gate nav links (`rolUsuario === 'cliente'` → `/citas`, `=== 'admin'` → `/admin`, lines 137-153).
- **Register:** form state → posts to `/api/auth/register` with hardcoded `rol: "cliente"` (`register.jsx:21-30`) → success string match (`"Usuario registrado con éxito"`) → `alert` + `navigate("/login")`.
- **Client citas (`FormularioCitas.jsx`):** mount `useEffect` (lines 24-34) runs `Promise.all([obtenerMiInfo(), obtenerAsesores(), obtenerTiposCitas()])` → `userData` (incl. embedded `citas` array), `asesores`, `tiposCitas` state. Submit (`handleSubmit`, lines 60-74) builds payload (`agregarCita`, lines 41-58) → POST `/api/cita/agregarCita` → toast + refetch `obtenerMiInfo()`. Cancel (`cancelarCita`, lines 274-297) posts `{citaId}` → toast + refetch. Table renders `userData.citas` filtered to exclude `estado === "eliminado"` (line 365); PDF is generated from the same `userData`.
- **Admin citas (`CitaAdmin.jsx`):** dual-source and partially unwired — the visible table renders local mock `citasData` (`useState(citasData)`, line 17; `asesores` lookup from `../citas/asesores`, line 188), with cancel/complete as pure local state flips (lines 25-31). Backend is used only for: client search (`clientesPorCorreo`, line 33-47), `obtenerMiInfo` (defined lines 54-69 but never called in render flow), and create (`POST /api/cita/crear`, lines 71-93). `tiposCitasList` state (line 20) is rendered (line 144) but never populated — no fetch call assigns it.
- **Chatbot:** module-load `fetch(/productos.json)` → in-memory `productos` array → synchronous filter/format helpers (lines 21-51) → `createChatBotMessage` strings appended via `setState` (lines 102-108). No API round-trip, no persistence.

## Auth & Secrets (how tokens/keys handled, .env usage, what NOT to commit)

- **Token storage:** JWT (opaque to frontend) in `localStorage` key `token` (`login.jsx:39` write; `Header.jsx:7`, `FormularioCitas.jsx:63`, `CitaAdmin.jsx:35` read; `Header.jsx:12` clears on logout). Also `nombreUsuario` (+ legacy fallback `authUserName`) and `rolUsuario` in `localStorage`. No httpOnly cookies, no in-memory-only token, no expiry/refresh handling — XSS-readable by design.
- **Role enforcement is client-side only:** nav gating in `Header.jsx:137-153`; no route guards (`main.jsx` exposes `/admin` and `/citas` unconditionally). Backend is expected to re-authorize via the Bearer token.
- **`.env` usage:** none — verified no `.env*` files and no `import.meta.env` / `process.env` / `VITE_*` references in `src/`.
- **Hardcoded sensitive-looking values (already public in repo, but do not expand):** payment account/CCI numbers in `src/pages/pago/Pago.jsx:14-68`; support phone in `src/componentes/bot/chatBot.jsx:121`; backend is `http://localhost` (dev-only, breaks in production).
- **What NOT to commit:** never commit a future `.env` / `.env.local` (backend URL, keys), real JWTs, real customer emails from `clientesPorCorreo` responses, or production payment credentials to replace the placeholder numbers in `Pago.jsx`. If env support is added, keep the `VITE_` prefix convention and add `.env*` to `.gitignore` (no `.gitignore` rule exists today because no env files exist).

## Open questions / TODOs found in code

- **No `TODO`/`FIXME` markers** found in `src/` (grep-verified). No test files and no test runner either.
- **Two cita-create endpoints:** client uses `POST /api/cita/agregarCita` (`FormularioCitas.jsx:51`), admin uses `POST /api/cita/crear` (`CitaAdmin.jsx:75`) with a different body shape (`formData` vs `{asesorId, tipoCitaId, fechaCita, descripcion}`). Which is canonical? Is `/crear` admin-only?
- **Admin panel half-mocked:** table renders static `citasData`/`asesores.js` imports, cancel/complete never hit the API, `tiposCitasList` is never fetched, `obtenerMiInfo` is dead code in that file. Is backend admin listing still unimplemented?
- **Stale backend URL:** is `http://localhost:8080` (`productos.js:4` comment) permanently retired? And what is the production base URL — currently every call hardcodes `localhost:3000`, so production builds cannot work without code changes (extract to env / axios instance).
- **Data-source duplication:** catalog has two sources — backend `/api/productos` (store pages) vs static `public/productos.json` (chatbot). What keeps them in sync?
- **Auth UX gaps:** `Header` reads `localStorage` during render with no subscription — login/logout requires navigation to re-render; `alert()`-based feedback in auth/admin vs toasts in citas; no 401/expired-token path; `authUserName` legacy key suggests an older auth shape — can it be removed?
- **Minor bugs worth confirming:** PDF row-height calc measures `row[5]` (Tipo) but renders description from `row[7]` (`FormularioCitas.jsx:183,205-209`); `CitaAdmin.jsx:170` condition `(!citas || citas.length) === 0` never matches the empty state; `Pago.jsx` repeats the same CCI/account for BCP and BBVA, PEN and USD.
