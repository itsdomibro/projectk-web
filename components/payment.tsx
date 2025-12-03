"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code'; // Menggunakan library dari referensi Testing2
import type { Transaction } from '@/types';

type Props = {
  transaction: Transaction;
  onPaymentSuccess: (transaction: Transaction) => void;
  onCancel: () => void;
};

export function PaymentPage({ transaction, onPaymentSuccess, onCancel }: Props) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success'>('pending');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSimulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      // Otomatis selesai setelah sukses
      setTimeout(() => {
        onPaymentSuccess(transaction);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      {/* Header Back Button */}
      <div className="max-w-5xl mx-auto w-full mb-6">
        <button 
          onClick={onCancel} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali ke Kasir</span>
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* KIRI: QR Code Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center h-fit">
            <h2 className="text-gray-700 text-lg font-medium mb-6">Scan untuk Membayar</h2>
            
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 mb-6">
              <QRCode
                value={`PAYMENT:${transaction.id}:${transaction.total}`}
                size={220}
                level="H"
              />
            </div>

            <div className="space-y-1 mb-8">
              <p className="text-gray-500 text-sm">Total Pembayaran</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(transaction.total)}</p>
              <p className="text-xs text-gray-400 mt-2 font-mono">ID: {transaction.id}</p>
            </div>

            {/* Status Button (Static/Disabled Look) */}
            <div className="w-full space-y-3">
              <div className="w-full py-3 bg-gray-50 text-gray-500 rounded-lg text-sm font-medium border border-gray-100">
                {paymentStatus === 'processing' ? 'Memproses...' : 'Menunggu pembayaran'}
              </div>

              {/* Action Button */}
              <button
                onClick={handleSimulatePayment}
                disabled={paymentStatus !== 'pending'}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                Simulasi Pembayaran Berhasil
              </button>
            </div>
          </div>

          {/* KANAN: Detail Pesanan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-fit">
            <h3 className="text-gray-700 text-lg font-medium mb-6">Detail Pesanan</h3>
            
            <div className="space-y-4 mb-6">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div>
                    <div className="text-gray-800 font-medium">{item.product.name}</div>
                    <div className="text-gray-500">{formatCurrency(item.product.price)} x {item.quantity}</div>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 my-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(transaction.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Pajak</span>
                <span>Rp 0</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 pb-6 border-b border-gray-100">
              <span className="text-gray-800 font-medium">Total</span>
              <span className="text-gray-900 font-bold text-lg">{formatCurrency(transaction.total)}</span>
            </div>

            {/* Tips Section */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 text-sm font-medium mb-2">Tips Pembayaran:</p>
              <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                <li>Scan QR code menggunakan aplikasi e-wallet</li>
                <li>Pastikan jumlah pembayaran sesuai</li>
                <li>Konfirmasi akan otomatis muncul setelah pembayaran</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}