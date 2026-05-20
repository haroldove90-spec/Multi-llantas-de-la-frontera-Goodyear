import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  SlidersHorizontal 
} from 'lucide-react';
import { UserRole, BRANCHES } from '../data/mockData';

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
  // Determine access scope
  const isMultiBranch = (userRole === 'superadmin' || userRole === 'credito_cobranza') && !singleBranchOnly;
  const isReadOnly = userRole === 'superadmin';

  const [activeBranchFilter, setActiveBranchFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Vigente' | 'Vencido' | 'Bloqueado'>('all');

  const [credits, setCredits] = useState<CreditAccount[]>([
    { id: 'CRDA-01', clientName: 'Transportes Fronterizos S.A.', rfc: 'TFR980412AA1', branchId: 'matriz', limit: 120000, balance: 45000, daysPastDue: 5, status: 'Vigente', notes: 'Buen historial de pago en Sucursal Centro.' },
    { id: 'CRDA-02', clientName: 'Juan Manuel Torres (Constructora)', rfc: 'TOMJ850615BB9', branchId: 'norte', limit: 250000, balance: 135000, daysPastDue: 45, status: 'Vencido', notes: 'Retraso de segunda factura, requiere llamada de cobranza.' },
    { id: 'CRDA-03', clientName: 'Servicio de Taxi Express Centro', rfc: 'STE051020XX4', branchId: 'sur', limit: 50000, balance: 12000, daysPastDue: 0, status: 'Vigente', notes: 'Liquidación puntual cada quincena.' },
    { id: 'CRDA-04', clientName: 'Distribuidora de Carnes Frontera', rfc: 'DCF140510E54', branchId: 'sur', limit: 150000, balance: 148000, daysPastDue: 72, status: 'Bloqueado', notes: 'Cuenta congelada temporalmente por mora prolongada.' },
    { id: 'CRDA-05', clientName: 'Bloquera del Golfo S.A.', rfc: 'BGO101211FG1', branchId: 'norte', limit: 300000, balance: 90000, daysPastDue: 12, status: 'Vigente', notes: 'Trámite habitual de renovación anual.' },
  ]);

  // Adjust credit status
  const handleToggleStatus = (id: string, newStatus: 'Vigente' | 'Vencido' | 'Bloqueado') => {
    if (isReadOnly) return;
    setCredits(credits.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  // Filter accounts according to Sucursal constraint on Accountant/Secretary
  const visibleCredits = credits.filter(c => {
    // If not multi-branch, must match their active branchId
    if (!isMultiBranch && branchId) {
      if (c.branchId !== branchId) return false;
    }
    // If multi-branch and they selected a specific branch
    if (isMultiBranch && activeBranchFilter !== 'all') {
      if (c.branchId !== activeBranchFilter) return false;
    }

    const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            CARTERA DE CRÉDITOS Y COBRANZA
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            {isMultiBranch 
              ? (isReadOnly ? 'CONSOLA NACIONAL DE CRÉDITO - SOLO VISUALIZACIÓN' : 'CENTRAL DIRECTIVA: GESTIÓN DE RIEGO Y CRÉDITO MULTISUCURSAL')
              : `CRÉDITOS EXCLUSIVOS DE SUCURSAL: ${BRANCHES.find(b => b.id === branchId)?.name.toUpperCase()}`
            }
          </p>
        </div>

        {/* Dynamic warning badges according to constraints of spreadsheet */}
        {isReadOnly && (
          <div className="bg-amber-500/15 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">
            <Lock className="w-4 h-4" />
            Solo Visualizar (Matriz Bloqueada)
          </div>
        )}
        {!isMultiBranch && (
          <div className="bg-cyan-600/10 border border-cyan-600/20 px-4 py-2 rounded-xl flex items-center gap-2 text-cyan-400 font-bold uppercase text-[10px] tracking-widest leading-none">
            <MapPin className="w-4 h-4" />
            Filtro de Sucursal Local Activo
          </div>
        )}
      </header>

      {/* Credit summary counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Cartera Total Colocada', value: `$${visibleCredits.reduce((acc, c) => acc + c.balance, 0).toLocaleString()}`, color: 'text-brand-blue' },
          { label: 'Cuentas en Mora Crítica', value: visibleCredits.filter(c => c.status === 'Vencido' || c.status === 'Bloqueado').length, color: 'text-brand-red' },
          { label: 'Capital Disponible de Riesgo', value: `$${visibleCredits.reduce((acc, c) => acc + (c.limit - c.balance), 0).toLocaleString()}`, color: 'text-emerald-500' },
        ].map((card, i) => (
          <div key={i} className="bg-card-bg p-5 rounded-2xl border border-interface-bg flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{card.label}</p>
              <h4 className="text-2xl font-black text-white">{card.value}</h4>
            </div>
            <div className={`w-2 h-10 rounded-full bg-current ${card.color}`}></div>
          </div>
        ))}
      </div>

      {/* Filter and control panel */}
      <div className="bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar por cliente o ID de cuenta..."
              className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* If Multi-branch, show sucursal filter */}
            {isMultiBranch && (
              <div className="flex items-center gap-1.5 bg-interface-bg p-1 rounded-xl border border-white/5">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest px-2">Sucursal:</span>
                <select
                  value={activeBranchFilter}
                  onChange={(e) => setActiveBranchFilter(e.target.value)}
                  className="bg-card-bg border-none text-[10px] font-black uppercase tracking-wider text-white select-none outline-none py-1.5 px-3 rounded-lg cursor-pointer max-w-[120px]"
                >
                  <option value="all">Todas</option>
                  <option value="matriz">Centro</option>
                  <option value="norte">Norte</option>
                  <option value="sur">Frontera</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-interface-bg p-1 rounded-xl border border-white/5">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest px-2">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-card-bg border-none text-[10px] font-black uppercase tracking-wider text-white select-none outline-none py-1.5 px-3 rounded-lg cursor-pointer"
              >
                <option value="all">Todos</option>
                <option value="Vigente">Vigentes</option>
                <option value="Vencido">Vencidos</option>
                <option value="Bloqueado">Bloqueados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts display list */}
      <div className="bg-card-bg rounded-2xl border border-interface-bg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
              <th className="px-6 py-4">Cuenta / RFC</th>
              <th className="px-6 py-4">Sucursal</th>
              <th className="px-6 py-4">Límite Autorizado</th>
              <th className="px-6 py-4">Saldo Utilizado</th>
              <th className="px-6 py-4">Días de Atraso</th>
              <th className="px-6 py-4">Estado</th>
              {!isReadOnly && <th className="px-6 py-4 text-right">Acciones de Cobro</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {visibleCredits.map((account) => {
              const branch = BRANCHES.find(b => b.id === account.branchId);
              return (
                <tr key={account.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <p className="font-black text-white">{account.clientName}</p>
                    <p className="text-[9px] font-mono text-text-muted mt-0.5">{account.id} • RFC: {account.rfc}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded text-brand-blue uppercase border border-white/5">{branch?.name}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-white">
                    ${account.limit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-black ${account.balance > account.limit * 0.9 ? 'text-brand-red':'text-white'}`}>${account.balance.toLocaleString()}</p>
                    <div className="w-24 bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                      <div className="bg-brand-red h-full" style={{ width: `${Math.min((account.balance / account.limit) * 100, 100)}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`font-black text-sm ${account.daysPastDue > 30 ? 'text-brand-red' : account.daysPastDue > 0 ? 'text-amber-500':'text-emerald-500'}`}>
                      {account.daysPastDue} días
                    </p>
                    <p className="text-[8px] text-text-muted uppercase font-bold tracking-widest mt-0.5">Retraso de reporte</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      account.status === 'Vigente' ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/20' :
                      account.status === 'Vencido' ? 'bg-amber-500/25 text-amber-500 border border-amber-500/20' :
                      'bg-red-500/25 text-brand-red border border-brand-red/20'
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
                            className="text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white uppercase px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            Resolver
                          </button>
                        )}
                        {account.status !== 'Bloqueado' && (
                          <button
                            onClick={() => handleToggleStatus(account.id, 'Bloqueado')}
                            className="text-[9px] font-black bg-brand-red hover:bg-brand-red/90 text-white uppercase px-2.5 py-1.5 rounded-lg transition-all"
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

    </div>
  );
}
