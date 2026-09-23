import { customersMock } from "@/data/mock/customersMock";

export const customerDataService = {
  createCustomer(data) {
    const customer = {
      id: `customer-${Date.now()}`,
      businessId: data.businessId.trim(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
    };

    customersMock.push(customer);
    return customer;
  },
};
