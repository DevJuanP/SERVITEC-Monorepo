package com.servitec.service;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servitec.dto.auth.LoginRequest;
import com.servitec.dto.auth.LoginResponse;
import com.servitec.dto.auth.RegisterRequest;
import com.servitec.dto.auth.RegisterResponse;
import com.servitec.exception.ApiException;
import com.servitec.model.Rol;
import com.servitec.model.Usuario;
import com.servitec.repository.RolRepository;
import com.servitec.repository.UsuarioRepository;
import com.servitec.security.TokenService;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UsuarioRepository usuarios, RolRepository roles, PasswordEncoder passwordEncoder,
                       TokenService tokenService) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (usuarios.existsByCorreo(request.correo())) {
            throw new ApiException(HttpStatus.CONFLICT, "El correo ya está registrado");
        }
        Rol rol = roles.findByNombre("cliente")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Rol cliente no configurado"));

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setTelefono(request.telefono());
        usuario.setCorreo(request.correo());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setRol(rol);
        usuario.setActivo(true);
        usuario.setFechaRegistro(Instant.now());
        usuarios.save(usuario);

        return new RegisterResponse("Usuario registrado con éxito",
                new RegisterResponse.UsuarioRegistrado(usuario.getNombre(), usuario.getCorreo(), rol.getNombre()));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarios.findByCorreo(request.correo())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }
        if (!usuario.isActivo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Usuario inactivo");
        }
        String rol = usuario.getRol().getNombre();
        String token = tokenService.issue(usuario.getId(), rol);
        return new LoginResponse("Login exitoso", token,
                new LoginResponse.UsuarioAutenticado(usuario.getNombre(), rol));
    }
}