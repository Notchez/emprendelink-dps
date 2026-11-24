import { ROLES } from "@/lib/constants/roles";

export function normalizeProfile(data, email) {
  const text = (value) => (typeof value === "string" ? value.trim() : "");
  return {
    name: text(data.name),
    email: text(email).toLowerCase(),
    phone: text(data.phone),
    address: text(data.address),
    deliveryInstructions: text(data.deliveryInstructions),
  };
}

export function validateProfile(profile, role) {
  if (profile.name.length < 2 || profile.name.length > 100)
    return "El nombre debe tener entre 2 y 100 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return "Ingresa un correo válido.";
  if (role === ROLES.CUSTOMER || profile.phone) {
    if (
      !/^[+()\d\s-]+$/.test(profile.phone) ||
      !/^\d{7,15}$/.test(profile.phone.replace(/\D/g, ""))
    )
      return "Ingresa un teléfono válido, de 7 a 15 dígitos.";
  }
  if ((role === ROLES.CUSTOMER && profile.address.length < 5) || profile.address.length > 500)
    return "Ingresa una dirección de entre 5 y 500 caracteres.";
  if (profile.deliveryInstructions.length > 500)
    return "Las indicaciones no pueden superar 500 caracteres.";
  return null;
}
