"use client"; // Tambahkan ini agar aman saat passing function

import { useRouter } from "next/navigation";
import { Dashboard } from "../components/dashboard"; // Pastikan path & Huruf 'D' Besar
import type { Category, Product, Transaction } from "../types"; // Pastikan path types benar
import { useProductStore } from "@/store/productStore"; // Import Store

export default function Home() {
  const router = useRouter();
  // Use data from the global store
  const { products, categories, updateStock } = useProductStore();

  // Fungsi Dummy untuk menangani aksi dari Dashboard
  const handleCreatePayment = (transaction: Transaction) => {
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
        // Props tambahan ini WAJIB ada karena Dashboard.tsx memintanya
        onCreatePayment={handleCreatePayment}
        onNavigateToHistory={handleNavigateToHistory}
        onNavigateToProducts={handleNavigateToProducts}
      />
    </main>
  );
}