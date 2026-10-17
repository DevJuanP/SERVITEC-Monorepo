package com.servitec.service;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servitec.dto.CitaDto;
import com.servitec.dto.ContactoDto;
import com.servitec.dto.TipoCitaDto;
import com.servitec.dto.cita.AgregarCitaAdminRequest;
import com.servitec.dto.cita.AgregarCitaRequest;
import com.servitec.dto.cita.CitaActionResponse;
import com.servitec.dto.cita.CitaCreadaResponse;
import com.servitec.dto.cita.CitasResponse;
import com.servitec.dto.cita.DisponibilidadResponse;
import com.servitec.dto.cita.DisponibilidadSemanaResponse;
import com.servitec.dto.cita.FranjaDto;
import com.servitec.dto.cita.TipoCitasResponse;
import com.servitec.exception.ApiException;
import com.servitec.model.Cita;
import com.servitec.model.TipoCita;
import com.servitec.model.Usuario;
import com.servitec.repository.CitaRepository;
import com.servitec.repository.TipoCitaRepository;
import com.servitec.repository.UsuarioRepository;

@Service
public class CitaService {

    private static final ZoneOffset LIMA = ZoneOffset.ofHours(-5);
    private static final int[] FRANJAS = {9, 10, 11, 13, 14, 15, 16};
    private static final String CANCELADA = "Cancelada";

    private final CitaRepository citas;
    private final TipoCitaRepository tipos;
    private final UsuarioRepository usuarios;
    private final NotificacionService notificaciones;
    private final CitaMapper mapper;

