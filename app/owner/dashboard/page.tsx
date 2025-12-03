"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Package, MessageSquare, Sparkles, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { useTransactionStore } from '@/store/transactionStore';
import { useProductStore } from '@/store/productStore';

type DateFilter = '1day' | '7days' | '1month' | '3months' | '6months' | '1year';

const filterOptions: { value: DateFilter; label: string }[] = [
  { value: '1day', label: 'Hari Ini' },
  { value: '7days', label: '7 Hari' },
  { value: '1month', label: '1 Bulan' },
  { value: '3months', label: '3 Bulan' },
  { value: '6months', label: '6 Bulan' },
  { value: '1year', label: '1 Tahun' },
];

export default function OwnerDashboardPage() {
  const { transactions } = useTransactionStore();
  const { products } = useProductStore();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7days');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- LOGIKA TANGGAL & FILTER ---
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    switch (dateFilter) {
      case '1day': start.setDate(now.getDate() - 1); break;
      case '7days': start.setDate(now.getDate() - 7); break;
      case '1month': start.setMonth(now.getMonth() - 1); break;
      case '3months': start.setMonth(now.getMonth() - 3); break;
      case '6months': start.setMonth(now.getMonth() - 6); break;
      case '1year': start.setFullYear(now.getFullYear() - 1); break;
    }
    return { start, end: now };
  };

  const filterTransactionsByDate = () => {
    const { start, end } = getDateRange();
    return transactions.filter(t => {
      const txnDate = new Date(t.date);
      return txnDate >= start && txnDate <= end;
    });
  };

  // --- PERHITUNGAN DATA ---
  const filteredTransactions = filterTransactionsByDate();
  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = completedTransactions.length;
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).length;

  // SALES BY PRODUCT
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  completedTransactions.forEach(txn => {
    txn.items.forEach(item => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = { name: item.product.name, quantity: 0, revenue: 0 };
      }
      productSales[item.product.id].quantity += item.quantity;
      productSales[item.product.id].revenue += item.product.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity) // Sort berdasarkan quantity
    .reverse() // Terbanyak di kiri
    .slice(0, 5); // Ambil Max 5

  // --- LOGIKA GRAFIK PENJUALAN ---
  const getDailySales = () => {
    const { start, end } = getDateRange();
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let dataPoints = 7;
    let groupBy: 'day' | 'week' | 'month' = 'day';
    
    if (daysDiff <= 7) {
      dataPoints = Math.max(daysDiff, 7);
      groupBy = 'day';
    } else if (daysDiff <= 90) {
      dataPoints = Math.ceil(daysDiff / 7);
      groupBy = 'week';
    } else {
      dataPoints = Math.ceil(daysDiff / 30);
      groupBy = 'month';
    }

    const data = [];
    
    if (groupBy === 'day') {
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (dataPoints - 1 - i));
        const dayName = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const dateStr = date.toDateString();
        
        const total = completedTransactions
          .filter(t => new Date(t.date).toDateString() === dateStr)
          .reduce((sum, t) => sum + t.total, 0);
        
        data.push({ label: dayName, total: total / 1000 }); // Dalam Ribuan
      }
    } else if (groupBy === 'week') {
      for (let i = 0; i < dataPoints; i++) {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - (i * 7));
        const startOfWeek = new Date(endOfWeek);
        startOfWeek.setDate(startOfWeek.getDate() - 6);
        
        const weekLabel = `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
        const weekTransactions = completedTransactions.filter(t => {
          const txnDate = new Date(t.date);
          return txnDate >= startOfWeek && txnDate <= endOfWeek;
        });
        const total = weekTransactions.reduce((sum, t) => sum + t.total, 0);
        data.unshift({ label: weekLabel, total: total / 1000 });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        // HANYA BULAN (Tanpa Tanggal) untuk filter bulanan/tahunan
        const monthLabel = date.toLocaleDateString('id-ID', { month: 'short' });
        const monthIdx = date.getMonth();
        const year = date.getFullYear();

        const total = completedTransactions
          .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === monthIdx && d.getFullYear() === year;
          })
          .reduce((sum, t) => sum + t.total, 0);
        
        data.push({ label: monthLabel, total: total / 1000 });
      }
    }
    return data;
  };

  const chartData = getDailySales();
  const pieData = topProducts.map(p => ({ name: p.name, value: p.revenue }));
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const summary = `# 📊 Analisis Bisnis (${filterOptions.find(f => f.value === dateFilter)?.label})\n\n**Ringkasan:**\nTotal pendapatan mencapai **${formatCurrency(totalRevenue)}** dari **${totalTransactions}** transaksi.\n\n**Top Produk:**\n${topProducts.map((p, i) => `${i+1}. ${p.name} (${p.quantity} terjual)`).join('\n')}\n\n**Rekomendasi:**\nPastikan stok untuk produk terlaris selalu tersedia.`;
    
    setAiSummary(summary);
    setIsGenerating(false);
  };

  const getPeriodLabel = () => filterOptions.find(f => f.value === dateFilter)?.label || '';

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600">Monitoring performa bisnis Anda</p>
        </div>
        <div className="flex items-center gap-3">
           {/* FILTER TANGGAL */}
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1 overflow-x-auto max-w-full">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDateFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    dateFilter === opt.value 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Pendapatan</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Transaksi</span>
            <ShoppingCart className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Produk</span>
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
          <div className="text-xs text-red-500 font-medium mt-1">{lowStockProducts} stok tipis</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Rata-rata</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
          </div>
        </div>
      </div>

      {/* Charts */}
      {isClient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: PENJUALAN (Line) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Tren Penjualan</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}k`} />
                  <Tooltip formatter={(val: number) => `Rp ${val * 1000}`} />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{r:4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: TOP PRODUK (Bar - VERTIKAL & DINAMIS) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Top 5 Produk (Unit Terjual)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}> 
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(val) => `${val} unit`} cursor={{fill: '#f8f9fa'}} contentStyle={{ borderRadius: '8px' }} />
                  
                  {/* PERBAIKAN UTAMA DISINI: */}
                  {/* maxBarSize membuat bar membesar jika item sedikit, tapi tidak berlebihan */}
                  <Bar 
                    dataKey="quantity" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={100} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 3: PIE CHART (Full Circle) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Distribusi Pendapatan</h3>
            <div className="flex flex-col md:flex-row items-center">
              <div className="h-[250px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0} 
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{borderRadius: '8px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="w-full md:w-1/2 space-y-3 pl-4">
                {topProducts.slice(0, 5).map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-gray-600 truncate max-w-[120px]">{product.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Quick Stats (List) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Detail Penjualan</h3>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
              {topProducts.length > 0 ? (
                topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-gray-700 font-medium">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-bold">{product.quantity} unit</div>
                      <div className="text-xs text-gray-500">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">Belum ada data penjualan</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI INSIGHTS */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm p-6 border border-purple-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900">AI Business Insights</h2>
          </div>
          <button 
            onClick={handleGenerateAISummary} 
            disabled={isGenerating} 
            className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
          >
            {isGenerating ? 'Menganalisis...' : 'Generate Insights'}
          </button>
        </div>
        
        {aiSummary ? (
          <div className="prose prose-sm max-w-none bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-purple-100 rounded-xl bg-white/50">
            <Sparkles className="w-12 h-12 text-purple-200 mx-auto mb-3" />
            <p className="text-gray-500">Klik tombol di atas untuk mendapatkan analisis otomatis.</p>
          </div>
        )}
      </div>
    </div>
  );
}