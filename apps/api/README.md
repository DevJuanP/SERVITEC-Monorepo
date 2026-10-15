# apps/api — Backend (Spring Boot) · *pendiente de implementación*

Este directorio alojará la API REST de SERVITEC: **Spring Boot 4.1.x + Java 21 (LTS) + Maven**,
con arquitectura **Controller–Service–Repository**, persistencia en **PostgreSQL 18** y
migraciones gestionadas por **Flyway** desde `db/migrations`.

## Estado

`PLACEHOLDER`. El proyecto aún no se ha generado. La implementación se hará a partir de los
planes de ejecución derivados de las especificaciones en `docs/specs/`.

## Cómo se generará (referencia)

- Base: `start.spring.io` → Spring Boot 4.1.x, Java 21, Maven.
- Dependencias: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`,
  `spring-boot-starter-validation`, `spring-boot-starter-security`,
  `spring-boot-starter-oauth2-resource-server`, `org.flywaydb:flyway-core`,
  `org.flywaydb:flyway-database-postgresql`, `org.postgresql:postgresql`,
  `org.projectlombok:lombok`.
- Paquete raíz: `com.servitec`.
- Puerto: `8080`. Origen CORS permitido: `http://localhost:5173`.

## Especificaciones de referencia

| Documento | Contenido |
|---|---|
| `docs/specs/03-api-contract.md` | Endpoints, request/response, auth y roles |
| `docs/specs/04-backend-conventions.md` | Estructura de paquetes, capas, seguridad, DTOs |
| `docs/specs/07-install-guide.md` | Requisitos e instalación |
