import React from 'react';
import { ShoppingCart, User, Receipt, CreditCard, Calendar, BarChart3 } from 'lucide-react';
import { SALES, BRANCHES, TIRES } from '../data/mockData';
import { motion } from 'motion/react';

export default function Sales() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Registro de Operaciones de Venta</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cumplimiento Fiscal PUE/PPD y Control de Tickets</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-[11px] font-bold uppercase tracking-wider shadow-lg">
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          Nueva Factura
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ventas de Hoy', value: '$34,450', icon: BarChart3, color: 'text-slate-900' },
          { label: 'Facturas PUE', value: '12', icon: Receipt, color: 'text-blue-600' },
          { label: 'Pendientes PPD', value: '3', icon: AlertCircle, color: 'text-orange-600' },
          { label: 'Met. Electrónico', value: '72%', icon: CreditCard, color: 'text-slate-900' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-50 rounded-lg">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-100">
                <th className="px-6 py-4 tracking-wider">Folio / Fecha</th>
                <th className="px-6 py-4 tracking-wider">Sucursal / Agente</th>
                <th className="px-6 py-4 tracking-wider">Conceptos</th>
                <th className="px-6 py-4 tracking-wider">Regimen</th>
                <th className="px-6 py-4 tracking-wider text-right">Monto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {SALES.map((sale, idx) => {
                const branch = BRANCHES.find(b => b.id === sale.branchId);
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={sale.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{sale.id}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <Calendar className="w-3 h-3" />
                          <span>{sale.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-tight">{branch?.name.replace('Sucursal ', '')}</span>
                        <div className="flex items-center gap-1 text-slate-500 font-medium text-xs">
                          <User className="w-3 h-3" />
                          <span>{sale.sellerId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {sale.items.map((item, i) => {
                          const tire = TIRES.find(t => t.id === item.productId);
                          return (
                            <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded leading-none border border-slate-200">
                              {item.quantity}x {tire?.brand}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-widest uppercase ${
                        sale.paymentMethod === 'PUE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-900 text-base tracking-tight">${sale.total.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">IVA 16%: ${sale.tax.toLocaleString()}</span>
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

const AlertCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
