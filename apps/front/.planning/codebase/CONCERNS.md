# Concerns

> Scope: `SERVITEC-Front` (React 19 + Vite, `pf-edw-servitec`). Findings are from direct file inspection (Sep 2026). Items marked `[heuristic]` are version-compat risks inferred from declared versions, not observed crashes.

## Tech Debt

### Outdated / mismatched dependencies (`package.json`)

- `styled-components: ^4.4.1` (`package.json:20`) with `react: ^19.1.1` / `react-dom: ^19.1.1` (`package.json:15,17`). `[heuristic]` styled-components v4 dates to ~2019 (pre-React 19, pre-concurrent); peer-compat and `forwardRef`/`createContext` behavior under React 19 should be verified or the dep upgraded/removed. Compounded by `@types/styled-components: ^5.1.34` (`package.json:26`) — types for v5 paired with runtime v4.
- `styled-components` is a **dead dependency**: `grep "styled" src` returns zero imports outside `package-lock.json`. Same for `@types/styled-components`. Remove it (and the types package) if no styling migration to it is planned.
- `react-chatbot-kit: ^2.2.2` (`package.json:16`). `[heuristic]` Last major activity on that package predates React 19; verify it renders cleanly under `StrictMode` + React 19 (it currently works, but watch for `ReactDOM.render` / legacy-context warnings after upgrades).
- `react-router-dom: ^7.8.1`, `axios: ^1.18.0`, `jspdf: ^4.2.0`, `react-toastify: ^11.1.0` are current-major; no action except the usage issues below.
- Toolchain is minimal but coherent: `vite: ^7.1.2`, `@vitejs/plugin-react-swc: ^4.0.0`, `eslint: ^9.33.0` (`package.json:22-32`). No test runner, no type-check script, no `build` type gate (`"build": "vite build"`, `package.json:8`).

### Lockfile hygiene

- OK: `package-lock.json` exists, `lockfileVersion: 3`. No action. (Only hygiene note: `package.json` uses `^` ranges everywhere, so fresh installs can drift; pin or rely on the lockfile in CI.)

### Case-sensitive import mismatches (pass on Windows, break on Linux/CI/Netlify)

- `src/App.jsx:2` imports `./componentes/header/header.jsx` (lowercase `h`) but the file on disk is `src/componentes/header/Header.jsx`. Same pattern in `src/main.jsx:11`: `./pages/Locales/Locales.jsx` (capital `L`) vs on-disk `src/pages/locales/Locales.jsx` (glob reports `src/pages/locales/...`). Windows/macOS-default FS hides this; any case-sensitive build or container will fail with "module not found".

### Dead / mock / commented-out code

- `src/pages/citaAdmin/CitaAdmin.jsx:1` imports `useMemo, useEffect` — neither is used. `tiposCitasList` (`:20`, rendered `:142-147`) is never populated (no fetch ever sets it), so the "Seleccione tipo de cita" select is permanently empty. `obtenerMiInfo` (`:54-69`) is defined but never called; `userData` is therefore always `null`.
- `src/pages/citaAdmin/CitaAdmin.jsx:25-31` — `cancelarCitaAction` / `completarCitaAction` only mutate local mock state seeded from `citasData` (`:17`); they never call the API, so admin actions silently diverge from the backend. Commented-out date-search block `:105-116` is abandoned UI.
- `src/pages/citas/citasData.js:1-49` + `src/pages/citas/asesores.js:1-13` are static mocks still wired into the admin panel (`CitaAdmin.jsx:3-4,17,188`) — remove or gate behind a dev flag.
- `src/servicios/productos.js:4` keeps a commented-out `localhost:8080` URL next to the active `localhost:3000` (`:5`).
- `src/pages/citas/FormularioCitas.jsx:9` computes `today` but never uses it (no `min={today}` on the date input at `:328`); `:366` keeps a commented-out `console.log`.
- `src/pages/servicios/Servicios.jsx:63-79` is a non-functional static `<form action="">` with unlabeled inputs and a fake `#estiloDeAlerta` block; `:32` links to `/pages/nuestros_locales.html`, which does not exist in this SPA.
- `src/pages/mapSite/MapSite.jsx:12,21,24,32,35,38,46,49,52,55,58,61,64` — every catalog link points at `/pages/productos/...` or `/index`, none of which match the real routes in `src/main.jsx:25-36` (`/productos/:categoria`, `/`). The sitemap is a guaranteed 404 farm (also note typo `laptos_otras` at `:24`).

