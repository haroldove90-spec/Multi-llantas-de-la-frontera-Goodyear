import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Mail, 
  Percent, 
  User, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Clock,
  Coins,
  TrendingUp,
  UserPlus,
  CheckCircle,
  DollarSign,
  Check,
  Trash2,
  HelpCircle,
  Send,
  Users,
  Activity,
  CheckCircle2,
  Wallet,
  ArrowRight,
  PlusCircle,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TIRES, BRANCHES, UserRole, updateTiresStorage, logTireMovement } from '../data/mockData';

interface SalesProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

interface QuoteItem {
  productId: string;
  brand: string;
  model: string;
  quantity: number;
  price: number;
  total: number;
}

interface Quote {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Vigente' | 'Aceptada' | 'Vencida';
  branchId: string;
}

// POS Sales and Remission notes payment-types
export type PaymentType = 'Efectivo' | 'Tarjeta' | 'Apartado' | 'Crédito';

export interface SaleNoteItem {
  productId: string;
  brand: string;
  model: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SaleNote {
  id: string; // NV-2026-XXX
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  items: SaleNoteItem[];
  subtotal: number;
  discount: number; // percentage
  tax: number;
  total: number;
  paymentType: PaymentType;
  creditMonths?: 3 | 6 | 9; // MSI 3, 6, 9
  creditInstallmentsPaid?: number; // how many months have they paid
  amountPaidSoFar: number; // For layaways
  status: 'Pagado' | 'Apartado' | 'Pendiente' | 'Crédito Activo';
  dotCode: string;
  branchId: string;
  notes?: string;
}

export interface ClientFollowUp {
  id: string;
  clientName: string;
  phone: string;
  lastProductBought: string;
  status: 'Sin Contactar' | 'Llamado' | 'Llamar mañana' | 'Completado';
  nextContactDate: string;
  lastContactDate: string;
  notes: { date: string; text: string }[];
}

// Initial mock sales notes
export const INITIAL_SALE_NOTES: SaleNote[] = [
  {
    id: 'NV-281',
    clientName: 'Roberto Medina Torres',
    clientPhone: '899-234-5678',
    clientEmail: 'roberto_medina@gmail.com',
    date: '2026-05-20',
    items: [
      { productId: 'T-01', brand: 'Michelin', model: 'Pilot Sport 5', quantity: 4, price: 4625, total: 18500 }
    ],
    subtotal: 18500,
    discount: 5,
    tax: 2812,
    total: 20387,
    paymentType: 'Efectivo',
    amountPaidSoFar: 20387,
    status: 'Pagado',
    dotCode: 'DOT 1224 MIC5',
    branchId: 'matriz',
    notes: 'Cliente de mostrador solicita llanta de alta velocidad.'
  },
  {
    id: 'NV-282',
    clientName: 'Alejandra Garza H.',
    clientPhone: '899-123-4567',
    clientEmail: 'alejandra.garzah@pyme.mx',
    date: '2026-05-19',
    items: [
      { productId: 'T-04', brand: 'Bridgestone', model: 'Dueler H/P Sport', quantity: 2, price: 5250, total: 10500 }
    ],
    subtotal: 10500,
    discount: 0,
    tax: 1680,
    total: 12180,
    paymentType: 'Apartado',
    amountPaidSoFar: 5000,
    status: 'Apartado',
    dotCode: 'DOT 4225 BDU2',
    branchId: 'frontera',
    notes: 'Anticipo del 40% en sucursal Frontera. Viene el fin de semana por montaje y balanceo.'
  },
  {
    id: 'NV-283',
    clientName: 'Transportes Rápidos Monterrey',
    clientPhone: '818-987-6543',
    clientEmail: 'compras@rapidosmty.com',
    date: '2026-05-18',
    items: [
      { productId: 'T-03', brand: 'Goodyear', model: 'EfficientGrip Performance', quantity: 6, price: 4100, total: 24600 }
    ],
    subtotal: 24600,
    discount: 10,
    tax: 3542.4,
    total: 25682,
    paymentType: 'Crédito',
    creditMonths: 6,
    creditInstallmentsPaid: 2,
    amountPaidSoFar: 8560, // paid 2 installments which is total * 2/6
    status: 'Crédito Activo',
    dotCode: 'DOT 0526 GYEF',
    branchId: 'norte',
    notes: 'Crédito pre-autorizado a 6 meses sin intereses.'
  },
  {
    id: 'NV-284',
    clientName: 'Ing. Carlos Lozano Ruiz',
    clientPhone: '899-765-4321',
    clientEmail: 'carlos_lozano@pemex.com',
    date: '2026-05-21',
    items: [
      { productId: 'T-02', brand: 'Michelin', model: 'Primacy 4', quantity: 4, price: 3950, total: 15800 }
    ],
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
    id: 'NV-285',
    clientName: 'Marina de la Garza Ruiz',
    clientPhone: '81 2299 8811',
    clientEmail: 'marina.garza@hotmail.com',
    date: '2026-05-15',
    items: [
      { productId: 'T-01', brand: 'Michelin', model: 'Pilot Sport 5', quantity: 2, price: 4625, total: 9250 }
    ],
    subtotal: 9250,
    discount: 0,
    tax: 1480,
    total: 10730,
    paymentType: 'Tarjeta',
    amountPaidSoFar: 10730,
    status: 'Pagado',
    dotCode: 'DOT 0325 GY11',
    branchId: 'frontera',
    notes: 'Liquidado con tarjeta Banorte en Sucursal Frontera.'
  }
];

// Initial follow-up clients
const INITIAL_FOLLOW_UPS: ClientFollowUp[] = [
  {
    id: 'CF-101',
    clientName: 'Alejandra Garza H.',
    phone: '899-123-4567',
    lastProductBought: '2x Bridgestone Dueler H/P Sport (Apartado)',
    status: 'Llamar mañana',
    nextContactDate: '2026-05-22',
    lastContactDate: '2026-05-19',
    notes: [
      { date: '2026-05-19', text: 'Se registró el apartado con $5,000 de anticipo. Comenta que vendrá el lunes próximo.' }
    ]
  },
  {
    id: 'CF-102',
    clientName: 'Ing. Carlos Lozano Ruiz',
    phone: '899-765-4321',
    lastProductBought: '4x Michelin Primacy 4 (Crédito 3 MSI)',
    status: 'Sin Contactar',
    nextContactDate: '2026-05-25',
    lastContactDate: '2026-05-21',
    notes: [
      { date: '2026-05-21', text: 'Se autorizó el crédito de 3 meses sin intereses en terminal bancaria.' }
    ]
  },
  {
    id: 'CF-103',
    clientName: 'Transportes Rápidos Monterrey',
    phone: '818-987-6543',
    lastProductBought: '6x Goodyear EfficientGrip (Crédito 6 MSI)',
    status: 'Llamado',
    nextContactDate: '2026-05-26',
    lastContactDate: '2026-05-18',
    notes: [
      { date: '2026-05-18', text: 'Llamada de confirmación de entrega y firma del pagaré en sucursal Norte. Trato excelente.' }
    ]
  }
];

export default function Sales({ userRole, branchId }: SalesProps) {
  const activeBranch = !branchId || branchId === 'all' ? 'matriz' : branchId;

  // Navigation tabs of the console
  const [activeTabLabel, setActiveTabLabel] = useState<'pos' | 'history' | 'quotes' | 'followup'>('pos');

  // Unified dynamic exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('erp_exchange_rate');
    return saved ? parseFloat(saved) : 18.50;
  });

  useEffect(() => {
    const handleSyncRate = (e: any) => {
      if (e.detail) {
        setExchangeRate(e.detail);
      }
    };
    window.addEventListener('erp-exchange-rate-updated', handleSyncRate);
    return () => {
      window.removeEventListener('erp-exchange-rate-updated', handleSyncRate);
    };
  }, []);

  // 1. POINT OF SALE (POS) STATE
  const [tiresList, setTiresList] = useState<any[]>(() => [...TIRES]);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setTiresList([...e.detail]);
      }
    };
    window.addEventListener('erp-tires-updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('erp-tires-updated', handleStorageUpdate);
    };
  }, []);

  const [posCart, setPosCart] = useState<QuoteItem[]>(() => {
    const saved = localStorage.getItem('erp_pos_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('erp_pos_cart', JSON.stringify(posCart));
  }, [posCart]);

  useEffect(() => {
    const handleAddToCart = (e: any) => {
      const { productId, quantity } = e.detail;
      const parsedQty = quantity || 1;
      const tire = TIRES.find(t => t.id === productId);
      if (!tire) return;

      const activeBranch = branchId || 'matriz';
      const available = tire.stock?.[activeBranch] || 0;
      
      setPosCart(currentCart => {
        const existingIndex = currentCart.findIndex(item => item.productId === productId);
        const qtyInCart = existingIndex > -1 ? currentCart[existingIndex].quantity : 0;
        
        if (qtyInCart + parsedQty > available) {
          alert(`Límite de stock excedido para ${tire.brand} ${tire.model}. Stock disponible: ${available}`);
          return currentCart;
        }

        const priceToUse = tire.price;
        if (existingIndex > -1) {
          const updated = [...currentCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + parsedQty,
            total: (updated[existingIndex].quantity + parsedQty) * priceToUse
          };
          return updated;
        } else {
          return [
            ...currentCart,
            {
              productId,
              brand: tire.brand,
              model: tire.model,
              width: tire.width,
              profile: tire.profile,
              rim: tire.rim,
              price: priceToUse,
              quantity: parsedQty,
              total: parsedQty * priceToUse
            }
          ];
        }
      });
    };
    window.addEventListener('erp-add-to-cart', handleAddToCart);
    return () => window.removeEventListener('erp-add-to-cart', handleAddToCart);
  }, [branchId]);

  const [posClientInfo, setPosClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    discount: 0,
    dotCode: '',
    notes: ''
  });

  const [paymentType, setPaymentType] = useState<PaymentType>('Efectivo');
  const [layawayAdvance, setLayawayAdvance] = useState<string>('5000');
  const [creditMsiMonths, setCreditMsiMonths] = useState<3 | 6 | 9>(3);
  const [posSearchTerm, setPosSearchTerm] = useState('');

  // 2. REGISTERED SALES NOTES (WITH SEMAFORO INDICATION)
  const [salesNotes, setSalesNotes] = useState<SaleNote[]>(() => {
    const saved = localStorage.getItem('erp_sales_notes');
    return saved ? JSON.parse(saved) : INITIAL_SALE_NOTES;
  });

  useEffect(() => {
    const savedString = localStorage.getItem('erp_sales_notes');
    const stateString = JSON.stringify(salesNotes);
    if (savedString !== stateString) {
      localStorage.setItem('erp_sales_notes', stateString);
    }
  }, [salesNotes]);

  useEffect(() => {
    const handleSyncNotes = (e: any) => {
      if (e.detail) {
        setSalesNotes(e.detail);
      } else {
        const saved = localStorage.getItem('erp_sales_notes');
        if (saved) {
          try {
            setSalesNotes(JSON.parse(saved));
          } catch (err) {
            console.error(err);
          }
        }
      }
    };
    window.addEventListener('erp_sales_notes_updated', handleSyncNotes);
    window.addEventListener('storage', handleSyncNotes);
    return () => {
      window.removeEventListener('erp_sales_notes_updated', handleSyncNotes);
      window.removeEventListener('storage', handleSyncNotes);
    };
  }, []);

  // Filters for History Tab
  const [historySearch, setHistorySearch] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | PaymentType>('all');

  // Selected Sales Note for Letter Form modal
  const [activeNoteForDocument, setActiveNoteForDocument] = useState<SaleNote | null>(null);

  // 3. SEGUIMIENTO DE CLIENTES state
  const [followUps, setFollowUps] = useState<ClientFollowUp[]>(() => {
    const saved = localStorage.getItem('erp_follow_ups');
    return saved ? JSON.parse(saved) : INITIAL_FOLLOW_UPS;
  });

  useEffect(() => {
    localStorage.setItem('erp_follow_ups', JSON.stringify(followUps));
  }, [followUps]);

  const [followSearch, setFollowSearch] = useState('');
  const [newLogNote, setNewLogNote] = useState('');
  const [selectedFollowId, setSelectedFollowId] = useState<string | null>(null);

  // 4. PRE-EXISTING QUOTES COMPATIBILITY
  const [quotesList, setQuotesList] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('erp_quotes_list');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'COT-2026-081',
        clientName: 'Alejandro Garza H.',
        clientPhone: '899-123-4567',
        date: '2026-05-20',
        validUntil: '2026-06-20',
        items: [
          { productId: 'T-01', brand: 'Michelin', model: 'Pilot Sport 5', quantity: 4, price: 4625, total: 18500 }
        ],
        subtotal: 18500,
        discount: 10,
        tax: 2664,
        total: 19314,
        status: 'Vigente',
        branchId: 'matriz'
      },
      {
        id: 'COT-2026-082',
        clientName: 'Transportes Rápidos Monterrey',
        clientPhone: '818-987-6543',
        date: '2026-05-18',
        validUntil: '2026-06-18',
        items: [
          { productId: 'T-04', brand: 'Bridgestone', model: 'Dueler H/P Sport', quantity: 6, price: 5250, total: 31500 }
        ],
        subtotal: 31500,
        discount: 0,
        tax: 5040,
        total: 36540,
        status: 'Aceptada',
        branchId: 'norte'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('erp_quotes_list', JSON.stringify(quotesList));
  }, [quotesList]);

  // Quotes designer state
  const [activeQuote, setActiveQuote] = useState<QuoteItem[]>([]);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    discount: 0,
    validityDays: 15
  });

  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quote | null>(null);

  // Tire Selector catalog filters
  const filteredTires = tiresList.filter(t => 
    t.brand.toLowerCase().includes(posSearchTerm.toLowerCase()) || 
    t.model.toLowerCase().includes(posSearchTerm.toLowerCase()) ||
    `${t.width}/${t.profile} R${t.rim}`.toLowerCase().includes(posSearchTerm.toLowerCase())
  );

  // POS Add item
  const handleAddItemToPos = (tireId: string) => {
    const tire = tiresList.find(t => t.id === tireId);
    if (!tire) return;

    // Check available stock in current branch
    const available = tire.stock[activeBranch] || 0;
    const existingIndex = posCart.findIndex(item => item.productId === tireId);
    const qtyInCart = existingIndex > -1 ? posCart[existingIndex].quantity : 0;

    if (qtyInCart + 1 > available) {
      setStockWarning(`No hay suficiente inventario de ${tire.brand} ${tire.model} en esta sucursal (Disponible: ${available} pzs).`);
      setTimeout(() => setStockWarning(null), 4000);
      return;
    }

    setStockWarning(null);
    if (existingIndex > -1) {
      const updated = [...posCart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
      setPosCart(updated);
    } else {
      setPosCart([...posCart, {
        productId: tire.id,
        brand: tire.brand,
        model: tire.model,
        quantity: 1,
        price: tire.price,
        total: tire.price
      }]);
    }
  };

  const handleUpdatePosQuantity = (productId: string, val: number) => {
    if (val < 1) return;
    const tire = tiresList.find(t => t.id === productId);
    if (!tire) return;

    // Check available stock in current branch
    const available = tire.stock[activeBranch] || 0;
    if (val > available) {
      setStockWarning(`No puedes vender más del inventario disponible (${available} pzs).`);
      setTimeout(() => setStockWarning(null), 4500);
      return;
    }

    setStockWarning(null);
    setPosCart(posCart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: val, total: val * item.price };
      }
      return item;
    }));
  };

  const handleRemoveItemFromPos = (productId: string) => {
    setPosCart(posCart.filter(item => item.productId !== productId));
  };

  // Math totals for POS Cart
  const posSubtotal = posCart.reduce((sum, item) => sum + item.total, 0);
  const posDiscountAmount = posSubtotal * (posClientInfo.discount / 100);
  const posTotalWithDisc = posSubtotal - posDiscountAmount;
  const posTax = posTotalWithDisc * 0.16;
  const posTotalNet = posTotalWithDisc + posTax;

  // Handle checked-out POS Submission
  const handleCheckoutPOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) {
      alert('Agrega llantas al carrito para procesar una nota de venta.');
      return;
    }

    // Determine status & paid allocation
    let finalStatus: SaleNote['status'] = 'Pagado';
    let paidAmount = posTotalNet;

    if (paymentType === 'Apartado') {
      finalStatus = 'Apartado';
      paidAmount = parseFloat(layawayAdvance) || 0;
      if (paidAmount >= posTotalNet) {
        paidAmount = posTotalNet;
        finalStatus = 'Pagado';
      }
    } else if (paymentType === 'Crédito') {
      finalStatus = 'Crédito Activo';
      paidAmount = 0; // Starts at 0 installments paid
    }

    const newFolio = `NV-2026-0${salesNotes.length + 86}`;
    const newNote: SaleNote = {
      id: newFolio,
      clientName: posClientInfo.name || 'Público Mostrador',
      clientPhone: posClientInfo.phone || '899-000-0000',
      clientEmail: posClientInfo.email || 'mostrador@multillantas.com',
      date: new Date().toISOString().split('T')[0],
      items: posCart,
      subtotal: posSubtotal,
      discount: posClientInfo.discount,
      tax: posTax,
      total: posTotalNet,
      paymentType: paymentType,
      creditMonths: paymentType === 'Crédito' ? creditMsiMonths : undefined,
      creditInstallmentsPaid: paymentType === 'Crédito' ? 0 : undefined,
      amountPaidSoFar: paidAmount,
      status: finalStatus,
      dotCode: 'N/A',
      branchId: activeBranch,
      notes: posClientInfo.notes
    };

    // Auto append to follow ups if layaway or credit
    if (paymentType === 'Apartado' || paymentType === 'Crédito') {
      const conditionLabel = paymentType === 'Apartado' ? 'Apartado con Anticipo' : `Crédito ${creditMsiMonths} MSI`;
      const newFollowItem: ClientFollowUp = {
        id: `CF-${100 + followUps.length + 1}`,
        clientName: newNote.clientName,
        phone: newNote.clientPhone,
        lastProductBought: `${posCart.map(c => `${c.quantity}x ${c.brand} ${c.model}`).join(', ')} (${conditionLabel})`,
        status: 'Sin Contactar',
        nextContactDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastContactDate: new Date().toISOString().split('T')[0],
        notes: [
          { date: new Date().toISOString().split('T')[0], text: `Se registró la compra en modalidad ${conditionLabel}. Requiere cobranza preventiva.` }
        ]
      };
      setFollowUps([newFollowItem, ...followUps]);
    }

    // Real-time stock decrease on Sale
    let stockModified = false;
    posCart.forEach(cartItem => {
      const tire = TIRES.find(t => t.id === cartItem.productId);
      if (tire) {
        if (!tire.stock) tire.stock = {};
        const oldStock = tire.stock[activeBranch] || 0;
        tire.stock[activeBranch] = Math.max(0, oldStock - cartItem.quantity);
        tire.lastMovement = new Date().toISOString().split('T')[0];
        stockModified = true;

        // Log movement in operational ledger
        logTireMovement({
          userName: localStorage.getItem('erp_user_name') || 'Vendedor POS',
          userRole: localStorage.getItem('erp_user_role') || 'vendedor',
          productId: cartItem.productId,
          productDetails: `${cartItem.brand} ${cartItem.model}`,
          type: 'venta',
          sourceBranchId: activeBranch,
          sourceBranchName: BRANCHES.find(b => b.id === activeBranch)?.name || activeBranch,
          destBranchId: 'cliente',
          destBranchName: `Cliente: ${newNote.clientName}`,
          qty: cartItem.quantity,
          reason: `Nota de Venta ${newNote.id} (${paymentType})`
        });
      }
    });
    if (stockModified) {
      updateTiresStorage(TIRES);
    }

    setSalesNotes([newNote, ...salesNotes]);
    setActiveNoteForDocument(newNote); // Show printable Letter PDF immediately
    
    // Clear state
    setPosCart([]);
    setPosClientInfo({
      name: '',
      phone: '',
      email: '',
      discount: 0,
      dotCode: '',
      notes: ''
    });
  };

  // Layaway payment registry
  const handleAddApartadoPayment = (noteId: string, amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    setSalesNotes(prevNotes => prevNotes.map(n => {
      if (n.id === noteId) {
        const nextPaid = n.amountPaidSoFar + amount;
        const reachedFull = nextPaid >= n.total;
        return {
          ...n,
          amountPaidSoFar: reachedFull ? n.total : nextPaid,
          status: reachedFull ? 'Pagado' : 'Apartado'
        };
      }
      return n;
    }));
  };

  // Credit payment installment registry
  const handlePayInstallment = (noteId: string) => {
    setSalesNotes(prevNotes => prevNotes.map(n => {
      if (n.id === noteId && n.paymentType === 'Crédito' && n.creditMonths) {
        const curPaid = n.creditInstallmentsPaid || 0;
        if (curPaid < n.creditMonths) {
          const nextPaidCount = curPaid + 1;
          const installmentSize = n.total / n.creditMonths;
          const isLapsedFully = nextPaidCount === n.creditMonths;
          return {
            ...n,
            creditInstallmentsPaid: nextPaidCount,
            amountPaidSoFar: Number((installmentSize * nextPaidCount).toFixed(2)),
            status: isLapsedFully ? 'Pagado' : 'Crédito Activo'
          };
        }
      }
      return n;
    }));
  };

  // Add notes to a customer Follow-up
  const handleAddFollowLog = (followId: string) => {
    if (!newLogNote.trim()) return;
    setFollowUps(prev => prev.map(f => {
      if (f.id === followId) {
        return {
          ...f,
          lastContactDate: new Date().toISOString().split('T')[0],
          notes: [
            { date: new Date().toISOString().split('T')[0], text: newLogNote.trim() },
            ...f.notes
          ]
        };
      }
      return f;
    }));
    setNewLogNote('');
  };

  // Toggle follow status
  const handleToggleFollowStatus = (followId: string, nextStatus: ClientFollowUp['status']) => {
    setFollowUps(prev => prev.map(f => f.id === followId ? { ...f, status: nextStatus } : f));
  };

  // Pre-existing quote functionality
  const filteredQuotesTires = tiresList.filter(t => 
    t.brand.toLowerCase().includes(posSearchTerm.toLowerCase()) || 
    t.model.toLowerCase().includes(posSearchTerm.toLowerCase())
  );

  const handleAddItemToQuote = (tireId: string) => {
    const tire = tiresList.find(t => t.id === tireId);
    if (!tire) return;

    const existingIndex = activeQuote.findIndex(item => item.productId === tireId);
    if (existingIndex > -1) {
      const updated = [...activeQuote];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].price;
      setActiveQuote(updated);
    } else {
      setActiveQuote([...activeQuote, {
        productId: tire.id,
        brand: tire.brand,
        model: tire.model,
        quantity: 1,
        price: tire.price,
        total: tire.price
      }]);
    }
  };

  const handleUpdateQuoteQuantity = (productId: string, val: number) => {
    if (val < 1) return;
    setActiveQuote(activeQuote.map(item => item.productId === productId ? { ...item, quantity: val, total: val * item.price } : item));
  };

  const handleRemoveItemFromQuote = (productId: string) => {
    setActiveQuote(activeQuote.filter(item => item.productId !== productId));
  };

  const qSubtotal = activeQuote.reduce((acc, item) => acc + item.total, 0);
  const qDisc = qSubtotal * (clientInfo.discount / 100);
  const qPostDisc = qSubtotal - qDisc;
  const qTax = qPostDisc * 0.16;
  const qTotal = qPostDisc + qTax;

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeQuote.length === 0) return;

    const newQuote: Quote = {
      id: `COT-2026-0${80 + quotesList.length + 1}`,
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone || 'Mostrador',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + clientInfo.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: activeQuote,
      subtotal: qSubtotal,
      discount: clientInfo.discount,
      tax: qTax,
      total: qTotal,
      status: 'Vigente',
      branchId: activeBranch
    };

    setQuotesList([newQuote, ...quotesList]);
    setSelectedQuoteForPrint(newQuote);

    // Reset draft
    setActiveQuote([]);
    setClientInfo({
      name: '',
      phone: '',
      discount: 0,
      validityDays: 15
    });
  };

  // Advanced filters for the sales history with traffic light colors
  const filteredHistoryNotes = salesNotes.filter(note => {
    const matchesSearch = note.clientName.toLowerCase().includes(historySearch.toLowerCase()) || 
                          note.id.toLowerCase().includes(historySearch.toLowerCase()) || 
                          note.clientPhone.includes(historySearch);
    const matchesType = historyTypeFilter === 'all' || note.paymentType === historyTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="sales-parent" className="space-y-6 pb-20">
      
      {/* SCOPED CSS PRINT RULE FOR SIZE LETTER PDF SHEET ONLY */}
      <style>{`
        @media print {
          /* Hide everything except the invoice container */
          body * {
            visibility: hidden !important;
          }
          #print-letter-container, #print-letter-container * {
            visibility: visible !important;
          }
          #print-letter-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 8.5in !important;
            height: 11in !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Title block */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            MULTILLANTAS - PORTAL DE VENTAS
          </h2>
          <p className="text-text-muted text-xs font-black uppercase tracking-widest mt-1">
            Sucursal Seleccionada: <span className="text-[#ffb700]">{BRANCHES.find(b => b.id === activeBranch)?.name || 'Frontera Centro'}</span> • Monitoreo de Transacciones y Semáforos
          </p>
        </div>
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 text-[10px] uppercase font-black tracking-widest gap-2">
          <span className="px-3 py-1 bg-brand-red text-white rounded-xl">POS Activo</span>
          <span className="px-3 py-1 text-zinc-400">T.C.: ${exchangeRate.toFixed(2)} MXN</span>
        </div>
      </header>

      {/* Internal Tab selectors */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto">
        {[
          { id: 'pos', label: '🛒 Punto de Venta (POS)', color: 'border-brand-red' },
          { id: 'history', label: '📊 Ventas & Semáforos', color: 'border-[#ffb700]' },
          { id: 'followup', label: '👥 Seguimiento Clientes', color: 'border-emerald-500' },
          { id: 'quotes', label: '📑 Cotizador Tradicional', color: 'border-blue-500' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabLabel(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTabLabel === tab.id 
                ? `${tab.color} text-white bg-zinc-950 rounded-t-xl font-bold` 
                : 'border-transparent text-zinc-500 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB A: PUNTO DE VENTA (POS) */}
      {activeTabLabel === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Tire search / catalog selector - Col span 7 */}
          <div className="lg:col-span-7 bg-card-bg p-6 rounded-2xl border border-zinc-900 space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Catálogo de Neumáticos en Sucursal</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Toque agregar para adjuntar al ticket de compra activo</p>
              </div>
              {posCart.length > 0 && (
                <button 
                  onClick={() => setPosCart([])}
                  className="text-[9px] text-brand-red font-black uppercase tracking-widest px-3 py-1.5 bg-brand-red/10 rounded-xl hover:bg-brand-red/20 transition-all border border-brand-red/20"
                >
                  Vaciar carrito ({posCart.reduce((sum, i) => sum + i.quantity, 0)} pzas)
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filtrar neumáticos (ej. Michelin, R16, Dueler)..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white uppercase outline-none focus:border-[#ffb700] transition-colors"
                value={posSearchTerm}
                onChange={(e) => setPosSearchTerm(e.target.value)}
              />
            </div>

            {/* Tires grid scroll */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-805">
              {filteredTires.map(tire => {
                const stockVal = tire.stock[activeBranch] || 0;
                return (
                  <div 
                    key={tire.id} 
                    className="p-3.5 bg-black hover:bg-zinc-950/80 rounded-xl border border-zinc-900 hover:border-zinc-800 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-black uppercase text-brand-red tracking-wider">{tire.brand}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${stockVal > 0 ? 'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`}>
                          STOCK: {stockVal} PZA
                        </span>
                      </div>
                      <h4 className="font-black text-white text-xs uppercase mt-1 leading-tight">{tire.model}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold mt-0.5 font-mono">{`${tire.width}/${tire.profile} R${tire.rim} ${tire.loadIndex}${tire.speedRating}`}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-900 pt-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#ffb700] font-mono">${tire.price.toLocaleString()} MXN</span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Eq: ${(tire.price / exchangeRate).toFixed(1)} USD</span>
                      </div>
                      <button
                        onClick={() => handleAddItemToPos(tire.id)}
                        disabled={stockVal === 0}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          stockVal > 0 
                            ? 'bg-brand-red hover:bg-brand-red/90 text-white' 
                            : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                        }`}
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout & Bill Form - Col span 5 */}
          <div className="lg:col-span-12 xl:col-span-5 bg-card-bg p-6 rounded-2xl border border-zinc-900 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center gap-2">
              <Coins className="text-[#ffb700] w-4 h-4" /> COMPRA DE MOSTRADOR / TICKET
            </h3>

            {stockWarning && (
              <div className="p-3.5 bg-brand-red/15 border border-brand-red/25 rounded-xl text-[10.5px] font-black uppercase text-brand-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-brand-red shrink-0 animate-bounce" />
                <span>{stockWarning}</span>
              </div>
            )}

            {posCart.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 bg-black/40 border border-dashed border-zinc-900 rounded-xl space-y-2">
                <Sparkles className="w-8 h-8 text-brand-red mx-auto animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest">Caja POS Vacía</p>
                <p className="text-[10px] text-zinc-600">Busque de la izquierda e ingrese llantas para calcular cobro.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutPOS} className="space-y-4">
                {/* Cart list items */}
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {posCart.map(item => (
                    <div key={item.productId} className="p-2.5 bg-black rounded-lg border border-zinc-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-black text-white text-[11px] uppercase leading-none">{item.brand} — {item.model}</p>
                        <p className="text-[9px] text-[#ffb700] font-mono mt-1">${item.price.toLocaleString()} MXN u.</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-md border border-zinc-900">
                          <button
                            type="button"
                            onClick={() => handleUpdatePosQuantity(item.productId, item.quantity - 1)}
                            className="w-5 h-5 bg-zinc-900 hover:bg-zinc-800 rounded flex items-center justify-center font-bold text-white text-xs"
                          >
                            -
                          </button>
                          <span className="font-semibold text-white px-1.5">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdatePosQuantity(item.productId, item.quantity + 1)}
                            className="w-5 h-5 bg-zinc-900 hover:bg-zinc-800 rounded flex items-center justify-center font-bold text-white text-xs"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-right font-mono font-black text-white w-20">${item.total.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromPos(item.productId)}
                          className="text-brand-red hover:text-red-400 p-1 text-[10px] font-black"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cliente / Datos del Cliente */}
                <div className="space-y-3 pt-2 border-t border-zinc-900">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Nombre Cliente *</label>
                      <input
                        type="text" required
                        placeholder="Luis Garza"
                        value={posClientInfo.name}
                        onChange={(e) => setPosClientInfo({ ...posClientInfo, name: e.target.value })}
                        className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-xs text-white uppercase font-bold focus:border-brand-red outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Celular / Teléfono *</label>
                      <input
                        type="text" required
                        placeholder="899-123-4567"
                        value={posClientInfo.phone}
                        onChange={(e) => setPosClientInfo({ ...posClientInfo, phone: e.target.value })}
                        className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-xs text-white focus:border-brand-red outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase">Correo (Para Envío De Comprobante / Certificado)</label>
                    <input
                      type="email"
                      placeholder="correo@cliente.com"
                      value={posClientInfo.email}
                      onChange={(e) => setPosClientInfo({ ...posClientInfo, email: e.target.value })}
                      className="w-full bg-black border border-zinc-900 rounded-lg py-1.5 px-3 text-[11px] text-white focus:border-brand-red outline-none"
                    />
                  </div>



                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Descuento aplicado</label>
                      <select
                        value={posClientInfo.discount}
                        onChange={(e) => setPosClientInfo({ ...posClientInfo, discount: parseInt(e.target.value) || 0 })}
                        className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-2 text-xs font-bold text-white uppercase outline-none"
                      >
                        <option value={0}>Sin Descuento (0%)</option>
                        <option value={5}>Descuento Comercial (5%)</option>
                        <option value={10}>Descuento Mayorista (10%)</option>
                        <option value={15}>Cortesía Sucursal (15%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-zinc-400 uppercase">Anotaciones Especiales</label>
                      <input
                        type="text"
                        placeholder="Montaje incluido"
                        value={posClientInfo.notes}
                        onChange={(e) => setPosClientInfo({ ...posClientInfo, notes: e.target.value })}
                        className="w-full bg-black border border-zinc-900 rounded-lg py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* MODALIDAD DE PAGO EN EL POS */}
                <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-900 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                    <span className="text-[10px] font-black text-[#ffb700] uppercase tracking-wider">Método de Financiamiento / Pago</span>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">Elige uno</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'Efectivo', label: 'Efectivo', desc: 'Pago cash' },
                      { id: 'Tarjeta', label: 'Tarjeta', desc: 'T/D o T/C' },
                      { id: 'Apartado', label: 'Apartado', desc: 'Con abono' },
                      { id: 'Crédito', label: 'Crédito', desc: 'MSI 3,6,9' }
                    ].map(pay => (
                      <button
                        key={pay.id}
                        type="button"
                        onClick={() => setPaymentType(pay.id as PaymentType)}
                        className={`py-2 px-1 rounded-lg text-center transition-all border ${
                          paymentType === pay.id 
                            ? 'bg-brand-red/10 border-brand-red text-white font-bold' 
                            : 'bg-black/40 border-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase leading-tight">{pay.label}</p>
                        <span className="text-[7.5px] text-zinc-500 font-semibold uppercase font-mono">{pay.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* If layaway selected */}
                  {paymentType === 'Apartado' && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-2.5 bg-brand-red/5 rounded-lg border border-brand-red/10 mt-1 space-y-1.5"
                    >
                      <label className="block text-[8.5px] font-black text-brand-red uppercase">Monto de Anticipo Inicial (MXN) *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold">$</span>
                        <input
                          type="number"
                          value={layawayAdvance}
                          onChange={(e) => setLayawayAdvance(e.target.value)}
                          className="w-full bg-black border border-zinc-900 rounded-md py-1.5 pl-6 pr-3 text-xs font-mono font-bold text-white outline-none focus:border-brand-red"
                        />
                      </div>
                      <p className="text-[8px] text-zinc-500 uppercase">Resto: <span className="text-zinc-300 font-bold font-mono">${Math.max(0, posTotalNet - (parseFloat(layawayAdvance) || 0)).toLocaleString()} MXN</span></p>
                    </motion.div>
                  )}

                  {/* If credit selected */}
                  {paymentType === 'Crédito' && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-2.5 bg-blue-950/20 rounded-lg border border-blue-900/10 mt-1 space-y-2"
                    >
                      <label className="block text-[8.5px] font-black text-[#ffb700] uppercase">Plan de Pagos: Meses Sin Intereses *</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[3, 6, 9].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCreditMsiMonths(m as any)}
                            className={`py-1 rounded text-[10px] font-black transition-all ${
                              creditMsiMonths === m 
                                ? 'bg-gold bg-[#ffb700] text-black font-black' 
                                : 'bg-black text-zinc-400 hover:text-white border border-zinc-900'
                            }`}
                          >
                            {m} Meses
                          </button>
                        ))}
                      </div>
                      <div className="bg-black/60 p-2 rounded text-center border border-zinc-900">
                        <p className="text-[9px] text-[#ffb700] uppercase">Liquidará: <span className="font-mono font-black text-xs text-white">${(posTotalNet / creditMsiMonths).toFixed(2)} MXN / mes</span></p>
                        <p className="text-[7.5px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">Semáforo control mensual habilitado</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Subtotals & equivalent */}
                <div className="p-3.5 bg-black/60 rounded-xl border border-zinc-900 space-y-1.5 font-bold text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal Bruto:</span>
                    <span className="text-white">${posSubtotal.toLocaleString()} MXN</span>
                  </div>
                  {posClientInfo.discount > 0 && (
                    <div className="flex justify-between text-brand-red font-bold">
                      <span>Descuento aplicado ({posClientInfo.discount}%):</span>
                      <span>-${posDiscountAmount.toLocaleString()} MXN</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span>IVA Trasladado (16% sobre subtotal):</span>
                    <span className="text-white font-mono">${posTax.toLocaleString()} MXN</span>
                  </div>
                  <div className="border-t border-zinc-900 pt-2 flex justify-between items-center text-sm font-black text-white uppercase tracking-wider">
                    <span className="text-[#ffb700]">Total Neto a Cobrar:</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[#ffb700] font-mono text-base">${posTotalNet.toLocaleString()} MXN</span>
                      <span className="text-zinc-500 font-mono text-[9px] font-black uppercase tracking-widest mt-0.5">Equiv. ${(posTotalNet / exchangeRate).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-3.5 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 border border-brand-red"
                >
                  Confirmar Cobro & Generar Nota de Venta
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB B: MOSTRADOR COBROS & SEMÁFOROS */}
      {activeTabLabel === 'history' && (
        <div className="bg-card-bg p-6 rounded-2xl border border-zinc-900 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase">Registro de Notas de Venta</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Organizado con semáforo inteligente de estados y abonos en vivo</p>
            </div>

            {/* Quick Filter buttons */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'Efectivo', label: 'Efectivo 💵' },
                { id: 'Tarjeta', label: 'Tarjetas 💳' },
                { id: 'Apartado', label: 'Apartados 📦' },
                { id: 'Crédito', label: 'Créditos MSI ⏱️' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setHistoryTypeFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[9px] uppercase font-black transition-all ${
                    historyTypeFilter === filter.id 
                      ? 'bg-[#ffb700] text-black font-black' 
                      : 'bg-black text-zinc-400 hover:text-white border border-zinc-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, folio o número..."
              className="w-full bg-black border border-zinc-805 rounded-xl py-2 px-10 text-xs font-bold text-white uppercase outline-none focus:border-[#ffb700]"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
            />
          </div>

          {/* Large Table with Semaforos */}
          <div className="overflow-x-auto rounded-xl border border-zinc-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-950 text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-900">
                  <th className="px-5 py-4">Folio / Fecha</th>
                  <th className="px-5 py-4">Cliente / Contacto</th>
                  <th className="px-5 py-4">Llantas Adquiridas</th>
                  <th className="px-5 py-4">Total Nota</th>
                  <th className="px-5 py-4">Financiamiento</th>
                  <th className="px-5 py-4 text-center">Semáforo de Proceso</th>
                  <th className="px-5 py-4 text-right">Acciones de Cobro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-semibold">
                {filteredHistoryNotes.map((note) => {
                  const restToPay = note.total - note.amountPaidSoFar;
                  return (
                    <tr key={note.id} className="hover:bg-zinc-950/40 transition-colors">
                      
                      {/* Folio */}
                      <td className="px-5 py-4 font-mono">
                        <p className="font-black text-white">{note.id}</p>
                        <p className="text-[9px] text-zinc-500">{note.date}</p>
                        <span className="text-[8px] uppercase px-1 py-0.2 bg-zinc-900 rounded text-zinc-400 font-black tracking-widest">{BRANCHES.find(b => b.id === note.branchId)?.name || 'Frontera'}</span>
                      </td>

                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <p className="font-black text-white uppercase">{note.clientName}</p>
                        <p className="text-[9px] text-zinc-400 font-mono mt-0.5">{note.clientPhone} • {note.clientEmail}</p>
                      </td>

                      {/* Llantas */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {note.items.map((it, idx) => (
                            <p key={idx} className="text-white text-[11px]">
                              {it.quantity}x {it.brand} <span className="text-zinc-400 font-normal">{it.model}</span>
                            </p>
                          ))}
                        </div>
                        <p className="text-[8px] text-[#ffb700] font-mono mt-1 font-semibold">DOT REGISTRO: {note.dotCode}</p>
                      </td>

                      {/* Total Nota */}
                      <td className="px-5 py-4">
                        <p className="font-black text-white font-mono">${note.total.toLocaleString()} MXN</p>
                        <p className="text-[9px] text-zinc-500 font-mono">Eq: ${(note.total / exchangeRate).toFixed(1)} USD</p>
                      </td>

                      {/* Financiamiento info */}
                      <td className="px-5 py-4 uppercase">
                        <span className="px-2 py-0.5 bg-zinc-900 rounded text-zinc-300 text-[9px] font-black border border-zinc-800">
                          {note.paymentType}
                        </span>
                        {note.paymentType === 'Crédito' && (
                          <p className="text-[8.5px] text-zinc-400 font-black mt-1">{note.creditMonths} Meses sin intereses</p>
                        )}
                        {note.paymentType === 'Apartado' && (
                          <p className="text-[8.5px] text-amber-500 font-black mt-1">Anticipado: ${note.amountPaidSoFar.toLocaleString()}</p>
                        )}
                      </td>

                      {/* SEMÁFORO INTERACTIVO DE PROCESO */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center space-y-1 text-center justify-center">
                          
                          {/* S1: Efectivo o Tarjeta Liquidado (Green) */}
                          {note.status === 'Pagado' && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block shadow-lg shadow-emerald-500/40"></span>
                              <span className="text-[9px] font-black uppercase tracking-widest">Ya se pagó</span>
                            </div>
                          )}

                          {/* S2: Apartados (Orange pulsing LED) */}
                          {note.status === 'Apartado' && (
                            <div className="space-y-1 w-full text-center">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse inline-block shadow-lg shadow-amber-500/40"></span>
                                <span className="text-[8.5px] font-black uppercase tracking-widest leading-none">Apartado</span>
                              </div>
                              <p className="text-[9.5px] text-zinc-400 font-black tracking-wide">Falta: <span className="text-brand-red font-mono">${restToPay.toLocaleString()} MXN</span></p>
                            </div>
                          )}

                          {/* S3: Créditos MSI process status */}
                          {note.status === 'Crédito Activo' && note.paymentType === 'Crédito' && note.creditMonths && (
                            <div className="space-y-1.5 w-full">
                              
                              {/* Red LED if zero paid, Amber if middle, Green if complete */}
                              {(note.creditInstallmentsPaid || 0) === 0 ? (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-400 border border-red-505/20 rounded-full justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-505 bg-red-500 animate-pulse inline-block shadow-lg shadow-red-500/40"></span>
                                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">Pendiente de cobro</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-505/20 rounded-full justify-center">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse inline-block shadow-lg shadow-blue-500/40"></span>
                                  <span className="text-[8px] font-black uppercase tracking-widest leading-none">Pago al corriente</span>
                                </div>
                              )}

                              {/* Progress Dots of Meses Sin Intereses */}
                              <div className="flex justify-center gap-1">
                                {Array.from({ length: note.creditMonths }).map((_, i) => {
                                  const isPaid = i < (note.creditInstallmentsPaid || 0);
                                  return (
                                    <span 
                                      key={i} 
                                      className={`w-3.5 h-1.5 rounded-full transition-all ${
                                        isPaid ? 'bg-emerald-500' : 'bg-zinc-800'
                                      }`}
                                      title={`Mensualidad ${i+1}`}
                                    />
                                  );
                                })}
                              </div>
                              <p className="text-[8px] text-zinc-400 uppercase font-bold text-center leading-none">Proceso: {note.creditInstallmentsPaid} de {note.creditMonths} MSI pagados</p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ACCIONES DE COBRO DINÁMICOS */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* If Layaway, display quick Add installment input */}
                          {note.status === 'Apartado' && (
                            <div className="flex bg-black p-1 rounded-lg border border-zinc-800 text-xs items-center gap-1">
                              <span className="text-[8px] font-bold text-zinc-500">ABONAR:</span>
                              <button
                                onClick={() => handleAddApartadoPayment(note.id, restToPay)}
                                className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[8px] uppercase tracking-wider rounded"
                              >
                                Liquidar ($ {restToPay.toFixed(0)})
                              </button>
                              <button
                                onClick={() => {
                                  const custom = prompt('Ingrese cantidad para abonar (Abono Parcial a Layaway):', '3000');
                                  if (custom) handleAddApartadoPayment(note.id, parseFloat(custom));
                                }}
                                className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-bold text-[8px] uppercase rounded"
                              >
                                Abono Parcial
                              </button>
                            </div>
                          )}

                          {/* If Credit Active, display registrar pago de mensualidad */}
                          {note.status === 'Crédito Activo' && note.paymentType === 'Crédito' && note.creditMonths && (
                            <button
                              onClick={() => handlePayInstallment(note.id)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg border border-blue-500 transition-all flex items-center gap-1 justify-center leading-none"
                            >
                              <PlusCircle className="w-3 h-3" /> Mensualidad (+ ${(note.total / note.creditMonths).toFixed(0)})
                            </button>
                          )}

                          {/* Selected print tool */}
                          <button
                            onClick={() => setActiveNoteForDocument(note)}
                            className="bg-zinc-905 hover:bg-zinc-900 text-[#ffb700] hover:text-white p-2 rounded-lg border border-zinc-800 hover:border-[#ffb700]/30 transition-colors flex items-center gap-1.5 text-[9px] uppercase font-black"
                            title="Seleccionar y Ver PDF Carta"
                          >
                            <FileText className="w-3.5 h-3.5" /> Ver PDF / Carta
                          </button>
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

      {/* TAB C: SEGUIMIENTO DE CLIENTES */}
      {activeTabLabel === 'followup' && (
        <div className="bg-card-bg p-6 rounded-2xl border border-zinc-900 space-y-6">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Bitácora de Seguimiento a Clientes</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Control post-venta de clientes con apartados o créditos de neumáticos en la frontera</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar clientes en seguimiento..."
              className="w-full bg-black border border-zinc-805 rounded-xl py-2 px-10 text-xs font-bold text-white uppercase outline-none focus:border-[#ffb700]"
              value={followSearch}
              onChange={(e) => setFollowSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left list of follow ups */}
            <div className="lg:col-span-5 space-y-3">
              {followUps.filter(f => f.clientName.toLowerCase().includes(followSearch.toLowerCase())).map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedFollowId(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedFollowId === item.id 
                      ? 'bg-zinc-900 border-emerald-500' 
                      : 'bg-black border-zinc-900 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-white uppercase text-xs">{item.clientName}</h4>
                      <p className="font-mono text-[9px] text-[#ffb700] mt-0.5">{item.phone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                      item.status === 'Completado' ? 'bg-emerald-505/15 bg-emerald-500/10 text-emerald-400' :
                      item.status === 'Llamar mañana' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-400 animate-pulse'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-bold line-clamp-1">{item.lastProductBought}</p>

                  <div className="flex justify-between text-[8px] text-zinc-500 font-mono pt-1 uppercase">
                    <span>Llamada: {item.lastContactDate}</span>
                    <span>Siguiente: <span className="text-emerald-400">{item.nextContactDate}</span></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right log panel history */}
            <div className="lg:col-span-7 bg-black p-6 rounded-xl border border-zinc-900 space-y-4">
              {(() => {
                const activeFollow = followUps.find(f => f.id === selectedFollowId) || followUps[0];
                if (!activeFollow) {
                  return (
                    <div className="py-24 text-center text-zinc-600">
                      <PhoneCall className="w-8 h-8 text-zinc-500 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs uppercase font-black tracking-wider">No hay contactos registrados aún</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] bg-emerald-500 text-black font-black px-1 rounded">BITÁCORA</span>
                          <h4 className="text-sm font-black text-white uppercase">{activeFollow.clientName}</h4>
                        </div>
                        <p className="text-xs font-mono text-zinc-500">{activeFollow.phone}</p>
                      </div>

                      {/* Status selector */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Estado de Contacto</span>
                        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 gap-1">
                          {(['Sin Contactar', 'Llamado', 'Llamar mañana', 'Completado'] as const).map(st => (
                            <button
                              key={st}
                              onClick={() => handleToggleFollowStatus(activeFollow.id, st)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                activeFollow.status === st 
                                  ? 'bg-emerald-600 text-white font-black' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-500 font-black uppercase">Último Neumático vendido / apartado</span>
                      <p className="text-xs text-white uppercase font-bold py-1 px-2.5 bg-zinc-950 border border-zinc-900 rounded-lg">{activeFollow.lastProductBought}</p>
                    </div>

                    {/* Quick Logger input */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[9px] font-black text-[#ffb700] uppercase">Registrar Nueva Llamada / Compromiso de Cobro</label>
                      <div className="flex gap-2">
                        <textarea
                          placeholder="Escriba comentario (ej. Comenta que viene mañana a abonar $4,000 en sucursal)..."
                          value={newLogNote}
                          onChange={(e) => setNewLogNote(e.target.value)}
                          rows={2}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => handleAddFollowLog(activeFollow.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 flex items-center justify-center transition-all cursor-pointer border border-emerald-500 hover:scale-95 text-[10px] font-black uppercase"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>

                    {/* Historical Logs List */}
                    <div className="space-y-2 border-t border-zinc-950 pt-3">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Historial de Comunicación en vivo</span>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {activeFollow.notes.map((n, index) => (
                          <div key={index} className="p-3 bg-zinc-950 rounded-lg border border-zinc-900/40 text-[11px] space-y-1">
                            <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase font-black">
                              <span>AGENTE VENTAS</span>
                              <span>{n.date}</span>
                            </div>
                            <p className="text-zinc-200 mt-0.5">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* TAB D: ORIGINAL QUOTES LAYOUT */}
      {activeTabLabel === 'quotes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Quote Builder */}
          <div className="lg:col-span-7 bg-card-bg p-6 rounded-2xl border border-zinc-905 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Constructor de Cotización</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">Determine precios y presupuestos temporales de llantas</p>
              </div>
              {activeQuote.length > 0 && (
                <button 
                  onClick={() => setActiveQuote([])}
                  className="text-[9px] text-brand-red font-black uppercase tracking-widest px-2.5 py-1 bg-brand-red/15 rounded-lg hover:bg-brand-red/20 transition-all"
                >
                  Limpiar borrador
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar llanta para cotización..."
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-white uppercase"
                value={posSearchTerm}
                onChange={(e) => setPosSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {filteredQuotesTires.map(tire => (
                <div key={tire.id} className="p-3 bg-[#0a0a0a] hover:bg-zinc-950 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-black text-white uppercase">{tire.brand} — {tire.model}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5 font-mono">{`${tire.width}/${tire.profile} R${tire.rim}`}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-[#ffb700] text-sm">${tire.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleAddItemToQuote(tire.id)}
                      className="p-1 px-3 bg-brand-red hover:bg-brand-red/90 text-white font-black uppercase tracking-wider text-[9px] rounded-lg transition-all"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* List items dynamic */}
            {activeQuote.length > 0 ? (
              <div className="border-t border-zinc-900 pt-4 space-y-3">
                {activeQuote.map(item => (
                  <div key={item.productId} className="p-3 bg-[#0a0a0a] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <p className="font-black text-white uppercase">{item.brand} {item.model}</p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">${item.price.toLocaleString()} MXN u.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleUpdateQuoteQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 bg-zinc-900 hover:bg-zinc-805 rounded flex items-center justify-center font-bold text-white"
                        >
                          -
                        </button>
                        <span className="font-black px-2 text-white">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuoteQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 bg-zinc-900 hover:bg-zinc-805 rounded flex items-center justify-center font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-black text-white font-mono w-20 text-right">${item.total.toLocaleString()}</span>
                      <button 
                        onClick={() => handleRemoveItemFromQuote(item.productId)}
                        className="text-brand-red font-bold text-[10px] px-1 hover:underline ml-2"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}

                {/* Form parameters */}
                <form onSubmit={handleSaveQuote} className="border-t border-dashed border-zinc-900 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nombre Cliente *</label>
                      <input
                        type="text" required
                        placeholder="Ej. Luis Octavio Garza"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs text-white uppercase font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Contacto</label>
                      <input
                        type="text"
                        placeholder="899-234-5678"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Descuento Especial (%)</label>
                      <select
                        value={clientInfo.discount}
                        onChange={(e) => setClientInfo({...clientInfo, discount: parseInt(e.target.value) || 0})}
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3 text-xs text-white font-bold uppercase"
                      >
                        <option value={0}>Sin Descuento (0%)</option>
                        <option value={5}>Comercial (5%)</option>
                        <option value={10}>Volúmen (10%)</option>
                        <option value={15}>Manager (15%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vigencia</label>
                      <select
                        value={clientInfo.validityDays}
                        onChange={(e) => setClientInfo({...clientInfo, validityDays: parseInt(e.target.value) || 15})}
                        className="w-full bg-black border border-zinc-900 rounded-xl py-2.5 px-3 text-xs text-white font-bold"
                      >
                        <option value={10}>10 días hábiles</option>
                        <option value={15}>15 días naturales</option>
                        <option value={30}>30 días (Mes completo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] p-4 rounded-xl border border-zinc-900 text-xs text-zinc-400 space-y-2 mt-3 font-semibold">
                    <div className="flex justify-between">
                      <span>Subtotal Bruto:</span>
                      <span className="text-white">${qSubtotal.toLocaleString()} MXN</span>
                    </div>
                    {clientInfo.discount > 0 && (
                      <div className="flex justify-between text-brand-red font-bold">
                        <span>Descuento aplicado ({clientInfo.discount}%):</span>
                        <span>- ${qDisc.toLocaleString()} MXN</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>IVA 16%:</span>
                      <span className="text-white">${qTax.toLocaleString()} MXN</span>
                    </div>
                    <div className="border-t border-zinc-900 pt-2 flex justify-between items-center text-sm font-black text-white uppercase tracking-wider">
                      <span>Presupuesto Estimado:</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[#ffb700] font-mono text-base">${qTotal.toLocaleString()} MXN</span>
                        <span className="text-zinc-500 font-mono text-[9px] font-black tracking-widest uppercase mt-0.5">Equiv. ${(qTotal / exchangeRate).toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-3 text-sm font-black uppercase tracking-widest transition-all"
                  >
                    Guardar Membrete de Cotización
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-650 bg-black/40 border border-dashed border-zinc-900 rounded-xl">
                <p className="text-xs uppercase font-black text-zinc-500">Borrador de Cotización Vacío</p>
              </div>
            )}
          </div>

          {/* History of Quotes */}
          <div className="lg:col-span-5 space-y-4 bg-card-bg p-6 rounded-2xl border border-zinc-900">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-red" />
              Histórico de Cotizaciones Guardadas
            </h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {quotesList.map(q => (
                <div 
                  key={q.id}
                  onClick={() => {
                    const mapped: SaleNote = {
                      id: q.id,
                      clientName: q.clientName,
                      clientPhone: q.clientPhone,
                      clientEmail: 'cotizado@mostrador.com',
                      date: q.date,
                      items: q.items.map(i => ({...i, brand: i.brand, model: i.model})),
                      subtotal: q.subtotal,
                      discount: q.discount,
                      tax: q.tax,
                      total: q.total,
                      paymentType: 'Efectivo',
                      amountPaidSoFar: q.total,
                      status: 'Pagado',
                      dotCode: 'MOCK QUOTE',
                      branchId: q.branchId
                    };
                    setActiveNoteForDocument(mapped); // Opens it in letter layout too
                  }}
                  className="p-3 bg-[#0a0a0a] hover:bg-zinc-950 border border-zinc-900 rounded-lg flex justify-between items-start cursor-pointer"
                >
                  <div>
                    <span className="text-[9px] font-mono font-black text-brand-red uppercase">{q.id}</span>
                    <h4 className="text-xs font-black text-white uppercase">{q.clientName}</h4>
                    <p className="text-[8.5px] text-zinc-550">{q.date} • {q.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-[#ffb700] text-xs">${q.total.toLocaleString()}</span>
                    <p className="text-[7.5px] text-zinc-400 font-bold uppercase mt-1">Ver Carta</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MONUMENTAL US-LETTER SIZE PREVIEW MODAL (TAMAÑO CARTA PRINTABLE) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeNoteForDocument && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-md overflow-y-auto no-print">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border-2 border-[#ffb700] rounded-3xl max-w-4xl w-full p-4 md:p-6 space-y-4 max-h-[96vh] overflow-y-auto"
            >
              
              {/* Header Action Row */}
              <div className="flex justify-between items-center bg-black/60 p-3 rounded-2xl border border-zinc-903 no-print">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Carta Digital Membretada Multillantas</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="flex items-center gap-1.5 bg-[#ffb700] text-black text-[9px] font-black px-4 py-2 uppercase rounded-xl hover:bg-amber-500 transition-all cursor-pointer box-border"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir Documento (Físico / PDF)
                  </button>
                  <button 
                    onClick={() => {
                      // Trigger direct mock file download with beautiful formatted string details
                      const content = `=============================\nMULTILLANTAS DE LA FRONTERA\n=============================\nFOLIO: ${activeNoteForDocument.id}\nCLIENTE: ${activeNoteForDocument.clientName}\nFONO: ${activeNoteForDocument.clientPhone}\nFECHA: ${activeNoteForDocument.date}\nCANTIDAD COMPESADA: ${activeNoteForDocument.total} MXN (Equiv: ${(activeNoteForDocument.total / exchangeRate).toFixed(2)} USD)\nREGISTRO DOT EXIGIDO NOM-086: ${activeNoteForDocument.dotCode}\n=============================\n`;
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `NotaVenta-${activeNoteForDocument.id}.txt`;
                      a.click();
                      alert('Nota de venta descargada en formato homologado tamaño carta para facturación integrada.');
                    }}
                    className="flex items-center gap-1.5 bg-black text-white border border-zinc-8 c text-[9px] font-black px-3 py-2 uppercase rounded-xl hover:bg-zinc-900 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar Archivo Carta
                  </button>
                  <button 
                    onClick={() => setActiveNoteForDocument(null)}
                    className="text-zinc-400 hover:text-white text-[9px] font-black hover:underline uppercase p-2"
                  >
                    Cerrar Vista
                  </button>
                </div>
              </div>

              {/* SHEET OF PAPER LAYOUT FOR LETTER SIZE 8.5" x 11" ASPECT PREVIEW */}
              <div 
                id="print-letter-container"
                className="bg-white text-black p-8 md:p-12 rounded-lg border border-gray-300 mx-auto w-full max-w-2xl shadow-xl space-y-6 aspect-[1/1.414]"
                style={{ color: '#000000', fontFamily: 'system-ui, sans-serif' }}
              >
                
                {/* Visual Header of the Sheet */}
                <div className="flex justify-between items-start border-b pb-4 border-zinc-400">
                  <div className="space-y-1">
                    <img 
                      src="https://appdesign.appdesignproyectos.com/multillantas.png" 
                      alt="Multillantas Logos" 
                      className="h-10 w-auto object-contain" 
                      referrerPolicy="no-referrer"
                    />
                    <h1 className="text-xs font-black text-gray-900 tracking-wider">MULTILLANTAS DE LA FRONTERA</h1>
                    <p className="text-[7.5px] font-bold text-gray-400 leading-none uppercase">LÍDER NACIONAL EN NEUMÁTICOS Y COMPUESTOS DE ALTA GAMA</p>
                    <p className="text-[7px] text-gray-550 font-medium">Blvd. Frontera Col. Centro • H. Matamoros/Nuevo Laredo, Tamaulipas • RFC: MFR982142GY</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="bg-black text-white px-3 py-1 text-center rounded-lg inline-block">
                      <p className="text-[7px] text-zinc-450 uppercase font-black leading-none">NOTA / TICKET</p>
                      <p className="text-[11px] font-mono font-black">{activeNoteForDocument.id}</p>
                    </div>
                    <p className="text-[7.5px] text-gray-500 font-mono">FECHA EMISIÓN: {activeNoteForDocument.date}</p>
                    <p className="text-[7.5px] text-[#ffb700] hover:text-brand-red uppercase font-black tracking-widest">{BRANCHES.find(b => b.id === activeNoteForDocument.branchId)?.name || 'Sucursal Frontera'}</p>
                    <p className="text-[7px] text-gray-400 uppercase font-bold text-[8px]">T.C. COBRADO: ${exchangeRate.toFixed(2)}</p>
                  </div>
                </div>

                {/* Patient / Client details layout columns */}
                <div className="grid grid-cols-2 gap-4 text-[9px] pt-1">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-black text-[7.5px] text-zinc-500 uppercase tracking-wide mb-1 border-b pb-0.5">DATOS DEL CONSUMIDOR</h3>
                    <p className="text-[11px] font-black text-black uppercase">{activeNoteForDocument.clientName}</p>
                    <p className="text-gray-600 mt-1">Celular: {activeNoteForDocument.clientPhone}</p>
                    <p className="text-gray-600">Contacto: {activeNoteForDocument.clientEmail}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                    <h3 className="font-black text-[7.5px] text-zinc-500 uppercase tracking-wide mb-1 border-b pb-0.5">TÉRMINOS Y VALIDACIONES</h3>
                    <p className="font-bold text-gray-900 uppercase">TIPO PAGO: <span className="font-black text-emerald-800">{activeNoteForDocument.paymentType}</span></p>
                    {activeNoteForDocument.paymentType === 'Crédito' && (
                      <p className="text-gray-600">Plan de Pago: {activeNoteForDocument.creditMonths} Meses Sin Intereses (MSI)</p>
                    )}
                    <p className="text-gray-500 font-bold block">DOT VALIDACIÓN: <span className="font-mono text-red-650 font-black tracking-wider text-[8px] bg-red-100 px-1 py-0.2 rounded text-red-600">{activeNoteForDocument.dotCode}</span></p>
                  </div>
                </div>

                {/* Tyres table */}
                <div className="border-t border-b border-gray-200 py-3">
                  <table className="w-full text-left text-[9.5px]">
                    <thead>
                      <tr className="font-black text-gray-500 mb-2 uppercase border-b border-gray-200 pb-1.5 text-[8.5px]">
                        <th>ID CÓDIGO</th>
                        <th>DESCRIPCIÓN / MARCO DEL NEUMÁTICO</th>
                        <th className="text-center">CANT</th>
                        <th className="text-right">PRECIO UNITARIO</th>
                        <th className="text-right">TOTAL NETO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeNoteForDocument.items.map((i, index) => (
                        <tr key={index} className="font-medium text-gray-900">
                          <td className="py-2.5 font-mono text-gray-400 text-[8.5px]">{i.productId}</td>
                          <td className="py-2.5 font-black uppercase text-gray-950">
                            {i.brand} — {i.model}
                            <p className="text-[7.5px] text-gray-400 font-bold mt-0.5 leading-none">REGISTRO DE PLANTA DOT: {activeNoteForDocument.dotCode}</p>
                          </td>
                          <td className="py-2.5 text-center font-mono text-gray-700">{i.quantity} pzs</td>
                          <td className="py-2.5 text-right font-mono text-gray-700">${i.price.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-gray-950 font-bold">${i.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary breakdowns blocks on the paper sheet bottom */}
                <div className="grid grid-cols-12 gap-4 text-[9px] pt-1">
                  
                  {/* Left Notes area */}
                  <div className="col-span-7 pr-3 space-y-2">
                    <h4 className="font-black text-[7.5px] text-gray-500 uppercase tracking-widest leading-none">PÓLIZA DE CONTROL Y GARANTÍA NOM-086</h4>
                    <p className="text-[7px] text-gray-400 leading-normal uppercase">
                      Queda formalmente garantizado este compuesto por 12 meses ante deformaciones de origen. Cualquier reclamación requiere reportar el DOT {activeNoteForDocument.dotCode} indicado en este membrete oficial tamaño carta. No aplica por pinchadura, golpes contra baches, o falta de alineación y balanceo comercial de ejes.
                    </p>
                    <div className="border border-dashed border-zinc-200 p-2 text-[7.5px] text-zinc-600 rounded bg-zinc-50">
                      <span className="font-bold text-black block mb-0.5">REGISTRO DIGITAL SAT:</span>
                      Sello Digital: t46hs97fahs89fha8shf9as87fhas89fha9sd8fha9s8fha9
                    </div>
                  </div>

                  {/* Right Totals math area */}
                  <div className="col-span-5 text-right text-gray-600 space-y-1 text-[9.5px]">
                    <div className="flex justify-between">
                      <span>Subtotal de Compra:</span>
                      <span className="font-mono text-gray-900 font-semibold">${activeNoteForDocument.subtotal.toLocaleString()} MXN</span>
                    </div>
                    {activeNoteForDocument.discount > 0 && (
                      <div className="flex justify-between text-red-600 font-bold">
                        <span>Descuento ({activeNoteForDocument.discount}%):</span>
                        <span className="font-mono">-${(activeNoteForDocument.subtotal * (activeNoteForDocument.discount / 100)).toLocaleString()} MXN</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b pb-1.5">
                      <span>IVA Trasladado (16%):</span>
                      <span className="font-mono text-gray-950 font-semibold">${activeNoteForDocument.tax.toLocaleString()} MXN</span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-1 leading-none">
                      <span className="text-[10px] text-emerald-800">TOTAL NETO:</span>
                      <span className="font-mono text-emerald-700 text-sm font-black">${activeNoteForDocument.total.toLocaleString()} MXN</span>
                    </div>

                    <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100 flex justify-between items-center font-mono text-[8px] text-emerald-800 mt-2">
                      <span className="font-black">EQUIVALENCIA USD:</span>
                      <span className="font-black font-semibold">${(activeNoteForDocument.total / exchangeRate).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Signatures placeholders */}
                <div className="border-t border-dashed border-gray-200 pt-6 mt-1 flex justify-between items-center text-[7.5px] text-gray-400 text-center uppercase font-bold">
                  <div className="w-2/5">
                    <p className="border-b border-gray-300 pb-1 mb-1 font-mono text-black">{activeNoteForDocument.clientName}</p>
                    <p>Firma de Conformidad Cliente</p>
                  </div>
                  <div className="w-1/5 leading-none font-bold text-gray-700">
                    <p>MULTILLANTAS</p>
                    <p className="text-[#ffb700] mt-1 font-black">VALIDADO</p>
                  </div>
                  <div className="w-2/5">
                    <p className="border-b border-gray-300 pb-1 mb-1 font-mono text-gray-800">Agente de Cuentas POS</p>
                    <p>Sello de Caja y Despachador</p>
                  </div>
                </div>

              </div>

              {/* Close Button at visual bot */}
              <div className="flex justify-end pt-2 no-print border-t border-zinc-902">
                <button
                  onClick={() => setActiveNoteForDocument(null)}
                  className="px-6 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
