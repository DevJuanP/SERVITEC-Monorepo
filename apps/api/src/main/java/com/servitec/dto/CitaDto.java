package com.servitec.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CitaDto(
        @JsonProperty("_id") Long id,
        Instant fechaCita,
        Instant fechaCreacion,
        String estado,
        String descripcion,
        String observacion,
        ContactoDto contacto,
        UsuarioResumenDto cliente,
        UsuarioResumenDto asesor,
        TipoCitaDto tipoCita) {
}