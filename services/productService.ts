import api from "./api";
import { Product, ProductCreateDto, ProductUpdateDto } from "@/types/Product";

export const productService = {
    async getAll(): Promise<Product[]> {
        const { data } = await api.get("/products");
        return data;
    },

    async create(product: ProductCreateDto) {
        const { data } = await api.post("/products", product);
        return data;
    },

    async update(id: string, product: ProductUpdateDto) {
        await api.patch(`/products/${id}`, product);
    },

    async remove(id: string) {
        await api.delete(`/products/${id}`);
    },
};
