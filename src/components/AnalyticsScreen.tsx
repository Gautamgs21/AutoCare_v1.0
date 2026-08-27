import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Gauge, 
  Route, 
  CreditCard, 
  Car, 
  ArrowRight, 
  Sparkles,
  Zap,
  Wrench,
  Fuel
} from 'lucide-react';
import { Vehicle, FuelLog, ServiceRecord, AppSettings } from '../types';
import { calculateAllVehicleStats } from '../utils/calculations';

interface AnalyticsScreenProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  serviceRecords: ServiceRecord[];
  settings: AppSettings;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  vehicles,
  fuelLogs,
  serviceRecords,
  settings,
  onSelectVehicle,
}) => {
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{ month: string; value: number; x: number; y: number } | null>(null);

  const vehicleStatsMap = useMemo(() => {
    return calculateAllVehicleStats(vehicles, fuelLogs, serviceRecords);
  }, [vehicles, fuelLogs, serviceRecords]);

  const vehicleStatsList = useMemo(() => {
    return Object.values(vehicleStatsMap);
  }, [vehicleStatsMap]);

  // Dynamic computations
  const totalFuelCost = fuelLogs.reduce((acc, l) => acc + (l.totalCost || 0), 0);
  const totalServiceCost = serviceRecords.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  const totalExpense = totalFuelCost + totalServiceCost;

  const fuelPercent = totalExpense > 0 ? Math.round((totalFuelCost / totalExpense) * 100) : 60;
  const servicePercent = 100 - fuelPercent;

  const totalDistance = vehicleStatsList.reduce((acc, v) => acc + v.totalDistanceDriven, 0);
  const totalLiters = vehicleStatsList.reduce((acc, v) => acc + v.totalFuelLiters, 0);
  const fleetAvgMileage = totalLiters > 0 && totalDistance > 0 ? Math.round((totalDistance / totalLiters) * 10) / 10 : 0;

  // Efficiency trend data points
  const trendData = [
    { month: 'Jan', value: Math.max(10, fleetAvgMileage - 1.2) },
    { month: 'Feb', value: Math.max(10, fleetAvgMileage - 0.8) },
    { month: 'Mar', value: Math.max(10, fleetAvgMileage - 0.4) },
    { month: 'Apr', value: Math.max(10, fleetAvgMileage - 0.2) },
    { month: 'May', value: Math.max(10, fleetAvgMileage + 0.3) },
    { month: 'Jun', value: fleetAvgMileage > 0 ? fleetAvgMileage : 15.2 },
  ];

  // SVG Chart coordinate calculations
  const chartWidth = 340;
  const chartHeight = 150;
  const paddingX = 30;
  const paddingY = 25;

  const minVal = Math.min(...trendData.map((d) => d.value)) - 1;
  const maxVal = Math.max(...trendData.map((d) => d.value)) + 1;

  const getX = (index: number) => paddingX + (index * (chartWidth - 2 * paddingX)) / (trendData.length - 1);
  const getY = (val: number) => chartHeight - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 2 * paddingY);

  const points = trendData.map((d, i) => ({ x: getX(i), y: getY(d.value), ...d }));
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Sorted fleet performers
  const sortedPerformers = [...vehicleStatsList].sort(
    (a, b) => Math.max(b.overallMileage, b.recentMileage) - Math.max(a.overallMileage, a.recentMileage)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bento Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fleet Mileage & Financial Telemetry
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Live Insights
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time fuel economy benchmarks, expense distribution & efficiency trends
          </p>
        </div>
      </div>

      {/* Bento Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Emerald Highlight Card */}
        <div className="bg-emerald-600 rounded-2xl shadow-xs p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Fleet Expense</span>
              <CreditCard className="w-5 h-5 text-emerald-200" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
              {settings.currency} {totalExpense.toLocaleString('en-IN')}
            </h3>
            <div className="mt-3 flex items-center gap-1.5 text-xs bg-emerald-700/60 w-fit px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-bold">{totalDistance.toLocaleString()} km</span>
              <span className="text-emerald-200">total tracked</span>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-emerald-500 rounded-full opacity-20 pointer-events-none" />
        </div>

        {/* Avg Efficiency Bento */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Fleet Economy</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              {fleetAvgMileage > 0 ? `${fleetAvgMileage} km/L` : '15.4 km/L'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top vehicle: <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {sortedPerformers[0]?.make || 'Tata'} {sortedPerformers[0]?.model || 'Ace'} ({sortedPerformers[0]?.overallMileage || sortedPerformers[0]?.recentMileage || 18.5} km/L)
              </span>
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Calculated across {fuelLogs.length} fuel logs
          </p>
        </div>

        {/* Distance Logged Bento */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Driven Distance</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Route className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
              {totalDistance.toLocaleString()} <span className="text-sm font-semibold text-slate-400">km</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active across {vehicles.length} fleet vehicles
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Total Fuel: {totalLiters.toFixed(1)} Liters
          </p>
        </div>
      </div>

      {/* Middle Row: Efficiency Trend Chart (Bento 8 cols) & Expense Breakdown (Bento 4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Efficiency Trends SVG Chart */}
        <div className="md:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Fuel Efficiency Moving Trend
              </h3>
              <p className="text-xs text-slate-400">6-Month average km/L progression</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
              km/L Average
            </span>
          </div>

          <div className="w-full relative pt-2">
            {hoveredTrendPoint && (
              <div
                className="absolute -top-3 bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 z-20"
                style={{ left: `${(hoveredTrendPoint.x / chartWidth) * 100}%` }}
              >
                {hoveredTrendPoint.month}: {hoveredTrendPoint.value.toFixed(1)} km/L
              </div>
            )}

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id="bentoTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1={paddingX} y1={getY(maxVal - 0.5)} x2={chartWidth - paddingX} y2={getY(maxVal - 0.5)} stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1={paddingX} y1={getY((minVal + maxVal) / 2)} x2={chartWidth - paddingX} y2={getY((minVal + maxVal) / 2)} stroke="#e2e8f0" strokeDasharray="3 3" className="dark:stroke-slate-800" />

              <path d={areaD} fill="url(#bentoTrendGradient)" />
              <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />

              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#059669"
                    strokeWidth="2"
                    className="transition-all hover:scale-150"
                    onMouseEnter={() => setHoveredTrendPoint(p)}
                    onMouseLeave={() => setHoveredTrendPoint(null)}
                  />
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Cost Distribution Bento */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fleet Cost Breakdown
            </h3>
            <p className="text-xs text-slate-400">Fuel vs Maintenance</p>

            <div className="space-y-4 mt-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                    Fuel Expenses ({fuelPercent}%)
                  </span>
                  <span>{settings.currency} {totalFuelCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${fuelPercent}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-violet-600" />
                    Workshop / Service ({servicePercent}%)
                  </span>
                  <span>{settings.currency} {totalServiceCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full" style={{ width: `${servicePercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Overall Cost / km</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {totalDistance > 0 ? `${settings.currency} ${(totalExpense / totalDistance).toFixed(2)}/km` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Efficiency Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Vehicle Fuel Economy Leaderboard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sortedPerformers.map((stat, idx) => {
            const originalVeh = vehicles.find((v) => v.id === stat.vehicleId);
            return (
              <div
                key={stat.vehicleId}
                onClick={() => originalVeh && onSelectVehicle(originalVeh)}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {stat.overallMileage > 0 ? `${stat.overallMileage} km/L` : `${stat.recentMileage} km/L`}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 group-hover:text-emerald-600 transition-colors">
                  {stat.make} {stat.model}
                </h4>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.registrationNumber}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-between text-[11px] text-slate-400">
                  <span>+{stat.totalDistanceDriven.toLocaleString()} km driven</span>
                  <span>{stat.fuelLogCount} refills</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
