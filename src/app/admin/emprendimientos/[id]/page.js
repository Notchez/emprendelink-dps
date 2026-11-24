import AdminBusinessDetail from "@/components/dashboard/AdminBusinessDetail";

export default async function Page({ params, searchParams }) {
  const { id } = await params;
  const { month } = await searchParams;
  const initialMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(month || "") ? month : "";
  return <div className="container"><AdminBusinessDetail businessId={id} initialMonth={initialMonth} /></div>;
}
