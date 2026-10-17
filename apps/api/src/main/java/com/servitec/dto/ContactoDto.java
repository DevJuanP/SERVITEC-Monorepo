package com.servitec.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record ContactoDto(
        @Size(max = 120) String nombre,
        @Size(max = 120) String apellido,
        @Email @Size(max = 150) String correo,
        @Size(max = 30) String telefono) {
}