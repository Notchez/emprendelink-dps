"use client";

export default function Error({ reset }) {
  return (
    <div className="container">
      <p className="eyebrow">Panel del administrador</p>
      <h1>Planes</h1>

      <p role="alert">No pudimos cargar los planes. Inténtalo nuevamente.</p>

      <button type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </div>
  );
}
