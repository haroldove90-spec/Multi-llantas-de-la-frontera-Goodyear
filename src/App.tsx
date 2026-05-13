import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Transfers from './components/Transfers';
import Warranties from './components/Warranties';
import FiscalCenter from './components/FiscalCenter';
import Branches from './components/Branches';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, User, LayoutDashboard, Package, ShoppingCart, Truck, FileText, Store } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'transfers':
        return <Transfers />;
      case 'warranties':
        return <Warranties />;
      case 'fiscal':
        return <FiscalCenter />;
      case 'branches':
        return <Branches />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900 overflow-hidden h-screen">
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <main className="flex-1 md:ml-64 flex flex-col h-screen min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="md:hidden w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">LL</div>
             <h1 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">TyreTrack</h1>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-bold tracking-wider uppercase">En Vivo</span>
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

