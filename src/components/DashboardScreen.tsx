import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  Wrench, 
  Car, 
  Bike, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  Gauge,
  TrendingUp,
  Sparkles,
  Calendar,
  Zap,
  Clock,
  ArrowRight,
  Calculator,
  History,
  Edit2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award
} from 'lucide-react';
import { Vehicle, FuelLog, ServiceRecord, PriorityItem, AppSettings, NavTab, FuelRates } from '../types';
import { calculateAllVehicleStats, formatDateDMY } from '../utils/calculations';
import { getDaysAlert, getKmAlert } from '../utils/alertUtils';

interface DashboardScreenProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  serviceRecords: ServiceRecord[];
  priorities: PriorityItem[];
  settings: AppSettings;
  fuelRates?: FuelRates;
  onOpenAddVehicle: () => void;
  onOpenLogFuel: () => void;
  onOpenLogService: () => void;
  onOpenCheckMileage: () => void;
  onOpenRefuellingHistory: () => void;
  onOpenGoogleSheetModal?: () => void;
  onSelectPriority: (item: PriorityItem) => void;
  onNavigateTab?: (tab: NavTab) => void;
  onEditVehicle?: (veh: Vehicle) => void;
  onOpenEditVehicleManage?: (veh: Vehicle) => void;
  onOpenLogFuelForVehicle?: (veh: Vehicle) => void;
  onOpenLogServiceForVehicle?: (veh: Vehicle) => void;
  onUpdateFuelRates?: (rates: FuelRates) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  vehicles,
  fuelLogs,
  serviceRecords,
  priorities,
  settings,
  fuelRates = { normalE20: 102.45, xtraPremium: 108.9, lastUpdated: 'Today' },
  onOpenAddVehicle,
  onOpenLogFuel,
  onOpenLogService,
  onOpenCheckMileage,
  onOpenRefuellingHistory,
  onSelectPriority,
  onNavigateTab,
  onEditVehicle,
  onOpenEditVehicleManage,
  onOpenLogFuelForVehicle,
  onOpenLogServiceForVehicle,
  onUpdateFuelRates,
}) => {
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  const [isEditingRates, setIsEditingRates] = useState(false);
  const [normalRate, setNormalRate] = useState<number>(fuelRates.normalE20);
  const [xtraRate, setXtraRate] = useState<number>(fuelRates.xtraPremium);

  const toggleExpand = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNav = (tab: NavTab) => {
    if (onNavigateTab) onNavigateTab(tab);
  };

  // Calculations map per VehicleID
  const vehicleStatsMap = useMemo(() => {
    return calculateAllVehicleStats(vehicles, fuelLogs, serviceRecords);
  }, [vehicles, fuelLogs, serviceRecords]);

  const vehicleStatsList = useMemo(() => {
    return Object.values(vehicleStatsMap);
  }, [vehicleStatsMap]);

  // Aggregate metrics
  const totalFuelCost = fuelLogs.reduce((acc, l) => acc + (l.totalCost || 0), 0);
  const totalServiceCost = serviceRecords.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  const totalExpense = totalFuelCost + totalServiceCost;
  const totalFleetDistance = vehicleStatsList.reduce((acc, v) => acc + v.totalDistanceDriven, 0);
  const totalFuelLiters = vehicleStatsList.reduce((acc, v) => acc + v.totalFuelLiters, 0);

  const fleetAvgMileage = totalFuelLiters > 0 && totalFleetDistance > 0 
    ? Math.round((totalFleetDistance / totalFuelLiters) * 10) / 10 
    : 0;

  // Best mileage vehicle
  const bestMileageVehicle = [...vehicleStatsList]
    .filter((v) => v.overallMileage > 0 || v.recentMileage > 0)
    .sort((a, b) => Math.max(b.overallMileage, b.recentMileage) - Math.max(a.overallMileage, a.recentMileage))[0];

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateFuelRates) {
      onUpdateFuelRates({
        ...fuelRates,
        normalE20: normalRate,
        xtraPremium: xtraRate,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
    setIsEditingRates(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* 1. PRIMARY ACTION CONTROLS & FUEL RATE BANNER (Specification Mandate)     */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header Label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Vehicle Fuel Tracking Hub
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Precision fuel telemetry and per-vehicle mileage monitoring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddVehicle}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>

        {/* 3 Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Button 1: Enter Refuelling Data */}
          <button
            id="btn-enter-refuelling-data"
            type="button"
            onClick={onOpenLogFuel}
            className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-md transition-all flex items-center gap-3.5 cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold block tracking-tight">
                Enter Refuelling Data
              </span>
              <span className="text-[11px] text-emerald-100 block">
                Log Litres, Amount & Odo
              </span>
            </div>
          </button>

          {/* Button 2: Check Mileage */}
          <button
            id="btn-check-mileage"
            type="button"
            onClick={onOpenCheckMileage}
            className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-md transition-all flex items-center gap-3.5 cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-500/50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold block tracking-tight">
                Check Mileage
              </span>
              <span className="text-[11px] text-blue-100 block">
                Instant Efficiency Calculator
              </span>
            </div>
          </button>

          {/* Button 3: Refuelling History */}
          <button
            id="btn-refuelling-history"
            type="button"
            onClick={onOpenRefuellingHistory}
            className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-98 text-white shadow-md transition-all flex items-center gap-3.5 cursor-pointer group text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-800 dark:bg-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold block tracking-tight">
                Refuelling History
              </span>
              <span className="text-[11px] text-slate-300 block">
                Summary Table & Log Ledger
              </span>
            </div>
          </button>
        </div>

        {/* FUEL RATE DISPLAY & BENCHMARKS */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  FUEL RATE
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live Benchmarks
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Used for auto-calculating liters & amounts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <span className="text-slate-400 mr-1.5">Normal E20:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {settings.currency}{fuelRates.normalE20.toFixed(2)}/L
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <span className="text-slate-400 mr-1.5">Xtra Premium:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {settings.currency}{fuelRates.xtraPremium.toFixed(2)}/L
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingRates(!isEditingRates)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingRates ? 'Cancel' : 'Edit Rates'}</span>
            </button>
          </div>
        </div>

        {/* Inline Rate Editor */}
        {isEditingRates && (
          <form onSubmit={handleSaveRates} className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Normal E20:
              </label>
              <input
                type="number"
                step="0.01"
                value={normalRate}
                onChange={(e) => setNormalRate(Number(e.target.value))}
                className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Xtra Premium:
              </label>
              <input
                type="number"
                step="0.01"
                value={xtraRate}
                onChange={(e) => setXtraRate(Number(e.target.value))}
                className="w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer ml-auto"
            >
              Update Rates
            </button>
          </form>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. SPECIFICATION VEHICLE CARDS (Previous & Overall Fuel Efficiency)        */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fleet Vehicle Cards
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {vehicles.length} Active
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Click card to reveal Insurance, PUC & Service
          </span>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle) => {
            const stats = vehicleStatsMap[vehicle.id];
            const isExpanded = Boolean(expandedCardIds[vehicle.id]);

            // Alert levels for Insurance, PUC, and Service
            const insuranceAlert = getDaysAlert(stats?.insuranceDaysLeft);
            const pucAlert = getDaysAlert(stats?.pucDaysLeft);
            const serviceDaysAlert = getDaysAlert(stats?.serviceDaysLeft);
            const serviceKmAlert = getKmAlert(stats?.serviceKmLeft);

            return (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Card Header: Icon, Reg No, Edit Button [Edit ✎] */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {vehicle.category === 'two_wheeler' ? (
                          <Bike className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                            {vehicle.registrationNumber}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {vehicle.category === 'two_wheeler' ? '2W' : '4W'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {vehicle.model} • {vehicle.make}
                        </p>
                      </div>
                    </div>

                    {/* [Edit ✎] button: opens Vehicle Management modal */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenEditVehicleManage) onOpenEditVehicleManage(vehicle);
                        else if (onEditVehicle) onEditVehicle(vehicle);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Manage Starting Odometer & Vehicle Data"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit ✎</span>
                    </button>
                  </div>

                  {/* Core Fuel Efficiency Metrics (Previous & Overall) */}
                  <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                    {/* Previous Fuel Efficiency */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Previous Fuel Efficiency
                      </span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {stats && stats.recentMileage > 0 ? `${stats.recentMileage} km/L` : '12.05 km/L (Demo)'}
                      </span>
                    </div>

                    {/* Overall Fuel Efficiency */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Overall Fuel Efficiency
                      </span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {stats && stats.overallMileage > 0 ? `${stats.overallMileage} km/L` : '11.81 km/L (Demo)'}
                      </span>
                    </div>
                  </div>

                  {/* Insurance & PUC Alerts (Visible by Default) */}
                  <div className="mt-3 space-y-2">
                    {/* Insurance Row */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 flex items-center justify-between border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Insurance
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {formatDateDMY(vehicle.insuranceExpiry)}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 ${insuranceAlert.badgeClass}`}>
                        {insuranceAlert.label}
                      </span>
                    </div>

                    {/* PUC Row */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 flex items-center justify-between border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            PUC Certificate
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {formatDateDMY(vehicle.pucExpiry)}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 ${pucAlert.badgeClass}`}>
                        {pucAlert.label}
                      </span>
                    </div>
                  </div>

                  {/* Click to Expand Button */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(vehicle.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Extra Telemetry' : 'Click to Expand (Odometer & Service)'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* EXPANDED SECTION */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                      {/* Odometer Details */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Starting Odometer
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white block mt-0.5">
                            {vehicle.startingOdometer.toLocaleString()} km
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            Current Odometer
                          </span>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            {vehicle.currentOdometer.toLocaleString()} km
                          </span>
                        </div>
                      </div>

                      {/* Scheduled Service Due */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-violet-500" />
                            <span>{stats?.nextServiceItem || 'Scheduled Periodic Service'}</span>
                          </div>
                          <span>{stats?.nextServiceKm ? `${stats.nextServiceKm.toLocaleString()} km` : '-'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Time Period</span>
                            <span className={`text-[10px] font-extrabold inline-block mt-0.5 px-1.5 py-0.5 rounded ${serviceDaysAlert.badgeClass}`}>
                              {serviceDaysAlert.label}
                            </span>
                          </div>

                          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Distance Interval</span>
                            <span className={`text-[10px] font-extrabold inline-block mt-0.5 px-1.5 py-0.5 rounded ${serviceKmAlert.badgeClass}`}>
                              {serviceKmAlert.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Log Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenLogFuelForVehicle && onOpenLogFuelForVehicle(vehicle)}
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        >
                          <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ Log Fuel</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenLogServiceForVehicle && onOpenLogServiceForVehicle(vehicle)}
                          className="py-2 px-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-violet-200 dark:border-violet-800"
                        >
                          <Wrench className="w-3.5 h-3.5 text-violet-600" />
                          <span>+ Service</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FLEET AGGREGATE SUMMARY & BEST MILEAGE CARDS                           */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
              Total Fleet Expenses
            </p>
            <h3 className="text-2xl font-black mt-1">
              {settings.currency}{totalExpense.toLocaleString()}
            </h3>
            <p className="text-xs text-emerald-100 mt-2">
              {fuelLogs.length} Refills • {serviceRecords.length} Services
            </p>
          </div>
          <div className="pt-4 border-t border-emerald-500/40 text-xs text-emerald-100 flex items-center justify-between">
            <span>Distance: {totalFleetDistance.toLocaleString()} km</span>
            <span>Avg: {fleetAvgMileage} km/L</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fleet Mileage Champion
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {bestMileageVehicle ? `${bestMileageVehicle.make} ${bestMileageVehicle.model}` : 'Honda Activa 6G'}
            </h3>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {bestMileageVehicle ? `${bestMileageVehicle.overallMileage || bestMileageVehicle.recentMileage} km/L` : '12.05 km/L'} Efficiency
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleNav('analytics')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 hover:underline cursor-pointer"
          >
            <span>View All Efficiency Curves</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Fuel Consumed
            </span>
            <h3 className="text-2xl font-black text-white mt-1">
              {totalFuelLiters.toFixed(1)} Liters
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Across all {vehicles.length} registered vehicles
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRefuellingHistory}
            className="text-xs font-bold text-emerald-400 flex items-center justify-between pt-3 border-t border-slate-800 hover:underline cursor-pointer"
          >
            <span>Open Refuelling History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
