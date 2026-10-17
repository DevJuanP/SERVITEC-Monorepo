package com.servitec.dto.producto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductoRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull @Positive BigDecimal price,
        @NotNull @PositiveOrZero Integer stock,
        List<@Size(max = 300) String> description,
        @Size(max = 500) String img,
        @NotNull @Valid CategoriaRef categoria) {

    public record CategoriaRef(
            @NotBlank String name,
            @NotBlank @JsonProperty("Subcategoria") String subcategoria) {
    }
}