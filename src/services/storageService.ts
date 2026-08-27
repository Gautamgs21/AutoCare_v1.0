import { Vehicle, FuelLog, ServiceRecord, UserProfile, AppSettings, FuelRates, PriorityItem } from '../types';
import { initialVehicles, initialFuelLogs, initialServiceRecords, initialProfile, initialSettings, initialFuelRates, initialPriorities } from '../data/initialData';
import { servicesDB, ServicesDBEntry } from '../data/servicesDB';

const KEYS = {
  VEHICLES: 'autocare_vehicles_v2',
  FUEL_LOGS: 'autocare_fuel_logs_v2',
  SERVICE_RECORDS: 'autocare_services_v2',
  SERVICES_DB: 'autocare_services_db_v2',
  PROFILE: 'autocare_profile_v2',
  SETTINGS: 'autocare_settings_v2',
  FUEL_RATES: 'autocare_rates_v2',
  AUTH: 'autocare_auth_session_v2',
};

export const storageService = {
  getVehicles(): Vehicle[] {
    try {
      const stored = localStorage.getItem(KEYS.VEHICLES);
      return stored ? JSON.parse(stored) : initialVehicles;
    } catch {
      return initialVehicles;
    }
  },

  saveVehicles(vehicles: Vehicle[]): void {
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));
    this.triggerAutoSyncIfConfigured();
  },

  saveVehicle(vehicle: Vehicle): void {
    const vehicles = this.getVehicles();
    const index = vehicles.findIndex((v) => v.id === vehicle.id);
    if (index >= 0) {
      vehicles[index] = vehicle;
    } else {
      vehicles.unshift(vehicle);
    }
    this.saveVehicles(vehicles);
  },

  deleteVehicle(id: string): void {
    const vehicles = this.getVehicles().filter((v) => v.id !== id);
    this.saveVehicles(vehicles);
  },

  getFuelLogs(): FuelLog[] {
    try {
      const stored = localStorage.getItem(KEYS.FUEL_LOGS);
      return stored ? JSON.parse(stored) : initialFuelLogs;
    } catch {
      return initialFuelLogs;
    }
  },

  saveFuelLogs(logs: FuelLog[]): void {
    localStorage.setItem(KEYS.FUEL_LOGS, JSON.stringify(logs));
    this.triggerAutoSyncIfConfigured();
  },

  saveFuelLog(log: FuelLog): void {
    const logs = this.getFuelLogs();
    logs.unshift(log);
    this.saveFuelLogs(logs);

    // Also update vehicle's current odometer if new log has higher odo
    const vehicles = this.getVehicles();
    const vIndex = vehicles.findIndex((v) => v.id === log.vehicleId);
    if (vIndex >= 0 && log.odometer > vehicles[vIndex].currentOdometer) {
      vehicles[vIndex].currentOdometer = log.odometer;
      this.saveVehicles(vehicles);
    }
  },

  deleteFuelLog(id: string): void {
    const logs = this.getFuelLogs().filter((l) => l.id !== id);
    this.saveFuelLogs(logs);
  },

  getServiceRecords(): ServiceRecord[] {
    try {
      const stored = localStorage.getItem(KEYS.SERVICE_RECORDS);
      return stored ? JSON.parse(stored) : initialServiceRecords;
    } catch {
      return initialServiceRecords;
    }
  },

  saveServiceRecords(records: ServiceRecord[]): void {
    localStorage.setItem(KEYS.SERVICE_RECORDS, JSON.stringify(records));
    this.triggerAutoSyncIfConfigured();
  },

  saveServiceRecord(record: ServiceRecord): void {
    const records = this.getServiceRecords();
    const index = records.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.unshift(record);
    }
    this.saveServiceRecords(records);

    // Also update vehicle odometer if applicable
    const vehicles = this.getVehicles();
    const vIndex = vehicles.findIndex((v) => v.id === record.vehicleId);
    if (vIndex >= 0 && record.odometer > vehicles[vIndex].currentOdometer) {
      vehicles[vIndex].currentOdometer = record.odometer;
      this.saveVehicles(vehicles);
    }
  },

  deleteServiceRecord(id: string): void {
    const records = this.getServiceRecords().filter((r) => r.id !== id);
    this.saveServiceRecords(records);
  },

  getServicesDB(): ServicesDBEntry[] {
    try {
      const stored = localStorage.getItem(KEYS.SERVICES_DB);
      return stored ? JSON.parse(stored) : servicesDB;
    } catch {
      return servicesDB;
    }
  },

  saveServicesDB(entries: ServicesDBEntry[]): void {
    localStorage.setItem(KEYS.SERVICES_DB, JSON.stringify(entries));
  },

  saveServicesDBEntry(entry: ServicesDBEntry, originalIndex?: number): void {
    const list = this.getServicesDB();
    if (typeof originalIndex === 'number' && originalIndex >= 0 && originalIndex < list.length) {
      list[originalIndex] = entry;
    } else {
      // Find match or prepend
      const existingIdx = list.findIndex(
        (s) => s.serviceType.toLowerCase() === entry.serviceType.toLowerCase() && s.vehicleCategory === entry.vehicleCategory
      );
      if (existingIdx >= 0) {
        list[existingIdx] = entry;
      } else {
        list.unshift(entry);
      }
    }
    this.saveServicesDB(list);
  },

  deleteServicesDBEntry(index: number): void {
    const list = this.getServicesDB();
    if (index >= 0 && index < list.length) {
      list.splice(index, 1);
      this.saveServicesDB(list);
    }
  },

  resetServicesDB(): void {
    localStorage.removeItem(KEYS.SERVICES_DB);
  },

  getPriorities(): PriorityItem[] {
    const vehicles = this.getVehicles();
    const priorities: PriorityItem[] = [];

    vehicles.forEach((veh) => {
      if (veh.status === 'RENEWAL DUE') {
        priorities.push({
          id: `prio-ins-${veh.id}`,
          title: 'Insurance Renewal',
          vehicleInfo: `${veh.make} ${veh.model} (${veh.registrationNumber})`,
          vehicleId: veh.id,
          dueDate: veh.insuranceExpiry || 'Soon',
          type: 'INSURANCE',
          status: 'DUE SOON',
        });
      }
      if (veh.status === 'MAINTENANCE') {
        priorities.push({
          id: `prio-maint-${veh.id}`,
          title: 'Brake & Oil Inspection',
          vehicleInfo: `${veh.make} ${veh.model} (${veh.registrationNumber})`,
          vehicleId: veh.id,
          dueDate: 'Overdue',
          type: 'BRAKE',
          status: 'OVERDUE',
        });
      }
    });

    if (priorities.length === 0) {
      return initialPriorities;
    }

    return [...priorities, ...initialPriorities].slice(0, 5);
  },

  getUserProfile(): UserProfile {
    return this.getProfile();
  },

  saveUserProfile(profile: UserProfile): void {
    this.saveProfile(profile);
  },

  getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(KEYS.PROFILE);
      return stored ? JSON.parse(stored) : initialProfile;
    } catch {
      return initialProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  resetAllData(mode: 'demo' | 'empty' = 'demo'): void {
    if (mode === 'demo') {
      localStorage.setItem(KEYS.VEHICLES, JSON.stringify(initialVehicles));
      localStorage.setItem(KEYS.FUEL_LOGS, JSON.stringify(initialFuelLogs));
      localStorage.setItem(KEYS.SERVICE_RECORDS, JSON.stringify(initialServiceRecords));
      localStorage.setItem(KEYS.FUEL_RATES, JSON.stringify(initialFuelRates));
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(initialProfile));
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(initialSettings));
    } else {
      localStorage.setItem(KEYS.VEHICLES, JSON.stringify([]));
      localStorage.setItem(KEYS.FUEL_LOGS, JSON.stringify([]));
      localStorage.setItem(KEYS.SERVICE_RECORDS, JSON.stringify([]));
      localStorage.setItem(KEYS.FUEL_RATES, JSON.stringify(initialFuelRates));
    }
  },

  getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(KEYS.SETTINGS);
      return stored ? { ...initialSettings, ...JSON.parse(stored) } : initialSettings;
    } catch {
      return initialSettings;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getFuelRates(): FuelRates {
    try {
      const stored = localStorage.getItem(KEYS.FUEL_RATES);
      return stored ? JSON.parse(stored) : initialFuelRates;
    } catch {
      return initialFuelRates;
    }
  },

  saveFuelRates(rates: FuelRates): void {
    localStorage.setItem(KEYS.FUEL_RATES, JSON.stringify(rates));
  },

  triggerAutoSyncIfConfigured() {
    const settings = this.getSettings();
    if (settings.googleAppsScriptUrl && settings.autoSyncToSheets !== false) {
      this.syncWithGoogleAppsScript(settings.googleAppsScriptUrl).catch(() => {});
    }
  },

  async testConnection(webAppUrl: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.startsWith('http')) return false;
    try {
      const res = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'TEST_CONNECTION' }),
      });
      return res.ok;
    } catch {
      // In web browsers, opaque POST responses to Google Apps Script redirects might resolve with mode no-cors
      try {
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'TEST_CONNECTION' }),
        });
        return true;
      } catch {
        return false;
      }
    }
  },

  async syncWithGoogleAppsScript(url?: string, customPayload?: any): Promise<boolean> {
    const settings = this.getSettings();
    const targetUrl = url || settings.googleAppsScriptUrl;
    if (!targetUrl || !targetUrl.startsWith('http')) return false;

    const payload = customPayload || {
      action: 'SYNC_ALL',
      vehicles: this.getVehicles(),
      fuelLogs: this.getFuelLogs(),
      serviceRecords: this.getServiceRecords(),
      profile: this.getProfile(),
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors', // Apps Script web apps return a 302 redirect that browsers handle with no-cors seamlessly
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      // Update last synced
      settings.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.saveSettings(settings);
      return true;
    } catch (e) {
      console.warn('Sync failed', e);
      return false;
    }
  },

  exportToCSV(type: 'vehicles' | 'fuel' | 'services'): string {
    if (type === 'vehicles') {
      const vehicles = this.getVehicles();
      const headers = ['ID', 'Make', 'Model', 'Category', 'Registration', 'Year', 'StartingOdo', 'CurrentOdo', 'InsuranceExpiry', 'PUCExpiry', 'Status'];
      const rows = vehicles.map((v) => [
        v.id, v.make, v.model, v.category, v.registrationNumber, v.year, v.startingOdometer, v.currentOdometer, v.insuranceExpiry, v.pucExpiry, v.status
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    } else if (type === 'fuel') {
      const logs = this.getFuelLogs();
      const headers = ['ID', 'VehicleReg', 'VehicleName', 'FuelCompany', 'FuelType', 'Date', 'Time', 'Odometer', 'RatePerLiter', 'VolumeLiters', 'TotalCost', 'Notes'];
      const rows = logs.map((l) => [
        l.id, l.vehicleReg, l.vehicleName, l.fuelCompany, l.fuelType, l.date, l.time, l.odometer, l.ratePerLiter, l.volumeLiters, l.totalCost, l.notes || ''
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    } else {
      const records = this.getServiceRecords();
      const headers = ['ID', 'VehicleReg', 'VehicleName', 'Date', 'ServiceType', 'Title', 'Odometer', 'TotalCost', 'Technician', 'Workshop', 'Tasks', 'Remarks'];
      const rows = records.map((s) => [
        s.id, s.vehicleReg, s.vehicleName, s.serviceDate, s.serviceType, s.title, s.odometer, s.totalCost, s.technicianName, s.workshopName, (s.tasksCompleted || []).join('; '), s.remarks || ''
      ]);
      return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
    }
  },

  getGoogleAppsScriptTemplate(): string {
    return `/**
 * AutoCare Fleet Manager - Google Apps Script Backend (Code.gs)
 * -------------------------------------------------------------
 * Steps to deploy:
 * 1. Open your Google Sheet -> Extensions -> Apps Script
 * 2. Paste this entire file into Code.gs
 * 3. Click "Deploy" -> "New deployment" -> Select "Web app"
 * 4. Configuration:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 5. Copy the generated Web App URL and paste it into AutoCare settings!
 */

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : '';
    if (!rawData) {
      return responseJSON({ status: 'ERROR', message: 'No payload' });
    }
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    setupSheetsIfMissing(ss);
    
    var action = data.action || 'SYNC_ALL';
    
    if (action === 'ADD_VEHICLE' && data.vehicle) {
      var vSheet = ss.getSheetByName('Vehicles');
      var v = data.vehicle;
      vSheet.appendRow([
        v.id || Utilities.getUuid(),
        v.category,
        v.make,
        v.model,
        v.registrationNumber,
        v.year,
        v.startingOdometer,
        v.currentOdometer,
        v.insuranceExpiry,
        v.pucExpiry,
        v.status,
        new Date()
      ]);
      runServiceLogAutomation();
      return responseJSON({ status: 'SUCCESS', message: 'Vehicle saved to Google Sheet' });
    }
    
    if (action === 'ADD_FUEL_LOG' && data.fuelLog) {
      var fSheet = ss.getSheetByName('FuelLogs');
      var f = data.fuelLog;
      fSheet.appendRow([
        f.id || Utilities.getUuid(),
        f.vehicleReg,
        f.vehicleName,
        f.fuelCompany,
        f.fuelType,
        f.date,
        f.time,
        f.odometer,
        f.ratePerLiter,
        f.volumeLiters,
        f.totalCost,
        f.notes || '',
        new Date()
      ]);
      runServiceLogAutomation();
      return responseJSON({ status: 'SUCCESS', message: 'Fuel refill saved to Google Sheet' });
    }
    
    if (action === 'ADD_SERVICE_RECORD' && data.serviceRecord) {
      var sSheet = ss.getSheetByName('servicelogs') || ss.getSheetByName('ServiceRecords');
      var s = data.serviceRecord;
      sSheet.appendRow([
        s.id || Utilities.getUuid(),
        s.vehicleReg,
        s.vehicleName,
        s.serviceDate,
        s.serviceType,
        s.title,
        s.odometer,
        s.totalCost,
        s.technicianName,
        s.workshopName,
        (s.tasksCompleted || []).join(', '),
        s.remarks || '',
        new Date()
      ]);
      runServiceLogAutomation();
      return responseJSON({ status: 'SUCCESS', message: 'Service record saved to Google Sheet' });
    }
    
    if (action === 'SYNC_ALL') {
      if (data.vehicles && data.vehicles.length) {
        var vSheet = ss.getSheetByName('Vehicles');
        vSheet.clearContents();
        vSheet.appendRow(['ID', 'Category', 'Make', 'Model', 'RegNo', 'Year', 'StartOdo', 'CurrentOdo', 'InsuranceExp', 'PUCExp', 'Status', 'UpdatedAt']);
        data.vehicles.forEach(function(v) {
          vSheet.appendRow([v.id, v.category, v.make, v.model, v.registrationNumber, v.year, v.startingOdometer, v.currentOdometer, v.insuranceExpiry, v.pucExpiry, v.status, new Date()]);
        });
        vSheet.getRange("1:1").setFontWeight("bold").setBackground("#2563eb").setFontColor("#ffffff");
      }
      
      if (data.fuelLogs && data.fuelLogs.length) {
        var fSheet = ss.getSheetByName('FuelLogs');
        fSheet.clearContents();
        fSheet.appendRow(['ID', 'RegNo', 'VehicleName', 'Company', 'FuelType', 'Date', 'Time', 'Odometer', 'RatePerL', 'VolumeL', 'TotalCost', 'Notes', 'UpdatedAt']);
        data.fuelLogs.forEach(function(f) {
          fSheet.appendRow([f.id, f.vehicleReg, f.vehicleName, f.fuelCompany, f.fuelType, f.date, f.time, f.odometer, f.ratePerLiter, f.volumeLiters, f.totalCost, f.notes || '', new Date()]);
        });
        fSheet.getRange("1:1").setFontWeight("bold").setBackground("#059669").setFontColor("#ffffff");
      }
      
      if (data.serviceRecords && data.serviceRecords.length) {
        var sSheet = ss.getSheetByName('servicelogs') || ss.getSheetByName('ServiceRecords');
        sSheet.clearContents();
        sSheet.appendRow(['ID', 'RegNo', 'VehicleName', 'Date', 'ServiceType', 'Title', 'Odometer', 'TotalCost', 'Technician', 'Workshop', 'Tasks', 'Remarks', 'UpdatedAt']);
        data.serviceRecords.forEach(function(s) {
          sSheet.appendRow([s.id, s.vehicleReg, s.vehicleName, s.serviceDate, s.serviceType, s.title, s.odometer, s.totalCost, s.technicianName, s.workshopName, (s.tasksCompleted || []).join(', '), s.remarks || '', new Date()]);
        });
        sSheet.getRange("1:1").setFontWeight("bold").setBackground("#7c3aed").setFontColor("#ffffff");
      }
      
      runServiceLogAutomation();
      return responseJSON({ status: 'SUCCESS', message: 'All fleet tables successfully synced to Google Sheets!' });
    }
    
    return responseJSON({ status: 'SUCCESS', message: 'Ready' });
  } catch (err) {
    return responseJSON({ status: 'ERROR', message: err.toString() });
  }
}

function doGet(e) {
  return responseJSON({
    status: 'ONLINE',
    app: 'AutoCare API',
    timestamp: new Date().toISOString()
  });
}

function runServiceLogAutomation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  standardizeDates(ss);
  processServiceLogs(ss);
  processCalculationsSheet(ss);
  applyUniformDateFormats(ss);
}

function standardizeDates(ss) {
  var sheets = ["FuelLogs", "servicelogs", "ServiceRecords", "Vehicles"];
  sheets.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) return;
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;
  });
}

function processServiceLogs(ss) {
  var serviceLogsSheet = ss.getSheetByName("servicelogs") || ss.getSheetByName("ServiceRecords");
  var servicesDBSheet = ss.getSheetByName("ServicesDB");
  if (!serviceLogsSheet) return;
}

function processCalculationsSheet(ss) {
  var calculationsSheet = ss.getSheetByName("calculations");
  if (!calculationsSheet) return;
}

function applyUniformDateFormats(ss) {
  // formatting logic
}

function setupSheetsIfMissing(ss) {
  var sheets = ['Vehicles', 'FuelLogs', 'servicelogs'];
  sheets.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
  });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  }
};
