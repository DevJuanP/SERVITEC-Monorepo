# 04 — Convenciones del backend

## Objetivo
Fijar la estructura del proyecto Spring Boot, las capas, la configuración de seguridad, el manejo de
errores y las convenciones de código, para que la implementación sea consistente y predecible.

## Stack y versiones
| Componente | Versión |
|---|---|
| Spring Boot | 4.1.x (estable) |
| Java | 21 (LTS) |
| Spring Framework | 7.x |
| Spring Security | 7.x (Resource Server) |
| Build | Maven (wrapper `mvnw`) |
| PostgreSQL | 18 |
| Flyway | `flyway-core` + `flyway-database-postgresql` |
| Lombok | opcional (permitido) |

Dependencias mínimas: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`,
`spring-boot-starter-validation`, `spring-boot-starter-security`,
`spring-boot-starter-oauth2-resource-server`, `flyway-core`, `flyway-database-postgresql`,
`postgresql`, `lombok` (opcional), `spring-boot-starter-test`.

## Estructura de paquetes
```
com.servitec
├─ ServitecApplication.java
├─ config/        SecurityConfig, CorsConfig, JacksonConfig
├─ security/      TokenService (emisión JWT), JwtAuthoritiesConverter
├─ controller/    AuthController, ProductoController, UserController, CitaController, NotificacionController
├─ service/       AuthService, ProductoService, UserService, CitaService, NotificacionService (lógica + reglas)
├─ repository/    interfaces JpaRepository
├─ model/         entidades JPA
├─ dto/           request/response (records o clases con Lombok)
└─ exception/     ApiException, GlobalExceptionHandler
```

## Capas y responsabilidades
- **Controller**: validación de entrada (`@Valid`), seguridad por rol, mapeo a DTO. **Sin lógica de negocio.**
- **Service**: reglas de negocio (R-1…R-15), transacciones, orquestación. Lanza `ApiException` con el estado HTTP.
- **Repository**: acceso a datos (Spring Data JPA). Sin lógica.
- **Model**: entidades JPA mapeadas a las tablas del `02-data-model.md`.
- **DTO**: nunca se exponen entidades directamente; en particular, **el `password` jamás sale**.

## Seguridad
- **Stateless**; sin sesiones ni CSRF (API Bearer).
- **JWT HS256** con `JwtEncoder`/`JwtDecoder` de Nimbus (`ImmutableSecret`).
  - Emisión en `login`: `sub = id`, `rol = nombre del rol`, `exp = now + 2h`.
  - Decodificación con el mismo secret (`JWT_SECRET`).
- **Authorities**: conversor que lee el claim `rol` y produce `ROLE_ADMIN`, `ROLE_ASESOR`, `ROLE_CLIENTE`.
- **Password encoder**: `BCryptPasswordEncoder` (strength por defecto 10).
- **Reglas de acceso**:
  - Público: `POST /api/auth/**`, `GET /api/productos`, `GET /api/categorias`, `GET /api/cita/tipoCita`.
  - `ROLE_ADMIN`: `GET /api/user`, `POST /api/user/asesores`, `GET /api/user/clientesPorCorreo/**`, `GET /api/productos/admin`, escrituras de productos (`POST`/`PUT`/`DELETE /api/productos`), `POST /api/cita/agregarCitaAdmin`.
  - `ROLE_ADMIN` o `ROLE_ASESOR`: `GET /api/cita`.
  - Cualquier rol autenticado: `GET /api/user/myInfo`, `GET /api/user/asesores`, `GET /api/cita/disponibilidad`, `GET /api/cita/disponibilidadSemana`, `GET /api/notificaciones`, `POST /api/notificaciones/leer`.
  - `ROLE_CLIENTE`: `POST /api/cita/agregarCita`.
  - `ROLE_ASESOR` (dueño) o `ROLE_ADMIN`: `POST /api/cita/aprobarCita`, `POST /api/cita/completarCita`.
  - `ROLE_CLIENTE` (dueño), `ROLE_ASESOR` (dueño) o `ROLE_ADMIN`: `POST /api/cita/cancelarCita` (el rechazo del asesor/admin es esta misma operación).
  - Propiedad (verificada en servicio → `403`): un `cliente` solo cancela/consulta sus propias citas; un `asesor` solo aprueba/concluye/cancela citas de su agenda.
- **CORS**: orígenes `http://localhost:5173` (front público) y `http://localhost:5174` (panel admin); métodos y cabeceras estándar, `Authorization` permitido.
- **Transporte**: el prototipo local usa HTTP; HTTPS es requisito de despliegue productivo (fuera del alcance actual).

## Validación y manejo de errores
- Validación declarativa con `jakarta.validation` (`@NotBlank`, `@Email`, `@Positive`, etc.) + `@Valid`.

  | Campo | Regla |
  |---|---|
  | `nombre` (usuario) | `@NotBlank`, `@Size(max = 120)` |
  | `apellido` (usuario) | `@Size(max = 120)` (opcional) |
  | `telefono` (usuario) | `@Size(max = 30)` (opcional) |
  | `correo` | `@NotBlank`, `@Email`, `@Size(max = 150)` |
  | `password` | `@NotBlank`, `@Size(min = 6, max = 72)` |
  | `name` (producto) | `@NotBlank`, `@Size(max = 150)` |
  | `price` | `@NotNull`, `@Positive` |
  | `stock` | `@NotNull`, `@PositiveOrZero` |
  | `description` | lista opcional de `String`; cada ítem `@Size(max = 300)` |
  | `categoria.name` / `categoria.Subcategoria` | `@NotBlank` |
  | `asesorId` / `clienteId` / `tipoCitaId` | `@NotNull`, `@Positive` |
  | `fechaCita` | `@NotNull` (ISO 8601) |
  | `observacion` (completar) | `@NotBlank`, `@Size(max = 1000)` |
  | `contacto.*` (agregarCita) | opcional; si viene, `correo` `@Email`, resto `@Size` |
  | `notificacionId` / `todas` | uno de los dos requerido |
- `GlobalExceptionHandler` (`@RestControllerAdvice`) → **siempre** `{ "error": "<mensaje>" }`:
  | Excepción | HTTP |
  |---|---|
  | `MethodArgumentNotValidException` | 400 |
  | `ApiException` (código explícito) | el código que traiga |
  | `DataIntegrityViolationException` (índice único de agenda) | 409 |
  | `Exception` no controlada | 500 (registrar stacktrace en log) |
- El conflicto de agenda se detecta por el índice único parcial (R-3) y por validación de servicio (R-4).

## Configuración
`application.yml` (valores por entorno):
```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/servitec}
    username: ${SPRING_DATASOURCE_USERNAME:servitec}
    password: ${SPRING_DATASOURCE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate      # el esquema lo gobierna Flyway, no Hibernate
    open-in-view: false
  flyway:
    enabled: true
    locations: ${SPRING_FLYWAY_LOCATIONS:filesystem:../../db/migrations}
app:
  security:
    jwt-secret: ${JWT_SECRET}
    jwt-expiration-minutes: 120
  cors:
    allowed-origins: http://localhost:5173,http://localhost:5174
```
- `ddl-auto: validate` (nunca `update`): el esquema es responsabilidad de Flyway.
- La ruta `filesystem:../../db/migrations` es relativa al directorio de trabajo (`apps/api`).

## Convenciones de código
- **Idioma**: nombres de clases/métodos/variables en **inglés**; campos persistentes que forman el contrato en **español** (`nombre`, `correo`, `fechaCita`).
- DTOs de respuesta con anotaciones `@JsonProperty` para claves de compatibilidad (`_id`, `type`, `Subcategoria`).
- Sin `System.out.println`; logging con SLF4J.
- Constructor injection (sin `@Autowired` en campos).
- Un endpoint por método; servicios `@Transactional` en escrituras.

## Pruebas
- `@SpringBootTest` + `MockMvc` (perfil `test`, BD `servitec_test`).
- Cobertura mínima: **P01–P13** de `01-functional.md`.
- `mvn test` debe pasar en verde.

## Tareas derivables
1. Generar el proyecto (start.spring.io) y fijar `application.yml`.
2. Crear `SecurityConfig`, `CorsConfig`, `TokenService`, `JwtAuthoritiesConverter`.
3. Crear `GlobalExceptionHandler` y `ApiException`.
4. Implementar capas por módulo (auth, user, producto, cita).
5. Configurar el perfil `test` y las pruebas P01–P13.

## Dependencias
- Contrato: `03-api-contract.md`. Modelo: `02-data-model.md`. Migraciones: `05-db-migrations.md`.

## Evidencia esperada
- Árbol de paquetes `com.servitec` implementado.
- `mvn test` en verde.
- Configuración de seguridad documentada (qué ruta exige qué rol).
