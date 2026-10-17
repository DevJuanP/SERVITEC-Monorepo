package com.servitec.dto.cita;

import java.time.Instant;

import com.servitec.dto.ContactoDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AgregarCitaAdminRequest(
        @NotNull @Positive Long clienteId,
        @NotNull @Positive Long asesorId,
        @NotNull @Positive Long tipoCitaId,
        @NotNull Instant fechaCita,
        @Size(max = 1000) String descripcion,
        @Valid ContactoDto contacto) {
}