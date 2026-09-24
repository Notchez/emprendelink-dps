import { OrderDetailView } from "@/components/orders/OrderDetailView";
export default async function Page({ params }) {
  const { id } = await params;
  return <OrderDetailView orderId={id} readOnly />;
}
