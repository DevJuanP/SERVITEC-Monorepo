# Structure

## Directory Tree

```
SERVITEC-Front/                  # repo root — React 19 + Vite SPA (pf-edw-servitec)
├── index.html                   # mounts #root, loads /src/main.jsx
├── vite.config.js               # stock Vite + @vitejs/plugin-react-swc
├── eslint.config.js             # eslint js/recommended + react-hooks + react-refresh
├── package.json                 # deps: axios, jspdf, react-chatbot-kit, router, toastify, styled-components (unused)
├── public/
│   └── productos.json           # 60-item static catalog — ONLY file served statically; chatbot's data source
├── src/
│   ├── main.jsx                 # app entry: BrowserRouter + all Routes, layout route <App/>
│   ├── App.jsx / App.css        # layout shell: Header, home-only banner, <Outlet/>, Servi chatbot, Footer
│   ├── index.css                # global reset (body margin 0, min-width: 1200px)
│   ├── componentes/             # shared UI (4 units, each .jsx + .css)
│   │   ├── header/              # Header.jsx — logo, session block, nav + catalog dropdown, role links
│   │   ├── footer/              # Footer.jsx — contact info, MAPA DE SITIO link
│   │   ├── Producto/            # Producto.jsx — catalog card (presentational)
│   │   └── bot/                 # chatBot.jsx — Servi floating assistant (react-chatbot-kit)
│   ├── pages/                   # one folder per route (each .jsx + .css)
│   │   ├── home/                # Home.jsx — static promo banners (index route)
│   │   ├── productos/           # Productos.jsx — /productos/:categoria catalog listing
│   │   ├── servicios/           # Servicios.jsx — static services page + dead form
│   │   ├── delivery/            # Delivery.jsx — static shipping info
│   │   ├── locales/             # Locales.jsx — store addresses + Google Maps iframes
│   │   ├── negocio/             # Negocio.jsx — business model + YouTube embeds + WhatsApp CTA
│   │   ├── pago/                # Pago.jsx — static bank/wallet account numbers
│   │   ├── citas/               # FormularioCitas.jsx — client booking + PDF; citasData.js mock; asesores.js static list
│   │   ├── citaAdmin/           # CitaAdmin.jsx — admin panel (mock list + partial real API)
│   │   ├── logReg/              # login.jsx, register.jsx — auth forms
│   │   └── mapSite/             # MapSite.jsx — site map (many stale links)
│   └── servicios/               # data-access layer (1 module)
│       └── productos.js         # getProducts / getByCategory / getTitleCategory (axios)
└── .planning/codebase/          # this documentation (ARCHITECTURE.md, STRUCTURE.md)
```

Root also contains: `.git/`, `.gitignore`, `package-lock.json`,
`README.md`, `README_PRESENTACION.md`, `node_modules/`. No `src/assets/`,
`src/hooks/`, `src/context/`, `src/router/`, tests, or `.env` files exist.

## Key Files

