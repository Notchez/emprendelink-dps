import { CustomerOrderDetail } from "@/components/customer/CustomerOrderDetail";

export default async function CustomerOrderPage({ params }) {
  const { id } = await params;

  return <CustomerOrderDetail orderId={id} />;
}
