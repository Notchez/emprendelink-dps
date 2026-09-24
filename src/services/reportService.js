import { orderService } from "@/services/orderService";

export const reportService = {
  async getOrdersReport(businessId) {
    if (!businessId) {
      throw new Error("No se encontró el negocio para generar el reporte.");
    }

    const orders = await orderService.getOrders({ businessId });

    return orders.map((order) => ({
      id: order.id,
      date: order.createdAt.slice(0, 10),
      total: order.subtotal,
      status: order.status,
    }));
  },
};
