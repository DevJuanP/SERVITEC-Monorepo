# Testing

Evidence base: `package.json`, `vite.config.js`, `eslint.config.js`, Glob for
`**/*.test.*` / `**/*.spec.*` / `**/__tests__/**`, `src/servicios/productos.js`,
`src/pages/citas/FormularioCitas.jsx`, `src/componentes/bot/chatBot.jsx`.

## Current State

- **No test runner installed.** `package.json` devDependencies are only
  `@eslint/js`, `@types/react`, `@types/react-dom`, `@types/styled-components`,
  `@vitejs/plugin-react-swc`, `eslint`, `eslint-plugin-react-hooks`,
  `eslint-plugin-react-refresh`, `globals`, `vite`. No `vitest`, `jest`, `playwright`,
  `cypress`, `@testing-library/*`, or `jsdom`/`happy-dom` anywhere.
- **No test files exist.** Glob for `**/*.test.*` → 0 hits; `**/*.spec.*` → 0 hits;
  `**/__tests__/**` → 0 hits. Verified against the full repo (only `node_modules` excluded
  by convention; no project-level test dirs).
- **No coverage config.** `vite.config.js` is 7 lines (`defineConfig({ plugins: [react()] })`) —
  no `test` section, no coverage provider. No `vitest.config.*`, `jest.config.*`,
  `playwright.config.*`, or `cypress.config.*` files in repo root.
- **Only quality gate today is lint:** `eslint .` over `**/*.{js,jsx}` (flat config,
  `js.configs.recommended` + react-hooks + react-refresh + one `no-unused-vars` rule).
  `npm run lint` passes/fails the build signal; nothing else guards regressions.

## How To Run

- `npm run lint` — the only verification command (`eslint .`). Run before every commit.
- `npm run dev` — local dev server (Vite). Manual verification path.
- `npm run build` — production build (`vite build`). Catches import/case errors (e.g. the
  `header/Header.jsx` vs `header.jsx` casing risk, the `Sevicios` alias in `main.jsx:8`).
- **There is NO test script.** `package.json` scripts are exactly
  `{ dev, build, lint, preview }` — `npm test` / `npm run test` will fail with
  "Missing script: test". Do not document a test command until a runner is added.

## Patterns

- **No local test patterns to follow** (nothing exists to imitate).
- **Recommended minimal setup for this Vite + React 19 stack** (do only when the team agrees;
  keep it to these four steps):
  1. `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`
     (plus `@testing-library/user-event` if form tests are wanted).
  2. Add a `test` section to `vite.config.js`
     (`test: { environment: 'jsdom', setupFiles: ['./src/test-setup.js'] }`) and
     `"test": "vitest run"` to `package.json` scripts.
  3. Co-locate tests with sources: `src/servicios/productos.test.js` for pure helpers,
     `src/pages/logReg/login.test.jsx` style for components. Use `describe/it/expect` from
     `vitest`, `render/screen` from `@testing-library/react`.
  4. First tests to write (highest value, no backend needed): `getByCategory` filtering and
     `getTitleCategory` mapping in `src/servicios/productos.js:11-47`; chatbot pure helpers
     (`obtenerProductosPorCategoria`, `obtenerProductosPorPresupuesto`,
     `construirMensajeProductos` in `src/componentes/bot/chatBot.jsx:21-51`) — but note these are
     currently module-private, so they must be exported or extracted to be testable.
- **What NOT to do:** do not introduce Jest with babel (conflicts with the SWC plugin), do not
  add E2E (Playwright/Cypress) before unit coverage exists, do not commit snapshot tests of
  whole pages — the markup churns too fast (see `Home.jsx`, `Pago.jsx`).

## Gaps & Recommendations

Untested and risky, in priority order:

1. **Auth flow (`login.jsx:24-66`, `register.jsx:21-59`)** — hardcoded
   `http://localhost:3000/api/auth/*`, success detected by string-matching
   (`responseApi.mensaje === "Login exitoso"` / `"Usuario registrado con éxito"`), session
   persisted across three `localStorage` keys. Any backend message change silently breaks login.
   *Next step:* extract `iniciarSesion`/`registrarUsuario` into `src/servicios/auth.js` behind a
   shared axios instance + env base URL, then unit-test success/failure mapping with mocked axios.
2. **Category filtering (`servicios/productos.js:11-17`)** — builds keys as
   `p.categoria.name + "_" + p.categoria.Subcategoria` with `==` after `trim()`. A backend casing
   change (`Subcategoria` → `subcategoria`) empties every catalog page, and the UI fallback is the
   English `No products found` (`Productos.jsx:31-32`). *Next step:* unit-test `getByCategory`
   with representative payloads, including missing/mistyped category fields.
3. **Citas mutations (`FormularioCitas.jsx:41-74,274-297`)** — date coercion
   (`new Date(fechaCita).toISOString()`), `Number(tipoCitaId) || tipoCitaId` fallback, cancel-by-body
   `{ citaId: id }`. No validation tests; a bad date produces `Invalid Date` → `toISOString` throw.
   *Next step:* extract payload builders and test edge inputs (empty date, non-numeric type id).
4. **Admin panel (`CitaAdmin.jsx`)** — `tiposCitasList` is never populated (lines 20, 144 render an
   empty select), `obtenerMiInfo`/`tiposCitasList` fetchers are dead-ish, and the empty-state guard
   `(!citas || citas.length) === 0` (line 170) is a tautology bug (always false when `citas` is an
   array). Local-only `cancelarCitaAction`/`completarCitaAction` diverge from server state.
   *Next step:* component test asserting empty-state rendering and action-handler state transitions
   once data fetching is extracted.
5. **Chatbot keyword router (`chatBot.jsx:61-99`)** — long `if/else` on `includes()`; ordering
   matters ("presupuesto 1500" vs product-name fallback) and is untested. *Next step:* table-driven
   unit tests over `parse` inputs once helpers are exported.

## Generated summary

No test infrastructure, files, or scripts exist as of 2026-09-12 (verified by Glob + `package.json`
+ `vite.config.js` inspection): the sole automated check is `npm run lint`, and `package.json` has
no `test` script. Highest-leverage first move is adding Vitest + Testing Library and covering the
pure, backend-independent helpers (`getByCategory`, `getTitleCategory`, chatbot message builders)
before attempting component or E2E tests.
