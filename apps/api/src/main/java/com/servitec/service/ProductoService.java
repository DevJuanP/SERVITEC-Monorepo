package com.servitec.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.servitec.dto.producto.CategoriasResponse;
import com.servitec.dto.producto.ProductoDto;
import com.servitec.dto.producto.ProductoRequest;
import com.servitec.dto.producto.ProductoResponse;
import com.servitec.exception.ApiException;
import com.servitec.model.Caracteristica;
import com.servitec.model.Categoria;
import com.servitec.model.Producto;
import com.servitec.model.Subcategoria;
import com.servitec.repository.CaracteristicaRepository;
import com.servitec.repository.CategoriaRepository;
import com.servitec.repository.ProductoRepository;
import com.servitec.repository.SubcategoriaRepository;

@Service
public class ProductoService {

    private final ProductoRepository productos;
    private final CategoriaRepository categorias;
    private final SubcategoriaRepository subcategorias;
    private final CaracteristicaRepository caracteristicas;

    public ProductoService(ProductoRepository productos, CategoriaRepository categorias,
                           SubcategoriaRepository subcategorias, CaracteristicaRepository caracteristicas) {
        this.productos = productos;
        this.categorias = categorias;
        this.subcategorias = subcategorias;
        this.caracteristicas = caracteristicas;
    }

    @Transactional(readOnly = true)
    public CategoriasResponse categorias() {
        Map<Long, List<String>> porCategoria = subcategorias.findAllByOrderByIdAsc().stream()
                .collect(Collectors.groupingBy(s -> s.getCategoria().getId(),
                        Collectors.mapping(Subcategoria::getName, Collectors.toList())));

        List<CategoriasResponse.CategoriaTreeItem> items = categorias.findAllByOrderByIdAsc().stream()
                .map(c -> new CategoriasResponse.CategoriaTreeItem(c.getName(),
                        porCategoria.getOrDefault(c.getId(), List.of())))
                .toList();
        return new CategoriasResponse(items);
    }

    @Transactional(readOnly = true)
    public List<ProductoDto> publicos(String categoria, String subcategoria) {
        return productos.findPublico(normalizar(categoria), normalizar(subcategoria)).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoDto> admin(String categoria, String subcategoria) {
        return productos.findAdmin(normalizar(categoria), normalizar(subcategoria)).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Subcategoria subcategoria = resolverSubcategoria(request);
        Producto producto = new Producto();
        producto.setId(productos.findMaxId() + 1);
        producto.setName(request.name());
        producto.setPrice(request.price());
        producto.setStock(request.stock());
        producto.setImg(request.img());
        producto.setSubcategoria(subcategoria);
        productos.save(producto);

        guardarCaracteristicas(producto, request.description());
        return new ProductoResponse("Producto registrado con éxito", toDto(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = productos.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        Subcategoria subcategoria = resolverSubcategoria(request);
        producto.setName(request.name());
        producto.setPrice(request.price());
        producto.setStock(request.stock());
        producto.setImg(request.img());
        producto.setSubcategoria(subcategoria);
        productos.save(producto);

        caracteristicas.deleteByProductoId(producto.getId());
        guardarCaracteristicas(producto, request.description());
        return new ProductoResponse("Producto actualizado con éxito", toDto(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productos.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        productos.delete(producto);
    }

    private Subcategoria resolverSubcategoria(ProductoRequest request) {
        return subcategorias.findByCategoriaNameAndName(request.categoria().name(), request.categoria().subcategoria())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Subcategoría no encontrada"));
    }

    private void guardarCaracteristicas(Producto producto, List<String> descripciones) {
        if (descripciones == null || descripciones.isEmpty()) {
            return;
        }
        List<Caracteristica> items = new ArrayList<>();
        for (int i = 0; i < descripciones.size(); i++) {
            Caracteristica c = new Caracteristica();
            c.setProducto(producto);
            c.setDescripcion(descripciones.get(i));
            c.setOrden(i);
            items.add(c);
        }
        caracteristicas.saveAll(items);
    }

    private ProductoDto toDto(Producto producto) {
        List<String> descripcion = caracteristicas.findByProductoIdOrderByOrdenAsc(producto.getId()).stream()
                .map(Caracteristica::getDescripcion)
                .toList();
        Subcategoria sub = producto.getSubcategoria();
        Categoria categoria = sub.getCategoria();
        return new ProductoDto(producto.getId(), producto.getName(), producto.getPrice(), producto.getStock(),
                descripcion, producto.getImg(), new ProductoDto.CategoriaProductoDto(categoria.getName(), sub.getName()));
    }

    private String normalizar(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor;
    }
}