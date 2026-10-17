package com.servitec.dto.cita;

import java.util.List;

import com.servitec.dto.CitaDto;

public record CitasResponse(List<CitaDto> citas) {
}