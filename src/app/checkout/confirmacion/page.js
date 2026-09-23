"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { orderService } from "@/services/orderService";
import styles from "@/components/auth/Account.module.css";
function Confirmation() {
  const id = useSearchParams().get("id");
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!id) return;
    let active = true;
    orderService
      .getOrder(id)
      .then((order) => {
        if (active) setResult({ id, order });
      })
      .catch((error) => {
        if (active) setResult({ id, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [id]);
  const current = result?.id === id ? result : null;
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {!id ? (
          <p>No hay un pedido para consultar.</p>
        ) : !current ? (
          <p role="status">Consultando pedido...</p>
        ) : current.error ? (
          <p role="alert">{current.error}</p>
        ) : (
          <>
            <h1>¡Pedido recibido!</h1>
            <p>Tu pedido quedó registrado para que el negocio lo gestione.</p>
            <p>
              <strong>Número:</strong> {current.order.id}
            </p>
            <p>
              <strong>Dirección:</strong> {current.order.deliveryAddress}
            </p>
            <p>
              <strong>Total:</strong> ${current.order.subtotal.toFixed(2)}
            </p>
          </>
        )}
        <Link href="/cliente">Ver mis pedidos</Link> · <Link href="/">Explorar negocios</Link>
      </div>
    </main>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Confirmation />
    </Suspense>
  );
}
