# Plan 01 — Backend (`apps/api`)
> Estado: ✅ Hecho · Depende de: F0 Migraciones (✅) · Cubre: 03 §C-1...C-11, 03 §Endpoints, 04 §Stack/§Seguridad/§Errores, 02 §Diccionario, R-1...R-15, P01–P13 · Estimación: L

## 1. Objetivo
API REST en `apps/api` (Spring Boot 4.1.x / Java 21) que implemente el contrato de `03-api-contract.md`,
cumpla las reglas R-1...R-15 sobre el esquema Flyway de `db/migrations`, y pase las pruebas P01–P13 con
`mvnw.cmd test` en verde, con CORS operativo para `:5173` y `:5174`.

## 2. Alcance
- **Incluye:** proyecto Maven con wrapper, configuración de datasource/Flyway/JPA, seguridad JWT HS256 por
  rol, `register`/`login`/`myInfo`, catálogo público y CRUD admin, citas y disponibilidad, notificaciones,
  `GlobalExceptionHandler` y pruebas MockMvc P01–P13.
- **No incluye:** fronts `apps/front` (F2, `plan-front-publico.md`) y `apps/admin` (F3, `plan-admin.md`);
  envío de correo de notificaciones (diferido, R-14); PWA/telemetría/chatbot (fuera de v1, `01 §1.5`).

## 3. Referencias
- Specs: `03-api-contract.md` (fuente de verdad del contrato), `04-backend-conventions.md`,
  `02-data-model.md`, `05-db-migrations.md` (validación F0), `01-functional.md` (HUs, R-1...R-15, P01–P13),
  `07-install-guide.md` (credenciales y variables).
- Skills: ninguna específica del repositorio.

## 4. Precondiciones
- F0 ✅: `db/migrations` con `V1`–`V4` + `R__01`–`R__04` aplicables sin error.
- JDK 21 en `JAVA_HOME` (el equipo tiene 17/25 → apuntar a 21).
- PostgreSQL accesible en `:5432` con BD `servitec` y `servitec_test` y rol `servitec` (`07 §2`).
- `JWT_SECRET`, `SPRING_DATASOURCE_*` resolubles por entorno (`.env.example`).

## 5. Tareas

### T-1.1 — Bootstrap del proyecto
- **Objetivo:** proyecto Maven ejecutable con wrapper, `ServitecApplication`, `application.yml` (datasource,
  `ddl-auto: validate`, `flyway.locations`, `app.security`/`app.cors`) y árbol de paquetes `com.servitec`.
- **Archivos:** crear `apps/api/pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`,
  `src/main/resources/application.yml`, `src/test/resources/application-test.yml`,
  `src/main/java/com/servitec/ServitecApplication.java`.
- **Pasos:** partir de `04 §Stack`/`04 §Configuración`; dependencias mínimas de `04`; apuntar Flyway a
  `filesystem:../../db/migrations`; verificar que Flyway aplica `V1`–`V4` + semilla y que `ddl-auto: validate`
  no genera DDL.
- **Criterios de aceptación:** `04 §Stack`, `04 §Configuración`, `05`, `07`.
- **Verificación:** V0 — `mvnw.cmd -q compile` en verde; arranque con Flyway sobre `servitec` vacía sin error.
- **Estado:** [x]

### T-1.2 — Seguridad
- **Objetivo:** JWT HS256 (claims `sub`/`rol`/`exp` 2 h), authorities `ROLE_*`, reglas de acceso por rol,
  CORS `:5173`/`:5174` y `BCryptPasswordEncoder`.
- **Archivos:** `security/TokenService.java`, `security/JwtAuthoritiesConverter.java`,
  `config/SecurityConfig.java`, `config/CorsConfig.java`, `config/JacksonConfig.java`.
- **Pasos:** `04 §Seguridad`; público `POST /api/auth/**`, `GET /api/productos`, `GET /api/categorias`,
  `GET /api/cita/tipoCita`; reglas admin/asesor/cliente exactas de `04 §Seguridad`.
- **Criterios de aceptación:** `04 §Seguridad`, `03 §Convenciones generales` (auth/CORS), R-1, R-6.
- **Verificación:** V0 — `mvnw.cmd -q compile`; cobertura por P01/P02 en T-1.6.
- **Estado:** [x]

