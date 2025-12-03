"use client";

import { Sidebar } from "@/components/owner/sidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Sidebar - Lebar diatur oleh komponen Sidebar sendiri */}
      <Sidebar />

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}