package com.servitec.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servitec.dto.CitaUsuarioDto;
import com.servitec.dto.UsuarioResumenDto;
import com.servitec.dto.user.AsesorCreateRequest;
import com.servitec.dto.user.AsesorCreateResponse;
import com.servitec.dto.user.AsesoresResponse;
import com.servitec.dto.user.ClientesResponse;
import com.servitec.dto.user.MyInfoResponse;
import com.servitec.dto.user.UserListResponse;
import com.servitec.exception.ApiException;
import com.servitec.model.Rol;
import com.servitec.model.Usuario;
import com.servitec.repository.CitaRepository;
import com.servitec.repository.RolRepository;
import com.servitec.repository.UsuarioRepository;

@Service
public class UserService {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final CitaRepository citas;
    private final CitaMapper citaMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UsuarioRepository usuarios, RolRepository roles, CitaRepository citas,
                       CitaMapper citaMapper, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.citas = citas;
        this.citaMapper = citaMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public MyInfoResponse myInfo(Long usuarioId, String rol) {
        Usuario usuario = usuarios.findById(usuarioId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        List<CitaUsuarioDto> citasUsuario = "cliente".equals(rol)
                ? citas.findByClienteIdOrderByFechaCitaAsc(usuarioId).stream().map(citaMapper::toUsuarioDto).toList()
                : List.of();
        return new MyInfoResponse(new MyInfoResponse.UsuarioDetalle(
                usuario.getId(), usuario.getNombre(), usuario.getCorreo(), usuario.getRol().getNombre(),
                usuario.isActivo(), citasUsuario));
    }

    @Transactional(readOnly = true)
    public UserListResponse listUsuarios() {
        List<UserListResponse.UsuarioAdminItem> items = usuarios.findAllByOrderByIdAsc().stream()
                .map(this::toAdminItem)
                .toList();
        return new UserListResponse(items);
    }

    @Transactional(readOnly = true)
    public AsesoresResponse asesores() {
        List<UsuarioResumenDto> items = usuarios.findByRolNombreOrderByNombreAsc("asesor").stream()
                .map(u -> new UsuarioResumenDto(u.getId(), u.getNombre(), null))
                .toList();
        return new AsesoresResponse(items);
    }

    @Transactional(readOnly = true)
    public ClientesResponse clientesPorCorreo(String texto) {
        List<UsuarioResumenDto> items = usuarios
                .findByRolNombreAndCorreoContainingIgnoreCaseOrderByNombreAsc("cliente", texto).stream()
                .map(u -> new UsuarioResumenDto(u.getId(), u.getNombre(), u.getCorreo()))
                .toList();
        return new ClientesResponse(items);
    }

    @Transactional
    public AsesorCreateResponse crearAsesor(AsesorCreateRequest request) {
        if (usuarios.existsByCorreo(request.correo())) {
            throw new ApiException(HttpStatus.CONFLICT, "El correo ya está registrado");
        }
        Rol rol = roles.findByNombre("asesor")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Rol asesor no configurado"));

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setCorreo(request.correo());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setRol(rol);
        usuario.setActivo(true);
        usuario.setFechaRegistro(Instant.now());
        usuarios.save(usuario);

        return new AsesorCreateResponse("Asesor registrado con éxito",
                new AsesorCreateResponse.UsuarioRolDto(usuario.getId(), usuario.getNombre(), usuario.getCorreo(),
                        rol.getNombre()));
    }

    private UserListResponse.UsuarioAdminItem toAdminItem(Usuario usuario) {
        List<CitaUsuarioDto> citasUsuario = citas.findByClienteIdOrderByFechaCitaAsc(usuario.getId()).stream()
                .map(citaMapper::toUsuarioDto)
                .toList();
        return new UserListResponse.UsuarioAdminItem(
                usuario.getId(), usuario.getNombre(), usuario.getCorreo(), usuario.getRol().getNombre(),
                usuario.isActivo(), usuario.getFechaRegistro(), citasUsuario);
    }
}