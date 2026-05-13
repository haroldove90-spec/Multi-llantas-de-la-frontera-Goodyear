import React from 'react';
import { BRANCHES, BRANCH_SUMMARIES } from '../data/mockData';
import { motion } from 'motion/react';
import { Store, TrendingUp, AlertTriangle, Users, ChevronRight, LogIn } from 'lucide-react';

interface BranchSelectorProps {
  onSelect: (branchId: string, role: string) => void;
}

export default function BranchSelector({ onSelect }: BranchSelectorProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-4 shadow-2xl shadow-blue-500/20">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">TyreTrack <span className="text-blue-500">Hub</span></h1>
          <p className="text-slate-400 font-medium text-lg">Seleccione el Centro de Operaciones para comenzar</p>
        </div>

        {/* Grid de Sucursales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {BRANCHES.map((branch, idx) => {
            const summary = BRANCH_SUMMARIES.find(s => s.branchId === branch.id);
            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-500 h-full flex flex-col">
                  {/* Branch Info */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black mb-1">{branch.name}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{branch.location}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Store className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Badges de Resumen */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Ventas Día</span>
                      </div>
                      <span className="text-sm font-black text-emerald-400">${summary?.dailySales.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-300">Stock Bajo</span>
                      </div>
                      <span className="text-sm font-black text-amber-400 font-mono">{summary?.lowStockCount} SKUs</span>
                    </div>
                  </div>

                  {/* Botones de Rol */}
                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => onSelect(branch.id, 'admin')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                    >
                      <LogIn className="w-4 h-4" /> Entrar como Admin
                    </button>
                    <button 
                      onClick={() => onSelect(branch.id, 'vendedor')}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <ChevronRight className="w-4 h-4" /> Entrar como Vendedor
                    </button>
                  </div>
                </div>

                {/* Decoration background glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-500 -z-10"></div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Stats Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-4">TyreTrack Operational Hub v4.0</p>
          <div className="flex flex-wrap justify-center gap-8 text-xs font-bold text-slate-400">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Sincronización Cloud OK
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Backups Automatizados
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
