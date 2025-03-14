import React, { createContext, useContext, useState, useEffect, useContext as useReactContext } from 'react';
import useAxios from '../utils/useAxios';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const api = useAxios();
  const { user, authTokens } = useReactContext(AuthContext);
  
  // Используем ID пользователя для создания уникального ключа хранилища
  const cartStorageKey = user ? `userCart_${user.user_id}` : 'guestCart';
  
  // Сохраняем предыдущий ключ корзины для обработки выхода из аккаунта
  const [prevCartKey, setPrevCartKey] = useState(cartStorageKey);
  
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage with user-specific key
    const savedCart = localStorage.getItem(cartStorageKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Обновляем корзину при изменении пользователя
  useEffect(() => {
    // Если пользователь вышел из аккаунта (был user, стал null)
    if (prevCartKey.includes('userCart_') && cartStorageKey === 'guestCart') {
      // Сохраняем корзину авторизованного пользователя перед выходом
      const userCart = localStorage.getItem(prevCartKey);
      if (userCart) {
        localStorage.setItem(cartStorageKey, userCart);
        setCartItems(JSON.parse(userCart));
      }
    } else {
      // Обычная загрузка корзины для текущего пользователя
      const savedCart = localStorage.getItem(cartStorageKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    }
    
    // Обновляем предыдущий ключ
    setPrevCartKey(cartStorageKey);
  }, [cartStorageKey, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, cartStorageKey]);

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
    localStorage.removeItem(cartStorageKey);
  };

  // Add calculateTotal function
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart,
      removeFromCart,
      clearCart,
      calculateTotal, // Add this to the context value
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;