import { create } from 'zustand';
import { Product } from '@/types/Product';

// ================================
// PRODUCT STORE (Backend Synced)
// ================================

interface ProductState {
  products: Product[];

  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],

  // Set from API
  setProducts: (products) => set({ products }),

  // Create
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  // Update
  updateProduct: (updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.productId === updatedProduct.productId ? updatedProduct : p
      ),
    })),

  // Delete
  deleteProduct: (id: string) =>
    set((state) => ({
      products: state.products.filter((p) => p.productId !== id),
    })),
}));
