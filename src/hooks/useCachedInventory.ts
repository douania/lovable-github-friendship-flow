
import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';
import { useCache } from './useCache';

export const useCachedInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    loading,
    fetchWithCache,
    invalidateByPattern,
    clear: clearCache
  } = useCache<Product[]>([], {
    ttl: 15 * 60 * 1000, // 15 minutes pour l'inventaire
    persist: true,
    key: 'inventory'
  });

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      const data = await fetchWithCache(
        'products_list',
        () => productService.getAll(),
        forceRefresh
      );
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Erreur lors du chargement des produits');
    }
  }, [fetchWithCache]);

  const createProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productService.create(productData);
      
      // Invalider le cache et recharger
      invalidateByPattern(/^products_/);
      await fetchProducts(true);
      
      return newProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  }, [invalidateByPattern, fetchProducts]);

  const updateProduct = useCallback(async (id: string, productData: Partial<Omit<Product, 'id'>>) => {
    try {
      const updatedProduct = await productService.update(id, productData);
      
      // Invalider le cache et recharger
      invalidateByPattern(/^products_/);
      await fetchProducts(true);
      
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  }, [invalidateByPattern, fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productService.delete(id);
      
      // Invalider le cache et recharger
      invalidateByPattern(/^products_/);
      await fetchProducts(true);
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  }, [invalidateByPattern, fetchProducts]);

  const getLowStockProducts = useCallback(() => {
    return products.filter(product => product.quantity <= product.minQuantity);
  }, [products]);

  const checkProductAvailability = useCallback((productId: string, requiredQuantity: number): boolean => {
    const product = products.find(p => p.id === productId);
    return product ? product.quantity >= requiredQuantity : false;
  }, [products]);

  const getProductById = useCallback(async (id: string, useCache = true) => {
    try {
      if (useCache) {
        return await fetchWithCache(
          `product_${id}`,
          () => productService.getById(id)
        );
      } else {
        return await productService.getById(id);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      throw err;
    }
  }, [fetchWithCache]);

  // Précharger les données au montage
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
    checkProductAvailability,
    getProductById,
    clearCache
  };
};
