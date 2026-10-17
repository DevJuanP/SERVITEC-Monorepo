package com.servitec.dto.cita;

import java.util.List;

public record DisponibilidadResponse(Long asesorId, String fecha, List<FranjaDto> franjas) {
}