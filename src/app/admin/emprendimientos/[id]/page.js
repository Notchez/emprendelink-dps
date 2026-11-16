import AdminBusinessDetail from "@/components/dashboard/AdminBusinessDetail";

export default async function Page({ params }) {
  const { id } = await params;
  return <div className="container"><AdminBusinessDetail businessId={id} /></div>;
}
