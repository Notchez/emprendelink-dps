function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function filterBusinessesBySearch(businesses, search) {
  const term = normalizeSearchText(search);
  if (!term) return businesses;

  return businesses.filter((business) =>
    [business.name, business.ownerName, business.ownerEmail, business.slug]
      .some((value) => normalizeSearchText(value).includes(term))
  );
}
