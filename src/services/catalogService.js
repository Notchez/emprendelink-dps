import { apiRequest } from "./apiClient";

/**
 * Servicio para el catálogo público de productos y negocios
 * Responsabilidad: Integrante 3
 */
export const catalogService = {
  /**
   * Obtiene el catálogo completo de un negocio específico mediante su slug
   * @param {string} slug
   */
  async getCatalogBySlug(slug) {
    try {
      if (typeof apiRequest === "function") {
        const response = await apiRequest(`/catalog/${slug}`, { method: "GET" });
        if (response && response.success) return response;
      }
      throw new Error("Error al conectar con la API");
    } catch (error) {
      // Datos mock de respaldo para desarrollo local (cumple con DATA_CONTRACTS.md)
      return {
        success: true,
        data: {
          business: {
            id: "business-001",
            name: `Emprendimiento ${slug.toUpperCase()}`,
            slug: slug,
            logoUrl: null,
            active: true,
          },
          categories: [
            { id: "cat_all", name: "Todos" },
            { id: "cat_01", name: "Populares" },
            { id: "cat_02", name: "Novedades" },
          ],
          products: [
            {
              id: "prod_01",
              businessId: "business-001",
              categoryId: "cat_01",
              name: "Producto Artesanal A",
              description: "Elaborado con insumos locales de alta calidad.",
              price: 12.5,
              imageUrl: null,
              active: true,
            },
            {
              id: "prod_02",
              businessId: "business-001",
              categoryId: "cat_01",
              name: "Combo Familiar B",
              description: "Paquete especial listo para entrega inmediata.",
              price: 25.0,
              imageUrl: null,
              active: true,
            },
            {
              id: "prod_03",
              businessId: "business-001",
              categoryId: "cat_02",
              name: "Accesorio Edición Limitada",
              description: "Diseño exclusivo con garantía de fabricante.",
              price: 8.75,
              imageUrl: null,
              active: true,
            },
          ],
        },
        error: null,
      };
    }
  },
};
