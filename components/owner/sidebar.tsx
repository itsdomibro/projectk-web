"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Store, // Icon Toko
  LogOut,
  X
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/owner/dashboard" },
    { name: "Products", icon: Package, href: "/owner/products" },
    { name: "Orders", icon: ShoppingCart, href: "/owner/orders" },
    { name: "Cashier Management", icon: Users, href: "/owner/cashier" }, // Sudah diganti namanya
    { name: "Settings", icon: Settings, href: "/owner/settings" },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1E1E2D] text-gray-300 transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Header Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Toko POS</h1>
              <span className="text-xs text-gray-500">Owner Panel</span>
            </div>
          </div>
          {/* Tombol Close (Mobile Only) */}
          <button onClick={onClose} className="md:hidden p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose} // Tutup sidebar saat menu diklik (di mobile)
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar: Tombol Balik ke Kasir */}
        <div className="p-4 border-t border-gray-700/50">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white transition-all group"
          >
            <div className="p-1 bg-gray-700 rounded group-hover:bg-white/20 transition-colors">
              <Store className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Buka Kasir</p>
              <p className="text-xs text-gray-500 group-hover:text-green-100">Kembali ke POS</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}