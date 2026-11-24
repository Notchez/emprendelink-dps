import { orderService } from "@/services/orderService";
import { statementService } from "@/services/statementService";
import { buildEntrepreneurSales } from "@/utils/entrepreneurReports";

export const reportService = {
  async getSalesReport(businessId) {
    if (!businessId) {
      throw new Error("No se encontró el negocio para generar el reporte.");
    }

    const [orders, commissions] = await Promise.all([
      orderService.getOrders({ businessId }),
      statementService.getCommissions(businessId),
    ]);

    return buildEntrepreneurSales(orders, commissions);
  },
};
