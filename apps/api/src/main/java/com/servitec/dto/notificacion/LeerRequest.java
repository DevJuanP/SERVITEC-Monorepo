package com.servitec.dto.notificacion;

import jakarta.validation.constraints.Positive;

public record LeerRequest(@Positive Long notificacionId, Boolean todas) {
}