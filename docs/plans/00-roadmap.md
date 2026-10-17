# Roadmap de implementación — SERVITEC

## Objetivo
Ordenar los workstreams derivados de las specs (`docs/specs/01`–`10`) en una secuencia ejecutable, con
dependencias, entregables y Definición de Terminado (DoD). Los planes por workstream viven en este
directorio.

## Estado de partida
| Workstream | Estado | Plan |
|---|---|---|
| Migraciones (`db/migrations`) | **Implementado** (`V1`–`V3` + `R__01`–`R__04`) | `db/migrations/README.md` |
| Backend (`apps/api`) | Placeholder | [`plan-backend.md`](./plan-backend.md) |
| Front público (`apps/front`) | Adaptado; falta B16 | [`plan-front-publico.md`](./plan-front-publico.md) |
| Panel admin (`apps/admin`) | Solo especificado | [`plan-admin.md`](./plan-admin.md) |

## Orden y dependencias
```
1. Backend (apps/api)  ──►  2. Front público (B16)  ──►  3. Panel admin (apps/admin)
        │                                                      ▲
        └──────────────────────────────────────────────────────┘
             (ambos fronts consumen la API; el panel depende de usuarios/citas)
```
- **Backend primero**: ambos fronts dependen de la API. Incluye CORS `:5173`/`:5174` desde el arranque.
- **Front público segundo**: cierra B16 (`10-front-publico-citas.md`) y retira `/admin`.
- **Panel admin tercero**: espejo de `09-admin-panel.md`; reutiliza el contrato ya probado.

## Fases
| Fase | Workstream | Entregable |
|---|---|---|
| F0 | Migraciones | *(hecho)* esquema + semilla aplicables con Flyway |
| F1 | Backend | API completa (P01–P12) + `mvn test` en verde |
| F2 | Front público | Citas por franjas (B16) + `/admin` retirado + enlace a `VITE_ADMIN_URL` |
| F3 | Panel admin | `apps/admin` funcional en `:5174` |

## Definición de Terminado (DoD) general
- La funcionalidad respeta el contrato de `03-api-contract.md` (formas `_id`, `type`, `Subcategoria`, mensajes exactos).
- `mvn test` (backend) y `npm run build` (cada front) pasan sin errores.
- No se introducen URLs `localhost` hardcodeadas en los fronts (solo vía `VITE_*`).
- Las reglas R-1…R-13 se cumplen y están cubiertas por P01–P12.
- La deuda diferida (`06` B1–B18, `09` A1–A4, B-MONO) queda **fuera** de esta edición salvo lo indicado.

## Riesgos
- Entorno con **JDK 21** y **PostgreSQL 18** (el equipo tiene JDK 17 → apuntar `JAVA_HOME`).
- Documento Word desalineado con el front nuevo → cambios pendientes en `docs/actualizaciones-word/`.
- CORS: verificar arranque del backend con ambos orígenes antes de levantar los fronts.

## Dependencias documentales
- Funcional: `01-functional.md`. Datos: `02-data-model.md`. Contrato: `03-api-contract.md`.
- Backend: `04-backend-conventions.md`. Migraciones: `05-db-migrations.md`.
- Fronts: `06-front-adaptation.md`, `09-admin-panel.md`, `10-front-publico-citas.md`.
- Trazabilidad: [`matriz-trazabilidad.md`](./matriz-trazabilidad.md).
