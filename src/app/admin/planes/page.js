import PlansManager from "@/components/dashboard/PlansManager";

export default function Page() {
  return (
    <div className="container">
      <p className="eyebrow">Panel del administrador</p>
      <h1>Planes de suscripción</h1>
      <p>Administra los planes disponibles para los emprendimientos.</p>
      <PlansManager />
    </div>
  );
}