### `console.*` noise (29 hits — abridged)

- `src/App.jsx:11`; `src/servicios/productos.js:6,14` (logs full axios response + per-item category); `src/pages/productos/Productos.jsx:12,15,17,19,23`; `src/pages/citas/FormularioCitas.jsx:29,49,66,72,219,234,237,252,255,264,267,280,294`; `src/pages/citaAdmin/CitaAdmin.jsx:43,63,66,90`; `src/pages/logReg/login.jsx:61-63`; `src/pages/logReg/register.jsx:54-56`; `src/componentes/bot/chatBot.jsx:14`. Several log PII-adjacent payloads (`Payload para agregar cita`, `obtenerMiInfo result`, full product responses). Strip or gate behind `import.meta.env.DEV`.

### TODO / FIXME list

- `grep -r "TODO|FIXME|HACK|XXX|BUG" src` → **zero hits**. No tracked markers; the dead-code items above are untracked instead.

## Security

Verified clean (by grep):

- No hardcoded API keys / secrets in `src` (searched `apiKey|apikey|secret`; only matches are field names like `password`, `token` handling).
- No `dangerouslySetInnerHTML` / `innerHTML` / `__html` in `src` (zero hits).
- Only one `target="_blank"`, and it is correct: `src/pages/negocio/Negocio.jsx:41` uses `rel="noopener noreferrer"`.

Real issues found:

1. **JWT + identity in `localStorage` (XSS theft, no expiry).** `src/pages/logReg/login.jsx:39,43,47` stores `token`, `nombreUsuario`, `rolUsuario`; read on every render in `src/componentes/header/Header.jsx:7-9` and per-request in `src/pages/citas/FormularioCitas.jsx:63,227,244,276` and `src/pages/citaAdmin/CitaAdmin.jsx:35,56,74`. Any XSS (e.g., via a malicious product `description` rendered at `src/componentes/Producto/Producto.jsx:19-21` or chatbot `description.join` at `src/componentes/bot/chatBot.jsx:164`) can exfiltrate the token. No expiry/refresh handling; logged-out calls still send `Authorization: Bearer null`.
2. **Client-side-only authorization.** Role gating is `rolUsuario === 'cliente' / 'admin'` string compares in `Header.jsx:137,146`, and `/admin` (`src/main.jsx:36`) has no route guard at all — anyone can navigate to it. Backend must enforce roles (frontend hiding is UX only).
3. **No centralized axios config.** Every call hardcodes `http://localhost:3000/...` (`productos.js:5`; `login.jsx:25`; `register.jsx:22`; `FormularioCitas.jsx:51,228,245,262,282`; `CitaAdmin.jsx:36,57,75`). No `baseURL`, no `timeout`, no interceptors, no `VITE_*` env var. Production builds will call localhost; mixed-content/HTTP downgrade risk if ever pointed at `http:` in prod. Error paths leak only generic `alert()`s, but request bodies include PII over whatever URL is compiled in.
4. **`alert()` with server content.** `login.jsx:51,58,64`; `register.jsx:43,51,57`; `CitaAdmin.jsx:80,91`. Minor: blocks the UI thread, trains users to trust modal dialogs, and renders raw `responseApi.mensaje/error`.
5. **PII handling.** Names/emails persist in `localStorage`; `FormularioCitas.jsx:217` writes `citas_${usuario.nombre}.pdf` (name in filename, unescaped beyond whitespace); `CitaAdmin.jsx:36` interpolates user-typed email into the URL (correctly `encodeURIComponent`-ed — good). Bank-account numbers are rendered publicly in `src/pages/pago/Pago.jsx:15,27,39-47,59-67`; the same CCI `002-191-30456789231-10` and account `191-3045678923` repeat for PEN/USD and BCP/BBVA, so treat as placeholder data to confirm before publishing.
6. **Injection surfaces (low, React-escaped, but note).** Product `description` arrays and chatbot strings are interpolated as text (safe by default), but there is no sanitization layer if a future change introduces HTML rendering. `Producto.jsx:19` will throw (not inject) on non-array `description`.

## Performance

