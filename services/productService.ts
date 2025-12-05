import api from "./api";

export const productService = {
    async getAll() {
        const { data } = await api.get('/api/products');
        console.log(data);
        return data;
    }
}