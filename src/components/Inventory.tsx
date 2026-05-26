import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Plus, ArrowRightLeft, 
  ShoppingCart, X, Upload, CheckCircle2, Image as ImageIcon, 
  Loader2, DollarSign, Sparkles, FilterX, HelpCircle
} from 'lucide-react';
import { TIRES, BRANCHES, UserRole, Tire, updateTiresStorage, CATEGORIES, Category, updateCategoriesStorage } from '../data/mockData';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryProps {
  userRole?: UserRole | null;
  branchId?: string | null;
}

export default function Inventory({ userRole, branchId }: InventoryProps) {
  const [tiresList, setTiresList] = useState<Tire[]>(() => [...TIRES]);
  const [categoriesList, setCategoriesList] = useState<Category[]>(() => [...CATEGORIES]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom Filters state
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterRim, setFilterRim] = useState('all');
  const [filterWidth, setFilterWidth] = useState('all');
  const [filterProfile, setFilterProfile] = useState('all');
  const [filterStock, setFilterStock] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock' | 'low_stock'
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Modal / Form state for Add Product
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepDesc, setUploadStepDesc] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'link'>('upload');

  // Modal / Form state for Category management
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({ id: '', name: '', description: '' });
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState(false);

  // Modal / Form state for Purchase Entrada (Compra)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    productId: '',
    branchId: 'matriz',
    quantity: '10',
    cost: '',
    supplier: '',
    invoiceId: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    width: '',
    profile: '',
    rim: '',
    loadIndex: '',
    speedRating: '',
    type: 'HT' as string,
    price: '',
    cost: '',
    price1: '',
    price2: '',
    priceReseller: '',
    imageUrl: '',
    stockMatriz: '0',
    stockNorte: '0',
    stockSur: '0',
    stockOriente: '0',
    stockPoniente: '0'
  });

  const isSuperAdmin = userRole === 'superadmin';
  const isGerente = true;
  const hasAccessToCost = true; // Permite ver costos de compra al dar de alta
  const canManagePrice = true; // Activo para dar de alta productos en el rol de inventario maestro
  const canLoadStock = true; // Activo para cargar stock inicial por sucursal

  // React to updates from internal updates (Sales, transfers, or additions in other tabs)
  useEffect(() => {
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setTiresList([...e.detail]);
      }
    };
    const handleCategoriesUpdate = (e: any) => {
      if (e.detail) {
        setCategoriesList([...e.detail]);
      }
    };
    window.addEventListener('erp-tires-updated', handleStorageUpdate);
    window.addEventListener('erp-categories-updated', handleCategoriesUpdate);
    return () => {
      window.removeEventListener('erp-tires-updated', handleStorageUpdate);
      window.removeEventListener('erp-categories-updated', handleCategoriesUpdate);
    };
  }, []);

  // Compute unique filter values dynamically from current list
  const uniqueBrands = Array.from(new Set(tiresList.map(t => t.brand))).filter(Boolean) as string[];
  const uniqueRims = (Array.from(new Set(tiresList.map(t => t.rim))).filter(Boolean) as number[]).sort((a, b) => a - b);
  const uniqueWidths = (Array.from(new Set(tiresList.map(t => t.width))).filter(Boolean) as number[]).sort((a, b) => a - b);
  const uniqueProfiles = (Array.from(new Set(tiresList.map(t => t.profile))).filter(Boolean) as number[]).sort((a, b) => a - b);

  // Auto-calculate suggested price fallbacks inside the form
  const handlePriceSuggest = (basePriceNum: number) => {
    if (!basePriceNum) return;
    setFormData(prev => ({
      ...prev,
      price1: prev.price1 || Math.round(basePriceNum * 0.95).toString(), // 5% off
      price2: prev.price2 || Math.round(basePriceNum * 0.90).toString(), // 10% off
      priceReseller: prev.priceReseller || Math.round(basePriceNum * 0.85).toString() // 15% off
    }));
  };

  // Simulated file upload mechanism
  const simulateImageUpload = (fileObj?: File) => {
    setIsSimulatingUpload(true);
    setUploadProgress(0);
    setUploadStepDesc('Estableciendo conexión segura con Supabase Storage...');

    // If a real file was provided, prepare reading it
    let fileUrl = '';
    if (fileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        fileUrl = reader.result as string;
      };
      reader.readAsDataURL(fileObj);
    }

    const tireImages = [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=60'
    ];

    const randomTireImage = tireImages[Math.floor(Math.random() * tireImages.length)];

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSimulatingUpload(false);
            setFormData(f => ({ ...f, imageUrl: fileUrl || randomTireImage }));
          }, 300);
          return 100;
        }
        
        let nextPercent = prev + Math.floor(Math.random() * 25) + 10;
        if (nextPercent > 100) nextPercent = 100;

        // Custom step descriptions
        if (nextPercent < 40) {
          setUploadStepDesc('Analizando firma binaria de imagen...');
        } else if (nextPercent < 75) {
          setUploadStepDesc('Cargando fragmentos de imagen (Multipart upload)...');
        } else {
          setUploadStepDesc('Confirmando políticas RLS de Supabase Bucket "warranties"...');
        }

        return nextPercent;
      });
    }, 250);
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterBrand('all');
    setFilterRim('all');
    setFilterWidth('all');
    setFilterProfile('all');
    setFilterStock('all');
  };

  // Submit Handler for Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');
    setCategorySuccess(false);

    const normId = newCategoryData.id.trim().toUpperCase();
    const normName = newCategoryData.name.trim();
    const normDesc = newCategoryData.description.trim();

    if (!normId || !normName) {
      setCategoryError('El código (ID) y el nombre de la categoría son obligatorios.');
      return;
    }

    // Check if ID already exists
    if (categoriesList.some(cat => cat.id.toUpperCase() === normId)) {
      setCategoryError(`Ya existe una categoría con el código de identificación "${normId}".`);
      return;
    }

    const newCategory: Category = {
      id: normId,
      name: normName,
      description: normDesc || undefined
    };

    const updatedCategories = [...categoriesList, newCategory];
    setCategoriesList(updatedCategories);
    updateCategoriesStorage(updatedCategories);
    setCategorySuccess(true);
    setNewCategoryData({ id: '', name: '', description: '' });

    // Set as the active selected type in the brand-new tire registration form automatically!
    setFormData(v => ({ ...v, type: normId }));

    setTimeout(() => {
      setCategorySuccess(false);
    }, 3000);
  };

  const handleDeleteCategory = (catIdToDelete: string) => {
    // Protect default categories from being deleted
    if (['HT', 'AT', 'MT'].includes(catIdToDelete.toUpperCase())) {
      setCategoryError('Por seguridad, no se pueden eliminar las categorías base del sistema (HT, AT, MT).');
      return;
    }

    const updatedCategories = categoriesList.filter(cat => cat.id.toUpperCase() !== catIdToDelete.toUpperCase());
    setCategoriesList(updatedCategories);
    updateCategoriesStorage(updatedCategories);
    
    // If deleted category was selected in the form, fall back to "HT"
    if (formData.type.toUpperCase() === catIdToDelete.toUpperCase()) {
      setFormData(v => ({ ...v, type: 'HT' }));
    }
  };

  // Submit Handler
  const handleAddTireSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || !formData.model || !formData.width || !formData.profile || !formData.rim || !formData.price) {
      alert('Por favor, llena todos los campos obligatorios indicados con (*)');
      return;
    }

    const priceNum = parseFloat(formData.price) || 0;
    const costNum = parseFloat(formData.cost) || 0;

    const newTire: Tire = {
      id: `NF-${Date.now()}`,
      brand: formData.brand,
      model: formData.model,
      name: formData.name,
      description: formData.description,
      width: parseInt(formData.width) || 0,
      profile: parseInt(formData.profile) || 0,
      rim: parseInt(formData.rim) || 0,
      loadIndex: formData.loadIndex || '100',
      speedRating: formData.speedRating || 'H',
      type: formData.type,
      price: priceNum,
      cost: costNum,
      price1: parseFloat(formData.price1) || Math.round(priceNum * 0.95),
      price2: parseFloat(formData.price2) || Math.round(priceNum * 0.90),
      priceReseller: parseFloat(formData.priceReseller) || Math.round(priceNum * 0.85),
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=60',
      stock: {
        matriz: parseInt(formData.stockMatriz) || 0,
        norte: parseInt(formData.stockNorte) || 0,
        sur: parseInt(formData.stockSur) || 0,
        oriente: parseInt(formData.stockOriente) || 0,
        poniente: parseInt(formData.stockPoniente) || 0
      },
      lastMovement: new Date().toISOString().split('T')[0]
    };

    // Prepend to array
    const updated = [newTire, ...tiresList];
    setTiresList(updated);
    updateTiresStorage(updated);

    // Show success view
    setIsSubmitSuccess(true);
    setTimeout(() => {
      setIsSubmitSuccess(false);
      setShowAddModal(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        brand: '',
        model: '',
        width: '',
        profile: '',
        rim: '',
        loadIndex: '',
        speedRating: '',
        type: 'HT',
        price: '',
        cost: '',
        price1: '',
        price2: '',
        priceReseller: '',
        imageUrl: '',
        stockMatriz: '0',
        stockNorte: '0',
        stockSur: '0',
        stockOriente: '0',
        stockPoniente: '0'
      });
    }, 1500);
  };

  // Submit Handler for Purchase/Compra Entrada
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, branchId, quantity, cost, supplier, invoiceId } = purchaseData;
    
    if (!productId) {
      alert('Por favor exprese un producto de inventario existente.');
      return;
    }
    const qtyNum = parseInt(quantity) || 0;
    if (qtyNum <= 0) {
      alert('La cantidad ingresada debe ser mayor a 0 para incrementar stock.');
      return;
    }

    const updatedTires = tiresList.map(t => {
      if (t.id === productId) {
        const nextStock = { ...t.stock };
        nextStock[branchId] = (nextStock[branchId] || 0) + qtyNum;
        
        // Also update cost price if provided
        const newCost = parseFloat(cost) || t.cost;
        
        return {
          ...t,
          stock: nextStock,
          cost: newCost,
          lastMovement: new Date().toISOString().split('T')[0]
        };
      }
      return t;
    });

    setTiresList(updatedTires);
    updateTiresStorage(updatedTires);
    setPurchaseSuccess(true);

    setTimeout(() => {
      setPurchaseSuccess(false);
      setShowPurchaseModal(false);
      setPurchaseData({
        productId: '',
        branchId: 'matriz',
        quantity: '10',
        cost: '',
        supplier: '',
        invoiceId: ''
      });
    }, 1500);
  };

  // Filter tires logic
  const filteredTires = tiresList.filter(tire => {
    // Search Term
    const matchesSearch = 
      tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${tire.width}/${tire.profile} R${tire.rim}`.includes(searchTerm) ||
      `r${tire.rim}`.includes(searchTerm.toLowerCase());

    // Brand Filter
    const matchesBrand = filterBrand === 'all' || tire.brand.toLowerCase() === filterBrand.toLowerCase();

    // Rim Filter
    const matchesRim = filterRim === 'all' || tire.rim.toString() === filterRim;

    // Width Filter
    const matchesWidth = filterWidth === 'all' || tire.width.toString() === filterWidth;

    // Profile Filter
    const matchesProfile = filterProfile === 'all' || tire.profile.toString() === filterProfile;

    // Stock Filter
    const totalStock = BRANCHES.reduce((sum, branch) => sum + (tire.stock[branch.id] || 0), 0);
    const matchesStock = 
      filterStock === 'all' ? true :
      filterStock === 'in_stock' ? totalStock > 0 :
      filterStock === 'out_of_stock' ? totalStock === 0 :
      filterStock === 'low_stock' ? BRANCHES.some(b_idx => (tire.stock[b_idx.id] || 0) <= 5) : true;

    return matchesSearch && matchesBrand && matchesRim && matchesWidth && matchesProfile && matchesStock;
  });

  return (
    <div className="space-y-6 bg-interface-bg min-h-screen text-white pb-20">
      
      {/* Title & Action Buttons Panel */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Inventario Maestro</h2>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">
            Catálogo Consolidado ({BRANCHES.length} Sucursales) • {filteredTires.length} Filtrados / {tiresList.length} Totales
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0">
          {canManagePrice && (
            <button 
              onClick={() => {
                // Prepopulate standard tires list just to reset or demo
                setTiresList([...TIRES]);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-800 transition-all text-[11px] font-black uppercase tracking-widest border border-zinc-800"
            >
              Restaurar Originales
            </button>
          )}

          {canManagePrice && (
            <button 
              onClick={() => setShowCategoriesModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-[#ffb700] hover:text-white rounded-xl hover:bg-zinc-900 transition-all text-[11px] font-black uppercase tracking-widest border border-zinc-800 cursor-pointer"
            >
              Categorías ({categoriesList.length})
            </button>
          )}

          {canManagePrice && (
            <button 
              onClick={() => setShowPurchaseModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 text-emerald-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-all text-[11px] font-black uppercase tracking-widest border border-emerald-500/10 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#ffb700]" />
              Registrar Compra (Entrada)
            </button>
          )}

          {canManagePrice && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-xl hover:opacity-90 active:scale-95 transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-red/20 border border-brand-red/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#ffb700]" />
              Alta de Producto
            </button>
          )}
        </div>
      </header>

      {/* Modern Compact Search & Filter Toolbar */}
      <div className="bg-card-bg rounded-2xl border border-white/5 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscador Inteligente: Escribe Marca, Modelo o ej. 225/45 R17..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/40 border border-zinc-850 rounded-xl focus:ring-1 focus:ring-[#ffb700] focus:border-transparent outline-none text-xs transition-all font-black text-white placeholder:text-text-muted"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center gap-2 px-5 py-3 ${
                showFiltersPanel ? 'bg-[#ffb700]/10 text-[#ffb700] border-[#ffb700]/30' : 'bg-black/30 text-text-muted hover:text-white border-zinc-850'
              } border rounded-xl transition-all text-xs font-black uppercase tracking-widest cursor-pointer`}
            >
              <Filter className="w-3.5 h-3.5" />
              {showFiltersPanel ? 'Ocultar Filtros' : 'Filtros Avanzados'}
            </button>

            {(searchTerm || filterBrand !== 'all' || filterRim !== 'all' || filterWidth !== 'all' || filterProfile !== 'all' || filterStock !== 'all') && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-3 bg-brand-red/15 text-brand-red hover:bg-brand-red/25 border border-brand-red/25 rounded-xl transition-all text-xs font-black uppercase tracking-widest cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <FilterX className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filters Collapse Panel */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-900 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Brand Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Marca</label>
                  <select 
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                  >
                    <option value="all">TODAS LAS MARCAS</option>
                    {uniqueBrands.map(b => (
                      <option key={b} value={b}>{b.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Rim Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Rin (R)</label>
                  <select 
                    value={filterRim}
                    onChange={(e) => setFilterRim(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                  >
                    <option value="all">TODOS LOS RINES</option>
                    {uniqueRims.map(r => (
                      <option key={r} value={r}>RIN {r}</option>
                    ))}
                  </select>
                </div>

                {/* Width Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Ancho</label>
                  <select 
                    value={filterWidth}
                    onChange={(e) => setFilterWidth(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                  >
                    <option value="all">TODOS LOS ANCHOS</option>
                    {uniqueWidths.map(w => (
                      <option key={w} value={w}>{w} mm</option>
                    ))}
                  </select>
                </div>

                {/* Profile Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Perfil</label>
                  <select 
                    value={filterProfile}
                    onChange={(e) => setFilterProfile(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                  >
                    <option value="all">TODOS LOS PERFILES</option>
                    {uniqueProfiles.map(p => (
                      <option key={p} value={p}>{p}%</option>
                    ))}
                  </select>
                </div>

                {/* Stock Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Existencia</label>
                  <select 
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="w-full text-xs p-2.5 bg-black border border-zinc-850 rounded-xl font-bold tracking-tight text-white outline-none focus:border-[#ffb700]"
                  >
                    <option value="all">REVISAR TODO EL STOCK</option>
                    <option value="in_stock">CON EXISTENCIA TOTAL &gt; 0</option>
                    <option value="out_of_stock">SIN EXISTENCIA TOTAL (0 URBANO)</option>
                    <option value="low_stock">BAJO STOCK EN MATRIZ/SUC (≤ 5)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Master Inventory Central Content Block */}
      <div className="bg-card-bg rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Table View (Desktop Component) */}
        <div className="hidden xl:block overflow-x-auto select-none">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/60 text-text-muted text-[9px] uppercase font-black tracking-widest sticky top-0 border-b border-zinc-900">
                <th className="px-5 py-4 text-[#ffb700] w-14">Foto</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Medida / Tipo</th>
                {BRANCHES.map(branch => (
                  <th key={branch.id} className="px-4 py-4 text-center">
                    <span className="block">{branch.name.toUpperCase()}</span>
                    <span className="text-[7px] text-zinc-500 font-bold block">{branch.id === 'matriz' ? 'MATRIZ CORPO' : 'SUCURSAL'}</span>
                  </th>
                ))}
                <th className="px-4 py-4 text-right">Precio Gral.</th>
                <th className="px-4 py-4 text-right text-amber-500 font-extrabold bg-[#ffb700]/5">Precio 1</th>
                <th className="px-4 py-4 text-right text-amber-400 font-extrabold bg-[#ffb700]/5">Precio 2</th>
                <th className="px-4 py-4 text-right text-[#ffb700] font-extrabold bg-[#ffb700]/5">P. Revendedor</th>
                {hasAccessToCost && <th className="px-4 py-4 text-right text-emerald-400">Costo (Neto)</th>}
                <th className="px-5 py-4 text-right">Existencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-xs">
              {filteredTires.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-text-muted max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                        <Package className="w-6 h-6 text-zinc-600" />
                      </div>
                      <p className="font-black text-sm uppercase text-white tracking-widest">Sin Coincidencias de Llantas</p>
                      <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">No se hallaron productos con estos criterios. Intenta borrar los filtros configurados o registra una nueva especificación de llanta.</p>
                      <button 
                        onClick={resetFilters}
                        className="px-4 py-2 mt-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-800"
                      >
                        Remover Filtros
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTires.map((tire, idx) => {
                  const totalStock = BRANCHES.reduce((sum, b) => sum + (tire.stock[b.id] || 0), 0);
                  
                  // Calculated prices in case they don't exist
                  const p1 = tire.price1 || Math.round(tire.price * 0.95);
                  const p2 = tire.price2 || Math.round(tire.price * 0.90);
                  const pRev = tire.priceReseller || Math.round(tire.price * 0.85);

                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      key={tire.id} 
                      className={`hover:bg-white/5 transition-colors group ${idx % 2 !== 0 ? 'bg-black/10' : ''}`}
                    >
                      {/* Product Thumbnail Pic */}
                      <td className="px-5 py-3">
                        <div className="w-12 h-12 bg-black rounded-xl overflow-hidden border border-zinc-850 flex items-center justify-center text-zinc-600 relative group-hover:scale-105 transition-all">
                          {tire.imageUrl ? (
                            <img 
                              src={tire.imageUrl} 
                              alt={tire.model} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // hide error
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                        </div>
                      </td>

                      {/* Brand & Model */}
                      <td className="px-6 py-3 max-w-xs">
                        <div className="flex flex-col space-y-0.5">
                          <span className="font-extrabold text-white uppercase tracking-tight text-sm flex items-center gap-1.5 leading-none">
                            {tire.brand}
                            {totalStock === 0 && (
                              <span className="text-[8px] bg-brand-red/20 text-brand-red px-1 py-0.5 rounded font-black tracking-widest uppercase animate-pulse">
                                AGOTADO
                              </span>
                            )}
                          </span>
                          <span className="text-text-muted text-[10px] font-black uppercase tracking-wide italic leading-none">{tire.model}</span>
                          {tire.name && tire.name !== `${tire.brand} ${tire.model}` && (
                            <span className="text-[10px] text-[#ffb700] font-black uppercase tracking-tight">{tire.name}</span>
                          )}
                          {tire.description && (
                            <p className="text-[9px] text-zinc-400 font-medium leading-relaxed mt-1 line-clamp-2" title={tire.description}>
                              {tire.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Specifications / Dimensions */}
                      <td className="px-6 py-3 font-mono">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="bg-zinc-900 border border-zinc-800 text-zinc-200 px-2 py-0.5 rounded font-black text-[11px]">
                            {tire.width}/{tire.profile} R{tire.rim}
                          </span>
                          <div className="flex gap-1">
                            <span 
                              title={categoriesList.find(c => c.id.toUpperCase() === tire.type.toUpperCase())?.name || tire.type}
                              className="text-[8px] bg-brand-blue/15 text-brand-blue font-black tracking-widest px-1 py-0.5 rounded uppercase cursor-help"
                            >
                              {tire.type}
                            </span>
                            <span className="text-[8px] bg-zinc-900 text-zinc-500 font-black tracking-widest px-1 py-0.5 rounded uppercase">
                              {tire.loadIndex}{tire.speedRating}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch Stocks */}
                      {BRANCHES.map(branch => {
                        const stock = tire.stock[branch.id] || 0;
                        return (
                          <td key={branch.id} className="px-4 py-3 text-center">
                            <span className={`text-[11px] font-black px-2.5 py-1.5 rounded-lg inline-block text-center min-w-10 ${
                              stock === 0 
                                ? 'bg-zinc-900/80 text-zinc-700 font-bold border border-zinc-950' 
                                : stock <= 5 
                                  ? 'bg-brand-red/10 text-brand-red border border-brand-red/20 font-black' 
                                  : 'bg-black/35 text-white/90 border border-zinc-900'
                            }`}>
                              {stock}
                            </span>
                          </td>
                        );
                      })}

                      {/* Pricing Structures */}
                      <td className="px-4 py-3 text-right font-black text-white text-xs">
                        ${tire.price.toLocaleString()}
                      </td>

                      {/* Pricing 1 Column */}
                      <td className="px-4 py-3 text-right font-black text-amber-500 bg-[#ffb700]/5 text-xs">
                        ${p1.toLocaleString()}
                      </td>

                      {/* Pricing 2 Column */}
                      <td className="px-4 py-3 text-right font-black text-amber-400 bg-[#ffb700]/5 text-xs">
                        ${p2.toLocaleString()}
                      </td>

                      {/* Pricing Reseller Column */}
                      <td className="px-4 py-3 text-right font-black text-[#ffb700] bg-[#ffb700]/5 text-xs">
                        ${pRev.toLocaleString()}
                      </td>

                      {/* Costs (Conditionally unlocked) */}
                      {hasAccessToCost && (
                        <td className="px-4 py-3 text-right">
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md font-black text-[10px] tracking-wide">
                            ${tire.cost.toLocaleString()}
                          </span>
                        </td>
                      )}

                      {/* Consolidated Stock Total */}
                      <td className="px-5 py-3 text-right">
                        <span className={`w-8 h-8 rounded-full ${
                          totalStock === 0 ? 'bg-zinc-900/60 text-zinc-650' : 'bg-zinc-900 text-[#ffb700]'
                        } flex items-center justify-center ml-auto font-black text-[10px] border border-zinc-850`}>
                          {totalStock}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Medium and Small Screens Table (Intermediate Grid Desktop & Tablet/Mobile support) */}
        <div className="hidden md:block xl:hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/80 text-text-muted text-[9px] uppercase font-black border-b border-zinc-900">
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Medidas</th>
                <th className="px-4 py-4 text-right">Precio Público</th>
                <th className="px-4 py-4 text-[#ffb700] text-right">Precio 1</th>
                <th className="px-4 py-4 text-amber-500 text-right">P. Revendedor</th>
                <th className="px-6 py-4 text-right">Existencias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs">
              {filteredTires.map(t => {
                const totalStock = BRANCHES.reduce((sum, b) => sum + (t.stock[b.id] || 0), 0);
                return (
                  <tr key={t.id} className="hover:bg-zinc-900/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-950 rounded border border-zinc-900 overflow-hidden flex items-center justify-center">
                        {t.imageUrl ? <img src={t.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Package className="w-4 h-4 text-zinc-500" />}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-white select-all">{t.brand.toUpperCase()}</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase leading-none">{t.model}</p>
                        {t.name && t.name !== `${t.brand} ${t.model}` && (
                          <span className="text-[9px] text-[#ffb700] font-black uppercase mt-0.5">{t.name}</span>
                        )}
                        {t.description && (
                          <span className="text-[9px] text-zinc-500 font-medium leading-tight mt-0.5 select-none line-clamp-1">{t.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      {t.width}/{t.profile} R{t.rim} <span className="text-[9px] text-[#ffb700] bg-zinc-900 px-1 rounded">{t.type}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-white">${t.price.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-black text-[#ffb700]">${(t.price1 || Math.round(t.price * 0.95)).toLocaleString()}</td>
                    <td className="px-4 py-4 text-right font-black text-amber-400">${(t.priceReseller || Math.round(t.price * 0.85)).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-extrabold text-[#ffb700] bg-[#ffb700]/10 px-2 py-0.5 rounded">{totalStock} pzs</span>
                        <span className="text-[8px] text-zinc-500 mt-0.5">HE: {t.stock.matriz || 0} | SA: {t.stock.norte || 0} | IND: {t.stock.sur || 0}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Smart Card View (Mobile Layout) */}
        <div className="md:hidden divide-y divide-zinc-900 bg-black/40">
          {filteredTires.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <Package className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="font-black uppercase tracking-wider text-xs">Sin neumáticos encontrados</p>
            </div>
          ) : (
            filteredTires.map((tire) => {
              const totalStock = BRANCHES.reduce((sum, b) => sum + (tire.stock[b.id] || 0), 0);
              const p1 = tire.price1 || Math.round(tire.price * 0.95);
              const p2 = tire.price2 || Math.round(tire.price * 0.90);
              const pRes = tire.priceReseller || Math.round(tire.price * 0.85);

              return (
                <div key={tire.id} className="p-5 space-y-4">
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center text-zinc-650 shrink-0 relative">
                        {tire.imageUrl ? (
                          <img src={tire.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
                        <span 
                          title={categoriesList.find(c => c.id.toUpperCase() === tire.type.toUpperCase())?.name || tire.type}
                          className="absolute bottom-0 right-0 bg-[#ffb700] text-black text-[7px] font-black px-1 py-0.2 rounded uppercase cursor-help"
                        >
                          {tire.type}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <h3 className="font-extrabold text-white uppercase tracking-tighter text-sm leading-none">{tire.brand}</h3>
                        <p className="text-[10px] text-text-muted font-black tracking-wider uppercase italic mt-0.5 leading-none">{tire.model}</p>
                        {tire.name && tire.name !== `${tire.brand} ${tire.model}` && (
                          <span className="text-[10px] text-[#ffb700] font-black uppercase">{tire.name}</span>
                        )}
                        {tire.description && (
                          <p className="text-[9px] text-zinc-400 font-medium leading-snug line-clamp-2 select-all">{tire.description}</p>
                        )}
                        <p className="text-[10.5px] font-mono text-zinc-400 font-bold mt-1 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded inline-block w-fit">
                          {tire.width}/{tire.profile} R{tire.rim} {tire.loadIndex}{tire.speedRating}
                        </p>
                      </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl text-center shrink-0">
                      <span className="block text-[8px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-1">Stock Tl.</span>
                      <span className={`text-base font-black ${totalStock === 0 ? 'text-brand-red' : 'text-[#ffb700]'}`}>
                        {totalStock}
                      </span>
                    </div>
                  </div>

                  {/* Redesigned Mobile Core Prices Grid */}
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-1.5">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-1.5">Estructura Tarifaria de Precios</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-bold">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Público:</span>
                        <span className="text-white font-extrabold">${tire.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-l border-zinc-900 pl-3">
                        <span className="text-amber-500">Precio 1 (5%):</span>
                        <span className="text-amber-500 font-extrabold">${p1.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400">Precio 2 (10%):</span>
                        <span className="text-amber-400 font-extrabold">${p2.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-l border-zinc-900 pl-3">
                        <span className="text-[#ffb700]">Revendedor:</span>
                        <span className="text-[#ffb700] font-extrabold">${pRes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Branch inventory values */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {BRANCHES.map(branch => {
                      const stock = tire.stock[branch.id] || 0;
                      return (
                        <div key={branch.id} className={`p-1.5 rounded-lg text-center border ${
                          stock === 0 
                            ? 'bg-zinc-950 border-zinc-950 text-zinc-700' 
                            : stock <= 5 
                              ? 'bg-brand-red/10 border-brand-red/25 text-brand-red' 
                              : 'bg-zinc-900 border-zinc-850 text-white/80'
                        }`}>
                          <p className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter truncate">{branch.name.split(' ')[0]}</p>
                          <p className="text-xs font-black mt-0.5">{stock}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REGISTRATION MODAL FOR NEW PRODUCTS */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card-bg border border-zinc-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="absolute right-6 top-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-zinc-500 hover:text-white bg-black/40 hover:bg-zinc-900 rounded-full border border-zinc-850 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTireSubmit} className="p-8 md:p-10 space-y-8">
                {/* Form header branding */}
                <div className="border-b border-zinc-900 pb-5">
                  <div className="flex items-center gap-2 text-brand-red font-black text-xs uppercase tracking-widest mb-1.5">
                    <Sparkles className="w-4 h-4 text-[#ffb700] animate-pulse" />
                    Módulo de Alta de Inventario
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                    REGISTRAR NUEVA LLANTA EN SUCURSALES
                  </h3>
                  <p className="text-xxs md:text-xs text-text-muted mt-1 uppercase tracking-widest italic font-bold">
                    El neumático registrado se integrará automáticamente al stock general del ERP.
                  </p>
                </div>

                {isSubmitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-zinc-850 space-y-3"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black uppercase text-white tracking-widest">PRODUCTO REGISTRADO</h4>
                    <p className="text-xs text-text-muted uppercase font-bold text-center px-6">El neumático maestro se ha dado de alta exitosamente en la base de datos.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* section 1: basic tire structure */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-2 border-brand-red pl-3 text-xs font-black uppercase text-[#ffb700] tracking-widest">
                        <span>1. INFORMACIÓN BÁSICA DEL FABRICANTE</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Nombre del Producto *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ej. Llanta Firestone Destination LE3 o similar..."
                            value={formData.name}
                            onChange={(e) => setFormData(v => ({ ...v, name: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Marca *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ej. Continental, Goodyear, Michelin..."
                            value={formData.brand}
                            onChange={(e) => setFormData(v => ({ ...v, brand: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white uppercase"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Modelo / Patrón *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Ej. PremiumContact 6, Eagle Sport..."
                            value={formData.model}
                            onChange={(e) => setFormData(v => ({ ...v, model: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white uppercase"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <div className="flex justify-between items-center gap-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Categoría / Terreno *</label>
                            <button
                              type="button"
                              onClick={() => setShowCategoriesModal(true)}
                              className="text-[9px] text-[#ffb700] hover:text-white font-extrabold uppercase tracking-wide transition-colors cursor-pointer"
                            >
                              + Crear Categoría
                            </button>
                          </div>
                          <select 
                            value={formData.type}
                            onChange={(e) => setFormData(v => ({ ...v, type: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white tracking-widest uppercase cursor-pointer"
                          >
                            {categoriesList.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.id} - {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5 md:col-span-3">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Descripción del Producto</label>
                          <textarea 
                            rows={2}
                            placeholder="Ej. Diseño optimizado con sílice premium para tracción excepcional y un viaje silencioso..."
                            value={formData.description}
                            onChange={(e) => setFormData(v => ({ ...v, description: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-medium text-zinc-200 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: dimensions & specifications */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-2 border-brand-red pl-3 text-xs font-black uppercase text-[#ffb700] tracking-widest">
                        <span>2. MEDIDAS Y ESPECIFICACIONES TÉCNICAS</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Ancho (ej. 225) *</label>
                          <input 
                            type="number" 
                            required
                            placeholder="225"
                            value={formData.width}
                            onChange={(e) => setFormData(v => ({ ...v, width: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Perfil % (ej. 45) *</label>
                          <input 
                            type="number" 
                            required
                            placeholder="45"
                            value={formData.profile}
                            onChange={(e) => setFormData(v => ({ ...v, profile: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Rin (R) *</label>
                          <input 
                            type="number" 
                            required
                            placeholder="17"
                            value={formData.rim}
                            onChange={(e) => setFormData(v => ({ ...v, rim: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Índice Carga (ej. 94)</label>
                          <input 
                            type="text" 
                            placeholder="94"
                            value={formData.loadIndex}
                            onChange={(e) => setFormData(v => ({ ...v, loadIndex: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white uppercase"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Velocidad (ej. Y / V)</label>
                          <input 
                            type="text" 
                            placeholder="Y"
                            value={formData.speedRating}
                            onChange={(e) => setFormData(v => ({ ...v, speedRating: e.target.value }))}
                            className="w-full text-xs p-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Cost and Prices Structures */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-2 border-brand-red pl-3 text-xs font-black uppercase text-[#ffb700] tracking-widest">
                        <span>3. ESTRUCTURA DE COMPRAS Y LISTAS DE PRECIOS</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Costo Compra *</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">$</span>
                            <input 
                              type="number" 
                              required
                              placeholder="3100"
                              value={formData.cost}
                              onChange={(e) => setFormData(v => ({ ...v, cost: e.target.value }))}
                              className="w-full text-xs py-3.5 pl-8 pr-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-extrabold text-emerald-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Precio Público Gral *</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">$</span>
                            <input 
                              type="number" 
                              required
                              placeholder="4850"
                              value={formData.price}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(v => ({ ...v, price: val }));
                                if (val) handlePriceSuggest(parseFloat(val));
                              }}
                              className="w-full text-xs py-3.5 pl-8 pr-3.5 bg-black/70 border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-extrabold text-white"
                            />
                          </div>
                        </div>

                        {/* Precio 1 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Precio 1 *</label>
                            <span className="text-[8px] font-black text-zinc-500">Sugerido (95%)</span>
                          </div>
                          <div className="relative border border-amber-500/20 rounded-2xl overflow-hidden">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-550 font-bold text-xs">$</span>
                            <input 
                              type="number" 
                              required
                              placeholder="Sugerido"
                              value={formData.price1}
                              onChange={(e) => setFormData(v => ({ ...v, price1: e.target.value }))}
                              className="w-full text-xs py-3.5 pl-8 pr-3.5 bg-black/70 border-none outline-none focus:ring-1 focus:ring-amber-500 font-extrabold text-amber-550"
                            />
                          </div>
                        </div>

                        {/* Precio 2 */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Precio 2 *</label>
                            <span className="text-[8px] font-black text-zinc-500">Sugerido (90%)</span>
                          </div>
                          <div className="relative border border-amber-400/20 rounded-2xl overflow-hidden">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-450 font-bold text-xs">$</span>
                            <input 
                              type="number" 
                              required
                              placeholder="Sugerido"
                              value={formData.price2}
                              onChange={(e) => setFormData(v => ({ ...v, price2: e.target.value }))}
                              className="w-full text-xs py-3.5 pl-8 pr-3.5 bg-black/70 border-none outline-none focus:ring-1 focus:ring-amber-400 font-extrabold text-amber-450"
                            />
                          </div>
                        </div>

                        {/* Precio Revendedor */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-[#ffb700] tracking-wider">Precio Revendedor *</label>
                            <span className="text-[8px] font-black text-zinc-500 font-mono">Sugerido (85%)</span>
                          </div>
                          <div className="relative border border-[#ffb700]/20 rounded-2xl overflow-hidden">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ffb700] font-bold text-xs">$</span>
                            <input 
                              type="number" 
                              required
                              placeholder="Sugerido"
                              value={formData.priceReseller}
                              onChange={(e) => setFormData(v => ({ ...v, priceReseller: e.target.value }))}
                              className="w-full text-xs py-3.5 pl-8 pr-3.5 bg-black/70 border-none outline-none focus:ring-1 focus:ring-[#ffb700] font-extrabold text-[#ffb700]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Image Picker and Simulator */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-l-2 border-brand-red pl-3">
                        <span className="text-xs font-black uppercase text-[#ffb700] tracking-widest">4. IMAGEN ILUSTRATIVA DEL PRODUCTO</span>
                        <div className="flex bg-black rounded-lg p-0.5 border border-zinc-900">
                          <button
                            type="button"
                            onClick={() => setImageTab('upload')}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              imageTab === 'upload' ? 'bg-[#ffb700] text-black font-black' : 'text-zinc-500 hover:text-white'
                            }`}
                          >
                            Subir Imagen
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageTab('link')}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              imageTab === 'link' ? 'bg-[#ffb700] text-black font-black' : 'text-zinc-500 hover:text-white'
                            }`}
                          >
                            Pegar Enlace
                          </button>
                        </div>
                      </div>

                      <div className="p-5 bg-black/30 rounded-3xl border border-zinc-850">
                        {imageTab === 'upload' ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="col-span-2 space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">Zona de Carga (Drag & Drop o Clic para seleccionar)</label>
                              <div 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    simulateImageUpload(e.dataTransfer.files[0]);
                                  }
                                }}
                                className="border-2 border-dashed border-zinc-800 hover:border-[#ffb700] bg-zinc-950/40 p-6 rounded-2xl transition-all text-center relative group cursor-pointer"
                                onClick={() => document.getElementById('tire-image-file-input')?.click()}
                              >
                                <input 
                                  type="file" 
                                  id="tire-image-file-input" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      simulateImageUpload(e.target.files[0]);
                                    }
                                  }}
                                />
                                <Upload className="w-8 h-8 text-[#ffb700] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black uppercase tracking-wider text-white">Arrastra aquí tu foto de llanta o haz clic</p>
                                <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">Soporta PNG, JPG y WEBP (Compresión local en tiempo real)</p>
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-2xl border border-zinc-900 min-h-24">
                              {isSimulatingUpload ? (
                                <div className="space-y-2 text-center w-full">
                                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto" />
                                  <div className="w-full bg-zinc-900 rounded-full h-1">
                                    <div className="bg-[#ffb700] h-1 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                  </div>
                                  <p className="text-[9px] font-black uppercase tracking-wider text-amber-500 leading-tight">
                                    {uploadProgress}% • {uploadStepDesc}
                                  </p>
                                </div>
                              ) : formData.imageUrl ? (
                                <div className="text-center space-y-2">
                                  <img src={formData.imageUrl} className="w-16 h-16 object-cover rounded-lg border border-zinc-800 mx-auto" referrerPolicy="no-referrer" />
                                  <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-black px-1.5 py-0.5 rounded uppercase tracking-wider block">¡Cargada con Éxito!</span>
                                  <button 
                                    type="button"
                                    onClick={() => setFormData(v => ({ ...v, imageUrl: '' }))} 
                                    className="text-[8px] font-black uppercase tracking-wider text-brand-red hover:underline cursor-pointer block mx-auto mt-1"
                                  >
                                    Eliminar foto
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  type="button" 
                                  onClick={() => simulateImageUpload()}
                                  className="flex flex-col items-center gap-1.5 p-3.5 hover:bg-zinc-900 transition-all text-zinc-400 hover:text-white rounded-xl text-center cursor-pointer w-full"
                                >
                                  <Sparkles className="w-5 h-5 text-[#ffb700]" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">Foto de Stock (Demo)</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="col-span-2 space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">Enlace Directo de la Imagen (URL)</label>
                              <input 
                                type="text" 
                                placeholder="https://ejemplo.com/imagenes/mi-llanta.jpg"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData(v => ({ ...v, imageUrl: e.target.value }))}
                                className="w-full text-xs p-3.5 bg-zinc-950 border border-zinc-900 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white text-clip"
                              />
                              <p className="text-[9px] text-[#ffb700] font-bold uppercase leading-relaxed">
                                💡 Introduce la dirección URL directa hacia cualquier imagen web pública. Se mostrará en tiempo real en los listados y comprobantes.
                              </p>
                            </div>

                            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950 rounded-2xl border border-zinc-900 min-h-24">
                              {formData.imageUrl ? (
                                <div className="text-center space-y-2">
                                  <img 
                                    src={formData.imageUrl} 
                                    onError={(e) => {
                                      // Fallback on broken image link
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400';
                                    }}
                                    className="w-16 h-16 object-cover rounded-lg border border-zinc-800 mx-auto" 
                                    referrerPolicy="no-referrer" 
                                  />
                                  <span className="text-[8px] bg-sky-500/10 border border-sky-500/20 text-sky-450 font-black px-1.5 py-0.5 rounded uppercase tracking-wider block">Vista Previa Link</span>
                                </div>
                              ) : (
                                <div className="text-center text-zinc-500 p-2 space-y-1">
                                  <ImageIcon className="w-5 h-5 mx-auto opacity-40 text-white" />
                                  <p className="text-[8px] font-bold uppercase tracking-widest leading-normal">Sin Enlace</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 5: Initial stock initialization */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-l-2 border-brand-red pl-3 text-xs font-black uppercase text-[#ffb700] tracking-widest">
                        <span>5. CARGA DE STOCK INICIAL (DISTRIBUCIÓN EN SUCURSALES)</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {BRANCHES.map(branch => {
                          const stateKey = branch.id === 'matriz' ? 'stockMatriz' 
                                        : branch.id === 'norte' ? 'stockNorte'
                                        : branch.id === 'sur' ? 'stockSur'
                                        : branch.id === 'oriente' ? 'stockOriente'
                                        : 'stockPoniente';

                          return (
                            <div key={branch.id} className="space-y-1.5 p-3.5 bg-zinc-950 border border-zinc-900 rounded-2xl">
                              <label className="text-[9px] font-black uppercase text-[#ffb700] tracking-wide block truncate">{branch.name.toUpperCase()}</label>
                              <span className="text-[7px] text-zinc-500 uppercase font-bold block mb-1">UNIDADES EN SUCURSAL</span>
                              <input 
                                type="number" 
                                min="0"
                                value={(formData as any)[stateKey]}
                                onChange={(e) => setFormData(v => ({ ...v, [stateKey]: e.target.value }))}
                                className="w-full text-xs p-2 bg-black border border-zinc-800 rounded-xl outline-none focus:border-[#ffb700] font-black text-center text-white"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit footer button */}
                    <div className="flex gap-3 pt-4 border-t border-zinc-900">
                      <button 
                        type="button" 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 py-4 bg-brand-red text-white flex items-center justify-center gap-2 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-brand-red/10 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#ffb700]" />
                        Confirmar y Registrar Producto
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Modal: Categorías */}
        {showCategoriesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#0a0a0a] border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-black">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-[#ffb700]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-black tracking-wider uppercase text-white">Administrador de Categorías</h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Altas, Bajas y Clasificación de Productos</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowCategoriesModal(false);
                    setCategoryError('');
                    setCategorySuccess(false);
                  }}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body split in columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
                
                {/* Column 1: Alta de Categoría */}
                <div className="md:col-span-5 space-y-4">
                  <div className="border-l-2 border-[#ffb700] pl-3">
                    <h4 className="text-[11px] font-black uppercase text-white tracking-widest">Crear Nueva Categoría</h4>
                    <p className="text-[9px] text-zinc-500 uppercase font-semibold">Introduce los detalles de clasificación</p>
                  </div>

                  <form onSubmit={handleAddCategorySubmit} className="space-y-4">
                    {categoryError && (
                      <div className="p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl text-[10px] font-black uppercase tracking-wide">
                        ⚠️ Err: {categoryError}
                      </div>
                    )}

                    {categorySuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wide flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ¡Categoría registrada con éxito!
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Código / ID *</label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Ej. PASS, AGR, COM"
                        value={newCategoryData.id}
                        onChange={(e) => {
                          setCategoryError('');
                          setNewCategoryData(v => ({ ...v, id: e.target.value.slice(0, 6).toUpperCase() }));
                        }}
                        className="w-full text-xs p-3.5 bg-black border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-black text-white uppercase tracking-widest placeholder:tracking-normal placeholder:font-medium"
                      />
                      <span className="text-[8px] text-zinc-500 font-medium block">Formato corto alfanumérico (máximo 6 letras).</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Nombre de la Categoría *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ej. Pasajero, Agrícola, Comercial"
                        value={newCategoryData.name}
                        onChange={(e) => {
                          setCategoryError('');
                          setNewCategoryData(v => ({ ...v, name: e.target.value }));
                        }}
                        className="w-full text-xs p-3.5 bg-black border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-bold text-white uppercase"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Descripción Breve</label>
                      <textarea 
                        rows={2}
                        placeholder="Ej. Neumáticos para vehículos familiares y sedan..."
                        value={newCategoryData.description}
                        onChange={(e) => setNewCategoryData(v => ({ ...v, description: e.target.value }))}
                        className="w-full text-xs p-3.5 bg-black border border-zinc-800 rounded-2xl outline-none focus:border-[#ffb700] font-medium text-zinc-300 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#ffb700] hover:bg-white text-black font-black uppercase tracking-widest rounded-2xl text-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ffb700]/10"
                    >
                      <Plus className="w-4 h-4 text-black" /> Registrar de Alta
                    </button>
                  </form>
                </div>

                {/* Column 2: Ver Categorías Existentes */}
                <div className="md:col-span-7 space-y-4">
                  <div className="border-l-2 border-zinc-800 pl-3">
                    <h4 className="text-[11px] font-black uppercase text-white tracking-widest">Catálogo de Categorías Activas ({categoriesList.length})</h4>
                    <p className="text-[9px] text-zinc-500 uppercase font-semibold">Lista maestra grabada en el sistema</p>
                  </div>

                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {categoriesList.map(cat => {
                      const isBase = ['HT', 'AT', 'MT'].includes(cat.id.toUpperCase());

                      return (
                        <div 
                          key={cat.id} 
                          className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-start justify-between gap-4 transition-all hover:border-zinc-800"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-850 rounded font-mono font-black text-[10px] text-[#ffb700] uppercase tracking-wider">
                                {cat.id}
                              </span>
                              <span className="text-xs font-extrabold text-white uppercase">{cat.name}</span>
                              {isBase && (
                                <span className="text-[7px] text-zinc-550 bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded font-black uppercase tracking-wider">
                                  Sistema / Núcleo
                                </span>
                              )}
                            </div>
                            {cat.description && (
                              <p className="text-[9.5px] text-zinc-400 font-medium leading-relaxed">{cat.description}</p>
                            )}
                          </div>

                          {!isBase && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-[9px] bg-brand-red/10 text-brand-red border border-brand-red/15 hover:bg-brand-red hover:text-white hover:border-brand-red px-2 py-1.5 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer"
                              title="Eliminar categoría"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-zinc-950/50 border border-zinc-900/50 rounded-xl text-[8.5px] text-zinc-500 font-medium leading-relaxed">
                    ℹ️ <span className="font-bold text-zinc-400">Nota técnica de Supabase:</span> Las nuevas categorías dadas de alta aquí quedan registradas localmente en la caché de Supabase sincronizada por el navegador (`localStorage`) y son mapeadas en tiempo real para todos los flujos de cotizaciones, notas de venta y control de Inventario Maestro.
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-900 bg-black flex justify-end">
                <button 
                  onClick={() => {
                    setShowCategoriesModal(false);
                    setCategoryError('');
                    setCategorySuccess(false);
                  }}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Cerrar Administrador
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Purchase/Replenish Modal Overlay */}
      <AnimatePresence>
        {showPurchaseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-900 rounded-[2rem] w-full max-w-lg p-6 relative overflow-hidden shadow-2xl space-y-5 text-white animate-scaleUp"
            >
              {/* Close button */}
              <div className="absolute right-4 top-4">
                <button 
                  onClick={() => setShowPurchaseModal(false)}
                  className="p-1.5 text-zinc-500 hover:text-white bg-black hover:bg-zinc-900 border border-zinc-850 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title group */}
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#ffb700]" />
                  Módulo de Compras ERP
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Registrar Compra / Entrada de Stock</h3>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wide leading-relaxed mt-1">
                  Abastecimiento de bodega. Al confirmar esta entrada, se incrementará el inventario del neumático seleccionado en la sucursal asignada de forma inmediata.
                </p>
              </div>

              {purchaseSuccess ? (
                <div className="py-8 text-center text-emerald-400 font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                  Entrada de inventario guardada y propagada con éxito
                </div>
              ) : (
                <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                  
                  {/* Product Specification Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">Buscar / Seleccionar Neumático</label>
                    <select
                      required
                      value={purchaseData.productId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const tire = tiresList.find(t => t.id === pid);
                        setPurchaseData(prev => ({ 
                          ...prev, 
                          productId: pid,
                          cost: tire ? tire.cost.toString() : ''
                        }));
                      }}
                      className="w-full text-xs p-3 bg-black border border-zinc-900 rounded-xl font-bold text-white outline-none focus:border-[#ffb750] transition-colors"
                    >
                      <option value="">-- SELECCIONAR PRODUCTO --</option>
                      {tiresList.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.brand.toUpperCase()} {t.model} ({t.width}/{t.profile} R{t.rim}) - Costo Actual: ${t.cost.toLocaleString()} MXN
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Branch Destination representing where purchase arrives */}
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Sucursal Destino</label>
                      <select
                        required
                        value={purchaseData.branchId}
                        onChange={(e) => setPurchaseData(v => ({ ...v, branchId: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-900 rounded-xl font-bold text-[#ffb700] outline-none focus:border-[#ffb700]"
                      >
                        {BRANCHES.map(b => (
                          <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity added */}
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Cantidad comprada (PZS)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={purchaseData.quantity}
                        onChange={(e) => setPurchaseData(v => ({ ...v, quantity: Math.max(1, parseInt(e.target.value) || 0).toString() }))}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-900 rounded-xl font-extrabold text-white outline-none focus:border-[#ffb750]"
                        placeholder="Ej. 12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Cost of purchase u. */}
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Costo Unitario de Compra ($ MXN)</label>
                      <input
                        type="number"
                        min={1}
                        value={purchaseData.cost}
                        onChange={(e) => setPurchaseData(v => ({ ...v, cost: Math.max(1, parseFloat(e.target.value) || 0).toString() }))}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-900 rounded-xl font-mono text-emerald-400 font-bold outline-none focus:border-[#ffb750]"
                        placeholder="Ej. 1200"
                      />
                    </div>

                    {/* Invoice ID / Reference description */}
                    <div>
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block mb-1">Factura / Referencia</label>
                      <input
                        type="text"
                        value={purchaseData.invoiceId}
                        onChange={(e) => setPurchaseData(v => ({ ...v, invoiceId: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-black border border-zinc-900 rounded-xl text-white font-bold outline-none focus:border-[#ffb750]"
                        placeholder="Ej. F-9932"
                      />
                    </div>
                  </div>

                  {/* Supplier details */}
                  <div>
                    <label className="text-[9px] font-black text-[#ffb700] uppercase tracking-wider block mb-1">Proveedor Autorizado</label>
                    <input
                      type="text"
                      value={purchaseData.supplier}
                      onChange={(e) => setPurchaseData(v => ({ ...v, supplier: e.target.value }))}
                      className="w-full text-xs p-2.5 bg-black border border-zinc-900 rounded-xl text-white font-bold outline-none focus:border-[#ffb750]"
                      placeholder="Ej. Michelin México S.A. de C.V."
                    />
                  </div>

                  {/* Submit actions */}
                  <div className="flex gap-2.5 justify-end pt-3 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => setShowPurchaseModal(false)}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-850 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-brand-red text-white hover:opacity-90 active:scale-95 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-brand-red/10 cursor-pointer"
                    >
                      Aplicar Entrada Stock
                    </button>
                  </div>

                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
