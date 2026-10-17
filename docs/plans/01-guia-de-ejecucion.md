# Guía de ejecución — secuencia de las especificaciones

## Objetivo
Fijar el **orden de ejecución** de las especificaciones (`docs/specs/01`–`10`) y sus planes
(`docs/plans/`), con dependencias, entregables, comandos y Definición de Terminado (DoD) por fase.
Es la guía operativa derivada del roadmap (`00-roadmap.md`): *qué se hace primero y por qué*.

## Principio de dependencias
Ambos fronts consumen la **misma API**; por eso el backend va **primero**. La secuencia es estrictamente
hacia adelante: cada fase se apoya en la anterior.

```
F0 Migraciones ──► F1 Backend (apps/api) ──► F2 Front público (apps/front) ──► F3 Panel admin (apps/admin)
   (hecho)                  │                          ▲                              ▲
                            └──────────────────────────┴──────────────────────────────┘
                                     (F2 y F3 consumen el contrato ya probado en F1)
```

## Orden de referencia de la documentación
| # | Documento | Rol en la ejecución |
|---|---|---|
| 01 | `docs/specs/01-functional.md` | Alcance, HUs, reglas R-1…R-15, pruebas P01–P13 |
| 02 | `docs/specs/02-data-model.md` | Modelo relacional (valida la F0) |
| 03 | `docs/specs/03-api-contract.md` | **Fuente de verdad** del contrato (F1–F3 lo implementan/consumen) |
| 04 | `docs/specs/04-backend-conventions.md` | Estructura, seguridad, errores (F1) |
| 05 | `docs/specs/05-db-migrations.md` | Convención Flyway (F0) |
| 06 | `docs/specs/06-front-adaptation.md` | Adaptación del front y deuda (F2) |
| 07 | `docs/specs/07-install-guide.md` | Instalación y credenciales (todas las fases) |
| 08 | `docs/specs/08-ops-manual.md` | Operación, respaldo y diagnóstico |
| 09 | `docs/specs/09-admin-panel.md` | Panel `apps/admin` (F3) |
| 10 | `docs/specs/10-front-publico-citas.md` | Citas del cliente por franjas (F2) |

> Orden de lectura recomendado: `01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10`.
> Orden de **implementación**: F0 → F1 → F2 → F3 (abajo).

---

## F0 · Migraciones — *hecho*
- **Spec/plan:** `05-db-migrations.md` · `db/migrations/README.md`.
- **Entregable:** `V1__esquema_inicial.sql`, `V2__catalogo.sql`, `V3__citas.sql`,
  `V4__contacto_notificaciones.sql` + semilla `R__01`–`R__04`.
- **Comandos (opcional, manual):**
  ```bash
  flyway -url=jdbc:postgresql://localhost:5432/servitec -user=servitec migrate
  ```
- **DoD:** `V1`–`V4` + semilla aplican sin error en base vacía; agotados `{2,12,48}`; reaplicar no duplica.

## F1 · Backend `apps/api` — *primero*
- **Specs:** `03-api-contract.md`, `04-backend-conventions.md`, `02-data-model.md`.
- **Plan:** `plan-backend.md` (fases B1→B6).
- **Pasos (en orden):**
  1. **B1 Bootstrap** — proyecto Spring Boot 4.1.x/Java 21, `application.yml`, Flyway (`V1`–`V4`), `ddl-auto: validate`.
  2. **B2 Seguridad** — JWT HS256 (2 h), `SecurityConfig` por rol, `CorsConfig` (`:5173`/`:5174`), BCrypt.
  3. **B3 Auth y usuarios** — `register`/`login`/`myInfo`/`GET /api/user`/`asesores`/`clientesPorCorreo`.
  4. **B4 Catálogo** — `GET /api/categorias`, `GET /api/productos`(+`/admin`), CRUD admin (borrado físico).
  5. **B5 Citas** — `tipoCita`, `disponibilidad`(+`Semana`), `GET /api/cita`, `agregarCita`/`agregarCitaAdmin`,
     `aprobar`/`completar`/`cancelar`, notificaciones.
  6. **B6 Errores y pruebas** — `GlobalExceptionHandler` + MockMvc **P01–P13**.
