export type Product = {
    productId: string;
    name: string;
    description: string | null;
    price: number;
    discount: number;
    categoryId: string | null;
    categoryName: string | null;
    imageUrl: string | null;
};

export type ProductCreateDto = {
    name: string;
    price: number;
    discount?: number;
    categoryId?: string | null;
    description?: string;
    imageUrl?: string;
};


export type ProductUpdateDto = Partial<Product>;
