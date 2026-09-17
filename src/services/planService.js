import { plansMock } from "@/data/mock/plansMock";

export const planService = {
  async getPlans() {
    return plansMock;
  },
};