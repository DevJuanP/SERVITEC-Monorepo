# tools/db-setup — Configuración inicial de la base de datos

Mini app de **Node.js** que deja PostgreSQL listo para SERVITEC en un solo comando:
crea el rol y las bases, genera los archivos de entorno del monorepo y aplica las
migraciones **Flyway** de `db/migrations`.

## Estado

`IMPLEMENTADO`.

## Qué hace

| Paso | Acción | Herramienta |
|---|---|---|
| 1 | Crea/actualiza el rol `servitec` y las bases `servitec` + `servitec_test` | `pg` (TCP) |
| 2 | Genera `.env` de la raíz, `apps/front/.env`, `apps/admin/.env`, `dev-env.ps1`, `dev-env.sh` | Node (`fs`) |
| 3 | Aplica las migraciones (`V1`–`V4` + repetibles `R__01`–`R__04`) | `apps/api/mvnw flyway:migrate` |
| 4 | Verifica historial de Flyway y volumen de la semilla | `pg` (TCP) |

## Puertos: un solo lugar

Ningún puerto está escrito en el código. El script los propaga desde su `.env`:

```
API_PORT   ──► SERVER_PORT (backend)          + VITE_API_URL   (fronts y dev-env)
FRONT_PORT ──► VITE_PORT (apps/front)         + CORS_ALLOWED_ORIGINS
ADMIN_PORT ──► VITE_PORT (apps/admin)         + VITE_ADMIN_URL + CORS_ALLOWED_ORIGINS
```

Los valores por defecto son los de siempre (`8080`, `5173`, `5174`), así que nada cambia
si no tocas nada. Si necesitas otro puerto (por ejemplo porque está ocupado), edita solo
`API_PORT` en `tools/db-setup/.env` y vuelve a ejecutar el script: se regeneran el
`dev-env`, los `.env` de los fronts y el CORS de forma consistente.

`VITE_API_URL`, `VITE_ADMIN_URL` y `CORS_ALLOWED_ORIGINS` se pueden fijar a mano
(útiles si la API vive en otra máquina); si se dejan vacíos se derivan de los puertos.

Detalles de diseño:

- **No necesita `psql`** ni la ruta de instalación de PostgreSQL (en Windows `psql`
  suele no estar en el `PATH`): se conecta por TCP con el driver `pg`.
- **No ejecuta los `.sql` por su cuenta.** Las migraciones siempre pasan por Flyway,
  para que `flyway_schema_history`, los checksums y el orden queden idénticos a los
  de un arranque normal del backend. Si el script aplicara el SQL directamente, la tabla
  de historial quedaría vacía y la API fallaría al arrancar con
  `Found non-empty schema but no schema history table`.
- **Es idempotente**: puedes ejecutarlo tantas veces como quieras.

## Requisitos

- **Node.js 20+** (tienes que tener npm para instalar `pg`).
- **PostgreSQL** corriendo en `PGHOST:PGPORT` (el backend documenta 18; 13+ funciona).
- **JDK 21** para el paso 3 (Maven lo necesita). El script avisa si detecta otro JDK.
- Credenciales del **superusuario** de PostgreSQL para el paso 1: es el único que
  puede hacer `CREATE ROLE` / `CREATE DATABASE`.

## Uso

```powershell
# 1. Configura el entorno de ESTE script (credenciales del superusuario)
copy tools\db-setup\.env.example tools\db-setup\.env
#    ... edita tools\db-setup\.env ...

# 2. Instala la dependencia (pg) e instala todo
cd tools\db-setup
npm install
npm run setup
```

Alternativa sin instalar dependencias (si ya corriste `npm install` una vez):

```powershell
node tools/db-setup/src/index.mjs
```

### Comandos

| Comando | Qué hace |
|---|---|
| `npm run setup` | Flujo completo: rol + bases + `.env` + migraciones + verificación |
| `npm run db:create` | Solo el rol y las bases |
| `npm run db:migrate` | Solo las migraciones Flyway |
| `npm run db:verify` | Solo verifica el estado actual |
| `npm run db:reset` | Elimina y recrea las bases (**borra todos los datos**) |

### Opciones

```text
--only-create     Solo crea el rol y las bases (no migra ni verifica)
--skip-create     No crea rol/bases (útil sin superusuario)
--skip-migrate    No aplica las migraciones Flyway
--skip-env-files  No regenera .env ni dev-env.ps1 / dev-env.sh
--verify          Solo verifica el estado actual
--reset           Elimina y recrea las bases (requiere --yes)
--yes             Confirma --reset sin preguntar
--help            Ayuda
```

Para pasar opciones a través de npm usa `--`:

```powershell
npm run setup -- --skip-create      # ya tengo rol y bases creados a mano
npm run setup -- --reset --yes      # reconstruir todo desde cero
```