| Path | Purpose | Notes |
|---|---|---|
| `index.html` | HTML shell, `#root` mount | Loads `/src/main.jsx`; title SERVITEC |
| `src/main.jsx` | Entry + router | All 12 routes defined here under layout `<App/>`; no separate router file |
| `src/App.jsx` | Layout shell | `Header`, home-only banner (`/ `), `<Outlet/>`, `Servi` chatbot, `Footer`; logs pathname |
| `src/App.css` / `src/index.css` | Global styles | `#FFF3E0` bg, banner sizing, `main` min-height; body `min-width: 1200px` (not responsive) |
| `src/componentes/header/Header.jsx` | Top nav + session UI | Reads `localStorage` token/rol; catalog dropdown `NavLink`s to `/productos/…`; role links `CITAS`/`ADMIN`; logout clears storage |
| `src/componentes/footer/Footer.jsx` | Footer | Static contact/social/phone + `Link to="/mapSite"` |
| `src/componentes/bot/chatBot.jsx` | `Servi` chatbot | `react-chatbot-kit`; fetches `/productos.json?url`; keyword `MessageParser` + `ActionProvider`; floating toggle, mounted on every page |
| `src/componentes/Producto/Producto.jsx` | Catalog card | Props `{producto}`; renders img/name/specs/price; `COMPRAR AHORA` button has no handler |
| `src/pages/productos/Productos.jsx` | Catalog listing | `useParams categoria` → `getProducts()` → `getByCategory` → map `Producto`; `No products found` fallback |
| `src/servicios/productos.js` | Product service | Sole service module; axios `GET localhost:3000/api/productos`; category filter + title map (13 categories) |
| `src/pages/citas/FormularioCitas.jsx` | Client booking + report | Biggest file (395 lines): asesores/tipos fetch, `POST agregarCita`, cancel, `ToastContainer`, landscape-A4 `jsPDF` export |
| `src/pages/citaAdmin/CitaAdmin.jsx` | Admin panel | Email search + create form hit real API, but list renders local `citasData` mock; cancel/complete are local-only |
| `src/pages/citas/citasData.js` | Mock appointments | 3 sample `citasData` rows (comment claims 20) — only consumed by `CitaAdmin` |
| `src/pages/citas/asesores.js` | Static advisor names | 10 advisors; only consumed by `CitaAdmin` for name lookup |
| `src/pages/logReg/login.jsx` | Login form | `POST /api/auth/login`; stores token/nombre/rol in `localStorage`; navigates `/`; embeds YouTube iframe |
| `src/pages/logReg/register.jsx` | Register form | `POST /api/auth/register` with hardcoded `rol: "cliente"`; navigates `/login` |
| `src/pages/home/Home.jsx` | Landing content | Static banners (remote GitHub images); `COMPRAR` buttons have no handlers |
| `src/pages/servicios/Servicios.jsx` | Services page | Static text + non-functional form (no state/submit) |
| `src/pages/mapSite/MapSite.jsx` | Site map | Links mostly stale (`/pages/productos/…`, `/index` don't match router) |
| `src/pages/{delivery,locales,negocio,pago}/*.jsx` | Informational pages | Static content; Maps/YouTube iframes; WhatsApp link; bank account numbers |
| `public/productos.json` | Static catalog data | 60 products `{id,name,price,description[],categoria{name,Subcategoria},img}`; chatbot source; shape mirrors backend |
| `package.json` / `vite.config.js` | Build config | Stock Vite React SWC; `dev/build/lint/preview` scripts only |

## Naming & Organization

- **Pages**: Spanish PascalCase folders + components (`pages/citas/FormularioCitas.jsx`,
  `pages/citaAdmin/CitaAdmin.jsx`, `pages/logReg/login.jsx`), each folder holding
  its `.jsx` plus a co-located same-name/lowercase `.css`
  (`citas.css`, `CitaAdmin.css`, `loginRegister.css` shared by login+register).
  Inconsistencies: `Sevicios` typo in `main.jsx` import, `Locales` folder
  capitalized (`pages/Locales/` vs `pages/locales/` import — case-sensitive
  filesystems risk), `mapSite` camelCase vs kebab elsewhere, `Producto`
  (singular) vs `productos` (plural).
- **Components**: `src/componentes/` (Spanish spelling) with per-component
  folders; files mostly match folder case except `header/Header.jsx` +
  `header/header.css` and `footer/Footer.jsx` + `footer/footer.css` (mixed CSS
  casing). Components are default-exported except `CitaAdmin` (named export).
- **Services**: `src/servicios/productos.js` — lowercase camelCase helpers
  (`getProducts`, `getByCategory`, `getTitleCategory`). Only one service file;
  all other API calls are inline in pages.
- **Data fields**: backend-shaped Spanish/English mix (`nombre/correo/fechaCita/
  asesor/tipoCita/estado/descripcion`; product `categoria{name, Subcategoria}`
  with capital `S`). Category URL slugs are `name_Subcategoria`
  (e.g. `laptops_gaming`, `componentes_memorias`).
- **CSS**: plain classes per file (`.contenedorcc`, `.tabla-citas`,
  `.admin-citas-*`, `.mapa`, `.delivery`…), no modules/tokens; plus inline
  `style={{…}}` for one-off layout.

## Where to Add Things

- **New page**: create `src/pages/<nombre>/<Nombre>.jsx` + `<Nombre>.css`
  (copy `src/pages/delivery/Delivery.jsx` as the static-page template), add
  `import` + `<Route path="/<ruta>" element={<Nombre/>}/>` inside the
  `<Route path="/" element={<App/>}>` block in `src/main.jsx`, and add a nav
  `<Link>` in `src/componentes/header/Header.jsx` (and optionally
  `src/pages/mapSite/MapSite.jsx`).
- **New component**: create `src/componentes/<Nombre>/<Nombre>.jsx` +
  `<Nombre>.css`, default-export it, import relatively (e.g.
  `../../componentes/<Nombre>/<Nombre>.jsx` from a page, as `Productos.jsx`
  does for `Producto`).
- **New service / API call**: add the function to `src/servicios/productos.js`
  (or a new `src/servicios/<dominio>.js`), following the existing pattern
  (`axios` + `http://localhost:3000/api/…` + Bearer header). Recommended:
  first extract a shared `axios.create({baseURL})` client — none exists yet.
- **New style**: co-located `.css` next to the `.jsx` + `import './X.css'`;
  global rules go in `src/index.css` (layout) or `src/App.css` (shell). Do not
  expect `styled-components` to work by convention — it is installed but
  unwired.
- **New catalog category**: add slug → title case in `getTitleCategory()` in
  `src/servicios/productos.js`, add `NavLink to="/productos/<slug>"` in
  `src/componentes/header/Header.jsx`, ensure backend items use matching
  `categoria.name`/`Subcategoria`. Chatbot keywords live separately in
  `MessageParser` in `src/componentes/bot/chatBot.jsx`.
- **New chatbot intent**: add a keyword branch in `MessageParser.parse` + an
  action in `ActionProvider` in `src/componentes/bot/chatBot.jsx`.

## Dead / Unclear Areas

- `styled-components@4.4.1` (+ `@types`) in `package.json` — never imported in
  `src/`; safe to remove or adopt.
- `CitaAdmin.jsx`: `tiposCitasList` state is never populated (type dropdown
  always empty); `obtenerMiInfo`/`userData`/`useEffect`/`useMemo` defined or
  imported but never used; list + cancel/complete operate on local
  `citasData` mock, not the server — misleading.
- `FormularioCitas.jsx`: `const [citas, setCitas] = useState()` declared line 19
  but never used (`userData.citas` is rendered instead).
- `MapSite.jsx`: ~12 links point to `/pages/productos/…` and `/index`, which
  match no route in `main.jsx` (real routes are `/productos/:categoria`, `/`).
- `Servicios.jsx`: appointment `<form>` has no state/`onSubmit` (dead); success
  alert divs never toggled; `<a href="/pages/nuestros_locales.html">` 404s;
  `<img src="/img/…">` paths have no counterpart in `public/` (only
  `productos.json` exists there).
- `productos.js`: commented-out `http://localhost:8080/api/productos` URL —
  stale backend address.
- `Header.jsx` reads `authUserName` fallback key that `login.jsx` never writes
  (`nombreUsuario` only) — legacy remnant.
- Debug `console.log` in `App.jsx`, `productos.js`, `Productos.jsx`,
  `FormularioCitas.jsx`, `CitaAdmin.jsx`, `login.jsx` — should be removed.
- `Producto.jsx` `COMPRAR AHORA` and `Home.jsx` `COMPRAR` buttons are no-ops
  (no cart/checkout flow exists). `Delivery.jsx` `REALIZAR PEDIDO` likewise.
- No tests, no `src/assets`, no `.env`/config for the `localhost:3000` base URL
  (repeated in 6+ call sites across `productos.js`, `login.jsx`,
  `register.jsx`, `FormularioCitas.jsx`, `CitaAdmin.jsx`).
