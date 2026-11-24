import { apiRequest } from "@/services/apiClient";

export const statementService = {
  async getCommissions(businessId) {
    if (!businessId) {
      throw new Error("No se encontró el negocio para consultar las comisiones.");
    }

    const params = new URLSearchParams({ businessId });

    return apiRequest(`/api/commissions?${params.toString()}`);
  },
};
