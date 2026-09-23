import EntrepreneurDashboard from "@/components/dashboard/EntrepreneurDashboard";
import { dashboardService } from "@/services/dashboardService";

export default async function Page() {
  const dashboard = await dashboardService.getEntrepreneurDashboard();
  return (
    <main className="container">
      <p className="eyebrow">Panel del emprendedor</p>
      <h1>Mi emprendimiento</h1>

      <EntrepreneurDashboard
  businessName={dashboard.businessName}
  kpis={dashboard.kpis}
  salesByPeriod={dashboard.salesByPeriod}
/>
    </main>
  );
}
