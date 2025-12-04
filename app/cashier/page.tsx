"use client";

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { PaymentPage } from "@/components/payment"; 
import { useTransactionStore } from "@/store/transactionStore";
import { useProductStore } from "@/store/productStore";
import type { Transaction } from "@/types";

export default function CashierDashboard() {
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
  };

  return (
    <main className="min-h-screen bg-gray-50 relative">
      
      {currentView === 'dashboard' && (
        <Dashboard 
          products={products} 
          categories={categories}
          onCreatePayment={handleCreatePayment}
          onNavigateToHistory={() => router.push('/cashier/history')}
          onNavigateToProducts={() => router.push('/owner/products')}
          // Passing fungsi navigasi owner ke Dashboard component
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