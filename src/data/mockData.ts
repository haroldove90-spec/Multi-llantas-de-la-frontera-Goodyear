export type UserRole = 'superadmin' | 'contador' | 'vendedor' | 'secretaria_facturista' | 'credito_cobranza' | 'tecnico' | 'cliente';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  branchId: string | 'all'; // 'all' for superadmin
  email: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  branchId: string | 'all'; // 'all' for superadmin
  email: string;
  password?: string;
  phone?: string;
}

export const USERS: User[] = [
  { id: 'u0', name: 'Harold Anguiano', role: 'superadmin', branchId: 'all', email: 'harold_anguiano@multillanta.com', password: '123_harold', phone: '899-111-2222' },
  { id: 'u0_alt', name: 'Harold Anguiano', role: 'superadmin', branchId: 'all', email: 'harold_anguiano@multillantas.com', password: '123_harold', phone: '899-111-2222' },
  { id: 'u1', name: 'Manuel Esparza', role: 'superadmin', branchId: 'all', email: 'manuel_esparza@multillantas.com', password: '123_esparza', phone: '899-333-4444' },
  { id: 'u2_1', name: 'Manuel Villaseñor', role: 'vendedor', branchId: 'norte', email: 'manuel_villasenor@multillantas.com', password: '123_vendedor', phone: '899-555-6666' },
  { id: 'u2_2', name: 'Manuel Villaseñor', role: 'vendedor', branchId: 'norte', email: 'manuel:villasenor@multillantas.com', password: '123_vendedor', phone: '899-555-6666' }, // support literal colon typo from prompt
  { id: 'u3', name: 'Liliana Medina', role: 'contador', branchId: 'matriz', email: 'liliana_medina@multillantas.com', password: '123_contador', phone: '899-123-4567' },
  { id: 'u4', name: 'Mario Vargas', role: 'vendedor', branchId: 'matriz', email: 'mario_vargas@multillantas.com', password: '123_vendedor', phone: '899-888-9999' },
  { id: 'u5', name: 'Magdalena López', role: 'secretaria_facturista', branchId: 'matriz', email: 'magdalena_lopez@multillantas.com', password: '123_facturista', phone: '899-111-3333' },
  { id: 'u6', name: 'Cristian Esparza', role: 'vendedor', branchId: 'oriente', email: 'cristian_esparza@multillantas.com', password: '123_vendedor', phone: '899-444-5555' },
  { id: 'u7', name: 'Misael Esparza', role: 'credito_cobranza', branchId: 'poniente', email: 'misael_esparza@multillantas.com', password: '123_credito', phone: '899-666-7777' },
  { id: 'u8', name: 'Alfredo Esparza', role: 'vendedor', branchId: 'sur', email: 'alfredo_esparza@miltillantas.com', password: '123_vendedor', phone: '899-222-8888' },
  { id: 'u_tecnico', name: 'Jaime López (Técnico)', role: 'tecnico', branchId: 'matriz', email: 'jaime_tecnico@multillantas.com', password: '123_tecnico', phone: '899-777-8888' },
  { id: 'u_cliente', name: 'Páginas y Talleres Regios (Cliente)', role: 'cliente', branchId: 'matriz', email: 'cliente_vip@gmail.com', password: '123_cliente', phone: '81-9999-0000' }
];

export function getActiveEmployees(): User[] {
  if (typeof window === 'undefined') return USERS;
  const saved = localStorage.getItem('erp_employees_custom');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  // Initialize with USERS if not set details and return
  try {
    localStorage.setItem('erp_employees_custom', JSON.stringify(USERS));
  } catch (e) {
    console.error(e);
  }
  return USERS;
}

export function saveActiveEmployees(employeesList: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('erp_employees_custom', JSON.stringify(employeesList));
  
  // Backward compatibility with legacy storage keys
  const staticIds = USERS.map(u => u.id);
  const dynamicOnly = employeesList.filter(emp => !staticIds.includes(emp.id));
  localStorage.setItem('erp_added_employees', JSON.stringify(dynamicOnly));
  
  window.dispatchEvent(new CustomEvent('erp_employees_updated', { detail: employeesList }));
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  phone: string;
  schedule: string;
}

