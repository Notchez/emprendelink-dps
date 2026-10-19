import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  addCartItem,
  canAddCartItem,
  clearCartState,
  createEmptyCartState,
  removeCartItem,
  replaceCartWithItem,
  updateCartItemQuantity,
} from "../utils/cartState";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(createEmptyCartState);
  const { items, business } = cart;

  const addItem = useCallback((product, selectedBusiness, quantity = 1) => {
    if (!canAddCartItem(cart, selectedBusiness)) return false;
    setCart((current) => addCartItem(current, product, selectedBusiness, quantity));
    return true;
  }, [cart]);

  const replaceWithItem = useCallback((product, selectedBusiness, quantity = 1) => {
    setCart(replaceCartWithItem(product, selectedBusiness, quantity));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setCart((current) => updateCartItemQuantity(current, productId, quantity));
  }, []);

  const removeItem = useCallback((productId) => {
    setCart((current) => removeCartItem(current, productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart(clearCartState());
  }, []);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );
  const value = useMemo(
    () => ({
      items,
      business,
      subtotal,
      totalItems,
      addItem,
      replaceWithItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      business,
      subtotal,
      totalItems,
      addItem,
      replaceWithItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe utilizarse dentro de CartProvider.");
  return context;
}
