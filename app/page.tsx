"use client"; // Tambahkan ini agar aman saat passing function

import { Dashboard } from "../components/dashboard"; // Pastikan path & Huruf 'D' Besar
import type { Category, Product, Transaction } from "../types"; // Pastikan path types benar

// --- DATA DUMMY ---
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
  // Fungsi Dummy untuk menangani aksi dari Dashboard
  const handleCreatePayment = (transaction: Transaction) => {
    console.log("Memproses Pembayaran:", transaction);
    alert(`Simulasi: Pembayaran senilai Rp ${transaction.total.toLocaleString()} berhasil!`);
  };

  const handleNavigate = () => {
    console.log("Navigasi dipanggil (Halaman belum dibuat)");
    alert("Fitur navigasi ini belum tersedia di demo ini.");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Dashboard 
        products={PRODUCTS} 
        categories={CATEGORIES}
        // Props tambahan ini WAJIB ada karena Dashboard.tsx memintanya
        onCreatePayment={handleCreatePayment}
        onNavigateToHistory={handleNavigate}
        onNavigateToProducts={handleNavigate}
      />
    </main>
  );
}