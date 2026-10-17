package com.servitec.dto.auth;

public record LoginResponse(String mensaje, String token, UsuarioAutenticado usuario) {

    public record UsuarioAutenticado(String nombre, String rol) {
    }
}