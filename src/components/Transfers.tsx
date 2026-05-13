import React from 'react';
import { Truck, ArrowRight, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { TRANSFERS, BRANCHES, TIRES } from '../data/mockData';
import { motion } from 'motion/react';

export default function Transfers() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Registro de Traspasos</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Movimientos Logisticos Inter-sucursales</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20">
          <Truck className="w-4 h-4" />
          Nueva Solicitud
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'En Tránsito', count: TRANSFERS.filter(t => t.status === 'En tránsito').length, icon: Clock, color: 'text-orange-600', bg: 'bg-white' },
          { label: 'Recibidos', count: TRANSFERS.filter(t => t.status === 'Recibido').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-white' },
          { label: 'Cancelados', count: TRANSFERS.filter(t => t.status === 'Cancelado').length, icon: XCircle, color: 'text-red-500', bg: 'bg-white' },
        ].map((stat, i) => (
          <div key={stat.label} className={`${stat.bg} p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-black ${stat.color}`}>{stat.count}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg === 'bg-white' ? 'bg-slate-50' : 'bg-white/20'}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-100">
                <th className="px-6 py-4 tracking-wider">Folio / Fecha</th>
                <th className="px-6 py-4 tracking-wider">Logistica (Origen → Destino)</th>
                <th className="px-6 py-4 tracking-wider">Producto Solicitado</th>
                <th className="px-6 py-4 tracking-wider">Cantidad</th>
                <th className="px-6 py-4 tracking-wider text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
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
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{transfer.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{transfer.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-bold uppercase tracking-tight text-[11px]">{origin?.name.replace('Sucursal ', '')}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-blue-600 font-bold uppercase tracking-tight text-[11px]">{dest?.name.replace('Sucursal ', '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{tire?.brand}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{tire?.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">
                        {transfer.quantity} Unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                        transfer.status === 'Recibido' ? 'bg-green-100 text-green-700' :
                        transfer.status === 'En tránsito' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transfer.status}
                      </span>
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
