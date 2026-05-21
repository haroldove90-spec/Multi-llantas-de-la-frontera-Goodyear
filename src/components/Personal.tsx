import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Phone, 
  Mail, 
  Lock, 
  Building2, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Activity,
  UserCheck,
  Building,
  Pencil,
  Save,
  User
} from 'lucide-react';
import { USERS, UserRole, BRANCHES, getActiveEmployees, saveActiveEmployees } from '../data/mockData';

interface PersonalProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

interface NewEmployee {
  name: string;
  phone: string;
  email: string;
  password?: string;
  role: UserRole;
  branchId: string;
}

export default function Personal({ userRole, branchId }: PersonalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('All');
  const [filterBranch, setFilterBranch] = useState<string>('All');
  
  // Tab/view state: 'list', 'new', or 'edit'
  const [activeSubView, setActiveSubView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  // Load all employees (stored custom first, fallback to default USERS + locally added employees)
  const [employees, setEmployees] = useState<any[]>(() => {
    return getActiveEmployees();
  });

  // Keep employees stored in localStorage
  const saveAddedEmployees = (list: any[]) => {
    setEmployees(list);
    saveActiveEmployees(list);
  };

  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'vendedor',
    branchId: 'matriz'
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Filter employees for listing
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm));
      
    const matchesRole = filterRole === 'All' || emp.role === filterRole;
    const matchesBranch = filterBranch === 'All' || emp.branchId === filterBranch;
    return matchesSearch && matchesRole && matchesBranch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <span className="px-2.5 py-1 bg-red-950/40 text-brand-red border border-brand-red/20 rounded-full text-[10px] font-black uppercase tracking-wider">Administrador</span>;
      case 'contador':
        return <span className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Contador</span>;
      case 'secretaria_facturista':
        return <span className="px-2.5 py-1 bg-pink-950/40 text-pink-400 border border-pink-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Facturista</span>;
      case 'credito_cobranza':
        return <span className="px-2.5 py-1 bg-cyan-950/50 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Cobranza</span>;
      case 'vendedor':
        return <span className="px-2.5 py-1 bg-orange-950/40 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">Vendedor</span>;
      default:
        return <span className="px-2.5 py-1 bg-zinc-900 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-wider">{role}</span>;
    }
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const { name, phone, email, password, role, branchId } = newEmployee;

    if (!name.trim()) return setFormError('El nombre completo es obligatorio.');
    if (!phone.trim()) return setFormError('El teléfono es obligatorio.');
    if (!email.trim() || !email.includes('@')) return setFormError('Ingrese un correo electrónico válido.');
    if (!password || password.length < 4) return setFormError('La contraseña debe tener al menos 4 caracteres.');

    // Check if email already registered
    const emailExists = employees.some(emp => emp.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      return setFormError('Este correo electrónico ya está registrado en el sistema.');
    }

    const uniqueId = `emp_${Date.now()}`;
    const newEmpRecord = {
      id: uniqueId,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role,
      branchId
    };

    const updatedList = [...employees, newEmpRecord];
    setEmployees(updatedList);
    saveAddedEmployees(updatedList);

    setFormSuccess(`¡Empleado ${name} registrado correctamente! Ya puede iniciar sesión.`);
    setNewEmployee({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'vendedor',
      branchId: 'matriz'
    });

    // Automatically transition to list after brief pause
    setTimeout(() => {
      setActiveSubView('list');
      setFormSuccess(null);
    }, 2000);
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!editingEmployee) return;

    const { id, name, phone, email, password, role, branchId } = editingEmployee;

    if (!name.trim()) return setFormError('El nombre completo es obligatorio.');
    if (!phone.trim()) return setFormError('El teléfono es obligatorio.');
    if (!email.trim() || !email.includes('@')) return setFormError('Ingrese un correo electrónico válido.');
    if (!password || password.length < 4) return setFormError('La contraseña debe tener al menos 4 caracteres.');

    // Check if email already registered by another employee
    const emailExists = employees.some(emp => emp.id !== id && emp.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      return setFormError('Este correo electrónico ya está registrado por otro colaborador.');
    }

    const updatedList = employees.map(emp => {
      if (emp.id === id) {
        return {
          ...emp,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role,
          branchId
        };
      }
      return emp;
    });

    saveAddedEmployees(updatedList);

    // Sync header / login info if we edited our own profile
    const activeEmail = localStorage.getItem('erp_user_email');
    if (activeEmail && activeEmail.toLowerCase() === email.trim().toLowerCase()) {
      localStorage.setItem('erp_user_name', name.trim());
      localStorage.setItem('erp_user_role', role);
      localStorage.setItem(`erp_user_phone_${activeEmail}`, phone.trim());
      
      window.dispatchEvent(new CustomEvent('profile-updated', { 
        detail: { name: name.trim(), email: activeEmail, role } 
      }));
    }

    setFormSuccess(`¡Colaborador ${name} actualizado correctamente!`);

    setTimeout(() => {
      setActiveSubView('list');
      setEditingEmployee(null);
      setFormSuccess(null);
    }, 1800);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    // Prevent delete superadmin or own profile
    if (id === 'u0' || id === 'u1') {
      alert('Por seguridad del ERP, no se puede eliminar el administrador principal.');
      return;
    }
    const myEmail = localStorage.getItem('erp_user_email');
    const targetEmpCheck = employees.find(e => e.id === id);
    if (targetEmpCheck && targetEmpCheck.email === myEmail) {
      alert('No puedes eliminar tu cuenta activa estando en sesión.');
      return;
    }

    if (window.confirm(`¿Seguro que deseas dar de baja y revocar el acceso a ${name}?`)) {
      const updated = employees.filter(emp => emp.id !== id);
      setEmployees(updated);
      saveAddedEmployees(updated);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
            CONTROL DE PERSONAL Y COLABORADORES
          </h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
            Gestión de Acceso, Roles del Dashboard y Sucursales de Trabajo
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveSubView('list')}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeSubView === 'list' 
                ? 'bg-red-650 text-white shadow-lg shadow-red-950/20' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            Lista de Personal
          </button>
          <button 
            onClick={() => setActiveSubView('new')}
            className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeSubView === 'new' 
                ? 'bg-[#ffb700] text-black shadow-lg shadow-yellow-950/20' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Alta de Empleado
          </button>
        </div>
      </div>

      {activeSubView === 'new' ? (
        /* REGISTER NEW EMPLOYEE FORM */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-zinc-950 border-2 border-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-red via-[#ffb700] to-brand-red"></div>
          
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffb700] mb-8 text-center flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-red" />
            Ingresar Nuevo Colaborador
          </h3>

          <form onSubmit={handleCreateEmployee} className="space-y-6">
            {formError && (
              <div className="p-4 bg-brand-red/10 border border-brand-red/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-brand-red uppercase tracking-tight">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-400 uppercase tracking-tight">
                <CheckCircle2 className="w-5 h-5 shrink-0 animate-bounce" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                Nombre del Empleado *
              </label>
              <input 
                type="text"
                placeholder="Nombre Completo (Ej. Juan Pérez López)"
                className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-brand-red focus:shadow-[0_0_12px_rgba(255,0,0,0.15)] placeholder:text-zinc-600 tracking-wide text-white"
                value={newEmployee.name}
                onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Teléfono *
                </label>
                <div className="relative">
                  <input 
                    type="tel"
                    placeholder="899-123-4567"
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-red tracking-wider text-white"
                    value={newEmployee.phone}
                    onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})}
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    placeholder="email@multillantas.com"
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-red text-white"
                    value={newEmployee.email}
                    onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Defina clave de ingreso"
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-mono font-bold focus:outline-none focus:border-brand-red text-white"
                    value={newEmployee.password}
                    onChange={e => setNewEmployee({...newEmployee, password: e.target.value})}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600" />
                </div>
              </div>

              {/* Dashboard Role */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Rol para el Dashboard *
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-brand-red text-white cursor-pointer"
                    value={newEmployee.role}
                    onChange={e => setNewEmployee({...newEmployee, role: e.target.value as UserRole})}
                  >
                    <option value="vendedor">Vendedor / Asesor</option>
                    <option value="contador">Contador</option>
                    <option value="secretaria_facturista">Secretaria Facturista</option>
                    <option value="credito_cobranza">Crédito y Cobranza</option>
                    <option value="superadmin">Administrador Global</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Work Branch */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                Sucursal de Trabajo *
              </label>
              <select 
                className="w-full bg-black border border-zinc-855 rounded-2xl py-3.5 px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-brand-red text-white cursor-pointer"
                value={newEmployee.branchId}
                onChange={e => setNewEmployee({...newEmployee, branchId: e.target.value})}
              >
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>SUCURSAL: {b.name.toUpperCase()}</option>
                ))}
                <option value="all">TODAS / CORPORATIVO (Solo Admin)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => setActiveSubView('list')}
                className="flex-1 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 py-4 bg-gradient-to-r from-brand-red to-[#b80a14] hover:from-[#ff0000] hover:to-[#ff1a1a] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
              >
                Registrar Colaborador
              </button>
            </div>
          </form>
        </motion.div>
      ) : activeSubView === 'edit' && editingEmployee ? (
        /* EDIT EMPLOYEE FORM */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-zinc-950 border-2 border-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-red via-[#ffb700] to-brand-red"></div>
          
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffb700] mb-8 text-center flex items-center justify-center gap-2">
            <Pencil className="w-5 h-5 text-brand-red animate-pulse" />
            Editar Registro de Colaborador
          </h3>

          <form onSubmit={handleUpdateEmployee} className="space-y-6">
            {formError && (
              <div className="p-4 bg-brand-red/10 border border-brand-red/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-brand-red uppercase tracking-tight">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-400 uppercase tracking-tight">
                <CheckCircle2 className="w-5 h-5 shrink-0 animate-bounce" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                Nombre del Empleado *
              </label>
              <input 
                type="text"
                placeholder="Nombre Completo (Ej. Juan Pérez López)"
                className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-brand-red focus:shadow-[0_0_12px_rgba(255,0,0,0.15)] placeholder:text-zinc-600 tracking-wide text-white"
                value={editingEmployee.name}
                onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Teléfono *
                </label>
                <div className="relative">
                  <input 
                    type="tel"
                    placeholder="899-123-4567"
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-red tracking-wider text-white"
                    value={editingEmployee.phone || ''}
                    onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    placeholder="email@multillantas.com"
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-brand-red text-white"
                    value={editingEmployee.email}
                    onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})}
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-650" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Defina clave de ingreso"
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-mono font-bold focus:outline-none focus:border-brand-red text-white"
                    value={editingEmployee.password || ''}
                    onChange={e => setEditingEmployee({...editingEmployee, password: e.target.value})}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-650" />
                </div>
              </div>

              {/* Dashboard Role */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Rol para el Dashboard *
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-black border border-zinc-850 rounded-2xl py-3.5 px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-brand-red text-white cursor-pointer"
                    value={editingEmployee.role}
                    onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value as UserRole})}
                  >
                    <option value="vendedor">Vendedor / Asesor</option>
                    <option value="contador">Contador</option>
                    <option value="secretaria_facturista">Secretaria Facturista</option>
                    <option value="credito_cobranza">Crédito y Cobranza</option>
                    <option value="superadmin">Administrador Global</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Work Branch */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                Sucursal de Trabajo *
              </label>
              <select 
                className="w-full bg-black border border-zinc-855 rounded-2xl py-3.5 px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-brand-red text-white cursor-pointer"
                value={editingEmployee.branchId}
                onChange={e => setEditingEmployee({...editingEmployee, branchId: e.target.value})}
              >
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>SUCURSAL: {b.name.toUpperCase()}</option>
                ))}
                <option value="all">TODAS / CORPORATIVO (Solo Admin)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="pt-4 flex gap-3">
              <button 
                type="button" 
                onClick={() => {
                  setActiveSubView('list');
                  setEditingEmployee(null);
                }}
                className="flex-1 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="flex-1 py-4 bg-gradient-to-r from-[#ffb700] to-orange-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-black" />
                Guardar Cambios
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        /* EMPLOYEES GRID / TABLE LIST */
        <div className="space-y-6">
          {/* Filters controls banner */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-650" />
              <input 
                type="text" 
                placeholder="Buscar por Nombre, Email o Teléfono..."
                className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-900 rounded-xl text-xs focus:outline-none focus:border-brand-red transition-all font-semibold uppercase text-white placeholder:text-zinc-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select 
                className="flex-1 md:flex-none text-[10px] font-black uppercase tracking-widest bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">Todos los Roles</option>
                <option value="superadmin">Administradores</option>
                <option value="vendedor">Vendedores</option>
                <option value="contador">Contadores</option>
                <option value="secretaria_facturista">Facturistas</option>
                <option value="credito_cobranza">Cobranza</option>
              </select>

              <select 
                className="flex-1 md:flex-none text-[10px] font-black uppercase tracking-widest bg-black border border-zinc-900 rounded-xl py-3 px-4 text-white outline-none"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="All">Todas las Sucursales</option>
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
                <option value="all">Corporativo</option>
              </select>
            </div>
          </div>

          {/* Table container */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black border-b border-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <th className="px-6 py-5">Colaborador / Info</th>
                    <th className="px-6 py-5">Sucursal</th>
                    <th className="px-6 py-5">Teléfono / Contacto</th>
                    <th className="px-6 py-5">Dashboard Rol</th>
                    <th className="px-6 py-5">Contraseña (ERP)</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-xs text-zinc-550 uppercase font-black tracking-widest">
                        Ningún empleado coincide con el filtro de búsqueda
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-4">
                            {/* Standard Avatar representation of profile */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-red/20 to-[#ffb700]/10 border border-white/5 flex items-center justify-center font-black text-brand-gold text-xs">
                              {emp.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight">{emp.name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Mail className="w-3.5 h-3.5 text-zinc-650" />
                                <span className="text-xs text-zinc-500 font-mono font-medium lowercase leading-none">{emp.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4.5">
                          <p className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-brand-gold" />
                            {BRANCHES.find(b => b.id === emp.branchId)?.name || 'Corp. Global'}
                          </p>
                        </td>
                        <td className="px-6 py-4.5">
                          <p className="text-xs font-bold text-zinc-400 font-mono tracking-wider">
                            {emp.phone || 'N/A'}
                          </p>
                        </td>
                        <td className="px-6 py-4.5">
                          {getRoleBadge(emp.role)}
                        </td>
                        <td className="px-6 py-4.5 font-mono text-xs font-bold text-zinc-500 hover:text-[#ffb700] transition-colors cursor-help" title="Clave de inicio">
                          {emp.password || '●●●●●●'}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingEmployee(emp);
                                setActiveSubView('edit');
                              }}
                              className="p-2 bg-zinc-900 hover:bg-[#ffb700]/10 border border-white/5 hover:border-[#ffb700]/30 rounded-lg text-zinc-400 hover:text-[#ffb700] transition-all cursor-pointer"
                              title="Editar Registro"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                              className="p-2 bg-zinc-900 hover:bg-brand-red/10 border border-white/5 hover:border-brand-red/30 rounded-lg text-zinc-400 hover:text-brand-red transition-all cursor-pointer"
                              title="Dar de baja"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-black/40 px-6 py-4 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-650 font-black uppercase">
              <span>Sincronizando con Base de Datos Local</span>
              <span>Total Colaboradores: {filteredEmployees.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
