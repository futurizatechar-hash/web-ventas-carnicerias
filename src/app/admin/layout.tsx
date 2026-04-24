"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Package, FolderTree, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-black selection:bg-black selection:text-white overflow-x-hidden">
      {/* Navbar Gestor */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-24 h-10 bg-white flex items-center justify-center shrink-0">
               <Image src="/logo.png" alt="Establecimiento Ferreyra" fill className="object-contain" />
            </div>
            <h1 className="font-extrabold text-xl tracking-tight hidden sm:block">Gestor de Catálogo</h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition active:scale-95"
            >
              EF
            </button>
            
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-zinc-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-zinc-100">
                    <p className="text-sm font-bold text-zinc-900">Admin</p>
                    <p className="text-xs text-zinc-500">Establecimiento Ferreyra</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin Tabs Navigation */}
        <div className="container mx-auto px-4 flex items-center gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Link 
            href="/admin" 
            className={`flex items-center gap-2 pb-3 pt-2 border-b-2 font-bold text-sm transition whitespace-nowrap shrink-0 ${pathname === '/admin' ? 'border-black text-black' : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Panel de Gestión
          </Link>
          <Link 
            href="/admin/productos" 
            className={`flex items-center gap-2 pb-3 pt-2 border-b-2 font-bold text-sm transition whitespace-nowrap shrink-0 ${pathname.startsWith('/admin/productos') ? 'border-black text-black' : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'}`}
          >
            <Package size={16} />
            Productos
          </Link>
          <Link 
            href="/admin/categorias" 
            className={`flex items-center gap-2 pb-3 pt-2 border-b-2 font-bold text-sm transition whitespace-nowrap shrink-0 ${pathname === '/admin/categorias' ? 'border-black text-black' : 'border-transparent text-zinc-500 hover:text-black hover:border-zinc-300'}`}
          >
            <FolderTree size={16} />
            Categorías
          </Link>
        </div>
      </header>

      {/* Pages Content */}
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}
