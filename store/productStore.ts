import { create } from 'zustand';
import { Product, Category } from '@/types';

// --- INITIAL DATA MOVED HERE ---
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-makanan', name: 'Makanan', color: 'bg-orange-500' },
  { id: 'cat-minuman', name: 'Minuman', color: 'bg-blue-500' },
  { id: 'cat-snack', name: 'Snack', color: 'bg-green-500' },
  { id: 'cat-lainnya', name: 'Lainnya', color: 'bg-purple-500' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Nasi Goreng', price: 25000, categoryId: 'cat-makanan', stock: 50, image: 'https://images.unsplash.com/photo-1603133872878-684f1084261d?w=400&q=80' },
  { id: 'prod-2', name: 'Mie Goreng', price: 22000, categoryId: 'cat-makanan', stock: 45 },
  { id: 'prod-3', name: 'Ayam Goreng', price: 30000, categoryId: 'cat-makanan', stock: 30 },
  { id: 'prod-4', name: 'Es Teh', price: 5000, categoryId: 'cat-minuman', stock: 100 },
  { id: 'prod-5', name: 'Kopi Susu', price: 15000, categoryId: 'cat-minuman', stock: 80 },
  { id: 'prod-6', name: 'Jus Jeruk', price: 12000, categoryId: 'cat-minuman', stock: 60 },
  { id: 'prod-7', name: 'Keripik', price: 10000, categoryId: 'cat-snack', stock: 120 },
  { id: 'prod-8', name: 'Kacang', price: 8000, categoryId: 'cat-snack', stock: 150 },
];

interface ProductState {
  products: Product[];
  categories: Category[];
  
  // Actions for Products
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (items: { productId: string; quantity: number }[]) => void;

  // Actions for Categories
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,

  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (updatedProduct) => set((state) => ({
    products: state.products.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),
  
  // Logic to decrease stock after payment
  updateStock: (items) => set((state) => {
    const newProducts = [...state.products];
    items.forEach(item => {
      const productIndex = newProducts.findIndex(p => p.id === item.productId);
      if (productIndex > -1) {
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          stock: newProducts[productIndex].stock - item.quantity
        };
      }
    });
    return { products: newProducts };
  }),

  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
  updateCategory: (updatedCategory) => set((state) => ({
    categories: state.categories.map((c) => c.id === updatedCategory.id ? updatedCategory : c)
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id)
  })),
}));