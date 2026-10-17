package com.servitec.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.servitec.model.Cita;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByClienteIdOrderByFechaCitaAsc(Long clienteId);

    List<Cita> findByAsesorIdOrderByFechaCitaAsc(Long asesorId);

    List<Cita> findByAsesorIdAndFechaCitaAndEstadoNot(Long asesorId, Instant fechaCita, String estado);

    List<Cita> findByClienteIdAndFechaCitaAndEstadoNot(Long clienteId, Instant fechaCita, String estado);

    @Query("""
            select c from Cita c
            where (:asesorId is null or c.asesor.id = :asesorId)
              and (:clienteId is null or c.cliente.id = :clienteId)
              and (:estado is null or c.estado = :estado)
            order by c.fechaCita asc
            """)
    List<Cita> search(@Param("asesorId") Long asesorId,
                      @Param("clienteId") Long clienteId,
                      @Param("estado") String estado);
}