    public CitaService(CitaRepository citas, TipoCitaRepository tipos, UsuarioRepository usuarios,
                       NotificacionService notificaciones, CitaMapper mapper) {
        this.citas = citas;
        this.tipos = tipos;
        this.usuarios = usuarios;
        this.notificaciones = notificaciones;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public TipoCitasResponse tipoCita() {
        List<TipoCitaDto> items = tipos.findAllByOrderByIdAsc().stream()
                .map(t -> new TipoCitaDto(t.getId(), t.getNombre()))
                .toList();
        return new TipoCitasResponse(items);
    }

    @Transactional(readOnly = true)
    public DisponibilidadResponse disponibilidad(Long asesorId, String fecha) {
        Long id = requireAsesor(asesorId);
        LocalDate dia = parseFecha(fecha, "fecha");
        validarAsesorExiste(id);
        return new DisponibilidadResponse(id, dia.toString(), franjasDelDia(id, dia));
    }

    @Transactional(readOnly = true)
    public DisponibilidadSemanaResponse disponibilidadSemana(Long asesorId, String desde) {
        Long id = requireAsesor(asesorId);
        LocalDate inicio = parseFecha(desde, "desde");
        validarAsesorExiste(id);
        while (esNoLaborable(inicio)) {
            inicio = inicio.plusDays(1);
        }
        List<DisponibilidadSemanaResponse.DiaDto> dias = new ArrayList<>();
        LocalDate cursor = inicio;
        while (dias.size() < 5) {
            if (!esNoLaborable(cursor)) {
                dias.add(new DisponibilidadSemanaResponse.DiaDto(cursor.toString(), franjasDelDia(id, cursor)));
            }
            cursor = cursor.plusDays(1);
        }
        return new DisponibilidadSemanaResponse(id, inicio.toString(), dias);
    }

    @Transactional(readOnly = true)
    public CitasResponse listar(Long usuarioId, String rol, Long asesorId, Long clienteId, String estado) {
        Long filtroAsesor = asesorId;
        if ("asesor".equals(rol)) {
            if (asesorId != null && !asesorId.equals(usuarioId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "No autorizado");
            }
            filtroAsesor = usuarioId;
        }
        List<CitaDto> items = citas.search(filtroAsesor, clienteId, estado).stream()
                .map(mapper::toDto)
                .toList();
        return new CitasResponse(items);
    }

    @Transactional
    public CitaCreadaResponse agregarCita(Long clienteId, AgregarCitaRequest request) {
        Usuario cliente = usuarios.findById(clienteId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        return crear(cliente, request.asesorId(), request.tipoCitaId(), request.fechaCita(),
                request.descripcion(), request.contacto());
    }

    @Transactional
    public CitaCreadaResponse agregarCitaAdmin(AgregarCitaAdminRequest request) {
        Usuario cliente = usuarios.findById(request.clienteId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        return crear(cliente, request.asesorId(), request.tipoCitaId(), request.fechaCita(),
                request.descripcion(), request.contacto());
    }

    @Transactional
    public CitaActionResponse aprobar(Long citaId, Long usuarioId, String rol) {
        Cita cita = findCita(citaId);
        validarPropiedad(cita, usuarioId, rol, false);
        if (!"Pendiente".equals(cita.getEstado())) {
            throw new ApiException(HttpStatus.CONFLICT, "Transición inválida");
        }
        cita.setEstado("Aprobada");
        citas.save(cita);
        notificaciones.crear(cita.getCliente(), cita, "Aprobada", "Tu cita fue aprobada");
        return new CitaActionResponse("Cita aprobada", cita.getId());
    }

    @Transactional
    public CitaActionResponse cancelar(Long citaId, Long usuarioId, String rol) {
        Cita cita = findCita(citaId);
        validarPropiedad(cita, usuarioId, rol, true);
        if (CANCELADA.equals(cita.getEstado())) {
            throw new ApiException(HttpStatus.CONFLICT, "La cita ya está cancelada");
        }
        if (!"Pendiente".equals(cita.getEstado()) && !"Aprobada".equals(cita.getEstado())) {
            throw new ApiException(HttpStatus.CONFLICT, "Transición inválida");
        }
        cita.setEstado(CANCELADA);
        citas.save(cita);
        notificaciones.crear(cita.getCliente(), cita, "Cancelada", "Tu cita fue cancelada");
        return new CitaActionResponse("Cita cancelada", cita.getId());
    }

    @Transactional
    public CitaActionResponse completar(Long citaId, String observacion, Long usuarioId, String rol) {
        Cita cita = findCita(citaId);
        validarPropiedad(cita, usuarioId, rol, false);
        if (!"Aprobada".equals(cita.getEstado())) {
            throw new ApiException(HttpStatus.CONFLICT, "Transición inválida");
        }
        cita.setEstado("Realizada");
        cita.setObservacion(observacion);
        citas.save(cita);
        return new CitaActionResponse("Cita concluida", cita.getId());
    }

    private CitaCreadaResponse crear(Usuario cliente, Long asesorId, Long tipoCitaId, Instant fechaCita,
                                     String descripcion, ContactoDto contacto) {
        Usuario asesor = usuarios.findById(asesorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Asesor no encontrado"));
        TipoCita tipo = tipos.findById(tipoCitaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tipo de cita no encontrado"));
        validarFranja(fechaCita);

        if (!citas.findByAsesorIdAndFechaCitaAndEstadoNot(asesor.getId(), fechaCita, CANCELADA).isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "El horario ya está ocupado");
        }
        if (!citas.findByClienteIdAndFechaCitaAndEstadoNot(cliente.getId(), fechaCita, CANCELADA).isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "El horario ya está ocupado");
        }

        Cita cita = new Cita();
        cita.setCliente(cliente);
        cita.setAsesor(asesor);
        cita.setTipoCita(tipo);
        cita.setEstado("Pendiente");
        cita.setFechaCreacion(Instant.now());
        cita.setFechaCita(fechaCita);
        cita.setDescripcion(descripcion);
        aplicarContacto(cita, contacto != null ? contacto : desdePerfil(cliente));
        citas.save(cita);

        return new CitaCreadaResponse("Cita registrada con éxito", mapper.toDto(cita));
    }

    private void validarPropiedad(Cita cita, Long usuarioId, String rol, boolean permitirCliente) {
        if ("admin".equals(rol)) {
            return;
        }
        if ("asesor".equals(rol)) {
            if (!cita.getAsesor().getId().equals(usuarioId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "No autorizado");
            }
            return;
        }
        if (permitirCliente && "cliente".equals(rol) && cita.getCliente().getId().equals(usuarioId)) {
            return;
        }
        throw new ApiException(HttpStatus.FORBIDDEN, "No autorizado");
    }

    private Cita findCita(Long citaId) {
        return citas.findById(citaId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cita no encontrada"));
    }

    private List<FranjaDto> franjasDelDia(Long asesorId, LocalDate fecha) {
        List<FranjaDto> franjas = new ArrayList<>();
        if (esNoLaborable(fecha)) {
            return franjas;
        }
        for (int hora : FRANJAS) {
            Instant instante = fecha.atTime(hora, 0).toInstant(LIMA);
            boolean ocupada = !citas.findByAsesorIdAndFechaCitaAndEstadoNot(asesorId, instante, CANCELADA).isEmpty();
            franjas.add(new FranjaDto(String.format("%02d:00", hora), !ocupada));
        }
        return franjas;
    }

    private void validarFranja(Instant fechaCita) {
        ZonedDateTime lima = fechaCita.atZone(LIMA);
        if (lima.getMinute() != 0 || lima.getSecond() != 0 || lima.getNano() != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La fecha no corresponde a una franja válida");
        }
        if (esNoLaborable(lima.toLocalDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La fecha no corresponde a una franja válida");
        }
        boolean valida = false;
        for (int hora : FRANJAS) {
            if (lima.getHour() == hora) {
                valida = true;
                break;
            }
        }
        if (!valida) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La fecha no corresponde a una franja válida");
        }
    }

    private boolean esNoLaborable(LocalDate fecha) {
        DayOfWeek dia = fecha.getDayOfWeek();
        return dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY;
    }

    private LocalDate parseFecha(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El parámetro " + campo + " es obligatorio");
        }
        try {
            return LocalDate.parse(valor, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Formato de fecha inválido (YYYY-MM-DD)");
        }
    }

    private Long requireAsesor(Long asesorId) {
        if (asesorId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El parámetro asesorId es obligatorio");
        }
        return asesorId;
    }

    private void validarAsesorExiste(Long asesorId) {
        if (!usuarios.existsById(asesorId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Asesor no encontrado");
        }
    }

    private ContactoDto desdePerfil(Usuario usuario) {
        return new ContactoDto(usuario.getNombre(), usuario.getApellido(), usuario.getCorreo(), usuario.getTelefono());
    }

    private void aplicarContacto(Cita cita, ContactoDto contacto) {
        cita.setContactoNombre(contacto.nombre());
        cita.setContactoApellido(contacto.apellido());
        cita.setContactoCorreo(contacto.correo());
        cita.setContactoTelefono(contacto.telefono());
    }
}