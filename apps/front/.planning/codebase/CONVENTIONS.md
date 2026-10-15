# Conventions

Evidence base: `eslint.config.js`, `vite.config.js`, `package.json`, `src/App.jsx`, `src/main.jsx`,
`src/componentes/header/Header.jsx`, `src/componentes/footer/Footer.jsx`,
`src/componentes/Producto/Producto.jsx`, `src/componentes/bot/chatBot.jsx`,
`src/pages/logReg/login.jsx`, `src/pages/logReg/register.jsx`,
`src/pages/productos/Productos.jsx`, `src/pages/citas/FormularioCitas.jsx`,
`src/pages/citaAdmin/CitaAdmin.jsx`, `src/pages/home/Home.jsx`, `src/pages/pago/Pago.jsx`,
`src/servicios/productos.js`, `src/App.css`.

## Code Style

- **Formatter: none enforced.** No Prettier, no `eslint-config-prettier`, no style rules in
  `eslint.config.js`. `vite.config.js` is minimal (`@vitejs/plugin-react-swc` only).
- **ESLint (`eslint.config.js`) summary:** flat config via `defineConfig`, `globalIgnores(['dist'])`,
  applies to `**/*.{js,jsx}` only; extends `js.configs.recommended`,
  `reactHooks.configs['recommended-latest']`, `reactRefresh.configs.vite`; `ecmaVersion 2020` /
  `parserOptions ecmaVersion 'latest'`, JSX on, `sourceType: 'module'`, `globals.browser`.
  Only custom rule: `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]` (uppercase
  components exempt). Nothing enforces quotes, semicolons, import order, or naming.
- **Quotes: mixed, file-dependent.** Single quotes dominate older presentational files
  (`src/App.jsx`, `src/componentes/header/Header.jsx`, `src/componentes/Producto/Producto.jsx`,
  `src/pages/productos/Productos.jsx`, `src/pages/pago/Pago.jsx`, `src/componentes/footer/Footer.jsx`).
  Double quotes dominate auth/data/chat files (`src/pages/logReg/login.jsx`,
  `src/pages/logReg/register.jsx`, `src/servicios/productos.js`,
  `src/componentes/bot/chatBot.jsx`, `src/pages/citas/FormularioCitas.jsx`,
  `src/pages/citaAdmin/CitaAdmin.jsx`). Do not "normalize" a whole file in a bugfix PR.
- **Semicolons: mixed, same split.** No-semicolon style in `App.jsx`, `Header.jsx`,
  `Productos.jsx`, `Producto.jsx`, `Footer.jsx`, `Pago.jsx`, `Home.jsx`; semicolons consistently
  in `login.jsx`, `register.jsx`, `FormularioCitas.jsx`, `CitaAdmin.jsx`, `chatBot.jsx`,
  `servicios/productos.js`. Follow the file you are editing.
- **Imports order (convention, not rule):** `react` → third-party (`react-router-dom`, `axios`,
  `react-chatbot-kit`, `react-toastify`, `jspdf`) → relative components/services → `./*.css` last.
  Seen in `Header.jsx:1-3`, `login.jsx:1-4`, `FormularioCitas.jsx:1-6`, `Producto.jsx:1-2`.
  CSS is always a bare side-effect import (`import './header.css'`).
- **Lint entry:** `npm run lint` (`eslint .`). No `--fix` flag in `package.json`; run
  `npx eslint . --fix` explicitly when desired.

## Component Patterns

- **Function components only; no classes observed.** Three spellings coexist:
  - `const X = () => { ... }` + `export default X` — `Header.jsx:5`, `Footer.jsx:6`,
    `Producto.jsx:5`, `Home.jsx:3`, `Productos.jsx:8`.
  - `function X() { ... }` + `export default X` — `App.jsx:8`, `login.jsx:6`, `register.jsx:6`.
  - Named export — `CitaAdmin.jsx:7` (`export const CitaAdmin`), imported with braces in
    `main.jsx:18`. This is the only non-default component export in `src/`.
- **Hooks:** `useState` + `useEffect` for data fetch (`Productos.jsx:10-26`,
  `FormularioCitas.jsx:24-34` with `Promise.all` of three fetches); `useParams` for category
  (`Productos.jsx:11`); `useNavigate` for post-auth redirect (`login.jsx:7,56`, `register.jsx:7,49`);
  `useLocation` for banner gating (`App.jsx:10`). `CitaAdmin.jsx:1` imports `useMemo` but never uses it.
