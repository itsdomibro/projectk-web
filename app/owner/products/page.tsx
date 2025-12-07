"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Package, Tag, Save, X, Search, Check, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { Product, Category } from '@/types';
import { useProductStore } from "@/store/productStore";

// Tipe lokal untuk form state
type ProductForm = {
  id?: string; // Optional, hanya ada saat edit
  name: string;
  price: number;
  discount: number;
  categoryId: string;
  description: string;
  imageUrl: string;
};

type CategoryForm = {
  id?: string;
  name: string;
  description: string;
};

export default function ProductManagementPage() {
  const router = useRouter();
  
  const { 
    products, 
    categories, 
    fetchProducts,
    createProduct, 
    updateProduct, 
    deleteProduct,
    fetchCategories,
    createCategory,
    deleteCategory,
    isLoading
  } = useProductStore();
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  
  // State Modal & Form
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data awal
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // --- HANDLERS PRODUK ---
  const handleAddProduct = () => {
    setProductForm({
      name: '',
      price: 0,
      discount: 0,
      categoryId: categories[0]?.categoryId || '',
      description: '',
      imageUrl: '',
    });
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      id: product.productId,
      name: product.name,
      price: product.price,
      discount: product.discount || 0,
      categoryId: product.categoryId || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm || !productForm.name || !productForm.price) return;
    setIsSubmitting(true);

    const payload = {
      name: productForm.name,
      price: Number(productForm.price),
      discount: Number(productForm.discount),
      // PERBAIKAN: Gunakan undefined agar sesuai dengan tipe di store
      categoryId: productForm.categoryId || undefined,
      description: productForm.description,
      imageUrl: productForm.imageUrl
    };

    let success = false;
    if (productForm.id) {
      success = await updateProduct(productForm.id, payload);
    } else {
      success = await createProduct(payload);
    }

    setIsSubmitting(false);
    if (success) setShowProductModal(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      await deleteProduct(id);
    }
  };

  // --- HANDLERS KATEGORI ---
  const handleAddCategory = () => {
    setCategoryForm({ name: '', description: '' });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm || !categoryForm.name) return;
    setIsSubmitting(true);

    const success = await createCategory({
      name: categoryForm.name,
      description: categoryForm.description
    });

    setIsSubmitting(false);
    if (success) setShowCategoryModal(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      await deleteCategory(id);
    }
  };

  // Filter Produk
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 p-6 md:p-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Manajemen Produk</h1>
          <p className="text-gray-600">Kelola inventaris dan kategori toko Anda</p>
        </div>
        
        {activeTab === 'products' && (
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 px-6 pt-2">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors text-sm font-medium ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4" />
              Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors text-sm font-medium ${
                activeTab === 'categories'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Tag className="w-4 h-4" />
              Kategori ({categories.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
          ) : activeTab === 'products' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-900 font-semibold text-lg">Daftar Produk</h2>
                <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                  <Plus className="w-4 h-4" /> Tambah Produk
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Nama</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4">Diskon</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-500">
                          {searchTerm ? 'Produk tidak ditemukan.' : 'Belum ada produk.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map(product => {
                        const category = categories.find(c => c.categoryId === product.categoryId);
                        const catColor = (category as any)?.color || 'bg-gray-500'; 
                        
                        return (
                          <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              <div className="flex items-center gap-3">
                                {product.imageUrl && (
                                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                                    <ImageWithFallback src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                {product.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {category ? (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${catColor}`}>
                                  {category.name}
                                </span>
                              ) : <span className="text-gray-400 text-xs italic">Tanpa Kategori</span>}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-600">{formatCurrency(product.price)}</td>
                            <td className="py-3 px-4 text-gray-500">
                              {product.discount > 0 ? (
                                <span className="text-red-500">-{formatCurrency(product.discount)}</span>
                              ) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleEditProduct(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-100"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteProduct(product.productId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            // --- TAB KATEGORI ---
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-900 font-semibold text-lg">Daftar Kategori</h2>
                <button onClick={handleAddCategory} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                  <Plus className="w-4 h-4" /> Tambah Kategori
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => {
                  const catColor = (category as any)?.color || 'bg-gray-500';
                  return (
                    <div key={category.categoryId} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg shadow-sm flex items-center justify-center ${catColor}`}>
                            <Tag className="w-5 h-5 text-white opacity-90" />
                          </div>
                          <div>
                            <div className="text-gray-900 font-bold">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.description || 'Tidak ada deskripsi'}</div>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCategory(category.categoryId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Produk */}
      {showProductModal && productForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-bold text-lg text-gray-900">
                {productForm.id ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Diskon (Rp)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setShowProductModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
              <button 
                onClick={handleSaveProduct} 
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kategori */}
      {showCategoryModal && categoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="font-bold text-lg text-gray-900">Tambah Kategori</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setShowCategoryModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Batal</button>
              <button 
                onClick={handleSaveCategory} 
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}