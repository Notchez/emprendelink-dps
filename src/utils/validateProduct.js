export function validateProduct(values) {
  const errors = {};

  const name = values.name.trim();
  const description = values.description.trim();
  const price = Number(values.price);
  const imageUrl = values.imageUrl.trim();

  if (!name) {
    errors.name = "El nombre es obligatorio.";
  } else if (name.length < 3) {
    errors.name = "El nombre debe tener al menos 3 caracteres.";
  } else if (name.length > 80) {
    errors.name = "El nombre no puede superar los 80 caracteres.";
  }

  if (!values.categoryId) {
    errors.categoryId = "Selecciona una categoría.";
  }

  if (!description) {
    errors.description = "La descripción es obligatoria.";
  } else if (description.length < 10) {
    errors.description = "La descripción debe tener al menos 10 caracteres.";
  } else if (description.length > 500) {
    errors.description = "La descripción no puede superar los 500 caracteres.";
  }

  if (values.price === "") {
    errors.price = "El precio es obligatorio.";
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = "Ingresa un precio válido.";
  }

  if (imageUrl) {
    try {
      const parsedUrl = new URL(imageUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.imageUrl = "La imagen debe utilizar una URL válida.";
      }
    } catch {
      errors.imageUrl = "Ingresa una URL válida.";
    }
  }

  return errors;
}
