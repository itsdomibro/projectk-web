"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Dashboard } from "../components/dashboard";
import { PaymentPage } from "../components/payment"; 
import { useTransactionStore } from "../store/transactionStore";
import { useProductStore } from "../store/productStore";
import type { Transaction } from "../types";

export default function Home() {
  const router = useRouter();
  const { addTransaction } = useTransactionStore();
  const { products, categories, updateStock } = useProductStore();
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'payment'>('dashboard');
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  const handleCreatePayment = (transaction: Transaction) => {
    setActiveTransaction(transaction);
    setCurrentView('payment');
  };

  const handlePaymentSuccess = (transaction: Transaction) => {
    addTransaction({
      ...transaction,
      status: 'completed',
      date: new Date().toISOString()
    });
    
    const itemsToUpdate = transaction.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
    updateStock(itemsToUpdate);

    setActiveTransaction(null);
    setCurrentView('dashboard');
    alert(`Pembayaran berhasil!`);
  };

  return (
    <main className="min-h-screen bg-gray-50 relative">
      
      {currentView === 'dashboard' && (
        <Dashboard 
          products={products} 
          categories={categories}
          onCreatePayment={handleCreatePayment}
          onNavigateToHistory={() => router.push('/history')} // Tombol riwayat kasir biasa
          onNavigateToProducts={() => router.push('/products')}
        />
      )}

      {currentView === 'payment' && activeTransaction && (
        <PaymentPage 
          transaction={activeTransaction}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setCurrentView('dashboard')}
        />
      )}

      {/* --- TOMBOL MASUK KE PANEL OWNER --- */}
      <Link 
        href="/owner/dashboard" 
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-xl hover:bg-gray-800 transition-all border border-gray-700"
      >
        <span className="font-medium text-sm">Panel Owner</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </Link>

    </main>
  );
}