- **Props style:** destructured at signature (`Producto.jsx:5` `({producto})`,
  `chatBot.jsx:60` `({ children, actions })`) or `e.target.name/value` generic handlers
  (`login.jsx:13-18`, `register.jsx:14-19`, `FormularioCitas.jsx:36-39`, `CitaAdmin.jsx:49-52`).
- **Routing shell:** `main.jsx` owns `BrowserRouter` + nested `Routes` under `<App />` layout
  (`Header` / `<Outlet/>` / chatbot / `Footer`, `App.jsx:13-25`); pages are thin route targets.
- **Styling: plain CSS files, NOT styled-components.** `styled-components@4.4.1` is a declared
  dependency but zero `styled` usages exist in `src/` (verified by grep). Each component/page has a
  co-located `.css` file (e.g. `header/header.css`, `citas/citas.css`). Occasional inline `style={{}}`
  objects for one-off layout — `chatBot.jsx:202-233` (floating button/panel),
  `FormularioCitas.jsx:300-301,326-329`. No CSS modules, no theme, no shared variables file.
- **Chatbot pattern:** `chatBot.jsx` separates `config` / `MessageParser` / `ActionProvider`
  (keyword `if/else` chain on lowercased input, `chatBot.jsx:61-99`) from the `Servi` toggle shell
  (`useState(false)` + fixed-position button, `chatBot.jsx:195-243`). Product data loaded once at
  module level via `void cargarProductos()` (`chatBot.jsx:19`) from `/productos.json?url`.

## Naming

- **Directories:** lowercase Spanish, plural-ish: `src/componentes/`, `src/pages/`, `src/servicios/`.
  Subdirectories mostly lowercase (`header`, `footer`, `bot`, `home`, `pago`, `citas`, `productos`);
  exceptions: `componentes/Producto/` (capital P), `pages/logReg/` (camelCase),
  `pages/citaAdmin/` + `pages/mapSite/` (camelCase). Match the existing folder; do not rename.
- **Files:** components/pages are PascalCase `.jsx` (`Header.jsx`, `Producto.jsx`,
  `FormularioCitas.jsx`, `CitaAdmin.jsx`, `MapSite.jsx`); CSS casing is inconsistent
  (`header.css` vs `Producto.css` vs `Pago.css` vs `loginRegister.css`). Import paths must match
  exact case (`App.jsx:2` imports `./componentes/header/header.jsx` — lowercase file on disk).
- **Components/variables:** PascalCase components; Spanish camelCase state
  (`datos`, `usuario`, `cita`, `citas`, `asesores`, `tiposCitas`, `formData`, `emailSearch`,
  `nombreUsuario`, `rolUsuario`). Service helpers are English verbs
  (`getProducts`, `getByCategory`, `getTitleCategory` in `servicios/productos.js`).
- **Routes:** lowercase, some camel leftovers: `/`, `/delivery`, `/locales`, `/negocio`, `/pago`,
  `/servicios`, `/productos/:categoria` (snake_case category slugs like `laptops_gaming`,
  `componentes_mb` — see `getTitleCategory`, `servicios/productos.js:19-47`), `/citas`, `/login`,
  `/register`, `/mapsite` (sic — file is `MapSite.jsx`), `/admin` (`main.jsx:24-37`).
- **CSS/styled identifiers:** kebab-case classes (`header-top`, `auth-container`, `auth-card`,
  `admin-citas-container`, `tabla-citas`, `contenedorcc`, `titulo-cc`). IDs are rare.

## Error Handling & Feedback

- **Per-call `try/catch` around every axios call is the house pattern.** `catch` does
  `console.log`/`console.error` plus user feedback — but feedback channel differs by file age:
  - `alert(...)` in auth/admin: `login.jsx:51,58,64`, `register.jsx:43,51,57`,
    `CitaAdmin.jsx:80,91`.
  - `toast.success` / `toast.error` + one `<ToastContainer>` only in
    `FormularioCitas.jsx:76-84,220,290,295,390`. This is the modern pattern; no other page mounts
    a `ToastContainer`, so toasts fired elsewhere would be invisible.
- **No global handler, no error boundary, no axios interceptor.** Each function repeats
  `localStorage.getItem('token')` + `Authorization: Bearer ${token}` headers
  (`FormularioCitas.jsx:51-55,228-232,244-249`, `CitaAdmin.jsx:36,56-60,75-78`). Backend base URL
  `http://localhost:3000` is hardcoded in at least 4 files (`login.jsx:25`, `register.jsx:22`,
  `servicios/productos.js:5`, `FormularioCitas.jsx` ×5, `CitaAdmin.jsx` ×3).
