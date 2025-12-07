"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, ShoppingCart, Package, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import ReactMarkdown from "react-markdown";
import { useTransactionStore } from "@/store/transactionStore";
import { useProductStore } from "@/store/productStore";

type DateFilter = "1day" | "7days" | "1month" | "3months" | "6months" | "1year";

const filterOptions: { value: DateFilter; label: string }[] = [
  { value: "1day", label: "Hari Ini" },
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "1month", label: "1 Bulan Terakhir" },
];

export default function OwnerDashboardPage() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { products, fetchProducts } = useProductStore();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("7days");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTransactions();
    fetchProducts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    switch (dateFilter) {
      case "1day": start.setDate(now.getDate() - 1); break;
      case "7days": start.setDate(now.getDate() - 7); break;
      case "1month": start.setMonth(now.getMonth() - 1); break;
    }
    return { start, end: now };
  };

  // --- LOGIKA DATA ---
  const filteredTransactions = transactions.filter((t) => {
    const txnDate = new Date(t.createdAt); // Pastikan field ini sesuai DTO (createdAt)
    const { start, end } = getDateRange();
    return txnDate >= start && txnDate <= end;
  });

  // PERUBAHAN: Gunakan filteredTransactions langsung agar pending juga masuk hitungan grafik
  // (Atau filter t.isPaid jika ingin strict hanya yang lunas)
  const chartTransactions = filteredTransactions; 
  
  const totalRevenue = chartTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactions = chartTransactions.length;

  // LOGIKA PRODUK TERLARIS
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  
  chartTransactions.forEach((txn) => {
    // Pastikan mapping detail sesuai API (details)
    txn.details?.forEach((item: any) => {
      const pid = item.productId;
      if (!productSales[pid]) {
        productSales[pid] = {
          name: item.productName || "Unknown Product", // Fallback name
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[pid].quantity += item.quantity;
      productSales[pid].revenue += item.price * item.quantity;
    });
  });

  // Ambil top 5
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // CHART DATA (Harian)
  const getDailySales = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toDateString();
      const dayName = date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

      const total = chartTransactions
        .filter((t) => new Date(t.createdAt).toDateString() === dateStr)
        .reduce((sum, t) => sum + t.totalAmount, 0);

      data.push({ label: dayName, total: total / 1000 }); // Dalam ribuan
    }
    return data;
  };

  const chartData = getDailySales();
  
  // Data Pie Chart (Pendapatan per Produk)
  const pieData = topProducts.map((p) => ({ name: p.name, value: p.revenue }));
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    setTimeout(() => {
        const topProdName = topProducts[0]?.name || "Belum ada";
        setAiSummary(`**Analisis Cepat:**\nTotal omzet periode ini adalah **${formatCurrency(totalRevenue)}** dari **${totalTransactions}** transaksi.\nProduk paling diminati adalah **${topProdName}**.`);
        setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10 p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Ringkasan aktivitas toko Anda (Termasuk transaksi Pending)</p>
        </div>
        <div className="flex gap-2">
            {filterOptions.map(opt => (
                <button 
                    key={opt.value} 
                    onClick={() => setDateFilter(opt.value)}
                    className={`px-3 py-1 text-xs rounded-md ${dateFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Omzet (Estimasi)</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Transaksi</span>
            <ShoppingCart className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Produk</span>
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Rata-rata Order</span>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalTransactions > 0 ? totalRevenue / totalTransactions : 0)}
          </div>
        </div>
      </div>

      {isClient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grafik Garis (Line Chart) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-gray-900 font-bold mb-6">Tren Penjualan (Ribuan IDR)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafik Lingkaran (Pie Chart) & Detail Produk */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-gray-900 font-bold mb-6">Kontribusi Produk Terlaris</h3>
            
            {topProducts.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="h-[200px] w-full flex-shrink-0">
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

                <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-3 custom-scrollbar max-h-[150px]">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-gray-700 font-medium truncate max-w-[120px]">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{product.quantity} pcs</div>
                        <div className="text-xs text-gray-500">{formatCurrency(product.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
                <Package className="w-12 h-12 opacity-20" />
                <p>Belum ada data penjualan</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm p-6 border border-purple-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="font-bold text-gray-900">AI Business Insights</h2>
          </div>
          <button onClick={handleGenerateAISummary} disabled={isGenerating} className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-all shadow-sm">
            {isGenerating ? "Menganalisis..." : "Generate Insights"}
          </button>
        </div>
        {aiSummary && (
          <div className="prose prose-sm max-w-none bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}