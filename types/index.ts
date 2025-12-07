// types/index.ts

export type Product = {
  // Keep this for your Product Store/Management
  id: string; // Note: Your backend uses 'productId', might need mapping later if fetching products from API
  name: string;
  price: number;
  categoryId: string;
  stock: number;
  description?: string;
  image?: string;
};

// New Type matching the API's "details" array
export type TransactionDetail = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
};

// Updated Transaction matching the API response
export type Transaction = {
  transactionId: string; // API uses 'transactionId', not 'id'
  code: string;
  payment: string;
  isPaid: boolean;
  createdAt: string; // API uses 'createdAt', not 'date'
  totalAmount: number; // API uses 'totalAmount', not 'total'
  details: TransactionDetail[]; // API uses 'details', not 'items'

  // Optional: Keep 'status' for local logic (like voiding in UI),
  // but note the API returns 'isPaid' instead.
  status?: "pending" | "completed" | "void";
};
