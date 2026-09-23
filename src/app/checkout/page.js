"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { customerService } from "@/services/customerService";
import { orderService } from "@/services/orderService";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, businessId, clearCart } = useCart();

  // Estados del formulario del cliente (cumple con Customer contract)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validaciones obligatorias de UI
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setFormError("Por favor completa los campos obligatorios: Nombre, Teléfono y Dirección.");
      return;
    }

    if (items.length === 0) {
      setFormError("El carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    const validBusinessId = businessId || "business-001";
    setLoading(true);

    try {
      const customer = await customerService.createCustomer({
        businessId: validBusinessId,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
      });

      const order = await orderService.createOrder({
        businessId: validBusinessId,
        customerId: customer.id,
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.price),
        })),
        deliveryAddress: formData.address.trim(),
        notes: formData.notes.trim() || null,
        createdBy: customer.id,
      });

      sessionStorage.setItem("emprendelink_last_order", JSON.stringify({ ...order, customer }));
      clearCart();
      router.push("/checkout/confirmacion");
    } catch (error) {
      setFormError(error.message || "Ocurrió un error al procesar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main
        style={{ maxWidth: "600px", margin: "3rem auto", padding: "1.5rem", textAlign: "center" }}
      >
        <h2>Tu carrito está vacío</h2>
        <p style={{ color: "#718096", margin: "1rem 0 2rem" }}>
          No tienes artículos seleccionados para generar un pedido.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "#3182ce",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Volver al catálogo
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "800px", margin: "2rem auto", padding: "1.5rem" }}>
      <button
        type="button"
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          color: "#3182ce",
          cursor: "pointer",
          marginBottom: "1.5rem",
          fontSize: "0.95rem",
        }}
      >
        ← Volver al catálogo
      </button>

      <h1 style={{ marginBottom: "1.5rem", color: "#1a202c" }}>Finalizar Pedido</h1>

      {formError && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fed7d7",
            color: "#c53030",
            borderRadius: "6px",
            marginBottom: "1.5rem",
          }}
        >
          {formError}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Formulario de datos del cliente */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
              Nombre completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #cbd5e0",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
              Teléfono / WhatsApp *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ej. 7000-0000"
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #cbd5e0",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
              Correo electrónico (opcional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #cbd5e0",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
              Dirección de entrega *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Colonia, calle, número de casa, punto de referencia"
              rows={3}
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #cbd5e0",
                borderRadius: "4px",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.3rem" }}>
              Notas adicionales (opcional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Instrucciones especiales para la entrega"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #cbd5e0",
                borderRadius: "4px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.8rem",
              backgroundColor: loading ? "#a0aec0" : "#38a169",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.5rem",
            }}
          >
            {loading ? "Confirmando pedido..." : "Confirmar y Enviar Pedido"}
          </button>
        </form>

        {/* Resumen del pedido */}
        <aside
          style={{
            backgroundColor: "#f7fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "1.25rem",
            height: "fit-content",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              marginTop: 0,
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "0.5rem",
            }}
          >
            Resumen de compra
          </h2>
          <div style={{ margin: "1rem 0" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "2px solid #e2e8f0",
              paddingTop: "0.75rem",
              fontWeight: "bold",
              fontSize: "1.1rem",
              color: "#2b6cb0",
            }}
          >
            <span>Total:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
