import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { buildDeliveredDates, filterAdminOrders, getLocalDateKey } from "@/utils/adminFinancialReports";

const ACTIVE_STATUSES = new Set([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
]);

export function getActiveOrders(orders) {
  return orders
    .filter((order) => ACTIVE_STATUSES.has(order.status))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function filterEntrepreneurOrders(orders, filters, deliveredDates = {}) {
  const filtered = filterAdminOrders(orders, {
    status: filters.status || "",
    createdFrom: filters.createdFrom || "",
    createdTo: filters.createdTo || "",
    deliveredFrom: filters.deliveredFrom || "",
    deliveredTo: filters.deliveredTo || "",
  }, deliveredDates);

  const customerName = normalizeText(filters.customerName);
  return customerName
    ? filtered.filter((order) => normalizeText(order.customer?.name).includes(customerName))
    : filtered;
}

export function buildEntrepreneurSales(orders, commissions) {
  const deliveredDates = buildDeliveredDates(commissions);

  return orders
    .filter((order) => order.status === ORDER_STATUS.DELIVERED)
    .map((order) => {
      const deliveredAt = order.deliveredAt || deliveredDates[order.id] || "";
      return {
        id: order.id,
        date: getLocalDateKey(deliveredAt),
        deliveredAt,
        customerName: order.customer?.name || "Cliente no disponible",
        productCount: (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        total: Number(order.subtotal) || 0,
      };
    })
    .sort((a, b) => new Date(b.deliveredAt) - new Date(a.deliveredAt));
}

export function filterEntrepreneurSales(sales, from, to) {
  return sales.filter((sale) => sale.date && (!from || sale.date >= from) && (!to || sale.date <= to));
}

export function totalEntrepreneurSales(sales) {
  return Math.round(sales.reduce((sum, sale) => sum + sale.total, 0) * 100) / 100;
}
