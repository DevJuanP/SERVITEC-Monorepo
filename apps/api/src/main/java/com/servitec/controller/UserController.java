package com.servitec.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servitec.dto.user.AsesorCreateRequest;
import com.servitec.dto.user.AsesorCreateResponse;
import com.servitec.dto.user.AsesoresResponse;
import com.servitec.dto.user.ClientesResponse;
import com.servitec.dto.user.MyInfoResponse;
import com.servitec.dto.user.UserListResponse;
import com.servitec.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/myInfo")
    public MyInfoResponse myInfo(@AuthenticationPrincipal Jwt jwt) {
        Long usuarioId = Long.valueOf(jwt.getSubject());
        String rol = jwt.getClaimAsString("rol");
        return userService.myInfo(usuarioId, rol);
    }

    @GetMapping
    public UserListResponse listUsuarios() {
        return userService.listUsuarios();
    }

    @GetMapping("/asesores")
    public AsesoresResponse asesores() {
        return userService.asesores();
    }

    @GetMapping("/clientesPorCorreo/{texto}")
    public ClientesResponse clientesPorCorreo(@PathVariable String texto) {
        return userService.clientesPorCorreo(texto);
    }

    @PostMapping("/asesores")
    @ResponseStatus(HttpStatus.CREATED)
    public AsesorCreateResponse crearAsesor(@Valid @RequestBody AsesorCreateRequest request) {
        return userService.crearAsesor(request);
    }
}