### T-1.3 — Auth y usuarios
- **Objetivo:** `register`, `login`, `myInfo`, `GET /api/user`, `GET /api/user/asesores`,
  `POST /api/user/asesores`, `GET /api/user/clientesPorCorreo/:texto`.
- **Archivos:** `controller/AuthController.java`, `controller/UserController.java`,
  `service/AuthService.java`, `service/UserService.java`, `model/*`, `repository/*`, `dto/auth/*`, `dto/user/*`.
- **Pasos:** `03 §Autenticación` y `03 §Usuarios`; mensajes exactos `"Login exitoso"` y
  `"Usuario registrado con éxito"`; `register` fuerza `cliente`; `409` correo duplicado; `403` inactivo;
  `myInfo.citas` solo para `cliente`.
- **Criterios de aceptación:** `03 §C-8`, `03 §C-9`, `03 §Usuarios`, R-5, R-6, R-8.
- **Verificación:** V0 — `mvnw.cmd -q compile`; V1 — pruebas de `AuthService`/`UserService`; cubierto por
  P01/P02/P12 en T-1.6.
- **Estado:** [x]

### T-1.4 — Catálogo
- **Objetivo:** `GET /api/categorias` (árbol), `GET /api/productos` (+`/admin`) y CRUD admin con borrado físico.
- **Archivos:** `controller/ProductoController.java`, `service/ProductoService.java`,
  `repository/ProductoRepository.java`, `repository/CategoriaRepository.java`,
  `repository/SubcategoriaRepository.java`, `repository/CaracteristicaRepository.java`,
  `model/{Categoria,Subcategoria,Producto,Caracteristica}.java`, `dto/producto/*`.
- **Pasos:** `03 §Catálogo`; array plano; `categoria: {name, Subcategoria}`; filtros por nombre; excluir
  `stock = 0` en público; `/admin` incluye agotados; resolución subcategoría → `400`; `description` → `caracteristicas` por `orden`.
- **Criterios de aceptación:** `03 §C-1`, `03 §C-3`, `03 §C-6`, `03 §Catálogo`, R-9, R-10.
- **Verificación:** V0 — `mvnw.cmd -q compile`; cubierto por P06/P08 en T-1.6.
- **Estado:** [x]

### T-1.5 — Citas y notificaciones
- **Objetivo:** `tipoCita`, `disponibilidad(+Semana)`, `GET /api/cita`, `agregarCita`/`agregarCitaAdmin`,
  `aprobar`/`completar`/`cancelar`, y notificaciones (R-14).
- **Archivos:** `controller/CitaController.java`, `controller/NotificacionController.java`,
  `service/CitaService.java`, `service/NotificacionService.java`, `repository/CitaRepository.java`,
  `repository/TipoCitaRepository.java`, `repository/NotificacionRepository.java`,
  `model/{Cita,TipoCita,Notificacion}.java`, `dto/cita/*`, `dto/notificacion/*`.
- **Pasos:** `03 §Citas` y `03 §Notificaciones`; franjas Lima UTC-5 (R-11/R-12); `409` por índice único
  parcial (R-3) y validación de servicio (R-4); propiedad → `403`; transiciones → `409`; `contacto` snapshot
  (R-15); notificación al aprobar/cancelar; `observacion` obligatoria (R-13).
- **Criterios de aceptación:** `03 §Citas`, `03 §C-2`, `03 §C-4`, `03 §C-5`, `03 §C-7`, `03 §C-10`,
  `03 §C-11`, R-2, R-3, R-4, R-7, R-11...R-15.
- **Verificación:** V0 — `mvnw.cmd -q compile`; V1 — `CitaService` (franjas, transiciones, solapamiento);
  cubierto por P03/P04/P05/P09/P10/P11/P13 en T-1.6.
- **Estado:** [x]

### T-1.6 — Errores y pruebas
- **Objetivo:** `GlobalExceptionHandler` (`{error}`) y suite MockMvc P01–P13.
- **Archivos:** `exception/ApiException.java`, `exception/GlobalExceptionHandler.java`,
  `src/test/java/com/servitec/**` (P01–P13).
