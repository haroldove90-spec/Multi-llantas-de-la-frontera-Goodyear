import React, { useState, useEffect } from 'react';
import { Truck, ArrowRight, CheckCircle2, Clock, XCircle, Search, Plus, X, AlertTriangle, ArrowDown } from 'lucide-react';
import { TRANSFERS, BRANCHES, TIRES, UserRole, updateTransfersStorage, updateTiresStorage, Transfer, Tire } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface TransfersProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Transfers({ userRole, branchId }: TransfersProps) {
  const [transfersList, setTransfersList] = useState<Transfer[]>(() => [...TRANSFERS]);
  const [tiresList, setTiresList] = useState<Tire[]>(() => [...TIRES]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for creating a new transfer
  const [origin, setOrigin] = useState('matriz');
  const [destination, setDestination] = useState('norte');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const isSuperAdmin = userRole === 'superadmin';
  const isGerente = true; // Safe defaults for interactive applet controls

  // Listen to tires/transfers changes across this session or tabs
  useEffect(() => {
    const handleTransfersUpdate = (e: any) => {
      if (e.detail) {
        setTransfersList([...e.detail]);
      }
    };
    const handleTiresUpdate = (e: any) => {
      if (e.detail) {
        setTiresList([...e.detail]);
      }
    };
    window.addEventListener('erp-transfers-updated', handleTransfersUpdate);
    window.addEventListener('erp-tires-updated', handleTiresUpdate);
    return () => {
      window.removeEventListener('erp-transfers-updated', handleTransfersUpdate);
      window.removeEventListener('erp-tires-updated', handleTiresUpdate);
    };
  }, []);

  const selectedProduct = tiresList.find(t => t.id === selectedProductId);
  const availableStockAtOrigin = selectedProduct ? (selectedProduct.stock[origin] || 0) : 0;

  useEffect(() => {
    if (selectedProduct) {
      if (quantity > availableStockAtOrigin) {
        setFormError(`La sucursal de origen tiene stock insuficiente. Solo queda: ${availableStockAtOrigin} llantas.`);
      } else if (quantity <= 0) {
        setFormError('La cantidad a traspasar debe ser de al menos 1 unidad.');
      } else {
        setFormError(null);
      }
    } else {
      setFormError(null);
    }
  }, [quantity, origin, selectedProductId, tiresList, availableStockAtOrigin]);

  // Prevent routing transfers to the same branch
  useEffect(() => {
    if (origin === destination) {
      const fallbackDest = BRANCHES.find(b => b.id !== origin)?.id || '';
      setDestination(fallbackDest);
    }
  }, [origin, destination]);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setFormError('Debe seleccionar un producto del catálogo.');
      return;
    }
    if (origin === destination) {
      setFormError('La sucursal de origen y destino no pueden ser idénticas.');
      return;
    }
    if (quantity > availableStockAtOrigin) {
      setFormError(`Traspaso denegado: Inventario insuficiente en origen (${availableStockAtOrigin} llantas).`);
      return;
    }

    const nextId = `TR-${Date.now().toString().slice(-5)}`;
    const newTransfer: Transfer = {
      id: nextId,
      originBranchId: origin,
      destinationBranchId: destination,
      productId: selectedProductId,
      quantity: quantity,
      status: 'En tránsito',
      date: new Date().toISOString().split('T')[0]
    };

    // Reflect immediate action: Deduct stock from origin branch immediately!
    const updatedTires = tiresList.map(t => {
      if (t.id === selectedProductId) {
        const tempStock = { ...t.stock };
        tempStock[origin] = Math.max(0, (tempStock[origin] || 0) - quantity);
        return {
          ...t,
          stock: tempStock,
          lastMovement: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    updateTiresStorage(updatedTires);

    // Save transfer in storage
    const updatedTransfers = [newTransfer, ...transfersList];
    updateTransfersStorage(updatedTransfers);

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowNewModal(false);
      setSelectedProductId('');
      setQuantity(1);
    }, 1500);
  };

  const handleConfirmReception = (transferId: string) => {
    const targetTransfer = transfersList.find(t => t.id === transferId);
    if (!targetTransfer) return;

    // Reflect immediate action: Add stock to destination branch!
    const updatedTires = tiresList.map(t => {
      if (t.id === targetTransfer.productId) {
        const tempStock = { ...t.stock };
        tempStock[targetTransfer.destinationBranchId] = (tempStock[targetTransfer.destinationBranchId] || 0) + targetTransfer.quantity;
        return {
          ...t,
          stock: tempStock,
          lastMovement: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    updateTiresStorage(updatedTires);

    // Set transfer status to received
    const updatedTransfers = transfersList.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'Recibido' as const };
      }
      return t;
    });
    updateTransfersStorage(updatedTransfers);
  };

  const handleCancelTransfer = (transferId: string) => {
    const targetTransfer = transfersList.find(t => t.id === transferId);
    if (!targetTransfer) return;

    // Revert/Refund stock to origin branch if cancel was in transit
    if (targetTransfer.status === 'En tránsito') {
      const updatedTires = tiresList.map(t => {
        if (t.id === targetTransfer.productId) {
          const tempStock = { ...t.stock };
          tempStock[targetTransfer.originBranchId] = (tempStock[targetTransfer.originBranchId] || 0) + targetTransfer.quantity;
          return {
            ...t,
            stock: tempStock,
            lastMovement: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      });
      updateTiresStorage(updatedTires);
    }

    // Set transfer status to cancelled
    const updatedTransfers = transfersList.map(t => {
      if (t.id === transferId) {
        return { ...t, status: 'Cancelado' as const };
      }
      return t;
    });
    updateTransfersStorage(updatedTransfers);
  };

  // Filter list
  const filteredTransfers = transfersList.filter(t => {
    const tire = tiresList.find(p => p.id === t.productId);
    const originB = BRANCHES.find(b => b.id === t.originBranchId);
    const destB = BRANCHES.find(b => b.id === t.destinationBranchId);
    
    const term = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      (tire?.brand || '').toLowerCase().includes(term) ||
      (tire?.model || '').toLowerCase().includes(term) ||
      (originB?.name || '').toLowerCase().includes(term) ||
      (destB?.name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 text-white bg-black/90 p-4 rounded-3xl min-h-screen">
      
      {/* Upper header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Logística & Traspasos</h2>
          <p className="text-xs font-bold text-[#ffb700] uppercase tracking-widest mt-1">
            Control de envíos inter-sucursales • Movimiento inmediato de inventarios
          </p>
        </div>
        
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-red text-white hover:opacity-90 active:scale-95 transition-all rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-red/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#ffb700]" />
          Nueva Solicitud
        </button>
      </header>

      {/* Grid count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'En Tránsito', count: transfersList.filter(t => t.status === 'En tránsito').length, icon: Clock, color: 'text-brand-red', metric: 'Saliente' },
          { label: 'Recibidos', count: transfersList.filter(t => t.status === 'Recibido').length, icon: CheckCircle2, color: 'text-emerald-400', metric: 'Completado' },
          { label: 'Cancelados', count: transfersList.filter(t => t.status === 'Cancelado').length, icon: XCircle, color: 'text-zinc-500', metric: 'Revertido' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{stat.label} ({stat.metric})</p>
              <h3 className={`text-3xl font-black ${stat.color}`}>{stat.count}</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-black border border-zinc-900/40">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Análisis Logístico: Buscar por Folio, Marca, Modelo o Sucursales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-zinc-950/60 border border-zinc-900 focus:ring-1 focus:ring-[#ffb700] focus:border-transparent rounded-xl outline-none text-xs transition-all text-white placeholder:text-zinc-650 font-bold"
        />
      </div>

      {/* Table grid */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/60 text-zinc-500 text-[10px] uppercase font-black tracking-wider sticky top-0 border-b border-zinc-900">
                <th className="px-6 py-4">Folio / Fecha</th>
                <th className="px-6 py-4">Logística (Origen → Destino)</th>
                <th className="px-6 py-4">Producto Transmitido</th>
                <th className="px-6 py-4 text-center">Cantidad</th>
                <th className="px-6 py-4 text-right">Acciones / Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-bold">
                    No se encontraron traspasos con los criterios buscados.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((transfer, idx) => {
                  const originB = BRANCHES.find(b => b.id === transfer.originBranchId);
                  const destB = BRANCHES.find(b => b.id === transfer.destinationBranchId);
                  const tire = tiresList.find(t => t.id === transfer.productId);
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      key={transfer.id} 
                      className={`hover:bg-white/5 transition-colors ${idx % 2 !== 0 ? 'bg-black/20' : ''}`}
                    >
                      <td className="px-6 py-4 font-mono">
                        <div className="flex flex-col">
                          <span className="font-black text-white text-xs">{transfer.id}</span>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">{transfer.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-white font-extrabold uppercase text-[11px] bg-black px-2 py-1 rounded border border-zinc-900">
                            {originB?.name || transfer.originBranchId}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#ffb700] animate-pulse" />
                          <span className="text-[#ffb700] font-extrabold uppercase text-[11px] bg-[#ffb700]/5 px-2 py-1 rounded border border-[#ffb700]/10">
                            {destB?.name || transfer.destinationBranchId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-white uppercase text-xs">
                            {tire?.brand || 'Catálogo Master'}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-black tracking-wide">
                            {tire ? `${tire.model} (${tire.width}/${tire.profile} R${tire.rim})` : 'Producto id: ' + transfer.productId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-black text-white text-sm bg-black px-3 py-1.5 rounded-lg border border-zinc-900">
                          {transfer.quantity} <span className="text-[10px] text-zinc-500 font-bold ml-1">PZS</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {transfer.status === 'En tránsito' ? (
                            <div className="flex flex-col sm:flex-row gap-1.5 items-end justify-end">
                              <span className="px-2.5 py-1 bg-brand-red/15 text-brand-red text-[9px] font-black uppercase tracking-wider rounded border border-brand-red/20 animate-pulse">
                                EN TRÁNSITO
                              </span>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleConfirmReception(transfer.id)}
                                  className="px-2.5 py-1 bg-emerald-500 text-black hover:bg-emerald-400 transition-colors text-[9px] font-black uppercase tracking-widest rounded cursor-pointer"
                                  title="Confirmar que las llantas llegaron físicamente al destino"
                                >
                                  Recibir
                                </button>
                                <button 
                                  onClick={() => handleCancelTransfer(transfer.id)}
                                  className="px-2 py-1 bg-zinc-900 text-zinc-400 hover:text-white transition-colors text-[9px] font-bold uppercase rounded cursor-pointer"
                                  title="Cancelar traspaso y devolver piezas a origen"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : transfer.status === 'Recibido' ? (
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-500/20">
                              ✓ RECIBIDO (STOCK COMPLETADO)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded border border-zinc-950">
                              ✕ CANCELADO (STOCK DEVUELTO)
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW TRANSFER MODAL */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-850 rounded-[2rem] w-full max-w-lg p-6 relative overflow-hidden shadow-2xl space-y-5"
            >
              <div className="absolute right-4 top-4">
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="p-1.5 text-zinc-500 hover:text-white bg-black hover:bg-zinc-900 border border-zinc-850 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Info Heading */}
              <div>
                <div className="flex items-center gap-1.5 text-[#ffb700] text-[10px] font-black uppercase tracking-widest mb-1">
                  <Truck className="w-3.5 h-3.5" />
                  Orden Operativa de Reubicación
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Solicitud de Traspaso</h3>
                <p className="text-[10px] text-zinc-400 mt-1 uppercase leading-snug">
                  Los traspasos restan stock del origen de inmediato. El destino sumará las piezas una vez que se confirme la recepción manual de la mercancía.
                </p>
              </div>

              {formSuccess ? (
                <div className="py-8 text-center text-emerald-400 uppercase font-black tracking-widest flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  Traspaso registrado de inmediato
                </div>
              ) : (
                <form onSubmit={handleCreateTransfer} className="space-y-4">
                  {/* Origin selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Sucursal Origen (Descuenta)</label>
                      <select 
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb750]"
                      >
                        {BRANCHES.map(b => (
                          <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Sucursal Destino (Suma)</label>
                      <select 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-[#ffb700] outline-none focus:border-[#ffb750]"
                      >
                        {BRANCHES.map(b => (
                          <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product Catalog selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Neumático a Traspasar</label>
                    <select 
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-black border border-zinc-855 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                    >
                      <option value="">-- SELECCIONAR DEL INVENTARIO --</option>
                      {tiresList.map(t => {
                        const stk = t.stock[origin] || 0;
                        return (
                          <option key={t.id} value={t.id}>
                            {t.brand.toUpperCase()} {t.model} ({t.width}/{t.profile} R{t.rim}) - Stock Origen: {stk} pzs
                          </option>
                        );
                      })}
                    </select>

                    {selectedProductId && (
                      <p className="text-[9.5px] font-black uppercase tracking-tight text-zinc-400 mt-1 pl-1">
                        Stock Físico Real disponible para traspasar: <span className="text-[#ffb700]">{availableStockAtOrigin} piezas</span>
                      </p>
                    )}
                  </div>

                  {/* Quantity and error warnings */}
                  <div className="grid grid-cols-2 gap-3 items-center pt-2">
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Cantidad a Enviar</label>
                      <input 
                        type="number" 
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                      />
                    </div>

                    <div className="pt-4">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block text-right">Masa Logística Total:</span>
                      <span className="text-sm font-black text-white uppercase tracking-tight block text-right">
                        {quantity} Neumáticos
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Alert Banner in case of stock issues */}
                  {formError && (
                    <div className="p-3 bg-brand-red/15 border border-brand-red/25 rounded-xl text-[10px] uppercase font-black text-brand-red flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2.5 justify-end pt-3 border-t border-zinc-900">
                    <button 
                      type="button"
                      onClick={() => setShowNewModal(false)}
                      className="px-4 py-2.5 bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase transition-colors border border-zinc-850 cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button 
                      type="submit"
                      disabled={!!formError || !selectedProductId}
                      className="px-6 py-2.5 bg-brand-red text-white hover:opacity-90 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Autorizar Despacho
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
