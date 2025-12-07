"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Search, ArrowDownRight, DollarSign, ShoppingCart, Clock } from 'lucide-react';
import { useTransactionStore } from '@/store/transactionStore';
// Pastikan Anda mengimpor tipe Transaction yang sudah diperbarui di types/index.ts
import type { Transaction } from '@/types'; 

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, fetchTransactions, isLoading } = useTransactionStore();
  
  // Ambil data saat komponen dimuat
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Fungsi helper untuk mendapatkan format tanggal YYYY-MM-DD (Local Time)
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // State untuk Filter
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk hydration fix
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

  // --- LOGIKA FILTER ---
  const filteredTransactions = transactions.filter((txn) => {
    // 1. Filter Tanggal (createdAt)
    const txnDate = new Date(txn.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    if (start && txnDate < start) return false;
    if (end && txnDate > end) return false;
    
    // 2. Filter Pencarian (Code, Payment, atau Nama Produk)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      const matchCode = txn.code?.toLowerCase().includes(lowerTerm);
      // Cek apakah ada produk dalam detail yang namanya cocok
      const matchProduct = txn.details?.some(d => d.productName.toLowerCase().includes(lowerTerm));
      
      if (!matchCode && !matchProduct) return false;
    }

    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Hitung Statistik Ringkas
  // Backend mengirim 'IsPaid', jadi kita anggap 'completed' jika isPaid = true
  const totalRevenue = filteredTransactions
    .filter(t => t.isPaid)
    .reduce((sum, t) => sum + t.totalAmount, 0);
    
  const successCount = filteredTransactions.filter(t => t.isPaid).length;
  // Pending count menggantikan void count karena backend belum mengirim status void/deleted di list ini
  const pendingCount = filteredTransactions.filter(t => !t.isPaid).length;

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pb-10 p-6 md:p-8 w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-gray-600">
            {startDate === endDate && startDate === getTodayDate() 
              ? "Menampilkan data hari ini"
              : `Menampilkan data dari ${startDate} sampai ${endDate}`
            }
          </p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari Kode / Produk..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
           </div>
           <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
              <p className="text-gray-500 text-sm">Total Pendapatan (Lunas)</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
          </div>
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
              <p className="text-gray-500 text-sm">Transaksi Lunas</p>
              <h3 className="text-xl font-bold text-gray-900">{successCount}</h3>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ShoppingCart className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
              <p className="text-gray-500 text-sm">Belum Lunas / Pending</p>
              <h3 className="text-xl font-bold text-gray-900">{pendingCount}</h3>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Panel Filter Tanggal */}
      {showFilter && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button 
                onClick={() => { 
                  const today = getTodayDate();
                  setStartDate(today); 
                  setEndDate(today); 
                  setSearchTerm(''); 
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
                Reset ke Hari Ini
            </button>
          </div>
        </div>
      )}

      {/* Tabel Transaksi */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="p-10 text-center text-gray-500">Memuat data transaksi...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Kode Transaksi</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Detail Barang</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Clock className="w-10 h-10 text-gray-200" />
                        <p>Belum ada transaksi pada periode ini.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr 
                      key={txn.transactionId} 
                      onClick={() => router.push(`/owner/transactions/${txn.transactionId}`)}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-gray-500 group-hover:text-blue-600 transition-colors">
                        {txn.code}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatDate(txn.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {/* Mapping details dari DTO baru */}
                          {txn.details?.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-gray-600">
                              {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                            </span>
                          ))}
                          {txn.details && txn.details.length > 2 && (
                            <span className="text-xs text-gray-400 italic">
                              ...dan {txn.details.length - 2} lainnya
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 capitalize">
                        {txn.payment}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(txn.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          txn.isPaid
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {txn.isPaid ? 'Lunas' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}