package com.servitec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.servitec.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Query("""
            select distinct p from Producto p
            join p.subcategoria s
            join s.categoria cat
            where p.stock > 0
              and (:categoria is null or cat.name = :categoria)
              and (:subcategoria is null or s.name = :subcategoria)
            order by p.id asc
            """)
    List<Producto> findPublico(@Param("categoria") String categoria, @Param("subcategoria") String subcategoria);

    @Query("""
            select distinct p from Producto p
            join p.subcategoria s
            join s.categoria cat
            where (:categoria is null or cat.name = :categoria)
              and (:subcategoria is null or s.name = :subcategoria)
            order by p.id asc
            """)
    List<Producto> findAdmin(@Param("categoria") String categoria, @Param("subcategoria") String subcategoria);

    @Query("select coalesce(max(p.id), 0) from Producto p")
    long findMaxId();
}