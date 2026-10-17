package com.servitec.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.servitec.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    List<Usuario> findAllByOrderByIdAsc();

    List<Usuario> findByRolNombreOrderByNombreAsc(String rolNombre);

    List<Usuario> findByRolNombreAndCorreoContainingIgnoreCaseOrderByNombreAsc(String rolNombre, String texto);
}