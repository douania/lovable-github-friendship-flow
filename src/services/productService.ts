
import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Helper function to validate usage type
const isValidUsageType = (value: any): value is 'fixed' | 'variable' | 'zone_based' => {
  if (!value || typeof value !== 'string') return false;
  return ['fixed', 'variable', 'zone_based'].includes(value);
};

// Helper function to safely parse unit variations
const parseUnitVariations = (data: any): Array<{ factor: string; value: string; units: number; }> | undefined => {
  if (!data) return undefined;
  if (Array.isArray(data)) {
    return data.filter(item => 
      item && 
      typeof item === 'object' && 
      'factor' in item && 
      'value' in item && 
      'units' in item
    );
  }
  return undefined;
};

// Helper function to map database row to Product interface
const mapDatabaseRowToProduct = (row: any): Product => {
  return {
    id: row.id,
    name: row.name || '',
    category: row.category || '',
    quantity: row.quantity || 0,
    minQuantity: row.min_quantity || 0,
    unitPrice: row.unit_price || 0,
    sellingPrice: row.selling_price || undefined,
    unit: row.unit || undefined,
    supplier: row.supplier || '',
    expiryDate: row.expiry_date || undefined,
    lastRestocked: row.last_restocked || new Date().toISOString().split('T')[0],
    // Advanced fields with safe type validation
    usageType: isValidUsageType(row.usage_type) ? row.usage_type : undefined,
    baseUnitsPerSession: row.base_units_per_session || undefined,
    unitVariations: parseUnitVariations(row.unit_variations),
    storageConditions: row.storage_conditions || undefined,
    batchNumber: row.batch_number || undefined,
    isPrescriptionRequired: row.is_prescription_required || undefined,
    administrationMethod: row.administration_method || undefined,
    concentration: row.concentration || undefined,
    volumePerUnit: row.volume_per_unit || undefined
  };
};

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      console.log('Fetching all products from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Raw data from Supabase:', data);
      return data?.map(mapDatabaseRowToProduct) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getAll(): Promise<Product[]> {
    return this.getAllProducts();
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      console.log('Fetching product by ID:', id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Raw product data:', data);
      return data ? mapDatabaseRowToProduct(data) : null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      console.log('Creating product:', productData);
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          category: productData.category,
          quantity: productData.quantity,
          min_quantity: productData.minQuantity,
          unit_price: productData.unitPrice,
          selling_price: productData.sellingPrice || null,
          unit: productData.unit || null,
          supplier: productData.supplier || '',
          expiry_date: productData.expiryDate || null,
          last_restocked: productData.lastRestocked,
          // Advanced fields
          usage_type: productData.usageType || null,
          base_units_per_session: productData.baseUnitsPerSession || null,
          unit_variations: productData.unitVariations || null,
          storage_conditions: productData.storageConditions || null,
          batch_number: productData.batchNumber || null,
          is_prescription_required: productData.isPrescriptionRequired || null,
          administration_method: productData.administrationMethod || null,
          concentration: productData.concentration || null,
          volume_per_unit: productData.volumePerUnit || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Created product data:', data);
      return mapDatabaseRowToProduct(data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      console.log('Updating product:', id, productData);
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          category: productData.category,
          quantity: productData.quantity,
          min_quantity: productData.minQuantity,
          unit_price: productData.unitPrice,
          selling_price: productData.sellingPrice || null,
          unit: productData.unit || null,
          supplier: productData.supplier || '',
          expiry_date: productData.expiryDate || null,
          last_restocked: productData.lastRestocked,
          // Advanced fields
          usage_type: productData.usageType || null,
          base_units_per_session: productData.baseUnitsPerSession || null,
          unit_variations: productData.unitVariations || null,
          storage_conditions: productData.storageConditions || null,
          batch_number: productData.batchNumber || null,
          is_prescription_required: productData.isPrescriptionRequired || null,
          administration_method: productData.administrationMethod || null,
          concentration: productData.concentration || null,
          volume_per_unit: productData.volumePerUnit || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Updated product data:', data);
      return mapDatabaseRowToProduct(data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('Deleting product:', id);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async decrementProductQuantity(productId: string, quantity: number): Promise<void> {
    try {
      console.log('Decrementing product quantity:', productId, quantity);
      // First get current quantity
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      const newQuantity = Math.max(0, product.quantity - quantity);
      console.log('New quantity will be:', newQuantity);

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      console.log('Quantity decremented successfully');
    } catch (error) {
      console.error('Error decrementing product quantity:', error);
      throw error;
    }
  },

  async getTotalInventoryValue(): Promise<number> {
    try {
      console.log('Calculating total inventory value...');
      const { data, error } = await supabase
        .from('products')
        .select('quantity, unit_price');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const total = data?.reduce((sum: number, product: any) => sum + (product.quantity * product.unit_price), 0) || 0;
      console.log('Total inventory value:', total);
      return total;
    } catch (error) {
      console.error('Error calculating total inventory value:', error);
      throw error;
    }
  },

  async getProductsBelowMinQuantity(): Promise<Product[]> {
    try {
      console.log('Fetching products below minimum quantity...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .filter('quantity', 'lt', 'min_quantity');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Products below min quantity:', data);
      return data?.map(mapDatabaseRowToProduct) || [];
    } catch (error) {
      console.error('Error fetching products below minimum quantity:', error);
      throw error;
    }
  }
};
