export type UserRole = 'superadmin' | 'contador' | 'vendedor' | 'secretaria_facturista' | 'credito_cobranza';

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
}

export const USERS: User[] = [
  { id: 'u1', name: 'Manuel Esparza', role: 'superadmin', branchId: 'all', email: 'manuel_esparza@multillantas.com', password: '123_esparza' },
  { id: 'u2_1', name: 'Manuel Villaseñor', role: 'vendedor', branchId: 'norte', email: 'manuel_villasenor@multillantas.com', password: '123_vendedor' },
  { id: 'u2_2', name: 'Manuel Villaseñor', role: 'vendedor', branchId: 'norte', email: 'manuel:villasenor@multillantas.com', password: '123_vendedor' }, // support literal colon typo from prompt
  { id: 'u3', name: 'Liliana Medina', role: 'contador', branchId: 'matriz', email: 'liliana_medina@multillantas.com', password: '123_contador' },
  { id: 'u4', name: 'Mario Vargas', role: 'vendedor', branchId: 'matriz', email: 'mario_vargas@multillantas.com', password: '123_vendedor' },
  { id: 'u5', name: 'Magdalena López', role: 'secretaria_facturista', branchId: 'matriz', email: 'magdalena_lopez@multillantas.com', password: '123_facturista' },
  { id: 'u6', name: 'Cristian Esparza', role: 'vendedor', branchId: 'oriente', email: 'cristian_esparza@multillantas.com', password: '123_vendedor' },
  { id: 'u7', name: 'Misael Esparza', role: 'credito_cobranza', branchId: 'poniente', email: 'misael_esparza@multillantas.com', password: '123_credito' },
  { id: 'u8', name: 'Alfredo Esparza', role: 'vendedor', branchId: 'sur', email: 'alfredo_esparza@miltillantas.com', password: '123_vendedor' }
];

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

export interface Tire {
  id: string;
  brand: string;
  model: string;
  width: number;
  profile: number;
  rim: number;
  loadIndex: string;
  speedRating: string;
  type: 'AT' | 'HT' | 'MT';
  price: number;
  cost: number;
  stock: Record<string, number>; // branchId -> quantity
  lastMovement: string; // ISO Date for rotation analysis
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
    stock: { matriz: 24, norte: 12, sur: 45 }, lastMovement: '2024-05-13',
  },
  {
    id: '2', brand: 'Michelin', model: 'Defender LTX M/S', width: 265, profile: 70, rim: 17,
    loadIndex: '115', speedRating: 'T', type: 'HT', price: 5200, cost: 3600,
    stock: { matriz: 15, norte: 15, sur: 8 }, lastMovement: '2024-05-12',
  },
  {
    id: '3', brand: 'BFGoodrich', model: 'All-Terrain KO2', width: 285, profile: 75, rim: 16,
    loadIndex: '121', speedRating: 'R', type: 'AT', price: 6100, cost: 4400,
    stock: { matriz: 30, norte: 25, sur: 20 }, lastMovement: '2024-05-13',
  },
  {
    id: '4', brand: 'BFGoodrich', model: 'Mud-Terrain KM3', width: 315, profile: 70, rim: 17,
    loadIndex: '121', speedRating: 'Q', type: 'MT', price: 7200, cost: 5100,
    stock: { matriz: 5, norte: 5, sur: 30 }, lastMovement: '2024-05-09',
  },
  {
    id: '5', brand: 'Michelin', model: 'Primacy 4', width: 205, profile: 55, rim: 16,
    loadIndex: '91', speedRating: 'V', type: 'HT', price: 3100, cost: 2100,
    stock: { matriz: 5, norte: 18, sur: 12 }, lastMovement: '2024-05-13',
  },
  {
    id: '6', brand: 'Michelin', model: 'Ltx Trail', width: 265, profile: 65, rim: 17,
    loadIndex: '112', speedRating: 'H', type: 'AT', price: 4300, cost: 2950,
    stock: { matriz: 12, norte: 12, sur: 15 }, lastMovement: '2024-04-15',
  },
  {
    id: '7', brand: 'BFGoodrich', model: 'Advantage Control', width: 215, profile: 55, rim: 17,
    loadIndex: '94', speedRating: 'V', type: 'HT', price: 3400, cost: 2100,
    stock: { matriz: 20, norte: 8, sur: 10 }, lastMovement: '2024-05-10',
  },
];

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
