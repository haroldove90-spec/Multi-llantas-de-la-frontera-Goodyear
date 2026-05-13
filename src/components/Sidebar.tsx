import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShieldCheck, 
  ShoppingCart, 
  Store,
  ChevronRight,
  TrendingUp,
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart },
  { id: 'transfers', label: 'Traspasos', icon: Truck },
  { id: 'warranties', label: 'Garantías', icon: ShieldCheck },
  { id: 'fiscal', label: 'Centro Fiscal', icon: FileText },
  { id: 'branches', label: 'Sucursales', icon: Store },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside id="sidebar" className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
          LL
        </div>
        <span className="text-xl font-bold text-white tracking-tight">LLANTERA ERP</span>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-medium' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-4 border-t border-slate-800 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all text-xs font-semibold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Ayuda</span>
          </button>
        </div>

        <div className="p-6 bg-slate-950">
          <div className="text-[10px] text-slate-600 uppercase font-bold mb-3 tracking-[0.2em]">Usuario Activo</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">
              SD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-200 truncate">Senior Dev / Admin</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">ID: MX-2024-99</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
