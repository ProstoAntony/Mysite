import React, { createContext, useContext, useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const api = useAxios();
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem('userCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('userCart');
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;