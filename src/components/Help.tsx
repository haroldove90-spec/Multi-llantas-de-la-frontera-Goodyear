import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Book, Shield, ShoppingCart, Package, Truck, FileText, User } from 'lucide-react';
import { UserRole } from '../data/mockData';

interface HelpProps {
  userRole: UserRole | null;
}

export default function Help({ userRole }: HelpProps) {
  const instructions = {
    superadmin: [
      { title: 'Gestión Total', text: 'Acceso a todas las sucursales y configuraciones globales del sistema.' },
      { title: 'Personalización', text: 'Cambia el logo, colores y tipografía del dashboard para todas las terminales.' },
      { title: 'Auditoría', text: 'Monitorea las ventas, traspasos y garantías de toda la red de sucursales.' },
      { title: 'Usuarios', text: 'Define quién tiene acceso a cada sucursal y con qué nivel de permisos.' }
    ],
    gerente: [
      { title: 'Técnico / Asesor', text: 'Gestiona el inventario de tu sucursal y autoriza garantías técnicas.' },
      { title: 'Control de Traspasos', text: 'Recibe y envía mercancía entre sucursales de la frontera.' },
      { title: 'Reportes Locales', text: 'Visualiza el desempeño diario y mensual de tu punto de venta.' }
    ],
    vendedor: [
      { title: 'Punto de Venta', text: 'Realiza ventas rápidas, aplica descuentos autorizados y genera notas.' },
      { title: 'Consulta de Stock', text: 'Verifica disponibilidad en tiempo real tanto local como en otras sucursales.' },
      { title: 'Cierre de Caja', text: 'Reporta tus ingresos al final del turno para conciliación contable.' }
    ],
    contador: [
      { title: 'Centro Fiscal', text: 'Descarga facturas, concilia impuestos y monitorea el flujo de efectivo.' },
      { title: 'Sincronización SAT', text: 'Asegúrate de que todas las ventas estén timbradas correctamente.' },
      { title: 'Balance de Sucursales', text: 'Genera cortes de caja consolidados para la administración matriz.' }
    ]
  };

  const currentInstructions = userRole ? instructions[userRole] : [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-brand-red/10 rounded-2xl">
          <HelpCircle className="w-8 h-8 text-brand-red" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Centro de Ayuda</h2>
          <p className="text-text-muted font-bold text-sm tracking-widest uppercase">Manual de Usuario para {userRole?.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentInstructions.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card-bg p-8 rounded-3xl border border-white/5 shadow-xl hover:border-brand-red/20 transition-all group"
          >
            <div className="flex items-start gap-6">
              <div className="p-3 bg-interface-bg rounded-xl group-hover:bg-brand-red/10 transition-colors">
                <Book className="w-6 h-6 text-brand-red" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-brand-red transition-colors">{item.title}</h3>
                <p className="text-text-muted leading-relaxed font-medium">{item.text}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="mt-12">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-8 border-b border-white/5 pb-2">Conceptos Clave del ERP</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-interface-bg/30 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Seguridad</span>
            </div>
            <p className="text-xs text-text-muted leading-loose font-medium">El sistema utiliza Supabase RLS para garantizar que cada usuario solo vea los datos correspondientes a su rol y sucursal.</p>
          </div>
          <div className="bg-interface-bg/30 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Logística</span>
            </div>
            <p className="text-xs text-text-muted leading-loose font-medium">Los traspasos entre sucursales notifican automáticamente al gerente receptor para confirmar la entrada de mercancía.</p>
          </div>
          <div className="bg-interface-bg/30 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-brand-blue" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Facturación</span>
            </div>
            <p className="text-xs text-text-muted leading-loose font-medium">Todas las ventas están conectadas al Centro Fiscal para exportación directa a PDF/XML compatible con el SAT.</p>
          </div>
        </div>
      </section>

      <div className="bg-brand-red p-8 rounded-3xl shadow-2xl shadow-brand-red/10 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
        <div className="text-center md:text-left">
          <h4 className="text-2xl font-black uppercase tracking-tight text-white mb-2">¿Necesitas soporte técnico?</h4>
          <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">Nuestro equipo está en línea para ayudarte 24/7</p>
        </div>
        <a 
          href="https://wa.me/525624222449" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all shadow-xl text-center"
        >
          Contactar Soporte
        </a>
      </div>
    </div>
  );
}
