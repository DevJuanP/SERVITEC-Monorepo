# GENERADO POR tools/db-setup — no editar a mano: se regenera con `npm run setup`

# Carga estas variables en la sesión actual antes de arrancar el backend:
#     . .\dev-env.ps1
#     cd apps/api; .\mvnw.cmd spring-boot:run

# Los puertos salen de estas variables (no hay puertos escritos en el código):
#     SERVER_PORT          -> puerto de la API (application.yml)
#     CORS_ALLOWED_ORIGINS -> orígenes permitidos (los fronts)
# Para cambiarlos: edita API_PORT / FRONT_PORT / ADMIN_PORT en tools/db-setup/.env
# y vuelve a ejecutar el script.

# OJO con las pruebas: SPRING_DATASOURCE_URL apunta a la base de DESARROLLO.
# Las pruebas del backend usan la base de PRUEBAS, así que reasigna la variable
# antes de `mvnw test`:
#     $env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/servitec_test'

$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/servitec'
$env:SPRING_DATASOURCE_USERNAME = 'servitec'
$env:SPRING_DATASOURCE_PASSWORD = 'juandev'
$env:JWT_SECRET = 'CEy89JKi34Y9EFhDiNkyfGLiArwCozaSyGvTR9gLWCuouyzIQc_p92IXLNkvYmj1'
$env:SERVER_PORT = '8092'
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:5174'
$env:SPRING_FLYWAY_LOCATIONS = 'filesystem:../../db/migrations'

# Descomenta y ajusta si tu JAVA_HOME no apunta a un JDK 21:
# $env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
