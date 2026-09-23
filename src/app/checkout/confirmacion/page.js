"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const LAST_ORDER_KEY = "emprendelink_last_order";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return sessionStorage.getItem(LAST_ORDER_KEY) || "";
}

function getServerSnapshot() {
  return "";
}

export default function ConfirmationPage() {
  const router = useRouter();
  const storedOrder = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const order = useMemo(() => {
    try {
      return storedOrder ? JSON.parse(storedOrder) : null;
    } catch (error) {
      console.error("Error al recuperar la orden", error);
      return null;
    }
  }, [storedOrder]);

  return (
    <main
      style={{
        maxWidth: "650px",
        margin: "3rem auto",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#c6f6d5",
          color: "#22543d",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          margin: "0 auto 1.5rem",
        }}
      >
        ✓
      </div>

      <h1 style={{ color: "#1a202c", marginBottom: "0.5rem" }}>¡Pedido recibido!</h1>

      <p style={{ color: "#4a5568", marginBottom: "2rem" }}>
        El emprendedor ha sido notificado y tu pedido ha ingresado en estado{" "}
        <strong>PENDING</strong>.
      </p>

      {order && (
        <div
          style={{
            backgroundColor: "#f7fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.5rem",
            textAlign: "left",
            marginBottom: "2rem",
          }}
        >
          <p>
            <strong>N.º de orden:</strong> {order.id}
          </p>

          <p>
            <strong>Cliente:</strong> {order.customer?.name}
          </p>

          <p>
            <strong>Teléfono:</strong> {order.customer?.phone}
          </p>

          <p>
            <strong>Dirección:</strong> {order.deliveryAddress}
          </p>

          <p>
            <strong>Total:</strong> ${Number(order.subtotal || 0).toFixed(2)}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/catalogo/mi-tienda")}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#3182ce",
          color: "#ffffff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Regresar al catálogo
      </button>
    </main>
  );
}