- **Loading/empty states are minimal:**
  - Empty: `Productos.jsx:31-32` renders `<h2>No products found</h2>` (English string in a
    Spanish UI); `CitaAdmin.jsx:170-171` renders `No hay citas registradas.`
  - Loading: none — no `isLoading` flags, spinners, or skeletons anywhere in `src/`
    (only `loading="lazy"` on iframes in `Locales.jsx:15,41`). Fetch-then-set patterns leave blank
    UI while pending (`Productos.jsx:14-26`).

## What Good Looks Like Here

1. **Toast feedback with local container** — `src/pages/citas/FormularioCitas.jsx:76-84,390`:
   `toast.success(mensaje, { position: "top-right", autoClose: 3000, ... })` plus
   `<ToastContainer ... />` at the view root. Copy this (not `alert()`) for new mutations.
2. **Pure helpers extracted from components** — `src/servicios/productos.js:11-47`:
   `getByCategory` / `getTitleCategory` keep slug→label mapping testable outside JSX; pages just call
   them (`Productos.jsx:3,30`). Put new mapping/filter logic in `src/servicios/`, not in JSX.
3. **Role-conditional nav from stored session** — `src/componentes/header/Header.jsx:7-17,30-45,137-153`:
   reads `token`/`nombreUsuario`/`rolUsuario`, shows user chip + logout when present, gates
   `/citas` (cliente) and `/admin` (admin) links. Extend here when adding roles.
4. **Generic controlled-form handler** — `src/pages/logReg/login.jsx:8-18`
   (same shape in `register.jsx`, `FormularioCitas.jsx:36-39`): single `useState` object +
   `setX({ ...x, [e.target.name]: e.target.value })`. Keep input `name` attributes in sync.
5. **Chatbot parser/provider split** — `src/componentes/bot/chatBot.jsx:60-193`: keyword routing in
   `MessageParser.parse`, message building in `ActionProvider` actions with shared helpers
   (`obtenerProductosPorCategoria`, `construirMensajeProductos`). Add intents as new actions, not
   inline in the toggle component.

## Anti-patterns To Avoid

- **`console.log` left in shipped paths** — `App.jsx:11`, `Productos.jsx:12,15,17,19,23`,
  `servicios/productos.js:6,14`, `FormularioCitas.jsx` (7+ sites, e.g. `:49,66,234,252,264,280`).
  Remove or gate behind `import.meta.env.DEV` before merging.
- **Hardcoded `http://localhost:3000/...` per call site** — adding a new endpoint by copy-pasting
  another URL spreads the production-breakage. Centralize into one axios instance / env var instead.
- **`alert()` for user feedback** (`login.jsx`, `register.jsx`, `CitaAdmin.jsx`) — blocks UI, no
  styling, inconsistent with the toast pattern. Do not propagate; use `react-toastify`.
- **Reading `localStorage` in render body** (`Header.jsx:7-9`) — UI goes stale until navigation
  because nothing re-renders on login/logout. Do not copy; lift to state/context and subscribe.
- **Index-as-key and fragile keys** — `Producto.jsx:19-21` (`description.map((d, i) => key={i})`),
  `Productos.jsx:33-37` (`Fragment key={i}`). Use stable ids (`c._id` style, as in
  `FormularioCitas.jsx:368`).
- **`setState` in `useEffect` cleanup** — `Productos.jsx:22-25` calls `setProductos([])` on unmount
  (React 18+ StrictMode warns; the log spam "montando/desmontando componente..." comes from here).
- **Commented-out code and dead state** — `CitaAdmin.jsx:105-116` (dead search JSX),
  `servicios/productos.js:4` (dead `:8080` URL), `CitaAdmin.jsx:1` (unused `useMemo`),
  `FormularioCitas.jsx:19` (`citas` state never read), `CitaAdmin.jsx:20-21`
  (`tiposCitasList`/`userData` set but the type list never populated). Delete, don't comment.
- **Mixed spellings that break imports** — `main.jsx:8` aliases `Sevicios` (typo) and route
  `/mapsite` vs file `MapSite.jsx`; `Header.jsx:2` vs `header.jsx` on disk. Copy exact existing
  import strings; verify case-sensitive paths on Linux CI.
