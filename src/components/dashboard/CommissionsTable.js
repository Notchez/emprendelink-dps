import styles from "./CommissionsTable.module.css";

const dateFormatter = new Intl.DateTimeFormat("es-SV", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/El_Salvador",
});

function formatId(id, prefix) {
  return `${prefix}-${String(id).slice(0, 8).toUpperCase()}`;
}

export default function CommissionsTable({ commissions }) {
  if (commissions.length === 0) {
    return <p>No hay comisiones registradas.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Comisión</th>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Tasa</th>
            <th>Monto</th>
          </tr>
        </thead>

        <tbody>
          {commissions.map((commission) => (
            <tr key={commission.id}>
              <td title={commission.id}>{formatId(commission.id, "COM")}</td>

              <td title={commission.orderId}>{formatId(commission.orderId, "PED")}</td>

              <td>{dateFormatter.format(new Date(commission.createdAt))}</td>

              <td>{(commission.rate * 100).toFixed(0)}%</td>

              <td>${Number(commission.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
