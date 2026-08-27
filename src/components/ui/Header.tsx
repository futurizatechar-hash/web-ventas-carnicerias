"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const { cartItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative w-16 sm:w-24 h-10 sm:h-12 bg-white flex items-center justify-center shrink-0">
             <Image src="/logo.webp" alt="Establecimiento Ferreyra" fill className="object-contain mix-blend-multiply" />
          </div>
          <div>
            <h1 className="font-extrabold text-[12px] sm:text-lg tracking-tight leading-none uppercase text-zinc-800">
              Establecimiento<br/>Ferreyra
            </h1>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCartOpen(true)}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 transition active:scale-95 shadow-md relative shrink-0"
        >
           <ShoppingBag size={18} className="sm:hidden" />
           <ShoppingBag size={20} className="hidden sm:block" />
           {cartItems.length > 0 && (
             <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white">
               {cartItems.length}
             </span>
           )}
        </button>
      </div>
    </header>
  );
}
