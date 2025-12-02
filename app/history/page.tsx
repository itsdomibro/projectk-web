"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
  const router = useRouter();
  const { transactions, voidTransaction } = useTransactionStore();
  const [showModal, setShowModal] = useState(false);
  
  // Formatters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, txn) => {
    const date = new Date(txn.date).toLocaleDateString('id-ID');
    if (!groups[date]) groups[date] = [];
    groups[date].push(txn);
    return groups;
  }, {} as { [key: string]: Transaction[] });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 pl-0"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
              <p className="text-gray-600">
                Total Transaksi: {transactions.length}
              </p>
            </div>
            {/* Placeholder for AI Summary Button */}
            <Button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              onClick={() => alert("Fitur AI Summary dapat diimplementasikan di sini!")}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Summary
            </Button>
          </div>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Transaksi</h3>
              <p className="text-gray-500">Transaksi yang berhasil akan muncul di sini</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()) // Sort new to old
              .map(([date, txns]) => (
                <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden border">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{date}</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {txns.map((txn) => (
                      <div key={txn.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">{formatDate(txn.date)}</div>
                            <div className="text-xs text-gray-400">ID: {txn.id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 mb-1">
                              {formatCurrency(txn.total)}
                            </div>
                            {txn.status === 'void' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Dibatalkan
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Berhasil
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Transaction Items */}
                        <div className="space-y-1 mb-3">
                          {txn.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600 flex justify-between">
                              <span>{item.product.name} x {item.quantity}</span>
                              <span>{formatCurrency(item.product.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Void Button */}
                        {txn.status !== 'void' && (
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => {
                                if (confirm('Yakin ingin membatalkan transaksi ini?')) {
                                  voidTransaction(txn.id);
                                }
                              }}
                              className="text-sm text-red-600 hover:text-red-800 underline decoration-dotted"
                            >
                              Batalkan Transaksi
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}