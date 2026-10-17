package com.servitec.dto.user;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.servitec.dto.CitaUsuarioDto;

public record MyInfoResponse(UsuarioDetalle usuario) {

    public record UsuarioDetalle(
            @JsonProperty("_id") Long id,
            String nombre,
            String correo,
            String rol,
            boolean activo,
            List<CitaUsuarioDto> citas) {
    }
}