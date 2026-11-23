import { ORDER_STATUS_LABELS } from "../constants/orderStatus.js";

export function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-SV", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatOrderStatus(status) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatOrderId(id) {
  return `PED-${String(id || "").slice(0, 8).toUpperCase()}`;
}
