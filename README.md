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
├─ tools/
│  └─ db-setup/       Script Node.js: crea rol/bases, genera .env y aplica Flyway
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
- `tools/db-setup` → **implementado** (mini app Node.js: crea rol/bases, genera `.env` + `dev-env.ps1`/`.sh` y aplica Flyway vía `mvnw flyway:migrate` sin arrancar la API).
- `docs/specs` → **especificaciones escritas** (plan-ready), incluida `10-front-publico-citas.md`.
- `docs/plans` → **planes de implementación** (roadmap + backend + fronts + trazabilidad) — **F1, F2, F3 cerradas**.

## Requisitos previos

- **Node.js** 20+ (recomendado 24) y npm.
- **JDK 21** (LTS) — el equipo trabaja hoy con JDK 17; el backend requiere 21.
- **PostgreSQL 18** local.
- **Git**.

## Entorno y ejecución rápida

### 0. Camino automatizado (recomendado)

`tools/db-setup` crea el rol y las bases, genera los `.env` y aplica las migraciones Flyway
sin arrancar la API:

```powershell
copy tools\db-setup\.env.example tools\db-setup\.env   # y edita la contraseña del superusuario
cd tools\db-setup
npm install
npm run setup
```

Al terminar, carga las variables en la terminal y levanta el backend:

```powershell
. .\dev-env.ps1                          # desde la raíz del repo
cd apps/api
.\mvnw.cmd spring-boot:run
```

Detalles y solución de problemas: `tools/db-setup/README.md`.
Los pasos manuales de abajo siguen siendo válidos si prefieres hacerlo a mano.

### 1. Variables de entorno

Desde la raíz del repo, copia el archivo de ejemplo y ajusta si es necesario:

```powershell
# Windows PowerShell
copy .env.example .env
```

El `.env.example` ya incluye:

```
# --- Puertos y URLs (ningún puerto está escrito en el código) ---
SERVER_PORT=8080            # puerto de la API (application.yml)
VITE_API_URL=http://localhost:8080
VITE_ADMIN_URL=http://localhost:5174
VITE_PORT=5173              # dev server del front (apps/admin usa 5174)

# --- Backend (apps/api) ---
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/servitec
SPRING_DATASOURCE_USERNAME=servitec
SPRING_DATASOURCE_PASSWORD=cambia_esta_password
JWT_SECRET=cambia_este_secreto_super_seguro

# Orígenes permitidos por CORS (los fronts)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

> **Puertos configurables.** Nada está fijado en el código: el backend lee `SERVER_PORT`
> y `CORS_ALLOWED_ORIGINS`, y cada front lee su `VITE_PORT` en `vite.config.js`.
> Con `tools/db-setup` basta cambiar `API_PORT` / `FRONT_PORT` / `ADMIN_PORT` en
> `tools/db-setup/.env` y re-ejecutar `npm run setup`: se regeneran el `dev-env`,
> los `.env` de los fronts y el CORS de forma consistente. Los valores por defecto
> son los mismos de siempre (`8080`, `5173`, `5174`), así que nadie se ve afectado
> si no toca nada.


> Spring Boot **no** lee el `.env` de la raíz: hay que exportar esas variables en la
> terminal antes de arrancar la API. `npm run setup` de `tools/db-setup` genera
> `dev-env.ps1` (y `dev-env.sh`) justo para eso; si lo haces a mano, define
> `SPRING_DATASOURCE_PASSWORD` y `JWT_SECRET` en la sesión.

> **En otra máquina:** los archivos de entorno **se versionan** en este repo (proyecto de
> dos personas, credenciales solo de desarrollo). Al clonar ya vienen: lo único que hay que
> ajustar es `PGSUPERPASSWORD` en `tools/db-setup/.env` y correr `npm run setup`.
> Detalle completo en `tools/db-setup/README.md` → «Otra máquina (tu compañero, otro PostgreSQL)».

### 2. Levantar el backend (`apps/api`)

Requiere **JDK 21** en `JAVA_HOME` y PostgreSQL corriendo en `:5432` con la BD `servitec`.
El puerto sale de `SERVER_PORT` (por defecto `8080`, el valor de `application.yml`).

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
cd apps/api
.\mvnw.cmd spring-boot:run   # aplica Flyway de db/migrations
```

Si necesitas otro puerto (por ejemplo porque `8080` está ocupado), no toques el código:

```powershell
$env:SERVER_PORT = "8092"    # y ajusta VITE_API_URL de los fronts al mismo valor
```

