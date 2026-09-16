import { reportsMock } from "@/data/mock/reportsMock";

export const reportService = {
  async getOrdersReport() {
    return reportsMock;
  },
};
