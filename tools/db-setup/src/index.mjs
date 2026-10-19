import { copyFileSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
  API_DIR,
  ConfigError,
  ENV_EXAMPLE_FILE,
  ENV_FILE,
  MIGRATIONS_DIR,
  jdbcUrl,
  loadConfig,
} from "./config.mjs";
import * as db from "./postgres.mjs";
import { migrateDatabase } from "./flyway.mjs";
import { resolveJwtSecret, writeBackendEnv, writeFrontEnvs } from "./generate-env.mjs";
import { isFullyMigrated, verifyDatabase } from "./verify.mjs";

// Punto de entrada: configura PostgreSQL y aplica las migraciones Flyway de
// SERVITEC en un solo comando.
//
//   npm run setup           configura todo (rol, bases, .env, migraciones, verificación)
//   npm run db:create       solo rol + bases
//   npm run db:migrate      solo migraciones
//   npm run db:verify       solo verificación
//   npm run db:reset        elimina y recrea las bases (--yes obligatorio)

const OK = "[ok]";
const SKIP = "[--]";
const WARN = "[!!]";
const FAIL = "[XX]";

const HELP = `
SERVITEC — configuración inicial de la base de datos

Uso: npm run setup -- [opciones]   (o: node src/index.mjs [opciones])

Opciones:
  --only-create     Solo crea el rol y las bases (no migra ni verifica)
  --skip-create     No crea rol/bases (útil si ya existen y no tienes superusuario)
  --skip-migrate    No aplica las migraciones Flyway
  --skip-env-files  No regenera .env ni dev-env.ps1 / dev-env.sh
  --verify          Solo verifica el estado actual (implica los tres --skip)
  --reset           Elimina y recrea las bases (borra TODOS los datos; requiere --yes)
  --yes             Confirma --reset sin preguntar
  --help            Muestra esta ayuda

Configuración: tools/db-setup/.env (copiar de .env.example)
`;

function parseArgs(argv) {
  const valid = [
    "--only-create",
    "--skip-create",
    "--skip-migrate",
    "--skip-env-files",
    "--verify",
    "--reset",
    "--yes",
    "--help",
  ];

  const unknown = argv.filter((arg) => !valid.includes(arg));
  if (unknown.length > 0) {
    throw new ConfigError(`Opción no reconocida: ${unknown.join(", ")}\n${HELP}`);
  }

  const options = {
    onlyCreate: argv.includes("--only-create"),
    skipCreate: argv.includes("--skip-create"),
    skipMigrate: argv.includes("--skip-migrate"),
    skipEnvFiles: argv.includes("--skip-env-files"),
    verifyOnly: argv.includes("--verify"),
    reset: argv.includes("--reset"),
    confirmed: argv.includes("--yes"),
    help: argv.includes("--help"),
  };

  if (options.verifyOnly) {
    options.skipCreate = true;
    options.skipMigrate = true;
    options.skipEnvFiles = true;
  }
  if (options.onlyCreate) {
    options.skipMigrate = true;
  }
  if (options.reset && !options.confirmed) {
    throw new ConfigError(
      "--reset elimina las bases y TODOS sus datos. Confírmalo con:\n  npm run db:reset",
    );
  }
  return options;
}

function log(message = "") {
  console.log(message);
}

function step(message) {
  log(`\n${message}`);
}

function describe(config) {
  log("SERVITEC — configuración inicial de la base de datos");
  log(`  Servidor      : ${config.host}:${config.port}`);
  log(`  Superusuario  : ${config.superuser}`);
  log(`  Rol de la app : ${config.appUser}`);
  log(`  Bases         : ${config.databases.join(", ")}`);
  log(`  Migraciones   : db/migrations -> ${jdbcUrl(config)}`);
  log(`  Configuración : ${ENV_FILE}`);
}

function ensureEnvFile() {
  if (existsSync(ENV_FILE) || !existsSync(ENV_EXAMPLE_FILE)) return;
  copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
  log(`${WARN} No existía tools/db-setup/.env: se creó desde .env.example. Revísalo si algo falla.`);
}