- **No route lazy-loading.** `grep "React.lazy|Suspense" src` → zero hits. `src/main.jsx:7-18` eagerly imports all 12 pages; `jspdf` is statically imported (`FormularioCitas.jsx:3`) though only needed for the PDF button (`:344`). Fix: `React.lazy` + `Suspense` per route and `await import("jspdf")` inside `generarPDF`.
- **No memoization.** `grep "useMemo|useCallback|memo" src` → only false positives (`componentes_memorias`, memory-RAM copy) plus an unused `useMemo` import (`CitaAdmin.jsx:1`). Lists re-render fully: `Productos.jsx:33-38`, `FormularioCitas.jsx:310-312,317-319,365`, `CitaAdmin.jsx:137,187`.
- **Index keys + full-list fetch.** `Productos.jsx:34` uses `key={i}`; `getProducts()` (`productos.js:3-9`) downloads the entire catalog then filters client-side (`Productos.jsx:16-21`). The chatbot independently re-fetches the whole `productos.json` (`chatBot.jsx:8-19`). `public/productos.json` is 30,855 bytes / 1,033 lines today — fine now, but cost grows linearly with catalog size; prefer server-side `?categoria=` filtering + pagination.
- **Images/embeds unoptimized.** All imagery is remote hotlinks (`raw.githubusercontent.com`, `effervescent-concha-1ab1e8.netlify.app`, `m.media-amazon.com` in `productos.json`, Google Maps + YouTube iframes). No `loading="lazy"` on `<img>` (only the two Maps iframes in `Locales.jsx:15,41` have it), no `width/height`/`srcset`, `object-fit: fill` stretches photos (`Locales.jsx:21,47`). `App.jsx:17` banner and `Home.jsx:14,42,50` banners are full-width remote PNGs with no placeholder.
- **Minimal build config.** `vite.config.js:1-7` is just `plugins: [react()]` — no `manualChunks`, no compression, no `assetsInlineLimit` tuning. Fine at this size; revisit if `jspdf` + `react-chatbot-kit` push the initial chunk up.

## Reliability

- **No error boundaries, no 404.** `grep "ErrorBoundary|componentDidCatch|Fallback" src` → zero; `src/main.jsx:23-37` has no `path="*"` route. Any render throw (see below) blanks the whole app.
- **Unhandled / half-handled promises.**
  - `Productos.jsx:16-21`: `getProducts().then(...)` with no `.catch` — backend down = eternal `No products found` (`:32`) plus unhandled rejection.
  - `FormularioCitas.jsx:25-34`: `Promise.all` failure only `console.error`s, leaving selects empty with no user feedback; `handleSubmit:60-74` catches but only `console.log`s (toast only on success).
  - `login.jsx:60-65` / `register.jsx:53-58`: catch-all `alert("Error...")` swallows status codes (no 401 vs 500 distinction).
- **Zero tests.** `glob **/*.test.*` → none; no `vitest`/`jest`/`playwright` in `package.json`. No CI config in repo.
- **Fragile flows (verified by reading code):**
  - `productos.js:11-17`: `p.categoria.name` throws if any product lacks `categoria`; `==` instead of `===` for category compare.
  - `Producto.jsx:7,19`: destructures `description` then `.map`s unconditionally — `undefined` description crashes the list. `price` renders `s/ {price}.00` with no locale formatting.
  - `FormularioCitas.jsx:45`: `new Date(fechaCita).toISOString()` throws `RangeError` on empty/invalid date; `fechaAtencion` input (`:328`) has no `min`, so past dates are accepted despite `today` existing (`:9`). Disabled `nombreCliente`/`correo` inputs carry `required` (`:305-306`) — harmless but contradictory. PDF bug: `descLines` is computed from `row[5]` (Tipo) with `colWidths[5]` but rendered into the Descripción column (`:183,206-207` — should be `row[7]`/`colWidths[7]`), so long descriptions overflow their cell.
  - `CitaAdmin.jsx:170`: `(!citas || citas.length) === 0` compares an array-or-boolean to `0` — always `false` when `citas` is an array, so the "No hay citas" empty state never shows. Admin table renders only mock data, never backend data.
  - `Productos.jsx:22-25`: cleanup calls `setProductos([])` on unmount — React 18+ warns/flags setState-after-unmount patterns; use an abort flag instead.
  - Dead CTAs: `COMPRAR` (`Home.jsx:26,31`; `Producto.jsx:25`), `REALIZAR PEDIDO` (`Delivery.jsx:26,50`) are `<button>`s with no `onClick` — users get zero feedback.

