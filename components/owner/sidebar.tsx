"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Store, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Menu 
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

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
      {/* Tombol Collapse (Hamburger/Panah) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-gray-900 border-2 border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-800 z-50 text-white"
      >
        {isCollapsed ? (
          <Menu className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

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
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
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

          {/* Account Menu Dropdown */}
          {showAccountMenu && (
            <div className={`absolute bottom-full mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 w-48 ${isCollapsed ? 'left-full ml-2' : 'left-0 right-0'}`}>
               <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-left text-sm">
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan</span>
                </button>
                <button
                  onClick={() => { alert('Logout berhasil!'); setShowAccountMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-900/30 text-red-400 hover:text-red-300 transition-colors text-left text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}