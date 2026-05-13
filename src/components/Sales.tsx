import React from 'react';
import { ShoppingCart, User, Receipt, CreditCard, Calendar, BarChart3, Plus, Download, FileText, AlertCircle } from 'lucide-react';
import { SALES, BRANCHES, TIRES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';

interface SalesProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Sales({ userRole, branchId }: SalesProps) {
  const isVendedor = userRole === 'vendedor';
  const isContador = userRole === 'contador';
  const isGerente = userRole === 'gerente';
  const isAdminOrGerente = userRole === 'superadmin' || userRole === 'gerente';

  return (
    <div className="space-y-6 relative pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Control de Ventas & Facturación</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronización Fiscal CFDI 4.0 en Tiempo Real</p>
        </div>
        {!isContador && (
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 group">
            <ShoppingCart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            Nueva Venta (DOT Obligatorio)
          </button>
        )}
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

      {/* Authorization Queue for Gerente */}
      {isAdminOrGerente && (
        <section className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-orange-900 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Autorizaciones Pendientes (Descuentos &gt; 10%)
            </h3>
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">2 Requieren Acción</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 'AUTH-901', seller: 'J. Perez', item: 'Michelin Pilot Sport 4S', discount: '15%', reason: 'Cliente Flotilla' },
              { id: 'AUTH-902', seller: 'M. Lopez', item: 'BFG All-Terrain KO2', discount: '12%', reason: 'Corte de Inventario' }
            ].map(auth => (
              <div key={auth.id} className="bg-white p-4 rounded-xl border border-orange-200 flex items-center justify-between shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-xs">
                    %
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">{auth.item}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Vendedor: {auth.seller} • Motivo: {auth.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <p className="text-xs font-black text-red-600">{auth.discount}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Solicitado</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Autorizar</button>
                  <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
                {isAdminOrGerente && <th className="px-6 py-4 tracking-wider text-center text-red-600">Auditoría</th>}
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
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-widest uppercase w-fit ${
                          sale.paymentMethod === 'PUE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-widest uppercase w-fit ${
                          sale.status === 'Timbrada' ? 'bg-emerald-100 text-emerald-700' : 
                          sale.status === 'Cancelada' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-900 text-base tracking-tight">${sale.total.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">IVA 16%: ${sale.tax.toLocaleString()}</span>
                      </div>
                    </td>
                    {isAdminOrGerente && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          {sale.status === 'Cancelada' ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[8px] font-black text-red-600 uppercase">CANCELÓ:</span>
                              <span className="text-[10px] font-bold text-slate-800 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">R. Salgado</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[8px] font-black text-emerald-600 uppercase">AUTORIZÓ:</span>
                              <span className="text-[10px] font-bold text-slate-600">SISTEMA PUE</span>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Floating Action Button for Mobile Vendedor */}
      {isVendedor && (
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 md:hidden w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center z-50 active:scale-95"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}
    </div>
  );
}
