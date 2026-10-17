package com.servitec.dto.cita;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CitaActionRequest(@NotNull @Positive Long citaId) {
}