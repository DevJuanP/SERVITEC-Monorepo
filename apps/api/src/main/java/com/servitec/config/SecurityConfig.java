package com.servitec.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

import com.servitec.security.JwtAuthoritiesConverter;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtAuthoritiesConverter authoritiesConverter,
                                                   AuthenticationEntryPoint authenticationEntryPoint,
                                                   AccessDeniedHandler accessDeniedHandler) throws Exception {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/productos", "/api/categorias", "/api/cita/tipoCita").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/productos/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/productos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/user").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/user/asesores").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/user/clientesPorCorreo/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/cita/agregarCitaAdmin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/cita").hasAnyRole("ADMIN", "ASESOR")
                        .requestMatchers(HttpMethod.GET, "/api/user/myInfo", "/api/user/asesores").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/cita/disponibilidad", "/api/cita/disponibilidadSemana").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/notificaciones").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/notificaciones/leer").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/cita/agregarCita").hasRole("CLIENTE")
                        .requestMatchers(HttpMethod.POST, "/api/cita/aprobarCita", "/api/cita/completarCita").hasAnyRole("ADMIN", "ASESOR")
                        .requestMatchers(HttpMethod.POST, "/api/cita/cancelarCita").authenticated()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint(authenticationEntryPoint))
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder(AppProperties properties) {
        SecretKey key = new SecretKeySpec(
                properties.security().jwtSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                "No autenticado");
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> writeError(response, HttpServletResponse.SC_FORBIDDEN,
                "Acceso denegado");
    }

    private static void writeError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}