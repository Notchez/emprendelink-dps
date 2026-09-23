"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "emprendelink_cart";
const CART_CHANGE_EVENT = "emprendelink-cart-change";
const EMPTY_CART_SERIALIZED = JSON.stringify({
  items: [],
  businessId: null,
});

function parseCart(serializedCart) {
  try {
    const parsedCart = JSON.parse(serializedCart);

    return {
      items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
      businessId: typeof parsedCart.businessId === "string" ? parsedCart.businessId : null,
    };
  } catch (error) {
    console.error("Error al recuperar carrito local", error);
    return { items: [], businessId: null };
  }
}

function getClientSnapshot() {
  try {
    return localStorage.getItem(CART_STORAGE_KEY) || EMPTY_CART_SERIALIZED;
  } catch (error) {
    console.error("Error al leer carrito local", error);
    return EMPTY_CART_SERIALIZED;
  }
}

function getServerSnapshot() {
  return EMPTY_CART_SERIALIZED;
}

function subscribeToCart(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(CART_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CART_CHANGE_EVENT, callback);
  };
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  } catch (error) {
    console.error("Error al persistir carrito", error);
  }
}

export function CartProvider({ children }) {
  const serializedCart = useSyncExternalStore(
    subscribeToCart,
    getClientSnapshot,
    getServerSnapshot
  );

  const { items, businessId } = useMemo(() => parseCart(serializedCart), [serializedCart]);

  const addItem = (product, quantity = 1) => {
    const currentCart = parseCart(getClientSnapshot());

    if (currentCart.businessId && currentCart.businessId !== product.businessId) {
      const confirmChange = window.confirm(
        "Tu carrito contiene productos de otro emprendimiento. ¿Deseas vaciarlo para agregar de este nuevo negocio?"
      );

      if (!confirmChange) return false;

      saveCart({
        items: [{ ...product, quantity }],
        businessId: product.businessId,
      });

      return true;
    }

    const productExists = currentCart.items.some((item) => item.id === product.id);

    const updatedItems = productExists
      ? currentCart.items.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        )
      : [...currentCart.items, { ...product, quantity }];

    saveCart({
      items: updatedItems,
      businessId: product.businessId,
    });

    return true;
  };

  const removeItem = (productId) => {
    const currentCart = parseCart(getClientSnapshot());

    const filteredItems = currentCart.items.filter((item) => item.id !== productId);

    saveCart({
      items: filteredItems,
      businessId: filteredItems.length > 0 ? currentCart.businessId : null,
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    const currentCart = parseCart(getClientSnapshot());

    saveCart({
      items: currentCart.items.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ),
      businessId: currentCart.businessId,
    });
  };

  const clearCart = () => {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      window.dispatchEvent(new Event(CART_CHANGE_EVENT));
    } catch (error) {
      console.error("Error al vaciar carrito local", error);
    }
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
