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
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Control de Ventas & Facturación</h2>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Sincronización Fiscal CFDI 4.0 en Tiempo Real</p>
        </div>
        {!isContador && (
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-red text-white rounded-xl hover:bg-brand-red/90 transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-red/20 active:scale-95 group">
            <ShoppingCart className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            Nueva Venta (DOT Obligatorio)
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Ventas de Hoy', value: '$34,450', icon: BarChart3, color: 'text-brand-blue' },
          { label: 'Facturas PUE', value: '12', icon: Receipt, color: 'text-brand-blue' },
          { label: 'Pendientes PPD', value: '3', icon: AlertCircle, color: 'text-brand-red' },
          { label: 'Met. Electrónico', value: '72%', icon: CreditCard, color: 'text-brand-blue' },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-card-bg p-5 rounded-xl border border-interface-bg shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-interface-bg rounded-lg">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-xl font-black text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Authorization Queue for Gerente */}
      {isAdminOrGerente && (
        <section className="bg-brand-red/5 border border-brand-red/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-brand-red uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Autorizaciones Pendientes (Descuentos &gt; 10%)
            </h3>
            <span className="bg-brand-red text-white text-[10px] font-black px-2 py-0.5 rounded-full">2 Requieren Acción</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 'AUTH-901', seller: 'J. Perez', item: 'Michelin Pilot Sport 4S', discount: '15%', reason: 'Cliente Flotilla' },
              { id: 'AUTH-902', seller: 'M. Lopez', item: 'BFG All-Terrain KO2', discount: '12%', reason: 'Corte de Inventario' }
            ].map(auth => (
              <div key={auth.id} className="bg-card-bg p-4 rounded-xl border border-interface-bg flex items-center justify-between shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-interface-bg rounded-lg flex items-center justify-center text-brand-red font-bold text-xs border border-white/5">
                    %
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">{auth.item}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight">Vendedor: {auth.seller} • Motivo: {auth.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <p className="text-xs font-black text-brand-red">{auth.discount}</p>
                    <p className="text-[9px] font-bold text-text-muted uppercase">Solicitado</p>
                  </div>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Autorizar</button>
                  <button className="px-4 py-2 bg-interface-bg text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black/40 transition-all border border-white/5">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="bg-card-bg rounded-xl border border-interface-bg shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-interface-bg text-text-muted text-[10px] uppercase font-bold sticky top-0 border-b border-white/5">
                <th className="px-6 py-4 tracking-wider">Folio / Fecha</th>
                <th className="px-6 py-4 tracking-wider">Sucursal / Agente</th>
                <th className="px-6 py-4 tracking-wider">Conceptos</th>
                <th className="px-6 py-4 tracking-wider">Regimen</th>
                <th className="px-6 py-4 tracking-wider text-right">Monto Total</th>
                {isAdminOrGerente && <th className="px-6 py-4 tracking-wider text-center text-brand-red">Auditoría</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[13px]">
              {SALES.map((sale, idx) => {
                const branch = BRANCHES.find(b => b.id === sale.branchId);
                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={sale.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{sale.id}</span>
                        <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold">
                          <Calendar className="w-3 h-3" />
                          <span>{sale.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-brand-blue uppercase tracking-tight">{branch?.name.replace('Sucursal ', '')}</span>
                        <div className="flex items-center gap-1 text-text-muted font-medium text-xs">
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
                            <span key={i} className="text-[10px] font-bold text-white bg-interface-bg px-1.5 py-0.5 rounded leading-none border border-white/10">
                              {item.quantity}x {tire?.brand}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-widest uppercase w-fit ${
                          sale.paymentMethod === 'PUE' ? 'bg-brand-blue/20 text-brand-blue' : 'bg-brand-red/20 text-brand-red'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] tracking-widest uppercase w-fit ${
                          sale.status === 'Timbrada' ? 'bg-emerald-500/20 text-emerald-400' : 
                          sale.status === 'Cancelada' ? 'bg-brand-red/20 text-brand-red' : 'bg-white/10 text-white'
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-white text-base tracking-tight">${sale.total.toLocaleString()}</span>
                        <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">IVA 16%: ${sale.tax.toLocaleString()}</span>
                      </div>
                    </td>
                    {isAdminOrGerente && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          {sale.status === 'Cancelada' ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[8px] font-black text-brand-red uppercase">CANCELÓ:</span>
                              <span className="text-[10px] font-bold text-white bg-brand-red/20 px-1.5 py-0.5 rounded border border-brand-red/20">R. Salgado</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[8px] font-black text-emerald-400 uppercase">AUTORIZÓ:</span>
                              <span className="text-[10px] font-bold text-text-muted">SISTEMA PUE</span>
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
          className="fixed bottom-6 right-6 md:hidden w-16 h-16 bg-brand-red text-white rounded-full shadow-2xl shadow-brand-red/40 flex items-center justify-center z-50 active:scale-95"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      )}
    </div>
  );
}
