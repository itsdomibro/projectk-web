"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { Transaction } from '@/types';

type Props = {
  transaction: Transaction;
  onPaymentSuccess: (transaction: Transaction) => void;
  onCancel: () => void;
};

export function PaymentPage({ transaction, onPaymentSuccess, onCancel }: Props) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');
  const [countdown, setCountdown] = useState(3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('processing');
    // Simulasi delay
    setTimeout(() => {
      setPaymentStatus('success');
    }, 1500);
  };

  // Auto redirect setelah sukses
  useEffect(() => {
    if (paymentStatus === 'success') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onPaymentSuccess(transaction);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentStatus, onPaymentSuccess, transaction]);

  // TAMPILAN SUKSES (Mirip Testing2)
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
            <p className="text-gray-600">Transaksi telah diselesaikan.</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
            <div className="text-sm text-gray-600 mb-1">Total Pembayaran</div>
            <div className="text-xl font-bold text-green-700">{formatCurrency(transaction.total)}</div>
            <div className="text-xs text-gray-400 mt-1 font-mono">#{transaction.id}</div>
          </div>

          <div className="text-sm text-gray-500 mb-6">
            Kembali ke kasir dalam <span className="font-bold text-gray-900">{countdown}</span> detik...
          </div>

          <button
            onClick={() => onPaymentSuccess(transaction)}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            Selesai Sekarang
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN QRIS
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-5xl w-full">
        {/* Tombol Kembali */}
        <div className="mb-6 flex justify-start">
          <button 
            onClick={onCancel} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Kembali ke Kasir</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* KOLOM KIRI: Scan QR */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center h-full">
            <h2 className="text-gray-800 font-bold text-lg mb-8">Scan untuk Membayar</h2>
            
            <div className="bg-white p-4 border-2 border-blue-100 rounded-3xl mb-8 shadow-sm">
              <QRCode
                value={`PAYMENT:${transaction.id}:${transaction.total}`}
                size={220}
                level="H"
                className="w-full h-auto"
              />
            </div>

            <div className="space-y-1 mb-8 w-full">
              <p className="text-gray-500 text-sm">Total Pembayaran</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(transaction.total)}</p>
              <p className="text-xs text-gray-400 mt-2 font-mono select-all">ID: {transaction.id}</p>
            </div>

            <div className="w-full space-y-3 mt-auto">
              <div className={`w-full py-3 rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                paymentStatus === 'processing' 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}>
                {paymentStatus === 'processing' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses pembayaran...</>
                ) : (
                  'Menunggu pembayaran...'
                )}
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={paymentStatus !== 'pending'}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-blue-100"
              >
                Simulasi Pembayaran Berhasil
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: Detail Pesanan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full flex flex-col">
            <h3 className="text-gray-800 font-bold text-lg mb-6">Detail Pesanan</h3>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-4 mb-6 custom-scrollbar">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm group border-b border-gray-50 pb-3 last:border-0">
                  <div>
                    <div className="text-gray-900 font-medium">{item.product.name}</div>
                    <div className="text-gray-500 mt-1 text-xs">{formatCurrency(item.product.price)} x {item.quantity}</div>
                  </div>
                  <div className="text-gray-900 font-semibold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Pajak (0%)</span>
                <span>Rp 0</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 mb-6">
              <span className="text-gray-800 font-bold">Total</span>
              <span className="text-gray-900 font-extrabold text-xl">{formatCurrency(transaction.total)}</span>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-800 text-xs font-bold mb-2 uppercase tracking-wide">Panduan Pembayaran</p>
              <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
                <li>Buka aplikasi e-wallet atau mobile banking Anda.</li>
                <li>Scan QR code yang tertera di samping.</li>
                <li>Periksa nominal pembayaran dan konfirmasi.</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}