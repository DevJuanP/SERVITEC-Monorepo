# 08 — Manual técnico de operación

## Objetivo
Describir las operaciones de uso, respaldo y mantenimiento del entorno de desarrollo de SERVITEC.

## Comandos de operación
| Acción | Comando |
|---|---|
| Levantar backend | `cd apps/api && ./mvnw spring-boot:run` |
| Levantar front | `cd apps/front && npm run dev` |
| Compilar backend | `cd apps/api && ./mvnw clean package` |
| Ejecutar pruebas | `cd apps/api && ./mvnw test` |
| Compilar front | `cd apps/front && npm run build` |
| Lint front | `cd apps/front && npm run lint` |

## Variables de entorno
| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API para el front | `http://localhost:8080` |
| `SPRING_DATASOURCE_URL` | JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/servitec` |
| `SPRING_DATASOURCE_USERNAME` | Usuario de BD | `servitec` |
| `SPRING_DATASOURCE_PASSWORD` | Contraseña de BD | *(sin default)* |
| `JWT_SECRET` | Secreto de firma HS256 | *(sin default)* |
| `SPRING_FLYWAY_LOCATIONS` | Ruta de las migraciones | `filesystem:../../db/migrations` |

> Sin `SPRING_DATASOURCE_PASSWORD` ni `JWT_SECRET` el backend **no debe** arrancar.

## Base de datos
### Respaldo
```bash
pg_dump -h localhost -U servitec -F c -f servitec_$(date +%Y%m%d).dump servitec
```
### Restauración
```bash
pg_restore -h localhost -U servitec -d servitec --clean --if-exists servitec_YYYYMMDD.dump
```
### Estado del esquema
```sql
SELECT version, description, success, installed_on
FROM flyway_schema_history ORDER BY installed_rank;
```

## Registros (logs)
- Backend: salida estándar de Spring Boot (consola). Si se habilita archivo, `logging.file.name`.
- Nivel de log configurable: `logging.level.com.servitec=DEBUG`.
- Front: consola del navegador (`npm run dev` en la terminal).

## Gestión de datos
- **Alta de usuarios**: por el endpoint público de registro (siempre rol `cliente`). Roles `admin`/`asesor` se asignan por BD o por un endpoint administrativo (fuera del alcance actual).
- **Desactivar usuario**: `UPDATE usuarios SET activo = false WHERE correo = '...';` (no borrar).
- **Semilla**: se re-aplica de forma idempotente al reiniciar (migraciones repetibles `R__seed_*.sql`).

## Mantenimiento
### Agregar un cambio de esquema
1. Crear `db/migrations/V<n>__<descripcion>.sql` con el cambio.
2. Reiniciar el backend (Flyway lo aplica).
3. Verificar en `flyway_schema_history`.

> Nunca modificar una migración versionada ya aplicada: crear una versión nueva.

## Resolución de problemas
| Síntoma | Causa probable | Solución |
|---|---|---|
| Backend no arranca: "password authentication failed" | credenciales de BD | Revisar `SPRING_DATASOURCE_*` |
| Backend no arranca: "JWT_SECRET" vacío | falta la variable | Definir `JWT_SECRET` en `.env` |
| Flyway "no migrations found" | ruta incorrecta | Verificar `SPRING_FLYWAY_LOCATIONS` y que existan los `.sql` en `db/migrations` |
| Front sin datos / CORS | `VITE_API_URL` incorrecto o backend caído | Revisar `.env` y que la API responda en `:8080` |
| 401 en el front tras login | token no enviado o expirado (2 h) | Volver a iniciar sesión |
| 409 al agendar cita | horario ocupado (R-3/R-4) | Elegir otro horario |
| Caracteres raros en consola Windows | codificación | Ejecutar con `chcp 65001` |

## Seguridad operativa
- No commitear `.env` ni secretos.
- Cambiar `JWT_SECRET` y las contraseñas de la semilla fuera de desarrollo.
- Las contraseñas se almacenan con BCrypt; nunca se exponen en respuestas.
