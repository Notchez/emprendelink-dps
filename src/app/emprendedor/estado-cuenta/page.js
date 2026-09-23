import CommissionsTable from "@/components/dashboard/CommissionsTable";
import { statementService } from "@/services/statementService";

export default async function Page() {
  // Identificador temporal para las pruebas.
  const businessId = "business-001";

  const commissions = await statementService.getCommissions(businessId);

  return (
    <div className="container">
      <p className="eyebrow">Panel del emprendedor</p>
      <h1>Estado de cuenta</h1>
      <p>Consulta las comisiones registradas de tu emprendimiento.</p>

      <section>
        <h2>Comisiones registradas</h2>
        <p>Registros encontrados: {commissions.length}</p>

        <CommissionsTable commissions={commissions} />
      </section>
    </div>
  );
}
