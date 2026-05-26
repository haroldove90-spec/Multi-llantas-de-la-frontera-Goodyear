import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  TrendingUp, 
  CloudRain, 
  Calendar, 
  AlertTriangle, 
  Percent, 
  RefreshCw, 
  CheckCircle, 
  ShoppingBag, 
  FileText, 
  Sliders, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ChevronRight, 
  Download, 
  Info,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  X
} from 'lucide-react';
import { TIRES, updateTiresStorage, Tire, BRANCHES } from '../data/mockData';

// Simulated Beeper Sound for ERP
function playBeeperSound(frequency = 1000) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio contextual feedback blocked:', e);
  }
}

interface PurchaseSuggestion {
  id: string;
  tireId: string;
  brand: string;
  model: string;
  rim: number;
  width: number;
  profile: number;
  currentStock: number;
  suggestedQty: number;
  velocity: 'Alta' | 'Media' | 'Baja';
  salesPerWeek: number;
  reason: string;
  deadline: string;
}

export default function CerebroAI({ userRole, branchId }: { userRole: string | null; branchId: string | null }) {
  const activeBranch = !branchId || branchId === 'all' ? 'matriz' : branchId;
  const currentBranchName = BRANCHES.find(b => b.id === activeBranch)?.name || 'Matriz';

  // Base state of tires
  const [tires, setTires] = useState<Tire[]>(() => [...TIRES]);
  const [loading, setLoading] = useState(false);

  // Seasonal State
  const [selectedSeason, setSelectedSeason] = useState<'rain' | 'easter' | 'winter'>('rain');
  const [optimizationApplied, setOptimizationApplied] = useState(false);

  // Active recommendations state
  const [purchaseSuggestions, setPurchaseSuggestions] = useState<PurchaseSuggestion[]>([]);
  
  // Interactive Purchase Order Creator Form
  const [selectedSuggestion, setSelectedSuggestion] = useState<PurchaseSuggestion | null>(null);
  const [purchaseOrderModal, setPurchaseOrderModal] = useState(false);
  const [orderQty, setOrderQty] = useState(12);
  const [orderBranch, setOrderBranch] = useState(activeBranch);
  const [orderSending, setOrderSending] = useState(false);

  // Promo discounts memory (original prices map to restore them)
  const [originalPrices, setOriginalPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('erp_original_prices');
    return saved ? JSON.parse(saved) : {};
  });

  // Load tires list and register update listener
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setTires([...e.detail]);
      }
    };
    window.addEventListener('erp-tires-updated', handleUpdate);
    return () => window.removeEventListener('erp-tires-updated', handleUpdate);
  }, []);

  // Save original prices helper
  const saveOriginalPriceAction = (tireId: string, originalPrice: number) => {
    const updated = { ...originalPrices, [tireId]: originalPrice };
    setOriginalPrices(updated);
    localStorage.setItem('erp_original_prices', JSON.stringify(updated));
  };

  // 1. Rotation Velocity and Suggested Purchases Engine
  useEffect(() => {
    // Generate suggestions based on current stocks & custom simulated speed
    // Higher-selling models get prioritized
    const suggestions: PurchaseSuggestion[] = tires.map(t => {
      const stockVal = t.stock?.[activeBranch] || 0;
      
      // Assing a velocity profile
      let velocity: 'Alta' | 'Media' | 'Baja' = 'Media';
      let salesPerWeek = 4;
      
      if (t.brand === 'Michelin' && t.model === 'Primacy 4') {
        velocity = 'Alta';
        salesPerWeek = 18;
      } else if (t.brand === 'Goodyear' && (t.model === 'EfficientGrip' || t.model === 'Wrangler Workhorse')) {
        velocity = 'Alta';
        salesPerWeek = 14;
      } else if (t.brand === 'BFGoodrich') {
        velocity = 'Media';
        salesPerWeek = 8;
      } else if (t.brand === 'Bridgestone') {
        velocity = 'Baja';
        salesPerWeek = 2;
      }

      // Safe stock boundary is 2x weekly sales
      const targetMin = salesPerWeek * 1.5;
      const suggestedQty = Math.max(12, Math.ceil(targetMin - stockVal));

      let reason = '';
      if (stockVal < targetMin && velocity === 'Alta') {
        reason = `Velocidad de venta cítrica en ${currentBranchName} (${salesPerWeek} pzas semanales) vs stock crítico de ${stockVal} unidades.`;
      } else if (stockVal < targetMin) {
        reason = `Demanda programada media de ${salesPerWeek} pzas/sem supera coberturas de almacén.`;
      } else {
        reason = `Rotación estable, se sugiere compra preventiva de lote comercial mínimo para optimizar fletes de distribuidor.`;
      }

      // Calculate automated next supplier deadline (e.g., antes de este viernes)
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntilFriday = (5 - currentDay + 7) % 7;
      if (daysUntilFriday === 0) daysUntilFriday = 7; // next Friday
      
      const fridayDate = new Date(today.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
      const formattedFriday = fridayDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

      return {
        id: `sug-${t.id}`,
        tireId: t.id,
        brand: t.brand,
        model: t.model,
        rim: t.rim,
        width: t.width,
        profile: t.profile,
        currentStock: stockVal,
        suggestedQty,
        velocity,
        salesPerWeek,
        reason,
        deadline: `antes del viernes ${formattedFriday}`
      };
    });

    // Filter suggestions that require attention (velocity 'Alta' or stock low relative to velocity)
    const criticalSuggestions = suggestions.filter(s => {
      // Return true if velocity is Alta or stock is less than 1.5x weekly volume
      return s.currentStock < s.salesPerWeek * 1.5;
    }).sort((a, b) => {
      if (a.velocity === 'Alta' && b.velocity !== 'Alta') return -1;
      if (b.velocity === 'Alta' && a.velocity !== 'Alta') return 1;
      return a.currentStock - b.currentStock;
    });

    setPurchaseSuggestions(criticalSuggestions);
  }, [tires, activeBranch, currentBranchName]);

  // Handle Order Suggestion Trigger
  const openOrderCreator = (sug: PurchaseSuggestion) => {
    setSelectedSuggestion(sug);
    setOrderQty(sug.suggestedQty);
    setOrderBranch(activeBranch);
    setPurchaseOrderModal(true);
  };

  const submitPurchaseOrder = () => {
    if (!selectedSuggestion) return;
    setOrderSending(true);
    playBeeperSound(1500);

    setTimeout(() => {
      // Add ordered stock to the specified branch
      const updatedTires = tires.map(t => {
        if (t.id === selectedSuggestion.tireId) {
          const stocks = { ...t.stock };
          stocks[orderBranch] = (stocks[orderBranch] || 0) + orderQty;
          return {
            ...t,
            stock: stocks,
            lastMovement: new Date().toISOString().split('T')[0] // restart rotation clock
          };
        }
        return t;
      });

      updateTiresStorage(updatedTires);
      setOrderSending(false);
      setPurchaseOrderModal(false);
      setSelectedSuggestion(null);

      alert(`¡Orden de Compra corporativa expedida e ingresada al almacén! Se acaban de agregar +${orderQty} unidades de ${selectedSuggestion.brand} ${selectedSuggestion.model} R${selectedSuggestion.rim} al stock de Sucursal ${BRANCHES.find(b => b.id === orderBranch)?.name || orderBranch}.`);
    }, 1500);
  };

  // Weather Event details mapping
  const SEASONAL_SPECS = {
    rain: {
      title: 'Monzón de Verano (Junio)',
      climate: 'Precipitaciones críticas estimadas: +85%',
      risk: 'Efecto Aquaplaning severo detectado en Autopista Frontera.',
      highwayTrips: 'Densidad vial: Media-Alta (conducción mojada)',
      recNote: 'Aumentar stock en +30% de llantas con estrías direccionales de gran canalización (Wet Grip / HT All-Season). Sugerida baja presión preventiva.',
      targetPatterns: ['HT', 'AT'],
      highlightBrands: ['Michelin', 'Goodyear'],
    },
    easter: {
      title: 'Semana Santa & Vacaciones (Marzo-Abril)',
      climate: 'Temperatura promedio extrema en asfalto: 38°C',
      risk: 'Fricción térmica acelerada en llanta trasera. Alta demanda de neumáticos de carretera.',
      highwayTrips: 'Densidad vial: Extrema (+120% tráfico de pasajeros)',
      recNote: 'Priorizar existencias masivas de llantas Premium Highway Terrain (HT) con alta calificación de temperatura (Calificación A en UTQG).',
      targetPatterns: ['HT'],
      highlightBrands: ['Michelin', 'BFGoodrich'],
    },
    winter: {
      title: 'Temporada Navideña & Heladas (Diciembre)',
      climate: 'Caminos con humedad / neblina densa matutina',
      risk: 'Adherencia pobre y pérdida abrupta de tracción en curvas.',
      highwayTrips: 'Densidad vial: Alta (viajes de regreso a la frontera)',
      recNote: 'Fomentar llantas All-Terrain (AT) para vehículos crossover SUV y camionetas 4x4 pesadas. Incrementar inventario de marcas premium.',
      targetPatterns: ['AT', 'MT'],
      highlightBrands: ['BFGoodrich', 'Goodyear'],
    }
  };

  const applySeasonalOptimization = () => {
    setLoading(true);
    playBeeperSound(1200);

    setTimeout(() => {
      const spec = SEASONAL_SPECS[selectedSeason];
      // Increase security stock for matching types
      const updatedTires = tires.map(t => {
        // match type or highlights
        const matchesType = spec.targetPatterns.includes(t.type);
        const matchesBrand = spec.highlightBrands.includes(t.brand);

        if (matchesType || matchesBrand) {
          const stocks = { ...t.stock };
          // Multiply current active stock by 1.25 to meet safety buffer targets
          stocks[activeBranch] = Math.max(stocks[activeBranch], Math.ceil(stocks[activeBranch] * 1.25));
          return {
            ...t,
            stock: stocks,
            lastMovement: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      });

      updateTiresStorage(updatedTires);
      setLoading(false);
      setOptimizationApplied(true);
      playBeeperSound(1800);

      // Auto clear optimization alert after 4s
      setTimeout(() => setOptimizationApplied(false), 4500);
      alert(`¡Optimización Estacional AI Aplicada! El stock de respaldo para las marcas y perfiles indicados de la temporada "${spec.title}" ha sido verificado e incrementado temporalmente un +25% en la sucursal para evitar quiebres de inventario.`);
    }, 1200);
  };

  // 3. Stale Stock notification calculations (> 90 days offset)
  // Let's compute date delta
  const getElapsedDays = (movementStr: string) => {
    try {
      const movDate = new Date(movementStr);
      const currDate = new Date('2026-05-26'); // Simulated current time inside application context
      const diffTime = Math.abs(currDate.getTime() - movDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 100; // default safe fallback
    }
  };

  const staleTires = tires.filter(t => {
    const days = getElapsedDays(t.lastMovement);
    // filter > 90 days
    return days > 90;
  }).sort((a, b) => getElapsedDays(b.lastMovement) - getElapsedDays(a.lastMovement)); // worst first

  // Action: Apply 10% instant promo discount to stale tire
  const applyPromoDiscount = (tire: Tire) => {
    // If already discounted, prompt to restore. Otherwise apply 10% cut
    const isDiscounted = originalPrices[tire.id] !== undefined;

    if (isDiscounted) {
      // Restore price
      const originalPrice = originalPrices[tire.id];
      const updatedTires = tires.map(t => {
        if (t.id === tire.id) {
          return { ...t, price: originalPrice };
        }
        return t;
      });

      updateTiresStorage(updatedTires);
      
      // Delete memory entry
      const nextPrices = { ...originalPrices };
      delete nextPrices[tire.id];
      setOriginalPrices(nextPrices);
      localStorage.setItem('erp_original_prices', JSON.stringify(nextPrices));

      playBeeperSound(900);
      alert(`Precios restaurados: El neumático ${tire.brand} ${tire.model} ha vuelto a su tarifa normal de $${originalPrice.toLocaleString()} MXN.`);
    } else {
      // Save original in memory
      const originalPrice = tire.price;
      saveOriginalPriceAction(tire.id, originalPrice);

      // Slashed price 10%
      const newPrice = Math.round(originalPrice * 0.9);
      const updatedTires = tires.map(t => {
        if (t.id === tire.id) {
          return { ...t, price: newPrice };
        }
        return t;
      });

      updateTiresStorage(updatedTires);
      playBeeperSound(2000);
      alert(`¡Campaña de Liquidación Autorizada! Se ha rebajado 10% de su precio comercial a la llanta ${tire.brand} ${tire.model}. Precio anterior: $${originalPrice.toLocaleString()} MXN. Nuevo precio outlet: $${newPrice.toLocaleString()} MXN. Sincronizado en Notas de Ventas e Inventario.`);
    }
  };

  return (
    <div className="space-y-6 text-white">
      
      {/* Golden Brain Header Dashboard Hero */}
      <div className="bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-zinc-900 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow behind */}
        <div className="absolute left-1/4 top-0 w-80 h-80 bg-[#ffb700]/5 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-brand-red/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ffb700]/20 to-[#ff4d4d]/10 px-4 py-1.5 rounded-full border border-[#ffb700]/30 text-xs font-black uppercase text-[#ffb700] tracking-wider">
            <Brain className="w-4 h-4 text-[#ffb700] animate-pulse" />
            Motor Predictivo Estacional & Compras
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
            CEREBRO OPERATIVO <span className="text-brand-red font-extrabold text-[#ffb700] block sm:inline">MULTILLANTAS AI</span>
          </h2>
          
          <p className="text-zinc-400 text-xs uppercase leading-relaxed font-semibold">
            Análisis algorítmico continuo sobre rotación de existencias por sucursal, alertas de liquidación de neumáticos obsoletos, y pronósticos meteorológicos avanzados. Evita la sobre-compra, mitiga quiebres de stock y acelera el EBITDA corporativo.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0 bg-black/60 p-4 border border-zinc-900 rounded-3xl text-center">
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Sede Monitoreada</span>
          <span className="text-sm font-black text-[#ffb700] uppercase block">{currentBranchName}</span>
          <span className="text-[8px] font-mono font-bold text-zinc-400 block mt-1">Sinc: 2026-05-26</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Purchase Engine & Diagnostics */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION A: MOTOR DE RECOMENDACIÓN DE COMPRAS */}
          <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-900 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div className="space-y-0.5">
                <span className="text-[#ffb700] text-[10px] uppercase font-black tracking-widest block">Algoritmo de Rotación Diaria</span>
                <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Sugerencias Automáticas de Abastecimiento
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[9px] font-black uppercase font-mono">
                Modelos Activos: {purchaseSuggestions.length}
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 uppercase leading-normal font-bold">
              Las sugerencias se calculan comparando el stock actual real en <span className="text-white">{currentBranchName}</span> contra el índice de velocidad de ventas por semana de cada neumático.
            </p>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {purchaseSuggestions.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/10 border border-dashed border-zinc-900 rounded-2xl">
                  <span className="text-[10px] uppercase font-black text-zinc-600 block">Saneamiento al 100%</span>
                  <p className="text-zinc-500 text-[10px] uppercase font-bold mt-1">No hay alertas de reabastecimiento crítico para {currentBranchName}.</p>
                </div>
              ) : (
                purchaseSuggestions.map((sug) => (
                  <div 
                    key={sug.id} 
                    className="p-4 bg-black border border-zinc-900 hover:border-zinc-800 rounded-2xl space-y-3 hover:bg-black/80 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black uppercase text-white tracking-tight">
                            {sug.brand} {sug.model}
                          </h4>
                          <span className="text-[9px] font-black bg-[#ffb700] text-black px-1.5 py-0.5 rounded-md uppercase">
                            {sug.width}/{sug.profile} R{sug.rim}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-[#ff4d4d] font-black uppercase mt-1">
                          ↳ Sugerencia: Comprar {sug.suggestedQty} piezas {sug.deadline}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          sug.velocity === 'Alta' 
                            ? 'bg-brand-red text-white' 
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          Rotación {sug.velocity}
                        </span>
                        <span className="block text-[8px] text-zinc-500 font-bold uppercase mt-1">
                          Vnd: {sug.salesPerWeek} pz/sem
                        </span>
                      </div>
                    </div>

                    <div className="text-[9.5px] uppercase font-semibold text-zinc-400 leading-normal bg-zinc-950 p-3 rounded-xl border border-zinc-900 border-l-4 border-l-[#ffb700]">
                      {sug.reason}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">
                        Stock actual: <strong className="text-white font-mono">{sug.currentStock} unidades</strong>
                      </div>

                      <button
                        onClick={() => openOrderCreator(sug)}
                        className="px-4 py-2 bg-[#ffb700] text-black hover:opacity-90 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Registrar Orden de Compra
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION C: ALERTA DE PRODUCTO LENTO (ROTACIÓN > 90 DÍAS INACTIVA) */}
          <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-900 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div className="space-y-0.5">
                <span className="text-brand-red text-[10px] uppercase font-black tracking-widest block">Mitigación de Mermas de Capital</span>
                <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2 text-white">
                  <Percent className="w-5 h-5 text-brand-red" />
                  Productos Lentos (&gt; 90 Días sin Movimiento)
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 rounded-lg text-brand-red text-[9px] font-black uppercase font-mono">
                Inactivos: {staleTires.length}
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 uppercase leading-normal font-bold">
              Artículos que tienen más de 90 días naturales sin registrar cotizaciones exitosas ni expedición de notas fiscales. Se sugiere liquidación agresiva al <span className="text-[#ffb700] font-bold">10% Descuento</span> directo en tarifa para liberar capital de trabajo de los racks de bodega.
            </p>

            <div className="space-y-3">
              {staleTires.map(tire => {
                const elapsed = getElapsedDays(tire.lastMovement);
                const isDiscounted = originalPrices[tire.id] !== undefined;

                return (
                  <div 
                    key={tire.id} 
                    className="p-4 bg-black border border-zinc-900 hover:border-zinc-850 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-black/85 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-white tracking-tight">
                          {tire.brand} {tire.model}
                        </span>
                        <span className="text-[8px] bg-brand-red text-white py-0.5 px-1.5 rounded-md font-black">
                          {tire.width}/{tire.profile} R{tire.rim}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 uppercase font-semibold">
                        <span className="text-brand-red font-black flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-red shrink-0" />
                          {elapsed} días de inactividad
                        </span>
                        <span>Último movimiento: <strong className="text-zinc-400">{tire.lastMovement}</strong></span>
                        <span>Disp matriz: <strong className="text-white">{tire.stock.matriz} pz</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right space-y-0.5">
                        <span className="text-[8px] font-black text-zinc-500 uppercase block tracking-wider">Precio de Lista</span>
                        <span className={`text-xs font-black font-mono block ${isDiscounted ? 'line-through text-zinc-650 opacity-40' : 'text-white'}`}>
                          ${tire.price.toLocaleString()} MXN
                        </span>
                        {isDiscounted && (
                          <span className="text-xs font-black font-mono text-emerald-400 block animate-pulse">
                            ${(tire.price).toLocaleString()} MXN
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => applyPromoDiscount(tire)}
                        className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border transition-all ${
                          isDiscounted 
                            ? 'bg-emerald-950/20 border-emerald-900/40 hover:bg-emerald-900/30 text-emerald-400' 
                            : 'bg-[#ffb700] text-black border-[#ffb700] hover:opacity-95 shadow-md hover:shadow-yellow-300/[0.05]'
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        {isDiscounted ? 'Descuento Activo (Revertir)' : 'Aplicar Liquidación (-10%)'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right Column: Weather Forecasting and Seasonality */}
        <div className="lg:col-span-5 space-y-6">

          {/* SECTION B: CLINIC METEOROLOGICAL / SEASONAL PREDICTION */}
          <div className="bg-zinc-950 p-6 rounded-[2rem] border border-zinc-900 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-brand-red/[0.02] rounded-full blur-[80px]"></div>

            <div className="border-b border-zinc-900 pb-4">
              <span className="text-brand-red text-[10px] uppercase font-black tracking-widest block">Planificador de Abasto Predictivo</span>
              <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-2 text-white">
                <CloudRain className="w-5 h-5 text-indigo-400 animate-bounce" />
                Predicciones Climatológicas y Temporada
              </h3>
            </div>

            <p className="text-[10px] text-zinc-400 uppercase leading-normal font-bold">
              Las temporadas climatológicas influyen críticamente en la tasa de desgaste y los tipos de llantas requeridas en la región de la frontera. Selecciona una ventana comercial para ajustar la cobertura:
            </p>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-black rounded-2xl border border-zinc-900">
              {(['rain', 'easter', 'winter'] as const).map(season => {
                const labels = { rain: 'Monzón (Junio)', easter: 'Semana Santa', winter: 'Invierno (Dic)' };
                return (
                  <button
                    key={season}
                    onClick={() => {
                      setSelectedSeason(season);
                      playBeeperSound(1100);
                    }}
                    className={`py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer text-center transition-all ${
                      selectedSeason === season 
                        ? 'bg-zinc-900 text-white border border-zinc-850' 
                        : 'text-zinc-550 hover:text-white'
                    }`}
                  >
                    {labels[season]}
                  </button>
                );
              })}
            </div>

            {/* Season Report Interface */}
            <div className="bg-black/70 p-5 rounded-2.5xl border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center bg-zinc-950/80 p-3 rounded-xl border border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <div>
                    <span className="text-[7.5px] font-black text-zinc-500 uppercase block tracking-widest">Macro-Campaña Activa</span>
                    <span className="text-xs font-black uppercase text-white">{SEASONAL_SPECS[selectedSeason].title}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[7.5px] font-black text-zinc-500 uppercase block tracking-widest">Estatus</span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Simulado</span>
                </div>
              </div>

              {/* Climate Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3.5 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase block">Condición Clima</span>
                  <span className="text-xs font-black text-white block uppercase tracking-wide leading-tight">
                    {SEASONAL_SPECS[selectedSeason].climate}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3.5 border border-zinc-900 rounded-xl space-y-1">
                  <span className="text-[8px] font-black text-zinc-500 uppercase block">Tráfico Carretero</span>
                  <span className="text-xs font-black text-white block uppercase tracking-wide leading-tight">
                    {SEASONAL_SPECS[selectedSeason].highwayTrips}
                  </span>
                </div>
              </div>

              {/* Threat Alert Block */}
              <div className="bg-[#ffb700]/5 border border-[#ffb700]/20 p-4 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-2 text-[#ffb700] text-[9px] font-black uppercase tracking-widest">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#ffb700]" />
                  Riesgo Operativo Identificado
                </div>
                <p className="text-[10px] text-[#ffb700] font-semibold uppercase leading-normal">
                  {SEASONAL_SPECS[selectedSeason].risk}
                </p>
              </div>

              {/* Recommendations Note block */}
              <div className="space-y-1 text-xs">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Plan de Acción / Ajuste Recomendado</span>
                <p className="text-[10px] text-zinc-300 font-semibold uppercase leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-900">
                  {SEASONAL_SPECS[selectedSeason].recNote}
                </p>
              </div>

              {/* Targets List */}
              <div className="flex items-center justify-between text-[10px] border-t border-zinc-900 pt-3">
                <span className="text-zinc-500 uppercase font-bold">Líneas Objetivo:</span>
                <div className="flex gap-2">
                  {SEASONAL_SPECS[selectedSeason].targetPatterns.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-brand-red/10 border border-brand-red/30 rounded text-brand-red text-[9px] font-black">
                      {p} Terrain
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* CTA action trigger to apply AI rules */}
            <div className="space-y-2">
              <button
                onClick={applySeasonalOptimization}
                disabled={loading}
                className="w-full py-4 px-6 bg-[#ffb700] hover:opacity-95 text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-300/[0.04] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Optimizando stocks con algoritmo AI...
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4" />
                    Aplicar Optimización Estacional a Bodega (+25%)
                  </>
                )}
              </button>

              {optimizationApplied && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-center text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-bounce">
                  ⚡ ¡Algoritmo AI aplicado con éxito en inventario activo!
                </div>
              )}
            </div>

          </div>

          {/* Quick info panel on how weather triggers tire wears */}
          <div className="bg-zinc-950 p-5 rounded-[2rem] border border-zinc-900 text-xs text-zinc-400 uppercase leading-relaxed font-semibold space-y-2">
            <div className="flex items-center gap-2 text-[#ffb700] text-[9px] font-black tracking-widest">
              <Info className="w-4 h-4 shrink-0 text-[#ffb700]" />
              ¿CÓMO CALCULA ESTO EL CIENTÍFICO DE DATOS?
            </div>
            <p className="text-[9.5px]">
              El "Cerebro" cruza datos de temperatura, estadísticas históricas de Semana Santa y eventos meteorológicos contra el inventario vivo de Multillantas de la Frontera, generando umbrales de re-orden automáticos para evitar desabastos o penalizaciones comerciales por falta de racks.
            </p>
          </div>

        </div>

      </div>

      {/* Renders standard US-LETTER CORPORATE PURCHASE ORDER PREVIEW MODAL */}
      <AnimatePresence>
        {purchaseOrderModal && selectedSuggestion && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-zinc-900 rounded-[2rem] w-full max-w-xl p-6 relative overflow-hidden shadow-2xl space-y-5"
            >
              
              {/* Close internal */}
              <button 
                onClick={() => {
                  setPurchaseOrderModal(false);
                  setSelectedSuggestion(null);
                }}
                className="absolute right-5 top-5 p-1 px-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full font-black text-xs cursor-pointer"
              >
                ✕
              </button>

              {/* Title Corporate header block */}
              <div className="border-b border-rose-600 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-black text-rose-600 uppercase tracking-wider block">Multillantas de la Frontera ERP</span>
                  <h3 className="text-base font-black uppercase text-zinc-950 tracking-tight">Orden de Adquisición de Llantas</h3>
                  <p className="text-[7.5px] text-zinc-500 uppercase font-semibold">Consola del Científico de Datos AI</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black bg-rose-600 text-white py-1 px-3 rounded-md uppercase">Folio: OC-2026-0041</span>
                  <span className="block text-[7px] text-zinc-400 uppercase font-extrabold mt-1">Sede Origen: Monterrey</span>
                </div>
              </div>

              {/* Executive content fields */}
              <div className="space-y-3 p-4 bg-zinc-50 rounded-2xl text-[10px] text-zinc-700 uppercase leading-normal font-semibold">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-400 block text-[7px] font-black tracking-wider uppercase">Proveedor Consolidado</span>
                    <strong className="text-zinc-900">{selectedSuggestion.brand} de México S.A de C.V</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[7px] font-black tracking-wider uppercase">Fecha de Expedición</span>
                    <strong className="text-zinc-900">2026-05-26</strong>
                  </div>
                </div>

                <hr className="border-dashed border-zinc-200" />

                <div>
                  <span className="text-zinc-400 block text-[7px] font-black tracking-wider uppercase">Artículo de Alta Rotación</span>
                  <div className="flex items-center gap-1.5 text-zinc-900">
                    <strong>{selectedSuggestion.brand} {selectedSuggestion.model}</strong>
                    <span className="bg-zinc-200 text-zinc-700 font-bold px-1 py-0.5 rounded text-[8px]">
                      {selectedSuggestion.width}/{selectedSuggestion.profile} R{selectedSuggestion.rim}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-405 text-zinc-400 block text-[7px] font-black tracking-wider uppercase">Destinar a Sucursal</span>
                    <select
                      value={orderBranch}
                      onChange={(e) => setOrderBranch(e.target.value)}
                      className="mt-1 outline-none text-[9.5px] p-2 bg-white border border-zinc-200 rounded-lg text-zinc-900 w-full"
                    >
                      {BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-zinc-400 block text-[7px] font-black tracking-wider uppercase">Cantidad Sugerida (Piezase)</span>
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        type="button"
                        onClick={() => setOrderQty(prev => Math.max(4, prev - 4))}
                        className="py-1 px-2.5 bg-zinc-200 rounded font-black text-xs cursor-pointer"
                      >
                        -4
                      </button>
                      <span className="font-mono font-black text-sm text-zinc-900">{orderQty} PZS</span>
                      <button 
                        type="button"
                        onClick={() => setOrderQty(prev => prev + 4)}
                        className="py-1 px-2.5 bg-zinc-200 rounded font-black text-xs cursor-pointer"
                      >
                        +4
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-700">
                  ⚠️ Motivo corporativo regulado: {selectedSuggestion.reason}
                </div>

              </div>

              {/* Cost and total mock calculate */}
              <div className="flex justify-between items-center px-4">
                <div>
                  <span className="text-[7.5px] font-black text-zinc-500 uppercase block">Costo de Lote Promedio</span>
                  <span className="text-lg font-black font-mono text-zinc-900">
                    ${(orderQty * (selectedSuggestion.suggestedQty * 80 + 1200)).toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <div className="text-zinc-400 text-[8px] font-black uppercase text-right leading-relaxed">
                  Firma autorizada digital: <br />
                  <span className="text-rose-600">@AI_BI_SCIENTIST_FRONTERA</span>
                </div>
              </div>

              {/* Trigger Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseOrderModal(false);
                    setSelectedSuggestion(null);
                  }}
                  className="px-4 py-2 bg-zinc-100 font-black uppercase text-[9px] hover:bg-zinc-200 text-zinc-650 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={orderSending}
                  onClick={submitPurchaseOrder}
                  className="px-6 py-2 bg-zinc-950 text-white font-black uppercase text-[9px] rounded-lg tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer disabled:opacity-40"
                >
                  {orderSending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Emitiendo orden...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Emitir Orden de Compra ERP
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
