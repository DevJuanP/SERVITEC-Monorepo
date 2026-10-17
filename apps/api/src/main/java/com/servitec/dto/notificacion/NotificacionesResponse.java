package com.servitec.dto.notificacion;

import java.util.List;

public record NotificacionesResponse(List<NotificacionDto> notificaciones) {
}