import { entrepreneurDashboardMock } from "@/data/mock/dashboardMock";
// Responsable: completar únicamente dentro del dominio asignado.
// Mantener acceso a datos/API fuera de los componentes visuales.

export const dashboardService = {
  async getEntrepreneurDashboard() {
  return entrepreneurDashboardMock;
},
};
