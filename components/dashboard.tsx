"use client";

import { useState } from 'react';
import { ShoppingCart, History, Plus, Minus, Trash2, Search, Package, ArrowLeft, Clock, Save, X } from 'lucide-react';
import type { Product, Category, TransactionItem, Transaction } from '@/types'; 
import { ImageWithFallback } from './ImageWithFallback';

type Props = {
  products: Product[];
  categories: Category[];
  onCreatePayment: (transaction: Transaction) => void;
  onNavigateToHistory: () => void;
  onNavigateToProducts: () => void;
};

type HeldTransaction = {
  id: string;
  items: TransactionItem[];
  total: number;
  timestamp: number;
};

export function Dashboard({ products, categories, onCreatePayment, onNavigateToHistory, onNavigateToProducts }: Props) {
  // --- STATE ---
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State untuk Transaksi Tertahan (Hold)
  const [heldTransactions, setHeldTransactions] = useState<HeldTransaction[]>([]);
  const [showHeldModal, setShowHeldModal] = useState(false);

  // --- LOGIC CART ---
  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) return;
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item; // Minimal 1
        if (newQty > item.product.stock) return item; // Maksimal stok
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateTotal = (items: TransactionItem[]) => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  // --- LOGIC HOLD & PAYMENT ---
  const handleHoldTransaction = () => {
    if (cartItems.length === 0) return;
    const newHeld: HeldTransaction = {
      id: `hold-${Date.now()}`,
      items: [...cartItems],
      total: calculateTotal(cartItems),
      timestamp: Date.now(),
    };
    setHeldTransactions(prev => [...prev, newHeld]);
    setCartItems([]); // Kosongkan keranjang
    // alert("Transaksi berhasil ditahan!");
  };

  const handleRestoreHeld = (heldId: string) => {
    const held = heldTransactions.find(h => h.id === heldId);
    if (held) {
      setCartItems(held.items); // Kembalikan ke keranjang
      setHeldTransactions(prev => prev.filter(h => h.id !== heldId)); // Hapus dari daftar hold
      setShowHeldModal(false);
    }
  };

  const handleDeleteHeld = (heldId: string) => {
    setHeldTransactions(prev => prev.filter(h => h.id !== heldId));
  };

  const handleConfirmPayment = () => {
    if (cartItems.length === 0) return;
    onCreatePayment({
      id: `txn-${Date.now()}`,
      items: cartItems,
      total: calculateTotal(cartItems),
      date: new Date().toISOString(),
      status: 'pending',
    });
    setCartItems([]);
  };

  // --- FORMATTERS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Filter produk
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : false;
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 font-sans text-gray-800">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Kasir</h1>
          <p className="text-gray-500">Buat transaksi baru untuk pelanggan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onNavigateToProducts} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition">
            <Package className="w-4 h-4" /> Kelola Produk
          </button>
          <button onClick={onNavigateToHistory} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <History className="w-4 h-4" /> Riwayat
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- AREA KIRI: PRODUK --- */}
        <div className="flex-1">
          {/* Navigasi Kategori / Search */}
          {!selectedCategory ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Kategori</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const productCount = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="group relative overflow-hidden bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all text-left"
                    >
                      {/* Dekorasi Bulat di Pojok Kanan Atas */}
                      <div className={`absolute top-0 right-0 w-24 h-24 ${cat.color} opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform`}></div>
                      
                      <div className="relative">
                        {/* Ikon dalam kotak warna */}
                        <div className={`w-12 h-12 ${cat.color} rounded-lg flex items-center justify-center mb-4 shadow-sm`}>
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="text-gray-900 font-bold text-lg mb-1">{cat.name}</div>
                        <div className="text-sm text-gray-500">{productCount} produk tersedia</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center">
                <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="text-gray-500 hover:text-gray-900 flex items-center gap-1">
                  <ArrowLeft className="w-5 h-5" /> Kembali
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Cari produk..." 
                    className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid Produk */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">Produk tidak ditemukan</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id} 
                        onClick={() => handleAddProduct(product)}
                        disabled={product.stock <= 0}
                        className={`group relative bg-white border border-gray-200 rounded-xl overflow-hidden transition-all text-left hover:border-blue-400 hover:shadow-md ${product.stock <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                          {product.image ? (
                            <ImageWithFallback src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-10 h-10" /></div>
                          )}
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">HABIS</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <div className="text-gray-900 font-medium truncate mb-1">{product.name}</div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-600 font-bold">{formatCurrency(product.price)}</span>
                            <span className="text-xs text-gray-500">{product.stock} stok</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- AREA KANAN: KERANJANG (CART) --- */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-100px)] sticky top-4">
            
            {/* Cart Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Keranjang
              </h2>
              {/* Tombol Indikator Transaksi Tertahan */}
              {heldTransactions.length > 0 && (
                <button 
                  onClick={() => setShowHeldModal(true)}
                  className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-orange-200 transition"
                >
                  <Clock className="w-3 h-3" /> {heldTransactions.length}
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                  <p>Keranjang kosong</p>
                  <p className="text-xs text-gray-400 mt-1">Pilih kategori & produk untuk memulai</p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.product.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 hover:border-blue-200 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.product.price)}</p>
                      </div>
                      <button onClick={() => handleRemoveItem(item.product.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                        <button onClick={() => handleUpdateQty(item.product.id, -1)} className="hover:bg-gray-100 rounded p-0.5 text-gray-600"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm font-bold w-4 text-center text-gray-900">{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item.product.id, 1)} className="hover:bg-gray-100 rounded p-0.5 text-gray-600"><Plus className="w-3 h-3" /></button>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer (HANYA MUNCUL JIKA ADA ITEM) */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-gray-50 border-t rounded-b-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(calculateTotal(cartItems))}</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleHoldTransaction}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Tahan Transaksi
                  </button>
                  <button 
                    onClick={handleConfirmPayment}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                  >
                    Konfirmasi Transaksi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL TRANSAKSI TERTAHAN --- */}
      {showHeldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">Daftar Transaksi Tertahan</h3>
              <button onClick={() => setShowHeldModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {heldTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Tidak ada transaksi yang ditahan.</p>
                </div>
              ) : (
                heldTransactions.map(held => (
                  <div key={held.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 hover:border-blue-300 transition bg-white">
                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                      <span>{new Date(held.timestamp).toLocaleTimeString('id-ID')}</span>
                      <span className="font-mono">#{held.id.slice(-4)}</span>
                    </div>
                    <div className="text-sm text-gray-800 line-clamp-2">
                      {held.items.map(i => `${i.product.name} (${i.quantity})`).join(', ')}
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-100">
                      <span className="font-bold text-gray-900">{formatCurrency(held.total)}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteHeld(held.id)}
                          className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-100 transition"
                        >
                          Hapus
                        </button>
                        <button 
                          onClick={() => handleRestoreHeld(held.id)}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                          Muat
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}