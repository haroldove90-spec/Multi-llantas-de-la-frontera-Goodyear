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
  logoSize: number;
  logoSizeTablet: number;
  logoSizeMobile: number;
  logoSizeHome: number;
  dashboardTitle: string;
  dashboardTitleFontSize: number;
  showLogoContainer: boolean;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryBg: '#282829',
  cardBg: '#3B3935',
  brandRed: '#B80F16',
  brandBlue: '#1D66C4',
  textMain: '#FFFFFF',
  textMuted: '#D1D1D1',
  logoSize: 32,
  logoSizeTablet: 28,
  logoSizeMobile: 24,
  logoSizeHome: 100,
  dashboardTitle: 'Multillantas de la Frontera',
  dashboardTitleFontSize: 16,
  showLogoContainer: false,
};

export default function Customization() {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('erp_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_THEME, ...parsed };
      } catch (e) {
        return DEFAULT_THEME;
      }
    }
    return DEFAULT_THEME;
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-interface-bg', theme.primaryBg || DEFAULT_THEME.primaryBg);
    root.style.setProperty('--color-card-bg', theme.cardBg || DEFAULT_THEME.cardBg);
    root.style.setProperty('--color-brand-red', theme.brandRed || DEFAULT_THEME.brandRed);
    root.style.setProperty('--color-brand-blue', theme.brandBlue || DEFAULT_THEME.brandBlue);
    root.style.setProperty('--color-text-muted', theme.textMuted || DEFAULT_THEME.textMuted);
    
    root.style.setProperty('--logo-size', `${theme.logoSize || DEFAULT_THEME.logoSize}px`);
    root.style.setProperty('--logo-size-tablet', `${theme.logoSizeTablet || DEFAULT_THEME.logoSizeTablet}px`);
    root.style.setProperty('--logo-size-mobile', `${theme.logoSizeMobile || DEFAULT_THEME.logoSizeMobile}px`);
    root.style.setProperty('--logo-size-home', `${theme.logoSizeHome || DEFAULT_THEME.logoSizeHome}px`);
    root.style.setProperty('--dashboard-title-size', `${theme.dashboardTitleFontSize || DEFAULT_THEME.dashboardTitleFontSize}px`);
    root.style.setProperty('--display-logo-container', theme.showLogoContainer ? 'flex' : 'none');
    root.style.setProperty('--dashboard-title-text', `"${theme.dashboardTitle || DEFAULT_THEME.dashboardTitle}"`); 
    
    window.dispatchEvent(new CustomEvent('theme-update', { detail: theme }));
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
        <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Ajustes de Identidad y Marca</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Controls */}
        <div className="space-y-10">
          {/* Color Section */}
          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-6 border-b border-white/5 pb-2">Paleta de Colores</h3>
            <div className="grid grid-cols-1 gap-4">
              {colorFields.map((field) => (
                <div key={field.key} className="bg-card-bg p-4 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{field.label}</p>
                    <code className="text-white font-mono text-xs uppercase">{(theme[field.key as keyof ThemeConfig] as string) || '#000000'}</code>
                  </div>
                  <input 
                    type="color" 
                    value={(theme[field.key as keyof ThemeConfig] as string) || '#000000'}
                    onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                    className="w-12 h-12 rounded-xl bg-interface-bg border-2 border-white/10 cursor-pointer overflow-hidden p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Logo & Title Section */}
          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-6 border-b border-white/5 pb-2">Logo y Tipografía</h3>
            <div className="space-y-6">
              {/* Title Text */}
              <div className="bg-card-bg p-6 rounded-3xl border border-white/5 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Título del Dashboard</p>
                <input 
                  type="text"
                  value={theme.dashboardTitle || ''}
                  onChange={(e) => setTheme({ ...theme, dashboardTitle: e.target.value })}
                  className="w-full bg-interface-bg border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-brand-red outline-none transition-colors"
                  placeholder="Nombre de la empresa..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Sizes */}
                <div className="bg-card-bg p-6 rounded-3xl border border-white/5 shadow-xl space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Tamaño Logo Dashboard</p>
                  
                  <div>
                    <p className="text-[9px] font-bold text-text-muted/40 uppercase mb-1">Fullscreen ({theme.logoSize}px)</p>
                    <input 
                      type="range" min="10" max="100" value={theme.logoSize}
                      onChange={(e) => setTheme({ ...theme, logoSize: parseInt(e.target.value) })}
                      className="w-full accent-brand-red h-1.5"
                    />
                  </div>
                  
                  <div>
                    <p className="text-[9px] font-bold text-text-muted/40 uppercase mb-1">Tablet ({theme.logoSizeTablet}px)</p>
                    <input 
                      type="range" min="10" max="80" value={theme.logoSizeTablet}
                      onChange={(e) => setTheme({ ...theme, logoSizeTablet: parseInt(e.target.value) })}
                      className="w-full accent-brand-blue h-1.5"
                    />
                  </div>
                  
                  <div>
                    <p className="text-[9px] font-bold text-text-muted/40 uppercase mb-1">Mobil ({theme.logoSizeMobile}px)</p>
                    <input 
                      type="range" min="10" max="60" value={theme.logoSizeMobile}
                      onChange={(e) => setTheme({ ...theme, logoSizeMobile: parseInt(e.target.value) })}
                      className="w-full accent-brand-red h-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Home Logo Size */}
                  <div className="bg-card-bg p-6 rounded-3xl border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Tamaño Logo Home ({theme.logoSizeHome}px)</p>
                    <input 
                      type="range" min="40" max="400" value={theme.logoSizeHome}
                      onChange={(e) => setTheme({ ...theme, logoSizeHome: parseInt(e.target.value) })}
                      className="w-full accent-brand-blue"
                    />
                  </div>
                  
                  {/* Title Size */}
                  <div className="bg-card-bg p-6 rounded-3xl border border-white/5 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Tamaño Título ({theme.dashboardTitleFontSize || 0}px)</p>
                    <input 
                      type="range"
                      min="8"
                      max="40"
                      value={theme.dashboardTitleFontSize || 8}
                      onChange={(e) => setTheme({ ...theme, dashboardTitleFontSize: parseInt(e.target.value) })}
                      className="w-full accent-brand-red"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Container Toggle */}
              <div className="bg-card-bg p-6 rounded-3xl border border-white/5 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Contenedor de Logo</p>
                  <p className="text-[9px] font-bold text-text-muted/50 uppercase">Activa/Desactiva el cuadro de fondo</p>
                </div>
                <button 
                  onClick={() => setTheme({ ...theme, showLogoContainer: !theme.showLogoContainer })}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${theme.showLogoContainer ? 'bg-brand-red' : 'bg-interface-bg'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${theme.showLogoContainer ? 'translate-x-6' : 'translate-x-0'} shadow-md`} />
                </button>
              </div>
            </div>
          </section>

          <div className="flex gap-4 pt-6">
            <button 
              onClick={handleSave}
              className="flex-1 bg-brand-red p-5 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-red/40"
            >
              {isSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {isSaved ? 'Sincronizar Cambios' : 'Sincronizar Cambios'}
            </button>
            <button 
              onClick={handleReset}
              className="p-5 bg-interface-bg rounded-2xl border border-white/5 text-text-muted hover:text-white transition-all shadow-xl"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Preview Console */}
        <div className="relative">
          <div className="sticky top-10 space-y-6">
            <div className="bg-black/80 rounded-[3rem] border-8 border-white/5 p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent pointer-events-none" />
               
               {/* Logo Preview Area */}
               <div className="flex items-center gap-6 mb-12">
                 <div 
                   className={`flex items-center justify-center rounded-2xl transition-all duration-500 overflow-hidden ${
                    theme.showLogoContainer ? 'bg-brand-red p-4 shadow-xl shadow-brand-red/20' : 'bg-transparent p-0'
                   }`}
                   style={{ width: theme.showLogoContainer ? `${theme.logoSize + 32}px` : `${theme.logoSize}px`, height: theme.showLogoContainer ? `${theme.logoSize + 32}px` : `${theme.logoSize}px` }}
                 >
                   <img src="https://appdesign.appdesignproyectos.com/multillantas.png" alt="Logo" style={{ width: `${theme.logoSize}px` }} />
                 </div>
                 <div>
                   <h4 className="font-black uppercase leading-none tracking-tighter text-white" style={{ fontSize: `${theme.dashboardTitleFontSize}px` }}>
                     {theme.dashboardTitle}
                   </h4>
                   <p className="text-[10px] font-black uppercase text-brand-blue tracking-[0.3em] mt-2 italic">Corporate Identity</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 h-32 mb-8">
                 <div className="bg-card-bg rounded-[2rem] border border-white/10 p-6 flex flex-col justify-end">
                    <div className="w-12 h-6 bg-brand-red rounded-lg mb-2" />
                    <div className="w-full h-2 bg-text-muted/20 rounded-full" />
                 </div>
                 <div className="bg-card-bg rounded-[2rem] border border-white/10 p-6 flex flex-col justify-end">
                    <div className="w-20 h-6 bg-brand-blue rounded-lg mb-2" />
                    <div className="w-full h-2 bg-text-muted/20 rounded-full" />
                 </div>
               </div>

               <div className="flex items-center justify-center p-4 border-2 border-white/5 rounded-2xl bg-interface-bg/30">
                 <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] opacity-50">Entorno de Simulación</p>
               </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-black uppercase tracking-widest">Identidad Validada</p>
                <p className="text-text-muted text-[10px] uppercase font-bold tracking-tight">Los cambios se aplican globalmente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
