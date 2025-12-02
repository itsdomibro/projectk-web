"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "../components/dashboard";
import { useTransactionStore } from "../store/transactionStore";
import type { Category, Product, Transaction } from "../types";
import { useProductStore } from "../store/productStore"; // Import Store


export default function Home() {
  const router = useRouter();
  const { addTransaction } = useTransactionStore();
  const { products, categories, updateStock } = useProductStore();


  // 1. Fungsi saat tombol "Konfirmasi Transaksi" diklik di Dashboard
  const handleCreatePayment = (transaction: Transaction) => {
    // 1. Save to global store
    addTransaction({
      ...transaction,
      status: 'completed', // For hackathon demo, mark as completed immediately
      date: new Date().toISOString()
    });
    
    // 2. Show success (Optional: Replace with a Sonner toast or Payment Modal)
    alert(`Pembayaran berhasil sebesar Rp ${transaction.total.toLocaleString()}`);
   console.log("Processing Payment:", transaction);
    
    // Update the global stock based on transaction items
    const itemsToUpdate = transaction.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
    updateStock(itemsToUpdate);

    alert(`Simulasi: Pembayaran senilai Rp ${transaction.total.toLocaleString()} berhasil! Stok telah dikurangi.`);
  };

  const handleNavigateToProducts = () => {
    router.push("/products"); // Pindah ke halaman /products
  };

  const handleNavigateToHistory = () => {
    console.log("Navigasi dipanggil (Halaman belum dibuat)");
    alert("Fitur navigasi ini belum tersedia di demo ini.");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Dashboard 
        products={products} 
        categories={categories}
        onCreatePayment={handleCreatePayment}
        onNavigateToHistory={handleNavigateToHistory}
        onNavigateToProducts={handleNavigateToProducts}
      />
    </main>
  );
}