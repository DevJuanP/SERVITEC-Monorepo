import pg from "pg";
import { connectionTarget } from "./config.mjs";

// Acceso a PostgreSQL con `pg` (protocolo TCP: no requiere `psql` ni la ruta
// de instalación de PostgreSQL, que en Windows suele no estar en el PATH).
//
// Nota de diseño: aquí SOLO se crean el rol y las bases. El esquema y la semilla
// los aplica Flyway (ver flyway.mjs). Si este script ejecutara los .sql por su
// cuenta, la tabla flyway_schema_history quedaría vacía y el backend fallaría al
// arrancar con "Found non-empty schema but no schema history table".

/** Identificador SQL: se comilla y se escapa. Los nombres ya se validaron en config.mjs. */
function quoteIdentifier(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

/** Literal de texto SQL. `standard_conforming_strings` está activo, basta duplicar comillas. */
function quoteLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function describeConnectionError(error, config, user) {
  if (error.code === "ECONNREFUSED") {
    return `No hay respuesta de PostgreSQL en ${config.host}:${config.port}.\n` +
      `Verifica que el servicio esté corriendo (en Windows: servicios "postgresql-x64-*") ` +
      `y que el puerto sea el correcto (PGPORT en tools/db-setup/.env).`;
  }
  if (error.code === "28P01" || error.code === "28000") {
    const hint =
      user === config.superuser
        ? "Revisa PGSUPERUSER / PGSUPERPASSWORD en tools/db-setup/.env."
        : `Revisa APP_DB_USER / APP_DB_PASSWORD en tools/db-setup/.env, o vuelve a crearlo con "npm run setup".`;
    return `Autenticación fallida para el usuario "${user}" en ${config.host}:${config.port}.\n${hint}`;
  }
  if (error.code === "3D000") {
    return `La base de datos indicada no existe en ${config.host}:${config.port}.\n` +
      `Ejecuta "npm run setup" para crearla (o "npm run db:create").`;
  }
  return error.message;
}

/** Abre una conexión y la devuelve ya validada con un `SELECT 1`. */
export async function connect(config, { database, user, password }) {
  const target = connectionTarget(config, database);
  const client = new pg.Client({
    host: target.host,
    port: target.port,
    database: target.database,
    user,
    password,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
  } catch (error) {
    const wrapped = new Error(describeConnectionError(error, config, user));
    wrapped.code = error.code;
    throw wrapped;
  }
  return client;
}

export async function connectAsSuperuser(config) {
  // "postgres" es la base de mantenimiento habitual; template1 es el respaldo
  // cuando el clúster no la tiene (creación con otra plantilla/nombre).
  try {
    return await connect(config, { database: "postgres", user: config.superuser, password: config.superuserPassword });
  } catch (error) {
    if (error.code !== "3D000") throw error;
    return connect(config, { database: "template1", user: config.superuser, password: config.superuserPassword });
  }
}

export function connectAsAppUser(config, database) {
  return connect(config, { database, user: config.appUser, password: config.appPassword });
}

/** Versión del servidor + privilegios del usuario conectado. */
export async function inspectServer(client) {
  const { rows } = await client.query(`
    SELECT current_user AS "user",
           current_setting('server_version') AS version,
           (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS "isSuperuser",
           (SELECT rolcreaterole FROM pg_roles WHERE rolname = current_user) AS "canCreateRole",
           (SELECT rolcreatedb FROM pg_roles WHERE rolname = current_user) AS "canCreateDb"
  `);
  return rows[0];
}

/**
 * Crea el rol de la aplicación si no existe; si existe, sincroniza la contraseña
 * con la del .env y garantiza que tenga LOGIN. Idempotente.
 */
export async function ensureAppRole(client, { user, password }) {
  const existing = await client.query("SELECT 1 FROM pg_roles WHERE rolname = $1", [user]);

  if (existing.rowCount > 0) {
    await client.query(
      `ALTER ROLE ${quoteIdentifier(user)} WITH LOGIN PASSWORD ${quoteLiteral(password)}`,
    );
    return { created: false };
  }

  await client.query(
    `CREATE ROLE ${quoteIdentifier(user)} WITH LOGIN PASSWORD ${quoteLiteral(password)}`,
  );
  return { created: true };
}

async function databaseInfo(client, name) {
  const { rows } = await client.query(
    `SELECT d.datname AS name, pg_get_userbyid(d.datdba) AS owner
       FROM pg_database d
      WHERE d.datname = $1`,
    [name],
  );
  return rows[0] ?? null;
}

/**
 * Crea la base si no existe y la deja con el rol de la aplicación como owner
 * (en PostgreSQL 15+ el owner ya tiene CREATE sobre el esquema `public`).
 */
export async function ensureDatabase(client, { name, owner }) {
  const info = await databaseInfo(client, name);

  if (info) {
    if (info.owner !== owner) {
      return { created: false, warning: `existe y su owner es "${info.owner}" (se esperaba "${owner}")` };
    }
    return { created: false };
  }

  // CREATE DATABASE no admite parámetros ni puede ejecutarse dentro de una
  // transacción; se envía suelto, con el identificador ya validado.
  await client.query(`CREATE DATABASE ${quoteIdentifier(name)} OWNER ${quoteIdentifier(owner)}`);
  return { created: true };
}

/** Elimina la base y todo su contenido. Requiere `--reset --yes` (ver index.mjs). */
export async function dropDatabase(client, name) {
  const info = await databaseInfo(client, name);
  if (!info) return false;

  // WITH (FORCE) cierra las conexiones activas antes de borrar (PostgreSQL 13+).
  await client.query(`DROP DATABASE ${quoteIdentifier(name)} WITH (FORCE)`);
  return true;
}

/** Cuenta filas de una tabla devolviendo null si la tabla/BD no existe. */
export async function countRows(client, table) {
  try {
    const { rows } = await client.query(`SELECT count(*)::int AS total FROM ${quoteIdentifier(table)}`);
    return rows[0].total;
  } catch {
    return null;
  }
}
