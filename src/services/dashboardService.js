import { entrepreneurDashboardMock } from "@/data/mock/dashboardMock";
import { adminDashboardMock } from "@/data/mock/adminDashboardMock";

export const dashboardService = {
  async getEntrepreneurDashboard() {
    return entrepreneurDashboardMock;
  },

  async getAdminDashboard() {
    return adminDashboardMock;
  },
};
