export function ContactFields({ values, onChange, required = true }) {
  return (
    <>
      <label htmlFor="phone">Teléfono{!required && " (opcional)"}</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        maxLength={25}
        value={values.phone}
        onChange={onChange}
        required={required}
      />
      <label htmlFor="address">Dirección{!required && " (opcional)"}</label>
      <textarea
        id="address"
        name="address"
        autoComplete="street-address"
        rows={3}
        minLength={required ? 5 : undefined}
        maxLength={500}
        value={values.address}
        onChange={onChange}
        required={required}
      />
      <label htmlFor="deliveryInstructions">Indicaciones de entrega (opcional)</label>
      <textarea
        id="deliveryInstructions"
        name="deliveryInstructions"
        rows={2}
        maxLength={500}
        value={values.deliveryInstructions}
        onChange={onChange}
        placeholder="Ej.: portón azul; llamar al llegar."
      />
    </>
  );
}
