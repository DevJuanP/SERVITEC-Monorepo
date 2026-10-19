import { randomBytes } from "node:crypto";
import path from "node:path";
import { backupIfForeign, writeEnvFile, writeScriptFile } from "./env.mjs";
import {
  DEV_ENV_PS1,
  DEV_ENV_SH,
  GENERATED_MARKER,
  REPO_ROOT,
  ROOT_ENV_FILE,
  jdbcUrl,
} from "./config.mjs";

// Generación de los archivos de entorno del monorepo a partir de un único origen
// de verdad (tools/db-setup/.env).
//
// Por qué hace falta: Spring Boot NO lee el `.env` de la raíz. Además del .env se
// generan `dev-env.ps1` / `dev-env.sh`, que exportan las variables en la sesión
// de la terminal antes de lanzar `mvnw spring-boot:run`.

const GENERATED_HEADERS = [
  `${GENERATED_MARKER} — no editar a mano: se regenera con \`npm run setup\``,
];

const PS_HEADER = [
  ...GENERATED_HEADERS,
  "",
  "Carga estas variables en la sesión actual antes de arrancar el backend:",
  "    . .\\dev-env.ps1",
  "    cd apps/api; .\\mvnw.cmd spring-boot:run",
];

const SH_HEADER = [
  ...GENERATED_HEADERS,
  "",
  "Carga estas variables en la sesión actual antes de arrancar el backend:",
  "    source dev-env.sh",
  "    cd apps/api && ./mvnw spring-boot:run",
];

/** Valor entre comillas simples para PowerShell (el estilo más seguro). */
function psString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

/** Valor entre comillas dobles escapado para bash / sh. */
function shString(value) {
  return `"${String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("$", "\\$")
    .replaceAll("`", "\\`")}"`;
}

/** Reutiliza el JWT_SECRET existente si lo hay; si no, genera uno aleatorio. */
export function resolveJwtSecret(config) {
  if (config.jwtSecret) return { secret: config.jwtSecret, generated: false };
  return { secret: randomBytes(48).toString("base64url"), generated: true };
}

/** Variables que consume el backend (application.yml). */
function backendEntries(config, jwtSecret) {
  return [
    ["SPRING_DATASOURCE_URL", jdbcUrl(config)],
    ["SPRING_DATASOURCE_USERNAME", config.appUser],
    ["SPRING_DATASOURCE_PASSWORD", config.appPassword],
    ["JWT_SECRET", jwtSecret],
    ["SPRING_FLYWAY_LOCATIONS", config.flywayLocations],
  ];
}

/** Respalda un archivo previo que no generamos nosotros y devuelve su ruta relativa. */
function backup(file) {
  return backupIfForeign(file, GENERATED_MARKER, `${file}.bak`)
    ? [`${path.relative(REPO_ROOT, file)} → .bak`]
    : [];
}

/** Escribe el .env de la raíz y los scripts de entorno de la sesión. */
export function writeBackendEnv(config, jwtSecret) {
  const backedUp = backup(ROOT_ENV_FILE);

  writeEnvFile(
    ROOT_ENV_FILE,
    [
      ["VITE_API_URL", config.viteApiUrl],
      ["VITE_ADMIN_URL", config.viteAdminUrl],
      ...backendEntries(config, jwtSecret),
    ],
    [...GENERATED_HEADERS, "Referencia: .env.example"],
  );

  writeScriptFile(
    DEV_ENV_PS1,
    [
      ...backendEntries(config, jwtSecret).map(([key, value]) => `$env:${key} = ${psString(value)}`),
      "",
      "# Descomenta y ajusta si tu JAVA_HOME no apunta a un JDK 21:",
      "# $env:JAVA_HOME = 'C:\\Program Files\\Java\\jdk-21'",
    ],
    PS_HEADER,
  );

  writeScriptFile(
    DEV_ENV_SH,
    [
      ...backendEntries(config, jwtSecret).map(([key, value]) => `export ${key}=${shString(value)}`),
      "",
      "# Descomenta y ajusta si tu JAVA_HOME no apunta a un JDK 21:",
      "# export JAVA_HOME=/c/Program\\ Files/Java/jdk-21",
    ],
    SH_HEADER,
  );

  return backedUp;
}

/** Escribe el .env de cada front (Vite lo lee desde su propia carpeta). */
export function writeFrontEnvs(config) {
  const fronts = [
    {
      dir: path.join(REPO_ROOT, "apps", "front"),
      entries: [
        ["VITE_API_URL", config.viteApiUrl],
        ["VITE_ADMIN_URL", config.viteAdminUrl],
      ],
    },
    {
      dir: path.join(REPO_ROOT, "apps", "admin"),
      entries: [["VITE_API_URL", config.viteApiUrl]],
    },
  ];

  const backedUp = [];
  for (const { dir, entries } of fronts) {
    const file = path.join(dir, ".env");
    backedUp.push(...backup(file));
    writeEnvFile(file, entries, [...GENERATED_HEADERS, "Referencia: .env.example (misma carpeta)"]);
  }
  return backedUp;
}
