import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from './ToastContext.jsx';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    
    if (exists) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      showToast(`${product.name} removed from wishlist`, 'info');
    } else {
      setWishlistItems(prev => [...prev, product]);
      showToast(`${product.name} added to wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
