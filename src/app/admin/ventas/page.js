"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { orderService } from "@/services/orderService";

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/El_Salvador",
  }).format(new Date(value));
}

export default function AdminSalesPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadSales() {
      try {
        const orders = await orderService.getOrders();

        const deliveredOrders = orders.filter((order) => order.status === ORDER_STATUS.DELIVERED);

        if (active) {
          setResult({
            orders: deliveredOrders,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setResult({
            orders: [],
            error: error.message,
          });
        }
      }
    }

    void loadSales();

    return () => {
      active = false;
    };
  }, []);

  const orders = result?.orders || [];

  const total = orders.reduce((sum, order) => sum + Number(order.subtotal || 0), 0);

  return (
    <div className="container">
      <p className="eyebrow">Panel del administrador</p>

      <h1>Ventas entregadas</h1>

      {!result && <p>Cargando ventas...</p>}

      {result?.error && <p role="alert">{result.error}</p>}

      {result && !result.error && (
        <>
          <p>Pedidos entregados: {orders.length}</p>

          <h2>Total: {formatMoney(total)}</h2>

          {orders.length === 0 ? (
            <p>Todavía no hay ventas entregadas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Detalle</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td title={order.id}>PED-{order.id.slice(0, 8).toUpperCase()}</td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>{order.customer?.name || "Cliente"}</td>

                      <td>{formatMoney(order.subtotal)}</td>

                      <td>
                        <Link href={`/orders/${encodeURIComponent(order.id)}`}>Ver pedido</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
