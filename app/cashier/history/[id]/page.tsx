// "use client";

// import { useState, useEffect, use } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   Printer,
//   Calendar,
//   CreditCard,
//   Package,
//   User,
//   Clock,
// } from "lucide-react";
// import { useTransactionStore } from "@/store/transactionStore";
// import { ImageWithFallback } from "@/components/ImageWithFallback";
// import type { Transaction } from "@/types";

// export default function CashierTransactionDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const router = useRouter();
//   const { transactions } = useTransactionStore();
//   const [transaction, setTransaction] = useState<Transaction | null>(null);

//   // Mengambil ID dari params
//   const { id } = use(params);

//   useEffect(() => {
//     if (id) {
//       const decodedId = decodeURIComponent(id);
//       const found = transactions.find((t) => t.id === decodedId);
//       setTransaction(found || null);
//     }
//   }, [id, transactions]);

//   if (!transaction) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-500">
//         <p className="mb-4">Transaksi tidak ditemukan</p>
//         <button
//           onClick={() => router.back()}
//           className="text-blue-600 hover:underline"
//         >
//           Kembali
//         </button>
//       </div>
//     );
//   }

//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat("id-ID", {
//       style: "currency",
//       currency: "IDR",
//       minimumFractionDigits: 0,
//     }).format(amount);

//   const formatDate = (dateStr: string) =>
//     new Date(dateStr).toLocaleDateString("id-ID", {
//       weekday: "long",
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     });

//   const formatTime = (dateStr: string) =>
//     new Date(dateStr).toLocaleTimeString("id-ID", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   return (
//     <div className="min-h-screen bg-gray-50 p-6 md:p-8">
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Header Navigasi */}
//         <div className="flex items-center justify-between no-print">
//           <button
//             onClick={() => router.back()}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />{" "}
//             <span className="font-medium">Kembali</span>
//           </button>
//           <button
//             onClick={() => window.print()}
//             className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
//           >
//             <Printer className="w-4 h-4" /> <span>Cetak Struk</span>
//           </button>
//         </div>

//         {/* Kartu Invoice */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0">
//           {/* Header Struk */}
//           <div className="bg-blue-600 text-white p-8 print:bg-white print:text-black print:p-0 print:border-b print:mb-6">
//             <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
//               <div>
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm print:hidden">
//                     <Package className="w-6 h-6 text-white" />
//                   </div>
//                   <h1 className="text-2xl font-bold">Toko POS</h1>
//                 </div>
//                 <p className="text-blue-100 text-sm print:text-gray-600">
//                   Bukti Pembayaran Transaksi
//                 </p>
//               </div>
//               <div className="text-right">
//                 <h2 className="text-xl font-bold mb-1">STRUK</h2>
//                 <p className="text-blue-100 font-mono text-sm print:text-gray-600 mb-4">
//                   #{transaction.id}
//                 </p>
//                 <div
//                   className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
//                     transaction.status === "completed"
//                       ? "bg-white/20 text-white print:text-black print:border print:border-black"
//                       : "bg-red-500 text-white"
//                   }`}
//                 >
//                   {transaction.status === "completed" ? "LUNAS" : "DIBATALKAN"}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Info Detail */}
//           <div className="p-8 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
//                 <Calendar className="w-3 h-3" /> Tanggal
//               </h3>
//               <p className="text-gray-900 font-medium">
//                 {formatDate(transaction.date)}
//               </p>
//               <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
//                 <Clock className="w-3 h-3" /> {formatTime(transaction.date)}
//               </div>
//             </div>
//             <div>
//               <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
//                 <User className="w-3 h-3" /> Kasir
//               </h3>
//               <p className="text-gray-900 font-medium">Cashier Mode</p>
//             </div>
//             <div>
//               <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
//                 <CreditCard className="w-3 h-3" /> Pembayaran
//               </h3>
//               <p className="text-gray-900 font-medium">QRIS / Tunai</p>
//             </div>
//           </div>

//           {/* Tabel Produk */}
//           <div className="p-8">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">
//               Rincian Barang
//             </h3>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
//                   <tr>
//                     <th className="px-4 py-3 rounded-l-lg">Produk</th>
//                     <th className="px-4 py-3 text-center">Harga</th>
//                     <th className="px-4 py-3 text-center">Qty</th>
//                     <th className="px-4 py-3 text-right rounded-r-lg">
//                       Subtotal
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {transaction.items.map((item, index) => (
//                     <tr key={index}>
//                       <td className="px-4 py-4">
//                         <div className="flex items-center gap-3">
//                           {item.product.image && (
//                             <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden shrink-0 print:hidden">
//                               <ImageWithFallback
//                                 src={item.product.image}
//                                 className="w-full h-full object-cover"
//                                 alt={item.product.name}
//                               />
//                             </div>
//                           )}
//                           <p className="font-medium text-gray-900">
//                             {item.product.name}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-4 py-4 text-center text-gray-600">
//                         {formatCurrency(item.product.price)}
//                       </td>
//                       <td className="px-4 py-4 text-center text-gray-900 font-medium">
//                         {item.quantity}
//                       </td>
//                       <td className="px-4 py-4 text-right font-bold text-gray-900">
//                         {formatCurrency(item.product.price * item.quantity)}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="mt-8 flex justify-end">
//               <div className="w-full md:w-1/3 space-y-3">
//                 <div className="flex justify-between text-gray-600 text-sm">
//                   <span>Subtotal</span>
//                   <span>{formatCurrency(transaction.total)}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600 text-sm">
//                   <span>Pajak (0%)</span>
//                   <span>Rp 0</span>
//                 </div>
//                 <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
//                   <span className="font-bold text-lg text-gray-900">Total</span>
//                   <span className="font-bold text-2xl text-blue-600 print:text-black">
//                     {formatCurrency(transaction.total)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function HistoryIdPage() {
  return;
}
