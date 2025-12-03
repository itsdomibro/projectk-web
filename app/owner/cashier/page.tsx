"use client";

import { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, UserCheck, UserX, Save, X, Mail, User, Shield } from 'lucide-react';

// --- TIPE DATA ---
type Cashier = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'cashier';
  active: boolean;
};

// --- DATA DUMMY AWAL ---
const INITIAL_CASHIERS: Cashier[] = [
  { id: 'cash-1', name: 'Admin Owner', email: 'owner@toko.com', role: 'owner', active: true },
  { id: 'cash-2', name: 'Budi Santoso', email: 'budi@toko.com', role: 'cashier', active: true },
  { id: 'cash-3', name: 'Siti Aminah', email: 'siti@toko.com', role: 'cashier', active: false },
];

export default function CashierManagementPage() {
  const [cashiers, setCashiers] = useState<Cashier[]>(INITIAL_CASHIERS);
  const [editingCashier, setEditingCashier] = useState<Partial<Cashier> | null>(null);
  const [showModal, setShowModal] = useState(false);

  // --- LOGIKA FUNGSI ---
  const handleAddCashier = () => {
    setEditingCashier({
      name: '',
      email: '',
      role: 'cashier',
      active: true,
    });
    setShowModal(true);
  };

  const handleEditCashier = (cashier: Cashier) => {
    setEditingCashier(cashier);
    setShowModal(true);
  };

  const handleSaveCashier = () => {
    if (!editingCashier || !editingCashier.name || !editingCashier.email) return;

    if (editingCashier.id) {
      // Update existing
      setCashiers(cashiers.map(c => c.id === editingCashier.id ? editingCashier as Cashier : c));
    } else {
      // Add new
      const newCashier: Cashier = {
        ...editingCashier as Cashier,
        id: `cash-${Date.now()}`,
      };
      setCashiers([...cashiers, newCashier]);
    }

    setShowModal(false);
    setEditingCashier(null);
  };

  const handleToggleActive = (cashierId: string) => {
    setCashiers(cashiers.map(c => 
      c.id === cashierId ? { ...c, active: !c.active } : c
    ));
  };

  const handleDeleteCashier = (cashierId: string) => {
    const cashier = cashiers.find(c => c.id === cashierId);
    if (cashier?.role === 'owner') {
      alert('Tidak dapat menghapus akun owner utama!');
      return;
    }

    if (confirm('Yakin ingin menghapus akun kasir ini?')) {
      setCashiers(cashiers.filter(c => c.id !== cashierId));
    }
  };

  // Hitung Statistik
  const activeCashiers = cashiers.filter(c => c.active).length;
  const inactiveCashiers = cashiers.filter(c => !c.active).length;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold mb-1">Manajemen Kasir</h1>
          <p className="text-gray-600">Kelola akses dan akun karyawan toko Anda</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Akun</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{cashiers.length}</div>
          <div className="text-sm text-gray-500">Semua pengguna terdaftar</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Akun Aktif</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{activeCashiers}</div>
          <div className="text-sm text-gray-500">Dapat mengakses sistem</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Nonaktif</span>
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{inactiveCashiers}</div>
          <div className="text-sm text-gray-500">Akses dibekukan sementara</div>
        </div>
      </div>

      {/* Cashier List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Daftar Pengguna</h2>
          <button
            onClick={handleAddCashier}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Kasir
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4">Nama Pengguna</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cashiers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Belum ada data kasir. Klik tombol "Tambah Kasir" di atas.
                  </td>
                </tr>
              ) : (
                cashiers.map(cashier => (
                  <tr key={cashier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${cashier.role === 'owner' ? 'bg-purple-600' : 'bg-blue-500'}`}>
                          {cashier.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{cashier.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {cashier.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        cashier.role === 'owner' 
                          ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {cashier.role === 'owner' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {cashier.role === 'owner' ? 'Owner' : 'Kasir'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(cashier.id)}
                        disabled={cashier.role === 'owner'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          cashier.active
                            ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                        } ${cashier.role === 'owner' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {cashier.active ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Aktif
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditCashier(cashier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCashier(cashier.id)}
                          disabled={cashier.role === 'owner'}
                          className={`p-2 rounded-lg transition-colors border border-transparent ${
                             cashier.role === 'owner' 
                             ? 'text-gray-300 cursor-not-allowed' 
                             : 'text-red-600 hover:bg-red-50 hover:border-red-100'
                          }`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Tambah/Edit) */}
      {showModal && editingCashier && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all scale-100">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCashier.id ? 'Edit Data Kasir' : 'Tambah Kasir Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={editingCashier.name || ''}
                    onChange={(e) => setEditingCashier({ ...editingCashier, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={editingCashier.email || ''}
                    onChange={(e) => setEditingCashier({ ...editingCashier, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Akses *</label>
                <select
                  value={editingCashier.role || 'cashier'}
                  onChange={(e) => setEditingCashier({ ...editingCashier, role: e.target.value as 'owner' | 'cashier' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="cashier">Kasir (Transaksi Saja)</option>
                  <option value="owner">Owner (Akses Penuh)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1.5">
                  * Owner memiliki akses penuh ke dashboard & pengaturan.
                </p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={editingCashier.active ?? true}
                    onChange={(e) => setEditingCashier({ ...editingCashier, active: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">Status Akun Aktif</span>
                    <span className="text-xs text-gray-500">Izinkan pengguna ini login ke sistem</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCashier}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium shadow-md transition-all hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}