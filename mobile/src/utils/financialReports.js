import { ORDER_STATUS } from "../constants/orderStatus.js";

const EL_SALVADOR = "America/El_Salvador";

function dateOf(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getUtcMonthKey(value) {
  const date = dateOf(value);
  return date ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}` : "";
}

export function getSalvadorMonthKey(value) {
  const date = dateOf(value);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EL_SALVADOR, year: "numeric", month: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}`;
}

export function formatMonthLabel(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return "Mes desconocido";
  return new Intl.DateTimeFormat("es-SV", {
    month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00.000Z`));
}

export function buildDeliveredDates(commissions = []) {
  return Object.fromEntries(commissions
    .filter((item) => item.orderId && dateOf(item.createdAt))
    .map((item) => [item.orderId, item.createdAt]));
}

export function getMonthOptions(records = [], { now = new Date(), timeZone = "UTC" } = {}) {
  const getKey = timeZone === EL_SALVADOR ? getSalvadorMonthKey : getUtcMonthKey;
  const current = dateOf(now) || new Date();
  const months = new Set();
  const [currentYear, currentMonth] = getKey(current).split("-").map(Number);
  // El selector web muestra un año y conserva los meses históricos con movimientos.
  for (let offset = 0; offset < 12; offset += 1) {
    const month = new Date(Date.UTC(currentYear, currentMonth - offset - 1, 1));
    months.add(getUtcMonthKey(month));
  }
  for (const record of records) {
    const key = getKey(record);
    if (key) months.add(key);
  }
  return [...months].sort().reverse().map((value) => ({ value, label: formatMonthLabel(value) }));
}

export function getSalesMonthOptions(orders = [], deliveredDates = {}, options = {}) {
  return getMonthOptions(orders
    .filter((order) => order.status === ORDER_STATUS.DELIVERED)
    .map((order) => order.deliveredAt || deliveredDates[order.id]), options);
}

function validAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function groupsFor(businesses) {
  return new Map(businesses.map((business) => [business.id, {
    id: business.id,
    name: business.name || "Emprendimiento sin nombre",
    active: business.active === true,
    amount: 0,
    count: 0,
    records: [],
  }]));
}

function groupFor(groups, businessId) {
  const id = businessId || "sin-negocio";
  if (!groups.has(id)) {
    groups.set(id, { id, name: "Negocio no disponible", active: false, amount: 0, count: 0, records: [] });
  }
  return groups.get(id);
}

function sortedGroups(groups) {
  return [...groups.values()].map((item) => ({ ...item, amount: roundMoney(item.amount) }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "es"));
}

export function buildDeliveredSales(orders = [], businesses = [], { month = "", deliveredDates = {}, timeZone = "UTC" } = {}) {
  const getKey = timeZone === EL_SALVADOR ? getSalvadorMonthKey : getUtcMonthKey;
  const groups = groupsFor(businesses);
  let total = 0;
  let count = 0;
  for (const order of orders) {
    if (order.status !== ORDER_STATUS.DELIVERED) continue;
    const deliveredAt = order.deliveredAt || deliveredDates[order.id];
    if (month && getKey(deliveredAt) !== month) continue;
    const amount = validAmount(order.subtotal);
    if (amount === null) continue;
    const group = groupFor(groups, order.businessId);
    group.amount += amount;
    group.count += 1;
    group.records.push({ ...order, deliveredAt });
    total += amount;
    count += 1;
  }
  return { total: roundMoney(total), count, businesses: sortedGroups(groups) };
}

export function buildMonthlyCommissions(commissions = [], businesses = [], month = "") {
  const lifetimeTotal = commissions.reduce((total, item) => total + (validAmount(item.amount) ?? 0), 0);
  const groups = groupsFor(businesses);
  let monthlyTotal = 0;
  let count = 0;
  for (const item of commissions) {
    if (getUtcMonthKey(item.createdAt) !== month) continue;
    const amount = validAmount(item.amount);
    if (amount === null) continue;
    const group = groupFor(groups, item.businessId);
    group.amount += amount;
    group.count += 1;
    group.records.push(item);
    monthlyTotal += amount;
    count += 1;
  }
  return { lifetimeTotal: roundMoney(lifetimeTotal), monthlyTotal: roundMoney(monthlyTotal), count, businesses: sortedGroups(groups) };
}
