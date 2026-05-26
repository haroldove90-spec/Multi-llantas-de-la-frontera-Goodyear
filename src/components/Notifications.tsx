import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { TIRES, BRANCHES } from '../data/mockData';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  time: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'mock-1', title: 'Nueva Venta', message: 'Se ha registrado una venta de $12,400 en Sucursal Frontera.', type: 'success', time: '12m' },
  { id: 'mock-2', title: 'Sistema Actualizado', message: 'Módulo de inventarios sincronizado con caché.', type: 'info', time: '3h' },
];

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
  const [tiresList, setTiresList] = useState(() => [...TIRES]);
  const [dismissedList, setDismissedList] = useState<string[]>([]);

  // Listen to live inventory changes in case they buy/sell packages
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setTiresList([...e.detail]);
      } else {
        setTiresList([...TIRES]);
      }
    };
    window.addEventListener('erp-tires-updated', handleUpdate);
    return () => window.removeEventListener('erp-tires-updated', handleUpdate);
  }, []);

  // Compute smart inventory alerts dynamically
  const alertsList = useMemo(() => {
    const activeAlerts: Notification[] = [];

    tiresList.forEach(tire => {
      // 1. Alertas de stock mínimo ("Quedan 3 llantas 205/55R16")
      Object.entries(tire.stock || {}).forEach(([branchId, val]) => {
        const qty = Number(val) || 0;
        if (qty > 0 && qty <= 3) {
          const br = BRANCHES.find(b => b.id === branchId);
          const branchName = br ? br.name.replace('Sucursal ', '') : branchId;
          activeAlerts.push({
            id: `low-${tire.id}-${branchId}`,
            title: 'Quedan pocas llantas',
            message: `Quedan exactamente ${qty} llantas ${tire.brand} ${tire.model} (${tire.width}/${tire.profile} R${tire.rim}) en Sucursal ${branchName}. Reponer stock pronto.`,
            type: 'alert',
            time: 'Stock Bajo'
          });
        }
      });

      // 2. Alertas de productos sin rotación ("Este producto no se vende desde hace 90 días")
      // Calculate days since lastMovement. Default to an older date if none specified.
      const today = new Date('2026-05-26');
      const lastMoveDate = new Date(tire.lastMovement || '2025-11-20');
      const diffTime = Math.abs(today.getTime() - lastMoveDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 90) {
        activeAlerts.push({
          id: `stale-${tire.id}`,
          title: 'Sin Rotación detectado',
          message: `El producto ${tire.brand} ${tire.model} R${tire.rim} no registra movimientos desde hace ${diffDays} días (Límite: 90 días).`,
          type: 'warning',
          time: `Inactivo ${diffDays}d`
        });
      }

      // 3. Alertas de exceso de inventario (Overstock >= 35)
      Object.entries(tire.stock || {}).forEach(([branchId, val]) => {
        const qty = Number(val) || 0;
        if (qty >= 35) {
          const br = BRANCHES.find(b => b.id === branchId);
          const branchName = br ? br.name.replace('Sucursal ', '') : branchId;
          activeAlerts.push({
            id: `over-${tire.id}-${branchId}`,
            title: 'Exceso de Inventario',
            message: `Capacidad sobrepasada: ${qty} piezas de ${tire.brand} ${tire.model} en Sucursal ${branchName}. Se sugiere programar Traspaso.`,
            type: 'info',
            time: 'Sobre-stock'
          });
        }
      });
    });

    // Merge with static system updates and apply dismissal filter
    return [...activeAlerts, ...MOCK_NOTIFICATIONS].filter(item => !dismissedList.includes(item.id));
  }, [tiresList, dismissedList]);

  const clearAll = () => {
    // Dismiss all active ones
    const allIds = alertsList.map(item => item.id);
    setDismissedList(prev => [...prev, ...allIds]);
  };

  const removeOne = (id: string) => {
    setDismissedList(prev => [...prev, id]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-card-bg border-l border-white/5 z-[70] shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-interface-bg/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">Notificaciones</h3>
              <p className="text-[10px] font-bold text-[#ffb700] uppercase tracking-widest">Semaforización & Inteligencia</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {alertsList.length > 0 ? (
            alertsList.map((notif) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={notif.id}
                className="p-5 bg-interface-bg/50 rounded-3xl border border-white/5 hover:border-brand-red/30 transition-all group relative overflow-hidden"
              >
                <div className="flex gap-4">
                  <div className={`mt-1 shrink-0 ${
                    notif.type === 'alert' ? 'text-brand-red' :
                    notif.type === 'success' ? 'text-emerald-500' :
                    notif.type === 'warning' ? 'text-orange-500' : 'text-brand-blue'
                  }`}>
                    {notif.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                    {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
                    {notif.type === 'warning' && <Clock className="w-5 h-5" />}
                    {notif.type === 'info' && <Info className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-black uppercase tracking-tight text-white">{notif.title}</h4>
                      <span className="text-[9px] font-bold text-text-muted uppercase">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed mb-3">{notif.message}</p>
                    <button 
                      onClick={() => removeOne(notif.id)}
                      className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-red opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-text-muted font-bold uppercase tracking-widest text-xs italic">No hay alertas pendientes</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-interface-bg/30">
          <button 
            onClick={clearAll}
            disabled={alertsList.length === 0}
            className="w-full bg-brand-red p-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-red/20 disabled:opacity-50 disabled:grayscale"
          >
            Limpiar todas las alertas
          </button>
        </div>
      </motion.div>
    </>
  );
}
