import React from 'react';
import { motion } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  time: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Inventario Bajo', message: 'La sucursal Norte reporta stock crítico en llantas Michelin.', type: 'alert', time: '5m ago' },
  { id: '2', title: 'Nueva Venta', message: 'Se ha registrado una venta de $12,400 en Matriz Centro.', type: 'success', time: '12m ago' },
  { id: '3', title: 'Traspaso Pendiente', message: 'Frontera solicita aprobación para traslado de rines.', type: 'warning', time: '1h ago' },
  { id: '4', title: 'Sistema Actualizado', message: 'Se han aplicado parches de seguridad al ERP.', type: 'info', time: '3h ago' },
];

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
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
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Panel de alertas ERP</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notif.id}
              className="p-5 bg-interface-bg/50 rounded-[2rem] border border-white/5 hover:border-brand-red/30 transition-all group"
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
                  <p className="text-[11px] text-text-muted leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 bg-interface-bg/30">
          <button className="w-full bg-brand-red p-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-red/20">
            Marcar todas como leídas
          </button>
        </div>
      </motion.div>
    </>
  );
}
