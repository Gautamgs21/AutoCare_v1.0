export type VehicleCategory = 'four_wheeler' | 'two_wheeler';

export type VehicleStatus = 'ACTIVE' | 'RENEWAL DUE' | 'MAINTENANCE' | 'INACTIVE';

export interface Vehicle {
  id: string;
  category: VehicleCategory;
  make: string;
  model: string;
  registrationNumber: string;
  year: number;
  startingOdometer: number;
  currentOdometer: number;
  insuranceExpiry: string;
  pucExpiry: string;
  status: VehicleStatus;
  notes?: string;
  createdAt: string;
}

export type FuelType = 'Normal E20' | 'Xtra Premium' | 'Diesel' | 'CNG' | 'Electric';

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  fuelCompany: string;
  fuelType: FuelType;
  date: string;
  time: string;
  odometer: number;
  ratePerLiter: number;
  volumeLiters: number;
  totalCost: number;
  notes?: string;
  createdAt: string;
}

export type ServiceType = string;

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  serviceDate: string;
  serviceType: ServiceType;
  title: string;
  odometer: number;
  totalCost: number;
  technicianName: string;
  workshopName: string;
  tasksCompleted: string[];
  remarks?: string;
  nextServiceDate?: string;
  nextServiceKm?: number;
  daysTillNext?: number;
  kmTillNext?: number;
  createdAt: string;
}

export interface PriorityItem {
  id: string;
  title: string;
  vehicleInfo: string;
  vehicleId?: string;
  dueDate: string;
  type: 'INSURANCE' | 'PUC' | 'SERVICE' | 'BRAKE' | 'TIRE' | 'OIL';
  status: 'OVERDUE' | 'DUE SOON' | 'UPCOMING';
  description?: string;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  userId: string;
  email: string;
  phoneNumber: string;
  role: string;
  avatarUrl: string;
  avatarType?: 'image' | 'icon';
}

export interface AppSettings {
  darkMode: boolean;
  colorTheme: string;
  typography: string;
  googleAppsScriptUrl: string;
  lastSyncedAt?: string;
  currency: string;
  distanceUnit: 'km' | 'miles';
  volumeUnit?: 'L' | 'gal';
  autoSyncToSheets?: boolean;
}

export interface FuelRates {
  normalE20: number;
  xtraPremium: number;
  diesel?: number;
  lastUpdated: string;
}

export type NavTab = 'dashboard' | 'vehicles' | 'fuel' | 'services' | 'analytics' | 'profile';
export type AppTab = NavTab;
