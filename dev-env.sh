# GENERADO POR tools/db-setup — no editar a mano: se regenera con `npm run setup`

# Carga estas variables en la sesión actual antes de arrancar el backend:
#     source dev-env.sh
#     cd apps/api && ./mvnw spring-boot:run

# Los puertos salen de estas variables (no hay puertos escritos en el código):
#     SERVER_PORT          -> puerto de la API (application.yml)
#     CORS_ALLOWED_ORIGINS -> orígenes permitidos (los fronts)
# Para cambiarlos: edita API_PORT / FRONT_PORT / ADMIN_PORT en tools/db-setup/.env
# y vuelve a ejecutar el script.

# OJO con las pruebas: SPRING_DATASOURCE_URL apunta a la base de DESARROLLO.
# Las pruebas del backend usan la base de PRUEBAS, así que reasigna la variable
# antes de mvnw test:
#     export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/servitec_test"

export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/servitec"
export SPRING_DATASOURCE_USERNAME="servitec"
export SPRING_DATASOURCE_PASSWORD="juandev"
export JWT_SECRET="CEy89JKi34Y9EFhDiNkyfGLiArwCozaSyGvTR9gLWCuouyzIQc_p92IXLNkvYmj1"
export SERVER_PORT="8092"
export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
export SPRING_FLYWAY_LOCATIONS="filesystem:../../db/migrations"

# Descomenta y ajusta si tu JAVA_HOME no apunta a un JDK 21:
# export JAVA_HOME=/c/Program\ Files/Java/jdk-21
