package com.servitec.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servitec.model.Subcategoria;

public interface SubcategoriaRepository extends JpaRepository<Subcategoria, Long> {

    Optional<Subcategoria> findByCategoriaNameAndName(String categoriaName, String name);

    List<Subcategoria> findAllByOrderByIdAsc();
}