import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Bike, 
  Plus, 
  Edit2, 
  MoreVertical, 
  Trash2, 
  Fuel, 
  Wrench, 
  Search, 
  Gauge,
  TrendingUp,
  Clock,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Vehicle, FuelLog, ServiceRecord } from '../types';
import { calculateAllVehicleStats, formatDateDMY } from '../utils/calculations';
import { getDaysAlert, getKmAlert } from '../utils/alertUtils';

interface VehiclesScreenProps {
  vehicles: Vehicle[];
  fuelLogs?: FuelLog[];
  serviceRecords?: ServiceRecord[];
  onOpenAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onViewHistory?: (vehicle: Vehicle) => void;
  onOpenLogFuelForVehicle: (vehicle: Vehicle) => void;
  onOpenLogServiceForVehicle: (vehicle: Vehicle) => void;
}

export const VehiclesScreen: React.FC<VehiclesScreenProps> = ({
  vehicles,
  fuelLogs = [],
  serviceRecords = [],
  onOpenAddVehicle,
  onEditVehicle,
  onDeleteVehicle,
  onViewHistory,
  onOpenLogFuelForVehicle,
  onOpenLogServiceForVehicle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'four_wheeler' | 'two_wheeler'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Set of expanded vehicle IDs (click to expand)
  const [expandedVehicleIds, setExpandedVehicleIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedVehicleIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    vehicles.forEach((v) => { allExpanded[v.id] = true; });
    setExpandedVehicleIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedVehicleIds({});
  };

  const vehicleStatsMap = useMemo(() => {
    return calculateAllVehicleStats(vehicles, fuelLogs, serviceRecords);
  }, [vehicles, fuelLogs, serviceRecords]);

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      v.registrationNumber.toLowerCase().includes(q) ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header Bento Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fleet Vehicles & Compliance
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {vehicles.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Insurance, PUC compliance and on-demand telemetry expansion
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={Object.keys(expandedVehicleIds).some((k) => expandedVehicleIds[k]) ? collapseAll : expandAll}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {Object.keys(expandedVehicleIds).some((k) => expandedVehicleIds[k]) ? 'Collapse All' : 'Expand All'}
          </button>

          <button
            id="vehicles-add-btn"
            onClick={onOpenAddVehicle}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by registration number, make, or model..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
          />
        </div>

        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            onClick={() => setCategoryFilter('four_wheeler')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'four_wheeler'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            4-Wheelers
          </button>
          <button
            onClick={() => setCategoryFilter('two_wheeler')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              categoryFilter === 'two_wheeler'
                ? 'bg-slate-900 dark:bg-slate-800 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2-Wheelers
          </button>
        </div>
      </div>

      {/* Bento Grid: Vehicle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No fleet vehicles match</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {searchQuery ? 'Try clearing your search query.' : 'Add your first vehicle to start tracking compliance.'}
            </p>
            <button
              onClick={onOpenAddVehicle}
              className="px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle Now</span>
            </button>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => {
            const stats = vehicleStatsMap[vehicle.id];
            const isExpanded = Boolean(expandedVehicleIds[vehicle.id]);

            // Alert levels for Insurance, PUC, and Service
            const insuranceAlert = getDaysAlert(stats?.insuranceDaysLeft);
            const pucAlert = getDaysAlert(stats?.pucDaysLeft);
            const serviceDaysAlert = getDaysAlert(stats?.serviceDaysLeft);
            const serviceKmAlert = getKmAlert(stats?.serviceKmLeft);

            return (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Bar: Icon, Reg No, Make/Model, 3-dots Menu */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {vehicle.category === 'two_wheeler' ? (
                          <Bike className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                            {vehicle.registrationNumber}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {vehicle.category === 'two_wheeler' ? '2W' : '4W'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {vehicle.make} {vehicle.model} • {vehicle.year}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        id={`veh-menu-btn-${vehicle.id}`}
                        onClick={() => setActiveMenuId(activeMenuId === vehicle.id ? null : vehicle.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        aria-label="Vehicle options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === vehicle.id && (
                        <div className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs font-semibold animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => {
                              onEditVehicle(vehicle);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Vehicle</span>
                          </button>
                          <button
                            onClick={() => {
                              onOpenLogFuelForVehicle(vehicle);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2 cursor-pointer"
                          >
                            <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Log Fuel</span>
                          </button>
                          <button
                            onClick={() => {
                              onOpenLogServiceForVehicle(vehicle);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 flex items-center gap-2 cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5 text-violet-600" />
                            <span>Log Service</span>
                          </button>
                          <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${vehicle.registrationNumber} from fleet?`)) {
                                onDeleteVehicle(vehicle.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ONLY Insurance and PUC Visible on default card */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    {/* Insurance Row */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 flex items-center justify-between border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100/70 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Insurance Due
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {formatDateDMY(vehicle.insuranceExpiry)}
                          </span>
                        </div>
                      </div>

                      {/* Criteria Alert Badge */}
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 ${insuranceAlert.badgeClass}`}>
                        {insuranceAlert.label}
                      </span>
                    </div>

                    {/* PUC Certificate Row */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 flex items-center justify-between border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100/70 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            PUC Certificate
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            {formatDateDMY(vehicle.pucExpiry)}
                          </span>
                        </div>
                      </div>

                      {/* Criteria Alert Badge */}
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg shrink-0 ${pucAlert.badgeClass}`}>
                        {pucAlert.label}
                      </span>
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => toggleExpand(vehicle.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Click to Expand (Mileage, Odo, Service)'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* EXPANDED TELEMETRY SECTION (Recent Mileage, Current Odometer, Service) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Mileage & Odometer Row */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Recent Mileage */}
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold block">
                            Recent Mileage
                          </span>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {stats && stats.recentMileage > 0 ? `${stats.recentMileage} km/L` : 'Calculating'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            Overall: {stats && stats.overallMileage > 0 ? `${stats.overallMileage} km/L` : 'Pending'}
                          </span>
                        </div>

                        {/* Current Odometer */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block">
                            Current Odometer
                          </span>
                          <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                            <Gauge className="w-3.5 h-3.5 text-blue-500" />
                            {stats ? stats.currentOdometer.toLocaleString() : vehicle.currentOdometer.toLocaleString()} km
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            Driven: +{stats ? stats.totalDistanceDriven.toLocaleString() : 0} km
                          </span>
                        </div>
                      </div>

                      {/* Next Service Due Box with Days & Km Criteria */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <Wrench className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                            <span className="truncate">{stats?.nextServiceItem || 'Periodic Service'}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Target: {stats?.nextServiceKm ? `${stats.nextServiceKm.toLocaleString()} km` : '-'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {/* Service Days Alert */}
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Time Period</span>
                            <span className={`text-[10px] font-extrabold inline-block mt-0.5 px-1.5 py-0.5 rounded ${serviceDaysAlert.badgeClass}`}>
                              {serviceDaysAlert.label}
                            </span>
                          </div>

                          {/* Service Km Alert */}
                          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/80">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Distance Interval</span>
                            <span className={`text-[10px] font-extrabold inline-block mt-0.5 px-1.5 py-0.5 rounded ${serviceKmAlert.badgeClass}`}>
                              {serviceKmAlert.label}
                            </span>
                          </div>
                        </div>

                        {stats?.nextServiceDate && (
                          <p className="text-[10px] text-slate-400 pt-0.5">
                            Target Due Date: <span className="font-semibold text-slate-600 dark:text-slate-300">{formatDateDMY(stats.nextServiceDate)}</span>
                          </p>
                        )}
                      </div>

                      {/* Quick Actions in Expanded View */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => onOpenLogFuelForVehicle(vehicle)}
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/80"
                        >
                          <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                          <span>+ Log Fuel</span>
                        </button>

                        <button
                          onClick={() => onOpenLogServiceForVehicle(vehicle)}
                          className="py-2 px-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-violet-200 dark:border-violet-800/80"
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
          })
        )}
      </div>
    </div>
  );
};
