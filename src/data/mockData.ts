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
    name: 'Matriz - Monterrey', 
    location: 'Av. Constitución 450, Monterrey, NL',
    manager: 'Ing. Ricardo Salgado',
    phone: '81 8345 6789',
    schedule: 'Lun-Vie 8:00 - 19:00, Sab 9:00 - 14:00'
  },
  { 
    id: 'poniente', 
    name: 'Sucursal Poniente', 
    location: 'Blvd. Manuel Ávila Camacho 23, CDMX',
    manager: 'Lic. Martha Ruiz',
    phone: '55 5234 5678',
    schedule: 'Lun-Vie 9:00 - 18:00, Sab 9:00 - 15:00'
  },
  { 
    id: 'sur', 
    name: 'Sucursal Sur', 
    location: 'Prolongación Montejo 12, Mérida, YUC',
    manager: 'C.P. Julian Cantón',
    phone: '999 923 4567',
    schedule: 'Lun-Vie 8:00 - 18:00, Sab 8:00 - 13:00'
  },
];

export const BRANCH_SUMMARIES: BranchSummary[] = [
  { branchId: 'matriz', dailySales: 15450, lowStockCount: 5, employeeCount: 12 },
  { branchId: 'poniente', dailySales: 8200, lowStockCount: 2, employeeCount: 8 },
  { branchId: 'sur', dailySales: 12100, lowStockCount: 12, employeeCount: 10 },
];

