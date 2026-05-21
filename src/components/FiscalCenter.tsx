import React, { useState, useEffect } from 'react';
import { SALES, TIRES, BRANCHES, UserRole } from '../data/mockData';
import { SaleNote, INITIAL_SALE_NOTES } from './Sales';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  AlertCircle,
  Activity,
  History,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Check,
  Send,
  Loader2,
  Lock,
  Building,
  User,
  Hash,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface FiscalCenterProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function FiscalCenter({ userRole, branchId }: FiscalCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Timbrada' | 'Pendiente' | 'Cancelada'>('All');
  
  // Tabs: 'issued' (Facturas CFDI) or 'pending' (Notas punto de venta pendientes de timbrar)
  const [activeSubTab, setActiveSubTab] = useState<'issued' | 'pending'>('issued');

  const isContador = userRole === 'contador';
  const isFacturista = userRole === 'secretaria_facturista' || userRole === 'superadmin' || userRole === 'contador';

  // Load Invoice logs (SALES)
  const [fiscalSales, setFiscalSales] = useState<typeof SALES>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('erp_fiscal_sales');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse erp_fiscal_sales:', e);
        }
      }
    }
    return SALES;
  });

  // Load Sales Notes from Point of Sale (for invoicing)
  const [salesNotes, setSalesNotes] = useState<SaleNote[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('erp_sales_notes');
      return saved ? JSON.parse(saved) : INITIAL_SALE_NOTES;
    }
    return INITIAL_SALE_NOTES;
  });

  // Sync state between browser tabs / local storage
  useEffect(() => {
    const handleSync = () => {
      const savedNotes = localStorage.getItem('erp_sales_notes');
      if (savedNotes) {
        try {
          setSalesNotes(JSON.parse(savedNotes));
        } catch (e) {
          console.error(e);
        }
      }
      const savedFiscal = localStorage.getItem('erp_fiscal_sales');
      if (savedFiscal) {
        try {
          setFiscalSales(JSON.parse(savedFiscal));
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('erp_sales_notes_updated', handleSync);
    window.addEventListener('erp_fiscal_sales_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('erp_sales_notes_updated', handleSync);
      window.removeEventListener('erp_fiscal_sales_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Filter Sales Notes that are NOT marked as invoiced
  const pendingNotes = salesNotes.filter(note => {
    const noteNotes = note.notes || '';
    const alreadyFacturado = noteNotes.includes('FACTURADO SAT') || (note as any).isFacturada === true;
    return !alreadyFacturado && (note.status === 'Pagado' || note.status === 'Apartado' || note.status === 'Crédito Activo');
  });

  // Filtered fiscal invoices CFDI 4.0
  const filteredSales = fiscalSales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sale.rfcRecuper.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || sale.status === filterStatus;
    const matchesBranch = !branchId || branchId === 'all' || sale.branchId === branchId;
    return matchesSearch && matchesFilter && matchesBranch;
  });

  // Filtered pending sales notes for display
  const filteredPendingNotes = pendingNotes.filter(note => {
    const matchesSearch = note.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !branchId || branchId === 'all' || note.branchId === branchId;
    return matchesSearch && matchesBranch;
  });

  // Calculate Slow Rotation Tires (more than 20 days without movement for demo)
  const todayDate = new Date('2026-05-21');
  const slowRotationTires = TIRES.filter(tire => {
    const lastMov = new Date(tire.lastMovement);
    const diffDays = Math.floor((todayDate.getTime() - lastMov.getTime()) / (1000 * 3600 * 24));
    return diffDays > 20;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Timbrada':
        return <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider"><CheckCircle2 className="w-3 h-3"/> Timbrada</span>;
      case 'Pendiente':
        return <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-950/80 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-wider"><Clock className="w-3 h-3"/> PPD Pendiente</span>;
      case 'Cancelada':
        return <span className="flex items-center gap-1.5 px-2 py-1 bg-red-950/80 text-red-400 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-wider"><XCircle className="w-3 h-3"/> Cancelada</span>;
      default:
        return null;
    }
  };

  // SAT Simulation states
  const [selectedNote, setSelectedNote] = useState<SaleNote | null>(null);
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [usoCfdi, setUsoCfdi] = useState('G01'); // Adquisición de mercancías
  const [regimenFiscal, setRegimenFiscal] = useState('612'); // Personas Físicas act empresarial
  const [codigoPostal, setCodigoPostal] = useState('88500'); // Default Reynosa/Frontera
  const [formaPago, setFormaPago] = useState('03'); // Transferencia
  const [metodoPago, setMetodoPago] = useState('PUE');
  
  const [rfcError, setRfcError] = useState('');
  const [cpError, setCpError] = useState('');

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [stampResult, setStampResult] = useState<{
    uuid: string;
    fecha: string;
    selloSat: string;
    selloEmisor: string;
    cadenaOriginal: string;
  } | null>(null);

  const startSatInvoicing = (note: SaleNote) => {
    setSelectedNote(note);
    setRazonSocial(note.clientName.toUpperCase());
    // Auto populate reasonable default RFC or use General Public
    setRfc(note.id === 'NV-283' ? 'TRA880112XX4' : 'XAXX010101000');
    setUsoCfdi('G01');
    setRegimenFiscal(note.id === 'NV-283' ? '601' : '612');
    setCodigoPostal('88500'); 
    setFormaPago(note.paymentType === 'Efectivo' ? '01' : note.paymentType === 'Tarjeta' ? '04' : '03'); 
    setMetodoPago(note.status === 'Apartado' || note.status === 'Crédito Activo' ? 'PPD' : 'PUE');
    setRfcError('');
    setCpError('');
    setStampResult(null);
    setIsSimulating(false);
    setSimulationStep(0);
    setSimulationLogs([]);
  };

  const validateRfc = (val: string) => {
    const cleanRfc = val.trim().toUpperCase();
    const rfcRegex = /^([A-ZÑ&]{3,4})([0-9]{6})([A-Z0-9]{3})$/;
    if (!cleanRfc) return 'El RFC es requerido para el timbrado fiscal.';
    if (!rfcRegex.test(cleanRfc)) return 'Formato SAT inválido (Ej. AAA010101AAA o AAAA010101AA0).';
    return '';
  };

  const validateCp = (val: string) => {
    if (!val) return 'El Código Postal es requerido.';
    if (!/^\d{5}$/.test(val)) return 'El Código Postal debe ser de 5 dígitos.';
    return '';
  };

  const handleStampInvoicing = () => {
    const rfcErr = validateRfc(rfc);
    const cpErr = validateCp(codigoPostal);

    if (rfcErr || cpErr) {
      setRfcError(rfcErr);
      setCpError(cpErr);
      return;
    }

    setRfcError('');
    setCpError('');
    setIsSimulating(true);
    setSimulationStep(0);
    setSimulationLogs([]);

    const steps = [
      { msg: 'Estableciendo comunicación encriptada con Servicedor PAC SAT (INF_FISCAL_02)...', delay: 400 },
      { msg: 'Validando sintaxis de esquema XML CFDI v4.0 (Nodos Emisor, Receptor y Conceptos)...', delay: 900 },
      { msg: 'Verificando estatus del RFC en Lista de Contribuyentes Obligados del SAT (LCO)... [ESTATUS: ACTIVO / SIN BLOQUEO]', delay: 1400 },
      { msg: 'Firmando estructura con certificado CSD de Multillantas de la Frontera (00001000000508492019)...', delay: 1950 },
      { msg: 'Timbrado Digital SAT Exitoso. Generando sello del SAT y UUID fiscal...', delay: 2400 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setSimulationStep(index + 1);
        setSimulationLogs(prev => [...prev, step.msg]);
        
        if (index === steps.length - 1) {
          const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
          const mockUuid = `${randomHex()}${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}-${randomHex()}${randomHex()}${randomHex()}`.toUpperCase();
          const todayIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
          
          const result = {
            uuid: mockUuid,
            fecha: todayIso,
            selloSat: `bI9E/cM8x1aYjRtf1P2mN+R2O4qHWSYtNuV0v7R+C7V8Q0K4sB3/xXmZf3bOnWq+${randomHex()}`,
            selloEmisor: `mZ8vB2nT0v9c7xP6aR+O4kWSmL3sX4pT2bYv1kQ5nV4m7vK8c3xO2nX4x1aK+${randomHex()}`,
            cadenaOriginal: `||1.1|${mockUuid}|${todayIso}|bI9E/cM8x1aYjRtf1P2mN+R2O4qHWSYtNuV0v7R+C7V8Q0K4sB3/xXmZf3bOnWq+|00001000000504204441||`
          };

          setStampResult(result);

          // Update lists and save
          saveStampedInvoice(mockUuid, todayIso);
        }
      }, step.delay);
    });
  };

  const saveStampedInvoice = (uuid: string, stampingDate: string) => {
    if (!selectedNote) return;

    // 1. Create CFDI 4.0 invoice
    const newInvoice: typeof SALES[0] = {
      id: `FA-${selectedNote.id.replace('NV-', '')}`,
      branchId: selectedNote.branchId,
      sellerId: 'Portal Facturación',
      items: selectedNote.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      total: selectedNote.total,
      tax: selectedNote.tax,
      paymentMethod: metodoPago as 'PUE' | 'PPD',
      paymentForm: formaPago as any,
      status: 'Timbrada',
      cfdiUsage: usoCfdi,
      rfcRecuper: rfc.toUpperCase(),
      date: stampingDate.split(' ')[0]
    };

    const updatedFiscalSales = [newInvoice, ...fiscalSales];
    setFiscalSales(updatedFiscalSales);
    localStorage.setItem('erp_fiscal_sales', JSON.stringify(updatedFiscalSales));
    window.dispatchEvent(new CustomEvent('erp_fiscal_sales_updated', { detail: updatedFiscalSales }));

    // 2. Mark POS Sales Note as Facturada
    const updatedSalesNotes = salesNotes.map(n => {
      if (n.id === selectedNote.id) {
        return {
          ...n,
          notes: `${n.notes ? n.notes + ' \n' : ''}[FACTURADO SAT CFDI 4.0 - UUID: ${uuid} el ${stampingDate}]`,
          isFacturada: true
        };
      }
      return n;
    });

    setSalesNotes(updatedSalesNotes);
    localStorage.setItem('erp_sales_notes', JSON.stringify(updatedSalesNotes));
    window.dispatchEvent(new CustomEvent('erp_sales_notes_updated', { detail: updatedSalesNotes }));
  };

  const downloadSimulatedFiles = (folio: string, uuid: string) => {
    alert(`Archivos de Facturación Generados con Éxito:\n\n📄 XML Fiscal: SAT_CFDI_4.0_EMISOR_MFR_${folio}_${uuid.substring(0,8)}.xml\n📕 Representación Impresa (PDF) con sello digital homologado.`);
  };

  const sendEmailSimulated = (email: string) => {
    alert(`Correo de Notificación Enviado:\n\nSe enviaron los archivos XML + PDF de la factura SAT correctamente a: ${email}`);
  };

  return (
    <div className="space-y-8 pb-20 text-white">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
            CONCILIACIÓN Y FACTURACIÓN SAT
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            CFDI 4.0 — Centro de Operación y Timbrado Legal
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95">
            <Download className="w-4 h-4" />
            Descarga XML SAT
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-850 transition-all shadow-lg active:scale-95 border border-white/5">
            <Download className="w-4 h-4 text-brand-gold" />
            Póliza CONTPAQi
          </button>
        </div>
      </div>

      {/* Role and Notification banner */}
      {isFacturista && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-red/10 border-l-4 border-brand-red p-6 rounded-r-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-brand-gold shadow-sm shrink-0 border border-brand-gold/20">
               <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-tight mb-1">MÓDULO DE FACTURACIÓN SAT ACTIVO</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide">
                Identificado como {userRole === 'secretaria_facturista' ? 'Secretaria Facturista' : 'Administrador'}. Puede timbrar notas comerciales de venta y consultar folios fiscales en tiempo real.
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-black border border-white/10 text-white text-[10px] font-black uppercase rounded-lg">PAC: INF_FISCAL</span>
            <span className="px-3 py-1.5 bg-black border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-lg">Webservice: En línea</span>
          </div>
        </motion.div>
      )}

      {/* Bank Reconciliation Section for Accountants */}
      {(isContador || userRole === 'superadmin') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-950 p-8 rounded-3xl text-white shadow-2xl border border-zinc-900">
            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Conciliación Efectivo vs Depósitos
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Cierres de Caja (Sucursales)', value: '$145,900', status: 'ready' },
                { label: 'Ingresos Bancarios (SAT)', value: '$145,000', status: 'warning', diff: '-$900' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-white">{item.value}</p>
                  </div>
                  {item.diff && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Diferencia</p>
                      <p className="text-lg font-black text-red-500">{item.diff}</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 flex gap-3">
                <button className="flex-1 py-4 bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all" onClick={() => alert('Todas las cajas del día se marcaron como conciliadas con ingresos SAT.')}>
                  Marcar como Conciliado
                </button>
                <button className="px-6 py-4 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all" onClick={() => alert('Exportando reporte conciliatorio del SAT.')}>
                  Exportar Reporte
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-900 shadow-xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Pólizas Contables</h3>
              <div className="flex gap-2">
                <button className="bg-zinc-900 p-2 rounded-lg hover:bg-zinc-850 transition-colors border border-white/5">
                  <Download className="w-4 h-4 text-brand-gold" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'CONTPAQi i', format: 'XML/XLS', last: 'Hoy 10:20 AM' },
                { name: 'Aspel COI', format: 'TXT/POL', last: 'Ayer' },
                { name: 'SAP Business One', format: 'CSV', last: '12 May' },
              ].map((software, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-zinc-900 rounded-2xl hover:border-brand-gold/30 hover:shadow-sm transition-all group bg-black/40">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-text-muted group-hover:text-brand-gold group-hover:bg-brand-gold/10 border border-white/5">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase leading-none mb-1">{software.name}</p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Formato: {software.format} • Ult: {software.last}</p>
                      </div>
                   </div>
                   <button className="text-[10px] font-black text-brand-gold uppercase border border-brand-gold/20 px-4 py-2 rounded-lg hover:bg-brand-gold hover:text-black transition-all" onClick={() => alert(`Generando y descargando póliza para ${software.name}`)}>
                      Descargar
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fiscal Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-940 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <ShieldAlert className="w-16 h-16 text-brand-red" />
          </div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Artículos de Baja Rotación</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-red-500">{slowRotationTires.length}</h4>
            <span className="text-xs font-bold text-text-muted uppercase tracking-tight">SKUs Estancados</span>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-bold uppercase italic">Inactivos por &gt; 20 días</p>
        </div>

        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-940 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <History className="w-16 h-16 text-brand-red" />
          </div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">IVA por Trasladar (PPD)</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-white">$12,450</h4>
            <span className="text-xs font-bold text-brand-gold uppercase tracking-tight">Pendiente CRP</span>
          </div>
          <p className="text-[10px] text-text-muted mt-2 font-bold uppercase">Proyectado para conciliación</p>
        </div>

        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-940 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
             <FileText className="w-16 h-16 text-white" />
          </div>
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Comisiones por Dispersar</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-white">$8,900</h4>
            <span className="text-xs font-bold text-text-muted uppercase tracking-tight">Corte {todayDate.toLocaleDateString()}</span>
          </div>
          <p className="text-[10px] text-brand-gold mt-2 font-bold uppercase underline cursor-pointer hover:text-white transition-colors" onClick={() => alert('Comisiones calculadas automáticamente en base a cobros conciliados.')}>Ver desglose por vendedor</p>
        </div>
      </div>

      {/* Sub-Tab Navigation for Accountant / Invoicing Role */}
      {isFacturista && (
        <div className="flex border-b border-zinc-900 gap-4">
          <button 
            onClick={() => setActiveSubTab('issued')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === 'issued' 
                ? 'text-brand-red border-b-2 border-brand-red font-black' 
                : 'text-text-muted hover:text-white'
            }`}
          >
            Facturas Emitidas CFDI 4.0 ({filteredSales.length})
          </button>
          <button 
            onClick={() => setActiveSubTab('pending')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeSubTab === 'pending' 
                ? 'text-brand-gold border-b-2 border-brand-gold font-black' 
                : 'text-text-muted hover:text-white'
            }`}
          >
            Notas Ventas Pendientes de Timbrar ({filteredPendingNotes.length})
            {filteredPendingNotes.length > 0 && (
              <span className="px-1.5 py-0.5 bg-brand-red text-white text-[8px] font-bold rounded-full animate-pulse">{filteredPendingNotes.length}</span>
            )}
          </button>
        </div>
      )}

      {/* Main Fiscal Table Area */}
      <div className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-xl overflow-hidden flex flex-col">
        {/* Table Filters */}
        <div className="p-6 border-b border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder={activeSubTab === 'issued' ? "Buscar por RFC, Folio o Cliente..." : "Buscar nota por Cliente o Folio..."}
              className="w-full pl-10 pr-4 py-2.5 bg-black border border-zinc-900 rounded-xl text-sm focus:outline-none focus:border-brand-red font-medium transition-all text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeSubTab === 'issued' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-text-muted hidden sm:block" />
              <select 
                className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest bg-black border border-zinc-900 rounded-xl py-2.5 px-4 focus:ring-0 cursor-pointer hover:bg-zinc-900 transition-colors text-white outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="All">Todos los Estatus</option>
                <option value="Timbrada">Timbradas</option>
                <option value="Pendiente">Pendientes PPD</option>
                <option value="Cancelada">Canceladas</option>
              </select>
            </div>
          )}
        </div>

        {/* 1. SU_TAB: ISSUED INVOICES (FACTURAS EMITIDAS) */}
        {activeSubTab === 'issued' && (
          <>
            {/* Desktop Accountant Table */}
            <div className="hidden lg:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-zinc-900">
                    <th className="px-6 py-4">Folio / Fecha</th>
                    <th className="px-6 py-4">RFC Receptor</th>
                    <th className="px-6 py-4">Uso / Régimen</th>
                    <th className="px-6 py-4">Total MXN</th>
                    <th className="px-6 py-4">Estatus SAT</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-xs text-text-muted uppercase font-black tracking-widest">
                        Ninguna factura fiscal encontrada
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-white">{sale.id}</p>
                          <p className="text-[10px] text-text-muted font-bold">{sale.date}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-text-muted font-mono tracking-tighter uppercase">{sale.rfcRecuper}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-white">
                          <span className="text-[10px] font-bold text-text-muted">USO: {sale.cfdiUsage}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-white">${sale.total.toLocaleString()}</p>
                          <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">IVA: ${sale.tax.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          {getStatusBadge(sale.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                             <button 
                               onClick={() => downloadSimulatedFiles(sale.id, sale.id + 'UUID-SAT')}
                               className="p-2 hover:bg-zinc-900 rounded-lg transition-colors group" 
                               title="Descargar XML + PDF"
                             >
                                <Download className="w-4 h-4 text-text-muted group-hover:text-brand-red animate-pulse" />
                             </button>
                             <button 
                               onClick={() => sendEmailSimulated(sale.rfcRecuper === 'XAXX010101000' ? "publico_general@sat.gob.mx" : "contabilidad@cliente.com")}
                               className="p-2 hover:bg-zinc-900 rounded-lg transition-colors group" 
                               title="Enviar por Correo"
                             >
                                <Send className="w-4 h-4 text-text-muted group-hover:text-amber-500" />
                             </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden divide-y divide-zinc-900">
              {filteredSales.length === 0 ? (
                <div className="p-12 text-center text-xs text-text-muted uppercase font-black">
                  Ninguna factura fiscal encontrada
                </div>
              ) : (
                filteredSales.map((sale) => (
                  <div key={sale.id} className="p-6 space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-black text-white tracking-tight text-lg leading-none">{sale.id}</h5>
                          <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{sale.date} • {sale.rfcRecuper}</p>
                        </div>
                        {getStatusBadge(sale.status)}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 bg-zinc-900 p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Monto Total</p>
                          <p className="text-sm font-black text-white">${sale.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Forma Pago</p>
                          <p className="text-sm font-black text-white">{sale.paymentForm || '03'} - {sale.paymentMethod}</p>
                        </div>
                     </div>
      
                     <div className="flex gap-2">
                        <button 
                          onClick={() => downloadSimulatedFiles(sale.id, sale.id + 'MOCK-UUID')}
                          className="flex-1 py-3 bg-zinc-900 text-white rounded-lg text-xs font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 border border-white/5 active:scale-95 transition-all"
                        >
                          <Download className="w-4 h-4 text-brand-gold" /> XML+PDF
                        </button>
                        <button 
                          onClick={() => sendEmailSimulated("correo@cliente.mx")}
                          className="px-4 py-3 bg-zinc-900 text-text-muted rounded-lg hover:bg-zinc-800 transition-colors border border-white/5 active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* 2. SUB-TAB: PENDING LOGS (NOTAS PENDIENTES DE TIMBRAR) */}
        {activeSubTab === 'pending' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-zinc-900">
                  <th className="px-6 py-4">Folio Nota</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Importe Neto</th>
                  <th className="px-6 py-4">Estatus Comercial</th>
                  <th className="px-6 py-4 text-right">Acción SAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredPendingNotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-text-muted uppercase font-black tracking-widest">
                      Excelente: ¡No hay notas de venta pendientes de timbrar!
                    </td>
                  </tr>
                ) : (
                  filteredPendingNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-gold">{note.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-white">{note.clientName}</p>
                        <p className="text-[10px] text-text-muted">{note.clientEmail || 'Sin correo'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-text-muted">{note.date}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-white">${note.total.toLocaleString()} MXN</p>
                        <p className="text-[10px] text-brand-gold font-bold">IVA: ${note.tax?.toLocaleString() || (note.total * 0.16).toFixed(0)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded-full border ${
                          note.status === 'Pagado' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                        }`}>
                          {note.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => startSatInvoicing(note)}
                          className="px-4 py-2 bg-brand-gold hover:bg-yellow-600 text-black rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto active:scale-95 shadow-sm"
                        >
                          <Zap className="w-3 h-3 text-black fill-current" />
                          Generar CFDI
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-black px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-zinc-900 gap-2">
           <p className="text-[10px] text-white/60 font-medium uppercase tracking-[0.2em]">
             Validación ante SAT WS v4.0.2: <span className="text-emerald-400 font-black tracking-normal">OK (Sincronizado)</span>
           </p>
           <div className="flex gap-4 text-[10px] text-white/40 font-black uppercase">
             <span>RFC Emisor: MFR831005DX5</span>
             <span>PAC Certificador: INF_FISCAL_02</span>
             <span>Versión CFDI: 4.0</span>
           </div>
        </div>
      </div>

      {/* SAT Invoicing Simulation Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Head */}
              <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-black">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center text-brand-gold border border-brand-gold/20 animate-pulse">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm tracking-tight text-white uppercase">CONSOLA SAT — EMISIÓN CFDI 4.0</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Asociado al Folio de Venta Comprobado: {selectedNote.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="text-text-muted hover:text-white transition-colors text-lg"
                  disabled={isSimulating && !stampResult}
                >
                  ✕
                </button>
              </div>

              {!isSimulating ? (
                /* STEP A: INPUT DATA FORM */
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div className="bg-brand-red/5 p-4 rounded-xl border border-brand-red/10 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-tight">Requerimiento SAT NOM-086 & CFDI 4.0</p>
                      <p className="text-[9px] text-text-muted mt-1 uppercase leading-relaxed">
                        El nombre o Razón Social debe coincidir exactamente con la Constancia de Situación Fiscal sin abreviaturas de régimen societario (ej. S.A. de C.V. se omite si se prefiere). Código Postal y Régimen son obligatorios para timbrado exitoso.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Receptor Corporate Name / Client Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3 text-brand-gold" /> Nombre / Razón Social Receptor *
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-red font-bold uppercase text-white"
                        value={razonSocial}
                        onChange={(e) => setRazonSocial(e.target.value)}
                      />
                    </div>

                    {/* RFC Receptor */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <Hash className="w-3 h-3 text-brand-gold" /> RFC Receptor (SAT)*
                      </label>
                      <input 
                        type="text"
                        placeholder="Ej: XAXX010101000"
                        className={`w-full bg-black border rounded-xl py-2 px-3 text-xs focus:outline-none font-mono font-bold uppercase text-white ${
                          rfcError ? 'border-brand-red' : 'border-zinc-900 focus:border-brand-red'
                        }`}
                        value={rfc}
                        onChange={(e) => {
                          setRfc(e.target.value);
                          setRfcError('');
                        }}
                      />
                      {rfcError && <p className="text-[9px] text-brand-red font-bold uppercase">{rfcError}</p>}
                    </div>

                    {/* Régimen Fiscal dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <Building className="w-3 h-3 text-brand-gold" /> Régimen Fiscal Receptor *
                      </label>
                      <select 
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-red font-mono text-white outline-none"
                        value={regimenFiscal}
                        onChange={(e) => setRegimenFiscal(e.target.value)}
                      >
                        <option value="601">601 - General de Ley Personas Morales</option>
                        <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                        <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                        <option value="625">625 - Régimen Simplificado de Confianza (RESICO)</option>
                        <option value="616">616 - Sin obligaciones fiscales</option>
                      </select>
                    </div>

                    {/* Uso de CFDI dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3 text-brand-gold" /> Uso de CFDI *
                      </label>
                      <select 
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-red font-mono text-white outline-none"
                        value={usoCfdi}
                        onChange={(e) => setUsoCfdi(e.target.value)}
                      >
                        <option value="G01">G01 - Adquisición de mercancías</option>
                        <option value="G03">G03 - Gastos en general</option>
                        <option value="D10">D10 - Pagos de servicios educativos</option>
                        <option value="S01">S01 - Sin efectos fiscales</option>
                        <option value="CP01">CP01 - Pagos</option>
                      </select>
                    </div>

                    {/* Código Postal */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-gold" /> Código Postal Receptor *
                      </label>
                      <input 
                        type="text"
                        maxLength={5}
                        placeholder="Ej. 88500"
                        className={`w-full bg-black border rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-red font-mono text-white ${
                          cpError ? 'border-brand-red' : 'border-zinc-900'
                        }`}
                        value={codigoPostal}
                        onChange={(e) => {
                          setCodigoPostal(e.target.value);
                          setCpError('');
                        }}
                      />
                      {cpError && <p className="text-[9px] text-brand-red font-bold uppercase">{cpError}</p>}
                    </div>

                    {/* Forma de Pago */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3 text-brand-gold" /> Forma de Pago (SAT) *
                      </label>
                      <select 
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-red text-white outline-none"
                        value={formaPago}
                        onChange={(e) => setFormaPago(e.target.value)}
                      >
                        <option value="01">01 - Efectivo</option>
                        <option value="02">02 - Cheque nominativo</option>
                        <option value="03">03 - Transferencia electrónica de fondos (SPEI)</option>
                        <option value="04">04 - Tarjeta de crédito</option>
                        <option value="28">28 - Tarjeta de débito</option>
                        <option value="99">99 - Por definir</option>
                      </select>
                    </div>

                    {/* Método de Pago */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 text-brand-gold" /> Método de Pago *
                      </label>
                      <select 
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-brand-red text-white outline-none"
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                      >
                        <option value="PUE">PUE - Pago en una sola exhibición</option>
                        <option value="PPD">PPD - Pago en parcialidades o diferido (CRP Obligatorio)</option>
                      </select>
                    </div>

                    {/* Subtotal & Tax indicator */}
                    <div className="bg-zinc-900 p-3 rounded-xl border border-white/5 flex flex-col justify-center">
                      <p className="text-[8px] font-black text-text-muted uppercase">Concepto total a facturar</p>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-sm font-black text-[#ffb700]">${selectedNote.total.toLocaleString()} MXN</span>
                        <span className="text-[9px] font-bold text-emerald-400 text-right">IVA 16% incl: ${selectedNote.tax?.toLocaleString() || (selectedNote.total*0.16).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Items */}
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-900 space-y-2">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Partidas y Llantas Asociadas</p>
                    {selectedNote.items.map((item, id) => (
                      <div key={id} className="flex justify-between items-center text-xs text-zinc-200">
                        <p className="font-bold">{item.quantity}x {item.brand} {item.model}</p>
                        <p className="font-mono text-zinc-400">${item.total.toLocaleString()} MXN (Unit: ${item.price.toLocaleString()})</p>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedNote(null)}
                      className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all text-text-muted"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button"
                      onClick={handleStampInvoicing}
                      className="px-8 py-3 bg-brand-gold hover:bg-yellow-600 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-yellow-950/20"
                    >
                      <Zap className="w-4 h-4 text-black fill-current" />
                      Timbrar Factura SAT
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP B: ANIMATED LAUNCH & TRANSMISSION LOOPS */
                <div className="p-8 flex-1 flex flex-col justify-center items-center text-center space-y-6">
                  {!stampResult ? (
                    <div className="space-y-6 w-full max-w-md py-12">
                      <div className="flex justify-center">
                        <Loader2 className="w-16 h-16 text-brand-gold animate-spin" />
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="text-sm font-black text-white uppercase tracking-wider animate-pulse">PROCESANDO TIMBRADO DIGITAL SAT</h5>
                        <p className="text-xs text-text-muted uppercase font-bold tracking-tight">Estableciendo túnel PAC con Multillantas de la Frontera</p>
                      </div>

                      {/* Log Screen Console */}
                      <div className="bg-black p-4 rounded-xl border border-zinc-900 text-left font-mono text-[9px] text-zinc-400 h-32 overflow-y-auto space-y-1.5 scrollbar-thin shadow-inner">
                        {simulationLogs.map((log, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">▶</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>

                      {/* Fake Progress Meter */}
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-red h-full transition-all duration-300"
                          style={{ width: `${(simulationStep / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* STEP C: RESULT & DOWNLOAD ARCHIVES */
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-6 w-full max-w-xl py-6"
                    >
                      <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
                        ✓
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-lg font-black text-emerald-400 uppercase tracking-tight">¡CFDI 4.0 TIMBRADO CON ÉXITO!</h5>
                        <p className="text-xs text-text-muted uppercase font-bold tracking-tight">Folio Fiscal SAT Autorizado e Integrado</p>
                      </div>

                      {/* UUID & XML Info metadata info */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-left space-y-3 font-mono text-[10px]">
                        <div className="flex justify-between pb-2 border-b border-white/5">
                          <span className="text-text-muted uppercase">FOLIO FISCAL (UUID):</span>
                          <span className="text-white font-bold tracking-wide">{stampResult.uuid}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-white/5">
                          <span className="text-text-muted uppercase">FECHA CERTIFICACIÓN:</span>
                          <span className="text-white">{stampResult.fecha}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-white/5">
                          <span className="text-text-muted uppercase">RFC EMISOR / RECEPTOR:</span>
                          <span className="text-[#ffb700]">MFR831005DX5 / {rfc.toUpperCase()}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-text-muted uppercase">SELLO DIGITAL SAT:</span>
                          <p className="text-[8px] text-zinc-500 break-all leading-tight bg-black p-2 rounded-lg border border-white/5">{stampResult.selloSat}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-text-muted uppercase">CADENA ORIGINAL PAC:</span>
                          <p className="text-[7.5px] text-zinc-500 bg-black p-2 rounded-lg border border-white/5 leading-none break-all">{stampResult.cadenaOriginal}</p>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => downloadSimulatedFiles(selectedNote.id, stampResult.uuid)}
                          className="py-3 bg-zinc-900 hover:bg-zinc-850 rounded-xl text-xs font-black uppercase tracking-widest text-white border border-zinc-800 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Download className="w-4 h-4 text-brand-gold" />
                          Descargar XML + PDF
                        </button>
                        <button 
                          onClick={() => sendEmailSimulated(selectedNote.clientEmail || 'contabilidad@cliente.mx')}
                          className="py-3 bg-brand-gold hover:bg-yellow-600 rounded-xl text-xs font-black uppercase tracking-widest text-black flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Send className="w-4 h-4 text-black" />
                          Enviar por Correo
                        </button>
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={() => {
                            setSelectedNote(null);
                          }}
                          className="w-full py-4 bg-brand-red hover:bg-red-700 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95"
                        >
                          Cerrar Consola de Timbrado
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slow Moving Inventory Section */}
      <section className="bg-zinc-950 rounded-2xl border border-zinc-900 shadow-sm p-6 overflow-hidden">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
           <AlertTriangle className="w-4 h-4 text-brand-red" /> Alerta de Baja Rotación (Utilidad en Riesgo)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {slowRotationTires.map(tire => (
            <div key={tire.id} className="p-4 rounded-xl bg-black border border-zinc-900 hover:border-brand-red/30 transition-all group">
               <p className="text-[9px] font-black text-text-muted uppercase mb-2">Ult. Venta: {tire.lastMovement}</p>
               <h5 className="font-black text-white text-sm leading-tight group-hover:text-brand-gold transition-colors">{tire.brand} {tire.model}</h5>
               <p className="text-[11px] text-text-muted font-bold mt-1">{tire.width}/{tire.profile}R{tire.rim}</p>
               
               <div className="mt-4 pt-4 border-t border-zinc-900 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase leading-none mb-1">Costo Capital</p>
                    <p className="text-sm font-black text-white">${(tire.cost * (tire.stock.matriz || 50)).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => alert(`El neumático slow-rotation ${tire.brand} tiene 50 piezas distribuidas. Se sugiere descuento promocional en sucursal Frontera.`)}
                    className="p-2 bg-zinc-900 rounded-lg border border-white/5 text-brand-gold hover:bg-zinc-850 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
