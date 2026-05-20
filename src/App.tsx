import React, { useState, useEffect } from 'react';
import Sidebar, { navItems } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Transfers from './components/Transfers';
import Warranties from './components/Warranties';
import FiscalCenter from './components/FiscalCenter';
import Branches from './components/Branches';
import Customization from './components/Customization';
import BranchSelector from './components/BranchSelector';
import Notifications from './components/Notifications';
import Help from './components/Help';
import ClientsNotes from './components/ClientsNotes';
import OrdersCredits from './components/OrdersCredits';
import CreditsCenter from './components/CreditsCenter';
import AccountsPayable from './components/AccountsPayable';
import ReportsStatistics from './components/ReportsStatistics';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, User, LayoutDashboard, Package, ShoppingCart, Truck, FileText, Store, LogOut, ChevronRight, Menu, ShieldCheck } from 'lucide-react';
import { BRANCHES, UserRole } from './data/mockData';
import { supabase } from './lib/supabase';

const DEFAULT_THEME = { 
  dashboardTitle: 'Multillantas de la Frontera', 
  dashboardSubtitle: 'Sistema de Gestión Integral',
  logoSize: 32,
  logoSizeTablet: 28,
  logoSizeMobile: 24,
  logoSizeHome: 100,
  showLogoContainer: false,
  dashboardTitleFontSize: 16,
  dashboardSubtitleFontSize: 10,
  primaryBg: '#000000',
  cardBg: '#0a0a0a',
  brandRed: '#ff0000',
  brandBlue: '#0066ff',
  textMuted: '#d1d1d1'
};

