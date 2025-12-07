import api from "./api";
import {
  Category,
  CategoryCreateDto,
  CategoryUpdateDto,
} from "@/types/Category";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return (await api.get("/categories")).data;
  },

  async create(payload: CategoryCreateDto): Promise<Category> {
    return (await api.post("/categories", payload)).data;
  },

  async update(id: string, payload: CategoryUpdateDto): Promise<void> {
    await api.patch(`/categories/${id}`, payload);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
