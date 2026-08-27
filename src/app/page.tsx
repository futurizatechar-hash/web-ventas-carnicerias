"use client";

import { useState } from "react";
import { Search, Tag, Filter } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { Category } from "@/types";
import { Header } from "@/components/ui/Header";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CartDrawer } from "@/components/cart/CartDrawer";

const categories: Category[] = [
  { id: 1, name: "Vacuno", parentId: null },
  { id: 101, name: "Asado", parentId: 1 },
  { id: 1011, name: "Cortes Finos", parentId: 101 },
  { id: 102, name: "Especiales", parentId: 1 },
  { id: 2, name: "Cerdo", parentId: null },
  { id: 201, name: "Premium", parentId: 2 },
  { id: 3, name: "Aves", parentId: null },
  { id: 4, name: "Embutidos", parentId: null },
  { id: 401, name: "Parrilla", parentId: 4 },
];

export default function CatalogPage() {
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { products } = useProducts();
  const offers = products.filter(p => p.isOffer);

  const handleSelectCategory = (categoryId: number | null, depth: number) => {
    if (categoryId === null) {
      setSelectedPath(selectedPath.slice(0, depth));
    } else {
      const newPath = [...selectedPath.slice(0, depth), categoryId];
      setSelectedPath(newPath);
    }
  };

  const getDescendantIds = (catId: number): number[] => {
    const children = categories.filter(c => c.parentId === catId).map(c => c.id);
    return children.reduce((acc, childId) => [...acc, ...getDescendantIds(childId)], children);
  };

  const activeCategoryId = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;
  
  const filteredOffers = offers.filter(p => {
    if (searchQuery.trim().length >= 3) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const filteredProducts = products.filter(p => {
    if (searchQuery.trim().length >= 3) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    if (activeCategoryId === null) return true;
    const validIds = [activeCategoryId, ...getDescendantIds(activeCategoryId)];
    return validIds.includes(p.categoryId || 0);
  });

  const getCategoryBreadcrumbs = (categoryId: number) => {
    const crumbs = [];
    let currentId: number | null = categoryId;
    while (currentId !== null) {
      const cat = categories.find(c => c.id === currentId);
      if (cat) {
        crumbs.unshift(cat.name);
        currentId = cat.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black selection:bg-black selection:text-white pb-20 overflow-x-hidden">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        
        {/* Título Principal y Buscador */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter shrink-0">Nuestro Catálogo</h2>
          <div className="relative w-full sm:max-w-sm md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cortes, embutidos..." 
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium"
            />
          </div>
        </div>

        {/* Ofertas Imperdibles */}
        {filteredOffers.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <Tag size={20} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter text-red-600">Ofertas Imperdibles</h2>
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {filteredOffers.map((p) => (
                <ProductCard key={p.id} product={p} isOffer={true} />
              ))}
            </div>
          </div>
        )}

        {/* Filtro de Categorías */}
        <div className="mb-6 space-y-4">
          {[null, ...selectedPath].map((selectedIdAtThisLevel, index) => {
            const parentId = index === 0 ? null : selectedPath[index - 1];
            const children = categories.filter(c => c.parentId === parentId);
            
            if (children.length === 0) return null;

            return (
              <div key={`level-${index}`} className="flex overflow-x-auto gap-2 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 items-center animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => handleSelectCategory(null, index)}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold border transition ${selectedIdAtThisLevel === null ? (index === 0 ? 'bg-black text-white border-black' : 'bg-zinc-800 text-white border-zinc-800') : 'bg-transparent border-zinc-200 text-zinc-600 hover:border-black hover:text-black'}`}
                >
                  {index === 0 ? 'Todos' : 'Todas'}
                </button>
                
                {children.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id, index)}
                    className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold border transition ${selectedIdAtThisLevel === cat.id ? (index === 0 ? 'bg-black text-white border-black' : 'bg-zinc-800 text-white border-zinc-800') : 'bg-transparent border-zinc-200 text-zinc-600 hover:border-black hover:text-black'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-8 mt-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.filter(p => !p.isOffer && p.stock).map((p) => {
              const breadcrumbs = getCategoryBreadcrumbs(p.categoryId || 0);
              return (
                <ProductCard key={p.id} product={p} breadcrumbs={breadcrumbs} />
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-zinc-500">
              <Filter size={40} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold text-lg text-zinc-800">No hay productos disponibles</p>
              <p className="text-sm">Intenta seleccionar otra categoría o subcategoría.</p>
            </div>
          )}
        </div>
      </main>

      <CartDrawer />
    </div>
  );
}
