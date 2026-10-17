package com.servitec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servitec.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByOrderByIdAsc();
}