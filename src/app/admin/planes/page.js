import PlansList from "@/components/dashboard/PlansList";
import { planService } from "@/services/planService";

export default async function Page() {
  const plans = await planService.getPlans();

  return (
    <main className="container">
      <p className="eyebrow">Panel del administrador</p>
      <h1>Planes</h1>
      <p>Administra los planes disponibles para los emprendimientos.</p>

      <PlansList plans={plans} />
    </main>
  );
}