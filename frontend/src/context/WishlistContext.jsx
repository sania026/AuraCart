import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!token) {
      setWishlist(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const addToWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist', { productId });
      setWishlist(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to wishlist';
      throw new Error(msg);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      setWishlist(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item from wishlist';
      throw new Error(msg);
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.products) return false;
    return wishlist.products.some((prod) => {
      // Product can be populated (object with _id) or unpopulated string
      const id = typeof prod === 'object' ? prod._id : prod;
      return id === productId;
    });
  };

  const wishlistProducts = wishlist?.products || [];

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistProducts,
        loading,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
