package com.servitec.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UsuarioResumenDto(@JsonProperty("_id") Long id, String nombre, String correo) {
}