package com.servitec.dto.cita;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CompletarCitaRequest(
        @NotNull @Positive Long citaId,
        @NotBlank @Size(max = 1000) String observacion) {
}