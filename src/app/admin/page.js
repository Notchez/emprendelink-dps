import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { dashboardService } from "@/services/dashboardService";

export default async function Page() {
  const dashboard = await dashboardService.getAdminDashboard();

  return (
    <main className="container">
      <p className="eyebrow">Panel del administrador</p>
      <h1>Panel administrativo</h1>

      <AdminDashboard kpis={dashboard.kpis} />
    </main>
  );
}
