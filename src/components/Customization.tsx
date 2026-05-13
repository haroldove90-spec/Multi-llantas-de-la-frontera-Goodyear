import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Palette, RotateCcw, Save, Check } from 'lucide-react';

interface ThemeConfig {
  primaryBg: string;
  cardBg: string;
  brandRed: string;
  brandBlue: string;
  textMain: string;
  textMuted: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryBg: '#282829',
  cardBg: '#3B3935',
  brandRed: '#B80F16',
  brandBlue: '#1D66C4',
  textMain: '#FFFFFF',
  textMuted: '#D1D1D1'
};

export default function Customization() {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('erp_theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Apply theme to root via CSS variables
    const root = document.documentElement;
    root.style.setProperty('--color-interface-bg', theme.primaryBg);
    root.style.setProperty('--color-card-bg', theme.cardBg);
    root.style.setProperty('--color-brand-red', theme.brandRed);
    root.style.setProperty('--color-brand-blue', theme.brandBlue);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    // Note: Tailwind v4 variables might need different handling if they are defined in @theme
    // but standard CSS property resolution works for utility classes
  }, [theme]);

  const handleSave = () => {
    localStorage.setItem('erp_theme', JSON.stringify(theme));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
  };

  const colorFields: { key: keyof ThemeConfig; label: string }[] = [
    { key: 'primaryBg', label: 'Fondo de Pantalla' },
    { key: 'cardBg', label: 'Tarjetas y Sidebar' },
    { key: 'brandRed', label: 'Color Primario (Rojo)' },
    { key: 'brandBlue', label: 'Color Acento (Azul)' },
    { key: 'textMain', label: 'Texto Principal' },
    { key: 'textMuted', label: 'Etiquetas y Muted' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">Módulo de <span className="text-brand-red">Personalización</span></h2>
        <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Ajustes Visuales de Identidad Corporativa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Color Pickers */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {colorFields.map((field) => (
              <div key={field.key} className="bg-card-bg p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">{field.label}</p>
                  <code className="text-white font-mono text-sm uppercase">{theme[field.key]}</code>
                </div>
                <div className="relative">
                  <input 
                    type="color" 
                    value={theme[field.key]}
                    onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                    className="w-16 h-16 rounded-2xl bg-interface-bg border-4 border-white/10 cursor-pointer overflow-hidden p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              onClick={handleSave}
              className="flex-1 bg-brand-red p-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-red/20"
            >
              {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {isSaved ? 'Guardado' : 'Guardar Cambios'}
            </button>
            <button 
              onClick={handleReset}
              className="p-4 bg-interface-bg rounded-2xl border border-white/5 text-text-muted hover:text-white transition-all shadow-xl"
              title="Restablecer Colores Originales"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Preview Console */}
        <div className="relative h-full min-h-[400px]">
          <div className="sticky top-10">
            <div className="bg-black/50 rounded-3xl border-4 border-brand-red p-8 shadow-[0_0_50px_rgba(184,15,22,0.2)]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-red rounded-xl"></div>
                <div className="flex-1 h-3 bg-white/10 rounded-full"></div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="h-40 bg-card-bg rounded-[2rem] border border-white/5 flex flex-col justify-end p-6">
                  <div className="w-1/2 h-2 bg-text-muted/20 rounded-full mb-3"></div>
                  <div className="w-3/4 h-6 bg-white/10 rounded-lg"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="h-14 bg-brand-blue rounded-xl flex items-center justify-center text-[10px] font-black uppercase text-white">Botón Acento</div>
                <div className="h-14 bg-interface-bg rounded-xl border border-white/5"></div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest text-center italic">Vista de Previa en Tiempo Real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
