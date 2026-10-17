# db/migrations — Migraciones de base de datos (Flyway)

Aquí viven las **migraciones SQL versionadas** que construyen el esquema de PostgreSQL desde
cero, más la **semilla** de datos demo. El backend (Spring Boot) las aplica al arrancar
apuntando a este directorio (`spring.flyway.locations=filesystem:../../db/migrations`).

## Estado

`IMPLEMENTADO`. Esquema + semilla listos; se aplican con Flyway en orden.

## Contenido

| Archivo | Tipo | Contenido |
|---|---|---|
| `V1__esquema_inicial.sql` | Versionada | `roles`, `usuarios` |
| `V2__catalogo.sql` | Versionada | `categorias`, `subcategorias`, `productos`, `caracteristicas` |
| `V3__citas.sql` | Versionada | `tipos_cita`, `citas` (+ índice único parcial de agenda) |
| `V4__contacto_notificaciones.sql` | Versionada | Contacto (`usuarios.apellido/telefono`, `citas.contacto_*`) y tabla `notificaciones` |
| `R__01_seed_roles.sql` | Repetible | `admin`, `asesor`, `cliente` |
| `R__02_seed_usuarios.sql` | Repetible | Usuarios demo `@servitec.pe` (BCrypt) |
| `R__03_seed_catalogo.sql` | Repetible | 3 categorías, 12 subcategorías, 60 productos + 300 características, 2 tipos de cita |
| `R__04_seed_citas.sql` | Repetible | Citas demo en los cuatro estados + notificación de ejemplo |

## Convención

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Versionada | `V<versión>__<descripcion>.sql` | `V1__esquema_inicial.sql`, `V2__catalogo.sql` |
| Repetible (semilla) | `R__<NN>_<descripcion>.sql` | `R__03_seed_catalogo.sql` |

- La semilla es **idempotente**: `ON CONFLICT ... DO UPDATE` / `NOT EXISTS` según la tabla.
- El catálogo conserva sus IDs originales (categorías 1–3, subcategorías 101–112, productos 1–60, tipos de cita 1–2).
- El prefijo numérico de las repetibles (`01`–`04`) fija el orden, porque Flyway las ejecuta por descripción en orden alfabético: `roles → usuarios → catálogo → citas`.

## Credenciales de la semilla (solo desarrollo)

Contraseña `Servitec123` (hash BCrypt) para: `admin@servitec.pe`, `asesor@servitec.pe`,
`asesor2@servitec.pe`, `asesor3@servitec.pe`, `cliente@servitec.pe`.

## Verificación

```bash
psql -h localhost -U servitec -d servitec -c "select count(*) from productos;"
psql -h localhost -U servitec -d servitec -c "select count(*) from caracteristicas;"
psql -h localhost -U servitec -d servitec -c "select count(*) from citas;"
```
Esperado: `productos` = 60 (57 con `stock > 0`), `caracteristicas` = 300, `citas` = 5.
