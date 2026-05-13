import React, { useState } from 'react';
import { Package, Search, Filter, Plus, MoreHorizontal, ArrowRightLeft, ShoppingCart } from 'lucide-react';
import { TIRES, BRANCHES } from '../data/mockData';
import { motion } from 'motion/react';

interface InventoryProps {
  userRole?: 'admin' | 'vendedor' | null;
}

export default function Inventory({ userRole }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTires = TIRES.filter(tire => 
    tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Inventario Maestro</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Stock Consolidado (3 Sucursales)</p>
        </div>
        {userRole === 'admin' && (
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20">
              <Plus className="w-4 h-4" />
              Nuevo SKU
            </button>
          </div>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por marca, modelo o medida..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all shadow-sm font-bold text-slate-600 placeholder:text-slate-300"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-xs font-black uppercase tracking-widest">
          <Filter className="w-3 h-3" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black sticky top-0 border-b border-slate-100">
                <th className="px-6 py-5 tracking-widest">Producto</th>
                <th className="px-6 py-5 tracking-widest">Medida / Especificación</th>
                <th className="px-6 py-5 tracking-widest text-center">Matriz</th>
                <th className="px-6 py-5 tracking-widest text-center">Poniente</th>
                <th className="px-6 py-5 tracking-widest text-center">Sur</th>
                <th className="px-6 py-5 tracking-widest text-right">Precio</th>
                {userRole === 'admin' && <th className="px-6 py-5 tracking-widest text-right text-emerald-600">Costo</th>}
                <th className="px-6 py-5 tracking-widest text-right">Existencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTires.map((tire, idx) => {
                const totalStock = Object.values(tire.stock).reduce((a, b) => a + b, 0);
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    key={tire.id} 
                    className={`hover:bg-blue-50/30 transition-colors group ${idx % 2 !== 0 ? 'bg-slate-50/20' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 uppercase tracking-tight">{tire.brand}</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase">{tire.model}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">{tire.width}/{tire.profile} R{tire.rim}</span>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tire.type}</span>
                      </div>
                    </td>
                    {BRANCHES.map(branch => {
                      const stock = tire.stock[branch.id] || 0;
                      return (
                        <td key={branch.id} className="px-6 py-4 text-center">
                          <span className={`text-xs font-black p-2 rounded-lg ${
                            stock <= 5 ? 'bg-red-50 text-red-600' : 'text-slate-600'
                          }`}>
                            {stock}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      ${tire.price.toLocaleString()}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 text-right">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md font-black text-[11px]">
                          ${tire.cost.toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center ml-auto font-black text-[10px]">
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
        <div className="md:hidden divide-y divide-slate-100 p-2 bg-slate-50">
          {filteredTires.map((tire) => (
            <div key={tire.id} className="bg-white rounded-2xl mb-2 p-5 shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">{tire.brand}</h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">{tire.model}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-lg font-black text-slate-900">${tire.price.toLocaleString()}</span>
                   <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Precio Venta</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Medida</span>
                  <span className="text-sm font-mono font-black text-slate-700">{tire.width}/{tire.profile} R{tire.rim}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Especificación</span>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 rounded uppercase">{tire.type}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-600 rounded uppercase">{tire.loadIndex}{tire.speedRating}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {BRANCHES.map(branch => (
                  <div key={branch.id} className={`p-2 rounded-xl text-center border ${tire.stock[branch.id] <= 5 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">{branch.name.split(' ')[0]}</p>
                    <p className={`text-base font-black ${tire.stock[branch.id] <= 5 ? 'text-red-600' : 'text-slate-800'}`}>
                      {tire.stock[branch.id] || 0}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Vender
                </button>
                <button className="flex-1 py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
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
