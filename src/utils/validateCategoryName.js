export function validateCategoryName(name) {
  if (typeof name !== "string" || !name.trim()) {
    return "Escribe el nombre de la categoría.";
  }

  return "";
}
