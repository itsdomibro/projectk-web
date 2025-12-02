"use client";

import { useState, useEffect } from 'react';
import { QrCode, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import type { Transaction } from '@/types'; // Pastikan path import types benar

type Props = {
  transaction: Transaction;
  onPaymentSuccess: (transaction: Transaction) => void;
  onCancel: () => void;
};

export function PaymentPage({ transaction, onPaymentSuccess, onCancel }: Props) {
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit waktu pembayaran

  // Timer mundur
  useEffect(() => {
    if (isPaid) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaid]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Simulasi Bayar
  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulasi delay jaringan 2 detik
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      // Tunggu sebentar lalu kembali ke menu utama
      setTimeout(() => {
        onPaymentSuccess(transaction);
      }, 2000);
    }, 1500);
  };

  // TAMPILAN SUKSES
  if (isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-500 mb-6">Transaksi telah tercatat di sistem.</p>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">Total Bayar</span>
              <span className="font-bold text-lg text-gray-800">{formatCurrency(transaction.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">ID Transaksi</span>
              <span className="font-mono text-xs text-gray-400">#{transaction.id.slice(-6)}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-400 animate-pulse">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  // TAMPILAN PEMBAYARAN (QRIS)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Detail Order */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <button onClick={onCancel} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition">
            <ArrowLeft className="w-5 h-5" /> Batalkan
          </button>
          
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rincian Pesanan</h2>
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start border-b border-gray-50 pb-3 last:border-0">
                <div>
                  <div className="font-medium text-gray-800">{item.product.name}</div>
                  <div className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.product.price)}</div>
                </div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Tagihan</span>
              <span className="text-blue-600">{formatCurrency(transaction.total)}</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Area Bayar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center h-fit">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan QRIS</h1>
            <p className="text-gray-500">Scan QR code di bawah untuk membayar</p>
          </div>

          {/* QR Code Placeholder */}
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 mb-6 relative group">
            <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <QrCode className="w-24 h-24 opacity-80" />
            </div>
            {/* Timer Badge */}
            <div className="absolute -top-3 -right-3 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-bold border border-orange-200 shadow-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg text-left">
              <span className="font-bold block mb-1">Panduan:</span>
              1. Buka aplikasi e-wallet / mobile banking.<br/>
              2. Scan QR code di atas.<br/>
              3. Periksa nominal dan konfirmasi pembayaran.
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                </>
              ) : (
                "Simulasi Pembayaran Berhasil"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}