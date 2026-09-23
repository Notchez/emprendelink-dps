import { apiRequest } from "@/services/apiClient";

export const customerService = {
  async createCustomer(customerData) {
    return apiRequest("/api/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  },
};
