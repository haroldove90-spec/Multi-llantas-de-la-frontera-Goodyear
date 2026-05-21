import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Building, 
  Upload, 
  Save, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Camera,
  RefreshCw
} from 'lucide-react';
import { BRANCHES, UserRole, getActiveEmployees, saveActiveEmployees } from '../data/mockData';

export default function Profile() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [branchId, setBranchId] = useState('');
  const [password, setPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load active user profile info
  useEffect(() => {
    const activeEmail = localStorage.getItem('erp_user_email') || '';
    const activeName = localStorage.getItem('erp_user_name') || '';
    const activeRole = localStorage.getItem('erp_user_role') as UserRole || null;
    const activeBranch = localStorage.getItem('erp_selected_branch') || 'matriz';
    
    setEmail(activeEmail);
    setName(activeName);
    setRole(activeRole);
    setBranchId(activeBranch);

    // Retrieve custom phone if stored previously, or fall back
    const savedPhone = localStorage.getItem(`erp_user_phone_${activeEmail}`);
    
    // Retrieve avatar picture
    const savedAvatar = localStorage.getItem(`erp_user_avatar_${activeEmail}`);
    setAvatar(savedAvatar);

    // Retrieve password and phone from the central list of active employees
    const employees = getActiveEmployees();
    const curEmp = employees.find((e: any) => e.email.toLowerCase() === activeEmail.toLowerCase());
    
    if (curEmp) {
      if (curEmp.password) setPassword(curEmp.password);
      if (curEmp.phone) {
        setPhone(curEmp.phone);
      } else if (savedPhone) {
        setPhone(savedPhone);
      } else {
        setPhone('899-765-4321');
      }
    } else {
      setPhone(savedPhone || '899-765-4321');
      setPassword('123_password');
    }

  }, []);

  // Handle Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const convertFileToBase64 = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormError('El archivo seleccionado debe ser una imagen (PNG, JPG, JPEG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('La imagen de perfil no debe superar los 2MB de tamaño.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64String = event.target.result as string;
        setAvatar(base64String);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      convertFileToBase64(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      convertFileToBase64(e.target.files[0]);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!name.trim()) {
      setFormError('El nombre no puede quedar en blanco.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Persist changes
    localStorage.setItem('erp_user_name', name.trim());
    localStorage.setItem(`erp_user_phone_${cleanEmail}`, phone.trim());
    
    if (avatar) {
      localStorage.setItem(`erp_user_avatar_${cleanEmail}`, avatar);
    } else {
      localStorage.removeItem(`erp_user_avatar_${cleanEmail}`);
    }

    // Update dynamic employees register list
    try {
      const list = getActiveEmployees();
      const updated = list.map((emp: any) => {
        if (emp.email.toLowerCase() === cleanEmail) {
          return {
            ...emp,
            name: name.trim(),
            phone: phone.trim(),
            password: password
          };
        }
        return emp;
      });
      saveActiveEmployees(updated);
    } catch (e) {
      console.error(e);
    }

    // Trigger visual refresh event immediately in main context headers
    window.dispatchEvent(new CustomEvent('profile-updated', { 
      detail: { name: name.trim(), email: cleanEmail, avatar } 
    }));

    setFormSuccess('¡Tus datos de perfil y fotografía se guardaron con éxito en el ERP!');
    setTimeout(() => {
      setFormSuccess(null);
    }, 3000);
  };

  const handleClearAvatar = () => {
    setAvatar(null);
  };

  const getBranchName = (idStr: string) => {
    if (idStr === 'all') return 'Corporativo Global';
    const found = BRANCHES.find(b => b.id === idStr);
    return found ? found.name : 'Sucursal Frontera';
  };

  const getRoleLabel = (r: UserRole | null) => {
    if (!r) return 'Usuario General';
    switch (r) {
      case 'superadmin': return 'Administrador Principal';
      case 'contador': return 'Contador General';
      case 'secretaria_facturista': return 'Secretaria Facturista';
      case 'credito_cobranza': return 'Crédito y Cobranza';
      case 'vendedor': return 'Asesor / Vendedor';
      default: return r;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-white pt-2">
      {/* Overview Head */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
          Mi Perfil de Usuario
        </h2>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">
          Personaliza tu Identidad en la Corporación Multillantas de la Frontera
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Avatar Loader */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 w-full flex flex-col items-center shadow-xl space-y-6">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2">Fotografía del ERP</span>

            <div className="relative group">
              {/* Outer circle layout */}
              <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-brand-red/40 bg-zinc-900 flex items-center justify-center relative shadow-inner">
                {avatar ? (
                  <img src={avatar} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <User className="w-16 h-16 text-zinc-700 mx-auto" />
                    <span className="text-[10px] text-zinc-600 font-extrabold uppercase tracking-wider block mt-1">S/F</span>
                  </div>
                )}

                {/* Hover overlay trigger */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-1.5"
                >
                  <Camera className="w-6 h-6 text-brand-gold animate-bounce" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">Cambiar</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider shadow">
                En Línea
              </div>
            </div>

            {/* Drag and Drop box area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center space-y-2 py-6 ${
                isDragOver 
                  ? 'border-brand-red bg-brand-red/5' 
                  : 'border-zinc-850 bg-black/40 hover:border-brand-gold hover:bg-zinc-900/40'
              }`}
            >
              <Upload className="w-5 h-5 text-zinc-600" />
              <p className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Arrastra o Selecciona</p>
              <p className="text-[8px] text-zinc-500">Max size 2MB (PNG/JPG)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            {avatar && (
              <button 
                type="button" 
                onClick={handleClearAvatar}
                className="text-[9px] font-black uppercase text-brand-red hover:underline tracking-widest"
              >
                Eliminar Fotografía
              </button>
            )}

            {/* Quick credentials details panel */}
            <div className="w-full pt-4 border-t border-zinc-900 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold leading-none">
                <span className="text-zinc-500 uppercase text-[9px] tracking-wider">Nivel:</span>
                <span className="text-white uppercase font-black text-brand-gold">{getRoleLabel(role)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold leading-none">
                <span className="text-zinc-500 uppercase text-[9px] tracking-wider">Sucursal:</span>
                <span className="text-white uppercase font-black">{getBranchName(branchId)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Forms Info */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveProfile} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-red via-[#ffb700] to-brand-red"></div>

            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#ffb700] mb-6 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShieldCheck className="w-5 h-5 text-brand-red" />
              Datos del Expediente ERP
            </h3>

            {formError && (
              <div className="p-4 bg-brand-red/10 border border-brand-red/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-brand-red uppercase">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-400 uppercase">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-red" /> Nombre Completo *
                </label>
                <input 
                  type="text" 
                  className="w-full bg-black border border-zinc-850 focus:border-brand-red rounded-xl py-3 px-4 text-xs font-semibold text-white tracking-wide"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-550 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Correo del Sistema (No Editable)
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-3 pl-10 pr-4 text-xs font-mono font-medium text-zinc-500 outline-none cursor-not-allowed"
                    value={email}
                    disabled
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Telephone */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-red" /> No. Teléfono Celular
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    className="w-full bg-black border border-zinc-850 focus:border-brand-red rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white tracking-wider"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="899-123-4567"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              {/* Password update if simulated / registered */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-brand-red" /> Clave de Acceso
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    className="w-full bg-black border border-zinc-850 focus:border-brand-red rounded-xl py-3 pl-10 pr-4 text-xs font-mono font-bold text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Clave actual"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-650" />
                </div>
              </div>
            </div>

            {/* Read-only indicators block */}
            <div className="bg-black/60 border border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red border border-brand-red/20 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider leading-none mb-1">Restricción de Sucursales</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase leading-none">ID Sucursal Registrada: {branchId}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1.5 bg-zinc-900 border border-white/5 text-[9px] font-black uppercase tracking-widest text-brand-gold rounded-lg leading-none">
                  Firma Electrónica Válida
                </span>
              </div>
            </div>

            {/* Button */}
            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button 
                type="submit"
                className="px-8 py-4 bg-brand-gold hover:bg-yellow-600 text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-lg"
              >
                <Save className="w-4 h-4 text-black" />
                Guardar Cambios de Perfil
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
