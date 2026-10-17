package com.servitec.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servitec.model.TipoCita;

public interface TipoCitaRepository extends JpaRepository<TipoCita, Long> {

    List<TipoCita> findAllByOrderByIdAsc();
}