# Plan — Backend (`apps/api`)

Basado en `03-api-contract.md`, `04-backend-conventions.md` y `02-data-model.md`. Objetivo: API Spring
Boot 4.1.x / Java 21 que cumpla el contrato y pase P01–P13.

## Fase B1 — Bootstrap
- [ ] Generar el proyecto (start.spring.io) con las dependencias de `04` y el wrapper `mvnw`.
- [ ] `application.yml` con `datasource`, `jpa.hibernate.ddl-auto: validate`, `flyway.locations`
      (`filesystem:../../db/migrations`) y `app.security`/`app.cors` (orígenes `:5173` y `:5174`).
- [ ] Crear `ServitecApplication` y el árbol de paquetes `com.servitec` (`04`).
- [ ] Verificar que Flyway aplica `V1`–`V4` + semilla sobre `servitec` vacía y `ddl-auto` no genera DDL.

## Fase B2 — Seguridad
- [ ] `TokenService` (JWT HS256, claims `sub`/`rol`/`exp` 2 h) con `ImmutableSecret`.
- [ ] `JwtAuthoritiesConverter` (claim `rol` → `ROLE_*`).
- [ ] `SecurityConfig` stateless con las reglas de acceso por rol de `04` (incluye `GET /api/categorias` público).
- [ ] `CorsConfig` con `:5173` y `:5174`.
- [ ] `BCryptPasswordEncoder`; `PasswordEncoder` inyectado en `AuthService`.

## Fase B3 — Auth y usuarios
- [ ] `POST /api/auth/register` (fuerza `cliente`, BCrypt, `409` correo duplicado, mensaje exacto; acepta `apellido`/`telefono` opcionales).
- [ ] `POST /api/auth/login` (BCrypt, `401`/`403` inactivo, mensaje exacto `"Login exitoso"`, emite JWT).
- [ ] `GET /api/user/myInfo` (`citas` solo para `cliente`; vacío para asesor/admin).
- [ ] `GET /api/user` y `GET /api/user/clientesPorCorreo/:texto` (admin).
- [ ] `GET /api/user/asesores` (autenticado) y `POST /api/user/asesores` (admin, rol forzado).

## Fase B4 — Catálogo
- [ ] `GET /api/categorias` (árbol `{name, Subcategoria[]}`).
- [ ] `GET /api/productos` (array plano, filtros por nombre, excluye `stock = 0`) y `/admin` (incluye agotados).
- [ ] CRUD admin: `POST`/`PUT`/`DELETE` con resolución de `categoria` → `subcategoria_id` (`400` si no existe),
      `description` → `caracteristicas` (orden), borrado físico con cascada.
- [ ] Respuestas y mensajes según `03`.

## Fase B5 — Citas
- [ ] `GET /api/cita/tipoCita` (`_id`, `type`).
- [ ] `GET /api/cita/disponibilidad` (7 franjas Lima UTC-5, ocupadas marcadas; `400`/`404`).
- [ ] `GET /api/cita/disponibilidadSemana` (5 días × 7 franjas).
- [ ] `GET /api/cita` (filtros; asesor solo su agenda, `403` si pide otra).
- [ ] `POST /api/cita/agregarCita` (cliente; `clienteId` del token) y `agregarCitaAdmin` (admin; cliente+asesor del cuerpo). Aceptan `contacto` opcional y guardan el snapshot (R-15).
- [ ] Transiciones `aprobarCita` / `completarCita` (observación obligatoria) / `cancelarCita` (cliente dueño, asesor dueño o admin) con reglas de propiedad.
- [ ] Notificaciones: crear al aprobar/cancelar; `GET /api/notificaciones`, `POST /api/notificaciones/leer` (R-14).
- [ ] Reglas R-3 (índice único parcial → `409`) y R-4 (validación de servicio → `409`).

## Fase B6 — Errores y pruebas
- [ ] `GlobalExceptionHandler` (`{error}`, `MethodArgumentNotValid`→400, `DataIntegrityViolation`→409, `Exception`→500).
- [ ] Pruebas MockMvc **P01–P13** (perfil `test`, BD `servitec_test`) — usar la matriz de trazabilidad.

## DoD backend
- `./mvnw test` en verde con P01–P13.
- Cada endpoint responde exactamente como `03` (códigos, claves, mensajes).
- CORS operativo para `:5173` y `:5174`.

## Evidencia
- `mvn test` (salida) + colección curl/Postman por endpoint (`03`).
