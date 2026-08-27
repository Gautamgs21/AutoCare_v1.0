import React, { useState, useMemo } from 'react';
import { 
  History, 
  X, 
  ArrowLeft, 
  Fuel, 
  Search, 
  Filter, 
  Car, 
  Bike, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Gauge, 
  Calendar,
  Building2
} from 'lucide-react';
import { Vehicle, FuelLog, AppSettings } from '../types';
import { calculateVehicleMileageStats } from '../utils/calculations';

interface RefuellingHistoryModalProps {
  isOpen: boolean;
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  settings: AppSettings;
  onClose: () => void;
  onOpenLogFuel?: () => void;
  onDeleteLog?: (id: string) => void;
}

export const RefuellingHistoryModal: React.FC<RefuellingHistoryModalProps> = ({
  isOpen,
  vehicles,
  fuelLogs,
  settings,
  onClose,
  onOpenLogFuel,
  onDeleteLog,
}) => {
  const [selectedFilterVehicleId, setSelectedFilterVehicleId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Per-Vehicle Summary Table Statistics
  const vehicleSummaries = useMemo(() => {
    return vehicles.map((veh) => {
      const stats = calculateVehicleMileageStats(veh, fuelLogs);
      const vehLogs = fuelLogs.filter((l) => l.vehicleId === veh.id);
      const totalAmount = vehLogs.reduce((acc, l) => acc + (l.totalCost || 0), 0);
      const totalLitres = vehLogs.reduce((acc, l) => acc + (l.volumeLiters || 0), 0);

      return {
        vehicle: veh,
        currentMileage: stats.recentMileage, // Recent / Previous Refill Mileage
        overallMileage: stats.overallMileage,
        currentOdometer: veh.currentOdometer,
        totalAmount,
        totalLitres,
        refillCount: vehLogs.length,
      };
    });
  }, [vehicles, fuelLogs]);

  // Filtered Refuelling Records
  const filteredLogs = useMemo(() => {
    return fuelLogs
      .filter((log) => {
        const matchesVeh = selectedFilterVehicleId === 'ALL' || log.vehicleId === selectedFilterVehicleId;
        const matchesSearch =
          searchQuery === '' ||
          log.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.fuelCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesVeh && matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [fuelLogs, selectedFilterVehicleId, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[92vh]">
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
                <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Refuelling History & Mileage Summary</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Detailed efficiency analysis and log ledger grouped by Vehicle ID
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

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* SECTION 1: Summary Table by Vehicle */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Fleet Mileage & Expense Summary
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                {vehicles.length} Vehicles Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4 text-right">Current Mileage</th>
                    <th className="py-3 px-4 text-right">Overall Mileage</th>
                    <th className="py-3 px-4 text-right">Odometer</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vehicleSummaries.map((summary) => (
                    <tr key={summary.vehicle.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                            {summary.vehicle.category === 'two_wheeler' ? (
                              <Bike className="w-4 h-4" />
                            ) : (
                              <Car className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="block">{summary.vehicle.registrationNumber}</span>
                            <span className="text-[10px] font-normal text-slate-400 block">
                              {summary.vehicle.make} {summary.vehicle.model}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                        {summary.currentMileage > 0 ? `${summary.currentMileage} km/L` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-blue-600 dark:text-blue-400">
                        {summary.overallMileage > 0 ? `${summary.overallMileage} km/L` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {summary.currentOdometer.toLocaleString()} km
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                        {settings.currency}{summary.totalAmount.toLocaleString()}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {summary.totalLitres} L
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Filters & Detailed Log Ledger */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs or company..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                  />
                </div>

                <select
                  value={selectedFilterVehicleId}
                  onChange={(e) => setSelectedFilterVehicleId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/30 outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Vehicles</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.model})
                    </option>
                  ))}
                </select>
              </div>

              {onOpenLogFuel && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogFuel();
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span>Log New Refuel</span>
                </button>
              )}
            </div>

            {/* List of Refuelling Records */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 font-bold">
                        <Fuel className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {log.vehicleReg}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {log.fuelCompany} • {log.fuelType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{log.date}</span>
                          <span>•</span>
                          <span>Odo: {log.odometer.toLocaleString()} km</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <div className="text-right">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                          {settings.currency}{log.totalCost.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                          {log.volumeLiters} L @ {settings.currency}{log.ratePerLiter}/L
                        </span>
                      </div>

                      {onDeleteLog && (
                        <button
                          type="button"
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete fuel log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No refuelling records found matching the filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
