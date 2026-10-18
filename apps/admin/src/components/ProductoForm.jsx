import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./ProductoForm.css";

const ProductoForm = ({ categorias = [], initialData = null, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    img: "",
    categoria: { name: "", Subcategoria: "" },
  });
  const [errores, setErrores] = useState({});
  const [subcategorias, setSubcategorias] = useState([]);

  // Cargar subcategorías cuando cambia la categoría
  useEffect(() => {
    const cat = categorias.find((c) => c.name === formData.categoria.name);
    setSubcategorias(cat?.Subcategoria || []);
    if (cat) {
      setFormData((prev) => ({
        ...prev,
        categoria: { ...prev.categoria, Subcategoria: cat.Subcategoria[0] || "" },
      }));
    }
  }, [formData.categoria.name, categorias]);

  // Inicializar con datos existentes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        price: initialData.price || "",
        stock: initialData.stock || "",
        description: (initialData.description || []).join("\n"),
        img: initialData.img || "",
        categoria: {
          name: initialData.categoria?.name || "",
          Subcategoria: initialData.categoria?.Subcategoria || "",
        },
      });
      // Disparar carga de subcategorías
      const cat = categorias.find((c) => c.name === initialData.categoria?.name);
      setSubcategorias(cat?.Subcategoria || []);
    } else {
      setFormData({
        name: "",
        price: "",
        stock: "",
        description: "",
        img: "",
        categoria: { name: "", Subcategoria: "" },
      });
    }
    setErrores({});
  }, [initialData, categorias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("categoria.")) {
      setFormData((prev) => ({
        ...prev,
        categoria: { ...prev.categoria, [name.split(".")[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Limpiar error al escribir
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!formData.name.trim()) nuevosErrores.name = "El nombre es obligatorio";
    if (!formData.price || Number(formData.price) <= 0) nuevosErrores.price = "El precio debe ser mayor a 0";
    if (formData.stock === "" || Number(formData.stock) < 0) nuevosErrores.stock = "El stock debe ser ≥ 0";
    if (!formData.categoria.name) nuevosErrores["categoria.name"] = "Seleccione una categoría";
    if (!formData.categoria.Subcategoria) nuevosErrores["categoria.Subcategoria"] = "Seleccione una subcategoría";
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description.split("\n").map((d) => d.trim()).filter(Boolean),
      img: formData.img.trim() || "https://via.placeholder.com/300",
      categoria: {
        name: formData.categoria.name,
        Subcategoria: formData.categoria.Subcategoria,
      },
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="producto-form" noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Nombre *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Laptop Gamer X"
            required
            disabled={loading}
            aria-invalid={!!errores.name}
          />
          {errores.name && <span className="error-text">{errores.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Precio (S/) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="3499.00"
            step="0.01"
            min="0.01"
            required
            disabled={loading}
            aria-invalid={!!errores.price}
          />
          {errores.price && <span className="error-text">{errores.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock *</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="5"
            min="0"
            required
            disabled={loading}
            aria-invalid={!!errores.stock}
          />
          {errores.stock && <span className="error-text">{errores.stock}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="categoria-name">Categoría *</label>
          <select
            id="categoria-name"
            name="categoria.name"
            value={formData.categoria.name}
            onChange={handleChange}
            required
            disabled={loading}
            aria-invalid={!!errores["categoria.name"]}
          >
            <option value="">Seleccione categoría</option>
            {categorias.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
              </option>
            ))}
          </select>
          {errores["categoria.name"] && <span className="error-text">{errores["categoria.name"]}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="categoria-subcategoria">Subcategoría *</label>
          <select
            id="categoria-subcategoria"
            name="categoria.Subcategoria"
            value={formData.categoria.Subcategoria}
            onChange={handleChange}
            required
            disabled={loading || !subcategorias.length}
            aria-invalid={!!errores["categoria.Subcategoria"]}
          >
            <option value="">Seleccione subcategoría</option>
            {subcategorias.map((sub) => (
              <option key={sub} value={sub}>
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </option>
            ))}
          </select>
          {errores["categoria.Subcategoria"] && <span className="error-text">{errores["categoria.Subcategoria"]}</span>}
          {!subcategorias.length && formData.categoria.name && (
            <span className="helper-text">Seleccione una categoría primero</span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Descripción (características, una por línea)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="RTX 4060&#10;16 GB RAM&#10;SSD 1 TB"
            rows={4}
            disabled={loading}
          />
          <span className="helper-text">Cada línea se convierte en una característica</span>
        </div>

        <div className="form-group full-width">
          <label htmlFor="img">URL de imagen</label>
          <input
            type="url"
            id="img"
            name="img"
            value={formData.img}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => onSubmit(null)} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
};

export default ProductoForm;