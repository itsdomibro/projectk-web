"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Package, MessageSquare, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { useTransactionStore } from '@/store/transactionStore'; // Import Store Transaksi
import { useProductStore } from '@/store/productStore'; // Import Store Produk

export default function OwnerDashboardPage() {
  // Ambil Data Asli dari Store
  const { transactions } = useTransactionStore();
  const { products } = useProductStore();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration error (karena Recharts butuh client side rendering)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- LOGIKA DATA REAL ---
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = completedTransactions.length;
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).length;

  // Hitung Penjualan per Produk
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  completedTransactions.forEach(txn => {
    txn.items.forEach(item => {
      if (!productSales[item.product.id]) {
        productSales[item.product.id] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.product.id].quantity += item.quantity;
      productSales[item.product.id].revenue += item.product.price * item.quantity;
    });
  });

  // Top 5 Produk
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Penjualan 7 Hari Terakhir
  const dailySales = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    
    const dayTransactions = completedTransactions.filter(t => {
      const txnDate = new Date(t.date);
      return txnDate.toDateString() === date.toDateString();
    });

    const total = dayTransactions.reduce((sum, t) => sum + t.total, 0);
    return { day: dayName, total: total / 1000 }; // Dalam ribuan (k) agar grafik rapi
  });

  // Data Pie Chart
  const pieData = topProducts.map(p => ({
    name: p.name,
    value: p.revenue,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // --- LOGIKA AI SUMMARY ---
  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulasi loading

    const summary = generateMockSummary();
    setAiSummary(summary);
    setIsGenerating(false);
  };

  const generateMockSummary = () => {
    if (completedTransactions.length === 0) {
      return `# ⚠️ Data Belum Cukup\n\nBelum ada transaksi yang tercatat hari ini. Silakan lakukan transaksi di kasir untuk melihat analisis.`;
    }

    const avgTxn = totalRevenue / completedTransactions.length;
    const bestSeller = topProducts[0];

    return `# 📊 Analisis Performa Bisnis

## Ringkasan Kinerja
- **Total Pendapatan:** ${formatCurrency(totalRevenue)}
- **Total Transaksi:** ${totalTransactions}
- **Rata-rata Keranjang:** ${formatCurrency(avgTxn)}

## 🏆 Produk Unggulan
**${bestSeller?.name || '-'}** menjadi produk terlaris dengan kontribusi pendapatan sebesar **${formatCurrency(bestSeller?.revenue || 0)}**.

## 💡 Rekomendasi Cerdas
1. **Stok Kritis:** Ada ${lowStockProducts} produk dengan stok menipis (di bawah 10). Segera lakukan restock.
2. **Strategi Penjualan:** Pertimbangkan bundling untuk produk ${bestSeller?.name} agar meningkatkan nilai transaksi rata-rata.
3. **Tren:** Penjualan hari ini ${totalRevenue > 0 ? 'menunjukkan aktivitas positif' : 'masih perlu ditingkatkan'}.

---
*Dianalisis otomatis berdasarkan data real-time.*`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600">Monitoring data real-time dari kasir</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm">
          <MessageSquare className="w-5 h-5" />
          AI Assistant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Pendapatan</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-gray-500">Total akumulasi</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Transaksi</span>
            <ShoppingCart className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">{totalTransactions}</div>
          <div className="text-sm text-gray-500">Berhasil</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Produk Aktif</span>
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">{products.length}</div>
          <div className="text-sm text-red-500 font-medium">{lowStockProducts} perlu restock</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Avg. Transaksi</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">
            {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
          </div>
          <div className="text-sm text-gray-500">Per pelanggan</div>
        </div>
      </div>

      {/* Charts Section */}
      {isClient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Tren Penjualan (7 Hari)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#888" fontSize={12} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => `Rp ${Number(value)}k`}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Produk Terlaris</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#666'}} />
                  <Tooltip 
                    formatter={(value) => `${value} terjual`}
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                  />
                  <Bar dataKey="quantity" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart & Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Kontribusi Pendapatan</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-[250px] w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="w-full md:w-1/2 space-y-3">
                {topProducts.slice(0, 4).map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-gray-700 text-sm font-medium truncate max-w-[100px]">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-bold text-sm">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-lg">AI Insights</h2>
                  <p className="text-sm text-gray-500">Analisis performa otomatis</p>
                </div>
              </div>
              <button
                onClick={handleGenerateAISummary}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-all disabled:opacity-70"
              >
                {isGenerating ? 'Menganalisis...' : 'Generate'}
              </button>
            </div>

            {isGenerating ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                <p className="text-gray-500 text-sm">AI sedang membaca data transaksi...</p>
              </div>
            ) : aiSummary ? (
              <div className="prose prose-purple prose-sm max-w-none bg-white/80 p-4 rounded-xl border border-purple-50">
                <ReactMarkdown>{aiSummary}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-purple-100 rounded-xl">
                <p className="text-gray-400 text-sm">Klik "Generate" untuk mendapatkan analisis bisnis.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}