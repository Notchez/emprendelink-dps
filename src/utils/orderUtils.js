import { ORDER_STATUS } from "@/lib/constants/orderStatus";

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pendiente",
  [ORDER_STATUS.CONFIRMED]: "Confirmado",
  [ORDER_STATUS.PREPARING]: "En preparación",
  [ORDER_STATUS.READY]: "Listo",
  [ORDER_STATUS.DELIVERED]: "Entregado",
  [ORDER_STATUS.CANCELLED]: "Cancelado",
};

export function getOrderStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

export function formatOrderDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatOrderMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}
