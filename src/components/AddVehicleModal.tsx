import React, { useState, useEffect } from 'react';
import { Car, Bike, Calendar, Leaf, Save, X, ArrowLeft } from 'lucide-react';
import { Vehicle, VehicleCategory, VehicleStatus } from '../types';
import confetti from 'canvas-confetti';

interface AddVehicleModalProps {
  isOpen: boolean;
  vehicleToEdit?: Vehicle | null;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  vehicleToEdit,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState<VehicleCategory>('four_wheeler');
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [startingOdometer, setStartingOdometer] = useState<number | ''>(0);
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [pucExpiry, setPucExpiry] = useState('');
  const [status, setStatus] = useState<VehicleStatus>('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicleToEdit) {
      setCategory(vehicleToEdit.category);
      setMake(vehicleToEdit.make);
      setModel(vehicleToEdit.model);
      setRegistrationNumber(vehicleToEdit.registrationNumber);
      setYear(vehicleToEdit.year);
      setStartingOdometer(vehicleToEdit.startingOdometer);
      setInsuranceExpiry(vehicleToEdit.insuranceExpiry);
      setPucExpiry(vehicleToEdit.pucExpiry);
      setStatus(vehicleToEdit.status);
    } else {
      setCategory('four_wheeler');
      setMake('Toyota');
      setModel('');
      setRegistrationNumber('');
      setYear(new Date().getFullYear());
      setStartingOdometer(0);
      const d1 = new Date();
      d1.setFullYear(d1.getFullYear() + 1);
      setInsuranceExpiry(d1.toISOString().split('T')[0]);
      const d2 = new Date();
      d2.setMonth(d2.getMonth() + 6);
      setPucExpiry(d2.toISOString().split('T')[0]);
      setStatus('ACTIVE');
    }
    setError(null);
  }, [vehicleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim()) {
      setError('Please enter a vehicle registration number (e.g., MH 12 AB 1234).');
      return;
    }
    if (!model.trim()) {
      setError('Please enter the vehicle model.');
      return;
    }

    const currentOdo = vehicleToEdit ? vehicleToEdit.currentOdometer : Number(startingOdometer) || 0;

    const newVehicle: Vehicle = {
      id: vehicleToEdit ? vehicleToEdit.id : `veh-${Date.now()}`,
      category,
      make: make || 'Custom',
      model: model.trim(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      year: Number(year) || new Date().getFullYear(),
      startingOdometer: Number(startingOdometer) || 0,
      currentOdometer: Math.max(Number(startingOdometer) || 0, currentOdo),
      insuranceExpiry: insuranceExpiry || '2027-01-01',
      pucExpiry: pucExpiry || '2027-01-01',
      status,
      createdAt: vehicleToEdit ? vehicleToEdit.createdAt : new Date().toISOString(),
    };

    onSave(newVehicle);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f7f9fb] dark:bg-slate-900 rounded-3xl w-full max-w-[560px] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {vehicleToEdit ? 'Edit Vehicle' : 'Add Vehicle'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-3.5 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Vehicle Category */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Vehicle Category
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setCategory('four_wheeler')}
                className={`relative flex flex-col items-center justify-center p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                  category === 'four_wheeler'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Car className="w-8 h-8 mb-1.5" />
                <span className="text-xs font-bold">Four Wheeler</span>
              </label>

              <label
                onClick={() => setCategory('two_wheeler')}
                className={`relative flex flex-col items-center justify-center p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                  category === 'two_wheeler'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Bike className="w-8 h-8 mb-1.5" />
                <span className="text-xs font-bold">Two Wheeler</span>
              </label>
            </div>
          </section>

          {/* Section 2: Basic Details */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Basic Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Make
                </label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                >
                  <option value="Toyota">Toyota</option>
                  <option value="Maruti Suzuki">Maruti Suzuki</option>
                  <option value="Honda">Honda</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Tata Motors">Tata Motors</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="BMW">BMW</option>
                  <option value="Ford">Ford</option>
                  <option value="Ashok Leyland">Ashok Leyland</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Swift, Camry, City, Transit"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Registration No.
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="MH 01 AB 1234"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm font-semibold tracking-wider uppercase text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Starting Odo
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={startingOdometer}
                      onChange={(e) => setStartingOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 pr-10 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      KM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Document Expiry */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Document Expiry
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Insurance Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Pollution Cert (PUC) Expiry
                </label>
                <div className="relative">
                  <Leaf className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={pucExpiry}
                    onChange={(e) => setPucExpiry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Fleet Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                >
                  <option value="ACTIVE">ACTIVE (Operational)</option>
                  <option value="RENEWAL DUE">RENEWAL DUE (Docs Expiring)</option>
                  <option value="MAINTENANCE">MAINTENANCE (In Workshop)</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="save-vehicle-submit-btn"
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{vehicleToEdit ? 'Update Vehicle' : 'Save Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
