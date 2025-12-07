import { create } from 'zustand';
import api from '@/services/api';
import { Product, Category } from '@/types';

// Helper untuk generate warna kategori secara berurutan
const getCategoryColor = (index: number) => {
  const colors = [
    'bg-orange-500', 'bg-blue-500', 'bg-green-500', 
    'bg-purple-500', 'bg-red-500', 'bg-indigo-500', 
    'bg-pink-500', 'bg-teal-500'
  ];
  return colors[index % colors.length];
};

type CreateProductDto = {
  name: string;
  description?: string;
  price: number;
  discount: number;
  categoryId?: string;
  imageUrl?: string;
};

type CreateCategoryDto = {
  name: string;
  description?: string;
};

interface ProductState {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  
  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<boolean>;
  updateProduct: (id: string, data: Partial<CreateProductDto>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;

  fetchCategories: () => Promise<void>;
  createCategory: (data: CreateCategoryDto) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/products');
      set({ products: res.data });
    } catch (error) {
      console.error("Gagal ambil produk:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProduct: async (data) => {
    try {
      await api.post('/products', data);
      await get().fetchProducts();
      return true;
    } catch (error) {
      console.error("Gagal tambah produk:", error);
      return false;
    }
  },

  updateProduct: async (id, data) => {
    try {
      await api.patch(`/products/${id}`, data);
      await get().fetchProducts();
      return true;
    } catch (error) {
      console.error("Gagal update produk:", error);
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/${id}`);
      await get().fetchProducts();
      return true;
    } catch (error) {
      console.error("Gagal hapus produk:", error);
      return false;
    }
  },

  // --- BAGIAN PENTING: Inject Warna di sini ---
  fetchCategories: async () => {
    try {
      const res = await api.get('/category');
      // Mapping manual untuk menyuntikkan warna karena BE tidak punya field color
      const categoriesWithColor = res.data.map((cat: any, index: number) => ({
        ...cat,
        color: getCategoryColor(index) 
      }));
      set({ categories: categoriesWithColor });
    } catch (error) {
      console.error("Gagal ambil kategori:", error);
    }
  },

  createCategory: async (data) => {
    try {
      await api.post('/category', data);
      await get().fetchCategories();
      return true;
    } catch (error) {
      console.error("Gagal buat kategori:", error);
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/category/${id}`);
      await get().fetchCategories();
      return true;
    } catch (error) {
      console.error("Gagal hapus kategori:", error);
      return false;
    }
  }
}));