import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'saliou_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(variant, product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productVariantId === variant.id);
      if (existing) {
        return prev.map((i) => (i.productVariantId === variant.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          productVariantId: variant.id,
          productName: product.name,
          size: variant.size,
          color: variant.color,
          unitPrice: product.basePrice,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(productVariantId, quantity) {
    if (quantity <= 0) return removeItem(productVariantId);
    setItems((prev) => prev.map((i) => (i.productVariantId === productVariantId ? { ...i, quantity } : i)));
  }

  function removeItem(productVariantId) {
    setItems((prev) => prev.filter((i) => i.productVariantId !== productVariantId));
  }

  function clear() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
