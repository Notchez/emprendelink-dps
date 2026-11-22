import Link from "next/link";
import { formatOrderMoney, formatOrderDate } from "@/utils/orderUtils";
import styles from "./EntrepreneurFinancial.module.css";

export default function OrdersReport({ orders }) {
  return (
    <section className={styles.panel} aria-labelledby="entrepreneur-sales-detail-title">
      <div className={styles.panelHeading}>
        <div>
          <h2 id="entrepreneur-sales-detail-title">Pedidos entregados</h2>
          <p>{orders.length} pedidos en el período seleccionado.</p>
        </div>
      </div>
      {orders.length === 0 ? (
        <p>No hay ventas entregadas en este período.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha de entrega</th><th>Productos</th><th>Venta</th><th>Detalle</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td title={order.id}>PED-{String(order.id).slice(0, 8).toUpperCase()}</td>
                  <td>{order.customerName}</td>
                  <td>{formatOrderDate(order.deliveredAt)}</td>
                  <td>{order.productCount}</td>
                  <td>{formatOrderMoney(order.total)}</td>
                  <td><Link href={`/orders/${encodeURIComponent(order.id)}`}>Ver pedido</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
