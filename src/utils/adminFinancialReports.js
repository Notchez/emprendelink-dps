import { ORDER_STATUS } from "@/lib/constants/orderStatus";

const BUSINESS_TIME_ZONE = "America/El_Salvador";

function validDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getLocalDateKey(value) {
  const date = validDate(value);
  if (!date) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getUtcMonthKey(value) {
  const date = validDate(value);
  if (!date) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(key) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) return "Mes desconocido";
  return new Intl.DateTimeFormat("es-SV", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}-01T00:00:00.000Z`));
}

export function getCommissionMonthOptions(commissions, now = new Date()) {
  const months = new Set();
  const today = validDate(now) || new Date();

  for (let offset = 0; offset < 12; offset += 1) {
    months.add(getUtcMonthKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1))));
  }

  for (const commission of commissions) {
    const month = getUtcMonthKey(commission.createdAt);
    if (month) months.add(month);
  }

  return [...months].sort().reverse().map((value) => ({ value, label: formatMonthLabel(value) }));
}

export function buildDeliveredDates(commissions) {
  return Object.fromEntries(
    commissions
      .filter((commission) => commission.orderId && validDate(commission.createdAt))
      .map((commission) => [commission.orderId, commission.createdAt])
  );
}

function matchesDateRange(value, from, to) {
  if (!from && !to) return true;
  const day = getLocalDateKey(value);
  return Boolean(day) && (!from || day >= from) && (!to || day <= to);
}

export function filterAdminOrders(orders, filters, deliveredDates = {}) {
  return orders.filter((order) => {
    if (filters.businessId && order.businessId !== filters.businessId) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (!matchesDateRange(order.createdAt, filters.createdFrom, filters.createdTo)) return false;

    if (filters.deliveredFrom || filters.deliveredTo) {
      if (order.status !== ORDER_STATUS.DELIVERED) return false;
      if (!matchesDateRange(
        order.deliveredAt || deliveredDates[order.id],
        filters.deliveredFrom,
        filters.deliveredTo
      )) return false;
    }

    return true;
  });
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function makeGroups(businesses) {
  return new Map(businesses.map((business) => [business.id, {
    id: business.id,
    name: business.name || "Emprendimiento sin nombre",
    active: business.active === true,
    amount: 0,
    count: 0,
    records: [],
  }]));
}

function ensureGroup(groups, businessId) {
  const id = businessId || "sin-negocio";
  if (!groups.has(id)) {
    groups.set(id, {
      id,
      name: "Negocio no disponible",
      active: false,
      amount: 0,
      count: 0,
      records: [],
    });
  }
  return groups.get(id);
}

function sortGroups(groups) {
  return [...groups.values()]
    .map((group) => ({ ...group, amount: roundMoney(group.amount) }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, "es"));
}

export function getSalesMonthOptions(orders, deliveredDates = {}, now = new Date()) {
  const completedOrders = orders
    .filter((order) => order.status === ORDER_STATUS.DELIVERED)
    .map((order) => ({ createdAt: order.deliveredAt || deliveredDates[order.id] }));

  return getCommissionMonthOptions(completedOrders, now);
}

export function buildDeliveredSales(orders, businesses, { month = "", deliveredDates = {} } = {}) {
  const groups = makeGroups(businesses);
  let total = 0;
  let count = 0;

  for (const order of orders) {
    if (order.status !== ORDER_STATUS.DELIVERED) continue;
    if (month && getUtcMonthKey(order.deliveredAt || deliveredDates[order.id]) !== month) continue;
    const amount = Number(order.subtotal);
    if (!Number.isFinite(amount) || amount < 0) continue;
    const group = ensureGroup(groups, order.businessId);
    group.amount += amount;
    group.count += 1;
    group.records.push(order);
    total += amount;
    count += 1;
  }

  return {
    total: roundMoney(total),
    count,
    businesses: sortGroups(groups),
  };
}

export function buildMonthlyCommissions(commissions, businesses, selectedMonth) {
  const lifetimeTotal = commissions.reduce((sum, commission) => {
    const amount = Number(commission.amount);
    return Number.isFinite(amount) && amount >= 0 ? sum + amount : sum;
  }, 0);
  const selected = commissions.filter((commission) => getUtcMonthKey(commission.createdAt) === selectedMonth);
  const groups = makeGroups(businesses);
  let monthlyTotal = 0;
  let count = 0;

  for (const commission of selected) {
    const amount = Number(commission.amount);
    if (!Number.isFinite(amount) || amount < 0) continue;
    const group = ensureGroup(groups, commission.businessId);
    group.amount += amount;
    group.count += 1;
    group.records.push(commission);
    monthlyTotal += amount;
    count += 1;
  }

  return {
    lifetimeTotal: roundMoney(lifetimeTotal),
    monthlyTotal: roundMoney(monthlyTotal),
    count,
    businesses: sortGroups(groups),
  };
}
