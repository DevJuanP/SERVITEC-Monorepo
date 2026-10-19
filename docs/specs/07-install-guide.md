# 07 — Guía de instalación

## Objetivo
Permitir que cualquier integrante levante el monorepo SERVITEC desde cero en un entorno local.

## Requisitos previos
| Requisito | Versión | Verificación |
|---|---|---|
| Node.js | 20+ (recomendado 24) | `node -v` |
| npm | 10+ | `npm -v` |
| JDK | **21 (LTS)** | `java -version` |
| PostgreSQL | **18** | `psql --version` o ver el servicio |
| Git | cualquiera reciente | `git --version` |

> El equipo trabaja hoy con **JDK 17**; el backend requiere **JDK 21**. Instalar el 21 y apuntar `JAVA_HOME` a él.

## 1. Instalar el JDK 21
- Descargar **Eclipse Temurin JDK 21 (LTS)** desde Adoptium.
- Instalar y fijar `JAVA_HOME` a la ruta del JDK 21.
- Verificar: `java -version` → debe reportar `21.x`.

## 2. Instalar PostgreSQL 18
- Instalar desde el instalador oficial (incluye pgAdmin y `psql`).
- Anotar el **puerto** (por defecto `5432`) y la contraseña del superusuario.

### Crear la base y el usuario
Ejecutar en `psql` (como superusuario `postgres`):
```sql
CREATE ROLE servitec LOGIN PASSWORD 'cambia_esta_password';
CREATE DATABASE servitec OWNER servitec;
CREATE DATABASE servitec_test OWNER servitec;   -- usada por las pruebas
```
Verificar conexión:
```bash
psql -h localhost -U servitec -d servitec -c "select 1;"
```

> **Alternativa automatizada**: `tools/db-setup` hace esto mismo (más los `.env` y las
> migraciones) sin necesidad de `psql` en el `PATH`:
> ```bash
> cd tools/db-setup
> copy .env.example .env       # y edita las credenciales del superusuario
> npm install
> npm run setup
> ```
> Ver `tools/db-setup/README.md`.

## 3. Clonar y preparar el monorepo
```bash
git clone https://github.com/DevJuanP/SERVITEC-Monorepo.git
cd SERVITEC-Monorepo
```

## 4. Variables de entorno
```bash
cp .env.example .env
```
Ajustar como mínimo:
| Variable | Valor esperado |
|---|---|
| `VITE_API_URL` | `http://localhost:8080` |
| `VITE_ADMIN_URL` | `http://localhost:5174` (usado por el `Header` del front público) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/servitec` |
| `SPRING_DATASOURCE_USERNAME` | `servitec` |
| `SPRING_DATASOURCE_PASSWORD` | la que definiste |
| `JWT_SECRET` | una cadena larga y secreta |

> Los archivos de entorno de este repo **sí se versionan** (solo para desarrollo local).
> Al clonar ya vienen; cada máquina solo ajusta `PGSUPERPASSWORD` en
> `tools/db-setup/.env` y re-ejecuta `npm run setup`. Ver
> `tools/db-setup/README.md` → «Otra máquina (tu compañero, otro PostgreSQL)».

## 5. Levantar el backend *(cuando esté implementado)*
```bash
cd apps/api
./mvnw spring-boot:run     # Windows: mvnw.cmd spring-boot:run
```
- Escucha en `http://localhost:8080` (`SERVER_PORT`; configurable por entorno, no hay puertos literales en el código).
- Los orígenes permitidos por CORS se definen con `CORS_ALLOWED_ORIGINS` (por defecto `5173` y `5174`).
- El entorno local usa **HTTP**; HTTPS (dominio y certificados) se configura en el despliegue productivo, fuera del alcance actual.
- Aplica automáticamente las migraciones Flyway de `db/migrations`.
- Verificar: `curl http://localhost:8080/api/productos`.

## 6. Levantar los fronts
### 6.1 Front público
```bash
cd apps/front
npm install
npm run dev                # http://localhost:5173
```
### 6.2 Panel de administración *(cuando esté implementado)*
```bash
cd apps/admin
npm install
npm run dev                # http://localhost:5174
```
> El backend debe permitir CORS desde `http://localhost:5173` y `http://localhost:5174`.

## 7. Credenciales de la semilla (demo)
| Rol | Correo | Contraseña |
|---|---|---|
| admin | `admin@servitec.pe` | `Servitec123` |
| asesor | `asesor@servitec.pe` | `Servitec123` |
| asesor | `asesor2@servitec.pe` | `Servitec123` |
| asesor | `asesor3@servitec.pe` | `Servitec123` |
| cliente | `cliente@servitec.pe` | `Servitec123` |

> Estas credenciales son **solo para desarrollo local**.

## Versiones del stack (referencia para el informe)

| Componente | Versión |
|---|---|
| Java (JDK) | **21 (LTS)** |
| Spring Boot | **4.1.x** |
| Spring Framework / Security | 7.x (Resource Server, JWT HS256) |
| PostgreSQL | **18** |
| Flyway | gestionado por Spring Boot (`flyway-core` + `flyway-database-postgresql`) |
| Maven | wrapper `mvnw` |
| Node.js / npm | 20+ (recomendado 24) / 10+ |
| React / Vite | 19 / 7 |
| Git | cualquiera reciente |

> El equipo trabaja hoy con JDK 17: el backend exige **21** (ver §1). Esta tabla es la fuente para declarar versiones en los entregables.

## Checklist de verificación
- [ ] `java -version` → 21.x
- [ ] `psql -h localhost -U servitec -d servitec -c "select 1;"` responde
- [ ] Backend arriba en `:8080` y migraciones aplicadas
- [ ] `GET /api/productos` devuelve 57 productos disponibles (60 en `GET /api/productos/admin`; 2/12/48 agotados)
- [ ] Front público arriba en `:5173` y carga el catálogo
- [ ] Panel admin arriba en `:5174`; login de admin/asesor funciona
- [ ] Login con `admin@servitec.pe` muestra el enlace al panel

## Problemas frecuentes
Ver `08-ops-manual.md` (sección de resolución de problemas).
