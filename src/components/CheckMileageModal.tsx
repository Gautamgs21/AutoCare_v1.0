import React, { useState, useEffect, useMemo } from 'react';
import { Gauge, TrendingUp, X, ArrowLeft, Save, Car, Bike, Calculator, Sparkles } from 'lucide-react';
import { Vehicle, FuelLog, AppSettings } from '../types';
import confetti from 'canvas-confetti';

interface CheckMileageModalProps {
  isOpen: boolean;
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  settings: AppSettings;
  selectedVehicle?: Vehicle | null;
  onClose: () => void;
  onSaveOdometer?: (vehicleId: string, currentOdo: number, startingOdo: number) => void;
}

export const CheckMileageModal: React.FC<CheckMileageModalProps> = ({
  isOpen,
  vehicles,
  fuelLogs,
  settings,
  selectedVehicle,
  onClose,
  onSaveOdometer,
}) => {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [startingOdometer, setStartingOdometer] = useState<number | ''>('');
  const [currentOdometer, setCurrentOdometer] = useState<number | ''>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const activeVeh = selectedVehicle || vehicles[0];
      if (activeVeh) {
        setVehicleId(activeVeh.id);
        setStartingOdometer(activeVeh.startingOdometer);
        setCurrentOdometer(activeVeh.currentOdometer);
      }
      setSavedSuccess(false);
    }
  }, [isOpen, selectedVehicle, vehicles]);

  const currentVeh = useMemo(() => {
    return vehicles.find((v) => v.id === vehicleId) || vehicles[0];
  }, [vehicles, vehicleId]);

  // Logs strictly filtered for this VehicleID
  const vehicleFuelLogs = useMemo(() => {
    if (!vehicleId) return [];
    return fuelLogs
      .filter((l) => l.vehicleId === vehicleId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fuelLogs, vehicleId]);

  // Calculations based strictly on vehicle's fuel logs
  const mileageStats = useMemo(() => {
    const sortedByOdo = [...vehicleFuelLogs].sort((a, b) => (a.odometer || 0) - (b.odometer || 0));
    const totalFuelLitres = sortedByOdo.reduce((acc, l) => acc + (l.volumeLiters || 0), 0);
    const startOdo = typeof startingOdometer === 'number' ? startingOdometer : (currentVeh?.startingOdometer || 0);
    const currOdo = typeof currentOdometer === 'number' ? currentOdometer : (currentVeh?.currentOdometer || 0);
    const distanceDriven = Math.max(0, currOdo - startOdo);

    // Recent / Previous Mileage (Latest 2 logs interval: tank-to-tank)
    let recentMileage = 0;
    let recentTripDistance = 0;
    let recentLiters = 0;
    if (sortedByOdo.length >= 2) {
      const last = sortedByOdo[sortedByOdo.length - 1];
      const prev = sortedByOdo[sortedByOdo.length - 2];
      recentTripDistance = last.odometer - prev.odometer;
      recentLiters = last.volumeLiters;
      if (recentTripDistance > 0 && recentLiters > 0) {
        recentMileage = parseFloat((recentTripDistance / recentLiters).toFixed(2));
      }
    }

    // Overall Tracked Mileage (Across logged span)
    let overallMileage = 0;
    let trackedDistance = 0;
    let trackedLiters = 0;

    if (sortedByOdo.length >= 2) {
      const first = sortedByOdo[0];
      const last = sortedByOdo[sortedByOdo.length - 1];
      trackedDistance = last.odometer - first.odometer;
      trackedLiters = sortedByOdo.slice(1).reduce((acc, l) => acc + (l.volumeLiters || 0), 0);
      if (trackedDistance > 0 && trackedLiters > 0) {
        overallMileage = parseFloat((trackedDistance / trackedLiters).toFixed(2));
      }
    } else if (sortedByOdo.length === 1 && distanceDriven > 0 && totalFuelLitres > 0) {
      const singleRatio = distanceDriven / totalFuelLitres;
      if (singleRatio <= 100) {
        overallMileage = parseFloat(singleRatio.toFixed(2));
        recentMileage = overallMileage;
      }
    }

    return {
      distanceDriven,
      totalFuelLitres: parseFloat(totalFuelLitres.toFixed(2)),
      overallMileage,
      recentMileage,
      recentTripDistance,
      recentLiters,
      trackedDistance,
      trackedLiters: parseFloat(trackedLiters.toFixed(2)),
      logCount: sortedByOdo.length,
    };
  }, [vehicleFuelLogs, startingOdometer, currentOdometer, currentVeh]);

  if (!isOpen) return null;

  const handleVehicleChange = (id: string) => {
    setVehicleId(id);
    const v = vehicles.find((item) => item.id === id);
    if (v) {
      setStartingOdometer(v.startingOdometer);
      setCurrentOdometer(v.currentOdometer);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveOdometer && vehicleId && typeof currentOdometer === 'number') {
      onSaveOdometer(
        vehicleId,
        currentOdometer,
        typeof startingOdometer === 'number' ? startingOdometer : 0
      );
      setSavedSuccess(true);
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      } catch {}
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl w-full max-w-[540px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
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
                <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Check Mileage</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Instant fuel efficiency calculation per Vehicle ID
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Vehicle Select */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Selected Vehicle
            </label>
            <div className="relative">
              <select
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.make} {v.model} ({v.category === 'two_wheeler' ? '2-Wheeler' : '4-Wheeler'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Odometer Inputs */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Starting Odometer */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Starting Odometer (KM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={startingOdometer}
                    onChange={(e) => setStartingOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    km
                  </span>
                </div>
              </div>

              {/* Current Odometer */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Current Odometer (KM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentOdometer}
                    onChange={(e) => setCurrentOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 15420"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-500/80 rounded-xl py-2.5 px-3 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600">
                    km
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Total Distance Driven:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {mileageStats.distanceDriven.toLocaleString()} km
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Total Fuel Consumed:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {mileageStats.totalFuelLitres} Liters ({mileageStats.logCount} refills logged)
              </span>
            </div>
          </div>

          {/* Computed Mileage Result Card */}
          <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Calculated Mileage Output
              </span>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Previous / Current Mileage */}
              <div className="bg-emerald-700/60 p-3.5 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                  Previous Refill Mileage
                </span>
                <span className="text-2xl font-black tracking-tight block mt-1">
                  {mileageStats.recentMileage > 0 ? `${mileageStats.recentMileage} km/L` : 'Calculating'}
                </span>
                <span className="text-[10px] text-emerald-200/90 mt-0.5 block">
                  {mileageStats.recentTripDistance > 0 && mileageStats.recentLiters > 0
                    ? `${mileageStats.recentTripDistance} km ÷ ${mileageStats.recentLiters} L`
                    : 'Latest 2 refuel interval'}
                </span>
              </div>

              {/* Overall Mileage */}
              <div className="bg-emerald-700/60 p-3.5 rounded-xl border border-emerald-500/40">
                <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                  Overall Fuel Efficiency
                </span>
                <span className="text-2xl font-black tracking-tight block mt-1">
                  {mileageStats.overallMileage > 0 ? `${mileageStats.overallMileage} km/L` : 'Pending Logs'}
                </span>
                <span className="text-[10px] text-emerald-200/90 mt-0.5 block">
                  {mileageStats.trackedDistance > 0 && mileageStats.trackedLiters > 0
                    ? `${mileageStats.trackedDistance} km ÷ ${mileageStats.trackedLiters} L`
                    : 'Across tracked fill-ups'}
                </span>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500 rounded-full opacity-20 pointer-events-none" />
          </div>

          {/* Formula Transparency Explainer */}
          <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/70 text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
              How Mileage is Calculated (Standard Tank-to-Tank):
            </span>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">1. Previous Mileage:</strong> Distance traveled between the last 2 consecutive refuels divided by fuel filled at the latest refuel: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[10px]">(Odo₂ - Odo₁) ÷ Liters₂</code>.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">2. Overall Mileage:</strong> Total distance driven across all tracked refuels divided by total fuel consumed: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[10px]">(Odo_latest - Odo_first) ÷ Total Liters</code>.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savedSuccess ? 'Saved!' : 'Save Odometer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
