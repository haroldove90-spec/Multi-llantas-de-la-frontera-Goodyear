import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  HandCoins, 
  TrendingUp, 
  CheckCircle2, 
  PlusSquare,
  ChevronRight,
  ArrowUpRight 
} from 'lucide-react';
import { UserRole, BRANCHES } from '../data/mockData';

interface AccountsPayableProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

interface SupplierBill {
  id: string;
  supplier: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'Pendiente' | 'Pagado' | 'Vencido';
  branchId: string;
  notes: string;
}

export default function AccountsPayable({ userRole, branchId }: AccountsPayableProps) {
  const isReadOnly = userRole === 'superadmin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Pagado' | 'Vencido'>('all');

  const [bills, setBills] = useState<SupplierBill[]>([
    { id: 'CXP-001', supplier: 'Michelin México S.A. de C.V.', invoiceNumber: 'A-991204', amount: 345000, dueDate: '2026-06-15', status: 'Pendiente', branchId: 'matriz', notes: 'Lote de reabastecimiento habitual de línea Pilot Sport.' },
    { id: 'CXP-002', supplier: 'Industrias BFGoodrich Corporativo', invoiceNumber: 'BF-44122', amount: 180000, dueDate: '2026-05-18', status: 'Vencido', notes: 'Factura de 40 llantas All-Terrain KO2.' },
    { id: 'CXP-003', supplier: 'Pirelli México S. de R.L.', invoiceNumber: 'P-11204', amount: 95000, dueDate: '2026-05-10', status: 'Pagado', branchId: 'matriz', notes: 'Pago completo de llantas Cinturato P7.' },
    { id: 'CXP-004', supplier: 'Continental Tire de México', invoiceNumber: 'C-23091', amount: 124000, dueDate: '2026-06-01', status: 'Pendiente', branchId: 'norte', notes: 'Garantía previa aplicada como nota de crédito de $10,000.' },
  ]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<SupplierBill | null>(null);
  const [paymentReference, setPaymentReference] = useState('');

  const handleOpenPay = (bill: SupplierBill) => {
    if (isReadOnly) return;
    setSelectedBill(bill);
    setShowPayModal(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !selectedBill) return;

    setBills(bills.map(b => b.id === selectedBill.id ? { ...b, status: 'Pagado', notes: `${b.notes} (Pagado ref: ${paymentReference})` } : b));
    setShowPayModal(false);
    setSelectedBill(null);
    setPaymentReference('');
    alert('Orden de pago registrada y autorizada por CONTABILIDAD CENTRAL.');
  };

  const filteredBills = bills.filter(b => {
    const matchesSearch = b.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || b.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            CUENTAS POR PAGAR (PROVEEDORES)
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            Módulo de Administración de Proveedores de Llantas y Amortización de Pasivos
          </p>
        </div>

        {isReadOnly && (
          <div className="bg-amber-500/15 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">
            <Lock className="w-4 h-4" />
            Solo Visualizar (Matriz Sg. Activa)
          </div>
        )}
      </header>

      {/* Amortization statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pasivo Total Circulante', value: `$${bills.filter(b => b.status !== 'Pagado').reduce((acc, b) => acc + b.amount, 0).toLocaleString()}`, color: 'text-brand-red' },
          { label: 'Importe Vencido Proveedores', value: `$${bills.filter(b => b.status === 'Vencido').reduce((acc, b) => acc + b.amount, 0).toLocaleString()}`, color: 'text-amber-500' },
          { label: 'Egresos Validados (Mes)', value: `$${bills.filter(b => b.status === 'Pagado').reduce((acc, b) => acc + b.amount, 0).toLocaleString()}`, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-card-bg p-5 rounded-2xl border border-interface-bg flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-white">{stat.value}</h4>
            </div>
            <div className={`w-2 h-10 rounded-full bg-current ${stat.color}`}></div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-interface-bg/30 p-4 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar por Proveedor o Factura..."
            className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 bg-interface-bg p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest px-2">Estatus:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-card-bg border-none text-[10px] font-black uppercase tracking-wider text-white select-none outline-none py-1.5 px-3 rounded-lg cursor-pointer w-full"
          >
            <option value="all">Todos</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Vencido">Vencidos</option>
            <option value="Pagado">Pagados</option>
          </select>
        </div>
      </div>

      {/* Bill Accounts list */}
      <div className="bg-card-bg rounded-2xl border border-interface-bg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
              <th className="px-6 py-4">Insumos / Proveedores</th>
              <th className="px-6 py-4">Factura No.</th>
              <th className="px-6 py-4">Límite / Fecha Vence</th>
              <th className="px-6 py-4">Importe Proveedor</th>
              <th className="px-6 py-4">Estado</th>
              {!isReadOnly && <th className="px-6 py-4 text-right">Egresar</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredBills.map((bill) => {
              const branch = BRANCHES.find(b => b.id === bill.branchId);
              return (
                <tr key={bill.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4">
                    <p className="font-black text-white">{bill.supplier}</p>
                    <p className="text-[9px] text-text-muted font-bold mt-0.5 max-w-xs truncate">{bill.notes}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-brand-blue text-xs uppercase">
                    {bill.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{bill.dueDate}</p>
                    <p className="text-[8px] text-text-muted uppercase font-bold tracking-widest">Sincronizado</p>
                  </td>
                  <td className="px-6 py-4 font-black text-white">
                    ${bill.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      bill.status === 'Pagado' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                      bill.status === 'Vencido' ? 'bg-red-500/20 text-brand-red border border-brand-red/25' :
                      'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  {!isReadOnly && (
                    <td className="px-6 py-4 text-right">
                      {bill.status !== 'Pagado' ? (
                        <button
                          onClick={() => handleOpenPay(bill)}
                          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest py-1.5 px-3 rounded-lg ml-auto transition-all"
                        >
                          <HandCoins className="w-3.5 h-3.5" />
                          Marcar Pago
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-emerald-500 font-bold uppercase text-[9px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Transmitido
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPayModal && selectedBill && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-white/10 rounded-2xl max-w-md w-full p-8 space-y-6"
            >
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Confirmar Pago a Proveedor</h3>
                <p className="text-[10px] text-text-muted font-bold uppercase mt-1">Sube la referencia bancaria SPEI para registrar el egreso contable</p>
              </div>

              <div className="bg-interface-bg p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between text-xs text-text-muted font-bold uppercase">
                  <span>Proveedor</span>
                  <span className="text-white font-black">{selectedBill.supplier}</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted font-bold uppercase">
                  <span>Factura Referencia</span>
                  <span className="text-white font-mono font-bold">{selectedBill.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm text-text-muted font-black uppercase pt-2 border-t border-white/5">
                  <span>Total Liquidado</span>
                  <span className="text-brand-red">${selectedBill.amount.toLocaleString()} MXN</span>
                </div>
              </div>

              <form onSubmit={handleConfirmPayment} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">Referencia SPEI / Cheque *</label>
                  <input
                    type="text" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-3 px-4 text-sm font-black text-white outline-none focus:border-brand-red"
                    placeholder="Ej. SPEI-99812A45"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest transition-all"
                  >
                    Confirmar SPEI
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-6 bg-interface-bg text-white font-black py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-black/40 border border-white/5 transition-all"
                  >
                    Salir
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
