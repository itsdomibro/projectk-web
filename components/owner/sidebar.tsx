"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Store, 
  Settings, 
  LogOut 
} from 'lucide-react';

// Menambahkan interface untuk props
interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/owner/dashboard" },
    { name: "Products", icon: Package, href: "/owner/products" },
    { name: "Transactions", icon: ShoppingCart, href: "/owner/transactions" },
    { name: "Cashier Management", icon: Users, href: "/owner/cashier" },
  ];

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-gray-100 flex flex-col transition-all duration-300 relative h-screen shrink-0`}
    >
      {/* Tombol Hamburger di sini DIHAPUS sesuai permintaan */}

      {/* Logo/Brand */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-800 transition-all flex items-center justify-center`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="whitespace-nowrap">
              <div className="text-white font-bold">Toko POS</div>
              <div className="text-xs text-gray-400">Owner Panel</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: User Info & Back to Cashier */}
      <div className="p-4 border-t border-gray-800 bg-[#0f141f]">
        {/* Tombol Balik ke Kasir */}
        <button 
          onClick={() => router.push('/')}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-green-400 hover:text-green-300 transition-all border border-gray-700/50 mb-4 ${isCollapsed ? 'justify-center' : ''}`}
          title="Buka Kasir"
        >
          <Store className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Buka Kasir</span>}
        </button>

        {/* Akun Menu */}
        <div className="relative group">
          <button
            className={`w-full flex items-center gap-3 hover:bg-gray-800 rounded-lg p-2 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center shrink-0 border border-purple-400/30">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <div className="text-sm text-white truncate">Admin Owner</div>
                <div className="text-xs text-gray-400 truncate">owner@toko.com</div>
              </div>
            )}
          </button>
          
          {/* Simple Dropdown on Hover for demo */}
          <div className="absolute bottom-full left-0 w-full mb-2 hidden group-hover:block bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-1">
             <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 text-gray-300 rounded text-sm">
                <Settings className="w-4 h-4" /> Pengaturan
             </button>
             <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-900/30 text-red-400 rounded text-sm">
                <LogOut className="w-4 h-4" /> Keluar
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
}