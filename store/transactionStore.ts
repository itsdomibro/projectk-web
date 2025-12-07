import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction } from "@/types";

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  voidTransaction: (transactionId: string) => void;
  deleteTransaction: (transactionId: string) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (transaction) =>
        set((state) => ({
          // Ensure we preserve existing, add new.
          // If the API doesn't send 'status', we default to 'completed' for paid items.
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              status:
                transaction.status ||
                (transaction.isPaid ? "completed" : "pending"),
            },
          ],
        })),

      voidTransaction: (transactionId) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.transactionId === transactionId ? { ...t, status: "void" } : t
          ),
        })),

      deleteTransaction: (transactionId) =>
        set((state) => ({
          transactions: state.transactions.filter(
            (t) => t.transactionId !== transactionId
          ),
        })),
    }),
    {
      name: "transaction-storage-v2", // CHANGED NAME to force clear old incompatible cache
    }
  )
);
