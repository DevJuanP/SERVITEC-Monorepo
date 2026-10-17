package com.servitec.dto.auth;

public record RegisterResponse(String mensaje, UsuarioRegistrado usuario) {

    public record UsuarioRegistrado(String nombre, String correo, String rol) {
    }
}