## Accessibility & UX

- **Semantics (mixed).** Good: `<header>` (`Header.jsx:21`), `<nav>` (`:49`), `<main>` (`App.jsx:19`, `Delivery.jsx:7`, `MapSite.jsx:8`), `<footer>` (`Footer.jsx:9`). Bad: `<h2>•</h2>` used as menu separators (`Header.jsx:108,113,119,125,131,139,148`); multiple `<h1>`s per page (`Servicios.jsx` has four; `Locales.jsx` two at `250%` + heavy inline styles); `Pago.jsx` structures payment data as `<p>` + `<br>` instead of `<dl>`/list.
- **Alt text.** Empty: `Producto.jsx:13` (`alt=""` on the primary product image), `Servicios.jsx:25,52` (`alt=""`). Generic/wrong: `Header.jsx:25` (`alt="logo"`), `Pago.jsx:22` YAPE image labeled `alt="plin"`. Good: `App.jsx:17`, `Home.jsx:15,43,51`, `Locales.jsx:22,48`.
- **Keyboard.** Catalog dropdowns (`Header.jsx:52-106`) are hover-CSS-only: `CATÁLOGO`, `Laptops`, `PC Armadas`, `Componentes` are plain `<li>` text, not focusable buttons — keyboard/screen-reader users cannot open them. No `:focus-within` fallback verified. Chatbot FAB (`chatBot.jsx:200-219`) is an emoji-only `💬` button with no `aria-label`/`aria-expanded`, and the 370px panel (`:222-233`) has no focus trap or `Escape` to close. `Servicios.jsx:64-72` inputs have visual `<label>`s with no `htmlFor`/`id` association.
- **Language.** `index.html:2` declares `lang="en"` but all content is Spanish — screen readers use the wrong pronunciation model. Should be `lang="es"`.
- **Feedback.** `alert()` in auth/admin flows blocks assistive tech; `FormularioCitas` uses `react-toastify` correctly (`closeOnClick`, `pauseOnHover`, `:77-83,390`) but only toasts success/cancel paths. `Productos.jsx:32` empty state is English (`No products found`) in a Spanish UI; chatbot has no visible `aria-live` announcement wiring of its own (relies on library default).
- **Layout fragility.** Fixed `1100px` rules (`Servicios.jsx:33`, `Locales.jsx:25`), `600px`-tall `object-fit: fill` photos (`Locales.jsx:21,47`), and inline `marginLeft: 13%` banners (`Home.jsx:12,30,48`) will overflow on mobile. `index.html:6` viewport is set (good), but CSS does not follow through responsively.

## Prioritized Recommendations

