import React from 'react';
import { BRANCHES, BRANCH_SUMMARIES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';
import { Store, TrendingUp, AlertTriangle, ChevronRight, ShieldCheck, UserCog, Calculator, ShoppingBag } from 'lucide-react';

interface BranchSelectorProps {
  onSelect: (branchId: string, role: UserRole) => void;
}

export default function BranchSelector({ onSelect }: BranchSelectorProps) {
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

  const roles: { id: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'superadmin', label: 'Administrador', icon: ShieldCheck, color: 'bg-brand-red', desc: 'Control Total y Auditoría' },
    { id: 'gerente', label: 'Técnico / Asesor', icon: UserCog, color: 'bg-brand-blue', desc: 'Gestión Técnica e Inventario' },
    { id: 'contador', label: 'Contador', icon: Calculator, color: 'bg-emerald-600', desc: 'Reportes y Centro Fiscal' },
    { id: 'vendedor', label: 'Vendedor', icon: ShoppingBag, color: 'bg-orange-500', desc: 'Punto de Venta y Cotización' },
  ];

  return (
    <div className="min-h-screen bg-interface-bg text-white flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl w-full py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-6"
          >
             <div 
               className={`flex items-center justify-center rounded-3xl overflow-hidden ${theme.showLogoContainer ? 'bg-brand-red p-6 shadow-2xl shadow-brand-red/20' : ''}`}
               style={{ 
                 width: theme.showLogoContainer ? `calc(${theme.logoSizeHome || 120}px * 1.5)` : 'auto', 
                 height: theme.showLogoContainer ? `calc(${theme.logoSizeHome || 120}px * 1.5)` : 'auto' 
               }}
             >
               <img 
                 src="https://appdesign.appdesignproyectos.com/multillantas.png" 
                 alt="Logo" 
                 style={{ width: `${theme.logoSizeHome || 120}px` }} 
                 className="object-contain" 
               />
             </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">
            {(theme.dashboardTitle || 'Multillantas de la Frontera').split(' ')[0]} <span className="text-brand-red">{(theme.dashboardTitle || 'Multillantas de la Frontera').split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-text-muted font-bold text-lg uppercase tracking-[0.3em]">Seleccione Sucursal de Operación</p>
        </div>

        {/* Home: Branch Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {BRANCHES.map((branch, idx) => {
            const summary = BRANCH_SUMMARIES.find(s => s.branchId === branch.id);
            return (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-card-bg border-4 border-transparent hover:border-brand-red rounded-[3rem] p-10 shadow-black/50 shadow-2xl transition-all duration-500 flex flex-col h-full relative overflow-hidden">
                  {/* Decorative Background Icon */}
                  <Store className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 group-hover:text-brand-red/10 transition-colors" />

                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-interface-bg rounded-3xl flex items-center justify-center text-brand-blue mb-8 border border-white/5 shadow-2xl shadow-black/50">
                      <Store className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3 group-hover:text-brand-red transition-colors text-white">{branch.name}</h3>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-10">{branch.location}</p>

                    <div className="space-y-4 mb-10">
                      <div className="flex items-center justify-between p-4 bg-interface-bg rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Ventas Hoy</span>
                        <span className="text-lg font-black text-brand-blue">${summary?.dailySales.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-interface-bg rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Personal</span>
                        <span className="text-lg font-black text-white">{summary?.employeeCount}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6 text-center italic">Elegir Perfil de Acceso</p>
                      <div className="grid grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <button 
                            key={role.id}
                            onClick={() => onSelect(branch.id, role.id)}
                            className="bg-interface-bg p-4 rounded-2xl border border-white/5 hover:bg-brand-red hover:border-brand-red transition-all group/role text-center overflow-hidden"
                          >
                            <role.icon className="w-5 h-5 mx-auto mb-2 text-brand-red group-hover/role:text-white transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-tighter group-hover/role:text-white transition-colors text-white">{role.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* System Info */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4 p-1 bg-card-bg border border-interface-bg rounded-full px-6 py-2">
            <span className="text-[10px] font-black text-brand-blue uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></div>
              Server: Cloud-MX-01
            </span>
            <span className="text-white/10">|</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              DB: Goodyear Secure
            </span>
          </div>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">
            Multillantas de la Frontera <span className="text-white/20">© 2026</span>
          </p>
        </div>
      </div>
    </div>
  );
}
