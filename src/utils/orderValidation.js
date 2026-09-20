export function validateOrderPayload(data) {
  if (!data || !data.businessId || !data.customerId) {
    return "El negocio y el cliente son obligatorios.";
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return "El pedido debe incluir al menos un producto.";
  }

  const invalidItem = data.items.some((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    return (
      !item.productId ||
      !item.productName ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    );
  });

  if (invalidItem) {
    return "Hay productos con datos inválidos en el pedido.";
  }

  return null;
}
