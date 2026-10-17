package com.servitec.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servitec.dto.cita.AgregarCitaAdminRequest;
import com.servitec.dto.cita.AgregarCitaRequest;
import com.servitec.dto.cita.CitaActionRequest;
import com.servitec.dto.cita.CitaActionResponse;
import com.servitec.dto.cita.CitaCreadaResponse;
import com.servitec.dto.cita.CitasResponse;
import com.servitec.dto.cita.CompletarCitaRequest;
import com.servitec.dto.cita.DisponibilidadResponse;
import com.servitec.dto.cita.DisponibilidadSemanaResponse;
import com.servitec.dto.cita.TipoCitasResponse;
import com.servitec.service.CitaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cita")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping("/tipoCita")
    public TipoCitasResponse tipoCita() {
        return citaService.tipoCita();
    }

    @GetMapping("/disponibilidad")
    public DisponibilidadResponse disponibilidad(@RequestParam Long asesorId, @RequestParam String fecha) {
        return citaService.disponibilidad(asesorId, fecha);
    }

    @GetMapping("/disponibilidadSemana")
    public DisponibilidadSemanaResponse disponibilidadSemana(@RequestParam Long asesorId,
                                                             @RequestParam String desde) {
        return citaService.disponibilidadSemana(asesorId, desde);
    }

    @GetMapping
    public CitasResponse listar(@AuthenticationPrincipal Jwt jwt,
                                @RequestParam(required = false) Long asesorId,
                                @RequestParam(required = false) Long clienteId,
                                @RequestParam(required = false) String estado) {
        return citaService.listar(Long.valueOf(jwt.getSubject()), jwt.getClaimAsString("rol"), asesorId, clienteId,
                estado);
    }

    @PostMapping("/agregarCita")
    @ResponseStatus(HttpStatus.CREATED)
    public CitaCreadaResponse agregarCita(@AuthenticationPrincipal Jwt jwt,
                                          @Valid @RequestBody AgregarCitaRequest request) {
        return citaService.agregarCita(Long.valueOf(jwt.getSubject()), request);
    }

    @PostMapping("/agregarCitaAdmin")
    @ResponseStatus(HttpStatus.CREATED)
    public CitaCreadaResponse agregarCitaAdmin(@Valid @RequestBody AgregarCitaAdminRequest request) {
        return citaService.agregarCitaAdmin(request);
    }

    @PostMapping("/aprobarCita")
    public CitaActionResponse aprobar(@AuthenticationPrincipal Jwt jwt,
                                      @Valid @RequestBody CitaActionRequest request) {
        return citaService.aprobar(request.citaId(), Long.valueOf(jwt.getSubject()), jwt.getClaimAsString("rol"));
    }

    @PostMapping("/cancelarCita")
    public CitaActionResponse cancelar(@AuthenticationPrincipal Jwt jwt,
                                       @Valid @RequestBody CitaActionRequest request) {
        return citaService.cancelar(request.citaId(), Long.valueOf(jwt.getSubject()), jwt.getClaimAsString("rol"));
    }

    @PostMapping("/completarCita")
    public CitaActionResponse completar(@AuthenticationPrincipal Jwt jwt,
                                        @Valid @RequestBody CompletarCitaRequest request) {
        return citaService.completar(request.citaId(), request.observacion(), Long.valueOf(jwt.getSubject()),
                jwt.getClaimAsString("rol"));
    }
}