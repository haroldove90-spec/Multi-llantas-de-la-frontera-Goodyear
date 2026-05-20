import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Lock, 
  Edit2, 
  CheckCircle, 
  UserPlus, 
  FileSignature, 
  CreditCard,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { UserRole, BRANCHES } from '../data/mockData';

interface ClientsNotesProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

interface Client {
  id: string;
  name: string;
  rfc: string;
  phone: string;
  email: string;
  creditLimit: number;
  balance: number;
  branchId: string;
  lastVisit: string;
}

interface RemissionNote {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  sellerName: string;
  branchId: string;
  status: 'Vigente' | 'Pendiente' | 'Cancelada';
  description: string;
}

export default function ClientsNotes({ userRole, branchId }: ClientsNotesProps) {
  const isReadOnly = userRole === 'superadmin' || userRole === 'vendedor';
  const [activeSubTab, setActiveSubTab] = useState<'clientes' | 'notas'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Clients state
  const [clients, setClients] = useState<Client[]>([
    { id: 'C-01', name: 'Transportes Fronterizos S.A.', rfc: 'TFR980412AA1', phone: '81 1234 5678', email: 'contacto@tfronterizos.com', creditLimit: 120000, balance: 45000, branchId: 'matriz', lastVisit: '2026-05-18' },
    { id: 'C-02', name: 'Juan Manuel Torres (Constructora)', rfc: 'TOMJ850615BB9', phone: '55 9876 5432', email: 'jtorres@constructora.mx', creditLimit: 250000, balance: 135000, branchId: 'norte', lastVisit: '2026-05-19' },
    { id: 'C-03', name: 'Servicio de Taxi Express Centro', rfc: 'STE051020XX4', phone: '999 444 2211', email: 'taxi_express@live.com.mx', creditLimit: 50000, balance: 12000, branchId: 'sur', lastVisit: '2026-05-15' },
    { id: 'C-04', name: 'Llantas y Refacciones del Norte', rfc: 'LRN1203049F2', phone: '81 4455 6677', email: 'compras@refaccionesnorte.com', creditLimit: 80000, balance: 0, branchId: 'matriz', lastVisit: '2026-05-17' },
    { id: 'C-05', name: 'Marina de la Garza Ruiz', rfc: 'GARM920720H12', phone: '81 2299 8811', email: 'marina.garza@hotmail.com', creditLimit: 0, balance: 0, branchId: 'matriz', lastVisit: '2026-05-20' },
  ]);

  // Notes state
  const [notes, setNotes] = useState<RemissionNote[]>([
    { id: 'REM-2026-01', clientName: 'Transportes Fronterizos S.A.', date: '2026-05-18', amount: 19400, sellerName: 'Pedro Ventas', branchId: 'matriz', status: 'Vigente', description: 'Venta de 4 Llantas Michelin Pilot Sport 4 con balanceo incluido.' },
    { id: 'REM-2026-02', clientName: 'Juan Manuel Torres (Constructora)', date: '2026-05-19', amount: 48800, sellerName: 'Ana Lopez', branchId: 'norte', status: 'Vigente', description: 'Pedido de 8 llantas BFGoodrich All-Terrain KO2 para camiones de volteo.' },
    { id: 'REM-2026-03', clientName: 'Servicio de Taxi Express Centro', date: '2026-05-15', amount: 12400, sellerName: 'Hugo Mendez', branchId: 'sur', status: 'Pendiente', description: 'Remisión pendiente de pago para 4 llantas Primacy 4.' },
  ]);

  // Form states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '', rfc: '', phone: '', email: '', creditLimit: '0', branchId: branchId || 'matriz'
  });

  const [newNote, setNewNote] = useState({
    clientName: '', amount: '', sellerName: 'Agente Oficial', branchId: branchId || 'matriz', description: ''
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const client: Client = {
      id: `C-0${clients.length + 1}`,
      name: newClient.name,
      rfc: newClient.rfc.toUpperCase(),
      phone: newClient.phone,
      email: newClient.email,
      creditLimit: parseFloat(newClient.creditLimit) || 0,
      balance: 0,
      branchId: newClient.branchId,
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setClients([client, ...clients]);
    setShowAddClient(false);
    setNewClient({ name: '', rfc: '', phone: '', email: '', creditLimit: '0', branchId: branchId || 'matriz' });
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    const note: RemissionNote = {
      id: `REM-2026-0${notes.length + 1}`,
      clientName: newNote.clientName,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(newNote.amount) || 0,
      sellerName: newNote.sellerName,
      branchId: newNote.branchId,
      status: 'Vigente',
      description: newNote.description
    };
    setNotes([note, ...notes]);
    setShowAddNote(false);
    setNewNote({ clientName: '', amount: '', sellerName: 'Agente Oficial', branchId: branchId || 'matriz', description: '' });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.rfc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(n => 
    n.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
            REGISTROS DE CLIENTES Y NOTAS
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            Administración Integral de Cuentas y Notas de Remisión de Sucursales
          </p>
        </div>

        {/* Read only Banner */}
        {isReadOnly && (
          <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-amber-500 font-bold uppercase text-[10px] tracking-widest animate-pulse">
            <Lock className="w-4 h-4" />
            Solo Visualizar (Matriz de Accesos Activa)
          </div>
        )}
      </header>

      {/* Sub Tabs Toggle */}
      <div className="flex border-b border-white/5 gap-4">
        {[
          { id: 'clientes', label: 'Clientes Registrados', icon: Users },
          { id: 'notas', label: 'Notas de Remisión', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              setSearchTerm('');
            }}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 text-xs font-black uppercase tracking-widest transition-all ${
              activeSubTab === tab.id 
                ? 'border-brand-red text-white' 
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder={activeSubTab === 'clientes' ? "Buscar por Nombre o RFC..." : "Buscar por Nota o Cliente..."}
            className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white uppercase"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {!isReadOnly ? (
            activeSubTab === 'clientes' ? (
              <button 
                onClick={() => setShowAddClient(true)}
                className="flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-3 px-6 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto active:scale-95 shadow-xl shadow-brand-red/10"
              >
                <UserPlus className="w-4 h-4" />
                Registrar Cliente
              </button>
            ) : (
              <button 
                onClick={() => setShowAddNote(true)}
                className="flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white rounded-xl py-3 px-6 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto active:scale-95 shadow-xl shadow-brand-red/10"
              >
                <FileSignature className="w-4 h-4" />
                Nueva Nota
              </button>
            )
          ) : (
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest border border-white/5 bg-black/20 p-3 rounded-xl italic">
              Operación con privilegios bloqueados por tu Rol
            </div>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      {activeSubTab === 'clientes' ? (
        <div className="bg-card-bg rounded-2xl border border-interface-bg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                <th className="px-6 py-4">ID/Cliente</th>
                <th className="px-6 py-4">RFC / Contacto</th>
                <th className="px-6 py-4">Límite Crédito</th>
                <th className="px-6 py-4">Saldo Pendiente</th>
                <th className="px-6 py-4">Sucursal</th>
                <th className="px-6 py-4 text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => {
                const limit = client.creditLimit;
                const bal = client.balance;
                const branch = BRANCHES.find(b => b.id === client.branchId);
                return (
                  <tr key={client.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <p className="font-black text-white">{client.name}</p>
                      <p className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">{client.id} • Ult. Visita: {client.lastVisit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-bold text-white/80">{client.rfc}</p>
                      <p className="text-[9px] text-text-muted font-bold tracking-widest mt-0.5">{client.phone} • {client.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-white">${limit.toLocaleString()}</p>
                      <p className="text-[8px] text-brand-red font-bold uppercase tracking-widest">Límite de confianza</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-black ${bal > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>${bal.toLocaleString()}</p>
                      <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Saldo Activo</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded text-text-muted">{branch?.name || 'Varios'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        bal > limit * 0.9 && limit > 0
                          ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {bal > limit * 0.9 && limit > 0 ? 'Límite Excedido' : 'Crédito Sano'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card-bg rounded-2xl border border-interface-bg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-interface-bg text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-white/5">
                <th className="px-6 py-4">Folio / Fecha</th>
                <th className="px-6 py-4">Cliente / Sucursal</th>
                <th className="px-6 py-4">Descripción de Concepto</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4 text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredNotes.map((note) => {
                const branch = BRANCHES.find(b => b.id === note.branchId);
                return (
                  <tr key={note.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <p className="font-black text-white">{note.id}</p>
                      <p className="text-[10px] text-text-muted font-bold tracking-widest">{note.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{note.clientName}</p>
                      <p className="text-[9px] text-brand-blue font-black uppercase tracking-widest">{branch?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-text-muted max-w-xs truncate">
                      {note.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-white">{note.sellerName}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-brand-red">
                      ${note.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        note.status === 'Vigente' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                      }`}>
                        {note.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CLIENT MODAL */}
      <AnimatePresence>
        {showAddClient && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-white/10 rounded-2xl max-w-lg w-full p-8 space-y-6"
            >
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Registrar Nuevo Cliente</h3>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nombre Comercial *</label>
                  <input 
                    type="text" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-bold capitalize text-white"
                    placeholder="Ej. Tranportadora Express"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">RFC Oficial *</label>
                    <input 
                      type="text" required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-black uppercase text-white"
                      placeholder="Ej. TFR980412AA1"
                      value={newClient.rfc}
                      onChange={(e) => setNewClient({...newClient, rfc: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Teléfono *</label>
                    <input 
                      type="text" required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-bold text-white"
                      placeholder="Ej. 8112345678"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-bold text-white"
                    placeholder="Ej. contacto@empresa.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Límite de Crédito Autorizado (MXN)</label>
                  <input 
                    type="number"
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-black text-brand-red"
                    placeholder="Ej. 100000"
                    value={newClient.creditLimit}
                    onChange={(e) => setNewClient({...newClient, creditLimit: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-red py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-red/90 transition-all"
                  >
                    Guardar Registro
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddClient(false)}
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

      {/* CREATE REMISSION NOTE MODAL */}
      <AnimatePresence>
        {showAddNote && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-white/10 rounded-2xl max-w-lg w-full p-8 space-y-6"
            >
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Emitir Nueva Nota de Remisión</h3>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nombre del Cliente *</label>
                  <input 
                    type="text" required
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-bold text-white"
                    placeholder="Elegir o buscar cliente..."
                    value={newNote.clientName}
                    onChange={(e) => setNewNote({...newNote, clientName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Monto de Liquidación (MXN) *</label>
                    <input 
                      type="number" required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-black text-brand-red"
                      placeholder="Ej. 12500"
                      value={newNote.amount}
                      onChange={(e) => setNewNote({...newNote, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Atendido por *</label>
                    <input 
                      type="text" required
                      className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-sm font-bold text-white"
                      value={newNote.sellerName}
                      onChange={(e) => setNewNote({...newNote, sellerName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Detalle / Concepto de Compra *</label>
                  <textarea 
                    required rows={3}
                    className="w-full bg-interface-bg border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-white outline-none"
                    placeholder="Describa marca, medida y servicios involucrados en la remisión..."
                    value={newNote.description}
                    onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-red py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-brand-red/90 transition-all"
                  >
                    Crear Remisión Sincronizada
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddNote(false)}
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
