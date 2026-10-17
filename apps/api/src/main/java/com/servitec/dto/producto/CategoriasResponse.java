package com.servitec.dto.producto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CategoriasResponse(List<CategoriaTreeItem> categorias) {

    public record CategoriaTreeItem(
            String name,
            @JsonProperty("Subcategoria") List<String> subcategorias) {
    }
}