Verificación de pruebas (P01–P13). Ojo: las pruebas usan `servitec_test`, no la BD de
desarrollo, así que reasigna la URL si cargaste `dev-env.ps1`:

```powershell
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/servitec_test"
.\mvnw.cmd test
```

### 3. Levantar el front público (`apps/front`, puerto `VITE_PORT`, por defecto 5173)

```powershell
cd apps/front
copy .env.example .env   # si aún no lo hiciste
npm install              # solo la primera vez
npm run dev              # http://localhost:5173
```

### 4. Panel de administración (`apps/admin`, puerto `VITE_PORT`, por defecto 5174)

Implementado (fase F3, `docs/specs/09-admin-panel.md`). Apunta a la misma API (`VITE_API_URL`).

```powershell
cd apps/admin
copy .env.example .env
npm install
npm run dev              # http://localhost:5174
```

### 5. URLs finales (valores por defecto)

| Servicio | URL | Variable que la define |
|---|---|---|
| Backend API | `http://localhost:8080` | `SERVER_PORT` |
| Front público | `http://localhost:5173` | `VITE_PORT` (apps/front) + `VITE_API_URL` |
| Panel admin | `http://localhost:5174` | `VITE_PORT` (apps/admin) + `VITE_ADMIN_URL` |
| CORS del backend | `5173` y `5174` | `CORS_ALLOWED_ORIGINS` |

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
| 2026-10-18 | **Puertos por entorno** — se eliminan los puertos literales: la API lee `SERVER_PORT` y `CORS_ALLOWED_ORIGINS` (`application.yml`), y cada front lee `VITE_PORT` en su `vite.config.js` (`strictPort`). `tools/db-setup` deriva todo de `API_PORT`/`FRONT_PORT`/`ADMIN_PORT` y ahora genera `SERVER_PORT`, `CORS_ALLOWED_ORIGINS` y `VITE_PORT` en `dev-env.*` y los `.env`. Defaults intactos (8080/5173/5174). Verificado: API en 8092 por `SERVER_PORT`, CORS acorde, build de ambos fronts y `mvnw test` 14/14. |
| 2026-10-18 | **Setup automatizado de BD** — nuevo `tools/db-setup` (Node.js + `pg`, sin `psql`): crea rol/bases, genera `.env` + `dev-env.ps1`/`.sh`, aplica Flyway y verifica semilla. `apps/api/pom.xml` declara `flyway-maven-plugin` (sin enlazar a fases) para migrar sin arrancar la API. Verificado end-to-end contra PostgreSQL 18 en contenedor (`--reset`, idempotencia y `mvnw test` 14/14 en verde). |
| 2026-10-18 | **F3 Panel admin ✅ verificado** — `apps/admin` (React 19 + Vite 7, `:5174`) funcional: login con guardas por rol (admin/asesor/cliente rechazado), dashboard admin (conteos catálogo + stock agotado) / asesor (agenda), catálogo CRUD admin (`GET /api/productos/admin`, `stock ≥ 0`, `price > 0`, subcategoría válida), citas agenda con filtros + `NuevaCita` (`agregarCitaAdmin` + `FranjaPicker`) + acciones `aprobar`/`completar` (observación obligatoria) / `cancelar` con notificaciones, usuarios listado + búsqueda `clientesPorCorreo` + alta asesores, CORS `:5174` operativo, `npm run build` en verde. |
| 2026-10-18 | **F2 Front público ✅ verificado** — `npm run build` en verde. B16 cerrado: `CalendarioSemanal` (disponibilidadSemana 5×7), `FranjaPicker` (disponibilidad), contacto R-15, conversión Lima→UTC, toasts 400/409, `MisCitas` con cancelación, `Notificaciones` (campana). `/admin` y `CitaAdmin.jsx` retirados. `Header` enlaza panel con `VITE_ADMIN_URL`. Sin URLs `localhost` hardcodeadas. |
| 2026-10-18 | **F1 Backend ✅ verificado** — `mvnw.cmd test` en verde (14 tests: P01–P13 + context + P07) con PostgreSQL 16 local operativo (`servitec` / `servitec_test`, rol `servitec`). Flyway aplica V1–V4 + semillas. CORS `:5173`/`:5174` confirmado. |
| 2026-10-17 | **F1 Backend implementado** — `apps/api` (Spring Boot 4.1 / Java 21): seguridad JWT HS256 + CORS `:5173`/`:5174`, auth/usuarios, catálogo, citas, notificaciones, `GlobalExceptionHandler`. `plan-backend.md` normalizado a plantilla §4. Tests pendientes de BD (resuelto 2026-10-18). |
