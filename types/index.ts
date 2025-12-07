// types/index.ts

export type Category = {
  categoryId: string; // Backend menggunakan CategoryId (Guid)
  name: string;
  description?: string;
  // Color dihapus karena tidak ada di BE, kita generate warna di UI saja nanti
};

export type Product = {
  productId: string; // Backend menggunakan ProductId (Guid)
  name: string;
  price: number;
  discount: number;
  categoryId: string;
  categoryName?: string; // Dari DTO ProductResponseDto
  description?: string;
  imageUrl?: string;
  // Stock dihapus karena tidak ada di ERD/BE
};

export type TransactionItem = {
  product: Product;
  quantity: number;
};

export type TransactionPayload = {
  payment: string;
  items: { productId: string; quantity: number }[];
};

export type Transaction = {
  transactionId: string;
  code: string;
  payment: string;
  isPaid: boolean;
  totalAmount: number;
  createdAt: string;
  details: any[]; // Disederhanakan untuk list view
};