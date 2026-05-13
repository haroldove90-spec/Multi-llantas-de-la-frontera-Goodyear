import React from 'react';
import { ShieldAlert, History, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { WARRANTIES, TIRES, UserRole } from '../data/mockData';
import { motion } from 'motion/react';

interface WarrantiesProps {
  userRole?: UserRole | null;
}

export default function Warranties({ userRole }: WarrantiesProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Portal de Garantías</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Reclamos y Trazabilidad DOT</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-[11px] font-bold uppercase tracking-wider shadow-lg">
          <ShieldAlert className="w-4 h-4 text-blue-500" />
          Registrar Reclamo
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-4 h-[1px] bg-slate-200"></div>
            Reclamos Activos en Sistema
          </h3>
          {WARRANTIES.map((warranty, idx) => {
            const tire = TIRES.find(t => t.id === warranty.productId);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={warranty.id} 
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-blue-50 transition-colors shrink-0">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                        {tire?.brand} {tire?.model}
                        <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded leading-none">Original</span>
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-1 uppercase font-bold tracking-tight">{warranty.dot}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ${
                    warranty.status === 'Pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {warranty.status}
                  </span>
                </div>

                {warranty.photoUrl && (
                  <div className="mt-4 h-32 w-full overflow-hidden rounded-xl border border-slate-100 relative group/photo">
                    <img 
                      src={warranty.photoUrl} 
                      alt="Daño de llanta" 
                      className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 text-[10px] text-white font-black uppercase tracking-widest">Evidencia Fotográfica</div>
                  </div>
                )}
                
                <div className="mt-6 grid grid-cols-2 gap-8 border-t border-slate-50 pt-6">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Kilometraje de Falla</p>
                    <p className="text-sm font-bold text-slate-700">{warranty.mileage.toLocaleString()} KM <span className="text-[10px] text-slate-400 font-medium">Registrado</span></p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Fecha de Ingreso</p>
                    <p className="text-sm font-bold text-slate-700 uppercase">{warranty.date}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                  <p className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-widest">Dictamen Técnico Solicitado</p>
                  <p className="text-sm leading-relaxed font-medium mb-3">
                    <span className="text-blue-600 mr-1 italic">"</span>
                    {warranty.reason}
                    <span className="text-blue-600 ml-1 italic">"</span>
                  </p>
                  {warranty.diagnosis && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-[9px] uppercase font-black text-blue-600 mb-1 tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Respuesta del Perito
                      </p>
                      <p className="text-[11px] font-bold text-slate-500 italic">
                        {warranty.diagnosis}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl shadow-slate-200">
            <h4 className="font-bold text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Directrices de Planta
            </h4>
            <div className="space-y-5 text-[11px]">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                <p className="opacity-70 leading-relaxed font-medium">El DOT debe ser legible. Fotos claras del flanco y banda requeridas para dictamen.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                <p className="opacity-70 leading-relaxed font-medium">Llantas con reparación (parches) en hombros invalidan garantía Michelin/BFG.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                <p className="opacity-70 leading-relaxed font-medium">Tiempo estimado de dictamen: 15-20 días hábiles vía portal B2B.</p>
              </div>
            </div>
            <button className="w-full mt-8 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40">
              Catálogo de Fallas
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
              <History className="w-3 h-3 text-slate-400" />
              Historial Operación
            </h4>
            <div className="space-y-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-100">
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-700 tracking-tight font-mono">DOT AX23-{9900 + i}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">Revisado hace {i * 2}h</p>
                  </div>
                  <FileText className="w-3 h-3 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
