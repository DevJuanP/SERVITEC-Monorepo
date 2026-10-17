package com.servitec.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String correo,
        @NotBlank String password) {
}