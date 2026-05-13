import React from 'react';
import { BRANCHES, TIRES, SALES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';
import { 
  Store, 
  MapPin, 
  User, 
  Phone, 
  Clock, 
  TrendingUp, 
  Package, 
  ChevronRight,
  ShoppingCart
} from 'lucide-react';

interface BranchesProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Branches({ userRole, branchId }: BranchesProps) {
  return (
    <div className="space-y-8 pb-10 font-bold uppercase">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
             Red de Sucursales
          </h2>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">
            Gestión de Puntos de Venta y Centros de Servicio
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-brand-red/90 transition-all shadow-lg shadow-brand-red/20">
          <Store className="w-4 h-4" />
          Nueva Sucursal
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {BRANCHES.map((branch, idx) => {
          // Calculate branch-specific stats
          const branchSales = SALES.filter(s => s.branchId === branch.id);
          const branchRevenue = branchSales.reduce((acc, s) => acc + s.total, 0);
          const branchStock = TIRES.reduce((acc, t) => acc + (t.stock[branch.id] || 0), 0);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={branch.id}
              className="bg-card-bg rounded-2xl border border-interface-bg shadow-sm overflow-hidden flex flex-col hover:border-brand-blue/30 transition-all group"
            >
              {/* Header Image/Pattern */}
              <div className="h-24 bg-interface-bg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 flex flex-wrap gap-4 p-4 pointer-events-none">
                   {[...Array(20)].map((_, i) => <Store key={i} className="w-8 h-8" />)}
                </div>
                <div className="w-16 h-16 bg-card-bg rounded-2xl shadow-xl flex items-center justify-center z-10 group-hover:scale-110 transition-transform border border-white/5">
                  <Store className="w-8 h-8 text-brand-blue" />
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                   <h3 className="text-xl font-black text-white tracking-tight leading-none mb-2">{branch.name}</h3>
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">{branch.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-interface-bg p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Ingresos</span>
                    </div>
                    <p className="text-sm font-black text-white">${branchRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-interface-bg p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-3 h-3 text-brand-blue" />
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Unidades</span>
                    </div>
                    <p className="text-sm font-black text-white">{branchStock.toLocaleString()} Llantas</p>
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-interface-bg rounded-full flex items-center justify-center border border-white/5">
                        <User className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Gerente Administrativo</p>
                        <p className="text-xs font-bold text-white">{branch.manager}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-interface-bg rounded-full flex items-center justify-center border border-white/5">
                        <Phone className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Contacto Directo</p>
                        <p className="text-xs font-bold text-white">{branch.phone}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-interface-bg rounded-full flex items-center justify-center border border-white/5">
                        <Clock className="w-4 h-4 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Horario Laboral</p>
                        <p className="text-xs font-bold text-white">{branch.schedule}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-2">
                   <button className="flex-1 py-2.5 bg-interface-bg text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-black/40 transition-all flex items-center justify-center gap-2 border border-white/5">
                     <ShoppingCart className="w-4 h-4 text-brand-blue" /> Ver Ventas
                   </button>
                   <button className="w-12 py-2.5 bg-interface-bg text-text-muted rounded-lg hover:bg-black/40 transition-all flex items-center justify-center border border-white/5">
                     <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
