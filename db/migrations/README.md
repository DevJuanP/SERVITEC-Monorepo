# db/migrations — Migraciones de base de datos (Flyway) · *pendiente de implementación*

Aquí viven las **migraciones SQL versionadas** que construyen el esquema de PostgreSQL desde
cero, más la **semilla** de datos demo. El backend (Spring Boot) las aplica al arrancar
apuntando a este directorio (`spring.flyway.locations`).

## Estado

`PLACEHOLDER`. Aún sin migraciones. Se escribirán a partir de los planes derivados de
`docs/specs/05-db-migrations.md` y `docs/specs/02-data-model.md`.

## Convención

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Versionada | `V<versión>__<descripcion>.sql` | `V1__esquema_inicial.sql`, `V2__catalogo.sql` |
| Repetible (semilla) | `R__<descripcion>.sql` | `R__seed_catalogo.sql` |

- La semilla debe ser **idempotente** (`INSERT ... ON CONFLICT DO NOTHING`).
- El catálogo conserva sus IDs originales (categorías 1–3, subcategorías 101–112, productos 1–60, tipos de cita 1–2).
