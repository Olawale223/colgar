"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { useAdminContent, type ManagedProduct } from "@/components/AdminContentProvider";

const CART_STORAGE_KEY = "colgar-cart-v1";

export type CartLine = {
  key: string;
  slug: string;
  quantity: number;
  unitPrice: number;
  option?: string;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  ready: boolean;
  addItem: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartLine(value: unknown, products: ManagedProduct[]): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  if (!("key" in value) || !("slug" in value) || !("quantity" in value) || !("unitPrice" in value)) {
    return false;
  }
  if (typeof value.key !== "string" || typeof value.slug !== "string") return false;
  if (typeof value.quantity !== "number" || !Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 99) {
    return false;
  }
  if (typeof value.unitPrice !== "number" || !Number.isFinite(value.unitPrice) || value.unitPrice < 1) {
    return false;
  }
  if ("option" in value && value.option !== undefined && typeof value.option !== "string") return false;
  return products.some((product) => product.slug === value.slug);
}

function readStoredCart(products: ManagedProduct[]): CartLine[] {
  const saved = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!saved) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(saved);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    console.error("The saved Colgar cart was not valid JSON and has been cleared.", error);
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }

  if (!Array.isArray(parsed) || !parsed.every((line) => isCartLine(line, products))) {
    console.error("The saved Colgar cart had an invalid format and has been cleared.");
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
  return parsed;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, ready: contentReady } = useAdminContent();
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const cartLoaded = useRef(false);

  useEffect(() => {
    if (!contentReady || cartLoaded.current) return;
    setItems(readStoredCart(products));
    cartLoaded.current = true;
    setReady(true);
  }, [contentReady, products]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((line: Omit<CartLine, "key">) => {
    const key = `${line.slug}:${line.option ?? "default"}:${line.unitPrice}`;
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => item.key === key
          ? { ...item, quantity: Math.min(item.quantity + line.quantity, 99) }
          : item
        );
      }
      return [...current, { ...line, key }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    setItems((current) => current.map((item) => item.key === key ? { ...item, quantity } : item));
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);
  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    ready,
    addItem,
    setQuantity,
    removeItem,
    clearCart
  }), [items, ready, addItem, setQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider.");
  return context;
}
