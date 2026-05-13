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
import { SALES, BRANCHES, TIRES, TRANSFERS, WARRANTIES, UserRole } from '../data/mockData';
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
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Dashboard({ userRole, branchId }: DashboardProps) {
  const isSuperAdmin = userRole === 'superadmin';
  const isGerente = userRole === 'gerente';
  const isVendedor = userRole === 'vendedor';
  const isContador = userRole === 'contador';
  const hasFinancialAccess = isSuperAdmin; 

  // Simulation Logic: Filter totals by branch if not 'all'
  const currentSales = !branchId || branchId === 'all' 
    ? SALES 
    : SALES.filter(s => s.branchId === branchId);

  const totalSales = currentSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalCost = currentSales.reduce((acc, sale) => {
    return acc + sale.items.reduce((sum, item) => {
      const tire = TIRES.find(t => t.id === item.productId);
      return sum + (tire?.cost || 0) * item.quantity;
    }, 0);
  }, 0);
  const totalMargin = totalSales - totalCost;

  // Live Feed Simulation Data
  const liveEvents = [
    { time: '2 min', user: 'Ana Lopez', action: 'Venta Nueva', desc: '4x Michelin Pilot Sport', branch: 'Norte' },
    { time: '5 min', user: 'System', action: 'Alerta Stock', desc: 'Existencias críticas en Sucursal Centro', branch: 'Centro' },
    { time: '12 min', user: 'Roberto Conta', action: 'Conciliación', desc: 'Cierre de caja autorizado', branch: 'Norte' },
    { time: '18 min', user: 'Julian Cantón', action: 'Traspaso', desc: 'Envío recibido desde Centro', branch: 'Sur' },
  ].filter(e => !branchId || branchId === 'all' || e.branch.toLowerCase().includes(branchId.toLowerCase()));

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
      {/* Vendedor Quick Actions */}
      {isVendedor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-48 bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group transition-all shadow-2xl shadow-slate-900/40 border border-slate-800"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-white uppercase tracking-tighter">Nueva Venta POS</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Registrar DOT Obligatorio</span>
            </div>
          </motion.button>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-white hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              <Package className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-widest">Consultar Stock</span>
            </button>
            <button className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-slate-900 hover:border-blue-600 transition-all shadow-sm active:scale-95">
              <Percent className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Solicitar Descuento</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: hasFinancialAccess ? 'Ebitda Mensual' : 'Ventas Totales', 
            value: hasFinancialAccess ? `$${totalMargin.toLocaleString()}` : `$${totalSales.toLocaleString()}`, 
            trend: '+12.4%', 
            subtext: branchId === 'all' || !branchId ? 'Consolidado Global' : 'Esta Sucursal', 
            icon: hasFinancialAccess ? DollarSign : ShoppingCart, 
            color: hasFinancialAccess ? 'text-blue-600' : 'text-emerald-600' 
          },
          { label: 'Valor Inventario', value: hasFinancialAccess ? `$${(totalCost * 2.1).toLocaleString()}` : 'STOCK ACTIVO', subtext: hasFinancialAccess ? 'Capital Inmovilizado' : 'Consolidado', icon: Package, color: 'text-slate-900' },
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

      {/* Dashboard Metrics and Live Feed Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Trends and Performance */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Desempeño de Ventas Semanal</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sincronización Cloud-PUE cada 5s</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">En Línea</div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(239, 246, 255, 0.8)' }}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                  {hasFinancialAccess && <Bar dataKey="utility" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <TrendingUp className="w-12 h-12 text-blue-500/20 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Rentabilidad por Canal</h3>
            <div className="space-y-6">
              {branchData.map((branch, i) => {
                const maxVal = Math.max(...branchData.map(b => b.revenue));
                const width = (branch.revenue / maxVal) * 100;
                return (
                  <div key={branch.name} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>{branch.name}</span>
                      <div className="flex gap-4">
                         {hasFinancialAccess && <span className="text-slate-500">COSTO: ${(branch.revenue - branch.utility).toLocaleString()}</span>}
                         <span className="text-blue-400 font-black">${(hasFinancialAccess ? branch.utility : branch.revenue).toLocaleString()} {hasFinancialAccess ? 'U.' : 'V.'}</span>
                      </div>
                    </div>
                    <div className="relative h-6 bg-white/5 rounded-lg overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: hasFinancialAccess ? `${width * 0.6}%` : `${width}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${hasFinancialAccess ? 'bg-white/10' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`}
                      />
                      {hasFinancialAccess && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width * 0.4}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Simulation Feed */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Live Ops Activity
              </h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-6">
              {liveEvents.map((event, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${
                      event.action === 'Alerta Stock' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {event.action === 'Venta Nueva' ? <ShoppingCart className="w-4 h-4" /> : 
                       event.action === 'Alerta Stock' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    {i !== liveEvents.length - 1 && <div className="w-0.5 h-8 bg-slate-50 my-2"></div>}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{event.action}</p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{event.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mb-1">{event.desc}</p>
                    <p className="text-[9px] font-black text-blue-500/70 uppercase tracking-widest">@{event.user} • {event.branch}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] transition-all">
              Bitácora Auditoría
            </button>
          </div>

          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-700/20">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-sm font-black uppercase">Estatus Fiscal</h4>
                   <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest">Sincronicado con SAT</p>
                </div>
             </div>
             <p className="text-xs font-bold leading-relaxed opacity-90">Todas las operaciones de hoy han sido timbradas exitosamente bajo CFDI 4.0.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
