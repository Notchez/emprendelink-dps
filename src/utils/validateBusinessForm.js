export function validateBusinessForm(values) {
  const errors = {};
  const logoUrl = values.logoUrl.trim();

  if (!values.name.trim()) {
    errors.name = "Escribe el nombre de tu emprendimiento.";
  }

  if (!values.slug) {
    errors.slug = "Escribe una dirección para tu catálogo.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = "La dirección debe contener letras sin tildes, números o guiones.";
  }

  if (!values.planId) {
    errors.planId = "Selecciona un plan para tu emprendimiento.";
  }

  if (logoUrl) {
    try {
      const parsedUrl = new URL(logoUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.logoUrl = "El logotipo debe utilizar una URL válida.";
      }
    } catch {
      errors.logoUrl = "Ingresa una URL válida para el logotipo.";
    }
  }

  return errors;
}
