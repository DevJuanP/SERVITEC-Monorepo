# SERVITEC — Monorepo

Monorepo del proyecto **SERVITEC** (comercio de hardware y asesoría técnica) desarrollado para
**EFSRT VI**. Reúne el frontend reutilizado, el backend y las migraciones de base de datos, junto
con las **especificaciones** desde las que se generan los planes de ejecución.

## Estructura

```
SERVITEC-Monorepo/
├─ apps/
│  ├─ front/          Frontend React 19 + Vite (reutilizado y adaptado)
│  └─ api/            Backend Spring Boot 4.1.x + Java 21  (placeholder)
├─ db/
│  └─ migrations/     Migraciones Flyway (placeholder)
├─ docs/
│  ├─ entregable_2_grupo10 (1).docx
│  └─ specs/          Especificaciones técnicas (fuente de los planes)
├─ .env.example
└─ .gitignore
```

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite (JS) · `axios` · `react-router-dom` 7 |
| Backend | Spring Boot 4.1.x · Java 21 (LTS) · Maven · Controller–Service–Repository |
| Seguridad | Spring Security 7 · OAuth2 Resource Server (JWT HS256) |
| Base de datos | PostgreSQL 18 |
| Migraciones | Flyway (`db/migrations`) |
| Pruebas | JUnit + MockMvc (P01–P07) |

## Estado actual

- `apps/front` → **copiado y adaptado mínimamente** (cliente axios único con `VITE_API_URL`, contrato alineado).
- `apps/api` → **placeholder** (pendiente de implementación).
- `db/migrations` → **placeholder** (pendiente de implementación).
- `docs/specs` → **especificaciones escritas** (plan-ready).

## Requisitos previos

- **Node.js** 20+ (recomendado 24) y npm.
- **JDK 21** (LTS) — el equipo trabaja hoy con JDK 17; el backend requiere 21.
- **PostgreSQL 18** local.
- **Git**.

## Cómo levantar el front

```bash
cd apps/front
cp .env.example .env      # ajusta VITE_API_URL si hace falta
npm install
npm run dev               # http://localhost:5173
```

El front apunta a la API definida en `VITE_API_URL` (por defecto `http://localhost:8080`).

## Cómo levantar el backend *(pendiente)*

Se implementará en `apps/api`. Pasos previstos:

```bash
cd apps/api
./mvnw spring-boot:run    # http://localhost:8080, aplica migraciones Flyway de db/migrations
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

## Convenciones

- **Specs** en español; **JSON y base de datos** en español (contrato existente); **código Java** en inglés.
- Commits en [Conventional Commits](https://www.conventionalcommits.org/).
