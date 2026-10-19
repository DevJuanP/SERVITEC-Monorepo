import path from "node:path";
import { fileURLToPath } from "node:url";
import { readEnvFile } from "./env.mjs";

// Resolución de rutas y de la configuración del script.
//
// Precedencia de cada valor: variables de entorno del proceso → .env del script
// → .env ya generado en la raíz (SOLO las claves de PRESERVE_FROM_ROOT) → valor por defecto.
//
// El `.env` de la raíz es una SALIDA del script, así que no puede realimentar la
// configuración: si lo hiciéramos, cambiar API_PORT dejaría VITE_API_URL apuntando
// al puerto viejo. Solo se rescata JWT_SECRET, para no rotar los tokens en cada corrida.

export const PRESERVE_FROM_ROOT = new Set(["JWT_SECRET"]);

export const SCRIPT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
export const API_DIR = path.join(REPO_ROOT, "apps", "api");
export const MIGRATIONS_DIR = path.join(REPO_ROOT, "db", "migrations");

export const ENV_FILE = path.join(SCRIPT_DIR, ".env");
export const ENV_EXAMPLE_FILE = path.join(SCRIPT_DIR, ".env.example");
export const ROOT_ENV_FILE = path.join(REPO_ROOT, ".env");
export const DEV_ENV_PS1 = path.join(REPO_ROOT, "dev-env.ps1");
export const DEV_ENV_SH = path.join(REPO_ROOT, "dev-env.sh");

/** Marca que llevan los archivos generados por este script. */
export const GENERATED_MARKER = "GENERADO POR tools/db-setup";

export const DEFAULTS = {
  PGHOST: "localhost",
  PGPORT: "5432",
  PGSUPERUSER: "postgres",
  DB_NAME: "servitec",
  DB_TEST_NAME: "servitec_test",
  APP_DB_USER: "servitec",
  API_PORT: "8080",
  FRONT_PORT: "5173",
  ADMIN_PORT: "5174",
  SPRING_FLYWAY_LOCATIONS: "filesystem:../../db/migrations",
};

/** Puertos que se validan además de PGPORT. */
const APP_PORT_KEYS = ["API_PORT", "FRONT_PORT", "ADMIN_PORT"];

const ALWAYS_REQUIRED = ["APP_DB_PASSWORD"];
const SUPERUSER_REQUIRED = ["PGSUPERPASSWORD"];

/** Error de configuración: se muestra sin stack trace para no ensuciar la salida. */
export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * Construye la configuración efectiva del script.
 * `skipRequired` permite mostrar la ayuda sin tener credenciales configuradas.
 * `requiresSuperuser` es false cuando solo se migra o verifica (--skip-create),
 * porque en ese caso no se abre conexión con el superusuario.
 */
export function loadConfig({ skipRequired = false, requiresSuperuser = true } = {}) {
  const scriptEnv = readEnvFile(ENV_FILE);
  const rootEnv = readEnvFile(ROOT_ENV_FILE);

  const pick = (key, fallback = "") =>
    (process.env[key] ?? "").trim() ||
    scriptEnv[key] ||
    (PRESERVE_FROM_ROOT.has(key) ? rootEnv[key] : "") ||
    fallback;

  const config = {
    host: pick("PGHOST", DEFAULTS.PGHOST),
    port: pick("PGPORT", DEFAULTS.PGPORT),
    superuser: pick("PGSUPERUSER", DEFAULTS.PGSUPERUSER),
    superuserPassword: pick("PGSUPERPASSWORD"),
    databases: [pick("DB_NAME", DEFAULTS.DB_NAME), pick("DB_TEST_NAME", DEFAULTS.DB_TEST_NAME)],
    mainDatabase: pick("DB_NAME", DEFAULTS.DB_NAME),
    testDatabase: pick("DB_TEST_NAME", DEFAULTS.DB_TEST_NAME),
    appUser: pick("APP_DB_USER", DEFAULTS.APP_DB_USER),
    appPassword: pick("APP_DB_PASSWORD"),
    jwtSecret: pick("JWT_SECRET"),
    apiPort: pick("API_PORT", DEFAULTS.API_PORT),
    frontPort: pick("FRONT_PORT", DEFAULTS.FRONT_PORT),
    adminPort: pick("ADMIN_PORT", DEFAULTS.ADMIN_PORT),
    viteApiUrl: pick("VITE_API_URL", `http://localhost:${pick("API_PORT", DEFAULTS.API_PORT)}`),
    viteAdminUrl: pick("VITE_ADMIN_URL", `http://localhost:${pick("ADMIN_PORT", DEFAULTS.ADMIN_PORT)}`),
    corsAllowedOrigins: pick(
      "CORS_ALLOWED_ORIGINS",
      `http://localhost:${pick("FRONT_PORT", DEFAULTS.FRONT_PORT)},http://localhost:${pick("ADMIN_PORT", DEFAULTS.ADMIN_PORT)}`,
    ),
    flywayLocations: pick("SPRING_FLYWAY_LOCATIONS", DEFAULTS.SPRING_FLYWAY_LOCATIONS),
  };

  if (skipRequired) return config;

  const required = [...ALWAYS_REQUIRED, ...(requiresSuperuser ? SUPERUSER_REQUIRED : [])];
  const missing = required.filter((key) => !pick(key));
  if (missing.length > 0) {
    throw new ConfigError(
      `Falta configurar ${missing.join(", ")} en tools/db-setup/.env.\n` +
        `Copia la plantilla y edítala:\n` +
        `  copy tools\\db-setup\\.env.example tools\\db-setup\\.env`,
    );
  }

  const identifiers = { DB_NAME: config.databases[0], DB_TEST_NAME: config.databases[1], APP_DB_USER: config.appUser };
  for (const [key, value] of Object.entries(identifiers)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
      throw new ConfigError(
        `${key}="${value}" no es un identificador válido para PostgreSQL ` +
          `(letras, dígitos y guion bajo; sin guiones ni espacios).`,
      );
    }
  }

  if (!/^\d+$/.test(config.port) || Number(config.port) < 1 || Number(config.port) > 65535) {
    throw new ConfigError(`PGPORT="${config.port}" no es un puerto válido.`);
  }

  const ports = { API_PORT: config.apiPort, FRONT_PORT: config.frontPort, ADMIN_PORT: config.adminPort };
  for (const [key, value] of Object.entries(ports)) {
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
      throw new ConfigError(`${key}="${value}" no es un puerto válido.`);
    }
  }
  if (config.apiPort === config.frontPort || config.apiPort === config.adminPort) {
    throw new ConfigError(
      `API_PORT (${config.apiPort}) no puede coincidir con FRONT_PORT (${config.frontPort}) ` +
        `ni con ADMIN_PORT (${config.adminPort}): son procesos distintos.`,
    );
  }

  return config;
}

/** URL JDBC que consume Spring Boot (y las variables SPRING_* por defecto). */
export function jdbcUrl(config, database = config.mainDatabase) {
  return `jdbc:postgresql://${config.host}:${config.port}/${database}`;
}

export function connectionTarget(config, database) {
  return { host: config.host, port: Number(config.port), database };
}
