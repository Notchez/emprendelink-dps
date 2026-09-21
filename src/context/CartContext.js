"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

function readSavedCart() {
  if (typeof window === "undefined") {
    return { items: [], businessId: null };
  }

  try {
    const savedCart = localStorage.getItem("emprendelink_cart");

    return savedCart ? JSON.parse(savedCart) : { items: [], businessId: null };
  } catch (error) {
    console.error("Error al recuperar carrito local", error);
    return { items: [], businessId: null };
  }
}

export function CartProvider({ children }) {
  const [initialCart] = useState(readSavedCart);
  const [items, setItems] = useState(initialCart.items || []);
  const [businessId, setBusinessId] = useState(initialCart.businessId || null);

  useEffect(() => {
    try {
      localStorage.setItem("emprendelink_cart", JSON.stringify({ items, businessId }));
    } catch (error) {
      console.error("Error al persistir carrito", error);
    }
  }, [items, businessId]);

  const addItem = (product, quantity = 1) => {
    if (businessId && businessId !== product.businessId) {
      const confirmChange = window.confirm(
        "Tu carrito contiene productos de otro emprendimiento. ¿Deseas vaciarlo para agregar de este nuevo negocio?"
      );

      if (!confirmChange) return false;

      setItems([{ ...product, quantity }]);
      setBusinessId(product.businessId);

      return true;
    }

    setBusinessId(product.businessId);

    setItems((previousItems) => {
      const existingIndex = previousItems.findIndex((item) => item.id === product.id);

      if (existingIndex > -1) {
        const updatedItems = [...previousItems];
        updatedItems[existingIndex].quantity += quantity;

        return updatedItems;
      }

      return [...previousItems, { ...product, quantity }];
    });

    return true;
  };

  const removeItem = (productId) => {
    setItems((previousItems) => {
      const filteredItems = previousItems.filter((item) => item.id !== productId);

      if (filteredItems.length === 0) {
        setBusinessId(null);
      }

      return filteredItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setBusinessId(null);
    localStorage.removeItem("emprendelink_cart");
  };

  const subtotal = items.reduce(
    (total, item) => total + (Number(item.price) || 0) * item.quantity,
    0
  );

  const totalItemsCount = items.reduce((total, item) => total + item.quantity, 0);

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
    throw new Error("useCart debe ser utilizado dentro de un CartProvider");
  }

  return context;
}
