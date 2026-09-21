import styles from "./OrdersReport.module.css";

export default function OrdersReport({ orders }) {  
    if (orders.length === 0) {
    return (
      <section className={styles.report}>
        <h2>Detalle de pedidos</h2>
        <p>No hay pedidos para mostrar.</p>
      </section>
    );
  }
  return (
    <section className={styles.report}>
      <h2>Detalle de pedidos</h2>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>${order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}