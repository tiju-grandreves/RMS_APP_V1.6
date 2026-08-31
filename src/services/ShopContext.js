import React, { createContext, useContext, useState, useCallback } from 'react';
import httpService from './httpService';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadShopBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError('');
    try {
      const response = await httpService.get(`/shop-dtls/public/${slug}`);
      setShop(response?.data || null);
      return response?.data || null;
    } catch (err) {
      setShop(null);
      setError(err?.message || 'Shop not found');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ShopContext.Provider value={{ shop, loading, error, loadShopBySlug }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
