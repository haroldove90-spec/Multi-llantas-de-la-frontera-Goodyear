import React, { useState, useEffect } from 'react';
import Sidebar, { navItems, getOrderedNavItems } from './components/Sidebar';
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
import LoginForm from './components/LoginForm';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, User, LayoutDashboard, Package, ShoppingCart, Truck, FileText, Store, LogOut, ChevronRight, Menu, ShieldCheck, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
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
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('erp_user_name') || null);
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('erp_user_email') || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Dynamic Exchange Rate state
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('erp_exchange_rate');
    return saved ? parseFloat(saved) : 18.50;
  });
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState('18.50');

  useEffect(() => {
    setRateInput(exchangeRate.toString());
  }, [exchangeRate, isEditingRate]);
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

  const applyExchangeRate = async (rateValue: number, persistToDb: boolean = true) => {
    const cleanRate = Number(Math.max(1, rateValue).toFixed(2));
    setExchangeRate(cleanRate);
    localStorage.setItem('erp_exchange_rate', cleanRate.toString());
    
    // Notify locally in real-time
    window.dispatchEvent(new CustomEvent('erp-exchange-rate-updated', { detail: cleanRate }));

    // Persist to Supabase if requested and connected
    if (persistToDb && supabase) {
      try {
        const savedTheme = localStorage.getItem('erp_theme');
        const parsedTheme = savedTheme ? JSON.parse(savedTheme) : theme;
        await supabase
          .from('app_config')
          .upsert({ id: 'global', theme: parsedTheme, exchange_rate: cleanRate });
      } catch (err) {
        console.error('Error persisting exchange rate to Supabase:', err);
      }
    }
  };

  // Sync with Supabase
  useEffect(() => {
    const fetchConfig = async () => {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('app_config')
        .select('theme, exchange_rate')
        .eq('id', 'global')
        .single();
      
      if (data) {
        if (data.theme) applyTheme(data.theme);
        if (data.exchange_rate) {
          const rateVal = parseFloat(data.exchange_rate);
          setExchangeRate(rateVal);
          localStorage.setItem('erp_exchange_rate', rateVal.toString());
          window.dispatchEvent(new CustomEvent('erp-exchange-rate-updated', { detail: rateVal }));
        }
      } else if (error && error.code === 'PGRST116') {
        const savedTheme = localStorage.getItem('erp_theme');
        const parsedTheme = savedTheme ? JSON.parse(savedTheme) : theme;
        await supabase.from('app_config').upsert({ id: 'global', theme: parsedTheme, exchange_rate: exchangeRate });
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
          if (payload.new) {
            if (payload.new.theme) applyTheme(payload.new.theme);
            if (payload.new.exchange_rate) {
              const rateVal = parseFloat(payload.new.exchange_rate);
              setExchangeRate(rateVal);
              localStorage.setItem('erp_exchange_rate', rateVal.toString());
              window.dispatchEvent(new CustomEvent('erp-exchange-rate-updated', { detail: rateVal }));
            }
          }
        })
        .subscribe();
    }

    const handleThemeUpdate = (e: any) => {
      applyTheme(e.detail);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'erp_exchange_rate' && e.newValue) {
        const rateVal = parseFloat(e.newValue);
        if (!isNaN(rateVal)) {
          setExchangeRate(rateVal);
          window.dispatchEvent(new CustomEvent('erp-exchange-rate-updated', { detail: rateVal }));
        }
      }
    };

    window.addEventListener('theme-update', handleThemeUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('theme-update', handleThemeUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Active tab safety redirect
  useEffect(() => {
    if (userRole) {
      const allowedItems = getOrderedNavItems(userRole);
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

  const handleLoginSuccess = (name: string, email: string, role: UserRole, branchId: string) => {
    setUserName(name);
    setUserEmail(email);
    setUserRole(role);
    setRealRole(role);
    localStorage.setItem('erp_user_name', name);
    localStorage.setItem('erp_user_email', email);
    localStorage.setItem('erp_user_role', role);
    localStorage.setItem('erp_real_role', role);

    // If superadmin, default branch to 'all' (Corporativo Global)
    // Non-superadmins are locked strictly to their pre-configured branch
    const targetBranch = role === 'superadmin' ? 'all' : branchId;
    setSelectedBranchId(targetBranch);
    localStorage.setItem('erp_selected_branch', targetBranch);
    
    const orderedItems = getOrderedNavItems(role);
    const initialTab = orderedItems.length > 0 ? orderedItems[0].id : 'inventory';
    setActiveTab(initialTab);
    localStorage.setItem('erp_active_tab', initialTab);
  };

  const handleLogout = () => {
    setSelectedBranchId(null);
    setUserRole(null);
    setRealRole(null);
    setUserName(null);
    setUserEmail(null);
    localStorage.removeItem('erp_selected_branch');
    localStorage.removeItem('erp_user_role');
    localStorage.removeItem('erp_real_role');
    localStorage.removeItem('erp_active_tab');
    localStorage.removeItem('erp_user_name');
    localStorage.removeItem('erp_user_email');
  };

  const handleSimulateRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('erp_user_role', role);
    // Adjust view context of simulated roles dynamically
    const allowedItems = getOrderedNavItems(role);
    const activeTabAllowed = allowedItems.some(item => item.id === activeTab);
    if (!activeTabAllowed && allowedItems.length > 0) {
      const initialTab = allowedItems[0].id;
      setActiveTab(initialTab);
      localStorage.setItem('erp_active_tab', initialTab);
    }
  };

  const handleUpdateTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('erp_active_tab', tab);
  };

  // If there's no authenticated user, require beautiful Total Black LoginForm first
  if (!userRole || !userName) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userRole={userRole} branchId={selectedBranchId} userName={userName} />;
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
                </p>                 <div className="flex items-center gap-1 mt-1 md:hidden">
                  {realRole === 'superadmin' ? (
                    <select
                      value={selectedBranchId || 'all'}
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        localStorage.setItem('erp_selected_branch', e.target.value);
                      }}
                      className="bg-black/80 text-brand-blue text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded border border-white/5 outline-none focus:border-brand-red cursor-pointer"
                    >
                      <option value="all">Corp. Global</option>
                      {BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[9px] font-black uppercase text-brand-blue">{selectedBranch?.name}</span>
                  )}
                  <ChevronRight className="w-2.5 h-2.5 text-text-muted" />
                  <span className="text-[9px] font-black uppercase text-text-muted capitalize">{activeTab}</span>
                </div>
              </div>
              <div className="hidden md:flex flex-col">
                <div className="flex items-center gap-1">
                  {realRole === 'superadmin' ? (
                    <select
                      value={selectedBranchId || 'all'}
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        localStorage.setItem('erp_selected_branch', e.target.value);
                      }}
                      className="bg-black/65 text-brand-blue text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-xl border border-zinc-900 outline-none focus:border-brand-red cursor-pointer font-bold hover:bg-neutral-900 transition-all shadow-inner"
                    >
                      <option value="all">CORPORATIVO (5 SUCURSALES)</option>
                      {BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>SUCURSAL: {b.name.toUpperCase()}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-brand-blue">{selectedBranch?.name}</span>
                  )}
                  <ChevronRight className="w-2.5 h-2.5 text-text-muted" />
                  <span className="text-[10px] font-black uppercase text-text-muted capitalize tracking-widest italic">{activeTab}</span>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            {/* Widget de Tipo de Cambio usd/mxn */}
            <div className="flex items-center gap-2 bg-neutral-950 border border-zinc-900 rounded-xl px-3 py-1.5 shadow-inner">
              <TrendingUp className="w-3.5 h-3.5 text-[#ffb700] shrink-0" />
              <div className="flex flex-col pt-0.5">
                <span className="text-[7px] text-zinc-500 font-extrabold uppercase tracking-wider leading-none">Tipo de Cambio</span>
                <span className="text-[11px] font-black text-[#ffb700] tracking-tight leading-none mt-0.5">
                  $ {exchangeRate.toFixed(2)} MXN
                </span>
              </div>
              {userRole === 'superadmin' ? (
                <button
                  type="button"
                  onClick={() => setIsEditingRate(true)}
                  className="ml-2 bg-brand-red/10 hover:bg-brand-red border border-brand-red/30 hover:border-brand-red text-brand-red hover:text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  Ajustar
                </button>
              ) : (
                <span className="ml-2 bg-zinc-900 text-zinc-500 text-[7px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                  Fis.
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-interface-bg pr-6 border-zinc-900">
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-black text-white tracking-tight uppercase leading-none mb-1">
                  {userName}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-tight ${
                  userRole === 'superadmin' ? 'text-brand-red' :
                  userRole === 'contador' ? 'text-emerald-500' :
                  userRole === 'secretaria_facturista' ? 'text-pink-500' :
                  userRole === 'credito_cobranza' ? 'text-cyan-500' : 'text-orange-500'
                }`}>
                  {userRole?.replace(/_/g, ' ')}
                </span>
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                  {realRole === 'superadmin' && userRole !== 'superadmin' ? 'Vista Simulada' : 'Sincronizado'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-interface-bg text-text-muted hover:text-brand-red rounded-lg transition-all"
                title="Cerrar sesión"
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

        {/* Modal para Modificar Tipo de Cambio */}
        {isEditingRate && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-950 border-2 border-[#ffb700] rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl relative"
            >
              <div className="text-center space-y-2">
                <span className="p-3 bg-[#ffb700]/10 text-[#ffb700] rounded-2xl inline-block">
                  <DollarSign className="w-6 h-6" />
                </span>
                <h3 className="text-md font-black uppercase text-white tracking-wider">Ajustar Tipo de Cambio</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">
                  USD/MXN (Sincronizado con todas las sucursales y roles)
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffb700] font-black text-lg">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    placeholder="18.50"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-full bg-black border-2 border-zinc-900 rounded-2xl py-4 pl-8 pr-4 text-center text-xl text-white font-black hover:border-zinc-800 focus:border-[#ffb700] outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">MXN</span>
                </div>

                {/* Accesos rápidos de cambio */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '-0.10', action: () => setRateInput(prev => (Math.max(1, (parseFloat(prev) || 18.5) - 0.1)).toFixed(2)) },
                    { label: '+0.10', action: () => setRateInput(prev => ((parseFloat(prev) || 18.5) + 0.1).toFixed(2)) },
                    { label: '18.00', action: () => setRateInput('18.00') },
                    { label: '19.00', action: () => setRateInput('19.00') }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={preset.action}
                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black text-[10px] py-2 px-1 rounded-xl transition-all border border-zinc-800 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#ffb700]/5 p-3 rounded-2xl border border-[#ffb700]/10 text-center">
                <p className="text-[9px] text-[#ffb700] font-semibold uppercase leading-normal">
                  🚀 Al modificar el valor del tipo de cambio, los precios, prospecciones y cotizaciones se sincronizarán en tiempo real para todos los roles.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingRate(false)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(rateInput);
                    if (!isNaN(val) && val > 0) {
                      applyExchangeRate(val, true);
                    }
                    setIsEditingRate(false);
                  }}
                  className="w-full py-3 bg-[#ffb700] hover:bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
                      { id: 'vendedor', label: 'Vendedor', color: 'bg-orange-500' }
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
            <span>Sucursales: 05</span>
            <span>Sync: OK</span>
            <span>Usuario: {userName || 'Invitado'}</span>
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

