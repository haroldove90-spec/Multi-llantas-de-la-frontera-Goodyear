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
  const isGerente = false;
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
    { time: '2 min', user: 'Ana Lopez', action: 'Venta Nueva', desc: '4x Michelin Pilot Sport', branch: 'San Andres', bId: 'norte' },
    { time: '5 min', user: 'System', action: 'Alerta Stock', desc: 'Existencias críticas en Sucursal Helios', branch: 'Helios', bId: 'matriz' },
    { time: '12 min', user: 'Roberto Conta', action: 'Conciliación', desc: 'Cierre de caja autorizado', branch: 'San Andres', bId: 'norte' },
    { time: '18 min', user: 'Julian Cantón', action: 'Traspaso', desc: 'Envío recibido desde Helios', branch: 'Industrial', bId: 'sur' },
  ].filter(e => !branchId || branchId === 'all' || e.bId === branchId);

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
    <div className="space-y-8 bg-interface-bg min-h-screen text-white pb-20">
      {/* Vendedor Quick Actions */}
      {isVendedor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-48 bg-brand-red rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group transition-all shadow-2xl shadow-brand-red/20 border border-brand-red/10"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-white uppercase tracking-tighter">Nueva Venta POS</span>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest mt-1">Registrar DOT Obligatorio</span>
            </div>
          </motion.button>

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-brand-blue rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-white hover:opacity-90 transition-all shadow-lg active:scale-95 border border-brand-blue/10">
              <Package className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-widest text-center">Consultar Inventario</span>
            </button>
            <button className="bg-card-bg border-4 border-interface-bg rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 text-white hover:border-brand-blue transition-all shadow-sm active:scale-95">
              <Percent className="w-6 h-6 text-brand-red" />
              <span className="text-xs font-black uppercase tracking-widest text-text-muted text-center">Solicitar Descuento</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid - Responsive Stacking for EBITDA and Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            id: 'ebitda',
            label: hasFinancialAccess ? 'EBITDA Mensual' : 'Ventas Totales', 
            value: hasFinancialAccess ? `$${totalMargin.toLocaleString()}` : `$${totalSales.toLocaleString()}`, 
            trend: '+12.4%', 
            subtext: branchId === 'all' || !branchId ? 'Consolidado Global' : 'Esta Sucursal', 
            icon: hasFinancialAccess ? DollarSign : ShoppingCart, 
            color: 'text-brand-blue'
          },
          { 
            id: 'inventory',
            label: 'Valor Inventario', 
            value: hasFinancialAccess ? `$${(totalCost * 2.1).toLocaleString()}` : 'STOCK ACTIVO', 
            subtext: hasFinancialAccess ? 'Capital Inmovilizado' : 'Consolidado', 
            icon: Package, 
            color: 'text-white' 
          },
          { label: 'Baja Rotación (>20d)', value: TIRES.filter(t => {
            const today = new Date('2024-05-13');
            const lastMov = new Date(t.lastMovement);
            return (today.getTime() - lastMov.getTime()) / (1000 * 3600 * 24) > 20;
          }).length.toString(), trend: 'SKUs en riesgo', subtext: 'Requiere Acción', icon: AlertTriangle, color: 'text-brand-red' },
          { label: 'Garantías Abiertas', value: WARRANTIES.length.toString(), subtext: '1 Sustitución Pendiente', icon: ShieldCheck, color: 'text-brand-red' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className={`bg-card-bg p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between h-full ${
              (stat.id === 'ebitda' || stat.id === 'inventory') ? 'sm:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-6">
               <div className={`p-3 rounded-2xl bg-interface-bg border border-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
               </div>
               {stat.trend && (
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-red/10 text-brand-red'}`}>
                  {stat.trend}
                </span>
               )}
            </div>
            <div>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-black tracking-tighter text-white`}>{stat.value}</h3>
              <p className="text-[9px] text-text-muted font-black mt-2 uppercase tracking-tight">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Metrics and Live Feed Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Trends and Performance */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-card-bg p-8 rounded-[2.5rem] border border-interface-bg shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Desempeño de Ventas Semanal</h3>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Sincronización Cloud-PUE cada 5s</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest">En Línea</div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3b3b3c" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#696968', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#696968', fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#4F504D', borderRadius: '16px', border: '1px solid #282829', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    itemStyle={{ color: '#FFFFFF' }}
                  />
                  <Bar dataKey="revenue" fill="#1D66C4" radius={[6, 6, 0, 0]} barSize={40} />
                  {hasFinancialAccess && <Bar dataKey="utility" fill="#B80F16" radius={[6, 6, 0, 0]} barSize={40} />}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-interface-bg p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group border border-card-bg">
            <div className="absolute top-0 right-0 p-8">
              <TrendingUp className="w-12 h-12 text-brand-blue/20 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Rentabilidad por Canal</h3>
            <div className="space-y-6">
              {branchData.map((branch, i) => {
                const maxVal = Math.max(...branchData.map(b => b.revenue));
                const width = (branch.revenue / maxVal) * 100;
                return (
                  <div key={branch.name} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      <span>{branch.name}</span>
                      <div className="flex gap-4">
                         {hasFinancialAccess && <span className="text-white/20">COSTO: ${(branch.revenue - branch.utility).toLocaleString()}</span>}
                         <span className="text-brand-blue font-black">${(hasFinancialAccess ? branch.utility : branch.revenue).toLocaleString()} {hasFinancialAccess ? 'U.' : 'V.'}</span>
                      </div>
                    </div>
                    <div className="relative h-6 bg-white/5 rounded-lg overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: hasFinancialAccess ? `${width * 0.6}%` : `${width}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${hasFinancialAccess ? 'bg-white/10' : 'bg-brand-blue shadow-[0_0_15px_rgba(29,102,196,0.4)]'}`}
                      />
                      {hasFinancialAccess && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width * 0.4}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="h-full bg-brand-red shadow-[0_0_15px_rgba(184,15,22,0.4)]"
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
          <div className="bg-card-bg p-8 rounded-[2.5rem] border border-interface-bg shadow-xl flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-blue" />
                Live Ops Activity
              </h3>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-6">
              {liveEvents.map((event, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${
                      event.action === 'Alerta Stock' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-blue/10 text-brand-blue'
                    }`}>
                      {event.action === 'Venta Nueva' ? <ShoppingCart className="w-4 h-4" /> : 
                       event.action === 'Alerta Stock' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    {i !== liveEvents.length - 1 && <div className="w-0.5 h-8 bg-interface-bg my-2"></div>}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-black text-white uppercase tracking-tight">{event.action}</p>
                      <span className="text-[9px] font-bold text-text-muted uppercase">{event.time}</span>
                    </div>
                    <p className="text-[11px] text-white/70 font-bold mb-1">{event.desc}</p>
                    <p className="text-[9px] font-black text-brand-blue/70 uppercase tracking-widest">@{event.user} • {event.branch}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-interface-bg hover:opacity-80 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all border border-card-bg">
              Bitácora Auditoría
            </button>
          </div>

          <div className="bg-brand-red p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-red/20 border border-brand-red/10">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-sm font-black uppercase">Estatus Fiscal</h4>
                   <p className="text-[9px] font-bold text-red-100 uppercase tracking-widest">Sincronicado con SAT</p>
                </div>
             </div>
             <p className="text-xs font-bold leading-relaxed opacity-90">Todas las operaciones de hoy han sido timbradas exitosamente bajo CFDI 4.0.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