- **Comandos:**
  ```bash
  cd apps/api && ./mvnw spring-boot:run   # Windows: mvnw.cmd spring-boot:run
  cd apps/api && ./mvnw test
  ```
- **Entregable:** API completa respetando C-1…C-11 y mensajes exactos.
- **DoD:** `mvn test` verde (P01–P13); cada endpoint responde como `03`; CORS operativo para `:5173`/`:5174`.

## F2 · Front público `apps/front` — *segundo*
- **Specs:** `10-front-publico-citas.md`, `06-front-adaptation.md`.
- **Plan:** `plan-front-publico.md` (fases F1→F3).
- **Pasos (en orden):**
  1. **Citas por franjas (B16)** — selects de asesor/tipo reales, `CalendarioSemanal`
     (`disponibilidadSemana`), `FranjaPicker` (`disponibilidad`), contacto (R-15), envío a
     `POST /api/cita/agregarCita` en ISO UTC (Lima), `MisCitas` + cancelar, campana de notificaciones.
  2. **Retirar el panel** — eliminar ruta `/admin` y `CitaAdmin.jsx`; enlazar `VITE_ADMIN_URL` desde el `Header`.
  3. **Verificación** — `npm run build` sin errores; sin URLs `localhost` hardcodeadas.
- **Comandos:**
  ```bash
  cd apps/front && npm install && npm run dev    # http://localhost:5173
  cd apps/front && npm run build
  ```
- **DoD:** reserva siempre en franja válida; `/admin` inexistente; solo `admin`/`asesor` ven el enlace al panel.

## F3 · Panel admin `apps/admin` — *tercero*
- **Spec:** `09-admin-panel.md`.
- **Plan:** `plan-admin.md` (fases A1→A6).
- **Pasos (en orden):**
  1. **A1 Andamiaje** — Vite/React 19 en `:5174`, `api.js`, `AuthContext`, guardas, `AdminLayout`.
  2. **A2 Auth y dashboard** — login (solo `admin`/`asesor`), dashboard (conteos de catálogo/stock solo `admin`).
  3. **A3 Catálogo e inventario** — `GET /api/productos/admin` + CRUD con `stock`.
  4. **A4 Citas** — agenda con filtros, `NuevaCita` (`agregarCitaAdmin`), `aprobar`/`completar`/`cancelar`.
  5. **A5 Usuarios** — listado, búsqueda de clientes, alta de asesores.
  6. **A6 Verificación** — `npm run dev` en `:5174` + `npm run build`.
- **Comandos:**
  ```bash
  cd apps/admin && npm install && npm run dev    # http://localhost:5174
  cd apps/admin && npm run build
  ```
- **DoD:** criterios de `09-admin-panel.md`; CORS `:5174` operativo; el front público ya no expone `/admin`.

---

## DoD general (todas las fases)
- Se respeta el contrato `03-api-contract.md` (formas `_id`/`type`/`Subcategoria`, mensajes exactos, estados canónicos).
- `mvn test` (backend) y `npm run build` (cada front) pasan sin errores.
- Sin URLs `localhost` hardcodeadas en los fronts (solo vía `VITE_*`).
- Reglas R-1…R-15 cubiertas por P01–P13.
- La deuda diferida (`06` B1–B18, `09` A1–A4, B-MONO) queda **fuera** salvo lo indicado por fase.

## Checklist de ejecución
- [ ] F0 — Migraciones aplicadas y verificadas *(hecho)*
- [ ] F1 — `apps/api` con `mvn test` verde (P01–P13)
- [ ] F2 — Front público cierra B16, `/admin` retirado y `VITE_ADMIN_URL` enlazado
- [ ] F3 — `apps/admin` funcional en `:5174`

## Dependencias y referencias
- Roadmap y estado: [`00-roadmap.md`](./00-roadmap.md).
- Planes por workstream: [`plan-backend.md`](./plan-backend.md),
  [`plan-front-publico.md`](./plan-front-publico.md), [`plan-admin.md`](./plan-admin.md).
- Trazabilidad HU ↔ endpoint ↔ regla ↔ prueba: [`matriz-trazabilidad.md`](./matriz-trazabilidad.md).
- Instalación/credenciales: `docs/specs/07-install-guide.md`. Operación: `docs/specs/08-ops-manual.md`.
