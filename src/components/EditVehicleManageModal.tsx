import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Save, 
  Trash2, 
  RotateCcw, 
  Car, 
  Bike, 
  AlertTriangle, 
  Fuel, 
  Gauge, 
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Vehicle, FuelLog, ServiceRecord, AppSettings } from '../types';

interface EditVehicleManageModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  fuelLogs: FuelLog[];
  serviceRecords: ServiceRecord[];
  settings: AppSettings;
  onClose: () => void;
  onSaveVehicle: (updated: Partial<Vehicle>) => void;
  onOpenFuelHistoryForVehicle?: (vehicle: Vehicle) => void;
  onResetVehicleData?: (vehicleId: string) => void;
  onDeleteVehicle?: (vehicleId: string) => void;
}

export const EditVehicleManageModal: React.FC<EditVehicleManageModalProps> = ({
  isOpen,
  vehicle,
  fuelLogs,
  serviceRecords,
  settings,
  onClose,
  onSaveVehicle,
  onOpenFuelHistoryForVehicle,
  onResetVehicleData,
  onDeleteVehicle,
}) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [category, setCategory] = useState<'four_wheeler' | 'two_wheeler'>('four_wheeler');
  const [startingOdometer, setStartingOdometer] = useState<number | ''>('');
  const [currentOdometer, setCurrentOdometer] = useState<number | ''>('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [pucExpiry, setPucExpiry] = useState('');
  const [notes, setNotes] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setRegistrationNumber(vehicle.registrationNumber);
      setCategory(vehicle.category);
      setStartingOdometer(vehicle.startingOdometer);
      setCurrentOdometer(vehicle.currentOdometer);
      setInsuranceExpiry(vehicle.insuranceExpiry || '');
      setPucExpiry(vehicle.pucExpiry || '');
      setNotes(vehicle.notes || '');
      setShowResetConfirm(false);
      setShowDeleteConfirm(false);
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  const vehicleFuelLogs = fuelLogs.filter((l) => l.vehicleId === vehicle.id);
  const vehicleServices = serviceRecords.filter((s) => s.vehicleId === vehicle.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVehicle({
      id: vehicle.id,
      make: make.trim(),
      model: model.trim(),
      registrationNumber: registrationNumber.trim(),
      category,
      startingOdometer: typeof startingOdometer === 'number' ? startingOdometer : 0,
      currentOdometer: typeof currentOdometer === 'number' ? currentOdometer : 0,
      insuranceExpiry,
      pucExpiry,
      notes: notes.trim(),
    });
    onClose();
  };

  const handleExecuteReset = () => {
    if (onResetVehicleData) {
      onResetVehicleData(vehicle.id);
    }
    setShowResetConfirm(false);
  };

  const handleExecuteDelete = () => {
    if (onDeleteVehicle) {
      onDeleteVehicle(vehicle.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl w-full max-w-[560px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Manage Vehicle</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                  {vehicle.registrationNumber}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Edit odometer, view fuel records, and manage lifecycle data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Refuel Logs
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {vehicleFuelLogs.length} Entries
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Service Logs
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {vehicleServices.length} Records
              </span>
            </div>
          </div>

          {/* Section: Vehicle Identity */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Manufacturer / Make
                </label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'four_wheeler' | 'two_wheeler')}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden cursor-pointer"
                >
                  <option value="four_wheeler">4-Wheeler (Car / SUV)</option>
                  <option value="two_wheeler">2-Wheeler (Bike / Scooter)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Odometer & Mileage Management (Requested Feature) */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-600" />
              <span>Odometer Baseline & Current</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Starting Odometer (KM)
                </label>
                <input
                  type="number"
                  value={startingOdometer}
                  onChange={(e) => setStartingOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Current Odometer (KM)
                </label>
                <input
                  type="number"
                  value={currentOdometer}
                  onChange={(e) => setCurrentOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500/80 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  required
                />
              </div>
            </div>

            {onOpenFuelHistoryForVehicle && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFuelHistoryForVehicle(vehicle);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>View / Edit Refuelling Data for {vehicle.registrationNumber}</span>
              </button>
            )}
          </div>

          {/* Compliance & Expiry */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compliance & Validity Dates</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Insurance Expiry
                </label>
                <input
                  type="date"
                  value={insuranceExpiry}
                  onChange={(e) => setInsuranceExpiry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  PUC Expiry
                </label>
                <input
                  type="date"
                  value={pucExpiry}
                  onChange={(e) => setPucExpiry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section: Reset All Data for this vehicle (User Requested Spec) */}
          <div className="bg-red-50/40 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Vehicle Data Reset & Management</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Reset All Data for this Vehicle</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Delete Vehicle</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Reset Data for {vehicle.registrationNumber}?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Are you sure you want to reset all data for this vehicle? This will permanently remove the vehicle's refuelling and mileage records.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Delete Vehicle {vehicle.registrationNumber}?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  This will completely remove this vehicle and its historical logs from your Auto Manager database.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
