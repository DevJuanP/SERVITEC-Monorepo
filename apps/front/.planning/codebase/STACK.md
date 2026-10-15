# Stack

## Languages & Runtimes (versions, where configured)

- **JavaScript + JSX (ES modules):** all source is `.js` / `.jsx` with `import`/`export`. `package.json:5` sets `"type": "module"`.
- **ECMAScript level:** `eslint.config.js:16-23` sets `ecmaVersion: 2020` with `parserOptions.ecmaVersion: 'latest'`, `jsx: true`, `sourceType: 'module'`, `globals.browser`.
- **Node.js:** version not pinned — no `.nvmrc`, no `engines` field in `package.json`, no Dockerfile. Local toolchain is Vite 7 (`package.json:32`).
- **No TypeScript:** despite `@types/react`, `@types/react-dom`, `@types/styled-components` in devDependencies, there are no `.ts`/`.tsx` files; `src/` is entirely `.jsx`/`.js`/`.css`.

## Frameworks (core, routing, state, styling, forms, etc.)

- **Core UI:** `react@^19.1.1` + `react-dom@^19.1.1` (`package.json:15,17`). Entry is `src/main.jsx:20` (`createRoot` + `<StrictMode>`), shell layout is `src/App.jsx` (`Header` + `<Outlet/>` + chatbot + `Footer`).
- **Routing:** `react-router-dom@^7.8.1` (`package.json:18`). `src/main.jsx:22-38` uses `<BrowserRouter>` + `<Routes>` with a layout route (`App`) and 12 child routes: `/` (Home), `/delivery`, `/locales`, `/negocio`, `/pago`, `/servicios`, `/productos/:categoria`, `/citas`, `/login`, `/register`, `/mapsite`, `/admin`.
- **State:** no global store (no Redux/Zustand/Context provider). Local `useState`/`useEffect` per page + `localStorage` for session (`src/pages/logReg/login.jsx:39-48`, `src/componentes/header/Header.jsx:7-16`).
- **Styling:** plain CSS files co-located with pages/components (`src/App.css`, `src/index.css`, e.g. `src/pages/pago/Pago.css`, `src/componentes/header/header.css`). `:root`/`body` base styles in `src/index.css:1-12`; `#root` background + banner layout in `src/App.css:1-20`. No CSS modules, no Tailwind, no UI kit.
- **Forms:** no form library. Controlled inputs with `useState` + `handleChange` (e.g. `src/pages/logReg/login.jsx:13-18`, `src/pages/citas/FormularioCitas.jsx:36-39`).
- **Declared but unused:** `styled-components@^4.4.1` is in `package.json:20` but has zero imports in `src/` (verified by repo-wide grep — only hit is `package.json` itself).

## Build & Tooling (bundler, transpiler, lint, scripts from package.json)

- **Bundler / dev server:** `vite@^7.1.2` (`package.json:32`). Config is minimal — `vite.config.js:1-7` is just `defineConfig({ plugins: [react()] })`, no aliases, proxies, or env handling.
- **Transpiler:** `@vitejs/plugin-react-swc@^4.0.0` (`package.json:27`).
- **Lint:** `eslint@^9.33.0` with flat config in `eslint.config.js:7-29` (`@eslint/js` recommended, `eslint-plugin-react-hooks` recommended-latest, `eslint-plugin-react-refresh` vite preset; ignores `dist`; `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'`). No Prettier, no editorconfig, no CI config found.
- **Scripts (`package.json:6-11`):**
  | Script | Command |
  |---|---|
  | `dev` | `vite` |
  | `build` | `vite build` |
  | `lint` | `eslint .` |
  | `preview` | `vite preview` |
- **Tests:** none — no test runner in `package.json`, no `**/*.{test,spec}.*` files found.
- **HTML shell:** `index.html:1-13` — `<div id="root">` + `<script type="module" src="/src/main.jsx">`, title `SERVITEC`, vite favicon commented out.

## Dependencies (table: package | version | purpose | where used)

| Package | Version (`package.json`) | Purpose | Where used |
|---|---|---|---|
| `axios` | `^1.18.0` | HTTP client for backend API | `src/servicios/productos.js:1,5`; `src/pages/logReg/login.jsx:3,25`; `src/pages/logReg/register.jsx:3,22`; `src/pages/citas/FormularioCitas.jsx:4,51,228,245,262,281`; `src/pages/citaAdmin/CitaAdmin.jsx:2,36,57,75` |
| `jspdf` | `^4.2.0` | Client-side PDF generation (citas report) | `src/pages/citas/FormularioCitas.jsx:3,118` (`generarPDF`) |
| `react` | `^19.1.1` | UI library | Every `.jsx` file; entry `src/main.jsx:1` |
| `react-chatbot-kit` | `^2.2.2` | Rule-based support chatbot UI | `src/componentes/bot/chatBot.jsx:2,235-239`; mounted globally in `src/App.jsx:5,22` |
| `react-dom` | `^19.1.1` | DOM renderer (`createRoot`) | `src/main.jsx:2,20` |
| `react-router-dom` | `^7.8.1` | Routing (`BrowserRouter`, `Routes`, `Outlet`, `NavLink`) | `src/main.jsx:6,22-38`; `src/App.jsx:4,6,10`; `src/pages/productos/Productos.jsx:2`; `src/componentes/header/Header.jsx:3` |
| `react-toastify` | `^11.1.0` | Toast notifications | Only `src/pages/citas/FormularioCitas.jsx:5-6,77,220,290,295,390` |
| `styled-components` | `^4.4.1` | CSS-in-JS (declared, **not used**) | Declared in `package.json:20`; zero imports in `src/` |
| `@vitejs/plugin-react-swc` (dev) | `^4.0.0` | React SWC transform for Vite | `vite.config.js:2,6` |
| `vite` (dev) | `^7.1.2` | Build/dev tooling | `package.json` scripts |
| `eslint` + `@eslint/js` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` + `globals` (dev) | `^9.33.0` / `^9.33.0` / `^5.2.0` / `^0.4.20` / `^16.3.0` | Linting | `eslint.config.js:1-5`; `lint` script |
| `@types/react`, `@types/react-dom`, `@types/styled-components` (dev) | `^19.1.10` / `^19.1.7` / `^5.1.34` | Type stubs only — no TS sources consume them | `package.json` only |

## Configuration (env vars, config files, feature flags)

- **Config files present:** `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`, `index.html`. No `tsconfig`, no `.env*`, no `vite.config.ts`, no Dockerfile, no CI yaml found (repo-level glob only returns the files listed above plus `public/productos.json` and `src/**`).
- **Env vars:** none. No `import.meta.env`, `process.env`, or `VITE_*` references anywhere in `src/` (grep-verified). Backend URL is hardcoded as `http://localhost:3000/...` in 5 files (see INTEGRATIONS.md).
- **Feature flags:** none.
- **Static data fallback:** `public/productos.json` (60-product catalog + `categorias`) is the offline/chatbot dataset; also served as a static asset.
- **Lint ignore:** `eslint.config.js:8` ignores `dist` only.

## Generated summary (2-3 sentences: what kind of app is this technically)

This is a client-rendered React 19 + React Router 7 SPA built with Vite 7 (SWC) and styled with co-located plain CSS — no TypeScript, no global store, no test suite. It is a storefront + appointment-booking frontend (catalog, auth, citas, admin panel, PDF export, rule-based chatbot) that talks directly via axios to a separately-hosted backend hardcoded at `http://localhost:3000`.
