import { create } from 'zustand';
import { Category } from '@/types/Category';

interface CategoryState {
    categories: Category[];

    setCategories: (categories: Category[]) => void;
    addCategory: (category: Category) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],

    // Overwrite with API data
    setCategories: (categories) => set({ categories }),

    // Add new
    addCategory: (category) =>
        set((state) => ({
            categories: [...state.categories, category],
        })),

    // Update existing
    updateCategory: (updatedCategory) =>
        set((state) => ({
            categories: state.categories.map((c) =>
                c.categoryId === updatedCategory.categoryId ? updatedCategory : c
            ),
        })),

    // Delete
    deleteCategory: (id: string) =>
        set((state) => ({
            categories: state.categories.filter((c) => c.categoryId !== id),
        })),
}));
