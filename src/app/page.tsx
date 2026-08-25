"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ShoppingBag, Plus, Tag, Filter, ChevronRight, X, Minus, ShoppingCart, Trash2, ArrowLeft, MapPin, Store, CreditCard } from "lucide-react";
import { useProducts, Product } from "@/context/ProductsContext";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};



type CartItem = {
  id: string; // unique cart item id
  productId: number;
  name: string;
  quantity: number;
  unitType: 'peso' | 'unidad';
  price: string; // original string price
  estimatedUnitPrice?: string;
};

export default function CatalogPage() {
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

  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCategory = (categoryId: number | null, depth: number) => {
    if (categoryId === null) {
      setSelectedPath(selectedPath.slice(0, depth));
    } else {
      const newPath = [...selectedPath.slice(0, depth), categoryId];
      setSelectedPath(newPath);
    }
  };

  const { products } = useProducts();
  const offers = products.filter(p => p.isOffer);

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

  // --- CART LOGIC ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'retiro' | 'envio'>('retiro');
  const [customerAddress, setCustomerAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalUnitType, setModalUnitType] = useState<'peso' | 'unidad'>('peso');

  const openAddToCartModal = (product: Product) => {
    setSelectedProductForCart(product);
    setModalQuantity(1);
    setModalUnitType(product.saleType === 'unidad' ? 'unidad' : 'peso');
  };

  const confirmAddToCart = () => {
    if (!selectedProductForCart) return;

    const newItem: CartItem = {
      id: `${selectedProductForCart.id}-${Date.now()}`,
      productId: selectedProductForCart.id,
      name: selectedProductForCart.name,
      quantity: modalQuantity,
      unitType: modalUnitType,
      price: selectedProductForCart.price,
      estimatedUnitPrice: selectedProductForCart.estimatedUnitPrice
    };

    setCartItems([...cartItems, newItem]);
    setSelectedProductForCart(null);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    const numeric = priceStr.replace(/\./g, '').replace(/[^0-9]/g, '');
    return Number(numeric) || 0;
  };

  const getItemSubtotal = (item: CartItem) => {
    if (item.unitType === 'unidad' && item.estimatedUnitPrice) {
      return parsePrice(item.estimatedUnitPrice) * item.quantity;
    }
    return parsePrice(item.price) * item.quantity;
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + getItemSubtotal(item), 0);
  
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0 || !customerName.trim()) return;
    if (deliveryMethod === 'envio' && !customerAddress.trim()) return;

    let message = `Hola Establecimiento Ferreyra, soy *${customerName.trim()}* y me gustaría realizar el siguiente pedido:\n\n`;
    cartItems.forEach(item => {
      let quantityStr = item.quantity.toString();
      if (item.unitType === 'peso') {
        if (item.quantity < 1) {
          quantityStr = `${Math.round(item.quantity * 1000)} gramos`;
        } else {
          quantityStr = `${item.quantity} Kg`;
        }
      } else {
        quantityStr = `${item.quantity} Unidad(es)`;
      }
      
      const subtotal = getItemSubtotal(item);
      const isEstimated = item.unitType === 'unidad' && item.estimatedUnitPrice;
      
      message += `- ${quantityStr} de *${item.name}* -> ${formatPrice(subtotal)} ${isEstimated ? '(estimado)' : ''}\n`;
    });
    
    message += `\n*TOTAL ESTIMADO: ${formatPrice(cartTotal)}*\n`;
    message += `\n*Detalles de Entrega:*\n`;
    message += `- Método: ${deliveryMethod === 'envio' ? 'Envío a Domicilio' : 'Retiro en Local'}\n`;
    if (deliveryMethod === 'envio') {
      message += `- Dirección: ${customerAddress.trim()}\n`;
      if (addressDetails.trim()) {
        message += `- Especificaciones: ${addressDetails.trim()}\n`;
      }
    }
    message += `- Pago: ${paymentMethod}\n`;
    message += "\n¡Muchas gracias!";

    // El número debería venir de una API en un sistema real. Por ahora está hardcodeado.
    const WHATSAPP_NUMBER = "5493518046223"; 
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-black selection:bg-black selection:text-white pb-20 overflow-x-hidden">
      
      {/* Header / Hero */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-16 sm:w-24 h-10 sm:h-12 bg-white flex items-center justify-center shrink-0">
               <Image src="/logo.webp" alt="Establecimiento Ferreyra" fill className="object-contain mix-blend-multiply" />
            </div>
            <div>
              <h1 className="font-extrabold text-[12px] sm:text-lg tracking-tight leading-none uppercase text-zinc-800">Establecimiento<br/>Ferreyra</h1>
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
              <Tag fill="currentColor" size={20} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-red-600">Ofertas Imperdibles</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {filteredOffers.map((p) => (
              <div key={p.id} className="shrink-0 w-[280px] bg-gradient-to-b from-red-50/50 to-white border border-red-100 rounded-3xl overflow-hidden flex flex-col relative shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[10px] tracking-widest px-3 py-1 rounded-full z-10 animate-pulse">OFERTA</div>
                <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                  <Image src={p.image} alt={p.name} fill className="object-cover hover:scale-105 transition duration-500" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between border-t border-red-50">
                  <div>
                    <h3 className="font-bold text-[17px] leading-tight mb-1.5 text-zinc-900">{p.name}</h3>
                    <p className="text-[12px] text-zinc-600 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-xs text-red-400/80 line-through font-semibold block mb-0.5">{p.oldPrice}</span>
                      <span className="font-black text-2xl tracking-tight text-red-600 leading-none">{p.price}</span>
                    </div>
                    <button onClick={() => openAddToCartModal(p)} className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition active:scale-95 shadow-lg shadow-red-600/20">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Filtros Recursivos */}
        <div className="mb-6 space-y-4">
          {[null, ...selectedPath].map((parentId, index) => {
            const children = categories.filter(c => c.parentId === parentId);
            if (children.length === 0) return null;

            const selectedIdAtThisLevel = selectedPath.length > index ? selectedPath[index] : null;

            return (
              <div key={`filter-row-${parentId ?? 'root'}`} className="flex overflow-x-auto gap-2 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 items-center animate-in fade-in slide-in-from-top-2">
                {index > 0 && (
                  <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest mr-2">
                    <Filter size={12} /> Nivel {index + 1}:
                  </div>
                )}
                
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
                <div key={p.id} className="group relative bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    
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
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base leading-tight mb-1.5">{p.name}</h3>
                      <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed">{p.description}</p>
                    </div>
                    
                    <div className="mt-5 flex items-end sm:items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-black text-lg sm:text-xl tracking-tight leading-none">{p.price}</span>
                        {p.saleType === 'ambos' && p.estimatedUnitPrice && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-orange-500 mt-1">Aprox. {p.estimatedUnitPrice} c/u</span>
                        )}
                      </div>
                      <button 
                        onClick={() => openAddToCartModal(p)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition active:scale-90 border border-zinc-200 group-hover:border-black shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
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

      {/* Modal: Agregar al Carrito */}
      {selectedProductForCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedProductForCart(null)}></div>
          <div className="relative bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProductForCart(null)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition text-zinc-600"
            >
              <X size={18} />
            </button>
            <h2 className="text-2xl font-black tracking-tight pr-8 leading-tight mb-2">Agregar al Pedido</h2>
            <p className="font-bold text-zinc-500 mb-6">{selectedProductForCart.name}</p>

            <div className="space-y-6">
              
              {selectedProductForCart.saleType === 'ambos' && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-700">Tipo de Venta</label>
                  <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button 
                      type="button"
                      onClick={() => {
                        setModalUnitType('peso');
                        setModalQuantity(1);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition ${modalUnitType === 'peso' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                    >
                      Por Peso (Kg)
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setModalUnitType('unidad');
                        setModalQuantity(1);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg transition ${modalUnitType === 'unidad' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                    >
                      Por Unidad
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-2 text-zinc-700">
                  Cantidad ({modalUnitType === 'peso' ? 'Kilos (ej: 0.5 para 500g)' : 'Unidades'})
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const step = modalUnitType === 'peso' ? 0.1 : 1;
                      const min = modalUnitType === 'peso' ? 0.1 : 1;
                      setModalQuantity(Math.max(min, Number((modalQuantity - step).toFixed(2))));
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition active:scale-95 shrink-0"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1">
                    <input 
                      type="number"
                      value={modalQuantity}
                      onChange={(e) => {
                        let val = parseFloat(e.target.value);
                        if (isNaN(val) || val < 0) val = modalUnitType === 'peso' ? 0.1 : 1;
                        setModalQuantity(val);
                      }}
                      step={modalUnitType === 'peso' ? '0.1' : '1'}
                      min={modalUnitType === 'peso' ? '0.1' : '1'}
                      className="text-right font-black text-4xl w-24 bg-transparent border-none outline-none focus:ring-0 p-0 m-0"
                    />
                    <span className="font-black text-xl text-zinc-400 mt-2">
                      {modalUnitType === 'peso' ? 'KG' : 'UN'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      const step = modalUnitType === 'peso' ? 0.1 : 1;
                      setModalQuantity(Number((modalQuantity + step).toFixed(2)));
                    }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition active:scale-95 shrink-0"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={confirmAddToCart}
                  className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition active:scale-95 shadow-lg flex justify-center items-center gap-2"
                >
                  <ShoppingCart size={18} /> Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                {checkoutStep === 'details' ? (
                  <button 
                    onClick={() => setCheckoutStep('cart')}
                    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black hover:bg-zinc-200 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black">
                    <ShoppingCart size={18} />
                  </div>
                )}
                <h2 className="text-xl font-black tracking-tight">{checkoutStep === 'cart' ? 'Tu Pedido' : 'Detalles de Entrega'}</h2>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); setCheckoutStep('cart'); }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 hover:bg-zinc-100 transition text-zinc-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-50/50">
              {checkoutStep === 'cart' ? (
                <div className="p-6 h-full">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                      <ShoppingCart size={48} className="opacity-20" />
                      <p className="font-bold text-lg text-zinc-500">Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-start justify-between group">
                          <div className="flex-1 pr-4">
                            <h4 className="font-bold text-zinc-900 leading-tight mb-1">{item.name}</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                                {item.unitType === 'peso' 
                                  ? (item.quantity < 1 ? `${Math.round(item.quantity * 1000)} gramos` : `${item.quantity} Kg`) 
                                  : `${item.quantity} Unidad(es)`}
                              </span>
                              <span className="text-xs font-medium text-zinc-400">
                                x {item.unitType === 'unidad' && item.estimatedUnitPrice ? item.estimatedUnitPrice : item.price}
                              </span>
                            </div>
                            <p className="font-black text-sm text-zinc-800">
                              {formatPrice(getItemSubtotal(item))}
                              {item.unitType === 'unidad' && item.estimatedUnitPrice && (
                                <span className="text-[10px] text-orange-500 font-bold ml-1.5 uppercase tracking-wider">(Estimado)</span>
                              )}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-zinc-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                          >
                            <Trash2 size={16} className="lucide lucide-trash-2" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Formulario de Detalles */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-zinc-700">Nombre y Apellido *</label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Juan Pérez" 
                      className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-zinc-700">Método de Entrega</label>
                    <div className="flex bg-zinc-200/50 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setDeliveryMethod('retiro')}
                        className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-lg transition ${deliveryMethod === 'retiro' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                      >
                        <Store size={16} /> Retiro en Local
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDeliveryMethod('envio')}
                        className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-lg transition ${deliveryMethod === 'envio' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                      >
                        <MapPin size={16} /> Envío a Domicilio
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === 'envio' && (
                    <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-zinc-700">Dirección de Entrega *</label>
                        <input 
                          type="text" 
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value.toUpperCase())}
                          placeholder="CALLE, NÚMERO, BARRIO..." 
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-zinc-700">Especificaciones (Opcional)</label>
                        <input 
                          type="text" 
                          value={addressDetails}
                          onChange={(e) => setAddressDetails(e.target.value)}
                          placeholder="Piso, dpto, color de puerta, entre calles..." 
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold mb-2 text-zinc-700">Método de Pago</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition font-medium appearance-none"
                      >
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-zinc-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-zinc-500 uppercase tracking-wider text-xs">Total Estimado</span>
                <span className="font-black text-3xl tracking-tight">{formatPrice(cartTotal)}</span>
              </div>
              
              {checkoutStep === 'cart' ? (
                <button 
                  onClick={() => setCheckoutStep('details')}
                  disabled={cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white font-black py-4 rounded-xl hover:bg-zinc-800 transition active:scale-95 shadow-lg disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                >
                  Continuar con el Pedido
                </button>
              ) : (
                <button 
                  onClick={handleCheckout}
                  disabled={!customerName.trim() || (deliveryMethod === 'envio' && !customerAddress.trim())}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-black py-4 rounded-xl hover:bg-[#20bd5a] transition active:scale-95 shadow-lg shadow-[#25D366]/20 disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                  Confirmar por WhatsApp
                </button>
              )}
              
              {checkoutStep === 'details' && (
                <p className="text-[11px] text-center font-semibold text-zinc-500 mt-4 leading-relaxed">
                  Al confirmar, se abrirá un chat de WhatsApp con los detalles de tu pedido para coordinar la entrega.
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}


