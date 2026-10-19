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

const PS_HEADER = (config) => [
  ...GENERATED_HEADERS,
  "",
  "Carga estas variables en la sesión actual antes de arrancar el backend:",
  "    . .\\dev-env.ps1",
  "    cd apps/api; .\\mvnw.cmd spring-boot:run",
  "",
  "Los puertos salen de estas variables (no hay puertos escritos en el código):",
  "    SERVER_PORT          -> puerto de la API (application.yml)",
  "    CORS_ALLOWED_ORIGINS -> orígenes permitidos (los fronts)",
  "Para cambiarlos: edita API_PORT / FRONT_PORT / ADMIN_PORT en tools/db-setup/.env",
  "y vuelve a ejecutar el script.",
  "",
  "OJO con las pruebas: SPRING_DATASOURCE_URL apunta a la base de DESARROLLO.",
  "Las pruebas del backend usan la base de PRUEBAS, así que reasigna la variable",
  "antes de `mvnw test`:",
  `    $env:SPRING_DATASOURCE_URL = '${jdbcUrl(config, config.testDatabase)}'`,
];

const SH_HEADER = (config) => [
  ...GENERATED_HEADERS,
  "",
  "Carga estas variables en la sesión actual antes de arrancar el backend:",
  "    source dev-env.sh",
  "    cd apps/api && ./mvnw spring-boot:run",
  "",
  "Los puertos salen de estas variables (no hay puertos escritos en el código):",
  "    SERVER_PORT          -> puerto de la API (application.yml)",
  "    CORS_ALLOWED_ORIGINS -> orígenes permitidos (los fronts)",
  "Para cambiarlos: edita API_PORT / FRONT_PORT / ADMIN_PORT en tools/db-setup/.env",
  "y vuelve a ejecutar el script.",
  "",
  "OJO con las pruebas: SPRING_DATASOURCE_URL apunta a la base de DESARROLLO.",
  "Las pruebas del backend usan la base de PRUEBAS, así que reasigna la variable",
  "antes de mvnw test:",
  `    export SPRING_DATASOURCE_URL="${jdbcUrl(config, config.testDatabase)}"`,
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
    ["SERVER_PORT", config.apiPort],
    ["CORS_ALLOWED_ORIGINS", config.corsAllowedOrigins],
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
    PS_HEADER(config),
  );

  writeScriptFile(
    DEV_ENV_SH,
    [
      ...backendEntries(config, jwtSecret).map(([key, value]) => `export ${key}=${shString(value)}`),
      "",
      "# Descomenta y ajusta si tu JAVA_HOME no apunta a un JDK 21:",
      "# export JAVA_HOME=/c/Program\\ Files/Java/jdk-21",
    ],
    SH_HEADER(config),
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
        ["VITE_PORT", config.frontPort],
      ],
    },
    {
      dir: path.join(REPO_ROOT, "apps", "admin"),
      entries: [
        ["VITE_API_URL", config.viteApiUrl],
        ["VITE_PORT", config.adminPort],
      ],
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
