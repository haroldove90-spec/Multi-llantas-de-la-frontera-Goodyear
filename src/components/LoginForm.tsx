import React, { useState } from 'react';
import { USERS, UserRole, BRANCHES, getActiveEmployees } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, LogIn, ChevronRight, AlertCircle, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (name: string, email: string, role: UserRole, branchId: string) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Try Supabase Auth first
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!authError && authData?.user) {
          // Fetch corresponding DB profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (!profileError && profile) {
            onLoginSuccess(
              profile.name,
              profile.email,
              profile.role as UserRole,
              profile.branch_id || 'all'
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Fallback / direct checking of local mock users
      const allUsers = getActiveEmployees();

      // Normalizing emails to allow colon typo from the user prompt
      const normalizedQueryEmail = cleanEmail.replace(':', '_');
      
      const localUser = allUsers.find(u => {
        const normUserEmail = u.email.toLowerCase().replace(':', '_');
        return normUserEmail === normalizedQueryEmail;
      });

      if (localUser) {
        // Validate password (ignore spaces in comparison of passwords as requested)
        const typedPassClean = cleanPassword.replace(/\s+/g, '');
        const mockPassClean = (localUser.password || '').replace(/\s+/g, '');
        
        if (typedPassClean === mockPassClean) {
          // Success local login
          onLoginSuccess(
            localUser.name,
            localUser.email,
            localUser.role,
            localUser.branchId
          );
          setIsLoading(false);
          return;
        } else {
          setError('Contraseña incorrecta para el usuario.');
          setIsLoading(false);
          return;
        }
      }

      setError('Usuario no registrado o credenciales incorrectas.');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFill = (user: typeof USERS[0]) => {
    setEmail(user.email);
    setPassword(user.password || '');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Radiant Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffb700]/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Logo Card */}
        <div className="text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <img
              src="https://appdesign.appdesignproyectos.com/multillantas.png"
              alt="Multillantas de la Frontera"
              className="h-24 object-contain"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black uppercase tracking-widest text-[#ffb700] leading-none mb-1 text-center"
          >
            MULTILLANTAS <span className="text-brand-red">FRONTERA</span>
          </motion.h1>
          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] italic">
            Sistema ERP de Control de Sucursales
          </p>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#050505] border-2 border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle gold line accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-red via-[#ffb700] to-brand-red"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-center text-white mb-6">
              ACCESO AUTORIZADO
            </h3>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-brand-red/10 border border-brand-red/30 rounded-2xl flex items-center gap-3 text-xs font-semibold text-brand-red"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@multillantas.com"
                  required
                  className="w-full bg-black/60 border border-zinc-800 focus:border-brand-red text-white text-xs py-3.5 pl-10 pr-4 rounded-2xl outline-none transition-all focus:shadow-[0_0_15px_rgba(255,0,0,0.15)] placeholder:text-zinc-600 font-semibold"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#ffb700]">
                  Contraseña / Clave
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-black/60 border border-zinc-800 focus:border-brand-red text-white text-xs py-3.5 pl-10 pr-12 rounded-2xl outline-none transition-all focus:shadow-[0_0_15px_rgba(255,0,0,0.15)] placeholder:text-zinc-600 font-semibold"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-600" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-red to-[#b80a10] hover:from-[#ff0000] hover:to-[#ff1a1a] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-red/20 active:scale-[0.98] border border-brand-red/10 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Evaluation Mode Indicator only */}
          <div className="mt-8 pt-6 border-t border-zinc-900/80 flex items-center justify-center">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">SISTEMA ERP SEGURO</span>
          </div>
        </motion.div>

        {/* Legal notice */}
        <p className="text-center text-[9px] text-zinc-600 font-black uppercase tracking-[0.25em]">
          PORTAL PROTEGIDO • MULTILLANTAS DE LA FRONTERA 2026
        </p>
      </div>
    </div>
  );
}
