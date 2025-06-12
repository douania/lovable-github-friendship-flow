import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Fonction pour convertir les données de la DB vers le type Product
const mapDbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  category: dbProduct.category,
  quantity: dbProduct.quantity,
  minQuantity: dbProduct.min_quantity,
  unitPrice: dbProduct.unit_price,
  sellingPrice: dbProduct.selling_price || undefined,
  unit: dbProduct.unit || undefined,
  supplier: dbProduct.supplier || '',
  expiryDate: dbProduct.expiry_date,
  lastRestocked: dbProduct.last_restocked
});

// Fonction pour convertir le type Product vers les données de la DB
const mapProductToDbProduct = (product: Omit<Product, 'id'>) => ({
  name: product.name,
  category: product.category,
  quantity: product.quantity,
  min_quantity: product.minQuantity,
  unit_price: product.unitPrice,
  selling_price: product.sellingPrice || null,
  unit: product.unit || null,
  supplier: product.supplier || null,
  expiry_date: product.expiryDate || null,
  last_restocked: product.lastRestocked
});

export const productService = {
  // Récupérer tous les produits
  async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        throw error;
      }

      return data?.map(mapDbProductToProduct) || [];
    } catch (error) {
      console.error('Erreur dans getAll products:', error);
      throw error;
    }
  },

  // Récupérer les produits en stock faible
  async getLowStock(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .filter('quantity', 'lte', 'min_quantity')
        .order('quantity', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des produits en stock faible:', error);
        throw error;
      }

      return data?.map(mapDbProductToProduct) || [];
    } catch (error) {
      console.error('Erreur dans getLowStock products:', error);
      throw error;
    }
  },

  // Récupérer les produits par catégorie
  async getByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des produits par catégorie:', error);
        throw error;
      }

      return data?.map(mapDbProductToProduct) || [];
    } catch (error) {
      console.error('Erreur dans getByCategory products:', error);
      throw error;
    }
  },

  // Récupérer un produit par ID
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
        console.error('Erreur lors de la récupération du produit:', error);
        throw error;
      }

      return data ? mapDbProductToProduct(data) : null;
    } catch (error) {
      console.error('Erreur dans getById product:', error);
      throw error;
    }
  },

  // Créer un nouveau produit
  async create(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const dbProduct = mapProductToDbProduct(productData);
      
      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du produit:', error);
        throw error;
      }

      return mapDbProductToProduct(data);
    } catch (error) {
      console.error('Erreur dans create product:', error);
      throw error;
    }
  },

  // Mettre à jour un produit
  async update(id: string, productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const dbProduct = mapProductToDbProduct(productData);
      
      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
        throw error;
      }

      return mapDbProductToProduct(data);
    } catch (error) {
      console.error('Erreur dans update product:', error);
      throw error;
    }
  },

  // Mettre à jour la quantité d'un produit
  async updateQuantity(id: string, quantity: number): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          quantity,
          last_restocked: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de la quantité:', error);
        throw error;
      }

      return mapDbProductToProduct(data);
    } catch (error) {
      console.error('Erreur dans updateQuantity product:', error);
      throw error;
    }
  },

  // Décrémenter la quantité d'un produit
  async decrementProductQuantity(productId: string, quantity: number): Promise<Product> {
    try {
      // D'abord récupérer le produit actuel
      const currentProduct = await this.getById(productId);
      if (!currentProduct) {
        throw new Error('Produit non trouvé');
      }

      // Calculer la nouvelle quantité (ne pas permettre de valeurs négatives)
      const newQuantity = Math.max(0, currentProduct.quantity - quantity);

      // Mettre à jour la quantité
      const { data, error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la décrémentation de la quantité:', error);
        throw error;
      }

      return mapDbProductToProduct(data);
    } catch (error) {
      console.error('Erreur dans decrementProductQuantity:', error);
      throw error;
    }
  },

  // Supprimer un produit
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans delete product:', error);
      throw error;
    }
  },

  // Rechercher des produits
  async search(searchTerm: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,supplier.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la recherche de produits:', error);
        throw error;
      }

      return data?.map(mapDbProductToProduct) || [];
    } catch (error) {
      console.error('Erreur dans search products:', error);
      throw error;
    }
  },

  // Calculer la valeur totale du stock
  async getTotalStockValue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('quantity, unit_price');

      if (error) {
        console.error('Erreur lors du calcul de la valeur du stock:', error);
        throw error;
      }

      const totalValue = (data || []).reduce((sum, product) => {
        return sum + (product.quantity * product.unit_price);
      }, 0);

      return totalValue;
    } catch (error) {
      console.error('Erreur dans getTotalStockValue:', error);
      throw error;
    }
  }
};