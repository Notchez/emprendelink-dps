import { commissionsMock } from "@/data/mock/commissionsMock";

export const statementService = {
  async getCommissions(businessId) {
    return commissionsMock.filter(
      (commission) => commission.businessId === businessId
    );
  },
};