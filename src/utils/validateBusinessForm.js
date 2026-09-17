export function validateBusinessForm(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Escribe el nombre de tu emprendimiento.";
  }

  if (!values.slug) {
    errors.slug = "Escribe una dirección para tu catálogo.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = "La dirección debe contener letras sin tildes, números o guiones.";
  }

  return errors;
}
