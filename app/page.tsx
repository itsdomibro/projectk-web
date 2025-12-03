"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Package, MessageSquare, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import type { Transaction, Product } from '@/types'; 



// --- DUMMY DATA (Agar Tampilan Sama Persis) ---
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Nasi Goreng', price: 25000, categoryId: '1', stock: 50 },
  { id: '2', name: 'Mie Goreng', price: 22000, categoryId: '1', stock: 8 }, // Low stock
  { id: '3', name: 'Es Teh', price: 5000, categoryId: '2', stock: 100 },
  { id: '4', name: 'Kopi Susu', price: 18000, categoryId: '2', stock: 40 },
  { id: '5', name: 'Ayam Bakar', price: 30000, categoryId: '1', stock: 5 }, // Low stock
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: new Date().toISOString(), status: 'completed', total: 50000, items: [{ product: MOCK_PRODUCTS[0], quantity: 2 }] },
  { id: 't2', date: new Date().toISOString(), status: 'completed', total: 22000, items: [{ product: MOCK_PRODUCTS[1], quantity: 1 }] },
  { id: 't3', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed', total: 100000, items: [{ product: MOCK_PRODUCTS[0], quantity: 4 }] }, // Yesterday
  { id: 't4', date: new Date(Date.now() - 172800000).toISOString(), status: 'completed', total: 75000, items: [{ product: MOCK_PRODUCTS[0], quantity: 3 }] }, // 2 days ago
];
// ----------------------------------------------

export default function OwnerDashboardPage() {
  // State
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration error for charts
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

  // Calculate metrics logic from Testing (1)
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = completedTransactions.length;
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).length;

  // Sales by product
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

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Sales by day (last 7 days)
  const dailySales = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    const dayTransactions = completedTransactions.filter(t => {
      const txnDate = new Date(t.date);
      return txnDate.toDateString() === date.toDateString();
    });
    const total = dayTransactions.reduce((sum, t) => sum + t.total, 0);
    return { day: dayName, total: total / 1000 }; // in thousands
  });

  // Pie chart data
  const pieData = topProducts.map(p => ({
    name: p.name,
    value: p.revenue,
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading

    const summary = generateMockSummary(completedTransactions, products);
    setAiSummary(summary);
    setIsGenerating(false);
  };

  const generateMockSummary = (txns: Transaction[], prods: Product[]) => {
    if (txns.length === 0) return `# Data Belum Cukup`;
    
    const totalRev = txns.reduce((sum, t) => sum + t.total, 0);
    const avgTxn = totalRev / txns.length;
    const bestSeller = topProducts[0];

    return `# 📊 Ringkasan Analisis Bisnis

## Performa Hari Ini
Total transaksi berhasil: **${txns.length}**
Pendapatan: **${formatCurrency(totalRev)}**
Rata-rata per transaksi: **${formatCurrency(avgTxn)}**

## 🏆 Produk Terlaris
**${bestSeller?.name || 'N/A'}** mendominasi penjualan dengan:
- ${bestSeller?.quantity || 0} unit terjual
- Kontribusi pendapatan: ${formatCurrency(bestSeller?.revenue || 0)}

## 💡 Insight & Rekomendasi
### Strengths
- Transaksi berjalan lancar dengan rata-rata nilai ${formatCurrency(avgTxn)}
- ${bestSeller?.name || 'Produk top'} menunjukkan demand tinggi

### Action Items
- ⚠️ ${lowStockProducts} produk stok menipis - segera restock
- 🎯 Promosikan produk dengan penjualan rendah

---
*Dihasilkan oleh AI Analytics pada ${new Date().toLocaleString('id-ID')}*`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitoring performa toko secara real-time</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <MessageSquare className="w-5 h-5" />
          AI Assistant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Pendapatan</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
          <div className="text-sm text-green-600 font-medium">+12% dari kemarin</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Transaksi</span>
            <ShoppingCart className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">{totalTransactions}</div>
          <div className="text-sm text-green-600 font-medium">Transaksi berhasil</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Produk</span>
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">{products.length}</div>
          <div className="text-sm text-gray-500">{lowStockProducts} stok menipis</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Avg. Transaksi</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-gray-900 text-2xl font-bold mb-1">
            {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
          </div>
          <div className="text-sm text-gray-500">Per transaksi</div>
        </div>
      </div>

      {/* Charts Section */}
      {isClient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Sales Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-4">Penjualan 7 Hari Terakhir</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    formatter={(value) => `Rp ${Number(value)}k`}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-4">Top 5 Produk Terlaris</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value) => `${value} unit`}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="quantity" fill="#10B981" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-4">Distribusi Pendapatan Produk</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
          </div>

          {/* Quick Stats List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-gray-700 font-medium">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 font-bold">{product.quantity} unit</div>
                    <div className="text-xs text-gray-500">{formatCurrency(product.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-lg">AI Business Insights</h2>
              <p className="text-sm text-gray-500">Analisis cerdas untuk performa toko Anda</p>
            </div>
          </div>
          <button
            onClick={handleGenerateAISummary}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-70 font-medium"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Menganalisis...' : 'Generate Insights'}
          </button>
        </div>

        {isGenerating ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-gray-600 font-medium">AI sedang mempelajari data transaksi Anda...</p>
          </div>
        ) : aiSummary ? (
          <div className="prose prose-purple prose-sm max-w-none bg-gray-50 p-6 rounded-xl border border-gray-100">
            <ReactMarkdown>
              {aiSummary}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">Belum ada insight yang dibuat.</p>
            <p className="text-sm text-gray-400">Klik tombol di atas untuk meminta AI menganalisis data Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
}