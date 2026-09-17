'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmationPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('emprendelink_last_order');
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error al recuperar la orden', e);
    }
  }, []);

  return (
    <main style={{ maxWidth: '650px', margin: '3rem auto', padding: '1.5rem', textAlign: 'center' }}>
      <div
        style={{
          backgroundColor: '#c6f6d5',
          color: '#22543d',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 1.5rem',
        }}
      >
        ✓
      </div>

      <h1 style={{ color: '#1a202c', marginBottom: '0.5rem' }}>¡Pedido Recibido!</h1>
      <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
        El emprendedor ha sido notificado y tu pedido ha ingresado en estado <strong>PENDING</strong>.
      </p>

      {order && (
        <div
          style={{
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}
        >
          <p><strong>N.° de Orden:</strong> {order.id}</p>
          <p><strong>Cliente:</strong> {order.customer?.name}</p>
          <p><strong>Teléfono:</strong> {order.customer?.phone}</p>
          <p><strong>Dirección:</strong> {order.customer?.address}</p>
          <p><strong>Total:</strong> ${Number(order.subtotal || 0).toFixed(2)}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push('/catalogo/mi-tienda')}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3182ce',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Regresar al catálogo
      </button>
    </main>
  );
}