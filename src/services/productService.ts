import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async getTotalInventoryValue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('quantity, unit_price');

      if (error) throw error;

      return data?.reduce((sum: number, product: any) => sum + (product.quantity * product.unit_price), 0) || 0;
    } catch (error) {
      console.error('Error calculating total inventory value:', error);
      throw error;
    }
  },

  async getProductsBelowMinQuantity(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lt('quantity', 'min_quantity');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products below minimum quantity:', error);
      throw error;
    }
  }
};
