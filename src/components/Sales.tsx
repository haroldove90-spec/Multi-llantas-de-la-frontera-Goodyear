import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Mail, 
  Percent, 
  User, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TIRES, BRANCHES, UserRole } from '../data/mockData';

interface SalesProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

interface QuoteItem {
  productId: string;
  brand: string;
  model: string;
  quantity: number;
  price: number;
  total: number;
}

interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Vigente' | 'Aceptada' | 'Vencida';
  branchId: string;
}

export default function Sales({ userRole, branchId }: SalesProps) {
  const isVendedor = userRole === 'vendedor';

  // Quotations List State
  const [quotesList, setQuotesList] = useState<Quote[]>([
    {
      id: 'COT-2026-081',
      clientName: 'Alejandro Garza H.',
      clientPhone: '899-123-4567',
      date: '2026-05-20',
      validUntil: '2026-06-20',
      items: [
        { productId: 'T-01', brand: 'Michelin', model: 'Pilot Sport 5', quantity: 4, price: 4625, total: 18500 }
      ],
      subtotal: 18500,
      discount: 10, // 10%
      tax: 2664, // 16% IVA on discounted total (16650 * 0.16)
      total: 19314,
      status: 'Vigente',
      branchId: 'matriz'
    },
    {
      id: 'COT-2026-082',
      clientName: 'Transportes Rápidos Monterrey',
      clientPhone: '818-987-6543',
      date: '2026-05-18',
      validUntil: '2026-06-18',
      items: [
        { productId: 'T-04', brand: 'Bridgestone', model: 'Dueler H/P Sport', quantity: 6, price: 5250, total: 31500 }
      ],
      subtotal: 31500,
      discount: 0,
      tax: 5040,
      total: 36540,
      status: 'Aceptada',
      branchId: 'norte'
    }
  ]);

  // New Quote Creator State
  const [activeQuote, setActiveQuote] = useState<QuoteItem[]>([]);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    discount: 0,
    validityDays: 15
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quote | null>(null);

  // Filter tires for quotient selector
  const filteredTires = TIRES.filter(t => 
    t.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${t.width}/${t.profile} R${t.rim}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItemToQuote = (tireId: string) => {
    const tire = TIRES.find(t => t.id === tireId);
    if (!tire) return;

    // Check if already exists in active quote
    const existingIndex = activeQuote.findIndex(item => item.productId === tireId);
    if (existingIndex > -1) {
      const updated = [...activeQuote];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
      setActiveQuote(updated);
    } else {
      setActiveQuote([...activeQuote, {
        productId: tire.id,
        brand: tire.brand,
        model: tire.model,
        quantity: 1,
        price: tire.price,
        total: tire.price
      }]);
    }
  };

  const handleRemoveItemFromQuote = (productId: string) => {
    setActiveQuote(activeQuote.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, val: number) => {
    if (val < 1) return;
    setActiveQuote(activeQuote.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: val, total: val * item.price };
      }
      return item;
    }));
  };

  // Calculations
  const quoteSubtotal = activeQuote.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = (quoteSubtotal * (clientInfo.discount / 100));
  const postDiscount = quoteSubtotal - discountAmount;
  const quoteTax = postDiscount * 0.16; // 16% IVA
  const quoteTotal = postDiscount + quoteTax;

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeQuote.length === 0) return;

    const newQuote: Quote = {
      id: `COT-2026-0${80 + quotesList.length + 1}`,
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone || 'Mostrador Sin Teléfono',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + clientInfo.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: activeQuote,
      subtotal: quoteSubtotal,
      discount: clientInfo.discount,
      tax: quoteTax,
      total: quoteTotal,
      status: 'Vigente',
      branchId: branchId || 'matriz'
    };

    setQuotesList([newQuote, ...quotesList]);
    setSelectedQuoteForPrint(newQuote);

    // Reset Quote Draft
    setActiveQuote([]);
    setClientInfo({
      name: '',
      phone: '',
      discount: 0,
      validityDays: 15
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            COTIZACIONES MULTILLANTAS
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            Diseñador de Ofertas Especiales, Presupuestos y Cartas Membretadas en PDF
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quote Builder */}
        <div className="lg:col-span-7 bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">1. Constructor de Cotización</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase">Seleccione neumáticos y determine descuentos autorizados</p>
            </div>
            {activeQuote.length > 0 && (
              <button 
                onClick={() => setActiveQuote([])}
                className="text-[9px] text-brand-red font-black uppercase tracking-widest px-2.5 py-1 bg-brand-red/15 rounded-lg hover:bg-brand-red/20 transition-all"
              >
                Limpiar borrador
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar llanta por marca, modelo o medida (ej. Michelin, 225/50)..."
              className="w-full bg-interface-bg border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white uppercase"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tires Catalog Mini scroll */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {filteredTires.map(tire => (
              <div key={tire.id} className="p-3 bg-interface-bg/60 hover:bg-interface-bg rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-black text-white uppercase">{tire.brand} — {tire.model}</h4>
                  <p className="text-[10px] text-text-muted font-bold mt-0.5">{`${tire.width}/${tire.profile} R${tire.rim}`} • Rango de Carga: {tire.loadIndex} • Stock: <span className="text-emerald-400">{Object.values(tire.stock).reduce((a: number, b: number) => a + b, 0)} pzas</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-emerald-400 text-sm">${tire.price.toLocaleString()}</span>
                  <button
                    onClick={() => handleAddItemToQuote(tire.id)}
                    className="p-1 px-3 bg-brand-red hover:bg-brand-red/90 text-white font-black uppercase tracking-wider text-[9px] rounded-lg transition-all"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Draft Items list */}
          {activeQuote.length > 0 ? (
            <div className="border-t border-white/5 pt-4 space-y-3">
              <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Artículos en la Cotización</h4>
              {activeQuote.map(item => (
                <div key={item.productId} className="p-3 bg-interface-bg rounded-xl flex items-center justify-between text-xs">
                  <div className="flex-1">
                    <p className="font-black text-white uppercase">{item.brand} {item.model}</p>
                    <p className="text-[10px] text-text-muted font-semibold mt-0.5">${item.price.toLocaleString()} unitario</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 bg-card-bg hover:opacity-80 rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-black px-2 text-white">{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 bg-card-bg hover:opacity-80 rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-black text-white font-mono w-20 text-right">${item.total.toLocaleString()}</span>
                    <button 
                      onClick={() => handleRemoveItemFromQuote(item.productId)}
                      className="text-brand-red font-bold text-[10px] px-1 hover:underline ml-2"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}

              {/* Client Info form */}
              <form onSubmit={handleSaveQuote} className="border-t border-dashed border-white/10 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Nombre del Cliente *</label>
                    <input
                      type="text" required
                      placeholder="Ej. Luis Octavio Garza"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2 px-3 text-xs text-white uppercase font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 font-black">Teléfono de Contacto</label>
                    <input
                      type="text"
                      placeholder="899-234-5678"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest">Descuento Especial (%)</label>
                      <span className="text-[8px] bg-brand-red/15 text-brand-red font-semibold px-1 rounded uppercase">Manager</span>
                    </div>
                    <select
                      value={clientInfo.discount}
                      onChange={(e) => setClientInfo({...clientInfo, discount: parseInt(e.target.value) || 0})}
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2 px-3 text-xs text-white font-bold uppercase"
                    >
                      <option value={0}>Sin Descuento (0%)</option>
                      <option value={5}>Descuento Comercial (5%)</option>
                      <option value={10}>Descuento Volúmen (10%)</option>
                      <option value={15}>Cortesía de Sucursal (15%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Días de Vigencia</label>
                    <select
                      value={clientInfo.validityDays}
                      onChange={(e) => setClientInfo({...clientInfo, validityDays: parseInt(e.target.value) || 15})}
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2 px-3 text-xs text-white font-bold"
                    >
                      <option value={10}>10 días hábiles</option>
                      <option value={15}>15 días naturales</option>
                      <option value={30}>30 días (Mes completo)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-totals summary breakdown */}
                <div className="bg-interface-bg/60 p-4 rounded-xl border border-white/5 text-xs text-text-muted space-y-2 mt-3 font-semibold">
                  <div className="flex justify-between">
                    <span>Subtotal Bruto:</span>
                    <span className="text-white">${quoteSubtotal.toLocaleString()} MXN</span>
                  </div>
                  {clientInfo.discount > 0 && (
                    <div className="flex justify-between text-brand-red font-bold">
                      <span>Descuento aplicado ({clientInfo.discount}%):</span>
                      <span>- ${discountAmount.toLocaleString()} MXN</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>IVA Trasladado (16% sobre subtotal):</span>
                    <span className="text-white">${quoteTax.toLocaleString()} MXN</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-black text-white uppercase tracking-wider">
                    <span>Presupuesto Total Estimado:</span>
                    <span className="text-emerald-400 font-mono text-base">${quoteTotal.toLocaleString()} MXN</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Guardar & Generar Membrete de Cotización
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-black/20 p-8 rounded-xl border border-dashed border-white/10 text-center text-text-muted text-xs">
              <Sparkles className="w-8 h-8 text-brand-red mx-auto mb-3 animate-pulse" />
              <p className="font-black uppercase tracking-widest">Carrito de Cotización Vacío</p>
              <p className="text-[10px] mt-1">Busque llantas arriba para agregar productos al presupuesto formal para el cliente.</p>
            </div>
          )}
        </div>

        {/* Existing Quotes / Previews */}
        <div className="lg:col-span-5 space-y-6">
          {selectedQuoteForPrint && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white text-black p-6 rounded-2xl border-4 border-[#000] relative font-sans text-xs shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start border-b pb-3 border-gray-200">
                <div>
                  <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="h-8 w-auto object-contain" />
                  <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">Multillantas de la Frontera</p>
                </div>
                <div className="text-right text-[10px]">
                  <p className="font-black text-brand-red">{selectedQuoteForPrint.id}</p>
                  <p className="text-[8px] text-gray-400 font-mono">FECHA EMISIÓN: {selectedQuoteForPrint.date}</p>
                  <p className="text-[8px] text-brand-red uppercase font-black">VIGENCIA: {selectedQuoteForPrint.validUntil}</p>
                </div>
              </div>

              <div>
                <h4 className="font-black uppercase text-[10px] text-gray-600 mb-2">Presupuesto para Cliente:</h4>
                <p className="text-xs font-black uppercase leading-none">{selectedQuoteForPrint.clientName}</p>
                <p className="text-[10px] text-gray-500 mt-1">Teléfono: {selectedQuoteForPrint.clientPhone}</p>
                <p className="text-[9px] text-brand-blue font-black uppercase tracking-widest mt-1">Sucursal: {BRANCHES.find(b => b.id === selectedQuoteForPrint.branchId)?.name}</p>
              </div>

              <div className="border-t border-b border-gray-200 py-3 text-[10px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="font-black text-gray-500 mb-2 uppercase border-b pb-1">
                      <th>CONCEPTO</th>
                      <th className="text-center">CANT</th>
                      <th className="text-right">PRECIO</th>
                      <th className="text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuoteForPrint.items.map(i => (
                      <tr key={i.productId} className="font-semibold text-gray-900 border-none">
                        <td className="py-1 uppercase">{i.brand} {i.model}</td>
                        <td className="py-1 text-center font-mono">{i.quantity}</td>
                        <td className="py-1 text-right font-mono">${i.price.toLocaleString()}</td>
                        <td className="py-1 text-right font-mono">${i.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1 text-right text-[10px] font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono text-gray-900">${selectedQuoteForPrint.subtotal.toLocaleString()} MXN</span>
                </div>
                {selectedQuoteForPrint.discount > 0 && (
                  <div className="flex justify-between text-brand-red font-bold">
                    <span>Descuento Especial ({selectedQuoteForPrint.discount}%):</span>
                    <span className="font-mono">${(selectedQuoteForPrint.subtotal * (selectedQuoteForPrint.discount / 100)).toLocaleString()} MXN</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>IVA Trasladado (16%):</span>
                  <span className="font-mono text-gray-900">${selectedQuoteForPrint.tax.toLocaleString()} MXN</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center text-sm font-black text-gray-900">
                  <span>TOTAL NETO COTIZADO:</span>
                  <span className="text-emerald-700 font-mono text-base">${selectedQuoteForPrint.total.toLocaleString()} MXN</span>
                </div>
              </div>

              <div className="text-center text-[8px] text-gray-400 border-t pt-3 uppercase">
                <p>* Precios sujetos a cambio en fluctuaciones cambiarias de importación.</p>
                <div className="flex gap-2 justify-center mt-3">
                  <button 
                    onClick={() => {
                      alert('Cotización impresa con membrete oficial.');
                    }}
                    className="flex items-center gap-1 bg-black text-white text-[8px] font-black px-2.5 py-1 uppercase rounded-lg hover:opacity-8 hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Printer className="w-3 h-3" /> Imprimir
                  </button>
                  <button 
                    onClick={() => {
                      alert('Presupuesto enviado al correo / WhatsApp registrado.');
                    }}
                    className="flex items-center gap-1 bg-brand-red text-white text-[8px] font-black px-2.5 py-1 uppercase rounded-lg hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Mail className="w-3 h-3" /> Compartir
                  </button>
                  <button 
                    onClick={() => setSelectedQuoteForPrint(null)}
                    className="text-gray-500 text-[8px] font-black hover:underline uppercase p-1"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-blue" />
              Histórico de Cotizaciones Registradas
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {quotesList.map(q => (
                <div 
                  key={q.id} 
                  className="p-4 bg-interface-bg rounded-xl border border-white/5 space-y-2 flex justify-between items-start group hover:border-brand-red/30 transition-all cursor-pointer"
                  onClick={() => setSelectedQuoteForPrint(q)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black text-brand-red uppercase">{q.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        q.status === 'Vigente' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs font-black text-white uppercase">{q.clientName}</p>
                    <p className="text-[9px] text-text-muted font-bold uppercase">{q.items.length} skus cotizados • Fecha: {q.date}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400 font-mono">${q.total.toLocaleString()}</p>
                    <span className="text-[8px] text-text-muted uppercase font-black">Imprimir/Enviar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
