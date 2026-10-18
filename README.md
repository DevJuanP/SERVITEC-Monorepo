# SERVITEC — Monorepo

Monorepo del proyecto **SERVITEC** (comercio de hardware y asesoría técnica) desarrollado para
**EFSRT VI**. Reúne el frontend reutilizado, el backend y las migraciones de base de datos, junto
con las **especificaciones** desde las que se generan los planes de ejecución.

## Estructura

```
SERVITEC-Monorepo/
├─ apps/
│  ├─ front/          Frontend público React 19 + Vite (reutilizado y adaptado)
│  ├─ admin/          Panel de administración React 19 + Vite (segundo front, planificado)
│  └─ api/            Backend Spring Boot 4.1.x + Java 21  (implementado)
├─ db/
│  └─ migrations/     Migraciones Flyway (esquema + semilla implementados)
├─ docs/
│  ├─ entregable_2_grupo10 (1).docx
│  ├─ actualizaciones-word/
│  ├─ specs/          Especificaciones técnicas (fuente de los planes)
│  └─ plans/          Planes de implementación (roadmap y por workstream)
├─ .env.example
└─ .gitignore
```

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite (JS) · `axios` · `react-router-dom` 7 |
| Panel admin | React 19 + Vite (JS) · `axios` · `react-router-dom` 7 (segundo front, `apps/admin`) |
| Backend | Spring Boot 4.1.x · Java 21 (LTS) · Maven · Controller–Service–Repository |
| Seguridad | Spring Security 7 · OAuth2 Resource Server (JWT HS256) |
| Base de datos | PostgreSQL 18 |
| Migraciones | Flyway (`db/migrations`) |
| Pruebas | JUnit + MockMvc (P01–P13) |

## Estado actual

- `apps/front` → **implementado** (citas por franjas B16, `CalendarioSemanal`, `FranjaPicker`, `MisCitas`, `Notificaciones`, contacto R-15, conversión Lima→UTC, toasts 400/409, `/admin` retirado, enlace `VITE_ADMIN_URL`).
- `apps/admin` → **implementado** (`apps/admin` funcional en `:5174`: login con guardas por rol, dashboard admin/asesor, catálogo CRUD con stock, citas agenda/filtros/nueva/aprobar/concluir/cancelar, usuarios listado/búsqueda/alta asesor, CORS `:5174` operativo).
- `apps/api` → **implementado** (API REST completa, P01–P13 en verde con `mvnw.cmd test`).
- `db/migrations` → **implementado** (esquema `V1`–`V4` + semilla `R__01`–`R__04`).
- `docs/specs` → **especificaciones escritas** (plan-ready), incluida `10-front-publico-citas.md`.
- `docs/plans` → **planes de implementación** (roadmap + backend + fronts + trazabilidad) — **F1, F2, F3 cerradas**.

## Requisitos previos

- **Node.js** 20+ (recomendado 24) y npm.
- **JDK 21** (LTS) — el equipo trabaja hoy con JDK 17; el backend requiere 21.
- **PostgreSQL 18** local.
- **Git**.

## Cómo levantar los fronts

```bash
cd apps/front
cp .env.example .env      # ajusta VITE_API_URL si hace falta
npm install
npm run dev               # http://localhost:5173
```

El panel de administración será un segundo front (`apps/admin`, puerto `5174`) — ver
`docs/specs/09-admin-panel.md`. Ambos apuntan a la API definida en `VITE_API_URL`
(por defecto `http://localhost:8080`).

## Cómo levantar el backend

Implementado en `apps/api` (requiere JDK 21 en `JAVA_HOME`):

```bash
cd apps/api
./mvnw spring-boot:run    # Windows: mvnw.cmd spring-boot:run · http://localhost:8080, aplica Flyway de db/migrations
./mvnw test               # Windows: mvnw.cmd test · P01–P13
```

Configuración por entorno (ver `.env.example`): `SPRING_DATASOURCE_URL`,
`SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`.

## Documentación

