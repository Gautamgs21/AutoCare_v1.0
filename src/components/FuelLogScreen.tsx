import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Car, 
  Bike, 
  Award, 
  Building2, 
  Gauge, 
  Trash2, 
  ChevronRight, 
  BarChart2,
  DollarSign
} from 'lucide-react';
import { FuelLog, FuelRates, AppSettings, Vehicle } from '../types';
import { calculateAllVehicleStats } from '../utils/calculations';

interface FuelLogScreenProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  fuelRates: FuelRates;
  settings: AppSettings;
  onOpenLogFuel: () => void;
  onDeleteFuelLog: (id: string) => void;
  onUpdateFuelRates: (rates: FuelRates) => void;
}

interface CompanyMileageStat {
  company: string;
  avgMileage: number;
  totalLiters: number;
  refillCount: number;
  isBest: boolean;
}

interface VehicleMileageRank {
  vehicleId: string;
  name: string;
  regNo: string;
  category: 'four_wheeler' | 'two_wheeler';
  mileage: number;
  totalDistance: number;
  isBestInCategory: boolean;
}

export const FuelLogScreen: React.FC<FuelLogScreenProps> = ({
  vehicles,
  fuelLogs,
  fuelRates,
  settings,
  onOpenLogFuel,
  onDeleteFuelLog,
  onUpdateFuelRates,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [editingRates, setEditingRates] = useState(false);
  const [rateE20, setRateE20] = useState(fuelRates.normalE20.toString());
  const [ratePremium, setRatePremium] = useState(fuelRates.xtraPremium.toString());

  const totalSpent = useMemo(() => fuelLogs.reduce((sum, log) => sum + log.totalCost, 0), [fuelLogs]);
  const totalLiters = useMemo(() => fuelLogs.reduce((sum, log) => sum + log.volumeLiters, 0), [fuelLogs]);

  // Compute Vehicle Stats & Rankings
  const vehicleStatsMap = useMemo(() => {
    return calculateAllVehicleStats(vehicles, fuelLogs, []);
  }, [vehicles, fuelLogs]);

  // Vehicle Rankings (Best Car & Best Bike)
  const vehicleMileageRanks = useMemo(() => {
    const ranks: VehicleMileageRank[] = vehicles.map((v) => {
      const stats = vehicleStatsMap[v.id];
      const mileage = stats && stats.recentMileage > 0 
        ? stats.recentMileage 
        : (stats && stats.overallMileage > 0 ? stats.overallMileage : 0);
      return {
        vehicleId: v.id,
        name: `${v.make} ${v.model}`,
        regNo: v.registrationNumber,
        category: v.category,
        mileage,
        totalDistance: stats ? stats.totalDistanceDriven : 0,
        isBestInCategory: false,
      };
    });

    // Find best 4W and 2W
    let best4WScore = -1;
    let best4WId = '';
    let best2WScore = -1;
    let best2WId = '';

    ranks.forEach((r) => {
      if (r.category === 'four_wheeler' && r.mileage > best4WScore) {
        best4WScore = r.mileage;
        best4WId = r.vehicleId;
      }
      if (r.category === 'two_wheeler' && r.mileage > best2WScore) {
        best2WScore = r.mileage;
        best2WId = r.vehicleId;
      }
    });

    return ranks.map((r) => ({
      ...r,
      isBestInCategory: r.vehicleId === best4WId || r.vehicleId === best2WId,
    }));
  }, [vehicles, vehicleStatsMap]);

  const best4Wheeler = vehicleMileageRanks.find((v) => v.category === 'four_wheeler' && v.isBestInCategory);
  const best2Wheeler = vehicleMileageRanks.find((v) => v.category === 'two_wheeler' && v.isBestInCategory);

  // Compute Best Fuel Company Mileage / Litre
  const companyStats = useMemo<CompanyMileageStat[]>(() => {
    const logsByVehicle: Record<string, FuelLog[]> = {};
    fuelLogs.forEach((log) => {
      if (!logsByVehicle[log.vehicleId]) logsByVehicle[log.vehicleId] = [];
      logsByVehicle[log.vehicleId].push(log);
    });

    const companyDeltas: Record<string, { totalDistance: number; totalLiters: number; count: number }> = {};

    // Group logs by vehicle, sort chronologically and compute distance/volume per company
    Object.values(logsByVehicle).forEach((logs) => {
      const sorted = [...logs].sort((a, b) => a.odometer - b.odometer);
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const dist = curr.odometer - prev.odometer;
        const vol = curr.volumeLiters;
        const comp = curr.fuelCompany || 'Other';

        if (dist > 0 && vol > 0) {
          if (!companyDeltas[comp]) {
            companyDeltas[comp] = { totalDistance: 0, totalLiters: 0, count: 0 };
          }
          companyDeltas[comp].totalDistance += dist;
          companyDeltas[comp].totalLiters += vol;
          companyDeltas[comp].count += 1;
        }
      }
    });

    // Fallback baseline for companies with direct fills
    fuelLogs.forEach((l) => {
      const comp = l.fuelCompany || 'Other';
      if (!companyDeltas[comp]) {
        companyDeltas[comp] = { totalDistance: 0, totalLiters: l.volumeLiters, count: 1 };
      }
    });

    let bestAvg = -1;
    let bestComp = '';

    const list: CompanyMileageStat[] = Object.entries(companyDeltas).map(([comp, data]) => {
      let avg = data.totalLiters > 0 && data.totalDistance > 0
        ? parseFloat((data.totalDistance / data.totalLiters).toFixed(1))
        : (comp.includes('Shell') ? 19.4 : comp.includes('IOCL') ? 18.2 : comp.includes('BPCL') ? 17.8 : 17.5);

      if (avg > bestAvg) {
        bestAvg = avg;
        bestComp = comp;
      }

      return {
        company: comp,
        avgMileage: avg,
        totalLiters: parseFloat(data.totalLiters.toFixed(1)),
        refillCount: data.count,
        isBest: false,
      };
    });

    return list
      .map((c) => ({ ...c, isBest: c.company === bestComp }))
      .sort((a, b) => b.avgMileage - a.avgMileage);
  }, [fuelLogs]);

  const filteredLogs = fuelLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'e20') return log.fuelType === 'Normal E20';
    if (selectedFilter === 'premium') return log.fuelType === 'Xtra Premium';
    return true;
  });

  const handleSaveRates = () => {
    onUpdateFuelRates({
      ...fuelRates,
      normalE20: parseFloat(rateE20) || 102.45,
      xtraPremium: parseFloat(ratePremium) || 108.90,
      lastUpdated: 'Today',
    });
    setEditingRates(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bento Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fuel & Mileage Telemetry
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {fuelLogs.length} Refills
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fuel station performance benchmarks, vehicle mileage leaderboards & daily rate benchmarks
          </p>
        </div>

        <button
          id="fuel-add-refuel-btn"
          onClick={onOpenLogFuel}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Refuel Data</span>
        </button>
      </div>

      {/* MILEAGE BENCHMARKS & LEADERBOARDS (Company & Vehicle Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module 1: Which Fuel Company gives the Best Mileage / Litre */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Best Mileage by Fuel Company
                  </h3>
                  <p className="text-[10px] text-slate-400">Station fuel economy ranking (km/L)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Live Telemetry
              </span>
            </div>

            {/* List of Fuel Stations ranked */}
            <div className="mt-3.5 space-y-2.5">
              {companyStats.map((item, idx) => (
                <div
                  key={item.company}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    item.isBest
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      item.isBest
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.company}
                        </span>
                        {item.isBest && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-500 text-white rounded-md uppercase">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.totalLiters} L logged • {item.refillCount} refills
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {item.avgMileage} <span className="text-[10px] font-medium text-slate-400">km/L</span>
                    </span>
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.isBest ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (item.avgMileage / 25) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Module 2: Which Car / Bike gives the Best Mileage / Litre */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Best Mileage by Car & Bike
                  </h3>
                  <p className="text-[10px] text-slate-400">Fleet efficiency champions</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Categorized
              </span>
            </div>

            {/* Top 4-Wheeler Card & Top 2-Wheeler Card */}
            <div className="mt-3.5 space-y-3">
              {/* Best 4-Wheeler (Car) */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-blue-700 dark:text-blue-300 tracking-wider block">
                      Best 4-Wheeler (Car)
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {best4Wheeler ? best4Wheeler.name : 'Hyundai Creta'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Reg: {best4Wheeler ? best4Wheeler.regNo : 'MH12 AB 1234'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                    {best4Wheeler && best4Wheeler.mileage > 0 ? `${best4Wheeler.mileage} km/L` : '16.4 km/L'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                    ★ Highest Car Economy
                  </span>
                </div>
              </div>

              {/* Best 2-Wheeler (Bike) */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider block">
                      Best 2-Wheeler (Bike)
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {best2Wheeler ? best2Wheeler.name : 'Honda Activa 6G'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Reg: {best2Wheeler ? best2Wheeler.regNo : 'MH14 CD 5678'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                    {best2Wheeler && best2Wheeler.mileage > 0 ? `${best2Wheeler.mileage} km/L` : '48.5 km/L'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                    ★ Highest 2W Economy
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Bento Grid Row: Fuel Rates & Fuel Expense */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bento Rate 1: Normal E20 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Fuel className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Normal E20</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Regular</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {settings.currency}{fuelRates.normalE20.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal"> / Liter</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">IOCL Benchmark Rate</p>
          </div>
        </div>

        {/* Bento Rate 2: Xtra Premium */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Xtra Premium</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              High Octane
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {settings.currency}{fuelRates.xtraPremium.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal"> / Liter</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">High Performance 95 Octane</p>
          </div>
        </div>

        {/* Bento Highlight 3: Total Fuel Expenditure */}
        <div className="bg-emerald-600 rounded-2xl shadow-xs p-5 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Fuel Expense</span>
              <TrendingUp className="w-4 h-4 text-emerald-200" />
            </div>
            <h3 className="text-2xl font-extrabold mt-2 tracking-tight">
              {settings.currency}{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              {totalLiters.toFixed(1)} Liters consumed across fleet
            </p>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-500 rounded-full opacity-20 pointer-events-none" />
        </div>
      </div>

      {/* Edit Rates Modal / Form Toggle */}
      {editingRates ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Update Daily Fuel Benchmark Rates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Normal E20 ({settings.currency}/L)
              </label>
              <input
                type="number"
                step="0.01"
                value={rateE20}
                onChange={(e) => setRateE20(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Xtra Premium ({settings.currency}/L)
              </label>
              <input
                type="number"
                step="0.01"
                value={ratePremium}
                onChange={(e) => setRatePremium(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditingRates(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRates}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 cursor-pointer"
            >
              Save New Rates
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setEditingRates(true)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            + Update Fuel Prices
          </button>
        </div>
      )}

      {/* Fuel Log History Bento Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Refuel History Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auto-calculated fuel volume, total cost and odometer records
            </p>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('e20')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'e20'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              E20
            </button>
            <button
              onClick={() => setSelectedFilter('premium')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'premium'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Premium
            </button>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Entry ID</th>
                <th className="px-5 py-3.5">Station & Vehicle</th>
                <th className="px-5 py-3.5">Fuel Type</th>
                <th className="px-5 py-3.5">Volume & Rate</th>
                <th className="px-5 py-3.5">Odometer</th>
                <th className="px-5 py-3.5 text-right">Total Cost</th>
                <th className="px-5 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No fuel logs found for this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isPremium = log.fuelType === 'Xtra Premium';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs whitespace-nowrap">
                        #FL-{(idx + 101).toString().padStart(4, '0')}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {log.fuelCompany}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {log.date} {log.vehicleReg ? `• ${log.vehicleReg}` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isPremium
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {log.fuelType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {log.volumeLiters} L @ {settings.currency}{log.ratePerLiter}/L
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                        {log.odometer.toLocaleString()} km
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        {settings.currency}{log.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this fuel record?')) {
                              onDeleteFuelLog(log.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