| # | Issue | Severity | Effort | Suggested fix |
|---|-------|----------|--------|---------------|
| 1 | Hardcoded `http://localhost:3000` in 8+ call sites; production build calls localhost | High | S | Add `VITE_API_URL`, create `src/lib/api.js` axios instance (`baseURL`, `timeout: 10000`, auth interceptor reading `localStorage`), replace all literals (`productos.js:5`, `login.jsx:25`, `register.jsx:22`, `FormularioCitas.jsx:51,228,245,262,282`, `CitaAdmin.jsx:36,57,75`) |
| 2 | Auth token + role in `localStorage`, role enforced only in UI, `/admin` unguarded (`main.jsx:36`, `Header.jsx:137,146`) | High | M | Short-term: add `RequireAuth`/`RequireRole` route guards + `Bearer null` guard; long-term: httpOnly cookie session, server-side role checks on every endpoint |
| 3 | Case-mismatched imports (`App.jsx:2`, `main.jsx:11`) break case-sensitive builds | High | S | Rename imports to `./componentes/header/Header.jsx` and `./pages/locales/Locales.jsx`; add CI `vite build` on Linux to prevent regression |
| 4 | No error boundary, no `*` 404 route, unhandled `getProducts()` rejection (`Productos.jsx:16`) | High | S | Add `ErrorBoundary` around `<Outlet/>`, add `path="*"` NotFound page, add `.catch` + loading/error states to `Productos`, `FormularioCitas`, auth flows |
| 5 | `styled-components@4` + React 19 + dead dep (`package.json:20,26`, zero imports) | Med | S | If unused: `npm rm styled-components @types/styled-components`. If needed: upgrade to v6 + `@types` match, regression-test under React 19 |
| 6 | `CitaAdmin` non-functional core: `tiposCitasList` never loaded (`:20,142-147`), actions local-only (`:25-31`), empty-state boolean bug (`:170`), dead `obtenerMiInfo` (`:54-69`) | High | M | Wire to real endpoints (tipos, list, cancel/complete), delete mock path or feature-flag it, fix `:170` to `citasFiltradas.length === 0` |
| 7 | `FormularioCitas` date/PDF bugs: `new Date(...)` throw (`:45`), no `min` past-date guard (`:328`), PDF column-index bug (`:183,206-207`), `required`+`disabled` (`:305-306`) | Med | S | Validate date before `toISOString`, add `min={today}`, fix to `row[7]`/`colWidths[7]`, use `readOnly` instead of `disabled` (or drop `required`) |
| 8 | Crash-prone rendering: `p.categoria.name` (`productos.js:13`), `description.map` (`Producto.jsx:19`), `==` compare (`productos.js:15`) | Med | S | Optional-chaining + fallbacks (`p.categoria?.name ?? ""`), `Array.isArray(description) ? ... : null`, `===`, guard + unit tests |
| 9 | Sitemap + Servicios dead links/forms (`MapSite.jsx` all `/pages/...`, `Servicios.jsx:32,63-79`), dead CTAs (`Home.jsx:26,31`, `Producto.jsx:25`, `Delivery.jsx:26,50`), broken `/img/*.png` refs (only `productos.json` exists in `public/`) | Med | S | Point links at real routes, remove or implement dead forms/buttons, add missing assets or drop refs; add a link-checker or 404 test |
| 10 | No lazy routes / static `jspdf` import (`main.jsx:7-18`, `FormularioCitas.jsx:3`); index-key lists; full-catalog fetch ×2 | Med | M | `React.lazy`+`Suspense` for pages, dynamic `import("jspdf")`, stable `key={p.id ?? ...}`, server-side filter/pagination |
| 11 | Keyboard/a11y blockers: unfocusable dropdown parents (`Header.jsx:52-106`), `h2` bullets (`:108-148`), emoji-only chatbot FAB (`chatBot.jsx:200-219`), `lang="en"` (`index.html:2`), empty alts (`Producto.jsx:13`, `Servicios.jsx:25,52`) | Med | M | Real `<button aria-haspopup/expanded>` menus with `:focus-within`, semantic separators, labeled FAB + `Escape` close + focus trap, `lang="es"`, meaningful alts |
| 12 | `console.*` PII-adjacent logging (29 hits) + `alert()` UX (`login.jsx`, `register.jsx`, `CitaAdmin.jsx`) | Low | S | Remove/gate logs (`import.meta.env.DEV`), replace `alert` with `toast` + inline field errors |
| 13 | `index.html` has commented favicon; `Pago.jsx` alt typo (`:22` YAPE labeled "plin"), repeated placeholder bank numbers (`:39-67`) | Low | S | Restore favicon, fix alts, confirm real account numbers before release |
| 14 | No tests / no CI (`glob **/*.test.*` empty) | Med | M | Add vitest smoke tests for `getByCategory`/`getTitleCategory`/guards + `vite build` + `eslint` in CI; add Playwright happy-path for login→cita later |
| 15 | `react-chatbot-kit@2` under React 19 `[heuristic]` + chatbot races (`productos` module-global, `void cargarProductos()`, `:6,19`) + hardcoded phone (`chatBot.jsx:121`) | Low | S | Smoke-test chatbot under StrictMode/React 19, move products into state/context with loading state, move phone to config |

## Generated summary

Inspected 20 source files + `package.json`, `vite.config.js`, `index.html`, `public/productos.json` (1,033 lines). No TODO/FIXME markers, no `dangerouslySetInnerHTML`, no committed secrets; the single `target="_blank"` is correctly paired with `rel`. Top risks are all verified in code: localhost-hardcoded API URLs, `localStorage` JWT with UI-only role checks and an unguarded `/admin` route, case-mismatched imports that fail on Linux, zero error boundaries/tests/404 handling, a partly non-functional admin panel and appointment-form edge cases, and keyboard/a11y blockers in nav and chatbot. Dependency-wise, `styled-components@4` (+ v5 types) is unused and `[heuristic]`-incompatible with React 19 — removal is the cheapest fix.
