import React from 'react';
import { BRANCHES, BRANCH_SUMMARIES, USERS, UserRole } from '../data/mockData';
import { motion } from 'motion/react';
import { Store, TrendingUp, AlertTriangle, ChevronRight, ShieldCheck, UserCog, Calculator, ShoppingBag } from 'lucide-react';

interface BranchSelectorProps {
  onSelect: (branchId: string, role: UserRole) => void;
}

export default function BranchSelector({ onSelect }: BranchSelectorProps) {
  const roles: { id: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'superadmin', label: 'SuperAdmin', icon: ShieldCheck, color: 'bg-purple-600', desc: 'Acceso Total Multi-sucursal' },
    { id: 'gerente', label: 'Gerente', icon: UserCog, color: 'bg-blue-600', desc: 'Control de Sede y Traspasos' },
    { id: 'contador', label: 'Contador', icon: Calculator, color: 'bg-emerald-600', desc: 'Solo Lectura y Reportes Fiscales' },
    { id: 'vendedor', label: 'Vendedor', icon: ShoppingBag, color: 'bg-orange-600', desc: 'Ventas y Existencias' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl w-full py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 bg-blue-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/40"
          >
            <Store className="w-10 h-10" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">TyreTrack <span className="text-blue-500">ERP</span></h1>
          <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">Portal de Acceso Multi-sucursal</p>
        </div>

        {/* Global Access for SuperAdmin */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto mb-12"
        >
          <button 
            onClick={() => onSelect('all', 'superadmin')}
            className="w-full bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 p-6 rounded-[2rem] flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-600/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-purple-400 uppercase tracking-tighter">Vista Global Corporativa</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Consolida 3 Sucursales (Sólo Dueño)</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Grid de Sucursales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {BRANCHES.map((branch, idx) => {
            const summary = BRANCH_SUMMARIES.find(s => s.branchId === branch.id);
            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-1 shadow-2xl hover:border-slate-700 transition-all duration-500"
              >
                <div className="p-8">
                  {/* Branch Identity */}
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 border border-slate-700 shadow-inner">
                      <Store className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">{branch.name}</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{branch.location}</p>
                    </div>
                  </div>

                  {/* Operational Stats (Only for context, shown to all for this selector) */}
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ventas</span>
                      </div>
                      <p className="text-sm font-black text-emerald-400">${summary?.dailySales.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 mb-2 text-amber-500">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stock Crítico</span>
                      </div>
                      <p className="text-sm font-black text-amber-400">{summary?.lowStockCount} SKUs</p>
                    </div>
                  </div>

                  {/* Acceso por Roles */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Seleccione su Rol de Acceso</p>
                    {roles.map((role) => (
                      <button 
                        key={role.id}
                        onClick={() => onSelect(branch.id, role.id)}
                        className="w-full group/btn relative overflow-hidden bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 text-left border border-white/5 active:scale-[0.98]"
                      >
                        <div className={`p-2 rounded-xl ${role.color} text-white shadow-lg shadow-black/20 group-hover/btn:scale-110 transition-transform`}>
                          <role.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{role.label}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{role.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover/btn:text-white transition-colors" />
                        
                        {/* Hover Gradient Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* System Info */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4 p-1 bg-slate-900 border border-slate-800 rounded-full px-6 py-2">
            <span className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              Server: Cloud-USA-01
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              DB: Read/Write Optimized
            </span>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
            Desarrollado por <span className="text-slate-400">App Design Solutions</span> © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
