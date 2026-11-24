import { ORDER_STATUS } from "@/lib/constants/orderStatus";

function getMonthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getLastSixMonths(now) {
  const months = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    months.push({
      key: getMonthKey(date),
      label: new Intl.DateTimeFormat("es-SV", { month: "short", timeZone: "UTC" }).format(date),
      amount: 0,
    });
  }
  return months;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function buildAdminCommissionInsights({ businesses = [], orders = [], commissions = [], now = new Date() }) {
  const today = new Date(now);
  const monthKey = getMonthKey(today);
  const monthLabel = new Intl.DateTimeFormat("es-SV", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(today);

  const byId = new Map(businesses.map((business) => [business.id, {
    ...business,
    totalOrders: 0,
    deliveredOrders: 0,
    deliveredSales: 0,
    historicalCommissions: 0,
    monthlyCommissions: 0,
    monthlyCommissionCount: 0,
    trend: getLastSixMonths(today),
  }]));

  for (const order of orders) {
    const business = byId.get(order.businessId);
    if (!business) continue;
    business.totalOrders += 1;
    if (order.status !== ORDER_STATUS.DELIVERED) continue;
    business.deliveredOrders += 1;
    const subtotal = Number(order.subtotal);
    if (Number.isFinite(subtotal) && subtotal >= 0) business.deliveredSales += subtotal;
  }

  let totalMonthCommissions = 0;
  let totalMonthOperations = 0;

  for (const commission of commissions) {
    const amount = Number(commission.amount);
    if (!Number.isFinite(amount) || amount < 0) continue;
    const month = getMonthKey(commission.createdAt);
    const business = byId.get(commission.businessId);
    if (business) {
      business.historicalCommissions += amount;
      const trendMonth = business.trend.find((entry) => entry.key === month);
      if (trendMonth) trendMonth.amount += amount;
      if (month === monthKey) {
        business.monthlyCommissions += amount;
        business.monthlyCommissionCount += 1;
      }
    }
    if (month === monthKey) {
      // Mantener comisiones históricas aunque se haya eliminado el negocio.
      totalMonthCommissions += amount;
      totalMonthOperations += 1;
    }
  }

  return {
    monthLabel,
    totalMonthCommissions: roundMoney(totalMonthCommissions),
    totalMonthOperations,
    businesses: [...byId.values()]
      .map((business) => ({
        ...business,
        deliveredSales: roundMoney(business.deliveredSales),
        historicalCommissions: roundMoney(business.historicalCommissions),
        monthlyCommissions: roundMoney(business.monthlyCommissions),
        trend: business.trend.map((entry) => ({ ...entry, amount: roundMoney(entry.amount) })),
      }))
      .sort((a, b) => b.monthlyCommissions - a.monthlyCommissions || a.name.localeCompare(b.name, "es")),
  };
}
