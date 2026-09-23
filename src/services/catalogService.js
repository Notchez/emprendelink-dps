import { businessService } from "@/services/businessService";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
export const catalogService = {
  async getCatalogBySlug(slug) {
    try {
      const business = await businessService.getBySlug(slug);
      if (!business || !business.active)
        throw new Error("El catálogo no existe o no está disponible.");
      const [categories, products] = await Promise.all([
        categoryService.getByBusinessId(business.id),
        productService.getByBusinessId(business.id),
      ]);
      return {
        success: true,
        data: {
          business,
          categories: [
            { id: "cat_all", name: "Todos" },
            ...categories.filter((category) => category.active),
          ],
          products: products.filter((product) => product.active),
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: { message: error.message || "No se pudo cargar el catálogo." },
      };
    }
  },
};
