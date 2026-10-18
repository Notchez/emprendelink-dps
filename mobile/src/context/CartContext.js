import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [business, setBusiness] = useState(null);

  const addItem = useCallback((product, selectedBusiness, quantity = 1) => {
    if (business && business.id !== selectedBusiness.id) return false;
    setBusiness(selectedBusiness);
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity }];
      return current.map((item) =>
        item.id === product.id ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item
      );
    });
    return true;
  }, [business]);

  const replaceWithItem = useCallback((product, selectedBusiness, quantity = 1) => {
    setBusiness(selectedBusiness);
    setItems([{ ...product, quantity }]);
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      setItems((current) => current.filter((item) => item.id !== productId));
      return;
    }
    setItems((current) => current.map((item) => (item.id === productId ? { ...item, quantity: Math.min(99, quantity) } : item)));
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setBusiness(null);
  }, []);

  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const value = useMemo(
    () => ({ items, business, subtotal, totalItems, addItem, replaceWithItem, updateQuantity, removeItem, clearCart }),
    [items, business, subtotal, totalItems, addItem, replaceWithItem, updateQuantity, removeItem, clearCart]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe utilizarse dentro de CartProvider.");
  return context;
}
