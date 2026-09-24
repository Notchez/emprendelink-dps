"use client";

export default function Error({ reset }) {
  return (
    <div className="container">
      <p className="eyebrow">Panel del emprendedor</p>
      <h1>Estado de cuenta</h1>

      <p role="alert">No pudimos cargar el estado de cuenta. Inténtalo nuevamente.</p>

      <button type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </div>
  );
}
