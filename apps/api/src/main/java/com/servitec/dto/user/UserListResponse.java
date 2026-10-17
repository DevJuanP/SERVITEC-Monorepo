package com.servitec.dto.user;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.servitec.dto.CitaUsuarioDto;

public record UserListResponse(List<UsuarioAdminItem> usuarios) {

    public record UsuarioAdminItem(
            @JsonProperty("_id") Long id,
            String nombre,
            String correo,
            String rol,
            boolean activo,
            Instant fechaRegistro,
            List<CitaUsuarioDto> citas) {
    }
}