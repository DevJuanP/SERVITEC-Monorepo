# 05 — Migraciones de base de datos (Flyway)

## Objetivo
Definir cómo se construye el esquema de PostgreSQL **desde cero** de forma versionada, reproducible
y auditable, incluyendo la carga de datos semilla.

## Herramienta y ubicación
- **Flyway** (integración de Spring Boot mediante `flyway-core` + `flyway-database-postgresql`).
- Los scripts viven en la **raíz del monorepo**: `db/migrations/`.
- El backend los aplica al arrancar, apuntando fuera de su módulo:
  `spring.flyway.locations=filesystem:../../db/migrations` (relativo al directorio de trabajo `apps/api`; configurable con `SPRING_FLYWAY_LOCATIONS`).

> Las migraciones son un **entregable de primer nivel** del monorepo, no un detalle interno del backend.

## Convención de nombres
| Tipo | Patrón | Ejemplo |
|---|---|---|
| Versionada | `V<versión>__<descripcion>.sql` | `V1__esquema_inicial.sql` |
| Repetible | `R__<descripcion>.sql` | `R__seed_catalogo.sql` |

Reglas:
- Doble guion bajo (`__`) separa versión y descripción.
- Las versionadas son **inmutables** una vez aplicadas; los cambios van en una versión nueva.
- Las repetibles se re-ejecutan cuando cambia su contenido: la semilla debe ser **idempotente**.

## Plan de migraciones
| Versión | Contenido |
|---|---|
| `V1__esquema_inicial.sql` | `roles`, `usuarios` (+ FK, UNIQUE correo) |
| `V2__catalogo.sql` | `categorias`, `subcategorias`, `productos` (incluye `stock` con CHECK ≥ 0), `caracteristicas` (+ FKs, checks) |
| `V3__citas.sql` | `tipos_cita`, `citas` (+ FKs, CHECK estado con los cuatro valores, columna `observacion`, índices, índice único parcial) |
| `R__seed_roles.sql` | Roles `admin`, `asesor`, `cliente` |
| `R__seed_catalogo.sql` | 3 categorías, 12 subcategorías, 60 productos + características, 2 tipos de cita |
| `R__seed_usuarios.sql` | Usuarios demo (`@servitec.pe`) |
| `R__seed_citas.sql` | Citas demo cubriendo los cuatro estados |

Dependencias de orden: `roles` → `usuarios`; `categorias` → `subcategorias` → `productos` → `caracteristicas`; `tipos_cita` + `usuarios` → `citas`.

## Reglas de la semilla
- La semilla es **idempotente**: `INSERT ... ON CONFLICT DO NOTHING` (o `DO UPDATE` donde corresponda).
- El catálogo conserva los **IDs originales** (categorías 1–3, subcategorías 101–112, productos 1–60, tipos de cita 1–2).
- La semilla de productos asigna `stock` inicial variado (con al menos un agotado) para poder ejecutar P08.
- Tras insertar catálogo con IDs fijos, se debe **reajustar la secuencia de identidad** si la tabla usa identity (`setval`), para no chocar con futuros inserts.
- Las contraseñas de la semilla se insertan ya hasheadas con BCrypt.

## Cómo se aplican
1. **Automático (recomendado)**: al arrancar `apps/api`, Spring Boot ejecuta Flyway contra `db/migrations` antes de inicializar JPA (`ddl-auto: validate`).
2. **Manual (opcional)**: con la CLI de Flyway (`flyway -url=jdbc:postgresql://localhost:5432/servitec -user=servitec migrate`) para desacoplar la migración del arranque.

## Entorno local
- PostgreSQL 18, base `servitec`, usuario `servitec`, esquema `public`.
- Base de pruebas separada `servitec_test` (mismo esquema, aplicado por Flyway en los tests).
- Ver `07-install-guide.md` para la creación de rol/usuario/base.

## Política de cambios (rollback)
- Flyway Community **no** aplica migraciones de deshacer (`undo`). Si una migración está mal:
  - antes de aplicarla en otros entornos → corregir el archivo (aún no aplicado);
  - ya aplicada → crear una versión nueva que la corrija; evitar tocar el historial.
- `flyway_schema_history` es la fuente de verdad del estado del esquema.

## Criterios de aceptación
| Código | Verificación |
|---|---|
| P06 | El catálogo sembrado coincide con lo que devuelve `GET /api/productos` |
| P07 | Si la BD no responde, el arranque/migración falla de forma controlada y queda en el log |
| P08 | El `stock` sembrado respeta `CHECK (stock >= 0)` y los agotados no aparecen en `GET /api/productos` |

- Reaplicar la semilla dos veces no duplica filas.
- `V1`–`V3` + semilla aplican sin error en una base vacía.

## Tareas derivables
1. Escribir `V1__esquema_inicial.sql`, `V2__catalogo.sql`, `V3__citas.sql`.
2. Escribir las migraciones repetibles de semilla (`R__seed_*.sql`).
3. Configurar `spring.flyway.locations` y `ddl-auto: validate` en el backend.
4. Crear la base y el usuario `servitec` (y `servitec_test`).
5. Verificar el índice único parcial de `citas`.

## Dependencias
- Modelo: `02-data-model.md`. Config del backend: `04-backend-conventions.md`. Instalación: `07-install-guide.md`.

## Evidencia esperada
- Listado de `db/migrations/` con los scripts.
- Salida de `flyway_schema_history` con las migraciones aplicadas.
- Conteos de semilla verificados (3 / 12 / 60 / 2).
