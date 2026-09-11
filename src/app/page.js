import { ModuleCard } from "@/components/ui/ModuleCard";

const modules = [
  {
    title: "Autenticación y usuarios",
    owner: "Integrante 1",
    description: "Sesión, roles, rutas protegidas y administración básica de usuarios.",
  },
  {
    title: "Negocio y productos",
    owner: "Integrante 2",
    description: "Emprendimiento, categorías, productos, imágenes y límites por plan.",
  },
  {
    title: "Catálogo y cliente",
    owner: "Integrante 3",
    description: "Catálogo público, producto, carrito, checkout y confirmación.",
  },
  {
    title: "Pedidos",
    owner: "Integrante 4",
    description: "Estados, historial, reglas del pedido y generación de comisión.",
  },
  {
    title: "Dashboard y administración",
    owner: "Integrante 5",
    description: "Reportes, gráficas, planes, comisiones y estados de cuenta.",
  },
];

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">DPS941 · Etapa 2</p>
        <h1>EmprendeLink</h1>
        <p>
          Esqueleto inicial compartido. Cada integrante debe desarrollar su módulo respetando los
          contratos, arquitectura y reglas del repositorio.
        </p>
      </section>

      <section className="grid" aria-label="Módulos del equipo">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </section>

      <section className="status">
        <h2>Estado de la base</h2>
        <p>
          Si esta pantalla carga correctamente, la base de Next.js está lista. La prueba de API se
          encuentra en <code>/api/health</code>.
        </p>
      </section>
    </main>
  );
}
