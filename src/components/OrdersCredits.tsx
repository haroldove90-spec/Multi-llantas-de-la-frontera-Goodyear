import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Calendar, 
  Plus, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  Calculator,
  Coins,
  ChevronRight,
  User,
  AlertCircle,
  Receipt,
  Download,
  Printer,
  Search,
  Check,
  CreditCard,
  FileText
} from 'lucide-react';
import { UserRole, BRANCHES } from '../data/mockData';

interface OrdersCreditsProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

interface Layaway {
  id: string;
  clientName: string;
  product: string;
  total: number;
  downPayment: number;
  balance: number;
  branchId: string;
  date: string;
  status: 'Activo' | 'Entregado' | 'Vencido';
}

interface Order {
  id: string;
  supplier: string;
  items: string;
  total: number;
  date: string;
  status: 'Solicitado' | 'En Tránsito' | 'Ingresado';
}

interface Sale {
  id: string;
  clientName: string;
  rfc: string;
  productName: string;
  quantity: number;
  total: number;
  date: string;
  paymentMethod: string;
  dotCode: string;
  branchId: string;
  status: 'Timbrada CFDI 4.0' | 'Pendiente';
}

export default function OrdersCredits({ userRole, branchId }: OrdersCreditsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'notas' | 'apartados' | 'pedidos' | 'creditos' | 'cortes'>('notas');
  
  // Sales Log State (Notas de Venta)
  const [salesList, setSalesList] = useState<Sale[]>([
    { id: 'NV-201', clientName: 'Roberto Garza Valdéz', rfc: 'GAVR750914KL0', productName: 'Michelin Pilot Sport 5', quantity: 4, total: 18500, date: '2026-05-20', paymentMethod: 'Efectivo', dotCode: 'DOT 1923 FD54', branchId: 'matriz', status: 'Timbrada CFDI 4.0' },
    { id: 'NV-202', clientName: 'Transportes del Norte S.A.', rfc: 'TNO881112LL2', productName: 'Bridgestone Dueler H/P', quantity: 8, total: 42000, date: '2026-05-19', paymentMethod: 'Crédito', dotCode: 'DOT 4224 BR21', branchId: 'norte', status: 'Timbrada CFDI 4.0' },
    { id: 'NV-203', clientName: 'María Fernanda Ruiz', rfc: 'RUIM820101XY4', productName: 'Goodyear Eagle F1', quantity: 2, total: 9800, date: '2026-05-18', paymentMethod: 'Tarjeta', dotCode: 'DOT 0525 GY04', branchId: 'sur', status: 'Timbrada CFDI 4.0' },
  ]);

  // Form states
  const [newSale, setNewSale] = useState({
    clientName: '',
    rfc: '',
    productName: 'Michelin Pilot Sport 5',
    quantity: 4,
    priceEach: 4625,
    paymentMethod: 'Efectivo',
    dotCode: '',
    branchId: branchId || 'matriz',
  });

  const [dotError, setDotError] = useState('');
  const [salePrintData, setSalePrintData] = useState<Sale | null>(null);

  // Apartados Mock
  const [layaways, setLayaways] = useState<Layaway[]>([
    { id: 'APT-101', clientName: 'Felipe J. Mendoza', product: '4x BFGoodrich All-Terrain R16', total: 24400, downPayment: 8000, balance: 16400, branchId: 'matriz', date: '2026-05-15', status: 'Activo' },
    { id: 'APT-102', clientName: 'Refaccionaria Monterrey', product: '10x Michelin Primacy 4', total: 31000, downPayment: 15000, balance: 16000, branchId: 'norte', date: '2026-05-17', status: 'Activo' },
    { id: 'APT-103', clientName: 'Transportes Garza', product: '2x Michelin Defender LTX R17', total: 10400, downPayment: 10400, balance: 0, branchId: 'sur', date: '2026-05-12', status: 'Entregado' },
  ]);

  // Pedidos Mock
  const [orders, setOrders] = useState<Order[]>([
    { id: 'PED-9901', supplier: 'Michelin México Corporativo', items: '50x Pilot Sport 4S, 30x Defender LTX M/S', total: 320000, date: '2026-05-16', status: 'En Tránsito' },
    { id: 'PED-9902', supplier: 'Distribuidor BFGoodrich Centro', items: '20x All-Terrain KO2 R15', total: 88000, date: '2026-05-19', status: 'Solicitado' },
  ]);

  // POS Credits Mock
  const [posCredits, setPosCredits] = useState([
    { id: 'POS-CR-01', clientName: 'Flotillas de la Frontera S.A.', limit: 80000, balance: 35000, lastPay: '$5,000', status: 'Vigente', branchId: 'matriz' },
    { id: 'POS-CR-02', clientName: 'Construcciones del Río', limit: 150000, balance: 112000, lastPay: '$12,000', status: 'Vencido', branchId: 'norte' },
    { id: 'POS-CR-03', clientName: 'Industrial Regiomontana', limit: 300000, balance: 45000, lastPay: '$25,000', status: 'Vigente', branchId: 'sur' },
  ]);

  // Cortes Mock State
  const [cashDrawer, setCashDrawer] = useState({
    openingAmount: 5000,
    salesCash: 18500,
    salesTerminal: 22400,
    enteredCash: '23500' // opening + salesCash
  });

  const [cortesHistory, setCortesHistory] = useState([
    { date: '2026-05-19', branchId: 'matriz', cashier: 'Alicia CP', cashCollected: 23500, variance: 0, status: 'Conciliado' },
    { date: '2026-05-18', branchId: 'matriz', cashier: 'Alicia CP', cashCollected: 19800, variance: -100, status: 'Revisión técnica' },
  ]);

  // Modals status
  const [showAddApartado, setShowAddApartado] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);

  // New Forms State
  const [newApartado, setNewApartado] = useState({
    clientName: '', product: '', total: '', downPayment: '', branchId: branchId || 'matriz'
  });

  const [newOrder, setNewOrder] = useState({
    supplier: '', items: '', total: ''
  });

  // Handle sales registration
  const handleDotChange = (val: string) => {
    setNewSale({ ...newSale, dotCode: val.toUpperCase() });
    if (!val) {
      setDotError('El código DOT es obligatorio de acuerdo a la NOM-086.');
    } else if (val.length < 8) {
      setDotError('El código DOT debe incluir al menos 8 caracteres alfanuméricos.');
    } else {
      setDotError('');
    }
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSale.dotCode) {
      setDotError('El código DOT es estrictamente requerido.');
      return;
    }
    if (newSale.dotCode.length < 8) {
      setDotError('Formato DOT inválido. Ingrese una nomenclatura válida de planta.');
      return;
    }

    const totalCalculated = newSale.quantity * newSale.priceEach;
    const item: Sale = {
      id: `NV-${200 + salesList.length + 1}`,
      clientName: newSale.clientName,
      rfc: newSale.rfc || 'XAXX010101000',
      productName: newSale.productName,
      quantity: newSale.quantity,
      total: totalCalculated,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: newSale.paymentMethod,
      dotCode: newSale.dotCode,
      branchId: newSale.branchId,
      status: 'Timbrada CFDI 4.0'
    };

    setSalesList([item, ...salesList]);
    setSalePrintData(item);
    
    // Auto increment cash drawer
    if (newSale.paymentMethod === 'Efectivo') {
      setCashDrawer(prev => ({
        ...prev,
        salesCash: prev.salesCash + totalCalculated,
        enteredCash: (parseFloat(prev.enteredCash) + totalCalculated).toString()
      }));
    } else if (newSale.paymentMethod === 'Tarjeta' || newSale.paymentMethod === 'Transferencia') {
      setCashDrawer(prev => ({
        ...prev,
        salesTerminal: prev.salesTerminal + totalCalculated
      }));
    }

    // Reset Form
    setNewSale({
      clientName: '',
      rfc: '',
      productName: 'Michelin Pilot Sport 5',
      quantity: 4,
      priceEach: 4625,
      paymentMethod: 'Efectivo',
      dotCode: '',
      branchId: branchId || 'matriz',
    });
    setDotError('');
  };

  const handleCreateApartado = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = parseFloat(newApartado.total) || 0;
    const dp = parseFloat(newApartado.downPayment) || 0;
    const item: Layaway = {
      id: `APT-10${layaways.length + 1}`,
      clientName: newApartado.clientName,
      product: newApartado.product,
      total: tot,
      downPayment: dp,
      balance: tot - dp,
      branchId: newApartado.branchId,
      date: new Date().toISOString().split('T')[0],
      status: 'Activo'
    };
    setLayaways([item, ...layaways]);
    setShowAddApartado(false);
    setNewApartado({ clientName: '', product: '', total: '', downPayment: '', branchId: branchId || 'matriz' });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Order = {
      id: `PED-990${orders.length + 1}`,
      supplier: newOrder.supplier,
      items: newOrder.items,
      total: parseFloat(newOrder.total) || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Solicitado'
    };
    setOrders([item, ...orders]);
    setShowAddOrder(false);
    setNewOrder({ supplier: '', items: '', total: '' });
  };

  const handleApplyCorte = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = cashDrawer.openingAmount + cashDrawer.salesCash;
    const realEntered = parseFloat(cashDrawer.enteredCash) || 0;
    const variance = realEntered - expected;

    const newCorte = {
      date: new Date().toISOString().split('T')[0],
      branchId: branchId || 'matriz',
      cashier: userRole === 'contador' ? 'Alicia CP (Auditor)' : 'Cajero Turno',
      cashCollected: realEntered,
      variance,
      status: variance === 0 ? 'Conciliado' : 'Revisión técnica'
    };
    setCortesHistory([newCorte, ...cortesHistory]);
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            PUNTO DE VENTA (POS)
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            Multióptimas: Notas, Apartados, Pedidos, Créditos y Cortes Integrados
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-brand-red/10 border border-brand-red/20 px-4 py-2 rounded-xl flex items-center gap-2 text-brand-red font-black text-[10px] tracking-widest leading-none">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-ping"></span>
            CFDI 4.0 SAT Activo
          </div>
        </div>
      </header>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto scrollbar-hide pb-1">
        {[
          { id: 'notas', label: 'Notas de Venta', icon: Receipt },
          { id: 'apartados', label: 'Apartados de Llantas', icon: ShoppingBag },
          { id: 'pedidos', label: 'Pedidos / Compras', icon: TrendingUp },
          { id: 'creditos', label: 'Créditos POS', icon: CreditCard },
          { id: 'cortes', label: 'Corte de Caja', icon: Calculator },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'border-brand-red text-white bg-white/5 rounded-t-xl' 
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* activeSubTab === 'notas' */}
      {activeSubTab === 'notas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Sale Form */}
          <div className="lg:col-span-5 bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-6">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Nueva Nota de Venta</h3>
              <p className="text-[10px] text-brand-red font-black uppercase">Ingreso Obligatorio del Código de Planta DOT</p>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Cliente del Mostrador *</label>
                  <input
                    type="text" required
                    placeholder="Ej. Juan Carlos Lozano"
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-bold text-white capitalize"
                    value={newSale.clientName}
                    onChange={(e) => setNewSale({...newSale, clientName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">RFC Facturable (Opcional)</label>
                    <input
                      type="text"
                      placeholder="LOZJ800411AA2"
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-mono text-white uppercase"
                      value={newSale.rfc}
                      onChange={(e) => setNewSale({...newSale, rfc: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Sucursal Registro</label>
                    <select
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-3 text-xs font-black text-white uppercase"
                      value={newSale.branchId}
                      onChange={(e) => setNewSale({...newSale, branchId: e.target.value})}
                    >
                      <option value="matriz">Helios</option>
                      <option value="norte">San Andres</option>
                      <option value="sur">Industrial</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Llanta Solicitada *</label>
                  <select
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-3 text-xs font-bold text-white"
                    value={newSale.productName}
                    onChange={(e) => {
                      const model = e.target.value;
                      let price = 4625;
                      if (model.includes('Bridgestone')) price = 5250;
                      if (model.includes('Goodyear')) price = 4900;
                      setNewSale({...newSale, productName: model, priceEach: price});
                    }}
                  >
                    <option value="Michelin Pilot Sport 5">Michelin Pilot Sport 5 — $4,625</option>
                    <option value="Bridgestone Dueler H/P">Bridgestone Dueler H/P — $5,250</option>
                    <option value="Goodyear Eagle F1">Goodyear Eagle F1 — $4,900</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Cantidad (Llantas) *</label>
                    <input
                      type="number" min={1} max={50} required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-black text-white"
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({...newSale, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-1.5">Condición de Pago</label>
                    <select
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-3 text-xs font-black text-white uppercase"
                      value={newSale.paymentMethod}
                      onChange={(e) => setNewSale({...newSale, paymentMethod: e.target.value})}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Tarjeta">Tarjeta de Crédito</option>
                      <option value="Transferencia">Transferencia SPEI</option>
                      <option value="Crédito">Crédito Autorizado</option>
                    </select>
                  </div>
                </div>

                <div className="bg-brand-red/5 p-4 rounded-xl border border-brand-red/10">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] font-black text-brand-red uppercase tracking-widest">Código DOT de Fábrica (DOT/Semana/Año) *</label>
                    <span className="text-[8px] font-black uppercase text-text-muted px-1.5 py-0.5 bg-interface-bg rounded border border-white/10">OBLIGATORIO</span>
                  </div>
                  <input
                    type="text" required
                    placeholder="Ej. DOT 1223 AB45"
                    className={`w-full bg-interface-bg border rounded-xl py-2.5 px-4 text-xs font-mono text-white uppercase tracking-wider ${
                      dotError ? 'border-brand-red' : 'border-white/10 focus:border-brand-red'
                    }`}
                    value={newSale.dotCode}
                    onChange={(e) => handleDotChange(e.target.value)}
                  />
                  {dotError ? (
                    <p className="text-[9px] text-brand-red font-bold mt-1.5 uppercase flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {dotError}
                    </p>
                  ) : (
                    <p className="text-[8px] text-text-muted mt-1 uppercase">Debe reportar número de lote por garantía obligatoria comercial.</p>
                  )}
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-text-muted">Monto Total Neto</span>
                <span className="text-xl font-black text-emerald-400 font-mono">${(newSale.quantity * newSale.priceEach).toLocaleString()} MXN</span>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-red/10 active:scale-95"
              >
                Registrar Venta & Timbrar CFDI
              </button>
            </form>
          </div>

          {/* Sales History Logs & Print Layout Preview */}
          <div className="lg:col-span-7 space-y-6">
            {salePrintData && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-black p-6 rounded-2xl border-4 border-brand-red relative font-mono text-xs shadow-2xl"
              >
                <button 
                  onClick={() => setSalePrintData(null)}
                  className="absolute top-4 right-4 text-black hover:text-brand-red font-bold uppercase text-[9px]"
                >
                  [Cerrar]
                </button>
                <div className="text-center font-black uppercase text-sm border-b pb-3 mb-3 border-dashed border-black">
                  <h4>Multillantas de la Frontera</h4>
                  <p className="text-[10px] font-normal mt-0.5">Sucursal {BRANCHES.find(b => b.id === salePrintData.branchId)?.name}</p>
                  <p className="text-[9px] mt-1 text-emerald-700">Comprobante de Ventas Timbrado SAT CFDI 4.0</p>
                </div>

                <div className="space-y-1 text-[11px] mb-3">
                  <p><span className="font-bold">FOLIO:</span> {salePrintData.id}</p>
                  <p><span className="font-bold">FECHA:</span> {salePrintData.date}</p>
                  <p><span className="font-bold">CLIENTE:</span> {salePrintData.clientName}</p>
                  <p><span className="font-bold">RFC:</span> {salePrintData.rfc}</p>
                  <p><span className="font-bold">METODO PAGO:</span> {salePrintData.paymentMethod}</p>
                </div>

                <div className="border-t border-b border-dashed border-black py-2 mb-3">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span>CONCEPTO</span>
                    <span>TOTAL</span>
                  </div>
                  <div className="flex justify-between text-[11px] mt-1">
                    <span>{salePrintData.quantity}x {salePrintData.productName}</span>
                    <span>${salePrintData.total.toLocaleString()} MXN</span>
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold text-brand-red">REGISTRO DOT VALIDADOR: {salePrintData.dotCode}</p>
                </div>

                <div className="flex justify-between items-center text-xs font-black mb-4">
                  <span>TOTAL PAGADO:</span>
                  <span>${salePrintData.total.toLocaleString()} MXN</span>
                </div>

                <div className="text-center text-[8px] text-gray-500 uppercase">
                  <p>Sello Digital SAT: s8f7as9df7a8s9fa87sa9f8dhas9dfha9sd</p>
                  <p className="mt-1">Gracias por su preferencia en la frontera mexicana.</p>
                </div>
              </motion.div>
            )}

            <div className="bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Últimos Tickets Emitidos del Turno</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-interface-bg text-text-muted text-[10px] uppercase font-bold border-b border-white/5">
                      <th className="px-4 py-3">Folio / Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Llantas</th>
                      <th className="px-4 py-3">DOT</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold">
                    {salesList.map(s => (
                      <tr key={s.id} className="hover:bg-white/5 transition-all text-white/90">
                        <td className="px-4 py-3 font-mono">
                          <p className="font-black text-white">{s.id}</p>
                          <span className="text-[9px] text-text-muted font-bold">{s.date}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p>{s.clientName}</p>
                          <span className="text-[9px] text-brand-blue uppercase tracking-widest">{BRANCHES.find(b => b.id === s.branchId)?.name}</span>
                        </td>
                        <td className="px-4 py-3">{s.quantity}x {s.productName}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-brand-red font-black uppercase">{s.dotCode}</td>
                        <td className="px-4 py-3 text-right font-black text-emerald-400">${s.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button 
                            onClick={() => setSalePrintData(s)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-brand-blue transition-colors"
                            title="Ver Ticket Imprimible"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* activeSubTab === 'apartados' */}
      {activeSubTab === 'apartados' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-interface-bg/30 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Listado de Apartados con Anticipo Bancario</span>
            <button
              onClick={() => setShowAddApartado(true)}
              className="flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-2 px-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-red/10 animate-pulse border border-brand-red"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Apartado
            </button>
          </div>

          <div className="bg-card-bg rounded-xl border border-interface-bg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                  <th className="px-6 py-4">ID/Fecha</th>
                  <th className="px-6 py-4">Cliente / Sucursal</th>
                  <th className="px-6 py-4">Llantas Solicitadas</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Anticipo</th>
                  <th className="px-6 py-4">Saldo Restante</th>
                  <th className="px-6 py-4 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-semibold">
                {layaways.map(l => (
                  <tr key={l.id} className="hover:bg-white/5 transition-all text-white/90">
                    <td className="px-6 py-4 font-mono">
                      <p className="font-black text-white">{l.id}</p>
                      <p className="text-[9px] text-text-muted font-bold">{l.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{l.clientName}</p>
                      <p className="text-[9px] text-brand-blue font-black uppercase tracking-widest leading-none mt-0.5">{BRANCHES.find(b => b.id === l.branchId)?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-white/80">{l.product}</td>
                    <td className="px-6 py-4 font-black text-white">${l.total.toLocaleString()}</td>
                    <td className="px-6 py-4 font-black text-emerald-500">${l.downPayment.toLocaleString()}</td>
                    <td className="px-6 py-4 font-black text-brand-red">${l.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        l.status === 'Activo' 
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* activeSubTab === 'pedidos' */}
      {activeSubTab === 'pedidos' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-interface-bg/30 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Abastecimiento de Mercancía de Plantas de Monterrey / Querétaro</span>
            <button
              onClick={() => setShowAddOrder(true)}
              className="flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-2 px-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-brand-red/10 border border-brand-red"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Pedido Proveedor
            </button>
          </div>

          <div className="bg-card-bg rounded-xl border border-interface-bg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                  <th className="px-6 py-4">ID/Fecha</th>
                  <th className="px-6 py-4">Proveedor Michelin/BFG</th>
                  <th className="px-6 py-4">Modelos / Cantidades</th>
                  <th className="px-6 py-4">Presupuesto Estimado</th>
                  <th className="px-6 py-4 text-right">Estado Sincronía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm font-semibold">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-white/5 transition-all text-white/90">
                    <td className="px-6 py-4 font-mono">
                      <p className="font-black text-white">{o.id}</p>
                      <p className="text-[9px] text-text-muted font-bold">{o.date}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{o.supplier}</td>
                    <td className="px-6 py-4 text-xs font-mono text-text-muted max-w-sm truncate">{o.items}</td>
                    <td className="px-6 py-4 font-black text-brand-red">${o.total.toLocaleString()} MXN</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        o.status === 'Solicitado' ? 'bg-amber-500/20 text-amber-500' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* activeSubTab === 'creditos' */}
      {activeSubTab === 'creditos' && (
        <div className="bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Cuentas por Cobrar & Créditos Consumados POS</h3>
              <p className="text-[10px] text-text-muted font-black uppercase">Seguimiento y Registro de Abonos Local</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-semibold text-xs text-white/90">
              <thead>
                <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                  <th className="px-6 py-4">ID Cuenta</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Límite</th>
                  <th className="px-6 py-4">Saldo Deudor</th>
                  <th className="px-6 py-4">Último Abono</th>
                  <th className="px-6 py-4 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posCredits.filter(c => !branchId || branchId === 'all' || c.branchId === branchId).map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-mono font-black text-white">{c.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{c.clientName}</p>
                      <p className="text-[9px] text-brand-blue font-black uppercase tracking-widest leading-none mt-0.5">{BRANCHES.find(b => b.id === c.branchId)?.name}</p>
                    </td>
                    <td className="px-6 py-4 font-bold">${c.limit.toLocaleString()}</td>
                    <td className="px-6 py-4 font-black text-brand-red">${c.balance.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono">{c.lastPay}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        c.status === 'Vigente' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-brand-red/20 text-brand-red border border-brand-red/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* activeSubTab === 'cortes' */}
      {activeSubTab === 'cortes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cash Closing Panel Form */}
          <div className="bg-card-bg p-6 rounded-2xl border border-interface-bg space-y-6 lg:col-span-1">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Corte de Caja Técnico</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase font-black">Procesamiento y auditoría de arqueo de caja de turno</p>
            </div>

            <form onSubmit={handleApplyCorte} className="space-y-4">
              <div className="bg-interface-bg/40 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[11px] font-bold text-text-muted uppercase">
                  <span>Fondo de Caja (Fijo)</span>
                  <span className="font-black text-white">${cashDrawer.openingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-text-muted uppercase">
                  <span>Ventas en Efectivo</span>
                  <span className="font-black text-emerald-500">+ ${cashDrawer.salesCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-text-muted uppercase">
                  <span>Ventas Tarjeta / Transf</span>
                  <span className="font-black text-brand-blue">+ ${cashDrawer.salesTerminal.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs font-black text-white uppercase tracking-wider">
                  <span>Efectivo Esperado</span>
                  <span className="text-brand-red">${(cashDrawer.openingAmount + cashDrawer.salesCash).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5">Efectivo Físico Arqueado ($) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-black">$</span>
                  <input
                    type="number" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-3 pl-8 pr-4 text-base font-black text-white outline-none focus:border-brand-red"
                    value={cashDrawer.enteredCash}
                    onChange={(e) => setCashDrawer({...cashDrawer, enteredCash: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl border border-dashed border-white/10 text-center">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Diferencia / Descuadre</p>
                <p className={`text-lg font-black uppercase ${
                  parseFloat(cashDrawer.enteredCash) - (cashDrawer.openingAmount + cashDrawer.salesCash) === 0
                    ? 'text-emerald-500' 
                    : 'text-brand-red'
                }`}>
                  {parseFloat(cashDrawer.enteredCash) - (cashDrawer.openingAmount + cashDrawer.salesCash) > 0 ? '+' : ''}
                  ${(parseFloat(cashDrawer.enteredCash) - (cashDrawer.openingAmount + cashDrawer.salesCash)).toLocaleString()} MXN
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3.5 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                Cerrar Turno & Conciliar
              </button>
            </form>
          </div>

          {/* History / Audit list */}
          <div className="bg-card-bg p-8 rounded-2xl border border-interface-bg space-y-6 lg:col-span-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1">Histórico de Cierres Sincronizados</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase font-black">Bitácora fiscal de cierres de caja por sucursal</p>
            </div>

            <div className="space-y-3">
              {cortesHistory.map((c, i) => (
                <div key={i} className="p-4 bg-interface-bg rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-lg bg-card-bg border border-white/5 flex items-center justify-center text-brand-blue">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-white uppercase text-xs">Corte {c.date}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase">Cajero: {c.cashier} • {BRANCHES.find(b => b.id === c.branchId)?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                    <div className="text-right">
                      <p className="text-xs font-black text-white">${c.cashCollected.toLocaleString()}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${c.variance === 0 ? 'text-emerald-500':'text-brand-red'}`}>
                        Dif: ${c.variance.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      c.status === 'Conciliado' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/15 text-brand-red border border-brand-red/20'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* ADD APARTADO */}
      <AnimatePresence>
        {showAddApartado && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-white/10 rounded-2xl max-w-lg w-full p-8 space-y-6"
            >
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Nuevo Apartado con Anticipo</h3>
              <form onSubmit={handleCreateApartado} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nombre del Cliente *</label>
                  <input 
                    type="text" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-bold text-white capitalize"
                    value={newApartado.clientName}
                    onChange={(e) => setNewApartado({...newApartado, clientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Llantas y Medida *</label>
                  <input 
                    type="text" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-bold text-white"
                    placeholder="Ej. 4x Michelin Pilot Sport R17"
                    value={newApartado.product}
                    onChange={(e) => setNewApartado({...newApartado, product: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Monto Total *</label>
                    <input 
                      type="number" required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-black text-white"
                      value={newApartado.total}
                      onChange={(e) => setNewApartado({...newApartado, total: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Anticipo / Enganche *</label>
                    <input 
                      type="number" required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-black text-emerald-500"
                      value={newApartado.downPayment}
                      onChange={(e) => setNewApartado({...newApartado, downPayment: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-red py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-red/90 transition-all border border-brand-red"
                  >
                    Guardar Anticipo & Reservar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddApartado(false)}
                    className="px-6 bg-interface-bg text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black/40 border border-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD ORDER */}
      <AnimatePresence>
        {showAddOrder && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-white/10 rounded-2xl max-w-lg w-full p-8 space-y-6"
            >
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Solicitud de Pedido Corporativo</h3>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Proveedor Oficial *</label>
                  <input 
                    type="text" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-bold text-white uppercase"
                    placeholder="Michelin México Corporativo"
                    value={newOrder.supplier}
                    onChange={(e) => setNewOrder({...newOrder, supplier: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Medidas y Cantidad de SKUs *</label>
                  <textarea 
                    required rows={3}
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none"
                    placeholder="Ej. 40x Pilot Sport 4S R17, 20x KO2..."
                    value={newOrder.items}
                    onChange={(e) => setNewOrder({...newOrder, items: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Presupuesto Estimado de Importación (MXN) *</label>
                  <input 
                    type="number" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-black text-white"
                    placeholder="120000"
                    value={newOrder.total}
                    onChange={(e) => setNewOrder({...newOrder, total: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-red py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-red/90 transition-all border border-brand-red"
                  >
                    Transmitir Pedido
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddOrder(false)}
                    className="px-6 bg-interface-bg text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black/40 border border-white/5 transition-all"
                  >
                    Cancelar
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
