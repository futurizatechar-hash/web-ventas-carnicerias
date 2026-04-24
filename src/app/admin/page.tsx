"use client";

import Link from "next/link";
import { Package, Tag, ArrowRight, Plus, Star, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useProducts } from "@/context/ProductsContext";

export default function AdminDashboardPage() {
  const { products } = useProducts();

  const totalProducts = products.length;
  const offerProducts = products.filter(p => p.isOffer);
  const activeOffers = offerProducts.length;
  const outOfStockProducts = products.filter(p => !p.stock);
  
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getPercentage = (category: string) => {
    if (totalProducts === 0) return 0;
    return Math.round(((categoryCounts[category] || 0) / totalProducts) * 100);
  };

  const categoriesDef = [
    { name: "Vacuno", color: "bg-zinc-800" },
    { name: "Cerdo", color: "bg-zinc-600" },
    { name: "Aves", color: "bg-zinc-400" },
    { name: "Embutidos", color: "bg-zinc-300" },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">Panel de Gestión</h2>
          <p className="text-zinc-500 font-medium">Un vistazo rápido al estado de tu catálogo.</p>
        </div>
        <Link 
          href="/admin/productos"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold hover:bg-zinc-800 transition active:scale-95 shadow-md w-full sm:w-auto shrink-0"
        >
          <Plus size={18} />
          Nuevo Producto
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* Card 1: Total Productos */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <Package size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-700 mb-4 border border-zinc-200">
              <Package size={24} />
            </div>
            <p className="text-sm font-bold text-zinc-500 mb-1">Total de Productos</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-black text-zinc-900">{totalProducts}</h3>
            </div>
          </div>
        </div>

        {/* Card 2: Ofertas Activas */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 text-red-500">
            <Tag size={100} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4 border border-red-100">
              <Tag size={24} />
            </div>
            <p className="text-sm font-bold text-zinc-500 mb-1">Ofertas Activas</p>
            <h3 className="text-4xl font-black text-zinc-900">{activeOffers}</h3>
            <p className="text-xs font-medium text-zinc-400 mt-2">Productos destacados en página de ventas.</p>
          </div>
        </div>



      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Distribución por Categoría (Gráfico CSS) */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-zinc-900">Distribución</h3>
            <span className="text-xs font-bold bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">Top 4</span>
          </div>
          
          <div className="flex flex-col space-y-5">
            {categoriesDef.map(cat => {
              const pct = getPercentage(cat.name);
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-zinc-700">{cat.name}</span>
                    <span className="text-zinc-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`${cat.color} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuración de Tienda */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-zinc-900">Configuración de Tienda</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1.5 text-zinc-700">WhatsApp de Pedidos</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium text-sm" defaultValue="+5493518046223" placeholder="+54 9 3518..." />
                <p className="text-[11px] font-medium text-zinc-500 mt-1.5 leading-tight">Los carritos armados se enviarán como mensaje a este número.</p>
              </div>
              <button className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition active:scale-95 text-sm shadow-md">
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Productos En Oferta */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                   <Tag size={18} className="fill-red-500" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-zinc-900 leading-tight">Productos En Oferta</h3>
                   <p className="text-xs font-medium text-zinc-500">Artículos con descuento activo.</p>
                 </div>
              </div>
              <Link href="/admin/productos" className="text-sm font-bold text-zinc-500 hover:text-black flex items-center gap-1 transition">
                Ver todos <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {offerProducts.length > 0 ? (
                offerProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-100/50 transition group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-zinc-200 bg-white shrink-0">
                      <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-zinc-900 truncate">{p.name}</h4>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
                          Oferta
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide bg-white px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-600">{p.category}</span>
                        <span className="font-black text-sm">{p.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-zinc-500 font-medium bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  No hay productos en oferta actualmente.
                </div>
              )}
            </div>
          </div>

          {/* Productos No Disponibles */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                   <AlertCircle size={18} />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-zinc-900 leading-tight">Productos No Disponibles</h3>
                   <p className="text-xs font-medium text-zinc-500">Artículos actualmente sin stock.</p>
                 </div>
              </div>
              <Link href="/admin/productos" className="text-sm font-bold text-zinc-500 hover:text-black flex items-center gap-1 transition">
                Gestionar <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-4">
              {outOfStockProducts.length > 0 ? (
                outOfStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/30 border border-orange-100 transition group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-orange-200 bg-white shrink-0 opacity-70 grayscale">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-zinc-900 truncate">{p.name}</h4>
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0">
                          Sin Stock
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide bg-white px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-600">{p.category}</span>
                        <span className="font-black text-sm text-zinc-500 line-through">{p.price}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-green-600 font-medium bg-green-50 rounded-2xl border border-dashed border-green-200">
                  ¡Excelente! Todos tus productos tienen stock.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </main>
  );
}
