"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { PaymentPage } from "@/components/payment"; 
import { useTransactionStore } from "@/store/transactionStore";
import { useProductStore } from "@/store/productStore";
import type { Transaction, TransactionItem } from "@/types";

export default function CashierDashboard() {
  const router = useRouter();
  
  // Gunakan Store untuk aksi API
  const { createTransaction } = useTransactionStore();
  const { products, categories, fetchProducts, fetchCategories } = useProductStore();
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'payment'>('dashboard');
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  // Load data produk & kategori saat halaman dibuka
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handler saat kasir menekan tombol "Bayar" di Dashboard
  // Menerima items dan total, lalu membuat objek transaksi sementara
  const handleCreatePayment = (items: TransactionItem[], total: number) => {
    const tempTransaction: Transaction = {
      transactionId: `temp-${Date.now()}`,
      code: "PENDING",
      payment: "QRIS", 
      isPaid: false,
      totalAmount: total,
      createdAt: new Date().toISOString(),
      // Mapping dari keranjang ke struktur Transaction Detail
      details: items.map(i => ({
        productId: i.product.productId,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
        discount: i.product.discount || 0
      }))
    };

    setActiveTransaction(tempTransaction);
    setCurrentView('payment');
  };

  // Handler saat pembayaran sukses/selesai
  const handlePaymentSuccess = async (transaction: Transaction) => {
    if (!transaction) return;

    // Siapkan data untuk dikirim ke Backend API
    const payload = {
      payment: "QRIS", 
      items: transaction.details.map((d: any) => ({
        productId: d.productId,
        quantity: d.quantity
      }))
    };

    // Kirim ke API
    const success = await createTransaction(payload);
    
    if (success) {
      setActiveTransaction(null);
      setCurrentView('dashboard');
    } else {
      alert("Gagal menyimpan transaksi. Cek koneksi backend.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 relative">
      
      {currentView === 'dashboard' && (
        <Dashboard 
          products={products} 
          categories={categories}
          onCreatePayment={handleCreatePayment}
          onNavigateToHistory={() => router.push('/cashier/history')}
          onNavigateToOwner={() => router.push('/owner/dashboard')}
        />
      )}

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