import React from 'react';
import { Truck, ArrowRight, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { TRANSFERS, BRANCHES, TIRES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';

interface TransfersProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Transfers({ userRole, branchId }: TransfersProps) {
  const isGerente = false;
  const isSuperAdmin = userRole === 'superadmin';
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase">Registro de Traspasos</h2>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Movimientos Logisticos Inter-sucursales</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-all text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-brand-red/20">
          <Truck className="w-4 h-4" />
          Nueva Solicitud
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'En Tránsito', count: TRANSFERS.filter(t => t.status === 'En tránsito').length, icon: Clock, color: 'text-brand-red', bg: 'bg-card-bg' },
          { label: 'Recibidos', count: TRANSFERS.filter(t => t.status === 'Recibido').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-card-bg' },
          { label: 'Cancelados', count: TRANSFERS.filter(t => t.status === 'Cancelado').length, icon: XCircle, color: 'text-brand-red', bg: 'bg-card-bg' },
        ].map((stat, i) => (
          <div key={stat.label} className={`${stat.bg} p-6 rounded-xl border border-interface-bg shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.color}`}>{stat.count}</h3>
            </div>
            <div className="p-3 rounded-lg bg-interface-bg border border-white/5">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card-bg rounded-xl border border-interface-bg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-interface-bg text-text-muted text-[10px] uppercase font-bold sticky top-0 border-b border-white/5">
                <th className="px-6 py-4 tracking-wider">Folio / Fecha</th>
                <th className="px-6 py-4 tracking-wider">Logistica (Origen → Destino)</th>
                <th className="px-6 py-4 tracking-wider">Producto Solicitado</th>
                <th className="px-6 py-4 tracking-wider">Cantidad</th>
                <th className="px-6 py-4 tracking-wider text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[13px]">
              {TRANSFERS.map((transfer, idx) => {
                const origin = BRANCHES.find(b => b.id === transfer.originBranchId);
                const dest = BRANCHES.find(b => b.id === transfer.destinationBranchId);
                const tire = TIRES.find(t => t.id === transfer.productId);
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={transfer.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{transfer.id}</span>
                        <span className="text-[10px] text-text-muted font-bold uppercase">{transfer.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-text-muted font-bold uppercase tracking-tight text-[11px]">{origin?.name.replace('Sucursal ', '')}</span>
                        <ArrowRight className="w-3 h-3 text-text-muted/40" />
                        <span className="text-brand-blue font-bold uppercase tracking-tight text-[11px]">{dest?.name.replace('Sucursal ', '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{tire?.brand}</span>
                        <span className="text-[10px] text-text-muted font-medium">{tire?.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white/80">
                        {transfer.quantity} Unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                          transfer.status === 'Recibido' ? 'bg-emerald-500/20 text-emerald-400' :
                          transfer.status === 'En tránsito' ? 'bg-brand-red/20 text-brand-red' :
                          'bg-brand-red/30 text-white'
                        }`}>
                          {transfer.status}
                        </span>
                        {(isSuperAdmin || (isGerente && branchId === transfer.destinationBranchId)) && transfer.status === 'En tránsito' && (
                          <button className="text-[9px] font-black text-brand-blue uppercase border border-brand-blue/20 px-2 py-1 rounded hover:bg-brand-blue/10 transition-colors">
                            Confirmar Recepción
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
