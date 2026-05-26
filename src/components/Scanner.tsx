import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShoppingCart, 
  Truck, 
  Settings, 
  Zap, 
  Sparkles, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Plus, 
  Minus, 
  Info, 
  X,
  Layers,
  Search,
  CheckCircle,
  TrendingUp,
  Sliders,
  Play
} from 'lucide-react';
import { TIRES, BRANCHES, updateTiresStorage, Tire, UserRole, logTireMovement } from '../data/mockData';

// Generate simulated scan beep on PWA clients
function playBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime); // High pitch crisp beep
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Audio feedback failed or blocked by autoplay policy:', e);
  }
}

// Mobile Vibration feedback
function triggerVibration() {
  if (navigator.vibrate) {
    try {
      navigator.vibrate([100, 50, 100]); // double tactical pulses
    } catch (e) {
      console.warn('Vibration not supported or barred in sandbox:', e);
    }
  }
}

export default function Scanner({ userRole, branchId }: { userRole: UserRole | null; branchId: string | null }) {
  const activeBranch = !branchId || branchId === 'all' ? 'matriz' : branchId;
  const currentBranchName = BRANCHES.find(b => b.id === activeBranch)?.name || 'Helios';

  // State Variables
  const [tiresList, setTiresList] = useState<Tire[]>(() => [...TIRES]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [scannedTire, setScannedTire] = useState<Tire | null>(null);
  const [scanMode, setScanMode] = useState<'standard' | 'pos_direct'>(() => {
    return (localStorage.getItem('erp_scan_mode') as 'standard' | 'pos_direct') || 'standard';
  });
  
  // Audio Feedback Setting
  const [audioMuted, setAudioMuted] = useState(false);
  // Manual text lookup input fallback
  const [manualCode, setManualCode] = useState('');
  
  // Custom temporary success notification list
  const [successLogs, setSuccessLogs] = useState<{ id: string; message: string; brand: string; model: string }[]>([]);

  // Selected Action variables for Standard action modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'vender' | 'mover' | 'ajustar' | null>(null);

  // Form States
  // 1. Move
  const [moveQty, setMoveQty] = useState(1);
  const [moveDestBranchId, setMoveDestBranchId] = useState('norte');
  // 2. Adjust
  const [adjustQty, setAdjustQty] = useState(15);
  // 3. Quick Sale
  const [saleQty, setSaleQty] = useState(1);
  const [salePaymentMethod, setSalePaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [saleClientName, setSaleClientName] = useState('Público General');

  // Video feed element ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync tires with global list updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setTiresList([...e.detail]);
      }
    };
    window.addEventListener('erp-tires-updated', handleUpdate);
    return () => window.removeEventListener('erp-tires-updated', handleUpdate);
  }, []);

  // Persist Scan Mode
  useEffect(() => {
    localStorage.setItem('erp_scan_mode', scanMode);
  }, [scanMode]);

  // Manage Web Cam stream lifecycle
  useEffect(() => {
    if (cameraActive) {
      setCameraPermissionError(null);
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.error('Video play error:', err));
        }
      })
      .catch(err => {
        console.error('Camera capture error:', err);
        setCameraPermissionError('Permiso de cámara denegado o dispositivo ausente. Utiliza el Simulador móvil de escaneo de alta fidelidad abajo para interactuar con todas las funcionalidades.');
        setCameraActive(false);
      });
    } else {
      stopCameraStream();
    }

    return () => stopCameraStream();
  }, [cameraActive]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Process item detection
  const handleItemScanned = (tire: Tire) => {
    // Audio synthesis beep
    if (!audioMuted) {
      playBeepSound();
    }
    // Haptic phone pulse
    triggerVibration();

    if (scanMode === 'pos_direct') {
      // Integration POS route: automatically trigger 'erp-add-to-cart'
      window.dispatchEvent(new CustomEvent('erp-add-to-cart', {
        detail: { productId: tire.id, quantity: 1 }
      }));

      // Flash feedback
      const logId = Math.random().toString();
      const newLog = { 
        id: logId, 
        message: `+1 pza agregada directamente al Punto de Venta`, 
        brand: tire.brand, 
        model: tire.model 
      };
      setSuccessLogs(prev => [newLog, ...prev]);
      
      // Auto dismiss log banner after 3.5s
      setTimeout(() => {
        setSuccessLogs(prev => prev.filter(log => log.id !== logId));
      }, 3500);

    } else {
      // Standard menu popup of 3 options: Vender Ahora, Mover de Sucursal, Ajustar Stock
      setScannedTire(tire);
      // Setup initial form counters
      const currentStockInSource = tire.stock?.[activeBranch] || 0;
      setAdjustQty(currentStockInSource);
      setMoveQty(1);
      setShowActionModal(true);
      setActionType(null); // Reset layout stage inside modal
    }
  };

  // Lookup manually entered or simulates scan input
  const triggerManualLookup = () => {
    if (!manualCode.trim()) return;
    const match = tiresList.find(t => t.barcode === manualCode.trim() || t.id === manualCode.trim());
    if (match) {
      setManualCode('');
      handleItemScanned(match);
    } else {
      alert(`Código "${manualCode}" no registrado en el catálogo de Multillantas de la Frontera.`);
    }
  };

  // Submit Actions Handler
  const confirmQuickSale = () => {
    if (!scannedTire) return;

    // Check availability
    const sourceStock = scannedTire.stock?.[activeBranch] || 0;
    if (saleQty > sourceStock) {
      alert(`Error de disponibilidad: Solo restan ${sourceStock} piezas de este modelo en Sucursal ${currentBranchName}.`);
      return;
    }

    // Decrement stock in internal store
    const updatedTires = tiresList.map(t => {
      if (t.id === scannedTire.id) {
        const stocks = { ...t.stock };
        stocks[activeBranch] = Math.max(0, sourceStock - saleQty);
        return { ...t, stock: stocks };
      }
      return t;
    });

    updateTiresStorage(updatedTires);

    // Save formal movement record under local sales notes ERP database
    const salesLog = JSON.parse(localStorage.getItem('erp_sales_notes') || '[]');
    const nextInvoiceId = `FAC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSaleRecord = {
      id: nextInvoiceId,
      branchId: activeBranch,
      clientName: saleClientName,
      phone: '899-000-0000',
      carModel: 'Escaneado Móvil PWA',
      items: [
        {
          productId: scannedTire.id,
          brand: scannedTire.brand,
          model: scannedTire.model,
          width: scannedTire.width,
          profile: scannedTire.profile,
          rim: scannedTire.rim,
          quantity: saleQty,
          price: scannedTire.price,
          total: saleQty * scannedTire.price
        }
      ],
      subtotal: saleQty * scannedTire.price,
      tax: saleQty * scannedTire.price * 0.16,
      total: saleQty * scannedTire.price * 1.16,
      paymentMethod: salePaymentMethod,
      date: new Date().toISOString().split('T')[0],
      isFacturado: true,
      condition: 'Lista para Entrega',
      seller: 'Vendedor Móvil QR'
    };

    localStorage.setItem('erp_sales_notes', JSON.stringify([newSaleRecord, ...salesLog]));

    // Log the movement in our operational audit trail
    logTireMovement({
      userName: localStorage.getItem('erp_user_name') || 'Vendedor Móvil QR',
      userRole: localStorage.getItem('erp_user_role') || 'vendedor',
      productId: scannedTire.id,
      productDetails: `${scannedTire.brand} ${scannedTire.model}`,
      type: 'venta',
      sourceBranchId: activeBranch,
      sourceBranchName: currentBranchName,
      destBranchId: 'cliente',
      destBranchName: 'Cliente Final',
      qty: saleQty,
      reason: `Venta QR rápida desde escáner móvil`
    });

    // Log feedback and close
    alert(`Nota ${nextInvoiceId} expedida con éxito. Stock de ${scannedTire.brand} en ${currentBranchName} actualizado.`);
    setShowActionModal(false);
    setScannedTire(null);
  };

  const confirmBranchMove = () => {
    if (!scannedTire) return;

    const sourceStock = scannedTire.stock?.[activeBranch] || 0;
    if (moveQty > sourceStock) {
      alert(`Disponibilidad insuficiente: Solo posees ${sourceStock} unidades para transferir.`);
      return;
    }

    if (activeBranch === moveDestBranchId) {
      alert('La sucursal origen y destino no pueden coincidir.');
      return;
    }

    // Process dual update
    const destName = BRANCHES.find(b => b.id === moveDestBranchId)?.name || moveDestBranchId;
    const updatedTires = tiresList.map(t => {
      if (t.id === scannedTire.id) {
        const stocks = { ...t.stock };
        stocks[activeBranch] = Math.max(0, sourceStock - moveQty);
        stocks[moveDestBranchId] = (stocks[moveDestBranchId] || 0) + moveQty;
        return { ...t, stock: stocks, lastMovement: new Date().toISOString().split('T')[0] };
      }
      return t;
    });

    updateTiresStorage(updatedTires);

    // Log the transfer inside our operational audit trail
    logTireMovement({
      userName: localStorage.getItem('erp_user_name') || 'Vendedor Móvil QR',
      userRole: localStorage.getItem('erp_user_role') || 'vendedor',
      productId: scannedTire.id,
      productDetails: `${scannedTire.brand} ${scannedTire.model}`,
      type: 'traspaso',
      sourceBranchId: activeBranch,
      sourceBranchName: currentBranchName,
      destBranchId: moveDestBranchId,
      destBranchName: destName,
      qty: moveQty,
      reason: `Traspaso rápido de sucursal vía scanner`
    });

    // Register simple transfer order log
    alert(`Traspaso completado: ${moveQty} llantas ${scannedTire.brand} enviadas de ${currentBranchName} a ${destName}.`);
    setShowActionModal(false);
    setScannedTire(null);
  };

  const confirmStockAdjustment = () => {
    if (!scannedTire) return;

    // Mutate exact amount
    const updatedTires = tiresList.map(t => {
      if (t.id === scannedTire.id) {
        const stocks = { ...t.stock };
        stocks[activeBranch] = adjustQty;
        return { ...t, stock: stocks, lastMovement: new Date().toISOString().split('T')[0] };
      }
      return t;
    });

    const oldStock = scannedTire.stock?.[activeBranch] || 0;
    const diff = adjustQty - oldStock;

    updateTiresStorage(updatedTires);

    // Log adjustment in operational audit trail
    logTireMovement({
      userName: localStorage.getItem('erp_user_name') || 'Vendedor Móvil QR',
      userRole: localStorage.getItem('erp_user_role') || 'vendedor',
      productId: scannedTire.id,
      productDetails: `${scannedTire.brand} ${scannedTire.model}`,
      type: 'ajuste',
      sourceBranchId: activeBranch,
      sourceBranchName: currentBranchName,
      destBranchId: activeBranch,
      destBranchName: currentBranchName,
      qty: Math.abs(diff),
      reason: `Ajuste rápido de inventario desde scanner móvil (Medida de desviación: ${diff >= 0 ? '+' : ''}${diff} piezas)`
    });

    alert(`Inventario auditado correctamente. Modelo ${scannedTire.brand} ahora refleja ${adjustQty} piezas en ${currentBranchName}.`);
    setShowActionModal(false);
    setScannedTire(null);
  };

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-3xl border border-zinc-900 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-red/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-brand-red text-xs font-black uppercase tracking-[0.2em] mb-1">
            <QrCode className="w-4 h-4 text-[#ffb700] animate-pulse" />
            Control PWA Móvil
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Módulo de Escaneo Inteligente
          </h2>
          <p className="text-zinc-400 text-xs mt-1 font-medium max-w-2xl leading-relaxed uppercase">
            Gestión en piso por código de barras <span className="text-[#ffb700] font-bold">UPC/EAN</span> o códigos <span className="text-[#ffb700] font-bold">QR</span>.
            Optimiza tiempos de captura, elimina la manipulación de planillas impresas y opera directo en inventarios.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wide cursor-pointer ${
              audioMuted 
                ? 'bg-zinc-900 border-zinc-850 text-zinc-500' 
                : 'bg-black border-[#ffb700]/30 text-[#ffb700] hover:border-[#ffb700]'
            }`}
            title={audioMuted ? 'Activar sonido' : 'Silenciar escáner'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {audioMuted ? 'Silenciado' : 'Beep Activo'}
          </button>
        </div>
      </div>

      {/* Main Grid: Viewfinder on Left, Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Viewfinder Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-black border-2 border-zinc-900 rounded-[2.5rem] relative overflow-hidden aspect-video shadow-2xl flex flex-col items-center justify-center p-4">
            
            {/* Camera Output Container */}
            {cameraActive ? (
              <div className="absolute inset-0 z-0">
                <video 
                  ref={videoRef} 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950 p-4 text-center z-10 select-none">
                <div className="p-5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
                  <CameraOff className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest text-[#ffb700]">Cámara en Espera</p>
                  <p className="text-[10px] text-zinc-500 max-w-sm uppercase font-bold">
                    Pulsa activar abajo para usar la cámara integrada del celular o scanner acoplado.
                  </p>
                </div>
              </div>
            )}

            {/* Glowing Retro HUD Reticle Frame Overlay */}
            <div className="absolute inset-0 border-[24px] border-black/70 pointer-events-none z-20 flex items-center justify-center">
              {/* Corner framing brackets */}
              <div className="relative w-72 h-44 border-2 border-white/10 rounded-2xl flex items-center justify-center">
                {/* Neon bracket angles */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-red"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-red"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-red"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-red"></div>

                {/* Vertical slider red laser scan anim */}
                {cameraActive && (
                  <motion.div 
                    animate={{ y: [-70, 70, -70] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="absolute left-1 right-1 h-0.5 bg-brand-red shadow-[0_0_12px_#ff0000] z-20"
                  />
                )}

                {/* Aim helper message */}
                <div className="absolute top-3 text-center w-full">
                  <span className="text-[8px] font-black uppercase tracking-widest bg-black/80 px-2 py-1.5 border border-zinc-800 rounded-md text-zinc-400">
                    Alinear Código al Centro
                  </span>
                </div>
              </div>
            </div>

            {/* Top Bar indicator */}
            <div className="absolute top-6 left-6 z-30 flex items-center gap-1.5 bg-black/80 border border-zinc-900 rounded-full py-1 px-3 text-[9px] font-black uppercase text-[#ffb700]">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${cameraActive ? 'animate-ping' : ''}`} />
              {cameraActive ? 'Transmisión de Óptica Inicializada' : 'Lente Offline'}
            </div>

            {/* Bottom active mode pill indicator */}
            <div className="absolute bottom-6 z-30">
              <span className={`text-[10px] font-black bg-black border px-4 py-2 rounded-full uppercase tracking-wider block shadow-xl transition-all ${
                scanMode === 'pos_direct' 
                  ? 'border-[#ffb700] text-[#ffb700]' 
                  : 'border-white/10 text-white'
              }`}>
                MODO: {scanMode === 'pos_direct' ? 'POS DIRECTO (CARGA RAPIDA)' : 'ACCIONES MULTIPLES'}
              </span>
            </div>

          </div>

          {/* Controller and Manual entry layout */}
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl space-y-4">
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Trigger Stream Toggle */}
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  cameraActive 
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-brand-red border border-zinc-800' 
                    : 'bg-brand-red text-white hover:opacity-90 shadow-xl shadow-brand-red/15'
                }`}
              >
                <Camera className="w-4 h-4" />
                {cameraActive ? 'Apagar Lente de Cámara' : 'Encender Lente Cámara'}
              </button>

              {/* Mode toggling selector buttons */}
              <div className="bg-black p-1.5 rounded-2xl flex border border-zinc-900">
                <button
                  onClick={() => setScanMode('standard')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    scanMode === 'standard'
                      ? 'bg-zinc-900 text-white border border-zinc-850'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Abre menú de 3 opciones al escanear"
                >
                  Estándar
                </button>
                <button
                  onClick={() => setScanMode('pos_direct')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                    scanMode === 'pos_direct'
                      ? 'bg-brand-red text-white'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Agrega directo al carrito de ventas"
                >
                  POS Carrito
                </button>
              </div>
            </div>

            {cameraPermissionError && (
              <div className="p-3.5 bg-yellow-950/20 border border-yellow-900/40 rounded-2xl text-yellow-500 text-[10px] uppercase font-bold flex gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{cameraPermissionError}</span>
              </div>
            )}

            {/* Quick manual typing search input fallback */}
            <div className="bg-black p-2 rounded-2xl border border-zinc-900 flex items-center gap-2">
              <div className="text-zinc-500 pl-2">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') triggerManualLookup();
                }}
                placeholder="INGRESAR CÓDIGO MANUAL / BARCODE DE NEUMÁTICO..."
                className="bg-transparent flex-1 text-xs font-mono font-bold text-white uppercase tracking-wider outline-none p-2 placeholder-zinc-700"
              />
              <button
                onClick={triggerManualLookup}
                disabled={!manualCode.trim()}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                PROCESAR
              </button>
            </div>

          </div>

          {/* Flash log banners for continuous scan feedbacks */}
          <AnimatePresence>
            {successLogs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#ffb700] text-black rounded-2xl p-4 flex justify-between items-center shadow-lg border border-yellow-300/20"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black text-[#ffb700] rounded-xl">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{log.message}</p>
                    <p className="text-[10px] font-bold uppercase opacity-80">{log.brand} - {log.model}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSuccessLogs(prev => prev.filter(l => l.id !== log.id))}
                  className="p-1 text-black hover:opacity-75 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>

        {/* Simulator Column */}
        <div className="lg:col-span-5 space-y-6 bg-zinc-950 p-6 rounded-[2rem] border border-zinc-900 text-white relative">
          <div className="absolute right-4 top-4">
            <span className="text-[7px] font-black uppercase tracking-[0.25em] block bg-black border border-zinc-800 text-zinc-400 py-1 px-2.5 rounded-full">
              PWA Sandbox v1.02
            </span>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Simulador de Código Móvil</h3>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-wide">
              Ya que estás depurando en el visor web de AI Studio, puedes simular de forma fiel el escaneo instantáneo al dar click en cualquiera de las siguientes llantas con códigos de barra reales registrados en tienda.
            </p>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 select-none">
            {tiresList.map(tire => {
              const stockInCurrent = tire.stock?.[activeBranch] || 0;
              return (
                <div 
                  key={tire.id}
                  className="bg-black/60 hover:bg-black p-3.5 border border-zinc-900 hover:border-brand-red rounded-2xl flex items-center justify-between gap-3 transition-all cursor-pointer group"
                  onClick={() => handleItemScanned(tire)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase leading-tight text-white group-hover:text-brand-red transition-colors">
                        {tire.brand.toUpperCase()} {tire.model}
                      </span>
                      <span className="text-[8px] font-black text-black bg-[#ffb700] px-1.5 py-0.5 rounded-md uppercase">
                        {tire.width}/{tire.profile} R{tire.rim}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase">
                      <span className="font-mono bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-white text-[9px] block">
                        GTIN-13: {tire.barcode || 'S/N'}
                      </span>
                      <span className="flex items-center gap-1">
                        Stock {currentBranchName}: 
                        <strong className={`font-mono font-black ${stockInCurrent <= 3 ? 'text-brand-red' : 'text-emerald-400'}`}>
                          {stockInCurrent} pzs
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850 text-zinc-500 group-hover:text-white group-hover:bg-brand-red group-hover:border-brand-red font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all">
                    <Play className="w-3 h-3 fill-current" />
                    Escanear
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-black/40 border border-zinc-900/80 p-4 rounded-2xl flex items-center gap-3 text-[10px] text-zinc-500 uppercase leading-relaxed font-bold">
            <Info className="w-5 h-5 text-[#ffb700] shrink-0" />
            <span>
              La simulación dispara un beeper sintético de frecuencia senoidal de 1200 hz idéntico a las terminales portátiles Honeywell de almacén.
            </span>
          </div>

        </div>

      </div>

      {/* Main Standard action modal sheet popup */}
      <AnimatePresence>
        {showActionModal && scannedTire && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] w-full max-w-xl p-6 relative overflow-hidden shadow-2xl space-y-6 text-white"
            >
              {/* Close Button */}
              <div className="absolute right-6 top-6">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setScannedTire(null);
                  }}
                  className="p-2 border border-zinc-900 hover:border-white text-zinc-500 hover:text-white rounded-full bg-black cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title group */}
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-[0.2em] text-[#ffb700] uppercase block">
                  Captura de Datos Móvil Confirmada
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {scannedTire.brand.toUpperCase()} {scannedTire.model}
                  </h3>
                  <span className="text-xs bg-brand-red text-white py-0.5 px-2 rounded-md font-black">
                    {scannedTire.width}/{scannedTire.profile} R{scannedTire.rim}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-5 text-[10px] uppercase font-bold text-zinc-500 pt-1">
                  <span>Sede actual: <strong className="text-white">{currentBranchName}</strong></span>
                  <span>Código escaneado: <strong className="text-white font-mono">{scannedTire.barcode}</strong></span>
                  <span>Disponibilidad actual: <strong className="text-emerald-400 font-mono">{scannedTire.stock?.[activeBranch] || 0} PZS</strong></span>
                </div>
              </div>

              {/* Step 1: Menu of 3 Major actions */}
              {actionType === null ? (
                <div className="space-y-4">
                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider mb-2">
                    ¿Qué acción rápida deseas aplicar para esta llanta? Selecciona una de las 3 opciones habilitadas:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Action 1: Vender Ahora */}
                    <button
                      onClick={() => {
                        setActionType('vender');
                        setSaleQty(1);
                      }}
                      className="bg-black/60 hover:bg-black hover:border-brand-red border border-zinc-900 p-5 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                    >
                      <div className="p-3 rounded-xl bg-brand-red/10 text-brand-red group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-white tracking-wider block">Vender Ahora</span>
                        <span className="text-[9px] text-zinc-500 uppercase block leading-tight mt-0.5">Venta Express Local</span>
                      </div>
                    </button>

                    {/* Action 2: Mover de sucursal */}
                    <button
                      onClick={() => {
                        setActionType('mover');
                        setMoveQty(1);
                        // Pick first different branch
                        const another = BRANCHES.find(b => b.id !== activeBranch)?.id || 'norte';
                        setMoveDestBranchId(another);
                      }}
                      className="bg-black/60 hover:bg-black hover:border-[#ffb700] border border-zinc-900 p-5 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                    >
                      <div className="p-3 rounded-xl bg-[#ffb700]/10 text-[#ffb700] group-hover:scale-110 transition-transform">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-white tracking-wider block">Traspasar Sede</span>
                        <span className="text-[9px] text-zinc-500 uppercase block leading-tight mt-0.5">Movimiento de stock</span>
                      </div>
                    </button>

                    {/* Action 3: Ajustar Stock */}
                    <button
                      onClick={() => {
                        setActionType('ajustar');
                        setAdjustQty(scannedTire.stock?.[activeBranch] || 0);
                      }}
                      className="bg-black/60 hover:bg-black hover:border-white/40 border border-zinc-900 p-5 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
                    >
                      <div className="p-3 rounded-xl bg-zinc-850 text-white group-hover:scale-110 transition-transform">
                        <Sliders className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase text-white tracking-wider block">Ajustar Stock</span>
                        <span className="text-[9px] text-zinc-500 uppercase block leading-tight mt-0.5">Fisicos en piso</span>
                      </div>
                    </button>

                  </div>

                  <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900/80 text-[10px] uppercase font-bold text-zinc-500 flex items-center justify-center">
                    Sucursal Activa para Operaciones: {currentBranchName.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="border-t border-zinc-900 pt-5 space-y-4">
                  
                  {/* Action UI: QUICK SALE */}
                  {actionType === 'vender' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-brand-red text-xs font-bold uppercase tracking-wider">
                        <ShoppingCart className="w-4 h-4" />
                        Registrar Venta Express de Bodega
                      </div>

                      <div className="space-y-3">
                        {/* Client details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Nombre del Cliente</label>
                            <input
                              type="text"
                              value={saleClientName}
                              onChange={(e) => setSaleClientName(e.target.value)}
                              placeholder="Ej. Taller Mecánico Monterrey"
                              className="w-full text-xs p-3 bg-black border border-zinc-900 rounded-xl font-bold text-white outline-none focus:border-brand-red"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Método de Pago</label>
                            <select
                              value={salePaymentMethod}
                              onChange={(e: any) => setSalePaymentMethod(e.target.value)}
                              className="w-full text-xs p-3 bg-black border border-zinc-900 rounded-xl font-bold text-white outline-none focus:border-brand-red"
                            >
                              <option value="Efectivo">Efectivo (01)</option>
                              <option value="Transferencia">Transferencia (03)</option>
                              <option value="Tarjeta">Tarjeta Débito/Crédito (04)</option>
                            </select>
                          </div>
                        </div>

                        {/* Quantity and totals check */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          <div>
                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Cantidad a Vender (PZS)</label>
                            <div className="flex items-center gap-2 bg-black border border-zinc-900 rounded-xl p-1.5 w-full">
                              <button
                                type="button"
                                onClick={() => setSaleQty(prev => Math.max(1, prev - 1))}
                                className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white font-black cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="flex-1 text-center font-black text-white text-xs font-mono">{saleQty} pzas</span>
                              <button
                                type="button"
                                onClick={() => setSaleQty(prev => prev + 1)}
                                className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white font-black cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-black/60 p-3.5 border border-zinc-900 rounded-xl text-center space-y-0.5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase block tracking-wider">Monto Total Estimado</span>
                            <span className="text-lg font-black font-mono text-emerald-400">
                              ${(saleQty * scannedTire.price * 1.16).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <span className="text-[7.5px] text-zinc-600 uppercase font-bold block">(IVA 16% REGULADO INCLUIDO)</span>
                          </div>
                        </div>

                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setActionType(null)}
                          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase transition-colors"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={confirmQuickSale}
                          className="px-6 py-2.5 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                        >
                          Generar Folio y Liquidar Stock
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action UI: MOVE LOCATION */}
                  {actionType === 'mover' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-[#ffb700] text-xs font-bold uppercase tracking-wider">
                        <Truck className="w-4 h-4" />
                        Programar Traspaso de Sucursal Inmediato
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Sucursal Destino</label>
                          <select
                            value={moveDestBranchId}
                            onChange={(e) => setMoveDestBranchId(e.target.value)}
                            className="w-full text-xs p-3 bg-black border border-zinc-900 rounded-xl font-bold text-white outline-none focus:border-[#ffb700]"
                          >
                            {BRANCHES.filter(b => b.id !== activeBranch).map(b => (
                              <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Cantidad a Traspasar (PZS)</label>
                          <div className="flex items-center gap-2 bg-black border border-zinc-900 rounded-xl p-1.5">
                            <button
                              type="button"
                              onClick={() => setMoveQty(prev => Math.max(1, prev - 1))}
                              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white font-black cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="flex-1 text-center font-black text-white text-xs font-mono">{moveQty} pzas</span>
                            <button
                              type="button"
                              onClick={() => {
                                const sourceStock = scannedTire.stock?.[activeBranch] || 0;
                                setMoveQty(prev => Math.min(sourceStock, prev + 1));
                              }}
                              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-white font-black cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setActionType(null)}
                          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase transition-colors"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={confirmBranchMove}
                          className="px-6 py-2.5 bg-[#ffb700] text-black font-black rounded-xl text-xs uppercase tracking-wider"
                        >
                          Confirmar Envió de Stock
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action UI: ADJUST STOCK */}
                  {actionType === 'ajustar' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                        <Sliders className="w-4 h-4" />
                        Ajustar / Conciliar Inventario en {currentBranchName}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Nuevo Inventario Físico (Piezase)</label>
                        <div className="flex items-center gap-4 bg-black border border-zinc-900 rounded-2xl p-4">
                          <button
                            type="button"
                            onClick={() => setAdjustQty(prev => Math.max(0, prev - 5))}
                            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white font-black hover:text-brand-red transition-all text-xs"
                          >
                            -5 PZS
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdjustQty(prev => Math.max(0, prev - 1))}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white font-black text-xs"
                          >
                            -1 PZ
                          </button>

                          <span className="flex-1 text-center font-mono font-black text-white text-xl">
                            {adjustQty} unidades
                          </span>

                          <button
                            type="button"
                            onClick={() => setAdjustQty(prev => prev + 1)}
                            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white font-black text-xs"
                          >
                            +1 PZ
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdjustQty(prev => prev + 5)}
                            className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white font-black hover:text-emerald-400 transition-all text-xs"
                          >
                            +5 PZS
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900">
                        <button
                          type="button"
                          onClick={() => setActionType(null)}
                          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase transition-colors"
                        >
                          Atrás
                        </button>
                        <button
                          type="button"
                          onClick={confirmStockAdjustment}
                          className="px-6 py-2.5 bg-white text-black font-black rounded-xl text-xs uppercase tracking-wider hover:opacity-95"
                        >
                          Sobrescribir Registro Físico
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
