'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '380px',
        backgroundColor: '#ffffff',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Tu Carrito</h2>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#718096', marginTop: '2rem' }}>
            El carrito está vacío.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #edf2f7',
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{item.name}</strong>
                <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                  ${Number(item.price).toFixed(2)} c/u
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ padding: '0.2rem 0.5rem', background: '#edf2f7', border: 'none', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: '0.2rem 0.5rem', background: '#edf2f7', border: 'none', cursor: 'pointer' }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  style={{ marginLeft: '0.5rem', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f7fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <strong>Subtotal:</strong>
            <strong style={{ color: '#2b6cb0', fontSize: '1.2rem' }}>${subtotal.toFixed(2)}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/checkout');
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#38a169',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '0.5rem',
            }}
          >
            Continuar al Checkout
          </button>
          <button
            type="button"
            onClick={clearCart}
            style={{
              width: '100%',
              padding: '0.4rem',
              background: 'transparent',
              border: 'none',
              color: '#718096',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Vaciar Carrito
          </button>
        </div>
      )}
    </div>
  );
}
