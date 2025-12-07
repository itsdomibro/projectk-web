"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, History, Plus, Minus, Trash2, Search, Package, ArrowLeft, Save, X, LayoutDashboard } from 'lucide-react';
import type { Product, TransactionItem } from '@/types'; 
import { ImageWithFallback } from './ImageWithFallback';
import { useProductStore } from '@/store/productStore';

type Props = {
  onCreatePayment: (items: TransactionItem[], total: number) => void;
  onNavigateToHistory: () => void;
  onNavigateToOwner?: () => void;
};

export function Dashboard({ onCreatePayment, onNavigateToHistory, onNavigateToOwner }: Props) {
  // Gunakan data dari Store API, bukan props
  const { products, categories, fetchProducts, fetchCategories, isLoading } = useProductStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<TransactionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data saat komponen dimuat
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleAddProduct = (product: Product) => {
    // HAPUS LOGIKA CEK STOK karena BE tidak ada stok
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.productId === product.productId);
      if (existingItem) {
        return prev.map(item =>
          item.product.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item; 
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.productId !== productId));
  };

  const calculateTotal = (items: TransactionItem[]) => {
    // Hitung harga dikurang diskon (jika ada)
    return items.reduce((sum, item) => sum + (item.product.price - (item.product.discount || 0)) * item.quantity, 0);
  };

  const handleConfirmPayment = () => {
    if (cartItems.length === 0) return;
    const total = calculateTotal(cartItems);
    onCreatePayment(cartItems, total); // Kirim ke parent untuk diproses ke API
    setCartItems([]);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (isLoading) return <div className="p-10 text-center">Memuat data produk...</div>;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Kasir</h1>
          <p className="text-sm text-gray-500">Selamat bekerja!</p>
        </div>
        
        <div className="flex gap-3">
          {onNavigateToOwner && (
            <button 
              onClick={onNavigateToOwner} 
              className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" /> Panel Owner
            </button>
          )}
          
          <button 
            onClick={onNavigateToHistory} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition text-sm font-medium"
          >
            <History className="w-4 h-4" /> Riwayat
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          
          {/* AREA KIRI: PRODUK */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {!selectedCategory ? (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Kategori</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categories.map((cat: any) => { // Type 'any' sementara untuk handle property color yg diinject
                      const productCount = products.filter(p => p.categoryId === cat.categoryId).length;
                      return (
                        <button
                          key={cat.categoryId}
                          onClick={() => setSelectedCategory(cat.categoryId)}
                          className="group relative overflow-hidden bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-md transition-all text-left"
                        >
                          <div className={`absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform ${cat.color}`}></div>
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm ${cat.color}`}>
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-gray-900 font-bold text-lg mb-1">{cat.name}</div>
                            <div className="text-sm text-gray-500">{productCount} produk</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center shrink-0">
                  <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium">
                    <ArrowLeft className="w-5 h-5" /> Kembali
                  </button>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Cari produk..." 
                      className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 min-h-full">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProducts.map(product => (
                        <button
                          key={product.productId} 
                          onClick={() => handleAddProduct(product)}
                          className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden transition-all text-left hover:border-blue-400 hover:shadow-md flex flex-col h-full"
                        >
                          <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden w-full">
                            {product.imageUrl ? (
                              <ImageWithFallback src={product.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-10 h-10" /></div>
                            )}
                          </div>
                          <div className="p-3 flex flex-col flex-1">
                            <div className="text-gray-900 font-medium truncate mb-1">{product.name}</div>
                            <div className="flex justify-between items-center mt-auto">
                              <span className="text-blue-600 font-bold">{formatCurrency(product.price)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AREA KANAN: KERANJANG */}
          <div className="w-full lg:w-96 shrink-0 h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Keranjang
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                    <p>Keranjang kosong</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.product.productId} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(item.product.price)}</p>
                        </div>
                        <button onClick={() => handleRemoveItem(item.product.productId)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-2 py-1">
                          <button onClick={() => handleUpdateQty(item.product.productId, -1)}><Minus className="w-3 h-3" /></button>
                          <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item.product.productId, 1)}><Plus className="w-3 h-3" /></button>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 bg-gray-50 border-t rounded-b-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal(cartItems))}</span>
                  </div>
                  <button 
                    onClick={handleConfirmPayment}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}