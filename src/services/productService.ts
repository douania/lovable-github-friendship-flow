
import { supabase } from '../integrations/supabase/client';
import { Product } from '../types';

const transformProduct = (data: any): Product => {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    quantity: data.quantity,
    minQuantity: data.min_quantity,
    unitPrice: data.unit_price,
    sellingPrice: data.selling_price || undefined,
    unit: data.unit || undefined,
    supplier: data.supplier || '',
    expiryDate: data.expiry_date || undefined,
    lastRestocked: data.last_restocked,
    storageConditions: data.storage_conditions || undefined,
    batchNumber: data.batch_number || undefined,
    administrationMethod: data.administration_method || undefined,
    concentration: data.concentration || undefined,
    volumePerUnit: data.volume_per_unit || undefined,
    isPrescriptionRequired: data.is_prescription_required || false,
    baseUnitsPerSession: data.base_units_per_session || 1.0,
    usageType: (data.usage_type as "fixed" | "variable" | "zone_based") || "fixed",
    unitVariations: Array.isArray(data.unit_variations) ? data.unit_variations : []
  };
};

export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data ? data.map(transformProduct) : [];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching product by ID:', error);
        throw error;
      }

      return data ? transformProduct(data) : null;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const productData = {
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        min_quantity: product.minQuantity,
        unit_price: product.unitPrice,
        selling_price: product.sellingPrice,
        unit: product.unit,
        supplier: product.supplier || '',
        expiry_date: product.expiryDate,
        last_restocked: product.lastRestocked,
        storage_conditions: product.storageConditions,
        batch_number: product.batchNumber,
        administration_method: product.administrationMethod,
        concentration: product.concentration,
        volume_per_unit: product.volumePerUnit,
        is_prescription_required: product.isPrescriptionRequired || false,
        base_units_per_session: product.baseUnitsPerSession || 1.0,
        usage_type: product.usageType || "fixed",
        unit_variations: product.unitVariations || []
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return transformProduct(data);
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  async update(id: string, product: Partial<Omit<Product, 'id'>>): Promise<Product> {
    try {
      const productData: any = {};
      
      if (product.name !== undefined) productData.name = product.name;
      if (product.category !== undefined) productData.category = product.category;
      if (product.quantity !== undefined) productData.quantity = product.quantity;
      if (product.minQuantity !== undefined) productData.min_quantity = product.minQuantity;
      if (product.unitPrice !== undefined) productData.unit_price = product.unitPrice;
      if (product.sellingPrice !== undefined) productData.selling_price = product.sellingPrice;
      if (product.unit !== undefined) productData.unit = product.unit;
      if (product.supplier !== undefined) productData.supplier = product.supplier;
      if (product.expiryDate !== undefined) productData.expiry_date = product.expiryDate;
      if (product.lastRestocked !== undefined) productData.last_restocked = product.lastRestocked;
      if (product.storageConditions !== undefined) productData.storage_conditions = product.storageConditions;
      if (product.batchNumber !== undefined) productData.batch_number = product.batchNumber;
      if (product.administrationMethod !== undefined) productData.administration_method = product.administrationMethod;
      if (product.concentration !== undefined) productData.concentration = product.concentration;
      if (product.volumePerUnit !== undefined) productData.volume_per_unit = product.volumePerUnit;
      if (product.isPrescriptionRequired !== undefined) productData.is_prescription_required = product.isPrescriptionRequired;
      if (product.baseUnitsPerSession !== undefined) productData.base_units_per_session = product.baseUnitsPerSession;
      if (product.usageType !== undefined) productData.usage_type = product.usageType;
      if (product.unitVariations !== undefined) productData.unit_variations = product.unitVariations;

      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      return transformProduct(data);
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  },

  async getByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return data ? data.map(transformProduct) : [];
    } catch (error) {
      console.error('Error in getByCategory:', error);
      throw error;
    }
  },

  async getLowStock(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .filter('quantity', 'lte', 'min_quantity')
        .order('name');

      if (error) {
        console.error('Error fetching low stock products:', error);
        throw error;
      }

      return data ? data.map(transformProduct) : [];
    } catch (error) {
      console.error('Error in getLowStock:', error);
      throw error;
    }
  }
};
