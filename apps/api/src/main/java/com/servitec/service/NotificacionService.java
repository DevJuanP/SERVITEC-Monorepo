package com.servitec.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servitec.dto.MensajeResponse;
import com.servitec.dto.notificacion.LeerRequest;
import com.servitec.dto.notificacion.NotificacionDto;
import com.servitec.dto.notificacion.NotificacionesResponse;
import com.servitec.exception.ApiException;
import com.servitec.model.Cita;
import com.servitec.model.Notificacion;
import com.servitec.model.Usuario;
import com.servitec.repository.NotificacionRepository;

@Service
public class NotificacionService {

    private final NotificacionRepository notificaciones;

    public NotificacionService(NotificacionRepository notificaciones) {
        this.notificaciones = notificaciones;
    }

    @Transactional
    public void crear(Usuario usuario, Cita cita, String tipo, String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setCita(cita);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacion.setLeida(false);
        notificacion.setFecha(Instant.now());
        notificaciones.save(notificacion);
    }

    @Transactional(readOnly = true)
    public NotificacionesResponse listar(Long usuarioId) {
        List<NotificacionDto> items = notificaciones.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(n -> new NotificacionDto(n.getId(), n.getTipo(), n.getMensaje(), n.isLeida(), n.getFecha(),
                        n.getCita() != null ? n.getCita().getId() : null))
                .toList();
        return new NotificacionesResponse(items);
    }

    @Transactional
    public MensajeResponse leer(Long usuarioId, LeerRequest request) {
        if (Boolean.TRUE.equals(request.todas())) {
            List<Notificacion> pendientes = notificaciones.findByUsuarioIdAndLeidaFalse(usuarioId);
            pendientes.forEach(n -> n.setLeida(true));
            notificaciones.saveAll(pendientes);
        } else if (request.notificacionId() != null) {
            Notificacion notificacion = notificaciones.findById(request.notificacionId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));
            if (!notificacion.getUsuario().getId().equals(usuarioId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "No autorizado");
            }
            notificacion.setLeida(true);
            notificaciones.save(notificacion);
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Debe indicar notificacionId o todas");
        }
        return new MensajeResponse("Notificaciones actualizadas");
    }
}