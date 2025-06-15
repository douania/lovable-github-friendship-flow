import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Helper function to validate usage type
const isValidUsageType = (value: string | null | undefined): value is 'fixed' | 'variable' | 'zone_based' => {
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

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      
      return data?.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        minQuantity: product.min_quantity,
        unitPrice: product.unit_price,
        sellingPrice: product.selling_price || undefined,
        unit: product.unit || undefined,
        supplier: product.supplier || '',
        expiryDate: product.expiry_date || undefined,
        lastRestocked: product.last_restocked,
        // Nouveaux champs avancés avec validation de type sécurisée
        usageType: isValidUsageType(product.usage_type) ? product.usage_type : undefined,
        baseUnitsPerSession: product.base_units_per_session || undefined,
        unitVariations: parseUnitVariations(product.unit_variations),
        storageConditions: product.storage_conditions || undefined,
        batchNumber: product.batch_number || undefined,
        isPrescriptionRequired: product.is_prescription_required || undefined,
        administrationMethod: product.administration_method || undefined,
        concentration: product.concentration || undefined,
        volumePerUnit: product.volume_per_unit || undefined
      })) || [];
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data ? {
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
        // Nouveaux champs avancés avec validation de type sécurisée
        usageType: isValidUsageType(data.usage_type) ? data.usage_type : undefined,
        baseUnitsPerSession: data.base_units_per_session || undefined,
        unitVariations: parseUnitVariations(data.unit_variations),
        storageConditions: data.storage_conditions || undefined,
        batchNumber: data.batch_number || undefined,
        isPrescriptionRequired: data.is_prescription_required || undefined,
        administrationMethod: data.administration_method || undefined,
        concentration: data.concentration || undefined,
        volumePerUnit: data.volume_per_unit || undefined
      } : null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          category: productData.category,
          quantity: productData.quantity,
          min_quantity: productData.minQuantity,
          unit_price: productData.unitPrice,
          selling_price: productData.sellingPrice,
          unit: productData.unit,
          supplier: productData.supplier,
          expiry_date: productData.expiryDate || null,
          last_restocked: productData.lastRestocked,
          // Nouveaux champs avancés
          usage_type: productData.usageType,
          base_units_per_session: productData.baseUnitsPerSession,
          unit_variations: productData.unitVariations || [],
          storage_conditions: productData.storageConditions,
          batch_number: productData.batchNumber,
          is_prescription_required: productData.isPrescriptionRequired,
          administration_method: productData.administrationMethod,
          concentration: productData.concentration,
          volume_per_unit: productData.volumePerUnit
        }])
        .select()
        .single();

      if (error) throw error;
      
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
        // Nouveaux champs avancés avec validation de type sécurisée
        usageType: isValidUsageType(data.usage_type) ? data.usage_type : undefined,
        baseUnitsPerSession: data.base_units_per_session || undefined,
        unitVariations: parseUnitVariations(data.unit_variations),
        storageConditions: data.storage_conditions || undefined,
        batchNumber: data.batch_number || undefined,
        isPrescriptionRequired: data.is_prescription_required || undefined,
        administrationMethod: data.administration_method || undefined,
        concentration: data.concentration || undefined,
        volumePerUnit: data.volume_per_unit || undefined
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          category: productData.category,
          quantity: productData.quantity,
          min_quantity: productData.minQuantity,
          unit_price: productData.unitPrice,
          selling_price: productData.sellingPrice,
          unit: productData.unit,
          supplier: productData.supplier,
          expiry_date: productData.expiryDate || null,
          last_restocked: productData.lastRestocked,
          // Nouveaux champs avancés
          usage_type: productData.usageType,
          base_units_per_session: productData.baseUnitsPerSession,
          unit_variations: productData.unitVariations || [],
          storage_conditions: productData.storageConditions,
          batch_number: productData.batchNumber,
          is_prescription_required: productData.isPrescriptionRequired,
          administration_method: productData.administrationMethod,
          concentration: productData.concentration,
          volume_per_unit: productData.volumePerUnit
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
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
        // Nouveaux champs avancés avec validation de type sécurisée
        usageType: isValidUsageType(data.usage_type) ? data.usage_type : undefined,
        baseUnitsPerSession: data.base_units_per_session || undefined,
        unitVariations: parseUnitVariations(data.unit_variations),
        storageConditions: data.storage_conditions || undefined,
        batchNumber: data.batch_number || undefined,
        isPrescriptionRequired: data.is_prescription_required || undefined,
        administrationMethod: data.administration_method || undefined,
        concentration: data.concentration || undefined,
        volumePerUnit: data.volume_per_unit || undefined
      };
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

  async decrementProductQuantity(productId: string, quantity: number): Promise<void> {
    try {
      // For now, we'll manually handle the decrement
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const newQuantity = Math.max(0, product.quantity - quantity);

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error decrementing product quantity:', error);
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
      
      return data?.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        minQuantity: product.min_quantity,
        unitPrice: product.unit_price,
        sellingPrice: product.selling_price || undefined,
        unit: product.unit || undefined,
        supplier: product.supplier || '',
        expiryDate: product.expiry_date || undefined,
        lastRestocked: product.last_restocked,
        // Nouveaux champs avancés avec validation de type sécurisée
        usageType: isValidUsageType(product.usage_type) ? product.usage_type : undefined,
        baseUnitsPerSession: product.base_units_per_session || undefined,
        unitVariations: parseUnitVariations(product.unit_variations),
        storageConditions: product.storage_conditions || undefined,
        batchNumber: product.batch_number || undefined,
        isPrescriptionRequired: product.is_prescription_required || undefined,
        administrationMethod: product.administration_method || undefined,
        concentration: product.concentration || undefined,
        volumePerUnit: product.volume_per_unit || undefined
      })) || [];
    } catch (error) {
      console.error('Error fetching products below minimum quantity:', error);
      throw error;
    }
  }
};
