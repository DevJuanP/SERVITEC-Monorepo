package com.servitec.dto.cita;

import java.util.List;

public record DisponibilidadSemanaResponse(Long asesorId, String desde, List<DiaDto> dias) {

    public record DiaDto(String fecha, List<FranjaDto> franjas) {
    }
}