/** Comprueba que el proyecto Maven y los scripts de migración estén en su sitio. */
function checkMigrationSources() {
  if (!existsSync(MIGRATIONS_DIR)) {
    throw new ConfigError(`No se encontró db/migrations en ${MIGRATIONS_DIR}`);
  }
  const scripts = readdirSync(MIGRATIONS_DIR).filter((file) => file.endsWith(".sql"));
  if (scripts.length === 0) {
    throw new ConfigError(`db/migrations no contiene scripts .sql`);
  }
  const wrapper = process.platform === "win32" ? "mvnw.cmd" : "mvnw";
  if (!existsSync(`${API_DIR}/${wrapper}`)) {
    throw new ConfigError(`No se encontró el wrapper de Maven: apps/api/${wrapper}`);
  }
  return scripts.length;
}

/** Maven necesita un JDK; el backend exige 21. Avisa si la versión no cuadra. */
function checkJava() {
  const java = process.env.JAVA_HOME
    ? `${process.env.JAVA_HOME}/bin/java`
    : "java";

  const probe = spawnSync(java, ["-version"], { encoding: "utf8", shell: false });
  if (probe.error) {
    log(`${WARN} No se pudo ejecutar "${java}". Flyway se ejecuta con Maven y necesita un JDK 21.`);
    log(`     Ajusta JAVA_HOME o descomenta esa línea en dev-env.ps1.`);
    return;
  }

  const output = `${probe.stdout ?? ""}${probe.stderr ?? ""}`;
  const version = output.match(/version "(\d+)/)?.[1];
  if (version && Number(version) < 21) {
    log(`${WARN} El JDK detectado es ${version} y el backend requiere 21 (ver docs/specs/07-install-guide.md).`);
  } else if (version) {
    log(`  Java          : JDK ${version}`);
  }
}

/** Paso 1: rol de la aplicación + bases (necesita privilegios del superusuario). */
async function provision(config, options) {
  step(options.reset ? "1/4 Eliminando y recreando bases de datos" : "1/4 Creando rol y bases de datos");

  const client = await db.connectAsSuperuser(config);
  try {
    const server = await db.inspectServer(client);
    log(`  PostgreSQL ${server.version} — conectado como "${server.user}"`);

    if (!server.isSuperuser && !(server.canCreateRole && server.canCreateDb)) {
      throw new ConfigError(
        `El usuario "${config.superuser}" no puede crear roles ni bases.\n` +
          `Usa el superusuario "postgres" en tools/db-setup/.env, o crea el rol y las bases ` +
          `a mano y vuelve a ejecutar con --skip-create.`,
      );
    }
    if (Number(server.version.split(".")[0]) < 18) {
      log(`${WARN} El equipo documenta PostgreSQL 18; este servidor es ${server.version}. Se acepta, pero difiere del informe.`);
    }

    if (options.reset) {
      for (const database of config.databases) {
        const dropped = await db.dropDatabase(client, database);
        log(`  ${dropped ? OK : SKIP} DROP DATABASE ${database}${dropped ? "" : " (no existía)"}`);
      }
    }

    const role = await db.ensureAppRole(client, { user: config.appUser, password: config.appPassword });
    log(`  ${OK} Rol "${config.appUser}" ${role.created ? "creado" : "ya existía (contraseña sincronizada)"}`);

    for (const database of config.databases) {
      const result = await db.ensureDatabase(client, { name: database, owner: config.appUser });
      const detail = result.created ? "creada" : "ya existía";
      log(`  ${result.warning ? WARN : OK} Base "${database}" ${detail}${result.warning ? ` — ${result.warning}` : ""}`);
    }
  } finally {
    await client.end();
  }
}

/** Paso 2: archivos de entorno generados desde tools/db-setup/.env. */
function generateEnvs(config) {
  step("2/4 Generando archivos de entorno (.env, dev-env.ps1, dev-env.sh)");

  const { secret, generated } = resolveJwtSecret(config);
  const backedUp = [...writeBackendEnv(config, secret), ...writeFrontEnvs(config)];

  log(`  ${OK} .env de la raíz y .env de apps/front y apps/admin`);
  log(`  ${OK} dev-env.ps1 y dev-env.sh`);
  if (generated) log(`  ${OK} JWT_SECRET generado (no lo tenías configurado)`);
  for (const item of backedUp) log(`  ${WARN} Respaldo del archivo previo: ${item}`);
}

/** Paso 3: Flyway sobre cada base, a través del wrapper de Maven del backend. */
async function migrate(config) {
  step("3/4 Aplicando migraciones Flyway (apps/api → db/migrations)");
  checkJava();

  for (const database of config.databases) {
    log(`  -> ${jdbcUrl(config, database)}`);
    await migrateDatabase(config, database);
    log(`  ${OK} ${database} actualizada`);
  }
}

/** Paso 4: verificación con el usuario de la aplicación. */
async function verify(config) {
  step("4/4 Verificando el resultado");

  let allOk = true;
  for (const database of config.databases) {
    const result = await verifyDatabase(config, database);

    if (!result.reachable) {
      allOk = false;
      log(`  ${FAIL} "${database}": no se pudo conectar como "${config.appUser}" — ${result.error}`);
      continue;
    }
    if (!isFullyMigrated(result)) {
      allOk = false;
      log(`  ${FAIL} "${database}": migraciones incompletas (aplicadas: ${result.versions.join(", ") || "ninguna"})`);
      if (result.failed.length > 0) log(`       migraciones fallidas: ${result.failed.join(", ")}`);
      continue;
    }

    log(`  ${OK} "${database}": V${result.versions.join(", V")} + ${result.repeatables} repetibles`);
    for (const count of result.counts) {
      const label = count.table.padEnd(16);
      if (count.actual === null) {
        log(`       ${label} sin datos (tabla ausente)`);
      } else {
        log(`       ${label} ${String(count.actual).padStart(4)} (esperado ${count.expected}) ${count.ok ? OK : WARN}`);
      }
    }
  }
  return allOk;
}

function nextSteps(config, { onlyCreate = false } = {}) {
  if (onlyCreate) {
    log(`
Listo: el rol y las bases quedaron creados.
Para aplicar las migraciones cuando quieras:  npm run db:migrate`);
    return;
  }
  log(`
Listo. Siguientes pasos:
  1) . .\\dev-env.ps1                              # carga las variables en esta terminal
  2) cd apps/api; .\\mvnw.cmd spring-boot:run      # http://localhost:${config.apiPort}
  3) cd apps/front; npm install; npm run dev       # http://localhost:5173
  4) cd apps/admin; npm install; npm run dev       # http://localhost:5174

Para correr las pruebas (usan "${config.testDatabase}", no la base de desarrollo):
  $env:SPRING_DATASOURCE_URL = '${jdbcUrl(config, config.testDatabase)}'
  cd apps/api; .\\mvnw.cmd test

Credenciales demo (semilla): admin@servitec.pe / Servitec123`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    log(HELP.trim());
    return 0;
  }

  ensureEnvFile();
  const config = loadConfig();
  describe(config);

  if (!options.skipCreate) {
    await provision(config, options);
  } else {
    step("1/4 Rol y bases: omitido (--skip-create / --verify)");
  }

  if (!options.skipEnvFiles) {
    generateEnvs(config);
  } else {
    step("2/4 Archivos de entorno: omitido");
  }

  if (!options.skipMigrate) {
    checkMigrationSources();
    await migrate(config);
  } else {
    step("3/4 Migraciones Flyway: omitidas");
  }

  let verified = true;
  if (options.onlyCreate) {
    step("3/4 y 4/4 Migraciones y verificación: omitidas (--only-create)");
  } else {
    verified = await verify(config);
  }
  if (verified) nextSteps(config, { onlyCreate: options.onlyCreate });

  return verified ? 0 : 1;
}

try {
  process.exitCode = await main();
} catch (error) {
  console.error(`\n${FAIL} ${error.message}`);
  process.exitCode = 1;
}
