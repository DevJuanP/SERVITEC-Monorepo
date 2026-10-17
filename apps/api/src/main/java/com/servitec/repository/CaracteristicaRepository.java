package com.servitec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.servitec.model.Caracteristica;

public interface CaracteristicaRepository extends JpaRepository<Caracteristica, Long> {

    List<Caracteristica> findByProductoIdOrderByOrdenAsc(Long productoId);

    @Modifying
    @Query("delete from Caracteristica c where c.producto.id = :productoId")
    void deleteByProductoId(@Param("productoId") Long productoId);
}