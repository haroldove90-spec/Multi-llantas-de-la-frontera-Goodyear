import React, { useState } from 'react';
import { Package, Search, Filter, Plus, MoreHorizontal, ArrowRightLeft } from 'lucide-react';
import { TIRES, BRANCHES } from '../data/mockData';
import { motion } from 'motion/react';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTires = TIRES.filter(tire => 
    tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tire.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inventario Técnico Clave</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Stock Consolidado MULTI-SUCURSAL</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20">
            <Plus className="w-4 h-4" />
            Nuevo SKU
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar por marca, modelo o DOT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all shadow-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all text-xs font-bold uppercase tracking-wider">
          <Filter className="w-3 h-3" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-100">
                <th className="px-6 py-4 tracking-wider">Producto</th>
                <th className="px-6 py-4 tracking-wider">Medida / Especificación</th>
                <th className="px-6 py-4 tracking-wider text-center">Matriz</th>
                <th className="px-6 py-4 tracking-wider text-center">Poniente</th>
                <th className="px-6 py-4 tracking-wider text-center font-bold text-blue-600">Sur</th>
                <th className="px-6 py-4 tracking-wider text-right">Existencia</th>
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
                    className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${idx % 2 !== 0 ? 'bg-slate-50/20' : ''}`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{tire.brand}</span>
                        <span className="text-slate-500 text-[10px] font-medium">{tire.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 font-bold uppercase">
                        <span>{tire.width}/{tire.profile}R{tire.rim}</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded mx-1">{tire.type}</span>
                      </div>
                    </td>
                    {BRANCHES.map(branch => {
                      const stock = tire.stock[branch.id] || 0;
                      return (
                        <td key={branch.id} className="px-6 py-3 text-center">
                          <span className={`text-[11px] font-bold ${
                            stock <= 5 ? 'text-red-500 font-black' : 
                            branch.id === 'sur' ? 'text-blue-600' : 
                            'text-slate-700'
                          }`}>
                            {stock}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-6 py-3 text-right">
                      <span className="font-bold text-slate-900">{totalStock}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Card View (Mobile) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTires.map((tire) => (
            <div key={tire.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-slate-900 uppercase tracking-tight text-base leading-none">{tire.brand}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{tire.model}</p>
                </div>
                <span className="bg-slate-100 text-[10px] font-black px-2 py-1 rounded uppercase">{tire.type}</span>
              </div>
              
              <div className="flex items-center gap-4 py-2 border-y border-slate-50">
                <span className="text-xs font-mono font-bold text-slate-600">{tire.width}/{tire.profile}R{tire.rim}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-600">{tire.loadIndex}{tire.speedRating}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {BRANCHES.map(branch => (
                  <div key={branch.id} className="bg-slate-50 p-2 rounded-lg text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{branch.name.split(' ')[0]}</p>
                    <p className={`text-sm font-black ${tire.stock[branch.id] <= 5 ? 'text-red-500' : 'text-slate-800'}`}>
                      {tire.stock[branch.id] || 0}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">Vender</button>
                <button className="flex-1 py-3 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">Traspaso</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
