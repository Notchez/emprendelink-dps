"use client";

export default function Error({ reset }) {
  return (
    <main className="container">
      <p className="eyebrow">Panel del emprendedor</p>
      <h1>Reportes</h1>

      <p role="alert">
        No pudimos cargar los reportes. Inténtalo nuevamente.
      </p>

      <button type="button" onClick={() => reset()}>
        Reintentar
      </button>
    </main>
  );
}