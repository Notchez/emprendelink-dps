import { reportService } from "@/services/reportService";

export default async function Page() {
  const orders = await reportService.getOrdersReport();

  return (
    <main className="container">
      <p className="eyebrow">Panel del emprendedor</p>
      <h1>Reportes</h1>
      <p>Consulta los pedidos y las ventas de tu emprendimiento.</p>

      <p>Pedidos encontrados: {orders.length}</p>
    </main>
  );
}