export const TIRES: Tire[] = [
  {
    id: '1', brand: 'Michelin', model: 'Pilot Sport 4', width: 225, profile: 45, rim: 17,
    loadIndex: '94', speedRating: 'Y', type: 'HT', price: 4850, cost: 3100,
    stock: { matriz: 24, poniente: 12, sur: 45 }, lastMovement: '2024-05-13',
  },
  {
    id: '2', brand: 'Pirelli', model: 'P Zero', width: 245, profile: 40, rim: 19,
    loadIndex: '98', speedRating: 'Y', type: 'HT', price: 5900, cost: 4200,
    stock: { matriz: 10, poniente: 15, sur: 8 }, lastMovement: '2024-05-12',
  },
  {
    id: '3', brand: 'Bridgestone', model: 'Turanza T005', width: 215, profile: 55, rim: 17,
    loadIndex: '94', speedRating: 'V', type: 'HT', price: 3400, cost: 2100,
    stock: { matriz: 30, poniente: 25, sur: 20 }, lastMovement: '2024-05-13',
  },
  {
    id: '4', brand: 'Michelin', model: 'Defender LTX', width: 265, profile: 70, rim: 17,
    loadIndex: '115', speedRating: 'T', type: 'HT', price: 5200, cost: 3600,
    stock: { matriz: 15, poniente: 5, sur: 30 }, lastMovement: '2024-05-09',
  },
  {
    id: '5', brand: 'BFGoodrich', model: 'All-Terrain KO2', width: 285, profile: 75, rim: 16,
    loadIndex: '121', speedRating: 'R', type: 'AT', price: 6100, cost: 4400,
    stock: { matriz: 5, poniente: 18, sur: 12 }, lastMovement: '2024-05-13',
  },
  {
    id: '6', brand: 'Continental', model: 'ExtremeContact', width: 235, profile: 40, rim: 18,
    loadIndex: '95', speedRating: 'Y', type: 'HT', price: 4100, cost: 2800,
    stock: { matriz: 12, poniente: 12, sur: 15 }, lastMovement: '2024-04-15', // Slow rotation
  },
  {
    id: '7', brand: 'Yokohama', model: 'Geolandar G015', width: 265, profile: 65, rim: 17,
    loadIndex: '112', speedRating: 'H', type: 'AT', price: 4300, cost: 2950,
    stock: { matriz: 20, poniente: 8, sur: 10 }, lastMovement: '2024-05-10',
  },
  {
    id: '8', brand: 'Hankook', model: 'Dynapro MT2', width: 315, profile: 70, rim: 17,
    loadIndex: '121', speedRating: 'Q', type: 'MT', price: 7200, cost: 5100,
    stock: { matriz: 4, poniente: 2, sur: 8 }, lastMovement: '2024-05-11',
  },
  {
    id: '9', brand: 'Goodyear', model: 'Wrangler Duratrac', width: 275, profile: 65, rim: 18,
    loadIndex: '115', speedRating: 'Q', type: 'AT', price: 5800, cost: 4100,
    stock: { matriz: 15, poniente: 10, sur: 5 }, lastMovement: '2024-05-01',
  },
  {
    id: '10', brand: 'Pirelli', model: 'Scorpion Verde', width: 235, profile: 60, rim: 18,
    loadIndex: '103', speedRating: 'V', type: 'HT', price: 4600, cost: 3200,
    stock: { matriz: 8, poniente: 20, sur: 12 }, lastMovement: '2024-05-05',
  },
  {
    id: '11', brand: 'Bridgestone', model: 'Potenza Sport', width: 245, profile: 35, rim: 19,
    loadIndex: '93', speedRating: 'Y', type: 'HT', price: 6500, cost: 4700,
    stock: { matriz: 6, poniente: 4, sur: 2 }, lastMovement: '2024-05-01',
  },
  {
    id: '12', brand: 'Michelin', model: 'Primacy 4', width: 205, profile: 55, rim: 16,
    loadIndex: '91', speedRating: 'V', type: 'HT', price: 3100, cost: 2100,
    stock: { matriz: 40, poniente: 30, sur: 25 }, lastMovement: '2024-05-10',
  },
  {
    id: '13', brand: 'Dunlop', model: 'Grandtrek AT5', width: 265, profile: 60, rim: 18,
    loadIndex: '110', speedRating: 'H', type: 'AT', price: 4400, cost: 3050,
    stock: { matriz: 15, poniente: 12, sur: 18 }, lastMovement: '2024-04-20', // Slow rotation
  },
  {
    id: '14', brand: 'Kumho', model: 'Road Venture MT51', width: 31, profile: 10, rim: 15,
    loadIndex: '109', speedRating: 'Q', type: 'MT', price: 3900, cost: 2700,
    stock: { matriz: 10, poniente: 5, sur: 10 }, lastMovement: '2024-05-05',
  },
  {
    id: '15', brand: 'Toyo', model: 'Open Country M/T', width: 35, profile: 12, rim: 20,
    loadIndex: '121', speedRating: 'Q', type: 'MT', price: 9500, cost: 6800,
    stock: { matriz: 4, poniente: 0, sur: 4 }, lastMovement: '2024-05-12',
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
  {
    id: 'T-1002',
    originBranchId: 'poniente',
    destinationBranchId: 'matriz',
    productId: '3',
    quantity: 5,
    status: 'Recibido',
    date: '2024-05-11',
  },
  {
    id: 'T-1003',
    originBranchId: 'sur',
    destinationBranchId: 'poniente',
    productId: '12',
    quantity: 20,
    status: 'En tránsito',
    date: '2024-05-13',
  }
];

export const SALES: Sale[] = [
  {
    id: 'V-2001', branchId: 'matriz', sellerId: 'Pedro Rdz',
    items: [{ productId: '1', quantity: 4, price: 4850 }],
    total: 22504, tax: 3104, paymentMethod: 'PUE', paymentForm: '03', status: 'Timbrada',
    cfdiUsage: 'G01', rfcRecuper: 'XAXX010101000', date: '2024-05-13',
  },
  {
    id: 'V-2002', branchId: 'poniente', sellerId: 'Ana Lopez',
    items: [{ productId: '5', quantity: 4, price: 6100 }],
    total: 28304, tax: 3904, paymentMethod: 'PPD', paymentForm: '99', status: 'Pendiente',
    cfdiUsage: 'G03', rfcRecuper: 'COMJ800101ABC', date: '2024-05-13',
  },
  {
    id: 'V-2003', branchId: 'sur', sellerId: 'Julian Cams',
    items: [{ productId: '15', quantity: 4, price: 9500 }],
    total: 44080, tax: 6080, paymentMethod: 'PUE', paymentForm: '31', status: 'Timbrada',
    cfdiUsage: 'S01', rfcRecuper: 'XAXX010101000', date: '2024-05-12',
  },
  {
    id: 'V-2004', branchId: 'matriz', sellerId: 'Sonia Vega',
    items: [{ productId: '8', quantity: 2, price: 7200 }],
    total: 16704, tax: 2304, paymentMethod: 'PUE', paymentForm: '01', status: 'Cancelada',
    cfdiUsage: 'G01', rfcRecuper: 'XAXX010101000', date: '2024-05-11',
  },
  {
    id: 'V-2005', branchId: 'poniente', sellerId: 'Marcos Ruiz',
    items: [{ productId: '12', quantity: 4, price: 3100 }],
    total: 14384, tax: 1984, paymentMethod: 'PUE', paymentForm: '03', status: 'Timbrada',
    cfdiUsage: 'G03', rfcRecuper: 'XAXX010101000', date: '2024-05-10',
  },
  {
    id: 'V-2006', branchId: 'sur', sellerId: 'Hugo Mendez',
    items: [{ productId: '4', quantity: 2, price: 5200 }],
    total: 12064, tax: 1664, paymentMethod: 'PUE', paymentForm: '01', status: 'Timbrada',
    cfdiUsage: 'G01', rfcRecuper: 'XAXX010101000', date: '2024-05-09',
  }
];

export const WARRANTIES: Warranty[] = [
  {
    id: 'G-001', dot: 'DOT 4B12 3456 0823', productId: '4', mileage: 12000,
    reason: 'Separación de capas en banda de rodamiento.',
    status: 'Pendiente', date: '2024-05-10',
    photoUrl: 'https://images.unsplash.com/photo-1578844541663-b7394e938aad?w=400&q=80',
    diagnosis: 'En espera de inspección por perito técnico de Michelin.'
  },
  {
    id: 'G-002', dot: 'DOT 1Y77 8899 1224', productId: '2', mileage: 5000,
    reason: 'Protuberancia lateral (chipote) sin impacto aparente.',
    status: 'Pendiente', date: '2024-05-12',
    photoUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80',
    diagnosis: 'Revisión inicial sugiere falla en estructura de cuerdas laterales.'
  }
];
