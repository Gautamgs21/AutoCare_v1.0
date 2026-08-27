import React, { useState, useEffect } from 'react';
import { Fuel, Calendar, Clock, Gauge, Save, X, ArrowLeft, ArrowRightLeft, DollarSign } from 'lucide-react';
import { FuelLog, FuelType, Vehicle, FuelRates, AppSettings } from '../types';
import confetti from 'canvas-confetti';

interface LogFuelModalProps {
  isOpen: boolean;
  vehicles: Vehicle[];
  fuelRates: FuelRates;
  settings: AppSettings;
  selectedVehicle?: Vehicle | null;
  onClose: () => void;
  onSave: (fuelLog: FuelLog) => void;
}

export const LogFuelModal: React.FC<LogFuelModalProps> = ({
  isOpen,
  vehicles,
  fuelRates,
  settings,
  selectedVehicle,
  onClose,
  onSave,
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [fuelCompany, setFuelCompany] = useState('IndianOil (IOCL)');
  const [fuelType, setFuelType] = useState<FuelType>('Normal E20');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [odometer, setOdometer] = useState<number | ''>('');
  const [ratePerLiter, setRatePerLiter] = useState<number | ''>(fuelRates.normalE20);
  const [volumeLiters, setVolumeLiters] = useState<number | ''>(25.0);
  const [totalCost, setTotalCost] = useState<number | ''>(2561.25);
  const [lastEditedField, setLastEditedField] = useState<'volume' | 'cost'>('volume');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (selectedVehicle) {
        setVehicleId(selectedVehicle.id);
        setOdometer(selectedVehicle.currentOdometer + 150);
      } else if (vehicles.length > 0) {
        setVehicleId(vehicles[0].id);
        setOdometer(vehicles[0].currentOdometer + 120);
      }

      const initialRate = fuelRates.normalE20;
      setRatePerLiter(initialRate);
      setVolumeLiters(25.0);
      setTotalCost(parseFloat((25.0 * initialRate).toFixed(2)));
      setLastEditedField('volume');
      setError(null);
    }
  }, [isOpen, selectedVehicle, vehicles, fuelRates]);

  // When fuel type changes, adjust default rate and recalculate
  const handleFuelTypeChange = (type: FuelType) => {
    setFuelType(type);
    const newRate = type === 'Xtra Premium' ? fuelRates.xtraPremium : fuelRates.normalE20;
    setRatePerLiter(newRate);

    if (lastEditedField === 'volume' && typeof volumeLiters === 'number' && volumeLiters > 0) {
      setTotalCost(parseFloat((volumeLiters * newRate).toFixed(2)));
    } else if (lastEditedField === 'cost' && typeof totalCost === 'number' && totalCost > 0 && newRate > 0) {
      setVolumeLiters(parseFloat((totalCost / newRate).toFixed(2)));
    }
  };

  // Mutual calculation: Rate per liter change
  const handleRateChange = (val: string) => {
    if (val === '') {
      setRatePerLiter('');
      return;
    }
    const rate = parseFloat(val);
    setRatePerLiter(rate);
    if (!isNaN(rate) && rate > 0) {
      if (lastEditedField === 'volume' && typeof volumeLiters === 'number' && volumeLiters > 0) {
        setTotalCost(parseFloat((rate * volumeLiters).toFixed(2)));
      } else if (lastEditedField === 'cost' && typeof totalCost === 'number' && totalCost > 0) {
        setVolumeLiters(parseFloat((totalCost / rate).toFixed(2)));
      }
    }
  };

  // Mutual calculation: Volume (Fuel Filled) changed -> computes Total Cost
  const handleVolumeChange = (val: string) => {
    setLastEditedField('volume');
    if (val === '') {
      setVolumeLiters('');
      return;
    }
    const vol = parseFloat(val);
    setVolumeLiters(vol);
    const currentRate = typeof ratePerLiter === 'number' ? ratePerLiter : fuelRates.normalE20;
    if (!isNaN(vol) && vol >= 0 && currentRate > 0) {
      setTotalCost(parseFloat((vol * currentRate).toFixed(2)));
    }
  };

  // Mutual calculation: Total Cost changed -> computes Volume (Fuel Filled)
  const handleTotalCostChange = (val: string) => {
    setLastEditedField('cost');
    if (val === '') {
      setTotalCost('');
      return;
    }
    const cost = parseFloat(val);
    setTotalCost(cost);
    const currentRate = typeof ratePerLiter === 'number' ? ratePerLiter : fuelRates.normalE20;
    if (!isNaN(cost) && cost >= 0 && currentRate > 0) {
      setVolumeLiters(parseFloat((cost / currentRate).toFixed(2)));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('Please select a vehicle.');
      return;
    }
    if (!odometer || Number(odometer) <= 0) {
      setError('Please provide an odometer reading.');
      return;
    }
    if (!volumeLiters || Number(volumeLiters) <= 0) {
      setError('Please provide the volume of fuel filled in liters.');
      return;
    }

    const currentVeh = vehicles.find((v) => v.id === vehicleId);

    const calculatedCost = typeof totalCost === 'number' && totalCost > 0
      ? totalCost
      : (Number(ratePerLiter) * Number(volumeLiters));

    const newLog: FuelLog = {
      id: `fuel-${Date.now()}`,
      vehicleId,
      vehicleReg: currentVeh ? currentVeh.registrationNumber : 'MH12 AB 1234',
      vehicleName: currentVeh ? `${currentVeh.make} ${currentVeh.model}` : 'Fleet Vehicle',
      fuelCompany,
      fuelType,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00 AM',
      odometer: Number(odometer),
      ratePerLiter: Number(ratePerLiter) || 102.45,
      volumeLiters: Number(volumeLiters),
      totalCost: parseFloat(calculatedCost.toFixed(2)),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(newLog);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
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
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Add Refuel Entry
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mutual auto-calculation for Fuel Volume & Total Cost
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-3.5 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Section 1: General Details */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Vehicle
              </label>
              <select
                value={vehicleId}
                onChange={(e) => {
                  setVehicleId(e.target.value);
                  const v = vehicles.find((item) => item.id === e.target.value);
                  if (v) setOdometer(v.currentOdometer + 50);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-medium"
                required
              >
                <option value="" disabled>Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Fuel Station / Company
              </label>
              <select
                value={fuelCompany}
                onChange={(e) => setFuelCompany(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-medium"
              >
                <option value="IndianOil (IOCL)">IndianOil (IOCL)</option>
                <option value="Bharat Petroleum (BPCL)">Bharat Petroleum (BPCL)</option>
                <option value="Hindustan Petroleum (HPCL)">Hindustan Petroleum (HPCL)</option>
                <option value="Shell Station">Shell Station</option>
                <option value="Jio-bp (Reliance-BP)">Jio-bp (Reliance-BP)</option>
                <option value="Nayara Energy">Nayara Energy</option>
                <option value="Other">Other Fuel Station</option>
              </select>
            </div>

            {/* Type of Petrol Segmented Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Fuel Grade
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleFuelTypeChange('Normal E20')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    fuelType === 'Normal E20'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Normal E20
                </button>
                <button
                  type="button"
                  onClick={() => handleFuelTypeChange('Xtra Premium')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    fuelType === 'Xtra Premium'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Xtra Premium
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Time & Date */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Telemetry & Mutual Calculation Inputs */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Current Odometer (KM)
              </label>
              <div className="relative">
                <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 45020"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-semibold"
                  required
                />
              </div>
            </div>

            {/* Rate / Liter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Rate / Liter ({settings.currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={ratePerLiter}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="102.45"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-semibold"
                required
              />
            </div>

            {/* Mutual Calculation Fields */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Mutual Calculation (Enter Either Field)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Fuel Filled */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Fuel Filled (Liters)
                  </label>
                  <div className="relative">
                    <Fuel className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      step="0.01"
                      value={volumeLiters}
                      onChange={(e) => handleVolumeChange(e.target.value)}
                      placeholder="e.g. 25.0"
                      className={`w-full bg-white dark:bg-slate-900 border rounded-xl py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-hidden font-bold transition-all ${
                        lastEditedField === 'volume'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Total Cost */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Total Cost ({settings.currency})
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {settings.currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={totalCost}
                      onChange={(e) => handleTotalCostChange(e.target.value)}
                      placeholder="e.g. 2500"
                      className={`w-full bg-white dark:bg-slate-900 border rounded-xl py-2 pl-8 pr-3 text-sm text-slate-900 dark:text-white outline-hidden font-bold transition-all ${
                        lastEditedField === 'cost'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                {lastEditedField === 'volume' 
                  ? `Volume entered (${volumeLiters || 0} L) × Rate (${settings.currency}${ratePerLiter || 0}) = Total ${settings.currency}${Number(totalCost || 0).toFixed(2)}`
                  : `Total Cost (${settings.currency}${totalCost || 0}) ÷ Rate (${settings.currency}${ratePerLiter || 0}) = Volume ${Number(volumeLiters || 0).toFixed(2)} L`
                }
              </div>
            </div>
          </section>

          {/* Section 4: Notes */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Driver remarks or station location..."
              rows={2}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden resize-none"
            />
          </section>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="save-fuel-log-btn"
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Refuel Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
