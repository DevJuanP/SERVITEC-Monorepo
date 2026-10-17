package com.servitec.dto.notificacion;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NotificacionDto(
        @JsonProperty("_id") Long id,
        String tipo,
        String mensaje,
        boolean leida,
        Instant fecha,
        Long citaId) {
}