## Archivos que genera

| Archivo | Contenido | En git |
|---|---|---|
| `.env` (raíz) | `VITE_*` + `SPRING_*` + `JWT_SECRET` + `SERVER_PORT` + `CORS_ALLOWED_ORIGINS` | ignorado |
| `dev-env.ps1` | `$env:` de `SPRING_*`, `JWT_SECRET`, `SERVER_PORT`, `CORS_ALLOWED_ORIGINS`, `SPRING_FLYWAY_LOCATIONS` | ignorado |
| `dev-env.sh` | lo mismo para bash / Git Bash / WSL | ignorado |
| `apps/front/.env` | `VITE_API_URL`, `VITE_ADMIN_URL`, `VITE_PORT` | ignorado |
| `apps/admin/.env` | `VITE_API_URL`, `VITE_PORT` | ignorado |

Si alguno de esos archivos ya existía **sin** la marca `GENERADO POR tools/db-setup`,
el script lo respalda como `<archivo>.bak` antes de sobrescribirlo.

> Spring Boot **no** lee el `.env` de la raíz. Por eso el script genera `dev-env.ps1`:
> hay que cargarlo en la terminal antes de arrancar la API.

## Después del setup

```powershell
. .\dev-env.ps1                            # carga los puertos y las credenciales
cd apps/api; .\mvnw.cmd spring-boot:run    # API en $SERVER_PORT (por defecto 8080)
cd apps/front; npm run dev                 # front en su VITE_PORT (5173 por defecto)
cd apps/admin; npm run dev                 # panel en su VITE_PORT (5174 por defecto)
```

Mientras `dev-env.ps1` está cargado, `SPRING_DATASOURCE_URL` apunta a la base de
**desarrollo** (`servitec`). Las pruebas del backend usan la base de **pruebas**
(`application-test.yml` → `servitec_test`), así que hay que reasignar la variable
antes de correrlas (el propio script imprime estas líneas al terminar):

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/servitec_test'
cd apps/api; .\mvnw.cmd test
```

Credenciales de la semilla (solo desarrollo): `admin@servitec.pe` / `Servitec123`
(también `asesor@servitec.pe`, `asesor2`, `asesor3`, `cliente@servitec.pe`).

## Estructura

```
tools/db-setup/
├─ package.json        scripts npm (setup, db:create, db:migrate, db:verify, db:reset)
├─ .env.example        plantilla del entorno del script (copiar a .env)
├─ src/
│  ├─ index.mjs        CLI: pasos, opciones y salida
│  ├─ config.mjs       rutas del monorepo y carga/validación de configuración
│  ├─ env.mjs          parser y escritura de archivos .env / scripts
│  ├─ postgres.mjs     conexión y provisión (rol, bases, conteos)
│  ├─ flyway.mjs       invoca apps/api/mvnw con flyway:migrate
│  ├─ generate-env.mjs genera .env y dev-env.*
│  └─ verify.mjs       historial de Flyway y volumen de la semilla
└─ README.md
```

## Por qué Flyway y no el SQL directo

`apps/api/pom.xml` declara `flyway-maven-plugin` (versión `${flyway.version}`, la misma
que usa Spring Boot) junto con el módulo `flyway-database-postgresql` y el driver
`postgresql`. El plugin no está enlazado a ninguna fase del ciclo de vida, así que
`mvnw test` y `mvnw package` se comportan igual que antes. Ese plugin es lo que permite
migrar **sin arrancar la API**, reutilizando exactamente los mismos scripts y el mismo
historial que el backend.

## Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| `No hay respuesta de PostgreSQL en localhost:5432` | El servicio no está corriendo o el puerto es otro (`PGPORT`). En Windows: servicios `postgresql-x64-*`. |
| `Autenticación fallida para el usuario "postgres"` | `PGSUPERPASSWORD` incorrecta en `tools/db-setup/.env`. |
| `El usuario "..." no puede crear roles ni bases` | No es superusuario: usa `postgres` o crea rol/bases a mano y corre `npm run db:migrate`. |
| `Falta configurar PGSUPERPASSWORD, APP_DB_PASSWORD` | Copiaste `.env.example` pero no editaste `tools/db-setup/.env`. |
| Flyway falla con error de conexión | Verifica que el rol pueda conectarse: `npm run db:verify` (usa el usuario de la app). |
| Las pruebas (`mvnw test`) tocan tu base de desarrollo | `dev-env.ps1` exporta `SPRING_DATASOURCE_URL` apuntando a `servitec`. Reasígnala a `servitec_test` antes de `mvnw test` (ver «Después del setup»). |
| `Flyway terminó con código 1` y `validate` | Alguien editó un `V*.sql` ya aplicado. Reconstruye con `npm run db:reset` (en desarrollo). |
