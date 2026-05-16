import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from './ToastContext.jsx';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, variantLabel, price) => {
    setCartItems(prev => {
      const cartItemId = `${product.id}-${variantLabel}`;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartItemId, variantLabel, price, quantity: 1 }];
    });
    
    showToast(`${product.name} added to cart!`, 'success');
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateItemVariant = (cartItemId, newVariantLabel, newPrice) => {
    setCartItems(prev => {
      const itemToUpdate = prev.find(item => item.cartItemId === cartItemId);
      if (!itemToUpdate || itemToUpdate.variantLabel === newVariantLabel) return prev;
      
      const newCartItemId = `${itemToUpdate.id}-${newVariantLabel}`;
      const existingSameVariant = prev.find(item => item.cartItemId === newCartItemId);

      if (existingSameVariant) {
        return prev
          .filter(item => item.cartItemId !== cartItemId)
          .map(item => 
            item.cartItemId === newCartItemId 
              ? { ...item, quantity: item.quantity + itemToUpdate.quantity } 
              : item
          );
      } else {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, variantLabel: newVariantLabel, price: newPrice, cartItemId: newCartItemId } 
            : item
        );
      }
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, updateItemVariant, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
