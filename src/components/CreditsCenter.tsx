import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  MapPin, 
  Search, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Filter, 
  DollarSign,
  TrendingUp,
  Activity,
  User,
  Calendar,
  Check,
  RefreshCw,
  PhoneCall,
  Mail,
  Plus,
  Coins,
  ChevronRight
} from 'lucide-react';
import { UserRole, BRANCHES } from '../data/mockData';
import { SaleNote, PaymentType } from './Sales';

interface CreditsCenterProps {
  userRole?: UserRole | null;
  branchId?: string | null;
  singleBranchOnly?: boolean;
}

interface CreditAccount {
  id: string;
  clientName: string;
  rfc: string;
  branchId: string;
  limit: number;
  balance: number;
  daysPastDue: number;
  status: 'Vigente' | 'Vencido' | 'Bloqueado';
  notes: string;
}

export default function CreditsCenter({ userRole, branchId, singleBranchOnly = false }: CreditsCenterProps) {
  // Tabs: 'sales_credits' (Ventas a Crédito POS MSI) vs 'corporate_lines' (Líneas de crédito autorizadas)
  const [activeSubTab, setActiveSubTab] = useState<'sales_credits' | 'corporate_lines'>('sales_credits');

  // Determine access scope
  const isMultiBranch = (userRole === 'superadmin' || userRole === 'credito_cobranza') && !singleBranchOnly;
  const isReadOnly = userRole === 'superadmin';

  // Filters state
  const [activeBranchFilter, setActiveBranchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semaforoFilter, setSemaforoFilter] = useState<string>('all');

  // 1. CORPORATE CREDIT LINES STATE
  const [credits, setCredits] = useState<CreditAccount[]>([
    { id: 'CRDA-01', clientName: 'Transportes Fronterizos S.A.', rfc: 'TFR980412AA1', branchId: 'matriz', limit: 120000, balance: 45000, daysPastDue: 5, status: 'Vigente', notes: 'Buen historial de pago en Sucursal Centro / Helios.' },
    { id: 'CRDA-02', clientName: 'Juan Manuel Torres (Constructora)', rfc: 'TOMJ850615BB9', branchId: 'norte', limit: 250000, balance: 135000, daysPastDue: 45, status: 'Vencido', notes: 'Retraso de segunda factura, requiere llamada de cobranza urgente.' },
    { id: 'CRDA-03', clientName: 'Servicio de Taxi Express Centro', rfc: 'STE051020XX4', branchId: 'frontera', limit: 50000, balance: 12000, daysPastDue: 0, status: 'Vigente', notes: 'Liquidación puntual cada quincena.' },
    { id: 'CRDA-04', clientName: 'Distribuidora de Carnes Frontera', rfc: 'DCF140510E54', branchId: 'frontera', limit: 150000, balance: 148000, daysPastDue: 72, status: 'Bloqueado', notes: 'Cuenta congelada temporalmente por mora prolongada.' },
    { id: 'CRDA-05', clientName: 'Bloquera del Golfo S.A.', rfc: 'BGO101211FG1', branchId: 'norte', limit: 300000, balance: 90000, daysPastDue: 12, status: 'Vigente', notes: 'Trámite habitual de renovación anual.' },
  ]);

  // 2. POS SALES CREDITS STATE (Loaded from erp_sales_notes & synced)
  const [salesNotes, setSalesNotes] = useState<SaleNote[]>([]);

  const loadSalesNotes = () => {
    const saved = localStorage.getItem('erp_sales_notes');
    if (saved) {
      try {
        setSalesNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing sales notes', e);
      }
    } else {
      // Fallback default notes if empty
      const defaultNotes: SaleNote[] = [
        {
          id: 'NV-2026-083',
          clientName: 'Transportes Rápidos Monterrey',
          clientPhone: '818-987-6543',
          clientEmail: 'compras@rapidosmty.com',
          date: '2026-05-18',
          items: [{ productId: 'T-03', brand: 'Goodyear', model: 'EfficientGrip Performance', quantity: 6, price: 4100, total: 24600 }],
          subtotal: 24600,
          discount: 10,
          tax: 3542.4,
          total: 25682,
          paymentType: 'Crédito',
          creditMonths: 6,
          creditInstallmentsPaid: 2,
          amountPaidSoFar: 8560.66,
          status: 'Crédito Activo',
          dotCode: 'DOT 0526 GYEF',
          branchId: 'norte',
          notes: 'Crédito pre-autorizado a 6 meses sin intereses en Sucursal San Andres.'
        },
        {
          id: 'NV-2026-084',
          clientName: 'Ing. Carlos Lozano Ruiz',
          clientPhone: '899-765-4321',
          clientEmail: 'carlos_lozano@pemex.com',
          date: '2026-05-21',
          items: [{ productId: 'T-02', brand: 'Michelin', model: 'Primacy 4', quantity: 4, price: 3950, total: 15800 }],
          subtotal: 15800,
          discount: 0,
          tax: 2528,
          total: 18328,
          paymentType: 'Crédito',
          creditMonths: 3,
          creditInstallmentsPaid: 0,
          amountPaidSoFar: 0,
          status: 'Crédito Activo',
          dotCode: 'DOT 1526 MICP',
          branchId: 'matriz',
          notes: 'Pago pendiente del 3 MSI en sucursal Centro.'
        },
        {
          id: 'NV-2026-090',
          clientName: 'Felipe J. Mendoza S.',
          clientPhone: '899-112-2334',
          clientEmail: 'felipe.mendoza@mendoza.org',
          date: '2026-05-10',
          items: [{ productId: 'T-01', brand: 'Michelin', model: 'Pilot Sport 5', quantity: 4, price: 4625, total: 18500 }],
          subtotal: 18500,
          discount: 5,
          tax: 2812,
          total: 20387,
          paymentType: 'Crédito',
          creditMonths: 9,
          creditInstallmentsPaid: 9,
          amountPaidSoFar: 20387,
          status: 'Pagado',
          dotCode: 'DOT 1224 MIC5',
          branchId: 'frontera',
          notes: 'Adquirido a 9 meses sin intereses. Liquidación anticipada total.'
        }
      ];
      setSalesNotes(defaultNotes);
      localStorage.setItem('erp_sales_notes', JSON.stringify(defaultNotes));
    }
  };

  useEffect(() => {
    loadSalesNotes();

    // Event listener for in-app real-time updates
    const handleSync = () => {
      loadSalesNotes();
    };
    window.addEventListener('erp_sales_notes_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('erp_sales_notes_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter credit sales notes (only paymentType === 'Crédito')
  const posCreditNotes = salesNotes.filter(n => n.paymentType === 'Crédito');

  // Adjust corporate status
  const handleToggleStatus = (id: string, newStatus: 'Vigente' | 'Vencido' | 'Bloqueado') => {
    if (isReadOnly) return;
    setCredits(credits.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  // Register installment payment for a POS credit
  const handlePayInstallment = (noteId: string) => {
    const updated = salesNotes.map(n => {
      if (n.id === noteId && n.paymentType === 'Crédito' && n.creditMonths) {
        const curPaid = n.creditInstallmentsPaid || 0;
        const totalMonths = n.creditMonths;
        if (curPaid < totalMonths) {
          const nextPaid = curPaid + 1;
          const monthlyAmount = n.total / totalMonths;
          const reachedEnd = nextPaid === totalMonths;
          return {
            ...n,
            creditInstallmentsPaid: nextPaid,
            amountPaidSoFar: reachedEnd ? n.total : Number((monthlyAmount * nextPaid).toFixed(2)),
            status: reachedEnd ? 'Pagado' as const : 'Crédito Activo' as const
          };
        }
      }
      return n;
    });

    setSalesNotes(updated);
    localStorage.setItem('erp_sales_notes', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('erp_sales_notes_updated', { detail: updated }));
  };

  // Liquidate POS credit in raw cash full payment
  const handleSettleCreditFully = (noteId: string) => {
    const updated = salesNotes.map(n => {
      if (n.id === noteId && n.paymentType === 'Crédito' && n.creditMonths) {
        return {
          ...n,
          creditInstallmentsPaid: n.creditMonths,
          amountPaidSoFar: n.total,
          status: 'Pagado' as const
        };
      }
      return n;
    });

    setSalesNotes(updated);
    localStorage.setItem('erp_sales_notes', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('erp_sales_notes_updated', { detail: updated }));
  };

  // Quick Inject mock Sales Note on Credit for test validation
  const handleInjectMockCredit = () => {
    const randomFolio = `NV-2026-0${100 + Math.floor(Math.random() * 900)}`;
    const randomClients = [
      { name: 'Ramon de la Garza', tel: '899-231-9011', email: 'ramongarza@live.com', rfc: 'GARR850201FA1' },
      { name: 'Flotillas Fronterizas S.C.', tel: '899-771-5500', email: 'contacto@flotillasfronterizas.com', rfc: 'FFR210810LL3' },
      { name: 'Sofía Valenzuela Mendoza', tel: '899-334-0012', email: 'sofia_val@hotmail.com', rfc: 'VAMS930419TT9' }
    ];
    const pickedClient = randomClients[Math.floor(Math.random() * randomClients.length)];
    const msiOptions: (3 | 6 | 9)[] = [3, 6, 9];
    const pickedMsi = msiOptions[Math.floor(Math.random() * msiOptions.length)];
    const branchOptions = ['matriz', 'norte', 'frontera'];
    const pickedBranch = branchOptions[Math.floor(Math.random() * branchOptions.length)];

    const newMock: SaleNote = {
      id: randomFolio,
      clientName: pickedClient.name,
      clientPhone: pickedClient.tel,
      clientEmail: pickedClient.email,
      date: '2026-05-21',
      items: [
        { productId: 'T-01', brand: 'Michelin', model: 'Pilot Sport 5', quantity: 4, price: 4625, total: 18500 }
      ],
      subtotal: 18500,
      discount: 0,
      tax: 2960,
      total: 21460,
      paymentType: 'Crédito',
      creditMonths: pickedMsi,
      creditInstallmentsPaid: 0,
      amountPaidSoFar: 0,
      status: 'Crédito Activo',
      dotCode: 'DOT 2026 TEST',
      branchId: pickedBranch,
      notes: `Crédito directo de prueba ${pickedMsi} MSI generado en mostrador.`
    };

    const updated = [newMock, ...salesNotes];
    setSalesNotes(updated);
    localStorage.setItem('erp_sales_notes', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('erp_sales_notes_updated', { detail: updated }));
  };

  // Helper to resolve specific semáforo properties given a note
  const getSemaforoDetails = (note: SaleNote) => {
    const totalMonths = note.creditMonths || 3;
    const paidMonths = note.creditInstallmentsPaid || 0;
    const isLapsed = paidMonths === totalMonths;
    const debtRatio = (note.total - note.amountPaidSoFar) / note.total;

    if (isLapsed) {
      return {
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        dotClass: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
        label: 'LIQUIDADO',
        indicator: '🟢',
        statusText: `${totalMonths} de ${totalMonths} Meses Pagados`,
        percentage: 100
      };
    } else if (paidMonths === 0) {
      return {
        color: 'text-brand-red bg-brand-red/10 border-brand-red/20 animate-pulse',
        dotClass: 'bg-brand-red shadow-[0_0_8px_#ff0000]',
        label: 'MORA INICIAL (SIN PAGOS)',
        indicator: '🔴',
        statusText: `Falta Primer Pago de ${totalMonths} Meses`,
        percentage: 0
      };
    } else {
      const percentage = Math.round((paidMonths / totalMonths) * 100);
      return {
        color: 'text-[#ffb700] bg-[#ffb700]/10 border-[#ffb700]/20',
        dotClass: 'bg-[#ffb700] shadow-[0_0_8px_#ffb700]',
        label: 'Mora Control / En Curso',
        indicator: '🟡',
        statusText: `${paidMonths} de ${totalMonths} Pagados (${percentage}%)`,
        percentage
      };
    }
  };

  // Filters corporate lines
  const visibleCorporateCredits = credits.filter(c => {
    if (!isMultiBranch && branchId) {
      if (c.branchId !== branchId) return false;
    }
    if (isMultiBranch && activeBranchFilter !== 'all') {
      if (c.branchId !== activeBranchFilter) return false;
    }
    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filters POS credit transactions
  const visiblePOSCredits = posCreditNotes.filter(note => {
    // Branch Filter
    if (!isMultiBranch && branchId) {
      if (note.branchId !== branchId) return false;
    }
    if (isMultiBranch && activeBranchFilter !== 'all') {
      if (note.branchId !== activeBranchFilter) return false;
    }

    // Search Filter
    const matchesSearch = note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          note.clientPhone.includes(searchTerm);

    // Semáforo Filter
    const sf = getSemaforoDetails(note);
    let matchesSemaforo = true;
    if (semaforoFilter === 'red') {
      matchesSemaforo = note.creditInstallmentsPaid === 0 && note.status !== 'Pagado';
    } else if (semaforoFilter === 'yellow') {
      matchesSemaforo = (note.creditInstallmentsPaid || 0) > 0 && (note.creditInstallmentsPaid || 0) < (note.creditMonths || 3);
    } else if (semaforoFilter === 'green') {
      matchesSemaforo = note.status === 'Pagado' || note.creditInstallmentsPaid === note.creditMonths;
    }

    return matchesSearch && matchesSemaforo;
  });

  // Calculate dynamic count cards totals
  const totalCorpSum = visibleCorporateCredits.reduce((acc, c) => acc + c.balance, 0);
  const totalPosSum = visiblePOSCredits.reduce((acc, n) => acc + (n.total - n.amountPaidSoFar), 0);
  const totalColocada = totalCorpSum + totalPosSum;

  const totalCorpMora = visibleCorporateCredits.filter(c => c.status === 'Vencido' || c.status === 'Bloqueado').length;
  const totalPosMora = visiblePOSCredits.filter(n => n.creditInstallmentsPaid === 0 && n.status !== 'Pagado').length;
  const totalMoraCuentas = totalCorpMora + totalPosMora;

  const totalCapitalCobrado = visiblePOSCredits.reduce((acc, n) => acc + n.amountPaidSoFar, 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Banner / Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            <CreditCard className="text-brand-red w-8 h-8" /> CARTERA DE CRÉDITOS Y COBRANZA
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            {isMultiBranch 
              ? (isReadOnly ? 'CONSOLA NACIONAL DE CRÉDITO - MONITOR Y SEMÁFOROS CONTINUOS' : 'CENTRAL DIRECTIVA: GESTIÓN DE RIEGO Y CRÉDITO MULTISUCURSAL')
              : `CRÉDITOS SUCURSAL: ${BRANCHES.find(b => b.id === branchId)?.name.toUpperCase()}`
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Mock Ingestion Tester (Craft Action Item) */}
          <button
            onClick={handleInjectMockCredit}
            className="bg-brand-red/10 border border-brand-red/30 hover:bg-brand-red text-white font-black uppercase text-[10px] tracking-widest px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Sujete esto para testear el reflejo instantáneo de ventas a crédito"
          >
            <Plus className="w-3.5 h-3.5" /> Auto-Inyectar Venta a Crédito (Test)
          </button>

          {isReadOnly && (
            <div className="bg-amber-500/15 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-[#ffb700] font-bold uppercase text-[10px] tracking-widest leading-none">
              <Lock className="w-3.5 h-3.5" />
              Solo Lectura
            </div>
          )}
          {!isMultiBranch && (
            <div className="bg-brand-blue/10 border border-brand-blue/20 px-4 py-2 rounded-xl flex items-center gap-2 text-brand-blue font-bold uppercase text-[10px] tracking-widest leading-none">
              <MapPin className="w-3.5 h-3.5" />
              Filtro Local {BRANCHES.find(b => b.id === branchId)?.name.toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Credit central summary counters with dynamic calculation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Cartera Total Colocada', value: `$${totalColocada.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`, color: 'text-brand-blue', badge: 'En Calle' },
          { label: 'Cuentas en Mora Crítica (Rojo)', value: totalMoraCuentas, color: 'text-brand-red', badge: 'Alerta Semáforo' },
          { label: 'Capital POS Cobrado (MSI)', value: `$${totalCapitalCobrado.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MXN`, color: 'text-emerald-500', badge: 'Recuperado' },
          { label: 'Cuentas a Crédito POS Activas', value: posCreditNotes.length, color: 'text-[#ffb700]', badge: 'Contratadas' },
        ].map((card, i) => (
          <div key={i} className="bg-card-bg p-5 rounded-2xl border border-zinc-900 flex items-center justify-between relative overflow-hidden group hover:border-zinc-800 transition-all">
            <div className="space-y-1 z-10">
              <span className="text-[8px] font-black bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-widest">{card.badge}</span>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest pt-1">{card.label}</p>
              <h4 className="text-xl font-black text-white tracking-tight">{card.value}</h4>
            </div>
            <div className={`w-1.5 h-12 rounded-full bg-current ${card.color}`}></div>
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}
      </div>

      {/* Dual Switcher sub tabs */}
      <div className="flex border-b border-zinc-900 gap-2">
        <button
          onClick={() => setActiveSubTab('sales_credits')}
          className={`flex items-center gap-2.5 px-6 py-4.5 border-b-2 text-xs font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'sales_credits'
              ? 'border-[#ffb700] text-white bg-zinc-950 font-bold'
              : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4 text-[#ffb700]" />
          Ventas a Crédito POS (3, 6, 9 MSI)
          <span className="bg-brand-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
            {posCreditNotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('corporate_lines')}
          className={`flex items-center gap-2.5 px-6 py-4.5 border-b-2 text-xs font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'corporate_lines'
              ? 'border-brand-red text-white bg-zinc-950 font-bold'
              : 'border-transparent text-zinc-500 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-brand-red" />
          Líneas de Crédito Corporativas
          <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
            {credits.length}
          </span>
        </button>
      </div>

      {/* Filter and control panel */}
      <div className="bg-card-bg p-5 rounded-2xl border border-zinc-900 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, folio, teléfono o RFC..."
              className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white uppercase outline-none focus:border-brand-red transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* If Multi-branch, show sucursal filter */}
            {isMultiBranch && (
              <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-zinc-900">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-2">Sucursal:</span>
                <select
                  value={activeBranchFilter}
                  onChange={(e) => setActiveBranchFilter(e.target.value)}
                  className="bg-zinc-950 border-none text-[10px] font-black uppercase tracking-wider text-white select-none outline-none py-1.5 px-3 rounded-lg cursor-pointer max-w-[130px] focus:ring-1 focus:ring-brand-red"
                >
                  <option value="all">Todas (Global)</option>
                  <option value="matriz">Helios (Centro)</option>
                  <option value="norte">San Andres (Norte)</option>
                  <option value="frontera">Frontera (Este)</option>
                </select>
              </div>
            )}

            {activeSubTab === 'sales_credits' ? (
              <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-zinc-900">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-2">Semáforo:</span>
                <select
                  value={semaforoFilter}
                  onChange={(e) => setSemaforoFilter(e.target.value)}
                  className="bg-zinc-950 border-none text-[10px] font-black uppercase tracking-wider text-white select-none outline-none py-1.5 px-3 rounded-lg cursor-pointer focus:ring-1 focus:ring-brand-red"
                >
                  <option value="all">Ver Todos Semáforos</option>
                  <option value="red">🔴 Sin Abonos (Mora)</option>
                  <option value="yellow">🟡 En Proceso (Al Corriente)</option>
                  <option value="green">🟢 Liquidado (Completado)</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-zinc-900">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest px-2">Estado Cuenta:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-950 border-none text-[10px] font-black uppercase tracking-wider text-white select-none outline-none py-1.5 px-3 rounded-lg cursor-pointer focus:ring-1 focus:ring-brand-red"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Vigente">Vigentes</option>
                  <option value="Vencido">Vencidos (Alerta)</option>
                  <option value="Bloqueado">Bloqueados</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN VIEW: TAB 1 - VENTAS A CRÉDITO POS (3, 6, 9 MSI) */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'sales_credits' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {visiblePOSCredits.length === 0 ? (
              <div className="bg-card-bg py-24 text-center border border-zinc-900 rounded-2xl p-6">
                <AlertTriangle className="w-12 h-12 text-[#ffb700] mx-auto animate-bounce mb-3" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Sin Ventas a Crédito Registradas</h4>
                <p className="text-[10px] text-zinc-500 uppercase max-w-md mx-auto mt-2">
                  Las ventas procesadas como "Crédito" en el POS del vendedor se verán reflejadas aquí de forma automática y transparente. Utilice el botón "Auto-Inyectar" del extremo superior para agregar una de prueba.
                </p>
              </div>
            ) : (
              <div className="bg-card-bg rounded-2xl border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-[#ffb700] border-b border-zinc-900">
                        <th className="px-6 py-4">Folio Venta / Fecha</th>
                        <th className="px-6 py-4">Cliente / Contacto</th>
                        <th className="px-6 py-4">Sucursal</th>
                        <th className="px-6 py-4">Plan Financiero (MSI)</th>
                        <th className="px-6 py-4">Semáforo de Proceso / Abonos</th>
                        <th className="px-6 py-4">Monto Financiado</th>
                        <th className="px-6 py-4">Saldo Pendiente</th>
                        <th className="px-6 py-4 text-right">Cobranza / Mensualidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {visiblePOSCredits.map((note) => {
                        const sem = getSemaforoDetails(note);
                        const remainingDebt = note.total - note.amountPaidSoFar;
                        const branchName = BRANCHES.find(b => b.id === note.branchId)?.name || 'Helios';
                        const monthlyQuota = note.total / (note.creditMonths || 3);

                        return (
                          <tr key={note.id} className="hover:bg-zinc-950/40 transition-all font-semibold text-xs text-white/90">
                            <td className="px-6 py-4">
                              <p className="font-black text-white">{note.id}</p>
                              <span className="text-[9px] font-mono text-zinc-500">{note.date}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <p className="font-black text-white">{note.clientName}</p>
                                <div className="flex items-center gap-2 text-[9px] text-zinc-400 font-mono">
                                  <span className="flex items-center gap-0.5"><PhoneCall className="w-2.5 h-2.5 text-[#ffb700]" /> {note.clientPhone}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5"><Mail className="w-2.5 h-2.5 text-zinc-500" /> {note.clientEmail}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-brand-blue uppercase">{branchName}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-0.5">
                                <span className="text-[#ffb700] text-[11px] font-black uppercase tracking-wider">{note.creditMonths} Meses s/ Int.</span>
                                <p className="text-[8.5px] text-zinc-500 font-bold uppercase">{note.items.map(i => `${i.quantity}x ${i.brand}`).join(', ')}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2 max-w-[170px]">
                                <div className={`px-2 py-1.5 rounded-xl border flex items-center gap-2 ${sem.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sem.dotClass}`}></span>
                                  <div className="flex flex-col">
                                    <span className="text-[8.5px] font-black uppercase tracking-widest leading-none">{sem.label}</span>
                                    <span className="text-[8px] font-bold mt-0.5 leading-none">{sem.statusText}</span>
                                  </div>
                                </div>
                                <div className="w-full bg-zinc-900/80 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      note.status === 'Pagado' ? 'bg-emerald-500' : note.creditInstallmentsPaid === 0 ? 'bg-brand-red' : 'bg-[#ffb700]'
                                    }`} 
                                    style={{ width: `${sem.percentage}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono font-black text-white">
                              ${note.total.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                            </td>
                            <td className="px-6 py-4">
                              <p className={`font-mono font-black ${remainingDebt > 0 ? 'text-[#ffb700]':'text-emerald-400'}`}>
                                ${remainingDebt.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})}
                              </p>
                              <p className="text-[8px] uppercase font-bold text-zinc-500 mt-0.5">Pendiente Neto</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-1 justify-end">
                                {note.status !== 'Pagado' && (
                                  <>
                                    <button
                                      onClick={() => handlePayInstallment(note.id)}
                                      className="text-[9px] font-black bg-[#ffb700] hover:bg-amber-500 text-black uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-[#ffb705]"
                                      title={`Abonar una mensualidad de $${monthlyQuota.toFixed(1)} MXN`}
                                    >
                                      Abonar (${(note.creditInstallmentsPaid || 0) + 1}/{note.creditMonths})
                                    </button>
                                    <button
                                      onClick={() => handleSettleCreditFully(note.id)}
                                      className="text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-emerald-500"
                                      title="Liquidar la deuda restante de un solo pago"
                                    >
                                      Liquidar Cuenta
                                    </button>
                                  </>
                                )}
                                {note.status === 'Pagado' && (
                                  <div className="text-emerald-400 text-[10px] font-black flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl">
                                    <Check className="w-3.5 h-3.5" /> Pagaré Liberado
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE VIEW: TAB 2 - LÍNEAS DE CRÉDITO CORPORATIVAS */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'corporate_lines' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {visibleCorporateCredits.length === 0 ? (
              <div className="bg-card-bg py-24 text-center border border-zinc-900 rounded-2xl p-6">
                <AlertTriangle className="w-12 h-12 text-[#ffb700] mx-auto animate-bounce mb-3" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Sin Cuentas Corporativas Coincidentes</h4>
                <p className="text-[10px] text-zinc-500 uppercase mt-2">Pruebe ajustando los filtros de búsqueda o el de Estado de Cuenta.</p>
              </div>
            ) : (
              <div className="bg-card-bg rounded-2xl border border-zinc-900 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-[#ffb700] border-b border-zinc-900">
                      <th className="px-6 py-4">Firma / RFC</th>
                      <th className="px-6 py-4">Sucursal</th>
                      <th className="px-6 py-4">Límite Autorizado</th>
                      <th className="px-6 py-4">Saldo Consumido</th>
                      <th className="px-6 py-4">Días de Atraso</th>
                      <th className="px-6 py-4">Estado Cuenta</th>
                      {!isReadOnly && <th className="px-6 py-4 text-right">Gestiones Directivas</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 font-semibold text-xs text-white/90">
                    {visibleCorporateCredits.map((account) => {
                      const branch = BRANCHES.find(b => b.id === account.branchId);
                      return (
                        <tr key={account.id} className="hover:bg-zinc-950/40 transition-all">
                          <td className="px-6 py-4">
                            <p className="font-black text-white">{account.clientName}</p>
                            <p className="text-[9px] font-mono text-zinc-500 mt-1">{account.id} • RFC: {account.rfc}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-black bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-brand-blue uppercase">{branch?.name || account.branchId}</span>
                          </td>
                          <td className="px-6 py-4 font-black text-white">
                            ${account.limit.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className={`font-black ${account.balance > account.limit * 0.9 ? 'text-brand-red':'text-white'}`}>${account.balance.toLocaleString()}</p>
                              <div className="w-24 bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                                <div className="bg-brand-red h-full transition-all" style={{ width: `${Math.min((account.balance / account.limit) * 100, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className={`font-black ${account.daysPastDue > 30 ? 'text-brand-red' : account.daysPastDue > 0 ? 'text-amber-500':'text-emerald-500'}`}>
                              {account.daysPastDue} días
                            </p>
                            <p className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">Retraso reportado</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                              account.status === 'Vigente' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              account.status === 'Vencido' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
                              'bg-red-500/10 text-brand-red border border-brand-red/20'
                            }`}>
                              {account.status}
                            </span>
                          </td>
                          {!isReadOnly && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-1 justify-end">
                                {account.status !== 'Vigente' && (
                                  <button
                                    onClick={() => handleToggleStatus(account.id, 'Vigente')}
                                    className="text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-emerald-500"
                                  >
                                    Resolver
                                  </button>
                                )}
                                {account.status !== 'Bloqueado' && (
                                  <button
                                    onClick={() => handleToggleStatus(account.id, 'Bloqueado')}
                                    className="text-[9px] font-black bg-brand-red hover:bg-brand-red/90 text-white uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-brand-red"
                                  >
                                    Bloquear
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credit notes audit terms notice / disclaimer */}
      <footer className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="space-y-0.5">
          <p className="text-[10px] text-white font-black uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
            <Activity className="text-brand-red w-3.5 h-3.5" /> Bitácora de Sincronización Automática
          </p>
          <p className="text-[9px] text-[#ffb700] uppercase font-bold leading-normal">
            Todos los abonos registrados actualizan la base de datos de Notas de Ventas y Comprobantes Fiscales.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-black text-white/50">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]"></span>
          Canal de Transacciones Local: Conectado
        </div>
      </footer>

    </div>
  );
}