- **Pasos:** `04 §Validación y manejo de errores`; `MethodArgumentNotValid`→400,
  `DataIntegrityViolation`→409, `Exception`→500 logueado; perfil `test` con `servitec_test`; matriz de
  `docs/plans/matriz-trazabilidad.md`.
- **Criterios de aceptación:** `04 §Errores`, `03 §Criterios de aceptación` (P01–P13).
- **Verificación:** V0 — `mvnw.cmd test`; V1 — P01–P13 en verde.
- **Estado:** [x]

## 6. Matriz de trazabilidad del plan
| ID / sección | Tarea(s) |
|---|---|
| 03 §C-1, C-3, C-6 (producto) | T-1.4 |
| 03 §C-2, C-4, C-5, C-7, C-10, C-11 (cita/usuario/tipo) | T-1.3, T-1.5 |
| 03 §C-8, C-9 (mensajes login/register) | T-1.3 |
| 03 §Autenticación | T-1.3 |
| 03 §Catálogo | T-1.4 |
| 03 §Usuarios | T-1.3 |
| 03 §Citas | T-1.5 |
| 03 §Notificaciones | T-1.5 |
| 04 §Stack, §Configuración | T-1.1 |
| 04 §Seguridad | T-1.2 |
| 04 §Validación y manejo de errores | T-1.6 |
| 02 §Diccionario (entidades) | T-1.1, T-1.3, T-1.4, T-1.5 |
| R-1, R-6, R-8 | T-1.2, T-1.3 |
| R-2, R-3, R-4, R-7, R-11...R-15 | T-1.5 |
| R-5 | T-1.3 |
| R-9, R-10 | T-1.4 |
| P01, P02 | T-1.2, T-1.3, T-1.6 |
| P03, P04, P05, P09, P10, P11, P13 | T-1.5, T-1.6 |
| P06, P08 | T-1.4, T-1.6 |
| P07 | T-1.6 |
| P12 | T-1.3, T-1.6 |

## 7. Verificación final del plan
- [x] `mvnw.cmd test` en verde con P01–P13.
- [x] Cada endpoint responde exactamente como `03` (códigos, claves `_id`/`type`/`Subcategoria`, mensajes).
- [x] CORS operativo para `:5173` y `:5174`.
- [x] Flyway aplica `V1`–`V4` + semilla y `ddl-auto: validate` no genera DDL.

## 8. Registro de desvíos y decisiones
- **D-1 (2026-10-17) — Entorno JDK:** el equipo trae JDK 25 por defecto (`JAVA_HOME`), pero el plan exige
  JDK 21 (`04 §Stack`). Decisión: ejecutar con `JAVA_HOME` apuntado a `C:\Program Files\Java\jdk-21` sin
  cambiar la config global del sistema. Sin impacto en el contrato.
- **D-2 (2026-10-17) — Entorno PostgreSQL:** el plan pide PostgreSQL 18; la máquina tiene PostgreSQL 16 y
  el servicio existente no era arrancable/credencial desconocida. Decisión: levantar un clúster PG16 local
  en `:5432` con BD `servitec`/`servitec_test` para verificar. El esquema usado es compatible (índice único
  parcial, `timestamptz`). Desvío de versión documentado; no cambia el contrato ni las migraciones.
- **D-3 (2026-10-17) — Wrapper Maven:** no hay Maven en `PATH` ni proyecto generado; se usa la distribución
  Maven 3.9.16 cacheada en `~/.m2/wrapper` y se añade el wrapper al repo (`mvnw`/`mvnw.cmd`) en modo `bin`
  (usa `java`, no PowerShell) según `04 §Stack`.
- **D-4 (2026-10-17) — Particularidades de Spring Boot 4.1 (no cambian el contrato):** la autoconfiguración
  de Flyway vive en `spring-boot-starter-flyway`; Jackson es 3.x (`tools.jackson.*`); `AutoConfigureMockMvc`
  está en `spring-boot-webmvc-test`. El P07 (`BD caída → 500`) se verifica con `@MockitoBean` del servicio
  lanzando `DataAccessResourceFailureException` (no se tumba la BD real).
- **D-5 (2026-10-17) — Cierre:** T-1.1...T-1.6 ✅; `mvnw.cmd test` verde (14 pruebas: P01–P13 + contexto).
  F1 queda lista para habilitar F2 (`plan-front-publico.md`).