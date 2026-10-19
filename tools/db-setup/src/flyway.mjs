import { spawn } from "node:child_process";
import { API_DIR } from "./config.mjs";

// Aplicación de las migraciones con Flyway, a través del wrapper de Maven del
// backend (apps/api/mvnw). Así el historial, los checksums y el orden quedan
// exactamente igual que cuando la API arranca, pero sin levantar el servidor.
//
// El plugin `flyway-maven-plugin` está declarado en apps/api/pom.xml.

function mavenCommand(args) {
  if (process.platform === "win32") {
    // En Windows, mvnw.cmd es un batch: hay que invocarlo a través de cmd.exe.
    // Todos los argumentos se construyen sin espacios, así que no hay riesgo de
    // que el shell los parta (la ruta del repo sí tiene espacios, por eso el
    // directorio de trabajo se pasa por `cwd` y no como parte del comando).
    return {
      command: process.env.ComSpec || "cmd.exe",
      args: ["/d", "/c", ".\\mvnw.cmd", ...args],
    };
  }
  return { command: "./mvnw", args };
}

/**
 * Ejecuta `mvnw flyway:migrate` contra una base concreta.
 * Devuelve la salida estándar combinada para poder mostrarla si algo falla.
 */
export function migrateDatabase(config, database) {
  const args = [
    "-q",
    "-B",
    "flyway:migrate",
    `-Dflyway.url=jdbc:postgresql://${config.host}:${config.port}/${database}`,
    `-Dflyway.user=${config.appUser}`,
    `-Dflyway.password=${config.appPassword}`,
    `-Dflyway.locations=${config.flywayLocations}`,
  ];

  const { command, args: commandArgs } = mavenCommand(args);

  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: API_DIR,
      env: process.env,
      windowsHide: true,
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
      process.stderr.write(chunk);
    });

    child.on("error", (error) => {
      reject(new Error(`No se pudo ejecutar Maven (${command}): ${error.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) return resolve(output);
      reject(new Error(`Flyway terminó con código ${code} en la base "${database}".\n${output.trim()}`));
    });
  });
}
