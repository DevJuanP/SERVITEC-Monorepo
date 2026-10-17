package com.servitec.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.servitec.dto.MensajeResponse;
import com.servitec.dto.notificacion.LeerRequest;
import com.servitec.dto.notificacion.NotificacionesResponse;
import com.servitec.service.NotificacionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public NotificacionesResponse listar(@AuthenticationPrincipal Jwt jwt) {
        return notificacionService.listar(Long.valueOf(jwt.getSubject()));
    }

    @PostMapping("/leer")
    public MensajeResponse leer(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody LeerRequest request) {
        return notificacionService.leer(Long.valueOf(jwt.getSubject()), request);
    }
}