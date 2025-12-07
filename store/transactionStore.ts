import { create } from 'zustand';
import api from '@/services/api';
import { Transaction, TransactionPayload } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  
  fetchTransactions: () => Promise<void>;
  createTransaction: (payload: TransactionPayload) => Promise<boolean>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/transactions');
      set({ transactions: res.data });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createTransaction: async (payload: TransactionPayload) => {
    set({ isLoading: true });
    try {
      // Kirim format { payment: "QRIS", items: [{ productId: "...", quantity: 1 }] }
      await api.post('/transactions', payload);
      
      // Refresh list transaksi setelah sukses
      const res = await api.get('/transactions');
      set({ transactions: res.data });
      return true;
    } catch (error) {
      console.error("Failed to create transaction:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));