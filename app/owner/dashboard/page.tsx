"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { useTransactionStore } from "@/store/transactionStore";
import { useProductStore } from "@/store/productStore";

type DateFilter = "1day" | "7days" | "1month" | "3months" | "6months" | "1year";

const filterOptions: { value: DateFilter; label: string }[] = [
  { value: "1day", label: "Hari Ini" },
  { value: "7days", label: "7 Hari" },
  { value: "1month", label: "1 Bulan" },
  { value: "3months", label: "3 Bulan" },
  { value: "6months", label: "6 Bulan" },
  { value: "1year", label: "1 Tahun" },
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
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- 1. LOGIKA RENTANG TANGGAL ---
  const getDateRange = () => {
    const now = new Date();
    // Set akhir hari ini
    const end = new Date(now); 
    end.setHours(23, 59, 59, 999);
    
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "1day":
        // start 00:00 hari ini
        break;
      case "7days":
        start.setDate(now.getDate() - 7);
        break;
      case "1month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        start.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return { start, end };
  };

  // --- 2. FILTER TRANSAKSI ---
  const filteredTransactions = transactions.filter((t) => {
    const txnDate = new Date(t.createdAt);
    const { start, end } = getDateRange();
    return txnDate >= start && txnDate <= end;
  });

  const chartTransactions = filteredTransactions; 
  
  const totalRevenue = chartTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactions = chartTransactions.length;

  // --- 3. DATA GRAFIK (LINE CHART) ---
  const getChartData = () => {
    const { start, end } = getDateRange();
    const data = [];
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // --- LOGIKA KHUSUS 1 BULAN (4 MINGGU) ---
    if (dateFilter === "1month") {
      let currentPointer = new Date(start);
      
      // Loop 4 kali untuk membagi sebulan menjadi 4 chunk
      for (let i = 0; i < 4; i++) {
         const chunkStart = new Date(currentPointer);
         let chunkEnd = new Date(currentPointer);
         
         // Jika ini chunk terakhir (ke-4), tarik sampai tanggal End sebenarnya
         // agar tidak ada hari yang tersisa/terpotong
         if (i === 3) {
             chunkEnd = new Date(end);
         } else {
             // Chunk 1-3: Interval 7 hari
             chunkEnd.setDate(chunkStart.getDate() + 6); // +6 karena inclusive start
             chunkEnd.setHours(23, 59, 59, 999);
         }

         // Format Label: "Tgl/Bln - Tgl/Bln"
         const label = `${chunkStart.getDate()}/${chunkStart.getMonth()+1} - ${chunkEnd.getDate()}/${chunkEnd.getMonth()+1}`;

         const total = chartTransactions
            .filter(t => {
                const tDate = new Date(t.createdAt);
                return tDate >= chunkStart && tDate <= chunkEnd;
            })
            .reduce((sum, t) => sum + t.totalAmount, 0);

         data.push({ label, total: total / 1000 }); // Dalam ribuan

         // Geser pointer ke hari berikutnya untuk loop selanjutnya
         currentPointer = new Date(chunkEnd);
         currentPointer.setDate(currentPointer.getDate() + 1);
         currentPointer.setHours(0,0,0,0);
      }
    } 
    // --- LOGIKA BULANAN (> 32 Hari) ---
    else if (diffDays > 32) {
      const monthsToShow = dateFilter === "3months" ? 3 : dateFilter === "6months" ? 6 : 12;
      for (let i = 0; i < monthsToShow; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (monthsToShow - 1 - i));
        
        const monthLabel = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }); 
        const monthIdx = d.getMonth();
        const yearIdx = d.getFullYear();

        const total = chartTransactions
          .filter((t) => {
            const tDate = new Date(t.createdAt);
            return tDate.getMonth() === monthIdx && tDate.getFullYear() === yearIdx;
          })
          .reduce((sum, t) => sum + t.totalAmount, 0);

        data.push({ label: monthLabel, total: total / 1000 });
      }
    } 
    // --- LOGIKA HARIAN (Default <= 32 Hari) ---
    else {
      const daysLoop = dateFilter === "1day" ? 1 : diffDays; 
      for (let i = 0; i < daysLoop; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (daysLoop - 1 - i));
        const dateStr = d.toDateString();
        const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

        const total = chartTransactions
          .filter((t) => new Date(t.createdAt).toDateString() === dateStr)
          .reduce((sum, t) => sum + t.totalAmount, 0);

        data.push({ label: label, total: total / 1000 });
      }
    }
    return data;
  };

  const chartData = getChartData();

  // --- 4. DATA PIE CHART ---
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  chartTransactions.forEach((txn) => {
    txn.details?.forEach((item: any) => {
      const pid = item.productId;
      if (!productSales[pid]) productSales[pid] = { name: item.productName || "Produk", quantity: 0, revenue: 0 };
      productSales[pid].quantity += item.quantity;
      productSales[pid].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const pieData = topProducts.map((p) => ({ name: p.name, value: p.revenue }));
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const handleGenerateAISummary = async () => {
    setIsGenerating(true);
    setTimeout(() => {
        const topProdName = topProducts[0]?.name || "Belum ada";
        const filterLabel = filterOptions.find(f => f.value === dateFilter)?.label;
        setAiSummary(`**Analisis Periode ${filterLabel}:**\nTotal omzet mencapai **${formatCurrency(totalRevenue)}** dari **${totalTransactions}** transaksi.\nProduk unggulan: **${topProdName}**.`);
        setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-10 p-6 md:p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Ringkasan performa bisnis</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm overflow-x-auto max-w-full">
            {filterOptions.map(opt => (
                <button 
                    key={opt.value} 
                    onClick={() => setDateFilter(opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${dateFilter === opt.value ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
      </div>

      {/* Cards Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Omzet</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-gray-400 mt-1">{filterOptions.find(f => f.value === dateFilter)?.label}</div>
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
            <span className="text-gray-500 text-sm">Produk Aktif</span>
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
          {/* Chart Pendapatan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-900 font-bold">Tren Pendapatan</h3>
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">ribuan (x1000)</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    // Agar label tidak bertumpuk jika terlalu banyak
                    interval={0}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(val: number) => formatCurrency(val * 1000)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{r: 4, strokeWidth: 2, fill: "#fff"}} 
                    activeDot={{r: 6}}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Produk */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-gray-900 font-bold mb-6">Distribusi Produk Terlaris</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
              {pieData.length > 0 ? (
                <div className="w-full h-full flex flex-col">
                  <div className="h-[200px] w-full">
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
                          stroke="none"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-2 custom-scrollbar max-h-[120px] w-full">
                    {topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-gray-700 font-medium truncate max-w-[140px]">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block">{product.quantity} pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Package className="w-16 h-16 opacity-20 mb-2" />
                  <p>Belum ada data penjualan</p>
                  <p className="text-xs">Coba ubah filter tanggal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
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
          <div className="prose prose-sm max-w-none bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-in fade-in">
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}