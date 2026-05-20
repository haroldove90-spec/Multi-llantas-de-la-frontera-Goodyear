import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  MapPin, 
  PieChart as PieIcon, 
  Layers, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';
import { BRANCHES, TIRES, SALES } from '../data/mockData';

interface ReportsStatisticsProps {
  userRole?: string | null;
  branchId?: string | null;
}

export default function ReportsStatistics({ userRole, branchId }: ReportsStatisticsProps) {
  const [selectedMonth, setSelectedMonth] = useState('Mayo 2026');

  // Multi-branch stats
  const branchData = BRANCHES.map(branch => {
    const branchSales = SALES.filter(s => s.branchId === branch.id);
    const revenue = branchSales.reduce((acc, s) => acc + s.total, 0);
    const cost = branchSales.reduce((acc, s) => {
      return acc + s.items.reduce((itemAcc, item) => {
        const tire = TIRES.find(t => t.id === item.productId);
        return itemAcc + (tire ? tire.cost * item.quantity : 0);
      }, 0);
    }, 0);
    const utility = revenue - cost;
    return {
      name: branch.name.replace('Sucursal ', ''),
      Ventas: revenue,
      Utilidad: utility,
    };
  });

  // Monthly breakdown mock
  const monthlyTimeline = [
    { name: 'Ene', Ventas: 340000, Utilidad: 110000 },
    { name: 'Feb', Ventas: 410000, Utilidad: 140000 },
    { name: 'Mar', Ventas: 390000, Utilidad: 125000 },
    { name: 'Abr', Ventas: 520000, Utilidad: 185000 },
    { name: 'May', Ventas: 590000, Utilidad: 215000 },
  ];

  // Distribution by tire brand
  const tireBrandData = [
    { name: 'Michelin', value: 450000 },
    { name: 'Goodyear', value: 280000 },
    { name: 'BFGoodrich', value: 190000 },
    { name: 'Bridgestone', value: 210000 },
  ];

  const COLORS = ['#D4AF37', '#B80F16', '#3b82f6', '#10b981']; // Gold, Red, Blue, Emerald

  const totalSalesAll = monthlyTimeline.reduce((acc, m) => acc + m.Ventas, 0);
  const totalUtilAll = monthlyTimeline.reduce((acc, m) => acc + m.Utilidad, 0);

  const handleExportData = (format: 'csv' | 'json') => {
    const header = ['Sucursal', 'Ventas Totales', 'Utilidad Operativa', 'EBITDA %'];
    const rows = branchData.map(b => [
      b.name,
      b.Ventas.toString(),
      b.Utilidad.toString(),
      ((b.Utilidad / b.Ventas) * 100).toFixed(1) + '%'
    ]);

    let content = '';
    if (format === 'csv') {
      content = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Reporte_Consolidado_Multillantas_${selectedMonth.replace(' ', '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      content = JSON.stringify({ month: selectedMonth, branches: branchData, brands: tireBrandData }, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Backups_Frontera_${selectedMonth.replace(' ', '_')}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            REPORTES Y ESTADÍSTICAS
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            Consola Avanzada de Inteligencia de Negocios y EBITDA Corporativo
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => handleExportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-interface-bg hover:bg-white/5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-white/5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Exportar CSV
          </button>
          <button 
            onClick={() => handleExportData('json')}
            className="flex items-center gap-2 px-4 py-2 bg-interface-bg hover:bg-white/5 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-white/5"
          >
            <Download className="w-4 h-4 text-brand-red" /> Exportar JSON
          </button>
        </div>
      </header>

      {/* Financial highlighters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'EBITDA Acumulado', value: `$${totalUtilAll.toLocaleString()} MXN`, pct: '+14.2%', sub: 'Enero - Mayo 2026', desc: 'Rentabilidad Operativa Global' },
          { label: 'Facturación Global', value: `$${totalSalesAll.toLocaleString()} MXN`, pct: '+19.8%', sub: 'Sincronizado al SAT', desc: 'Ingresos Brutos Brutos' },
          { label: 'Margen Promedio', value: '34.8%', pct: 'Estable', sub: 'Target de Importación', desc: 'Retorno sobre Costo de Llantas' },
          { label: 'Crecimiento MoM', value: '+17.9%', pct: 'Favorable', sub: 'Vs Trimestre Anterior', desc: 'Velocidad de Colocación' },
        ].map((card, idx) => (
          <div key={idx} className="bg-card-bg p-5 rounded-2xl border border-interface-bg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-red/10 to-transparent rounded-bl-full"></div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{card.label}</p>
            <h4 className="text-xl font-black text-white">{card.value}</h4>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] px-1.5 py-0.5 bg-brand-red/15 text-brand-red font-black uppercase tracking-widest rounded">{card.pct}</span>
              <span className="text-[10px] font-black text-white/50">{card.sub}</span>
            </div>
            <p className="text-[9px] font-bold text-text-muted/60 uppercase mt-2 tracking-wide">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Branch Comparisons - MO Mo */}
        <div className="lg:col-span-8 bg-card-bg p-6 rounded-3xl border border-interface-bg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Evolución de Ventas & Utilidades</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase">Consolidado Mensual de Llantas y Amortizaciones</p>
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-brand-blue rounded-full"></span> Ventas</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-brand-red rounded-full"></span> Utilidad</div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#ff4d4d', fontWeight: 'bold' }} stroke="#333" />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} stroke="#333" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0 grid', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Ventas" stroke="#0066ff" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Utilidad" stroke="#ff0000" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Shares - Pie */}
        <div className="lg:col-span-4 bg-card-bg p-6 rounded-3xl border border-interface-bg shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Participación por Marca</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase">Distribución de Ingresos de Llantas Importadas</p>
          </div>
          <div className="h-56 relative flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tireBrandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tireBrandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toLocaleString()} MXN`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest leading-none">Volumen Total</p>
              <p className="text-lg font-black text-white mt-1">$1.13M</p>
            </div>
          </div>
          <div className="space-y-1.5 border-t border-white/5 pt-3">
            {tireBrandData.map((brand, i) => (
              <div key={brand.name} className="flex justify-between items-center text-[10px] font-bold uppercase">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-white">{brand.name}</span>
                </div>
                <span className="text-text-muted">${brand.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-branch dynamic performance table */}
      <div className="bg-card-bg p-6 rounded-3xl border border-interface-bg shadow-sm">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4">Métricas de Contabilidad por Sucursal</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/90">
            <thead>
              <tr className="bg-interface-bg text-text-muted text-[10px] uppercase font-bold border-b border-white/5">
                <th className="px-6 py-4">Sucursal</th>
                <th className="px-6 py-4">Ventas Brutas</th>
                <th className="px-6 py-4">Utilidad de Operación</th>
                <th className="px-6 py-4">EBITDA Estimado</th>
                <th className="px-6 py-4 text-right">Estatus Presupuesto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {branchData.map(b => (
                <tr key={b.name} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 font-black text-brand-red uppercase">{b.name}</td>
                  <td className="px-6 py-4">${b.Ventas.toLocaleString()} MXN</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">${b.Utilidad.toLocaleString()} MXN</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-brand-blue" 
                          style={{ width: `${(b.Utilidad / b.Ventas) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono font-black">{((b.Utilidad / b.Ventas) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded text-[9px] font-black uppercase tracking-wider">Cumplido</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
