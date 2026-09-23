import { OrderDetailView } from "@/components/orders/OrderDetailView";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
