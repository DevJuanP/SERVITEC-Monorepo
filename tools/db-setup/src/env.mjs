import { readFileSync, writeFileSync } from "node:fs";

// Lectura/escritura de archivos .env sin dependencias externas.
// El script tiene su PROPIO entorno (tools/db-setup/.env) y, además, GENERA los
// archivos de entorno que consumen el backend y los fronts.

/**
 * Mini parser de .env: basta para el formato que usa el repo.
 * Soporta `CLAVE=valor`, `export CLAVE=valor`, comentarios `#`, líneas en blanco
 * y valores entre comillas simples o dobles.
 */
export function readEnvFile(file) {
  const vars = {};
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return vars; // el archivo no existe todavía: se usan los valores por defecto
  }

  for (const line of raw.split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#")) continue;

    const normalized = text.startsWith("export ") ? text.slice(7).trim() : text;
    const separator = normalized.indexOf("=");
    if (separator <= 0) continue;

    const key = normalized.slice(0, separator).trim();
    let value = normalized.slice(separator + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);

    if (key) vars[key] = value;
  }
  return vars;
}

/** Escribe (o sobrescribe) un archivo .env con cabecera generada. */
export function writeEnvFile(file, entries, header = []) {
  const lines = [...header.map((line) => `# ${line}`), ""];
  for (const [key, value] of entries) lines.push(`${key}=${value}`);
  writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}

/** Escribe un script (PowerShell / bash) con `#` como comentario en la cabecera. */
export function writeScriptFile(file, bodyLines, header = []) {
  const lines = [...header.map((line) => (line ? `# ${line}` : "")), "", ...bodyLines];
  writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}


/** Crea un respaldo del archivo antes de sobrescribirlo (si existía y no lo generamos nosotros). */
export function backupIfForeign(file, marker, backupFile) {
  let current;
  try {
    current = readFileSync(file, "utf8");
  } catch {
    return false; // no existe: nada que respaldar
  }
  if (current.includes(marker)) return false; // es nuestro: se puede regenerar sin miedo
  writeFileSync(backupFile, current, "utf8");
  return true;
}
