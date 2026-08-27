import { Vehicle, FuelLog, ServiceRecord } from '../types';
import { findServiceDBEntry, ServicesDBEntry } from '../data/servicesDB';

export interface VehicleCalculations {
  vehicleId: string;
  registrationNumber: string;
  category: string;
  make: string;
  model: string;
  year: number;
  startingOdometer: number; // Col F
  currentOdometer: number;  // Col G
  totalDistanceDriven: number; // Col H

  // Fuel & Mileage calculations
  fuelLogCount: number;
  totalFuelLiters: number;  // Col L
  totalFuelCost: number;
  secondLastOdometer: number | null; // Col I
  thirdLastOdometer: number | null;  // Col J
  secondLastRefillQuantity: number | null; // Col K
  
  recentMileage: number; // Col M: (colI - colJ) / colK, or between latest 2 fill-ups (km/L)
  latestFillUpMileage: number; // (fLogs[0].odo - fLogs[1].odo) / fLogs[0].liters
  overallMileage: number; // Col N: (colI - colF) / colL or (currentOdo - startingOdo) / totalLiters
  avgCostPerKm: number;

  // Expiry Calculations
  insuranceExpiry: string; // Col O
  insuranceDaysLeft: number | null; // Col P
  insuranceStatus: 'Expired' | 'Expiring Soon' | 'Valid' | 'N/A'; // Col Q

  pucExpiry: string; // Col R
  pucDaysLeft: number | null; // Col S
  pucStatus: 'Expired' | 'Expiring Soon' | 'Valid' | 'N/A'; // Col T

  // Service tracking
  latestService?: ServiceRecord;
  nextServiceDate?: string;
  nextServiceKm?: number;
  serviceDaysLeft?: number;
  serviceKmLeft?: number;
  serviceStatus?: 'OVERDUE' | 'DUE SOON' | 'UPCOMING' | 'OK';
  nextServiceItem?: string;
}

export interface ServiceCalculation {
  recordId: string;
  serviceType: string;
  category: 'Four Wheeler' | 'Two Wheeler';
  serviceDate: string;
  odometer: number;
  matchedDB?: ServicesDBEntry;
  nextServiceDate: string; // Col M
  nextServiceKm: number;   // Col N
  daysTillNextService: number; // Col O
  kmTillNextService: number;   // Col P
  status: 'OVERDUE' | 'DUE SOON' | 'UPCOMING';
}

/**
 * Standardize text or Date string into true Date object
 */
export function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format Date as dd-MM-yyyy standard format
 */
export function formatDateDMY(dateInput?: string | Date | null): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Calculate Service Log item Next Service Date, Next Km, Days Left, and Km Left
 * directly matching the processServiceLogs Apps Script logic
 */
export function calculateServiceRecord(
  record: ServiceRecord,
  vehicleCategory: 'four_wheeler' | 'two_wheeler',
  currentVehicleOdometer: number,
  customDb?: ServicesDBEntry[]
): ServiceCalculation {
  const normCategory = vehicleCategory === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler';
  const matched = findServiceDBEntry(record.serviceType || record.title, normCategory, customDb);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sDate = parseDate(record.serviceDate) || new Date();
  
  // Col M: Next Service Date = Service Date + periodicity (months)
  const nextDate = new Date(sDate.getTime());
  const periodMonths = matched?.timePeriodMonths || (normCategory === 'Two Wheeler' ? 6 : 12);
  nextDate.setMonth(nextDate.getMonth() + periodMonths);

  // Col N: Next Service Km = Service Odometer + mileage interval (km)
  const mileageInterval = matched?.mileageInterval || (normCategory === 'Two Wheeler' ? 3000 : 10000);
  const nextKm = (record.odometer || 0) + mileageInterval;

  // Col O: Days Till Next Service
  const diffTime = nextDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Col P: Km Till Next Service = Next Km - Current Vehicle Odometer
  const kmLeft = nextKm - currentVehicleOdometer;

  let status: 'OVERDUE' | 'DUE SOON' | 'UPCOMING' = 'UPCOMING';
  if (daysLeft < 0 || kmLeft < 0) {
    status = 'OVERDUE';
  } else if (daysLeft <= 30 || kmLeft <= 1000) {
    status = 'DUE SOON';
  }

  return {
    recordId: record.id,
    serviceType: record.serviceType || matched.serviceType,
    category: normCategory,
    serviceDate: record.serviceDate,
    odometer: record.odometer,
    matchedDB: matched,
    nextServiceDate: nextDate.toISOString().split('T')[0],
    nextServiceKm: nextKm,
    daysTillNextService: daysLeft,
    kmTillNextService: kmLeft,
    status,
  };
}

/**
 * Calculate all Vehicle mileage and metrics based on processCalculationsSheet API
 */
