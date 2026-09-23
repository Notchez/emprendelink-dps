export function validateCustomerPayload(data) {
  if (!data?.businessId?.trim()) {
    return "El negocio es obligatorio.";
  }

  if (!data?.name?.trim() || !data?.phone?.trim()) {
    return "El nombre y el teléfono del cliente son obligatorios.";
  }

  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email.trim())) {
    return "El correo electrónico no es válido.";
  }

  return null;
}
