package com.servitec.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.servitec.dto.MensajeResponse;
import com.servitec.dto.producto.CategoriasResponse;
import com.servitec.dto.producto.ProductoDto;
import com.servitec.dto.producto.ProductoRequest;
import com.servitec.dto.producto.ProductoResponse;
import com.servitec.service.ProductoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping("/categorias")
    public CategoriasResponse categorias() {
        return productoService.categorias();
    }

    @GetMapping("/productos")
    public List<ProductoDto> publicos(@RequestParam(required = false) String categoria,
                                      @RequestParam(required = false) String subcategoria) {
        return productoService.publicos(categoria, subcategoria);
    }

    @GetMapping("/productos/admin")
    public List<ProductoDto> admin(@RequestParam(required = false) String categoria,
                                   @RequestParam(required = false) String subcategoria) {
        return productoService.admin(categoria, subcategoria);
    }

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest request) {
        return productoService.crear(request);
    }

    @PutMapping("/productos/{id}")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(id, request);
    }

    @DeleteMapping("/productos/{id}")
    public MensajeResponse eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return new MensajeResponse("Producto eliminado con éxito");
    }
}