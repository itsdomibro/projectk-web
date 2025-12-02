"use client";

import { useState } from 'react';
import { Dashboard } from "../components/dashboard"; 
import { PaymentPage } from "../components/payment";
import type { Category, Product, Transaction } from "../types";

// --- DATA DUMMY ---
const CATEGORIES: Category[] = [
  { id: 'cat-makanan', name: 'Makanan', color: 'bg-orange-500' },
  { id: 'cat-minuman', name: 'Minuman', color: 'bg-blue-500' },
  { id: 'cat-snack', name: 'Snack', color: 'bg-green-500' },
  { id: 'cat-lainnya', name: 'Lainnya', color: 'bg-purple-500' },
];

const INITIAL_PRODUCTS: Product[] = [
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
  // State untuk Data Produk (Supaya stok bisa berkurang)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  // State Navigasi Halaman
  const [currentView, setCurrentView] = useState<'dashboard' | 'payment'>('dashboard');
  
  // State Transaksi yang sedang diproses
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  // 1. Fungsi saat tombol "Konfirmasi Transaksi" diklik di Dashboard
  const handleCreatePayment = (transaction: Transaction) => {
    setActiveTransaction(transaction); // Simpan data transaksi
    setCurrentView('payment'); // Pindah ke halaman pembayaran
  };

  // 2. Fungsi saat Pembayaran Berhasil
  const handlePaymentSuccess = (transaction: Transaction) => {
    // Kurangi Stok Produk
    setProducts(prevProducts => prevProducts.map(p => {
      const itemInCart = transaction.items.find(item => item.product.id === p.id);
      if (itemInCart) {
        return { ...p, stock: p.stock - itemInCart.quantity };
      }
      return p;
    }));

    alert("Transaksi Selesai! Stok telah diperbarui.");
    setActiveTransaction(null);
    setCurrentView('dashboard'); // Kembali ke Dashboard
  };

  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* TAMPILAN DASHBOARD */}
      {currentView === 'dashboard' && (
        <Dashboard 
          products={products} 
          categories={CATEGORIES}
          onCreatePayment={handleCreatePayment}
          onNavigateToHistory={() => console.log("Ke Riwayat")}
          onNavigateToProducts={() => console.log("Ke Produk")}
        />
      )}

      {/* TAMPILAN PAYMENT (Muncul jika currentView === 'payment') */}
      {currentView === 'payment' && activeTransaction && (
        <PaymentPage 
          transaction={activeTransaction}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setCurrentView('dashboard')}
        />
      )}

    </main>
  );
}