| Documento | Contenido |
|---|---|
| `docs/specs/01-functional.md` | Alcance funcional, historias de usuario, criterios de aceptación |
| `docs/specs/02-data-model.md` | Modelo ER y diccionario de datos |
| `docs/specs/03-api-contract.md` | Contrato REST (endpoints, auth, roles) |
| `docs/specs/04-backend-conventions.md` | Estructura y convenciones del backend |
| `docs/specs/05-db-migrations.md` | Convenciones de migraciones Flyway |
| `docs/specs/06-front-adaptation.md` | Adaptación del front y backlog de deuda técnica |
| `docs/specs/07-install-guide.md` | Guía de instalación |
| `docs/specs/08-ops-manual.md` | Manual técnico de operación |
| `docs/specs/09-admin-panel.md` | Panel de administración (segundo front `apps/admin`) |
| `docs/specs/10-front-publico-citas.md` | Citas del cliente por franjas en el front público (B16) |
| `docs/actualizaciones-word/cambios-para-el-word.md` | Cambios pendientes de redacción en el documento Word |

### Planes de implementación (`docs/plans/`)

| Documento | Contenido |
|---|---|
| `docs/plans/00-roadmap.md` | Orden, fases, dependencias y DoD |
| `docs/plans/01-guia-de-ejecucion.md` | Secuencia de ejecución de las specs (guía paso a paso) |
| `docs/plans/plan-backend.md` | Implementación de `apps/api` (P01–P13) |
| `docs/plans/plan-front-publico.md` | Citas por franjas (B16) y retiro de `/admin` |
| `docs/plans/plan-admin.md` | Implementación del panel `apps/admin` |
| `docs/plans/matriz-trazabilidad.md` | HU ↔ endpoint ↔ regla ↔ prueba |

## Convenciones

- **Specs** en español; **JSON y base de datos** en español (contrato existente); **código Java** en inglés.
- Commits en [Conventional Commits](https://www.conventionalcommits.org/).

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-10-18 | **F3 Panel admin ✅ verificado** — `apps/admin` (React 19 + Vite 7, `:5174`) funcional: login con guardas por rol (admin/asesor/cliente rechazado), dashboard admin (conteos catálogo + stock agotado) / asesor (agenda), catálogo CRUD admin (`GET /api/productos/admin`, `stock ≥ 0`, `price > 0`, subcategoría válida), citas agenda con filtros + `NuevaCita` (`agregarCitaAdmin` + `FranjaPicker`) + acciones `aprobar`/`completar` (observación obligatoria) / `cancelar` con notificaciones, usuarios listado + búsqueda `clientesPorCorreo` + alta asesores, CORS `:5174` operativo, `npm run build` en verde. |
| 2026-10-18 | **F2 Front público ✅ verificado** — `npm run build` en verde. B16 cerrado: `CalendarioSemanal` (disponibilidadSemana 5×7), `FranjaPicker` (disponibilidad), contacto R-15, conversión Lima→UTC, toasts 400/409, `MisCitas` con cancelación, `Notificaciones` (campana). `/admin` y `CitaAdmin.jsx` retirados. `Header` enlaza panel con `VITE_ADMIN_URL`. Sin URLs `localhost` hardcodeadas. |
| 2026-10-18 | **F1 Backend ✅ verificado** — `mvnw.cmd test` en verde (14 tests: P01–P13 + context + P07) con PostgreSQL 16 local operativo (`servitec` / `servitec_test`, rol `servitec`). Flyway aplica V1–V4 + semillas. CORS `:5173`/`:5174` confirmado. |
| 2026-10-17 | **F1 Backend implementado** — `apps/api` (Spring Boot 4.1 / Java 21): seguridad JWT HS256 + CORS `:5173`/`:5174`, auth/usuarios, catálogo, citas, notificaciones, `GlobalExceptionHandler`. `plan-backend.md` normalizado a plantilla §4. Tests pendientes de BD (resuelto 2026-10-18). |
