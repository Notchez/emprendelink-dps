import { mockBusinesses, mockCategories, mockProducts } from "../data/mockData";
import { failure, success, wait } from "./serviceResponse";

export const catalogService = {
  async getBusinesses() {
    await wait();
    return success(mockBusinesses.filter((business) => business.active).map((item) => ({ ...item })));
  },

  async getCatalogByBusinessId(businessId) {
    await wait();
    const business = mockBusinesses.find((item) => item.id === businessId && item.active);
    if (!business) return failure("BUSINESS_NOT_FOUND", "El negocio no está disponible.");
    return success({
      business: { ...business },
      categories: mockCategories
        .filter((category) => category.id === "cat_all" || (category.businessId === businessId && category.active))
        .map((item) => ({ ...item })),
      products: mockProducts
        .filter((product) => product.businessId === businessId && product.active)
        .map((item) => ({ ...item })),
    });
  },
};
