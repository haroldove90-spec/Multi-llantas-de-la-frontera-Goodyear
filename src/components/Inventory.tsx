import React, { useState } from 'react';
import { Package, Search, Filter, Plus, MoreHorizontal, ArrowRightLeft, ShoppingCart } from 'lucide-react';
import { TIRES, BRANCHES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';

interface InventoryProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Inventory({ userRole, branchId }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const isSuperAdmin = userRole === 'superadmin';
  const isGerente = false;
  const hasAccessToCost = isSuperAdmin || isGerente;
  const canManagePrice = isSuperAdmin;
  const canLoadStock = isSuperAdmin || isGerente;

  const filteredTires = TIRES.filter(tire => 
    tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-interface-bg min-h-screen text-white pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Inventario Maestro</h2>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Stock Consolidado (3 Sucursales)</p>
        </div>
        {canManagePrice && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-xl hover:opacity-90 transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-red/20 border border-brand-red/10">
              <Plus className="w-4 h-4" />
              Gestión de Precios
            </button>
          </div>
        )}
        {canLoadStock && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl hover:opacity-90 transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-blue/20 border border-brand-blue/10">
              <Plus className="w-4 h-4" />
              Carga de Proveedor
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Buscador Inteligente: 245/75R16, Marca o Modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card-bg border border-interface-bg rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none text-sm transition-all shadow-sm font-bold text-white placeholder:text-text-muted"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-card-bg border border-interface-bg text-text-muted rounded-xl hover:text-white transition-all text-xs font-black uppercase tracking-widest">
          <Filter className="w-3 h-3" />
          Filtros
        </button>
      </div>

      <div className="bg-card-bg rounded-2xl border border-interface-bg shadow-sm overflow-hidden flex flex-col">
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-interface-bg text-text-muted text-[10px] uppercase font-black sticky top-0 border-b border-card-bg">
                <th className="px-6 py-5 tracking-widest">Producto</th>
                <th className="px-6 py-5 tracking-widest">Medida / Especificación</th>
                {BRANCHES.map(branch => (
                  <th key={branch.id} className="px-6 py-5 tracking-widest text-center">{branch.name.replace('Sucursal ', '')}</th>
                ))}
                <th className="px-6 py-5 tracking-widest text-right">Precio</th>
                {hasAccessToCost && <th className="px-6 py-5 tracking-widest text-right text-emerald-400">Costo</th>}
                <th className="px-6 py-5 tracking-widest text-right">Existencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-interface-bg text-sm">
              {filteredTires.map((tire, idx) => {
                const totalStock = Object.values(tire.stock).reduce((a, b) => a + b, 0);
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    key={tire.id} 
                    className={`hover:bg-white/5 transition-colors group ${idx % 2 !== 0 ? 'bg-black/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-interface-bg rounded-lg flex items-center justify-center text-text-muted group-hover:text-brand-blue transition-colors">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase tracking-tight">{tire.brand}</span>
                          <span className="text-text-muted text-[10px] font-bold uppercase">{tire.model}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white/70">
                      <div className="flex items-center gap-2">
                        <span className="bg-interface-bg px-2 py-1 rounded text-white">{tire.width}/{tire.profile} R{tire.rim}</span>
                        <span className="text-[10px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded">{tire.type}</span>
                      </div>
                    </td>
                    {BRANCHES.map(branch => {
                      const stock = tire.stock[branch.id] || 0;
                      return (
                        <td key={branch.id} className="px-6 py-4 text-center">
                          <span className={`text-xs font-black p-2 rounded-lg ${
                            stock <= 5 ? 'bg-brand-red/10 text-brand-red' : 'text-white/80'
                          }`}>
                            {stock}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right font-black text-white">
                      ${tire.price.toLocaleString()}
                    </td>
                    {hasAccessToCost && (
                      <td className="px-6 py-4 text-right">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-black text-[11px]">
                          ${tire.cost.toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="w-8 h-8 rounded-full bg-interface-bg text-white flex items-center justify-center ml-auto font-black text-[10px] border border-card-bg">
                        {totalStock}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Smart Card View (Mobile) */}
        <div className="md:hidden divide-y divide-interface-bg p-2 bg-interface-bg">
          {filteredTires.map((tire) => (
            <div key={tire.id} className="bg-card-bg rounded-2xl mb-2 p-5 shadow-sm border border-interface-bg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tighter text-lg leading-none">{tire.brand}</h3>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-wider mt-1">{tire.model}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-lg font-black text-white">${tire.price.toLocaleString()}</span>
                   <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Precio Venta</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 py-3 border-y border-interface-bg">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Medida</span>
                  <span className="text-sm font-mono font-black text-white">{tire.width}/{tire.profile} R{tire.rim}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Especificación</span>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-interface-bg rounded uppercase text-white"> {tire.type}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded uppercase">{tire.loadIndex}{tire.speedRating}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {BRANCHES.map(branch => (
                  <div key={branch.id} className={`p-2 rounded-xl text-center border ${tire.stock[branch.id] <= 5 ? 'bg-brand-red/10 border-brand-red/20' : 'bg-interface-bg border-card-bg'}`}>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-tighter truncate">{branch.name.split(' ')[0]}</p>
                    <p className={`text-base font-black ${tire.stock[branch.id] <= 5 ? 'text-brand-red' : 'text-white'}`}>
                      {tire.stock[branch.id] || 0}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-4 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Vender
                </button>
                <button className="flex-1 py-4 bg-brand-red text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20">
                  <ArrowRightLeft className="w-4 h-4" /> Traspasar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
