import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Transfers from './components/Transfers';
import Warranties from './components/Warranties';
import FiscalCenter from './components/FiscalCenter';
import Branches from './components/Branches';
import BranchSelector from './components/BranchSelector';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, User, LayoutDashboard, Package, ShoppingCart, Truck, FileText, Store, LogOut, ChevronRight } from 'lucide-react';
import { BRANCHES, UserRole } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const selectedBranch = BRANCHES.find(b => b.id === selectedBranchId);

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
        return <Dashboard userRole={userRole} />;
      case 'inventory':
        return <Inventory userRole={userRole} />;
      case 'sales':
        return <Sales userRole={userRole} />;
      case 'transfers':
        return <Transfers userRole={userRole} />;
      case 'warranties':
        return <Warranties userRole={userRole} />;
      case 'fiscal':
        return <FiscalCenter userRole={userRole} />;
      case 'branches':
        return <Branches userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900 overflow-hidden h-screen">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} />
      </div>
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="md:hidden w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs" onClick={handleLogout}>LL</div>
             <div className="flex flex-col">
               <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-none">TyreTrack</h1>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[9px] font-black uppercase text-blue-600">{selectedBranch?.name}</span>
                 <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                 <span className="text-[9px] font-black uppercase text-slate-400 capitalize">{activeTab}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-4 mr-4 border-r border-slate-100 pr-6">
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-tight ${
                  userRole === 'superadmin' ? 'text-purple-600' :
                  userRole === 'gerente' ? 'text-blue-600' :
                  userRole === 'contador' ? 'text-emerald-600' : 'text-orange-600'
                }`}>
                  {userRole?.replace('_', ' ')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Sincronizado</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                title="Salir de la sucursal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center z-50">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'inventory', icon: Package },
            { id: 'sales', icon: ShoppingCart },
            { id: 'transfers', icon: Truck },
            { id: 'fiscal', icon: FileText },
            { id: 'branches', icon: Store },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`p-2 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </nav>

        {/* Bottom Status Bar Desktop */}
        <footer className="hidden md:flex h-10 bg-slate-900 text-white items-center px-8 text-[10px] justify-between shrink-0">
          <div className="flex gap-6 uppercase tracking-wider font-bold opacity-60">
            <span>Sucursales: 03</span>
            <span>Sync: OK</span>
            <span>Usuario: Admin Master</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="opacity-80 font-medium">Servidores Cloud México</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

