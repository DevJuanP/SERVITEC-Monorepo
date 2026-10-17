package com.servitec.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AsesorCreateResponse(String mensaje, UsuarioRolDto usuario) {

    public record UsuarioRolDto(
            @JsonProperty("_id") Long id,
            String nombre,
            String correo,
            String rol) {
    }
}