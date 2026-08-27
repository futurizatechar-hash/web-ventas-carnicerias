"use client";

import { useState } from "react";
import { X, Minus, Plus, ShoppingCart, ArrowLeft, Trash2, Store, MapPin, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen,
    selectedProductForCart,
    setSelectedProductForCart,
    modalQuantity,
    setModalQuantity,
    modalUnitType,
    setModalUnitType,
    addToCart,
    removeFromCart,
    cartTotal,
    getItemSubtotal,
    formatPrice,
    checkoutStep,
    setCheckoutStep
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'retiro' | 'envio'>('retiro');
  const [customerAddress, setCustomerAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  const confirmAddToCart = () => {
    if (!selectedProductForCart) return;
    addToCart(selectedProductForCart, modalQuantity, modalUnitType);
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
    <>
      {/* Modal: Agregar al Carrito */}
      {selectedProductForCart && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-[60] flex justify-end">
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
    </>
  );
}
