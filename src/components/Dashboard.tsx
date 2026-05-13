import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingCart, 
  Percent,
  Activity,
  Package,
  Truck,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SALES, BRANCHES, TIRES, TRANSFERS, WARRANTIES } from '../data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface DashboardProps {
  userRole?: 'admin' | 'vendedor' | null;
}

export default function Dashboard({ userRole }: DashboardProps) {
  // Calculate stats
  const totalSales = SALES.reduce((acc, sale) => acc + sale.total, 0);
  const totalCost = SALES.reduce((acc, sale) => {
    return acc + sale.items.reduce((itemAcc, item) => {
      const tire = TIRES.find(t => t.id === item.productId);
      return itemAcc + (tire ? tire.cost * item.quantity : 0);
    }, 0);
  }, 0);
  const totalMargin = totalSales - totalCost;

  const isAdmin = userRole === 'admin';

  // Branch Performance
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
      revenue,
      utility,
    };
  });

  // Calculate top selling tires from SALES
  const tireSalesCount: Record<string, number> = {};
  SALES.forEach(sale => {
    sale.items.forEach(item => {
      tireSalesCount[item.productId] = (tireSalesCount[item.productId] || 0) + item.quantity;
    });
  });

  const topSellingTires = TIRES
    .map(tire => ({
      brandModel: `${tire.brand} ${tire.model}`,
      totalSold: tireSalesCount[tire.id] || 0
    }))
    .filter(t => t.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const COLORS = ['#f97316', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: isAdmin ? 'Utilidad Real (Ebitda)' : 'Ventas Totales', 
            value: isAdmin ? `$${totalMargin.toLocaleString()}` : `$${totalSales.toLocaleString()}`, 
            trend: '+12.4%', 
            subtext: 'vs Mes Anterior', 
            icon: isAdmin ? DollarSign : ShoppingCart, 
            color: isAdmin ? 'text-blue-600' : 'text-emerald-600' 
          },
          { label: 'Valor Inventario', value: isAdmin ? `$${(totalCost * 2.1).toLocaleString()}` : 'STOCK ACTIVO', subtext: isAdmin ? 'Capital Inmovilizado' : 'Consolidado', icon: Package, color: 'text-slate-900' },
          { label: 'Baja Rotación (>20d)', value: TIRES.filter(t => {
            const today = new Date('2024-05-13');
            const lastMov = new Date(t.lastMovement);
            return (today.getTime() - lastMov.getTime()) / (1000 * 3600 * 24) > 20;
          }).length.toString(), trend: 'SKUs en riesgo', subtext: 'Requiere Acción', icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Garantías Abiertas', value: WARRANTIES.length.toString(), subtext: '1 Sustitución Pendiente', icon: ShieldCheck, color: 'text-red-600' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
               <stat.icon className={`w-4 h-4 ${stat.color} opacity-20`} />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
              {stat.trend && (
                <span className={`text-[10px] font-black ${stat.trend.includes('+') ? 'text-green-600' : 'text-orange-600'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-tight">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Branch Performance - Rentabilidad */}
        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              Rentabilidad de Sucursales
            </h3>
          </div>
          
          <div className="flex-1 space-y-6">
            {branchData.map((branch, i) => {
              const maxRevenue = Math.max(...branchData.map(b => b.revenue));
              const width = (branch.revenue / maxRevenue) * 100;
              return (
                <div key={branch.name} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <span>{branch.name}</span>
                    <div className="flex gap-4">
                       {isAdmin && <span className="text-slate-400">COSTO: ${(branch.revenue - branch.utility).toLocaleString()}</span>}
                       <span className="text-blue-600 font-black">${(isAdmin ? branch.utility : branch.revenue).toLocaleString()} {isAdmin ? 'U.' : 'V.'}</span>
                    </div>
                  </div>
                  <div className="relative h-5 bg-slate-100 rounded overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isAdmin ? `${width * 0.6}%` : `${width}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${isAdmin ? 'bg-slate-200 border-r border-white/20' : 'bg-blue-600'}`}
                    />
                    {isAdmin && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width * 0.4}%` }}
                        transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                        className="h-full bg-blue-600"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 leading-none">Semáforo de Inventario</p>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-red-600">STAGNANT (&gt;90d)</span>
                   <span className="text-sm font-black text-slate-800">12 SKUs</span>
                </div>
             </div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 leading-none">Ticket Promedio</p>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-blue-600">MX-ESTANDAR</span>
                   <span className="text-sm font-black text-slate-800">$8,450</span>
                </div>
             </div>
          </div>
        </div>

        {/* Top Products Donut Style Chart */}
        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-widest">Inercias de Venta por Marca</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Michelin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pirelli</span>
              </div>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingTires} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis dataKey="brandModel" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} width={120} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', shadow: 'sm', fontSize: '11px' }}
                />
                <Bar dataKey="totalSold" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
