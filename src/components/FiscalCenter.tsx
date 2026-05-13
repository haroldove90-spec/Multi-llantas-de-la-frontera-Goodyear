import React, { useState } from 'react';
import { SALES, TIRES, BRANCHES } from '../data/mockData';
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
  History,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

export default function FiscalCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Timbrada' | 'Pendiente' | 'Cancelada'>('All');

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            CONCILIACIÓN FISCAL & CFDI 4.0
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Centro de Control para Contadores y Auditoría
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
            <Download className="w-4 h-4 text-blue-400" /> Póliza CONTPAQi
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm">
            <Download className="w-4 h-4" /> Factura Global Day
          </button>
        </div>
      </div>

      {/* Fiscal Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Artículos de Baja Rotación</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-red-600">{slowRotationTires.length}</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">SKUs Estancados</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase italic">Inactivos por &gt; 20 días</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <History className="w-16 h-16 text-blue-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">IVA por Trasladar (PPD)</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-slate-800">$12,450</h4>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">Pendiente CRP</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Proyectado para conciliación</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <FileText className="w-16 h-16 text-slate-400" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Comisiones por Dispersar</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-slate-800">$8,900</h4>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Corte {today.toLocaleDateString()}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase underline cursor-pointer hover:text-blue-600">Ver desglose por vendedor</p>
        </div>
      </div>

      {/* Main Fiscal Table Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        {/* Table Filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por RFC, Folio o Cliente..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select 
              className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest bg-slate-50 border-none rounded-xl py-2.5 px-4 focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
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
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4">Folio / Fecha</th>
                <th className="px-6 py-4">RFC Receptor</th>
                <th className="px-6 py-4">Uso / Régimen</th>
                <th className="px-6 py-4">Total MXN</th>
                <th className="px-6 py-4">Estatus SAT</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">{sale.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{sale.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-600 font-mono tracking-tighter uppercase">{sale.rfcRecuper}</p>
                  </td>
                  <td className="px-6 py-4 font-mono">
                    <span className="text-[10px] font-bold text-slate-400">USO: {sale.cfdiUsage}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">${sale.total.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">IVA: ${sale.tax.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors group" title="Descargar XML">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                       </button>
                       <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors group" title="Ver PDF">
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredSales.map((sale) => (
            <div key={sale.id} className="p-6 space-y-4">
               <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-black text-slate-900 tracking-tight text-lg leading-none">{sale.id}</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{sale.date} • {sale.rfcRecuper}</p>
                  </div>
                  {getStatusBadge(sale.status)}
               </div>
               
               <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Monto Total</p>
                    <p className="text-sm font-black text-slate-800">${sale.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Forma Pago</p>
                    <p className="text-sm font-black text-slate-800">{sale.paymentForm} - {sale.paymentMethod}</p>
                  </div>
               </div>

               <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                    <Download className="w-4 h-4 text-blue-400" /> XML+PDF
                  </button>
                  <button className="px-4 py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                    <FileText className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
           <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">
             Validación ante SAT WS v4.0.2: <span className="text-green-400 font-black">OK</span>
           </p>
           <div className="flex gap-4 text-[10px] text-white/40 font-black uppercase">
             <span>PAC: INF_FISCAL_02</span>
             <span>Versión: 4.0</span>
           </div>
        </div>
      </div>

      {/* Slow Moving Inventory Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
           <AlertTriangle className="w-4 h-4 text-amber-500" /> Alerta de Baja Rotación (Utilidad en Riesgo)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slowRotationTires.map(tire => (
            <div key={tire.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all group">
               <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Ult. Venta: {tire.lastMovement}</p>
               <h5 className="font-black text-slate-900 text-sm leading-tight leading-none tracking-tight group-hover:text-blue-600 transition-colors">{tire.brand} {tire.model}</h5>
               <p className="text-[11px] text-slate-500 font-bold mt-1">{tire.width}/{tire.profile}R{tire.rim}</p>
               
               <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Costo Capital</p>
                    <p className="text-sm font-black text-slate-800">${(tire.cost * (tire.stock.matriz + tire.stock.poniente + tire.stock.sur)).toLocaleString()}</p>
                  </div>
                  <button className="p-2 bg-white rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all">
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
