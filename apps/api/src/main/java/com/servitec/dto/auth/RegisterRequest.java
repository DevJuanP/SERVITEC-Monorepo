package com.servitec.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String nombre,
        @Size(max = 120) String apellido,
        @NotBlank @Email @Size(max = 150) String correo,
        @Size(max = 30) String telefono,
        @NotBlank @Size(min = 6, max = 72) String password) {
}