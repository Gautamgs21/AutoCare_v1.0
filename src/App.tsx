import React, { useState, useEffect, useCallback } from 'react';
import { storageService } from './services/storageService';
import {
  Vehicle,
  FuelLog,
  ServiceRecord,
  PriorityItem,
  FuelRates,
  UserProfile,
  AppSettings,
  NavTab,
} from './types';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardScreen } from './components/DashboardScreen';
import { VehiclesScreen } from './components/VehiclesScreen';
import { FuelLogScreen } from './components/FuelLogScreen';
import { ServiceLogScreen } from './components/ServiceLogScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AuthScreen } from './components/AuthScreen';
import { AddVehicleModal } from './components/AddVehicleModal';
import { LogFuelModal } from './components/LogFuelModal';
import { LogServiceModal } from './components/LogServiceModal';
import { GoogleSheetSetupModal } from './components/GoogleSheetSetupModal';
import { AppIntroLoader } from './components/AppIntroLoader';
import { CheckMileageModal } from './components/CheckMileageModal';
import { RefuellingHistoryModal } from './components/RefuellingHistoryModal';
import { EditVehicleManageModal } from './components/EditVehicleManageModal';
import { applyAppFont } from './utils/fonts';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export function App() {
  // Intro Loader State
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return !sessionStorage.getItem('autocare_intro_shown');
  });

  // Authentication & Navigation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Core Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [fuelRates, setFuelRates] = useState<FuelRates>({
    normalE20: 102.45,
    xtraPremium: 108.9,
    lastUpdated: 'Today',
  });
  const [profile, setProfile] = useState<UserProfile>({
    id: 'usr-1',
    fullName: 'Alex Morgan',
    userId: '@alex_morgan_auto',
    email: 'alex.morgan@autocare.com',
    phoneNumber: '+1 (555) 123-4567',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    role: 'Auto Manager',
  });
  const [settings, setSettings] = useState<AppSettings>({
    googleAppsScriptUrl: '',
    darkMode: false,
    colorTheme: 'blue',
    typography: 'inter',
    currency: '₹',
    distanceUnit: 'km',
    volumeUnit: 'L',
    autoSyncToSheets: true,
  });

  // Modal Visibility States
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const [isLogFuelOpen, setIsLogFuelOpen] = useState(false);
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState<Vehicle | null>(null);

  const [isLogServiceOpen, setIsLogServiceOpen] = useState(false);
  const [selectedVehicleForService, setSelectedVehicleForService] = useState<Vehicle | null>(null);
  const [serviceRecordToEdit, setServiceRecordToEdit] = useState<ServiceRecord | null>(null);
  const [servicesDBList, setServicesDBList] = useState(() => storageService.getServicesDB());

  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);

  // New Specification Modals
  const [isCheckMileageOpen, setIsCheckMileageOpen] = useState(false);
  const [isRefuellingHistoryOpen, setIsRefuellingHistoryOpen] = useState(false);
  const [vehicleForManage, setVehicleForManage] = useState<Vehicle | null>(null);

  // Syncing & Notifications
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: `${Date.now()}`, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const loadedVehicles = storageService.getVehicles();
    const loadedFuel = storageService.getFuelLogs();
    const loadedServices = storageService.getServiceRecords();
    const loadedPriorities = storageService.getPriorities();
    const loadedRates = storageService.getFuelRates();
    const loadedProfile = storageService.getUserProfile();
    const loadedSettings = storageService.getSettings();

    setVehicles(loadedVehicles);
    setFuelLogs(loadedFuel);
    setServiceRecords(loadedServices);
    setPriorities(loadedPriorities);
    setFuelRates(loadedRates);
    setProfile(loadedProfile);
    setSettings(loadedSettings);

    // Apply dark mode & theme to HTML DOM
    if (loadedSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', loadedSettings.colorTheme || 'blue');

    // Apply font
    if (loadedSettings.typography) {
      applyAppFont(loadedSettings.typography);
    }
  }, []);

  const handleFinishIntro = () => {
    setShowIntro(false);
    sessionStorage.setItem('autocare_intro_shown', 'true');
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // CRUD Handlers for Vehicles
  const handleSaveVehicle = (vehicleData: Partial<Vehicle>) => {
    try {
      if (vehicleToEdit) {
        const updated = { ...vehicleToEdit, ...vehicleData } as Vehicle;
        storageService.saveVehicle(updated);
        setVehicles(storageService.getVehicles());
        showToast(`Vehicle ${updated.make} ${updated.model} updated successfully!`, 'success');
      } else {
        const newVehicle: Vehicle = {
          id: `veh-${Date.now()}`,
          make: vehicleData.make || 'Vehicle',
          model: vehicleData.model || 'Model',
          year: vehicleData.year || 2024,
          registrationNumber: vehicleData.registrationNumber || 'NEW-000',
          category: vehicleData.category || 'four_wheeler',
          currentOdometer: vehicleData.currentOdometer || 0,
          startingOdometer: vehicleData.startingOdometer || vehicleData.currentOdometer || 0,
          insuranceExpiry: vehicleData.insuranceExpiry || '2026-12-31',
          pucExpiry: vehicleData.pucExpiry || '2026-12-31',
          status: 'ACTIVE',
          notes: vehicleData.notes || '',
          createdAt: new Date().toISOString(),
        };
        storageService.saveVehicle(newVehicle);
        setVehicles(storageService.getVehicles());
        showToast(`Added ${newVehicle.make} ${newVehicle.model} to Auto Manager!`, 'success');
      }
      setIsAddVehicleOpen(false);
      setVehicleToEdit(null);
      setPriorities(storageService.getPriorities());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save vehicle';
      showToast(msg, 'error');
    }
  };

  const handleDeleteVehicle = (id: string) => {
    storageService.deleteVehicle(id);
    setVehicles(storageService.getVehicles());
    setPriorities(storageService.getPriorities());
    showToast('Vehicle removed from auto records.', 'info');
  };

  const handleOpenAddVehicle = () => {
    setVehicleToEdit(null);
    setIsAddVehicleOpen(true);
  };

  const handleOpenEditVehicle = (vehicle: Vehicle) => {
    setVehicleToEdit(vehicle);
    setIsAddVehicleOpen(true);
  };

  // CRUD Handlers for Fuel Logs
  const handleSaveFuelLog = (logData: Partial<FuelLog>) => {
    try {
      const targetVehicle = vehicles.find((v) => v.id === logData.vehicleId) || vehicles[0];
      const newLog: FuelLog = {
        id: `fuel-${Date.now()}`,
        vehicleId: logData.vehicleId || targetVehicle?.id || 'veh-1',
        vehicleReg: logData.vehicleReg || targetVehicle?.registrationNumber || '',
        vehicleName: logData.vehicleName || (targetVehicle ? `${targetVehicle.make} ${targetVehicle.model}` : 'Vehicle'),
        date: logData.date || new Date().toISOString().split('T')[0],
        time: logData.time || '12:00',
        fuelCompany: logData.fuelCompany || 'IOCL',
        fuelType: logData.fuelType || 'Normal E20',
        volumeLiters: Number(logData.volumeLiters) || 10,
        ratePerLiter: Number(logData.ratePerLiter) || 102.45,
        totalCost: Number(logData.totalCost) || 1024.5,
        odometer: Number(logData.odometer) || 0,
        notes: logData.notes || '',
        createdAt: new Date().toISOString(),
      };

      storageService.saveFuelLog(newLog);
      setFuelLogs(storageService.getFuelLogs());
      setVehicles(storageService.getVehicles());
      showToast(`Fuel refill of ${newLog.volumeLiters}L recorded successfully!`, 'success');
      setIsLogFuelOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record fuel log';
      showToast(msg, 'error');
    }
  };

  const handleDeleteFuelLog = (id: string) => {
    storageService.deleteFuelLog(id);
    setFuelLogs(storageService.getFuelLogs());
    showToast('Fuel entry removed.', 'info');
  };

  const handleOpenLogFuel = () => {
    setSelectedVehicleForFuel(null);
    setIsLogFuelOpen(true);
  };

  const handleOpenLogFuelForVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForFuel(vehicle);
    setIsLogFuelOpen(true);
  };

  // CRUD Handlers for Service Records
  const handleSaveServiceRecord = (recordData: Partial<ServiceRecord>) => {
    try {
      const targetVehicle = vehicles.find((v) => v.id === recordData.vehicleId) || vehicles[0];
      const recordId = recordData.id || `srv-${Date.now()}`;
      const newRecord: ServiceRecord = {
        id: recordId,
        vehicleId: recordData.vehicleId || targetVehicle?.id || 'veh-1',
        vehicleReg: recordData.vehicleReg || targetVehicle?.registrationNumber || '',
        vehicleName: recordData.vehicleName || (targetVehicle ? `${targetVehicle.make} ${targetVehicle.model}` : 'Vehicle'),
        serviceDate: recordData.serviceDate || new Date().toISOString().split('T')[0],
        serviceType: recordData.serviceType || 'Periodic Maintanence',
        title: recordData.title || 'Periodic Service',
        workshopName: recordData.workshopName || 'Authorized Service Station',
        technicianName: recordData.technicianName || 'Master Tech',
        odometer: Number(recordData.odometer) || 0,
        totalCost: Number(recordData.totalCost) || 0,
        tasksCompleted: recordData.tasksCompleted || ['General Inspection'],
        remarks: recordData.remarks || '',
        createdAt: recordData.createdAt || new Date().toISOString(),
      };

      storageService.saveServiceRecord(newRecord);
      setServiceRecords(storageService.getServiceRecords());
      setVehicles(storageService.getVehicles());
      setPriorities(storageService.getPriorities());
      showToast(`Service record saved for ${newRecord.vehicleReg || 'Vehicle'}!`, 'success');
      setIsLogServiceOpen(false);
      setServiceRecordToEdit(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save service record';
      showToast(msg, 'error');
    }
  };

  const handleDeleteServiceRecord = (id: string) => {
    storageService.deleteServiceRecord(id);
    setServiceRecords(storageService.getServiceRecords());
    showToast('Service record deleted.', 'info');
  };

  const handleOpenLogService = () => {
    setSelectedVehicleForService(null);
    setServiceRecordToEdit(null);
    setIsLogServiceOpen(true);
  };

  const handleOpenLogServiceForVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForService(vehicle);
    setServiceRecordToEdit(null);
    setIsLogServiceOpen(true);
  };

  const handleOpenEditServiceRecord = (record: ServiceRecord) => {
    setServiceRecordToEdit(record);
    const veh = vehicles.find((v) => v.id === record.vehicleId) || null;
    setSelectedVehicleForService(veh);
    setIsLogServiceOpen(true);
  };

  // Priority selection shortcuts
  const handleSelectPriority = (priority: PriorityItem) => {
    const targetVeh = vehicles.find((v) => v.id === priority.vehicleId);
    if (priority.type === 'INSURANCE' || priority.type === 'PUC') {
      if (targetVeh) {
        handleOpenEditVehicle(targetVeh);
      }
    } else {
      if (targetVeh) {
        handleOpenLogServiceForVehicle(targetVeh);
      } else {
        handleOpenLogService();
      }
    }
  };

  // Google Sheets & Apps Script Sync
  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      const success = await storageService.syncWithGoogleAppsScript();
      if (success) {
        showToast('Synced successfully with Google Sheets backend!', 'success');
      } else {
        showToast('Data saved locally. Connect Apps Script URL in Settings to sync with cloud.', 'info');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sync with Google Sheet';
      showToast(msg, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveGoogleScriptUrl = (url: string) => {
    const updatedSettings = { ...settings, googleAppsScriptUrl: url };
    storageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    showToast('Google Apps Script URL connected!', 'success');
  };

  // Profile & Settings
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    storageService.saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    showToast('Profile credentials updated!', 'success');
  };

  const handleUpdateSettings = (updatedSettings: AppSettings) => {
    storageService.saveSettings(updatedSettings);
    setSettings(updatedSettings);
    if (updatedSettings.typography) {
      applyAppFont(updatedSettings.typography);
    }
    showToast('Interface settings saved!', 'success');
  };

  const handleUpdateFuelRates = (rates: FuelRates) => {
    storageService.saveFuelRates(rates);
    setFuelRates(rates);
    showToast('Daily fuel rate benchmarks updated!', 'success');
  };

  const handleResetAllData = (mode: 'demo' | 'empty') => {
    storageService.resetAllData(mode);
    setVehicles(storageService.getVehicles());
    setFuelLogs(storageService.getFuelLogs());
    setServiceRecords(storageService.getServiceRecords());
    setPriorities(storageService.getPriorities());
    setFuelRates(storageService.getFuelRates());
    setProfile(storageService.getUserProfile());
    setSettings(storageService.getSettings());
    showToast(mode === 'demo' ? 'Auto Manager reset to demo fleet.' : 'All vehicle records cleared.', 'info');
  };

  const handleResetSingleVehicle = (vehicleId: string) => {
    // Remove fuel logs & service records for this single vehicle
    const updatedFuel = fuelLogs.filter((f) => f.vehicleId !== vehicleId);
    const updatedServices = serviceRecords.filter((s) => s.vehicleId !== vehicleId);
    storageService.saveFuelLogs(updatedFuel);
    storageService.saveServiceRecords(updatedServices);
    setFuelLogs(updatedFuel);
    setServiceRecords(updatedServices);
    setVehicles(storageService.getVehicles());
    showToast('Vehicle records reset successfully.', 'info');
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          showToast('Welcome back to AutoCare Auto Manager!', 'success');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      {/* Intro Video / Luxury Branding Loader */}
      {showIntro && (
        <AppIntroLoader onComplete={handleFinishIntro} onFinish={handleFinishIntro} onSkip={handleFinishIntro} />
      )}

      {/* Floating System Toast Notifications */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-300 max-w-md"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700'
                : 'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            <span className="text-xs font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fixed Top Bento App Bar */}
      <TopAppBar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        onOpenProfile={() => setCurrentTab('profile')}
        profile={profile}
        settings={settings}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
        onSyncAll={handleSyncAll}
        isSyncing={isSyncing}
        isConfigured={Boolean(settings.googleAppsScriptUrl)}
      />

      {/* Main Screen Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-20 pb-24">
        {currentTab === 'dashboard' && (
          <DashboardScreen
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            serviceRecords={serviceRecords}
            priorities={priorities}
            settings={settings}
            fuelRates={fuelRates}
            onOpenAddVehicle={handleOpenAddVehicle}
            onOpenLogFuel={handleOpenLogFuel}
            onOpenLogService={handleOpenLogService}
            onOpenCheckMileage={() => setIsCheckMileageOpen(true)}
            onOpenRefuellingHistory={() => setIsRefuellingHistoryOpen(true)}
            onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
            onSelectPriority={handleSelectPriority}
            onNavigateTab={setCurrentTab}
            onEditVehicle={handleOpenEditVehicle}
            onOpenEditVehicleManage={(veh) => setVehicleForManage(veh)}
            onOpenLogFuelForVehicle={handleOpenLogFuelForVehicle}
            onOpenLogServiceForVehicle={handleOpenLogServiceForVehicle}
            onUpdateFuelRates={handleUpdateFuelRates}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehiclesScreen
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            serviceRecords={serviceRecords}
            onOpenAddVehicle={handleOpenAddVehicle}
            onEditVehicle={handleOpenEditVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onViewHistory={(veh) => {
              setSelectedVehicleForFuel(veh);
              setCurrentTab('fuel');
            }}
            onOpenLogFuelForVehicle={handleOpenLogFuelForVehicle}
            onOpenLogServiceForVehicle={handleOpenLogServiceForVehicle}
          />
        )}

        {currentTab === 'fuel' && (
          <FuelLogScreen
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            fuelRates={fuelRates}
            settings={settings}
            onOpenLogFuel={handleOpenLogFuel}
            onDeleteFuelLog={handleDeleteFuelLog}
            onUpdateFuelRates={handleUpdateFuelRates}
          />
        )}

        {currentTab === 'services' && (
          <ServiceLogScreen
            serviceRecords={serviceRecords}
            vehicles={vehicles}
            priorities={priorities}
            settings={settings}
            servicesDB={servicesDBList}
            onOpenLogService={handleOpenLogService}
            onOpenEditServiceRecord={handleOpenEditServiceRecord}
            onDeleteServiceRecord={handleDeleteServiceRecord}
            onSelectPriority={handleSelectPriority}
            onUpdateServicesDB={() => setServicesDBList(storageService.getServicesDB())}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsScreen
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            serviceRecords={serviceRecords}
            settings={settings}
            onSelectVehicle={(veh) => {
              setSelectedVehicleForFuel(veh);
              setCurrentTab('vehicles');
            }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            profile={profile}
            settings={settings}
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            serviceRecords={serviceRecords}
            onSaveProfile={handleSaveProfile}
            onUpdateSettings={handleUpdateSettings}
            onSignOut={() => setIsAuthenticated(false)}
            onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
            onSyncAll={handleSyncAll}
            onResetAllData={handleResetAllData}
            onReplayIntro={handleReplayIntro}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavBar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Add / Edit Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        vehicleToEdit={vehicleToEdit}
        onClose={() => setIsAddVehicleOpen(false)}
        onSave={handleSaveVehicle}
      />

      {/* Log Fuel Modal */}
      <LogFuelModal
        isOpen={isLogFuelOpen}
        vehicles={vehicles}
        fuelRates={fuelRates}
        settings={settings}
        selectedVehicle={selectedVehicleForFuel}
        onClose={() => setIsLogFuelOpen(false)}
        onSave={handleSaveFuelLog}
      />

      {/* Log Service Modal */}
      <LogServiceModal
        isOpen={isLogServiceOpen}
        vehicles={vehicles}
        settings={settings}
        selectedVehicle={selectedVehicleForService}
        recordToEdit={serviceRecordToEdit}
        servicesDB={servicesDBList}
        onClose={() => {
          setIsLogServiceOpen(false);
          setServiceRecordToEdit(null);
        }}
        onSave={handleSaveServiceRecord}
      />

      {/* Google Sheet & Apps Script Setup Modal */}
      <GoogleSheetSetupModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        currentScriptUrl={settings.googleAppsScriptUrl}
        onSaveScriptUrl={handleSaveGoogleScriptUrl}
      />

      {/* Check Mileage Modal (User Specified) */}
      <CheckMileageModal
        isOpen={isCheckMileageOpen}
        vehicles={vehicles}
        fuelLogs={fuelLogs}
        onClose={() => setIsCheckMileageOpen(false)}
      />

      {/* Refuelling History Modal (User Specified) */}
      <RefuellingHistoryModal
        isOpen={isRefuellingHistoryOpen}
        vehicles={vehicles}
        fuelLogs={fuelLogs}
        currency={settings.currency}
        onClose={() => setIsRefuellingHistoryOpen(false)}
        onOpenAddRefuel={() => {
          setIsRefuellingHistoryOpen(false);
          setIsLogFuelOpen(true);
        }}
      />

      {/* Edit Vehicle Manage Modal [Edit ✎] (User Specified) */}
      {vehicleForManage && (
        <EditVehicleManageModal
          isOpen={Boolean(vehicleForManage)}
          vehicle={vehicleForManage}
          fuelLogs={fuelLogs}
          onClose={() => setVehicleForManage(null)}
          onSaveStartingOdo={(vehId, newStartingOdo) => {
            const v = vehicles.find((item) => item.id === vehId);
            if (v) {
              const updated = { ...v, startingOdometer: newStartingOdo };
              storageService.saveVehicle(updated);
              setVehicles(storageService.getVehicles());
              showToast(`Starting Odometer updated to ${newStartingOdo.toLocaleString()} km`, 'success');
            }
          }}
          onResetVehicleData={(vehId) => {
            handleResetSingleVehicle(vehId);
          }}
          onDeleteVehicle={(vehId) => {
            handleDeleteVehicle(vehId);
            setVehicleForManage(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
