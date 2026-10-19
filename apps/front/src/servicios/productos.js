import api from "./api";

function parsearCategoria(categoriaCompleta) {
  if (!categoriaCompleta) return { categoria: null, subcategoria: null };
  const partes = categoriaCompleta.split("_");
  return {
    categoria: partes[0] || null,
    subcategoria: partes[1] || null,
  };
}

export async function getProducts(categoriaCompleta) {
  const { categoria, subcategoria } = parsearCategoria(categoriaCompleta);
  const params = {};
  if (categoria) params.categoria = categoria;
  if (subcategoria) params.subcategoria = subcategoria;
  const response = await api.get("/api/productos", { params });
  return response.data;
}

export const getByCategory = (category, productos) => {
  if (!category || !productos) return [];
  const target = category.trim().toLowerCase();
  return productos.filter((p) => {
    const cat = (p.categoria?.name + "_" + p.categoria?.Subcategoria || "").trim().toLowerCase();
    return cat === target;
  });
};

export const getTitleCategory = (category) => {
  switch (category) {
    case "laptops_gaming":
      return "LAPTOPS GAMER";
    case "laptops_otras":
      return "OTRAS LAPTOPS";
    case "pc_combos":
      return "PC COMBOS";
    case "pc_profesional":
      return "PC PROFESIONALES";
    case "pc_oficinas":
      return "PC PARA OFICINAS";
    case "componentes_monitores":
      return "MONITORES";
    case "componentes_cases":
      return "CASES";
    case "componentes_mb":
      return "PLACAS BASE (MOTHERBOARDS)";
    case "componentes_ram":
      return "MEMORIAS RAM";
    case "componentes_cpus":
      return "PROCESADORES (CPU)";
    case "componentes_memorias":
      return "ALMACENAMIENTO (SSD / HDD)";
    case "componentes_otros":
      return "OTROS COMPONENTES";
    default:
      return "CATEGORÍA NO ENCONTRADA";
  }
};
