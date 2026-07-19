import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      setCart(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      throw new Error(msg);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put('/cart', { productId, quantity });
      setCart(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      throw new Error(msg);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item from cart';
      throw new Error(msg);
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.post('/cart/clear');
      setCart(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear cart';
      throw new Error(msg);
    }
  };

  // Calculations
  const cartItems = cart?.items || [];
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        itemsCount,
        subtotal,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
