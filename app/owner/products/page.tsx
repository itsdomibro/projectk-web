"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Tag,
  Save,
  X,
  Search,
  Check,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type {
  Product,
  ProductCreateDto,
  ProductUpdateDto,
} from "@/types/Product";
import type {
  Category,
  CategoryCreateDto,
  CategoryUpdateDto,
} from "@/types/Category";

import { useProductStore } from "@/store/productStore";
import { productService } from "@/services/productService";
import { useCategoryStore } from "@/store/categoryStore";
import { categoryService } from "@/services/categoryService";

type EditingProduct = Partial<Product> & { id?: string };
type EditingCategory = Partial<Category> & { id?: string };

export default function ProductManagementPage() {
  const router = useRouter();

  const { products, addProduct, updateProduct, deleteProduct, setProducts } =
    useProductStore();
  const {
    categories,
    addCategory,
    deleteCategory,
    setCategories,
    updateCategory,
  } = useCategoryStore();

  useEffect(() => {
    async function getData() {
      try {
        const dataProduct = await productService.getAll();
        const dataCategory = await categoryService.getAll();
        setProducts(dataProduct);
        setCategories(dataCategory);
      } catch (error) {
        console.error("Failed to get data: ", error);
      }
    }
    getData();
  }, []);

  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products"
  );
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(
    null
  );
  const [editingCategory, setEditingCategory] =
    useState<EditingCategory | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isTailwindClass = (color: string | undefined) => {
    return color && color.startsWith("bg-");
  };

  // --- Logic Produk ---
  const handleAddProduct = () => {
    setEditingProduct({
      name: "",
      price: 0,
      discount: 0,
      categoryId: categories[0]?.categoryId || "",
      description: "", // Reset deskripsi
      imageUrl: "",
    });
    setImageUrl("");
    setShowProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setImageUrl(product.imageUrl || "");
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (
      !editingProduct ||
      !editingProduct.name ||
      !editingProduct.price ||
      !editingProduct.categoryId
    )
      return;

    if (editingProduct.productId) {
      const dto: ProductUpdateDto = {
        name: editingProduct.name,
        price: editingProduct.price,
        discount: editingProduct.discount ?? 0,
        categoryId: editingProduct.categoryId,
        description: editingProduct.description ?? "",
        imageUrl: editingProduct.imageUrl ?? "",
      };

      await productService.update(editingProduct.productId, dto);
      updateProduct({
        ...editingProduct,
        ...dto,
        productId: editingProduct.productId,
        categoryName: editingProduct.categoryName ?? null,
        imageUrl: editingProduct.imageUrl ?? null,
      } as Product); // cast ke Product supaya tipe cocok
    } else {
      const dto: ProductCreateDto = {
        name: editingProduct.name,
        price: editingProduct.price,
        discount: editingProduct.discount ?? 0,
        categoryId: editingProduct.categoryId,
        description: editingProduct.description ?? "",
        imageUrl: editingProduct.imageUrl ?? "",
      };

      const created = await productService.create(dto);
      addProduct(created);
    }
    setShowProductModal(false);
    setEditingProduct(null);
    setImageUrl("");
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = confirm("Yakin ingin menghapus produk ini?");
    if (!confirmed) return;
    try {
      await productService.remove(productId);
      deleteProduct(productId);
    } catch (error) {
      console.error("Gagal menghapus produk", error);
      alert("Terjadi kesalahan saat menghapus produk!");
    }
  };

  // --- Logic Kategori ---
  const handleAddCategory = () => {
    setEditingCategory({
      name: "",
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory || !editingCategory.name) return;

    if (editingCategory.categoryId) {
      const dto: CategoryUpdateDto = {
        name: editingCategory.name,
      };
      await categoryService.update(editingCategory.categoryId, dto);
      updateCategory({
        categoryId: editingCategory.categoryId,
        name: editingCategory.name,
      });
    } else {
      const dto: CategoryCreateDto = {
        name: editingCategory.name,
      };
      const created = await categoryService.create(dto);
      addCategory(created);
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const hasProducts = products.some((p) => p.categoryId === categoryId);
    if (hasProducts) {
      alert("Tidak dapat menghapus kategori yang masih memiliki produk!");
      return;
    }

    if (confirm("Yakin ingin menghapus kategori ini?")) {
      await categoryService.delete(categoryId);
      deleteCategory(categoryId);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 p-6 md:p-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Manajemen Produk</h1>
          <p className="text-gray-600">
            Kelola inventaris dan kategori toko Anda
          </p>
        </div>

        {activeTab === "products" && (
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
        <div className="border-b border-gray-200 px-6 pt-2">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors text-sm font-medium ${
                activeTab === "products"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Package className="w-4 h-4" />
              Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors text-sm font-medium ${
                activeTab === "categories"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Tag className="w-4 h-4" />
              Kategori ({categories.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "products" ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-900 font-semibold text-lg">
                  Daftar Produk
                </h2>
                <button
                  onClick={handleAddProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Produk
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Nama</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Deskripsi</th>{" "}
                      {/* Kolom Baru */}
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-12 text-gray-500"
                        >
                          {searchTerm
                            ? "Produk tidak ditemukan."
                            : 'Belum ada produk. Klik "Tambah Produk" untuk mulai.'}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const category = categories.find(
                          (c) => c.categoryId === product.categoryId
                        );
                        return (
                          <tr
                            key={product.productId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              <div className="flex items-center gap-3">
                                {product.imageUrl && (
                                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                                    <ImageWithFallback
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                {product.name}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {category && (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-100 text-white`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-fullbg-white`}
                                  ></span>
                                  {category.name}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-500 max-w-[200px] truncate">
                              {product.description || "-"}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-600">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors border border-transparent hover:border-blue-100"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.productId)
                                  }
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
            // --- BAGIAN KATEGORI ---
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-gray-900 font-semibold text-lg">
                  Daftar Kategori
                </h2>
                <button
                  onClick={handleAddCategory}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Kategori
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const productCount = products.filter(
                    (p) => p.categoryId === category.categoryId
                  ).length;

                  return (
                    <div
                      key={category.categoryId}
                      className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg shadow-sm flex items-center justify-center`}
                          >
                            <Tag className="w-5 h-5 text-white opacity-80" />
                          </div>
                          <div>
                            <div className="text-gray-900 font-bold">
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {productCount} produk
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCategory(category.categoryId)
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            disabled={productCount > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="font-bold text-lg text-gray-900">
                {editingProduct.id ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none"
                  />
                  <button
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        imageUrl: imageUrl,
                      })
                    }
                    className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 font-medium text-gray-700"
                  >
                    Set
                  </button>
                </div>
                {(editingProduct.imageUrl || imageUrl) && (
                  <div className="mt-2 h-32 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <ImageWithFallback
                      src={editingProduct.imageUrl || imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  value={editingProduct.name || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Nasi Goreng"
                />
              </div>

              {/* Input Deskripsi Baru */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[80px]"
                  placeholder="Contoh: Pedas manis, extra telur..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={editingProduct.categoryId || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium shadow-sm transition-all hover:shadow-md"
              >
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal (TETAP SAMA SEPERTI SEBELUMNYA DENGAN COLOR PICKER) */}
      {showCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="font-bold text-lg text-gray-900">
                {editingCategory.id ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Contoh: Minuman"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium shadow-sm transition-all hover:shadow-md"
              >
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
