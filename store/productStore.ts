import { create } from 'zustand';
import api from '@/services/api'; // Pastikan import api axios Anda benar
import { Product, Category } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

// Helper untuk generate warna kategori (karena BE tidak simpan warna)
const getCategoryColor = (index: number) => {
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
  return colors[index % colors.length];
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      // Panggil GET /api/products
      const res = await api.get('/products');
      set({ products: res.data });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      // Panggil GET /api/category
      const res = await api.get('/category');
      // Mapping manual warna karena BE tidak punya field color
      const categoriesWithColor = res.data.map((cat: any, index: number) => ({
        ...cat,
        color: getCategoryColor(index)
      }));
      set({ categories: categoriesWithColor });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },
}));