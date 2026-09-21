'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [businessId, setBusinessId] = useState(null);

  // Cargar carrito persistido al inicializar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('emprendelink_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setBusinessId(parsed.businessId || null);
      }
    } catch (err) {
      console.error('Error al recuperar carrito local', err);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        'emprendelink_cart',
        JSON.stringify({ items, businessId })
      );
    } catch (err) {
      console.error('Error al persistir carrito', err);
    }
  }, [items, businessId]);

  const addItem = (product, quantity = 1) => {
    // Si el carrito tiene productos de otro negocio, se limpia para iniciar el nuevo pedido
    if (businessId && businessId !== product.businessId) {
      const confirmChange = window.confirm(
        'Tu carrito contiene productos de otro emprendimiento. ¿Deseas vaciarlo para agregar de este nuevo negocio?'
      );
      if (!confirmChange) return false;
      setItems([{ ...product, quantity }]);
      setBusinessId(product.businessId);
      return true;
    }

    setBusinessId(product.businessId);
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { ...product, quantity }];
    });
    return true;
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (productId) => {
    setItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.id !== productId);
      if (filtered.length === 0) setBusinessId(null);
      return filtered;
    });
  };

  const clearCart = () => {
    setItems([]);
    setBusinessId(null);
    localStorage.removeItem('emprendelink_cart');
  };

  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        businessId,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}