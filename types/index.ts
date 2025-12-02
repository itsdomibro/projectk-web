export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  description?: string;
  image?: string;
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