export function calculateAllVehicleStats(
  vehicles: Vehicle[],
  fuelLogs: FuelLog[],
  serviceRecords: ServiceRecord[]
): Record<string, VehicleCalculations> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group and sort fuel logs per vehicle (newest first)
  const fuelMap: Record<string, FuelLog[]> = {};
  fuelLogs.forEach((f) => {
    if (!fuelMap[f.vehicleId]) fuelMap[f.vehicleId] = [];
    fuelMap[f.vehicleId].push(f);
  });

  for (const vId in fuelMap) {
    fuelMap[vId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Find max service odometer per vehicle
  const serviceMaxOdo: Record<string, number> = {};
  const serviceRecordsMap: Record<string, ServiceRecord[]> = {};
  serviceRecords.forEach((s) => {
    if (!serviceRecordsMap[s.vehicleId]) serviceRecordsMap[s.vehicleId] = [];
    serviceRecordsMap[s.vehicleId].push(s);

    const odo = s.odometer || 0;
    if (!serviceMaxOdo[s.vehicleId] || odo > serviceMaxOdo[s.vehicleId]) {
      serviceMaxOdo[s.vehicleId] = odo;
    }
  });

  const results: Record<string, VehicleCalculations> = {};

  vehicles.forEach((veh) => {
    const fLogs = fuelMap[veh.id] || [];
    const sLogs = serviceRecordsMap[veh.id] || [];
    sLogs.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());

    const startingOdo = veh.startingOdometer || 0; // Col F
    const maxFuelOdo = fLogs.length > 0 ? Math.max(...fLogs.map((l) => l.odometer || 0)) : 0;
    const maxServOdo = serviceMaxOdo[veh.id] || 0;

    // Col G: Current Odometer
    const currentOdo = Math.max(startingOdo, veh.currentOdometer || 0, maxFuelOdo, maxServOdo);

    // Col H: Total Distance Driven
    const totalDistance = Math.max(0, currentOdo - startingOdo);

    // Sort logs by date / odometer ascending to compute true intervals
    const chronologicalLogs = [...fLogs].sort((a, b) => (a.odometer || 0) - (b.odometer || 0));

    // Fuel Stats
    const totalLiters = chronologicalLogs.reduce((sum, item) => sum + (Number(item.volumeLiters) || 0), 0); // Col L
    const totalCost = chronologicalLogs.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);

    const secondLastOdo = chronologicalLogs.length >= 2 ? chronologicalLogs[chronologicalLogs.length - 1].odometer : null; // Col I
    const thirdLastOdo = chronologicalLogs.length >= 3 ? chronologicalLogs[chronologicalLogs.length - 2].odometer : null;  // Col J
    const secondLastLiters = chronologicalLogs.length >= 2 ? chronologicalLogs[chronologicalLogs.length - 1].volumeLiters : null; // Col K

    // Col M: Recent / Previous Mileage = Tank-to-Tank between latest two consecutive fill-ups
    let recentMileage = 0;
    if (chronologicalLogs.length >= 2) {
      const latestLog = chronologicalLogs[chronologicalLogs.length - 1];
      const previousLog = chronologicalLogs[chronologicalLogs.length - 2];
      const dist = latestLog.odometer - previousLog.odometer;
      if (dist > 0 && latestLog.volumeLiters > 0) {
        recentMileage = Math.round((dist / latestLog.volumeLiters) * 10) / 10;
      }
    }

    // Latest Fill-up mileage
    const latestFillUpMileage = recentMileage;

    // Col N: Overall Tracked Mileage = (Latest Refuel Odometer - First Refuel Odometer) / (Total Fuel consumed over that span)
    let overallMileage = 0;
    if (chronologicalLogs.length >= 2) {
      const firstLog = chronologicalLogs[0];
      const lastLog = chronologicalLogs[chronologicalLogs.length - 1];
      const trackedDistance = lastLog.odometer - firstLog.odometer;
      // Total fuel consumed to drive that distance (excluding the baseline initial fill-up or summing all subsequent fills)
      const subsequentLiters = chronologicalLogs.slice(1).reduce((sum, item) => sum + (Number(item.volumeLiters) || 0), 0);
      
      if (trackedDistance > 0 && subsequentLiters > 0) {
        overallMileage = Math.round((trackedDistance / subsequentLiters) * 10) / 10;
      } else if (trackedDistance > 0 && totalLiters > 0) {
        overallMileage = Math.round((trackedDistance / totalLiters) * 10) / 10;
      }
    } else if (chronologicalLogs.length === 1) {
      // Single log against starting odometer if starting odometer was set when tracking started
      const singleLog = chronologicalLogs[0];
      const distSinceStart = singleLog.odometer - startingOdo;
      if (distSinceStart > 0 && singleLog.volumeLiters > 0) {
        const singleMileage = distSinceStart / singleLog.volumeLiters;
        if (singleMileage <= 100) {
          overallMileage = Math.round(singleMileage * 10) / 10;
          recentMileage = overallMileage;
        }
      }
    }

    // Cost Per Km
    const avgCostPerKm = totalDistance > 0 && totalCost > 0 
      ? Math.round((totalCost / totalDistance) * 100) / 100 
      : 0;

    // Insurance calculations (Col O, P, Q)
    const insDate = parseDate(veh.insuranceExpiry);
    let insuranceDaysLeft: number | null = null;
    let insuranceStatus: 'Expired' | 'Expiring Soon' | 'Valid' | 'N/A' = 'N/A';
    if (insDate) {
      const diffIns = insDate.getTime() - today.getTime();
      insuranceDaysLeft = Math.ceil(diffIns / (1000 * 60 * 60 * 24));
      insuranceStatus = insuranceDaysLeft < 0 ? 'Expired' : (insuranceDaysLeft <= 30 ? 'Expiring Soon' : 'Valid');
    }

    // Pollution / PUC calculations (Col R, S, T)
    const pucDate = parseDate(veh.pucExpiry);
    let pucDaysLeft: number | null = null;
    let pucStatus: 'Expired' | 'Expiring Soon' | 'Valid' | 'N/A' = 'N/A';
    if (pucDate) {
      const diffPuc = pucDate.getTime() - today.getTime();
      pucDaysLeft = Math.ceil(diffPuc / (1000 * 60 * 60 * 24));
      pucStatus = pucDaysLeft < 0 ? 'Expired' : (pucDaysLeft <= 30 ? 'Expiring Soon' : 'Valid');
    }

    // Next Service calculation
    let nextServiceDate: string | undefined;
    let nextServiceKm: number | undefined;
    let serviceDaysLeft: number | undefined;
    let serviceKmLeft: number | undefined;
    let serviceStatus: 'OVERDUE' | 'DUE SOON' | 'UPCOMING' | 'OK' | undefined;
    let nextServiceItem: string | undefined;

    const latestService = sLogs[0];
    if (latestService) {
      const calc = calculateServiceRecord(latestService, veh.category, currentOdo);
      nextServiceDate = calc.nextServiceDate;
      nextServiceKm = calc.nextServiceKm;
      serviceDaysLeft = calc.daysTillNextService;
      serviceKmLeft = calc.kmTillNextService;
      serviceStatus = calc.status;
      nextServiceItem = calc.serviceType;
    } else {
      // Based on starting/current odometer and 6-month interval default
      const defaultInterval = veh.category === 'two_wheeler' ? 3000 : 10000;
      nextServiceKm = startingOdo + defaultInterval;
      serviceKmLeft = nextServiceKm - currentOdo;
      
      const defaultNextDate = new Date();
      defaultNextDate.setMonth(defaultNextDate.getMonth() + 6);
      nextServiceDate = defaultNextDate.toISOString().split('T')[0];
      const diff = defaultNextDate.getTime() - today.getTime();
      serviceDaysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      serviceStatus = (serviceDaysLeft < 0 || (serviceKmLeft && serviceKmLeft < 0)) 
        ? 'OVERDUE' 
        : ((serviceDaysLeft <= 30 || (serviceKmLeft && serviceKmLeft <= 1000)) ? 'DUE SOON' : 'UPCOMING');
      nextServiceItem = 'General Periodic Service';
    }

    results[veh.id] = {
      vehicleId: veh.id,
      registrationNumber: veh.registrationNumber,
      category: veh.category,
      make: veh.make,
      model: veh.model,
      year: veh.year,
      startingOdometer: startingOdo,
      currentOdometer: currentOdo,
      totalDistanceDriven: totalDistance,
      fuelLogCount: fLogs.length,
      totalFuelLiters: Math.round(totalLiters * 100) / 100,
      totalFuelCost: Math.round(totalCost * 100) / 100,
      secondLastOdometer: secondLastOdo,
      thirdLastOdometer: thirdLastOdo,
      secondLastRefillQuantity: secondLastLiters,
      recentMileage,
      latestFillUpMileage,
      overallMileage,
      avgCostPerKm,
      insuranceExpiry: veh.insuranceExpiry,
      insuranceDaysLeft,
      insuranceStatus,
      pucExpiry: veh.pucExpiry,
      pucDaysLeft,
      pucStatus,
      latestService,
      nextServiceDate,
      nextServiceKm,
      serviceDaysLeft,
      serviceKmLeft,
      serviceStatus,
      nextServiceItem,
    };
  });

  return results;
}

export function calculateVehicleMileageStats(
  vehicle: Vehicle,
  fuelLogs: FuelLog[],
  serviceRecords: ServiceRecord[] = []
): VehicleCalculations {
  const map = calculateAllVehicleStats([vehicle], fuelLogs, serviceRecords);
  return map[vehicle.id];
}

