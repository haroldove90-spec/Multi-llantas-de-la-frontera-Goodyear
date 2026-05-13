import React, { useState } from 'react';
import { SALES, TIRES, BRANCHES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  AlertCircle,
  Activity,
  History,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface FiscalCenterProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function FiscalCenter({ userRole, branchId }: FiscalCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Timbrada' | 'Pendiente' | 'Cancelada'>('All');
  
  const isContador = userRole === 'contador';

  const filteredSales = SALES.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sale.rfcRecuper.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || sale.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate Slow Rotation Tires (more than 30 days without movement)
  const today = new Date('2024-05-13');
  const slowRotationTires = TIRES.filter(tire => {
    const lastMov = new Date(tire.lastMovement);
    const diffDays = Math.floor((today.getTime() - lastMov.getTime()) / (1000 * 3600 * 24));
    return diffDays > 20; // 20 days for demo purposes
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Timbrada':
        return <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="w-3 h-3"/> Timbrada</span>;
      case 'Pendiente':
        return <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider"><Clock className="w-3 h-3"/> PPD Pendiente</span>;
      case 'Cancelada':
        return <span className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-wider"><XCircle className="w-3 h-3"/> Cancelada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
            CONCILIACIÓN FISCAL SAT
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            CFDI 4.0 - Centro de Control para Contadores y Auditoría
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
            <Download className="w-4 h-4" />
            Descarga XML SAT
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-interface-bg text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black/40 transition-all shadow-lg shadow-black/20 active:scale-95 border border-white/5">
            <Download className="w-4 h-4 text-brand-blue" />
            Póliza CONTPAQi
          </button>
        </div>
      </div>

      {/* Audit Alert for Contador */}
      {isContador && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-brand-blue/10 border-l-4 border-brand-blue p-6 rounded-r-2xl flex items-center gap-4 shadow-sm"
        >
          <div className="w-12 h-12 bg-card-bg rounded-xl flex items-center justify-center text-brand-blue shadow-sm shrink-0 border border-white/5">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight mb-1">Modo Auditoría Profesional</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Acceso de solo lectura activo. Conciliación bancaria y folios fiscales habilitados.</p>
          </div>
        </motion.div>
      )}

      {/* Bank Reconciliation Section for Accountants */}
      {(isContador || userRole === 'superadmin') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-interface-bg p-8 rounded-3xl text-white shadow-2xl border border-white/5">
            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Conciliación Efectivo vs Depósitos
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Cierres de Caja (Sucursales)', value: '$145,900', status: 'ready' },
                { label: 'Ingresos Bancarios (SAT)', value: '$145,000', status: 'warning', diff: '-$900' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-white">{item.value}</p>
                  </div>
                  {item.diff && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-brand-red uppercase tracking-widest">Diferencia</p>
                      <p className="text-lg font-black text-brand-red">{item.diff}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button className="flex-1 py-4 bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">
                  Marcar como Conciliado
                </button>
                <button className="px-6 py-4 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                  Exportar Reporte
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card-bg p-8 rounded-3xl border border-interface-bg shadow-xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">Pólizas Contables</h3>
              <div className="flex gap-2">
                <button className="bg-interface-bg p-2 rounded-lg hover:bg-black/40 transition-colors border border-white/5">
                  <Download className="w-4 h-4 text-brand-blue" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'CONTPAQi i', format: 'XML/XLS', last: 'Hoy 10:20 AM' },
                { name: 'Aspel COI', format: 'TXT/POL', last: 'Ayer' },
                { name: 'SAP Business One', format: 'CSV', last: '12 May' },
              ].map((software, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-white/5 rounded-2xl hover:border-brand-blue/30 hover:shadow-sm transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-interface-bg rounded-xl flex items-center justify-center text-text-muted group-hover:text-brand-blue group-hover:bg-brand-blue/10 border border-white/5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase leading-none mb-1">{software.name}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Formato: {software.format} • Ult: {software.last}</p>
                      </div>
                   </div>
                   <button className="text-[10px] font-black text-brand-blue uppercase border border-brand-blue/20 px-4 py-2 rounded-lg hover:bg-brand-blue hover:text-white transition-all">
                      Descargar
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fiscal Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card-bg p-6 rounded-xl border border-interface-bg shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <ShieldAlert className="w-16 h-16 text-brand-red" />
          </div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Artículos de Baja Rotación</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-brand-red">{slowRotationTires.length}</h4>
            <span className="text-xs font-bold text-text-muted uppercase tracking-tight">SKUs Estancados</span>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-bold uppercase italic">Inactivos por &gt; 20 días</p>
        </div>

        <div className="bg-card-bg p-6 rounded-xl border border-interface-bg shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <History className="w-16 h-16 text-brand-blue" />
          </div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">IVA por Trasladar (PPD)</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-white">$12,450</h4>
            <span className="text-xs font-bold text-brand-blue uppercase tracking-tight">Pendiente CRP</span>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-bold uppercase">Proyectado para conciliación</p>
        </div>

        <div className="bg-card-bg p-6 rounded-xl border border-interface-bg shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <FileText className="w-16 h-16 text-white" />
          </div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Comisiones por Dispersar</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-white">$8,900</h4>
            <span className="text-xs font-bold text-text-muted uppercase tracking-tight">Corte {today.toLocaleDateString()}</span>
          </div>
          <p className="text-[10px] text-brand-blue mt-2 font-bold uppercase underline cursor-pointer hover:text-white transition-colors">Ver desglose por vendedor</p>
        </div>
      </div>

      {/* Main Fiscal Table Area */}
      <div className="bg-card-bg rounded-2xl border border-interface-bg shadow-xl overflow-hidden flex flex-col">
        {/* Table Filters */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por RFC, Folio o Cliente..." 
              className="w-full pl-10 pr-4 py-2.5 bg-interface-bg border border-white/5 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue/20 font-medium transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
            <select 
              className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 focus:ring-0 cursor-pointer hover:bg-black/40 transition-colors text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="All">Todos los Estatus</option>
              <option value="Timbrada">Timbradas</option>
              <option value="Pendiente">Pendientes PPD</option>
              <option value="Cancelada">Canceladas</option>
            </select>
          </div>
        </div>

        {/* Desktop Accountant Table */}
        <div className="hidden lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                <th className="px-6 py-4">Folio / Fecha</th>
                <th className="px-6 py-4">RFC Receptor</th>
                <th className="px-6 py-4">Uso / Régimen</th>
                <th className="px-6 py-4">Total MXN</th>
                <th className="px-6 py-4">Estatus SAT</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-white">{sale.id}</p>
                    <p className="text-[10px] text-text-muted font-bold">{sale.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-text-muted font-mono tracking-tighter uppercase">{sale.rfcRecuper}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-white">
                    <span className="text-[10px] font-bold text-text-muted">USO: {sale.cfdiUsage}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-white">${sale.total.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">IVA: ${sale.tax.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group" title="Descargar XML">
                          <FileText className="w-4 h-4 text-text-muted group-hover:text-brand-blue" />
                       </button>
                       <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group" title="Ver PDF">
                          <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-amber-500" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-white/5">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-white tracking-tight text-lg leading-none">{sale.id}</h5>
                    <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{sale.date} • {sale.rfcRecuper}</p>
                  </div>
                  {getStatusBadge(sale.status)}
               </div>
               
               <div className="grid grid-cols-2 gap-4 bg-interface-bg p-4 rounded-xl border border-white/5">
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Monto Total</p>
                    <p className="text-sm font-black text-white">${sale.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Forma Pago</p>
                    <p className="text-sm font-black text-white">{sale.paymentForm} - {sale.paymentMethod}</p>
                  </div>
               </div>

               <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-interface-bg text-white rounded-lg text-xs font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 border border-white/5">
                    <Download className="w-4 h-4 text-brand-blue" /> XML+PDF
                  </button>
                  <button className="px-4 py-3 bg-white/5 text-text-muted rounded-lg hover:bg-white/10 transition-colors border border-white/5">
                    <FileText className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="bg-interface-bg px-6 py-3 flex items-center justify-between border-t border-white/5">
           <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">
             Validación ante SAT WS v4.0.2: <span className="text-emerald-400 font-black">OK</span>
           </p>
           <div className="flex gap-4 text-[10px] text-white/40 font-black uppercase">
             <span>PAC: INF_FISCAL_02</span>
             <span>Versión: 4.0</span>
           </div>
        </div>
      </div>

      {/* Slow Moving Inventory Section */}
      <section className="bg-card-bg rounded-2xl border border-interface-bg shadow-sm p-6 overflow-hidden">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
           <AlertTriangle className="w-4 h-4 text-brand-red" /> Alerta de Baja Rotación (Utilidad en Riesgo)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slowRotationTires.map(tire => (
            <div key={tire.id} className="p-4 rounded-xl bg-interface-bg border border-white/5 hover:border-brand-red/30 transition-all group">
               <p className="text-[9px] font-black text-text-muted uppercase mb-2">Ult. Venta: {tire.lastMovement}</p>
               <h5 className="font-black text-white text-sm leading-tight leading-none tracking-tight group-hover:text-brand-blue transition-colors">{tire.brand} {tire.model}</h5>
               <p className="text-[11px] text-text-muted font-bold mt-1">{tire.width}/{tire.profile}R{tire.rim}</p>
               
               <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Costo Capital</p>
                    <p className="text-sm font-black text-white">${(tire.cost * (tire.stock.matriz + tire.stock.poniente + tire.stock.sur)).toLocaleString()}</p>
                  </div>
                  <button className="p-2 bg-card-bg rounded-lg border border-white/5 text-brand-blue hover:bg-black/40 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