export interface BranchSummary {
  branchId: string;
  dailySales: number;
  lowStockCount: number;
  employeeCount: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'HT', name: 'Highway Terrain (Carretera)', description: 'Neumáticos diseñados para autopistas y conducción diaria en asfalto.' },
  { id: 'AT', name: 'All Terrain (Todo Terreno)', description: 'Neumáticos versátiles para carretera pavimentada y terracería ligera.' },
  { id: 'MT', name: 'Mud Terrain (Lodo/Aventura)', description: 'Neumáticos de tacos profundos especializados para off-road extremo y lodo.' },
];

export interface Tire {
  id: string;
  brand: string;
  model: string;
  name?: string; // Nombre del producto
  description?: string; // Descripción
  width: number;
  profile: number;
  rim: number;
  loadIndex: string;
  speedRating: string;
  type: string; // ID de Categoría dinámica (anteriormente estrictamente 'AT'|'HT'|'MT')
  price: number;
  cost: number;
  price1?: number; // Precio 1
  price2?: number; // Precio 2
  priceReseller?: number; // Precio revendedor
  imageUrl?: string; // Imagen del producto (simulado por el momento)
  stock: Record<string, number>; // branchId -> quantity
  lastMovement: string; // ISO Date for rotation analysis
  barcode?: string; // Código de barras o QR EAN/UPC para el escaneo móvil PWA
}

export interface MovementLog {
  id: string;
  userName: string;
  userRole: string;
  productId: string;
  productDetails: string;
  type: 'entrada' | 'salida' | 'traspaso' | 'ajuste' | 'venta';
  sourceBranchId: string;
  sourceBranchName: string;
  destBranchId: string;
  destBranchName: string;
  qty: number;
  date: string; // Exact ISO or readable timestamp
  reason: string;
}

export function getMovementLogs(): MovementLog[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('erp_movement_logs');
  return saved ? JSON.parse(saved) : [];
}

