"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { useTransactionStore } from "@/store/transactionStore";
import type { Category, Product, Transaction } from "@/types";

// --- DATA DUMMY (Keep your existing data) ---
const CATEGORIES: Category[] = [
  { id: 'cat-makanan', name: 'Makanan', color: 'bg-orange-500' },
  { id: 'cat-minuman', name: 'Minuman', color: 'bg-blue-500' },
  { id: 'cat-snack', name: 'Snack', color: 'bg-green-500' },
  { id: 'cat-lainnya', name: 'Lainnya', color: 'bg-purple-500' },
];

const PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Nasi Goreng', price: 25000, categoryId: 'cat-makanan', stock: 50, image: 'https://images.unsplash.com/photo-1603133872878-684f1084261d?w=400&q=80' },
  { id: 'prod-2', name: 'Mie Goreng', price: 22000, categoryId: 'cat-makanan', stock: 45 },
  { id: 'prod-3', name: 'Ayam Goreng', price: 30000, categoryId: 'cat-makanan', stock: 30 },
  { id: 'prod-4', name: 'Es Teh', price: 5000, categoryId: 'cat-minuman', stock: 100 },
  { id: 'prod-5', name: 'Kopi Susu', price: 15000, categoryId: 'cat-minuman', stock: 80 },
  { id: 'prod-6', name: 'Jus Jeruk', price: 12000, categoryId: 'cat-minuman', stock: 60 },
  { id: 'prod-7', name: 'Keripik', price: 10000, categoryId: 'cat-snack', stock: 120 },
  { id: 'prod-8', name: 'Kacang', price: 8000, categoryId: 'cat-snack', stock: 150 },
];

export default function Home() {
  const router = useRouter();
  const { addTransaction } = useTransactionStore();

  const handleCreatePayment = (transaction: Transaction) => {
    // 1. Save to global store
    addTransaction({
      ...transaction,
      status: 'completed', // For hackathon demo, mark as completed immediately
      date: new Date().toISOString()
    });
    
    // 2. Show success (Optional: Replace with a Sonner toast or Payment Modal)
    alert(`Pembayaran berhasil sebesar Rp ${transaction.total.toLocaleString()}`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Dashboard 
        products={PRODUCTS} 
        categories={CATEGORIES}
        onCreatePayment={handleCreatePayment}
        onNavigateToHistory={() => router.push('/history')} // This links to the new page
        onNavigateToProducts={() => alert("Product Management Page coming soon!")}
      />
    </main>
  );
}