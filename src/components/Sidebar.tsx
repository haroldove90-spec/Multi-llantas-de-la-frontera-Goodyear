import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShieldCheck, 
  ShoppingCart, 
  Store,
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';
import { UserRole } from '../data/mockData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole | null;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'gerente'] },
  { id: 'inventory', label: 'Inventario', icon: Package, roles: ['superadmin', 'gerente', 'contador', 'vendedor'] },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart, roles: ['superadmin', 'gerente', 'contador', 'vendedor'] },
  { id: 'transfers', label: 'Traspasos', icon: Truck, roles: ['superadmin', 'gerente'] },
  { id: 'warranties', label: 'Garantías', icon: ShieldCheck, roles: ['superadmin', 'gerente', 'vendedor'] },
  { id: 'fiscal', label: 'Centro Fiscal', icon: FileText, roles: ['superadmin', 'gerente', 'contador'] },
  { id: 'branches', label: 'Sucursales', icon: Store, roles: ['superadmin'] },
];

export default function Sidebar({ activeTab, setActiveTab, userRole }: SidebarProps) {
  const filteredNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));

  const roleColors = {
    superadmin: 'border-purple-500 text-purple-500',
    gerente: 'border-blue-500 text-blue-500',
    contador: 'border-emerald-500 text-emerald-500',
    vendedor: 'border-orange-500 text-orange-500'
  };

  return (
    <aside id="sidebar" className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800 shrink-0">
      <div className="p-6 flex flex-col gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs">TT</div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">TyreTrack</span>
        </div>
        {userRole && (
          <div className={`px-3 py-1.5 rounded-full border bg-slate-800/50 flex items-center justify-center gap-2 ${roleColors[userRole]}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]`}></div>
            <span className="text-[9px] font-black uppercase tracking-widest">{userRole.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1">
        {filteredNavItems.map((item) => {
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
              <span className="text-sm font-bold">{item.label}</span>
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
          <div className="text-[10px] text-slate-600 uppercase font-black mb-3 tracking-[0.2em]">Sincronización Cloud</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Estado: Operativo</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