export function saveMovementLogs(logs: MovementLog[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('erp_movement_logs', JSON.stringify(logs));
  window.dispatchEvent(new CustomEvent('erp-movements-updated', { detail: logs }));
}

export function logTireMovement(log: Omit<MovementLog, 'id' | 'date'>) {
  const currentLogs = getMovementLogs();
  const newLog: MovementLog = {
    ...log,
    id: 'M-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 10),
    date: new Date().toISOString()
  };
  const updated = [newLog, ...currentLogs];
  saveMovementLogs(updated);
}

export interface Transfer {
  id: string;
  originBranchId: string;
  destinationBranchId: string;
  productId: string;
  quantity: number;
  status: 'En tránsito' | 'Recibido' | 'Cancelado';
  date: string;
}

export interface Warranty {
  id: string;
  dot: string;
  productId: string;
  mileage: number;
  reason: string;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';
  date: string;
  photoUrl?: string;
  diagnosis?: string;
}

export interface Sale {
  id: string;
  branchId: string;
  sellerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  tax: number;
  paymentMethod: 'PUE' | 'PPD';
  paymentForm: '01' | '03' | '31' | '99'; // Efectivo, Transferencia, Intermediario, Por definir
  status: 'Timbrada' | 'Pendiente' | 'Cancelada' | 'CRP Generado';
  cfdiUsage: string;
  rfcRecuper: string;
  date: string;
}

export const BRANCHES: Branch[] = [
  { 
    id: 'matriz', 
    name: 'Helios', 
    location: 'Av. Constitución 450, Monterrey, NL',
    manager: 'Ing. Ricardo Salgado',
    phone: '81 8345 6789',
    schedule: 'Lun-Vie 8:00 - 19:00, Sab 9:00 - 14:00'
  },
  { 
    id: 'norte', 
    name: 'San Andres', 
    location: 'Blvd. Manuel Ávila Camacho 23, CDMX',
    manager: 'Lic. Martha Ruiz',
    phone: '55 5234 5678',
    schedule: 'Lun-Vie 9:00 - 18:00, Sab 9:00 - 15:00'
  },
  { 
    id: 'sur', 
    name: 'Industrial', 
    location: 'Prolongación Montejo 12, Mérida, YUC',
    manager: 'C.P. Julian Cantón',
    phone: '999 923 4567',
    schedule: 'Lun-Vie 8:00 - 18:00, Sab 8:00 - 13:00'
  },
  { 
    id: 'oriente', 
    name: 'Oriente', 
    location: 'Av. Oriente 102, Veracruz, VER',
    manager: 'Ing. Misael Esparza',
    phone: '229 934 5678',
    schedule: 'Lun-Vie 8:00 - 18:00, Sab 8:00 - 14:00'
  },
  { 
    id: 'poniente', 
    name: 'Poniente', 
    location: 'Av. Poniente 870, Guadalajara, JAL',
    manager: 'Alfredo Esparza',
    phone: '333 456 7890',
    schedule: 'Lun-Vie 9:00 - 19:00, Sab 9:00 - 15:00'
  }
];

export const BRANCH_SUMMARIES: BranchSummary[] = [
  { branchId: 'matriz', dailySales: 15450, lowStockCount: 5, employeeCount: 12 },
  { branchId: 'norte', dailySales: 8200, lowStockCount: 2, employeeCount: 8 },
  { branchId: 'sur', dailySales: 12100, lowStockCount: 12, employeeCount: 10 },
  { branchId: 'oriente', dailySales: 6500, lowStockCount: 3, employeeCount: 6 },
  { branchId: 'poniente', dailySales: 9400, lowStockCount: 4, employeeCount: 7 },
];

export const TIRES: Tire[] = [
  {
    id: '1', brand: 'Michelin', model: 'Pilot Sport 4', width: 225, profile: 45, rim: 17,
    loadIndex: '94', speedRating: 'Y', type: 'HT', price: 4850, cost: 3100,
    price1: 4600, price2: 4400, priceReseller: 4125,
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 24, norte: 12, sur: 45 }, lastMovement: '2024-05-13',
    barcode: '750100011101'
  },
  {
    id: '2', brand: 'Michelin', model: 'Defender LTX M/S', width: 265, profile: 70, rim: 17,
    loadIndex: '115', speedRating: 'T', type: 'HT', price: 5200, cost: 3600,
    price1: 4940, price2: 4680, priceReseller: 4420,
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 15, norte: 15, sur: 8 }, lastMovement: '2024-05-12',
    barcode: '750100011102'
  },
  {
    id: '3', brand: 'BFGoodrich', model: 'All-Terrain KO2', width: 285, profile: 75, rim: 16,
    loadIndex: '121', speedRating: 'R', type: 'AT', price: 6100, cost: 4400,
    price1: 5795, price2: 5490, priceReseller: 5185,
    imageUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 30, norte: 25, sur: 20 }, lastMovement: '2024-05-13',
    barcode: '750100011103'
  },
  {
    id: '4', brand: 'BFGoodrich', model: 'Mud-Terrain KM3', width: 315, profile: 70, rim: 17,
    loadIndex: '121', speedRating: 'Q', type: 'MT', price: 7200, cost: 5100,
    price1: 6840, price2: 6480, priceReseller: 6120,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 5, norte: 5, sur: 30 }, lastMovement: '2024-05-09',
    barcode: '750100011104'
  },
  {
    id: '5', brand: 'Michelin', model: 'Primacy 4', width: 205, profile: 55, rim: 16,
    loadIndex: '91', speedRating: 'V', type: 'HT', price: 3100, cost: 2100,
    price1: 2945, price2: 2790, priceReseller: 2635,
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 5, norte: 18, sur: 12 }, lastMovement: '2024-05-13',
    barcode: '750100011105'
  },
  {
    id: '6', brand: 'Michelin', model: 'Ltx Trail', width: 265, profile: 65, rim: 17,
    loadIndex: '112', speedRating: 'H', type: 'AT', price: 4300, cost: 2950,
    price1: 4085, price2: 3870, priceReseller: 3655,
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 12, norte: 12, sur: 15 }, lastMovement: '2024-04-15',
    barcode: '750100011106'
  },
  {
    id: '7', brand: 'BFGoodrich', model: 'Advantage Control', width: 215, profile: 55, rim: 17,
    loadIndex: '94', speedRating: 'V', type: 'HT', price: 3400, cost: 2100,
    price1: 3230, price2: 3060, priceReseller: 2890,
    imageUrl: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400&auto=format&fit=crop&q=60',
    stock: { matriz: 20, norte: 8, sur: 10 }, lastMovement: '2024-05-10',
    barcode: '750100011107'
  },
];

