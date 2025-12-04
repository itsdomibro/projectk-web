"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowDownRight, ShoppingCart, Clock, ArrowLeft } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';

export default function CashierHistoryPage() {
  const router = useRouter();
  const { transactions } = useTransactionStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTodayDate = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString();
  };

  const filteredTransactions = transactions.filter(txn => {
    const txnDate = new Date(txn.date).toDateString();
    const today = getTodayDate();

    if (txnDate !== today) return false;
    if (searchTerm && !txn.id.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Hapus variabel totalRevenue
  const successCount = filteredTransactions.filter(t => t.status === 'completed').length;
  const voidCount = filteredTransactions.filter(t => t.status === 'void').length;

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pb-10 p-4 md:p-6 max-w-7xl mx-auto">
      {/* TOMBOL KEMBALI KE KASIR UTAMA */}
      <button 
        onClick={() => router.push('/cashier')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors group"
      >
        <div className="p-1 rounded-full group-hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-medium">Kembali ke Kasir</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Hari Ini</h1>
          <p className="text-gray-600">Pantau transaksi yang masuk hari ini</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari ID Transaksi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* Stats Cards - HANYA 2 KARTU (OMZET DIHAPUS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-gray-500 text-sm">Berhasil</p>
              <h3 className="text-xl font-bold text-gray-900">{successCount}</h3>
           </div>
           <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ShoppingCart className="w-5 h-5" />
           </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-gray-500 text-sm">Dibatalkan</p>
              <h3 className="text-xl font-bold text-gray-900">{voidCount}</h3>
           </div>
           <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <ArrowDownRight className="w-5 h-5" />
           </div>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Detail Barang</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Clock className="w-10 h-10 text-gray-200" />
                       <p>Belum ada transaksi hari ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr 
                    key={txn.id} 
                    onClick={() => router.push(`/cashier/history/${txn.id}`)}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-gray-500 group-hover:text-blue-600 transition-colors">#{txn.id.slice(-6)}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(txn.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {txn.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="text-gray-600">{item.product.name} <span className="text-gray-400">x{item.quantity}</span></span>
                        ))}
                        {txn.items.length > 2 && <span className="text-xs text-gray-400 italic">...dan {txn.items.length - 2} lainnya</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(txn.total)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${txn.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {txn.status === 'completed' ? 'Berhasil' : 'Dibatalkan'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}