"use client";

import { useState } from 'react';
import { Sidebar } from "@/components/owner/sidebar";
import { ChatbotSidebar } from "@/components/ChatbotSidebar"; // Import komponen baru
import { Menu, MessageSquare } from 'lucide-react';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State untuk Chatbot Sidebar

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden relative">
      {/* Sidebar Utama */}
      <Sidebar isCollapsed={isCollapsed} />

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full transition-all duration-300">
        
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          {/* Kiri: Hamburger & Judul */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg text-gray-800 tracking-tight">Panel Owner</span>
          </div>

          {/* Kanan: Tombol AI Assistant */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-sm font-medium hover:shadow-md active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
            <span>AI Assistant</span>
          </button>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Sidebar Chatbot (Overlay dari kanan) */}
      {/* Overlay Gelap (Optional, klik luar untuk tutup) */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 transition-opacity"
          onClick={() => setIsChatOpen(false)}
        />
      )}
      
      {/* Komponen Sidebar Chatbot */}
      <ChatbotSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}