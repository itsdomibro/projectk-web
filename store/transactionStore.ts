import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  voidTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, transaction],
        })),
      voidTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, status: 'void' } : t
          ),
        })),
    }),
    {
      name: 'transaction-storage', // This saves data to localStorage
    }
  )
);