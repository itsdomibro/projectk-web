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

  const handleSaveProduct = () => {
    if (
      !editingProduct ||
      !editingProduct.name ||
      !editingProduct.price ||
      !editingProduct.categoryId
    )
      return;

    if (editingProduct.productId) {
      updateProduct(editingProduct as ProductUpdateDto);
    } else {
      const newProduct: Product = {
        ...(editingProduct as Product),
        productId: `prod-${Date.now()}`,
      };
      addProduct(newProduct);
    }

    setShowProductModal(false);
    setEditingProduct(null);
    setImageUrl("");
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      deleteProduct(productId);
    }
  };

  // --- Logic Kategori ---
  const handleAddCategory = () => {
    setEditingCategory({
      name: "",
      color: "bg-blue-500",
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory || !editingCategory.name || !editingCategory.color)
      return;

    if (editingCategory.id) {
      updateCategory(editingCategory as Category);
    } else {
      const newCategory: Category = {
        ...(editingCategory as Category),
        id: `cat-${Date.now()}`,
      };
      addCategory(newCategory);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const hasProducts = products.some((p) => p.categoryId === categoryId);
    if (hasProducts) {
      alert("Tidak dapat menghapus kategori yang masih memiliki produk!");
      return;
    }

    if (confirm("Yakin ingin menghapus kategori ini?")) {
      deleteCategory(categoryId);
    }
  };

  const colorOptions = [
    { name: "Biru", value: "bg-blue-500", hex: "#3B82F6" },
    { name: "Hijau", value: "bg-green-500", hex: "#10B981" },
    { name: "Merah", value: "bg-red-500", hex: "#EF4444" },
    { name: "Kuning", value: "bg-yellow-500", hex: "#EAB308" },
    { name: "Ungu", value: "bg-purple-500", hex: "#8B5CF6" },
    { name: "Pink", value: "bg-pink-500", hex: "#EC4899" },
    { name: "Orange", value: "bg-orange-500", hex: "#F97316" },
    { name: "Indigo", value: "bg-indigo-500", hex: "#6366F1" },
  ];

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
                      <th className="py-3 px-4">Stok</th>
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
                          (c) => c.id === product.categoryId
                        );
                        const isTailwind = isTailwindClass(category?.color);

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              <div className="flex items-center gap-3">
                                {product.image && (
                                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                                    <ImageWithFallback
                                      src={product.image}
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
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-100 ${
                                    isTailwind
                                      ? `${category.color} bg-opacity-10 text-gray-700`
                                      : "text-white"
                                  }`}
                                  style={
                                    !isTailwind
                                      ? { backgroundColor: category.color }
                                      : {}
                                  }
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isTailwind ? category.color : "bg-white"
                                    }`}
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
                            <td className="py-3 px-4">
                              <span
                                className={`font-medium ${
                                  product.stock <= 10
                                    ? "text-red-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {product.stock} {product.stock <= 10 && "!"}
                              </span>
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
                                    handleDeleteProduct(product.id)
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
                    (p) => p.categoryId === category.id
                  ).length;
                  const isTailwind = isTailwindClass(category.color);

                  return (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-xl p-4 bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg shadow-sm flex items-center justify-center ${
                              isTailwind ? category.color : ""
                            }`}
                            style={
                              !isTailwind
                                ? { backgroundColor: category.color }
                                : {}
                            }
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
                            onClick={() => handleDeleteCategory(category.id)}
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
                      setEditingProduct({ ...editingProduct, image: imageUrl })
                    }
                    className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 font-medium text-gray-700"
                  >
                    Set
                  </button>
                </div>
                {(editingProduct.image || imageUrl) && (
                  <div className="mt-2 h-32 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <ImageWithFallback
                      src={editingProduct.image || imageUrl}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok *
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value) || 0,
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
                    <option key={cat.id} value={cat.id}>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warna Label *
                </label>
                <div className="grid grid-cols-5 gap-3 mb-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setEditingCategory({
                          ...editingCategory,
                          color: color.value,
                        })
                      }
                      className={`h-10 rounded-lg relative flex items-center justify-center ${
                        color.value
                      } ${
                        editingCategory.color === color.value
                          ? "ring-2 ring-offset-2 ring-blue-500 scale-105 shadow-md"
                          : "hover:scale-105 transition-transform hover:shadow-sm"
                      }`}
                      title={color.name}
                    >
                      {editingCategory.color === color.value && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm border border-gray-300 shrink-0">
                    <input
                      type="color"
                      value={
                        !isTailwindClass(editingCategory.color)
                          ? editingCategory.color
                          : "#000000"
                      }
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          color: e.target.value,
                        })
                      }
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] cursor-pointer p-0 border-0"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      Warna Custom
                    </p>
                    <p className="text-xs text-gray-500">
                      Klik lingkaran untuk memilih bebas
                    </p>
                  </div>
                  {!isTailwindClass(editingCategory.color) && (
                    <div className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-600">
                      {editingCategory.color}
                    </div>
                  )}
                </div>
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
