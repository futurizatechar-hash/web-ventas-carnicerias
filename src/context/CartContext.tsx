"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Product } from "@/types";

type CartContextType = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedProductForCart: Product | null;
  setSelectedProductForCart: (product: Product | null) => void;
  modalQuantity: number;
  setModalQuantity: (qty: number) => void;
  modalUnitType: 'peso' | 'unidad';
  setModalUnitType: (type: 'peso' | 'unidad') => void;
  addToCart: (product: Product, quantity: number, unitType: 'peso' | 'unidad') => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
  getItemSubtotal: (item: CartItem) => number;
  formatPrice: (num: number) => string;
  checkoutStep: 'cart' | 'details';
  setCheckoutStep: (step: 'cart' | 'details') => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalUnitType, setModalUnitType] = useState<'peso' | 'unidad'>('peso');

  const addToCart = (product: Product, quantity: number, unitType: 'peso' | 'unidad') => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      quantity,
      unitType,
      price: product.price,
      estimatedUnitPrice: product.estimatedUnitPrice
    };
    setCartItems([...cartItems, newItem]);
    setSelectedProductForCart(null);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    const numeric = priceStr.replace(/\./g, '').replace(/[^0-9]/g, '');
    return Number(numeric) || 0;
  };

  const getItemSubtotal = (item: CartItem) => {
    if (item.unitType === 'unidad' && item.estimatedUnitPrice) {
      return parsePrice(item.estimatedUnitPrice) * item.quantity;
    }
    return parsePrice(item.price) * item.quantity;
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + getItemSubtotal(item), 0);
  
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      isCartOpen, 
      setIsCartOpen,
      selectedProductForCart,
      setSelectedProductForCart,
      modalQuantity,
      setModalQuantity,
      modalUnitType,
      setModalUnitType,
      addToCart, 
      removeFromCart,
      cartTotal,
      getItemSubtotal,
      formatPrice,
      checkoutStep,
      setCheckoutStep
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
