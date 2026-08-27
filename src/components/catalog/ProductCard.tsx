"use client";

import Image from "next/image";
import { Plus, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

type ProductCardProps = {
  product: Product;
  breadcrumbs?: string[];
  isOffer?: boolean;
};

export function ProductCard({ product, breadcrumbs = [], isOffer = false }: ProductCardProps) {
  const { setSelectedProductForCart, setModalQuantity, setModalUnitType } = useCart();

  const openAddToCartModal = () => {
    setSelectedProductForCart(product);
    setModalQuantity(1);
    setModalUnitType(product.saleType === 'unidad' ? 'unidad' : 'peso');
  };

  if (isOffer) {
    return (
      <div className="shrink-0 w-[280px] bg-gradient-to-b from-red-50/50 to-white border border-red-100 rounded-3xl overflow-hidden flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] tracking-widest px-3 py-1 rounded-full z-10 animate-pulse">OFERTA</div>
        <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
          <Image src={product.image} alt={product.name} fill className="object-cover hover:scale-105 transition duration-500" />
        </div>
        <div className="p-4 flex-1 flex flex-col justify-between border-t border-red-50">
          <div>
            <h3 className="font-bold text-[17px] leading-tight mb-1.5 text-zinc-900">{product.name}</h3>
            <p className="text-[12px] text-zinc-600 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              {product.oldPrice && (
                <span className="text-xs text-red-400/80 line-through font-semibold block mb-0.5">{product.oldPrice}</span>
              )}
              <span className="font-black text-2xl tracking-tight text-red-600 leading-none">{product.price}</span>
            </div>
            <button 
              onClick={openAddToCartModal}
              className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition active:scale-95 shadow-lg shadow-red-600/20"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
        <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
        
        {breadcrumbs.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
            {breadcrumbs.map((crumb, idx) => (
              <div 
                key={idx} 
                className={`backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase shadow-sm flex items-center gap-1 ${idx === 0 ? 'bg-white/90 border border-white/50 text-black' : 'bg-zinc-900/80 text-white border-transparent'}`}
              >
                {idx > 0 && <ChevronRight size={10} className="opacity-50" />}
                {crumb}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base leading-tight mb-1.5">{product.name}</h3>
          <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed">{product.description}</p>
        </div>
        
        <div className="mt-5 flex items-end sm:items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tight leading-none">{product.price}</span>
            {product.saleType === 'ambos' && product.estimatedUnitPrice && (
              <span className="text-[9px] sm:text-[10px] font-bold text-orange-500 mt-1">Aprox. {product.estimatedUnitPrice} c/u</span>
            )}
          </div>
          <button 
            onClick={openAddToCartModal}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition active:scale-90 border border-zinc-200 group-hover:border-black shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
