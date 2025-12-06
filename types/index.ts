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


export type TransactionItem = {
  product: Product;
  quantity: number;
};

export type Transaction = {
  id: string;
  items: TransactionItem[];
  total: number;
  date: string;
  status: 'pending' | 'completed' | 'void';
};