// load from storage at initialization
const ensureMinimumStock = (tires: Tire[]) => {
  tires.forEach(tire => {
    if (!tire.stock) {
      tire.stock = {};
    }
    const branchKeys = ['matriz', 'norte', 'sur', 'oriente', 'poniente', 'frontera'];
    branchKeys.forEach(br => {
      if (tire.stock[br] === undefined) {
        tire.stock[br] = 15; // Ofrece un stock razonable inicial si no está definido
      }
    });
  });
};

const loadPersistedTires = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_tires');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          TIRES.length = 0;
          TIRES.push(...parsed);
        }
      } catch (e) {
        console.error('Failed to load persisted tires:', e);
      }
    }
  }
  ensureMinimumStock(TIRES);
};
loadPersistedTires();

export const updateTiresStorage = (newTires: Tire[]) => {
  ensureMinimumStock(newTires);
  TIRES.length = 0;
  TIRES.push(...newTires);
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_tires', JSON.stringify(TIRES));
    // Dispatch a custom event to notify other mounted components in the tab
    window.dispatchEvent(new CustomEvent('erp-tires-updated', { detail: TIRES }));
  }
};

const loadPersistedCategories = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          CATEGORIES.length = 0;
          CATEGORIES.push(...parsed);
        }
      } catch (e) {
        console.error('Failed to load persisted categories:', e);
      }
    }
  }
};
loadPersistedCategories();

export const updateCategoriesStorage = (newCategories: Category[]) => {
  CATEGORIES.length = 0;
  CATEGORIES.push(...newCategories);
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_categories', JSON.stringify(CATEGORIES));
    window.dispatchEvent(new CustomEvent('erp-categories-updated', { detail: CATEGORIES }));
  }
};

export const TRANSFERS: Transfer[] = [
  {
    id: 'T-1001',
    originBranchId: 'matriz',
    destinationBranchId: 'sur',
    productId: '1',
    quantity: 10,
    status: 'En tránsito',
    date: '2024-05-12',
  },
];

const loadPersistedTransfers = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_transfers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          TRANSFERS.length = 0;
          TRANSFERS.push(...parsed);
        }
      } catch (e) {
        console.error('Failed to load persisted transfers:', e);
      }
    }
  }
};
loadPersistedTransfers();

export const updateTransfersStorage = (newTransfers: Transfer[]) => {
  TRANSFERS.length = 0;
  TRANSFERS.push(...newTransfers);
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_transfers', JSON.stringify(TRANSFERS));
    window.dispatchEvent(new CustomEvent('erp-transfers-updated', { detail: TRANSFERS }));
  }
};

export const SALES: Sale[] = [
  {
    id: 'V-2001', branchId: 'matriz', sellerId: 'Pedro Rdz',
    items: [{ productId: '1', quantity: 4, price: 4850 }],
    total: 22504, tax: 3104, paymentMethod: 'PUE', paymentForm: '03', status: 'Timbrada',
    cfdiUsage: 'G01', rfcRecuper: 'XAXX010101000', date: '2024-05-13',
  },
];

export const WARRANTIES: Warranty[] = [
  {
    id: 'G-001', dot: 'DOT 4B12 3456 0823', productId: '4', mileage: 12000,
    reason: 'Separación de capas en banda de rodamiento.',
    status: 'Pendiente', date: '2024-05-10',
    photoUrl: 'https://images.unsplash.com/photo-1578844541663-b7394e938aad?w=400&q=80',
    diagnosis: 'En espera de inspección por perito técnico de Michelin.'
  },
];
