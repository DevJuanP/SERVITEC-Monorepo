package com.servitec.service;

import org.springframework.stereotype.Component;

import com.servitec.dto.CitaDto;
import com.servitec.dto.CitaUsuarioDto;
import com.servitec.dto.ContactoDto;
import com.servitec.dto.TipoCitaDto;
import com.servitec.dto.UsuarioResumenDto;
import com.servitec.model.Cita;

@Component
public class CitaMapper {

    public CitaDto toDto(Cita c) {
        return new CitaDto(
                c.getId(),
                c.getFechaCita(),
                c.getFechaCreacion(),
                c.getEstado(),
                c.getDescripcion(),
                c.getObservacion(),
                contacto(c),
                new UsuarioResumenDto(c.getCliente().getId(), c.getCliente().getNombre(), c.getCliente().getCorreo()),
                new UsuarioResumenDto(c.getAsesor().getId(), c.getAsesor().getNombre(), c.getAsesor().getCorreo()),
                new TipoCitaDto(c.getTipoCita().getId(), c.getTipoCita().getNombre()));
    }

    public CitaUsuarioDto toUsuarioDto(Cita c) {
        return new CitaUsuarioDto(
                c.getId(),
                c.getFechaCita(),
                c.getFechaCreacion(),
                c.getEstado(),
                c.getDescripcion(),
                c.getObservacion(),
                contacto(c),
                new UsuarioResumenDto(c.getAsesor().getId(), c.getAsesor().getNombre(), c.getAsesor().getCorreo()),
                new TipoCitaDto(c.getTipoCita().getId(), c.getTipoCita().getNombre()));
    }

    private ContactoDto contacto(Cita c) {
        return new ContactoDto(c.getContactoNombre(), c.getContactoApellido(), c.getContactoCorreo(), c.getContactoTelefono());
    }
}