export default function App() {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('erp_active_tab') || 'dashboard');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(() => localStorage.getItem('erp_selected_branch'));
  const [userRole, setUserRole] = useState<UserRole | null>(() => localStorage.getItem('erp_user_role') as UserRole || null);
  const [realRole, setRealRole] = useState<UserRole | null>(() => localStorage.getItem('erp_real_role') as UserRole || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<any>(() => {
    const saved = localStorage.getItem('erp_theme');
    if (saved) {
      try {
        return { ...DEFAULT_THEME, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_THEME;
      }
    }
    return DEFAULT_THEME;
  });

  const applyTheme = (themeData: any) => {
    if (!themeData) return;
    const root = document.documentElement;
    root.style.setProperty('--color-interface-bg', themeData.primaryBg || DEFAULT_THEME.primaryBg);
    root.style.setProperty('--color-card-bg', themeData.cardBg || DEFAULT_THEME.cardBg);
    root.style.setProperty('--color-brand-red', themeData.brandRed || DEFAULT_THEME.brandRed);
    root.style.setProperty('--color-brand-blue', themeData.brandBlue || DEFAULT_THEME.brandBlue);
    root.style.setProperty('--color-text-muted', themeData.textMuted || DEFAULT_THEME.textMuted);
    root.style.setProperty('--logo-size', `${themeData.logoSize || DEFAULT_THEME.logoSize}px`);
    root.style.setProperty('--logo-size-tablet', `${themeData.logoSizeTablet || DEFAULT_THEME.logoSizeTablet}px`);
    root.style.setProperty('--logo-size-mobile', `${themeData.logoSizeMobile || DEFAULT_THEME.logoSizeMobile}px`);
    root.style.setProperty('--logo-size-home', `${themeData.logoSizeHome || DEFAULT_THEME.logoSizeHome}px`);
    root.style.setProperty('--dashboard-title-size', `${themeData.dashboardTitleFontSize || DEFAULT_THEME.dashboardTitleFontSize}px`);
    root.style.setProperty('--dashboard-subtitle-size', `${themeData.dashboardSubtitleFontSize || DEFAULT_THEME.dashboardSubtitleFontSize}px`);
    root.style.setProperty('--display-logo-container', (themeData.showLogoContainer ?? DEFAULT_THEME.showLogoContainer) ? 'flex' : 'none');
    setTheme(themeData);
    localStorage.setItem('erp_theme', JSON.stringify(themeData));
  };

  // Sync with Supabase
  useEffect(() => {
    const fetchConfig = async () => {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('app_config')
        .select('theme')
        .eq('id', 'global')
        .single();
      
      if (data && data.theme) {
        applyTheme(data.theme);
      } else if (error && error.code === 'PGRST116') {
        // Table exists but record doesn't, initialize it
        await supabase.from('app_config').upsert({ id: 'global', theme: theme });
      }
    };

    fetchConfig();

    // Subscribe to changes
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('app_config_changes')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'app_config',
          filter: 'id=eq.global'
        }, (payload: any) => {
          if (payload.new && payload.new.theme) {
            applyTheme(payload.new.theme);
          }
        })
        .subscribe();
    }

    const handleThemeUpdate = (e: any) => {
      applyTheme(e.detail);
    };

    window.addEventListener('theme-update', handleThemeUpdate);
    
    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('theme-update', handleThemeUpdate);
    };
  }, []);

  // Active tab safety redirect
  useEffect(() => {
    if (userRole) {
      const allowedItems = navItems.filter(item => item.roles.includes(userRole));
      const isAllowed = allowedItems.some(item => item.id === activeTab);
      if (!isAllowed && allowedItems.length > 0) {
        setActiveTab(allowedItems[0].id);
        localStorage.setItem('erp_active_tab', allowedItems[0].id);
      }
    }
  }, [userRole, activeTab]);

  const selectedBranch = selectedBranchId === 'all' 
    ? { name: 'Corporativo Global', id: 'all' } 
    : BRANCHES.find(b => b.id === selectedBranchId);

  const handleBranchSelect = (branchId: string, role: UserRole) => {
    setSelectedBranchId(branchId);
    setUserRole(role);
    localStorage.setItem('erp_selected_branch', branchId);
    localStorage.setItem('erp_user_role', role);
    
    if (role === 'superadmin') {
      localStorage.setItem('erp_real_role', 'superadmin');
      setRealRole('superadmin');
    } else {
      localStorage.removeItem('erp_real_role');
      setRealRole(null);
    }
    
    let initialTab = 'dashboard';
    if (role !== 'superadmin') {
      if (role === 'vendedor') {
        initialTab = 'sales';
      } else if (role === 'contador') {
        initialTab = 'orders_credits';
      } else {
        const allowedItems = navItems.filter(item => item.roles.includes(role));
        initialTab = allowedItems.length > 0 ? allowedItems[0].id : 'inventory';
      }
    }
    setActiveTab(initialTab);
    localStorage.setItem('erp_active_tab', initialTab);
  };

  const handleLogout = () => {
    setSelectedBranchId(null);
    setUserRole(null);
    setRealRole(null);
    localStorage.removeItem('erp_selected_branch');
    localStorage.removeItem('erp_user_role');
    localStorage.removeItem('erp_real_role');
    localStorage.removeItem('erp_active_tab');
  };

  const handleSimulateRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('erp_user_role', role);
    // Adjust view context of simulated roles dynamically
    const filteredNavItems = navItems.filter(item => item.roles.includes(role));
    const activeTabAllowed = filteredNavItems.some(item => item.id === activeTab);
    if (!activeTabAllowed && filteredNavItems.length > 0) {
      const initialTab = filteredNavItems[0].id;
      setActiveTab(initialTab);
      localStorage.setItem('erp_active_tab', initialTab);
    }
  };

  const handleUpdateTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('erp_active_tab', tab);
  };

  if (!selectedBranchId) {
    return <BranchSelector onSelect={handleBranchSelect} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userRole={userRole} branchId={selectedBranchId} />;
      case 'inventory':
        return <Inventory userRole={userRole} branchId={selectedBranchId} />;
      case 'sales':
        return <Sales userRole={userRole} branchId={selectedBranchId} />;
      case 'clients_notes':
        return <ClientsNotes userRole={userRole} branchId={selectedBranchId} />;
      case 'orders_credits':
        return <OrdersCredits userRole={userRole} branchId={selectedBranchId} />;
      case 'transfers':
        return <Transfers userRole={userRole} branchId={selectedBranchId} />;
      case 'warranties':
        return <Warranties userRole={userRole} branchId={selectedBranchId} />;
      case 'fiscal':
        return <FiscalCenter userRole={userRole} branchId={selectedBranchId} />;
      case 'reports':
        return <ReportsStatistics userRole={userRole} branchId={selectedBranchId} />;
      case 'credits_center':
        return <CreditsCenter userRole={userRole} branchId={selectedBranchId} />;
      case 'accounts_payable':
        return <AccountsPayable userRole={userRole} branchId={selectedBranchId} />;
      case 'customization':
        return <Customization />;
      case 'branches':
        return <Branches userRole={userRole} branchId={selectedBranchId} />;
      case 'help':
        return <Help userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-interface-bg font-sans flex text-white overflow-hidden h-screen">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          handleUpdateTab(tab);
          setIsSidebarOpen(false);
        }} 
        userRole={userRole} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        realRole={realRole}
        onSimulateRole={handleSimulateRole}
      />
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card-bg border-b border-interface-bg flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden p-2 text-text-muted hover:text-white"
             >
               <Menu className="w-6 h-6" />
             </button>
              <div className="flex flex-col">
                <h1 className="font-black text-white tracking-tight leading-none uppercase" style={{ fontSize: 'var(--dashboard-title-size, 16px)' }}>
                  {theme.dashboardTitle}
                </h1>
                <p className="text-brand-blue font-black uppercase italic tracking-widest mt-1 hidden md:block" style={{ fontSize: 'var(--dashboard-subtitle-size, 10px)' }}>
                  {theme.dashboardSubtitle}
                </p>
                <div className="flex items-center gap-1 mt-1 md:hidden">
                  <span className="text-[9px] font-black uppercase text-brand-blue">{selectedBranch?.name}</span>
                  <ChevronRight className="w-2.5 h-2.5 text-text-muted" />
                  <span className="text-[9px] font-black uppercase text-text-muted capitalize">{activeTab}</span>
                </div>
              </div>
              <div className="hidden md:flex flex-col">
               <div className="flex items-center gap-1">
                 <span className="text-[10px] font-black uppercase text-brand-blue">{selectedBranch?.name}</span>
                 <ChevronRight className="w-2.5 h-2.5 text-text-muted" />
                 <span className="text-[10px] font-black uppercase text-text-muted capitalize tracking-widest italic">{activeTab}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-interface-bg pr-6">
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-tight ${
                  userRole === 'superadmin' ? 'text-brand-red' :
                  userRole === 'contador' ? 'text-emerald-500' :
                  userRole === 'secretaria_facturista' ? 'text-pink-500' :
                  userRole === 'credito_cobranza' ? 'text-cyan-500' : 'text-orange-500'
                }`}>
                  {userRole?.replace(/_/g, ' ')}
                </span>
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
                  {realRole === 'superadmin' && userRole !== 'superadmin' ? 'Vista Simulada' : 'Sincronizado'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-interface-bg text-text-muted hover:text-brand-red rounded-lg transition-all"
                title="Salir de la sucursal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="p-1.5 text-text-muted hover:text-white transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full border-2 border-card-bg"></span>
            </button>
          </div>
        </header>

        <Notifications 
          isOpen={isNotificationsOpen} 
          onClose={() => setIsNotificationsOpen(false)} 
        />

        {/* Content Area */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {realRole === 'superadmin' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-brand-red/10 via-brand-red/5 to-black border border-brand-red/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-red/20 flex items-center justify-center text-brand-red animate-pulse">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white">Consola de Simulación de Accesos</h4>
                    <p className="text-[10px] text-text-muted font-semibold uppercase">
                      Estás viendo el portal desde la perspectiva del rol: <span className="text-brand-red font-black">{(userRole || '').replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-widest select-none hidden lg:inline">Cambiar vista rápida:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'superadmin', label: 'Admin', color: 'bg-brand-red' },
                      { id: 'contador', label: 'Contador', color: 'bg-emerald-600' },
                      { id: 'secretaria_facturista', label: 'Sec. Facturista', color: 'bg-pink-600' },
                      { id: 'credito_cobranza', label: 'Crédito', color: 'bg-cyan-600' },
                      { id: 'vendedor', label: 'Vendedor', color: 'bg-orange-500' },
                      { id: 'gerente', label: 'Técnico', color: 'bg-brand-blue' }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => handleSimulateRole(btn.id as UserRole)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                          userRole === btn.id 
                            ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20' 
                            : 'bg-interface-bg/60 text-white/70 border-white/5 hover:border-brand-red hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Bottom Status Bar Desktop */}
        <footer className="hidden md:flex h-10 bg-interface-bg text-white items-center px-8 text-[10px] justify-between shrink-0 border-t border-card-bg">
          <div className="flex gap-6 uppercase tracking-wider font-bold text-text-muted">
            <span>Sucursales: 03</span>
            <span>Sync: OK</span>
            <span>Usuario: Admin Master</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-text-muted font-medium">Servidores Cloud México</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

