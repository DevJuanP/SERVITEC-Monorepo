package com.servitec.dto.producto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ProductoDto(
        Long id,
        String name,
        BigDecimal price,
        int stock,
        List<String> description,
        String img,
        CategoriaProductoDto categoria) {

    public record CategoriaProductoDto(
            String name,
            @JsonProperty("Subcategoria") String subcategoria) {
    }
}