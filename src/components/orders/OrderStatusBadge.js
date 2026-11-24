import styles from "./Orders.module.css";
import { getOrderStatusLabel } from "@/utils/orderUtils";

export function OrderStatusBadge({ status }) {
  return (
    <span className={`${styles.statusBadge} ${styles[status.toLowerCase()] || ""}`}>
      {getOrderStatusLabel(status)}
    </span>
  );
}
