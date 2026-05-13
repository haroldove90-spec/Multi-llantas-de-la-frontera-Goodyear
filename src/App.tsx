import React, { useState } from 'react';
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
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, User, LayoutDashboard, Package, ShoppingCart, Truck, FileText, Store, LogOut, ChevronRight } from 'lucide-react';
import { BRANCHES, UserRole } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  // Apply saved theme on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('erp_theme');
    if (saved) {
      const theme = JSON.parse(saved);
      const root = document.documentElement;
      root.style.setProperty('--color-interface-bg', theme.primaryBg);
      root.style.setProperty('--color-card-bg', theme.cardBg);
      root.style.setProperty('--color-brand-red', theme.brandRed);
      root.style.setProperty('--color-brand-blue', theme.brandBlue);
      root.style.setProperty('--color-text-muted', theme.textMuted);
    }
  }, []);

  const selectedBranch = selectedBranchId === 'all' 
    ? { name: 'Corporativo Global', id: 'all' } 
    : BRANCHES.find(b => b.id === selectedBranchId);

  const handleBranchSelect = (branchId: string, role: UserRole) => {
    setSelectedBranchId(branchId);
    setUserRole(role);
    if (role === 'vendedor' || role === 'contador') {
      setActiveTab(role === 'vendedor' ? 'sales' : 'fiscal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setSelectedBranchId(null);
    setUserRole(null);
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
      case 'transfers':
        return <Transfers userRole={userRole} branchId={selectedBranchId} />;
      case 'warranties':
        return <Warranties userRole={userRole} branchId={selectedBranchId} />;
      case 'fiscal':
        return <FiscalCenter userRole={userRole} branchId={selectedBranchId} />;
      case 'customization':
        return <Customization />;
      case 'branches':
        return <Branches userRole={userRole} branchId={selectedBranchId} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-interface-bg font-sans flex text-white overflow-hidden h-screen">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      </div>
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card-bg border-b border-interface-bg flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="md:hidden w-8 h-8 bg-brand-red rounded flex items-center justify-center font-bold text-white text-xs" onClick={handleLogout}>
               <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" className="w-6" />
             </div>
             <div className="flex flex-col">
               <h1 className="text-sm md:text-base font-black text-white tracking-tight leading-none uppercase">Multillantas de la Frontera</h1>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[9px] font-black uppercase text-brand-blue">{selectedBranch?.name}</span>
                 <ChevronRight className="w-2.5 h-2.5 text-text-muted" />
                 <span className="text-[9px] font-black uppercase text-text-muted capitalize">{activeTab}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-interface-bg pr-6">
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-tight ${
                  userRole === 'superadmin' ? 'text-brand-red' :
                  userRole === 'gerente' ? 'text-brand-blue' :
                  userRole === 'contador' ? 'text-emerald-500' : 'text-orange-500'
                }`}>
                  {userRole?.replace('_', ' ')}
                </span>
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Sincronizado</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-interface-bg text-text-muted hover:text-brand-red rounded-lg transition-all"
                title="Salir de la sucursal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <button className="p-1.5 text-text-muted hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full border-2 border-card-bg"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0">
          <div className="max-w-7xl mx-auto">
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

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card-bg border-t border-interface-bg px-4 py-2 flex justify-around items-center z-50">
          {navItems.filter(item => userRole && item.roles.includes(userRole)).slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive ? 'text-brand-red' : 'text-text-muted'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
        </nav>

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

