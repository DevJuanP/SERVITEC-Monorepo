package com.servitec.dto.user;

import java.util.List;

import com.servitec.dto.UsuarioResumenDto;

public record ClientesResponse(List<UsuarioResumenDto> clientes) {
}