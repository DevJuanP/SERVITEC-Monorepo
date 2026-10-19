import { connectAsAppUser, countRows } from "./postgres.mjs";

// Verificación posterior: comprueba que la base quedó migrada por Flyway y que la
// semilla está cargada. Se conecta con el usuario de la aplicación, así que
// también valida que el login de ese rol funcione.

/** Volumen esperado de la semilla (ver db/migrations/README.md). */
export const EXPECTED_SEED = [
  { table: "productos", expected: 60 },
  { table: "caracteristicas", expected: 300 },
  { table: "citas", expected: 5 },
];

const REQUIRED_VERSIONS = ["1", "2", "3", "4"];

/**
 * Devuelve el estado de una base:
 *   { database, reachable, migrated, versions, repeatables, failed, counts }
 */
export async function verifyDatabase(config, database) {
  const result = { database, reachable: false, migrated: false, versions: [], repeatables: 0, failed: [], counts: [] };

  let client;
  try {
    client = await connectAsAppUser(config, database);
  } catch (error) {
    result.error = error.message;
    return result;
  }
  result.reachable = true;

  try {
    let history;
    try {
      const { rows } = await client.query(
        "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank",
      );
      history = rows;
    } catch (error) {
      if (error.code === "42P01") return result; // tabla de historial aún no creada
      throw error;
    }

    result.migrated = true;
    result.versions = history.filter((row) => row.version).map((row) => row.version);
    result.repeatables = history.filter((row) => !row.version).length;
    result.failed = history.filter((row) => !row.success).map((row) => row.version ?? row.description);

    for (const { table, expected } of EXPECTED_SEED) {
      const actual = await countRows(client, table);
      result.counts.push({ table, expected, actual, ok: actual !== null && actual >= expected });
    }
    return result;
  } finally {
    await client.end();
  }
}

export function isFullyMigrated(result) {
  if (!result.migrated) return false;
  return REQUIRED_VERSIONS.every((version) => result.versions.includes(version)) && result.failed.length === 0;
}
