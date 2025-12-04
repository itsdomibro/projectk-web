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
  LogOut 
} from 'lucide-react';

// Definisi tipe props
interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk mengontrol menu akun (toggle klik)
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/owner/dashboard" },
    { name: "Products", icon: Package, href: "/owner/products" },
    { name: "Transactions", icon: ShoppingCart, href: "/owner/transactions" },
    { name: "Cashier Management", icon: Users, href: "/owner/cashier" },
  ];

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-gray-100 flex flex-col transition-all duration-300 relative h-screen shrink-0 border-r border-gray-800`}
    >
      {/* Logo/Brand */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} h-16 border-b border-gray-800 transition-all flex items-center justify-center`}>
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
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
        
        {/* Tombol Buka Kasir */}
        <button 
          onClick={() => router.push('/cashier')}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-green-400 hover:text-green-300 transition-all border border-gray-700/50 mb-4 ${isCollapsed ? 'justify-center' : ''}`}
          title="Buka Kasir"
        >
          <Store className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Buka Kasir</span>}
        </button>

        <div className="relative">
          {/* MENU AKUN (Dropdown/Dropup)
             - Jika Collapsed: Muncul di samping kanan (absolute)
             - Jika Expanded: Muncul di atas tombol profil (static flow) untuk mendorong tombol kasir ke atas
          */}
          {showAccountMenu && (
            <div 
              className={`
                bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-20
                ${isCollapsed 
                  ? 'absolute left-full bottom-0 ml-3 w-48' // Floating side menu saat collapsed
                  : 'mb-3 w-full animate-in slide-in-from-bottom-2' // Static block saat expanded (mendorong konten ke atas)
                }
              `}
            >
               <div className="py-1">
                <button 
                  onClick={() => console.log("Settings clicked")}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-left text-sm"
                >
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

          {/* Tombol Profil (Toggle Menu) */}
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className={`w-full flex items-center gap-3 hover:bg-gray-800 rounded-lg p-2 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            } ${showAccountMenu ? 'bg-gray-800 ring-1 ring-gray-700' : ''}`}
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

        </div>
      </div>
    </aside>
  );
}