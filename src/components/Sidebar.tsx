import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShieldCheck, 
  ShoppingCart, 
  Store,
  Settings,
  HelpCircle,
  FileText,
  Palette,
  X
} from 'lucide-react';
import { UserRole } from '../data/mockData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'gerente'] },
  { id: 'inventory', label: 'Inventario', icon: Package, roles: ['superadmin', 'gerente', 'vendedor'] },
  { id: 'sales', label: 'Punto de Venta', icon: ShoppingCart, roles: ['superadmin', 'contador', 'vendedor'] },
  { id: 'transfers', label: 'Traspasos', icon: Truck, roles: ['superadmin', 'gerente'] },
  { id: 'warranties', label: 'Garantías', icon: ShieldCheck, roles: ['superadmin', 'gerente'] },
  { id: 'fiscal', label: 'Centro Fiscal', icon: FileText, roles: ['superadmin', 'contador'] },
  { id: 'customization', label: 'Personalización', icon: Palette, roles: ['superadmin'] },
  { id: 'branches', label: 'Sucursales', icon: Store, roles: ['superadmin'] },
];

export default function Sidebar({ activeTab, setActiveTab, userRole, isOpen, onClose }: SidebarProps) {
  const filteredNavItems = navItems.filter(item => userRole && item.roles.includes(userRole));
  const [theme, setTheme] = React.useState<any>(() => {
    const defaultData = { 
      dashboardTitle: 'Multillantas de la Frontera', 
      logoSize: 32,
      logoSizeTablet: 28,
      logoSizeMobile: 24,
      logoSizeHome: 100,
      showLogoContainer: false 
    };
    const saved = localStorage.getItem('erp_theme');
    if (saved) {
      try {
        return { ...defaultData, ...JSON.parse(saved) };
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  React.useEffect(() => {
    const handleThemeUpdate = (e: any) => {
      setTheme(e.detail);
    };

    window.addEventListener('theme-update', handleThemeUpdate);
    return () => window.removeEventListener('theme-update', handleThemeUpdate);
  }, []);

  const roleColors = {
    superadmin: 'border-brand-red text-brand-red',
    gerente: 'border-brand-blue text-brand-blue',
    contador: 'border-emerald-500 text-emerald-500',
    vendedor: 'border-orange-500 text-orange-500'
  };

  const roleLabels = {
    superadmin: 'Administrador',
    gerente: 'Técnico / Asesor',
    contador: 'Contador',
    vendedor: 'Vendedor'
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        id="sidebar" 
        className={`w-64 h-screen bg-card-bg text-white flex flex-col fixed left-0 top-0 border-r border-white/5 shrink-0 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex flex-col gap-4 border-b border-white/5 bg-interface-bg/30 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 md:hidden text-text-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
          {theme.showLogoContainer ? (
            <div 
              className="bg-brand-red rounded-lg flex items-center justify-center overflow-hidden shrink-0" 
              style={{ 
                width: 'var(--logo-size, 32px)',
                height: 'var(--logo-size, 32px)'
              }}
            >
              <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="w-[85%] h-[85%] object-contain" />
            </div>
          ) : (
            <div className="flex items-center">
              {/* Mobile Size */}
              <img 
                src="https://appdesign.appdesignproyectos.com/multillantas.png" 
                alt="Logo" 
                style={{ width: 'var(--logo-size-mobile, 24px)' }}
                className="object-contain shrink-0 md:hidden" 
              />
              {/* Tablet Size */}
              <img 
                src="https://appdesign.appdesignproyectos.com/multillantas.png" 
                alt="Logo" 
                style={{ width: 'var(--logo-size-tablet, 28px)' }}
                className="object-contain shrink-0 hidden md:block lg:hidden" 
              />
              {/* Desktop Size */}
              <img 
                src="https://appdesign.appdesignproyectos.com/multillantas.png" 
                alt="Logo" 
                style={{ width: 'var(--logo-size, 32px)' }}
                className="object-contain shrink-0 hidden lg:block" 
              />
            </div>
          )}
          <span 
            className="font-black tracking-tighter text-white uppercase leading-none md:hidden"
            style={{ fontSize: 'calc(var(--dashboard-title-size, 16px) * 0.8)' }}
          >
            {theme.dashboardTitle}
          </span>
        </div>
        {userRole && (
          <div className={`px-3 py-1.5 rounded-xl border bg-interface-bg flex items-center justify-center gap-2 ${roleColors[userRole]}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]`}></div>
            <span className="text-[9px] font-black uppercase tracking-widest">{roleLabels[userRole]}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-brand-red text-white font-black shadow-xl shadow-brand-red/20' 
                  : 'hover:bg-interface-bg/50 text-text-muted hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-muted group-hover:text-white'}`} />
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="sidebarActive"
                  className="absolute left-0 w-1 h-6 bg-white rounded-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-4 border-t border-interface-bg space-y-1 bg-interface-bg/10">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-interface-bg rounded-xl transition-all text-xs font-black uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-white hover:bg-interface-bg rounded-xl transition-all text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Ayuda</span>
          </button>
        </div>

        <div className="p-6 bg-interface-bg">
          <div className="text-[9px] text-text-muted uppercase font-black mb-3 tracking-[0.2em] opacity-50">Sync Cloud MX-01</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">En Línea</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
