function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function matchesOrderSearch(order, search) {
  const term = normalizeText(search);
  if (!term) return true;

  return [
    order.id,
    order.customerId,
    order.customer?.name,
    order.customer?.email,
    order.customer?.phone,
  ].some((value) => normalizeText(value).includes(term));
}
