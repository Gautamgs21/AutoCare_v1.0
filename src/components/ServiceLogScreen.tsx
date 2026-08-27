import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Calendar, 
  Database,
  Search,
  Battery, 
  Disc, 
  Settings as OilIcon,
  Edit2,
  RotateCcw,
  Layers,
  Filter,
  Car,
  Bike
} from 'lucide-react';
import { ServiceRecord, PriorityItem, AppSettings, Vehicle } from '../types';
import { ServicesDBEntry } from '../data/servicesDB';
import { calculateServiceRecord, formatDateDMY } from '../utils/calculations';
import { storageService } from '../services/storageService';
import { EditServiceDBModal } from './EditServiceDBModal';

interface ServiceLogScreenProps {
  serviceRecords: ServiceRecord[];
  vehicles?: Vehicle[];
  priorities: PriorityItem[];
  settings: AppSettings;
  servicesDB?: ServicesDBEntry[];
  onOpenLogService: () => void;
  onOpenEditServiceRecord?: (record: ServiceRecord) => void;
  onDeleteServiceRecord: (id: string) => void;
  onSelectPriority: (priority: PriorityItem) => void;
  onUpdateServicesDB?: () => void;
}

export const ServiceLogScreen: React.FC<ServiceLogScreenProps> = ({
  serviceRecords,
  vehicles = [],
  priorities,
  settings,
  servicesDB: propServicesDB,
  onOpenLogService,
  onOpenEditServiceRecord,
  onDeleteServiceRecord,
  onSelectPriority,
  onUpdateServicesDB,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'catalog'>('records');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'Four Wheeler' | 'Two Wheeler'>('all');
  const [catalogClassification, setCatalogClassification] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Local state for Services DB entries
  const [dbEntries, setDbEntries] = useState<ServicesDBEntry[]>(() => {
    return propServicesDB || storageService.getServicesDB();
  });

  // Edit Service DB Rule Modal state
  const [isEditDBModalOpen, setIsEditDBModalOpen] = useState(false);
  const [dbEntryToEdit, setDbEntryToEdit] = useState<ServicesDBEntry | null>(null);
  const [dbEntryIndexToEdit, setDbEntryIndexToEdit] = useState<number | null>(null);

  // Sync dbEntries when prop changes or storage updates
  const currentDB = useMemo(() => {
    return propServicesDB || dbEntries;
  }, [propServicesDB, dbEntries]);

  // Extract unique classifications for dropdown filter & modal
  const existingClassifications = useMemo(() => {
    const set = new Set<string>();
    currentDB.forEach((item) => {
      if (item.classification && item.classification.trim()) {
        set.add(item.classification.trim());
      }
    });
    return Array.from(set);
  }, [currentDB]);

  // Map vehicle id to vehicle for lookup
  const vehicleMap = useMemo(() => {
    const map: Record<string, Vehicle> = {};
    vehicles.forEach((v) => {
      map[v.id] = v;
      map[v.registrationNumber] = v;
    });
    return map;
  }, [vehicles]);

  // Compute live calculations for all records using custom/active DB
  const enrichedRecords = useMemo(() => {
    return serviceRecords.map((rec) => {
      const veh = vehicleMap[rec.vehicleId] || vehicleMap[rec.vehicleReg];
      const category = veh?.category || 'four_wheeler';
      const currentOdo = veh?.currentOdometer || rec.odometer;
      const calc = calculateServiceRecord(rec, category, currentOdo, currentDB);
      return {
        ...rec,
        calc,
      };
    });
  }, [serviceRecords, vehicleMap, currentDB]);

  const filteredRecords = enrichedRecords.filter((rec) => {
    if (selectedCategory === 'all') return true;
    const typeStr = (rec.serviceType || rec.title || '').toLowerCase();
    return typeStr.includes(selectedCategory.toLowerCase());
  });

  const totalServiceCost = serviceRecords.reduce((sum, rec) => sum + (rec.totalCost || 0), 0);

  // Filtered Services DB Reference catalog
  const filteredCatalog = useMemo(() => {
    return currentDB.map((item, originalIndex) => ({ item, originalIndex })).filter(({ item }) => {
      const matchCat = catalogCategory === 'all' || item.vehicleCategory === catalogCategory;
      const matchClass = catalogClassification === 'all' || item.classification === catalogClassification;
      const matchSearch = catalogSearch === '' || 
        item.serviceType.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.classification.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchCat && matchClass && matchSearch;
    });
  }, [currentDB, catalogCategory, catalogClassification, catalogSearch]);

  const getServiceIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('battery')) return <Battery className="w-4 h-4 text-amber-600" />;
    if (t.includes('oil')) return <OilIcon className="w-4 h-4 text-blue-600" />;
    if (t.includes('wheel') || t.includes('tire') || t.includes('alignment')) return <Disc className="w-4 h-4 text-violet-600" />;
    return <Wrench className="w-4 h-4 text-emerald-600" />;
  };

  // Handlers for Services DB Editing
  const handleOpenAddDBRule = () => {
    setDbEntryToEdit(null);
    setDbEntryIndexToEdit(null);
    setIsEditDBModalOpen(true);
  };

  const handleOpenEditDBRule = (entry: ServicesDBEntry, index: number) => {
    setDbEntryToEdit(entry);
    setDbEntryIndexToEdit(index);
    setIsEditDBModalOpen(true);
  };

  const handleSaveDBEntry = (entry: ServicesDBEntry, index?: number) => {
    storageService.saveServicesDBEntry(entry, index);
    const updated = storageService.getServicesDB();
    setDbEntries(updated);
    if (onUpdateServicesDB) onUpdateServicesDB();
  };

  const handleDeleteDBEntry = (index: number) => {
    storageService.deleteServicesDBEntry(index);
    const updated = storageService.getServicesDB();
    setDbEntries(updated);
    if (onUpdateServicesDB) onUpdateServicesDB();
  };

  const handleResetDB = () => {
    if (window.confirm('Reset Master Services Database to default factory specifications? Custom rules will be reset.')) {
      storageService.resetServicesDB();
      const updated = storageService.getServicesDB();
      setDbEntries(updated);
      if (onUpdateServicesDB) onUpdateServicesDB();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bento Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Maintenance & Services
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {serviceRecords.length} Records Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Service intervals, Next Service Date & Km calculations, and Master Services DB
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab(activeTab === 'records' ? 'catalog' : 'records')}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border ${
              activeTab === 'catalog'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white border-transparent shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{activeTab === 'records' ? 'Services DB Reference' : 'View Service Logs'}</span>
          </button>

          <button
            id="services-log-service-btn"
            onClick={onOpenLogService}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Service</span>
          </button>
        </div>
      </div>

      {activeTab === 'records' ? (
        <>
          {/* Top Bento Grid Row: Priority Alerts & Service Valuation */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Priority Alerts Bento Box (Col 7) */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Top Maintenance & Service Alerts
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {priorities.length} Active
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                {priorities.slice(0, 3).map((item) => {
                  const isOverdue = item.status === 'OVERDUE';
                  const isDueSoon = item.status === 'DUE SOON';

                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectPriority(item)}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-emerald-600">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {item.vehicleInfo}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isOverdue
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : isDueSoon
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Maintenance Cost Bento Card (Col 5) */}
            <div className="md:col-span-5 bg-slate-900 rounded-2xl shadow-xs p-6 text-white border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Total Service Expense
                  </span>
                  <Wrench className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                  {settings.currency}{totalServiceCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Parts, lubricants & workshop charges
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Avg / Service:</span>
                <span className="font-bold text-emerald-400">
                  {settings.currency}{(serviceRecords.length ? totalServiceCost / serviceRecords.length : 0).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Service History Bento Table with Calculations */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap justify-between items-center gap-3 bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Service Records & Interval Calculation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Dynamic next service dates & mileage thresholds calculated via Services DB
                </p>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategory('periodic')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === 'periodic'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Periodic
                </button>
                <button
                  onClick={() => setSelectedCategory('oil')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === 'oil'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Oil
                </button>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Vehicle</th>
                    <th className="px-4 py-3.5">Service Details</th>
                    <th className="px-4 py-3.5">Date & Odo</th>
                    <th className="px-4 py-3.5">Next Service Due</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Cost</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                        No service records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const { calc } = record;
                      return (
                        <tr
                          key={record.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {record.vehicleName || record.vehicleReg}
                            </p>
                            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                              {record.vehicleReg}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                {getServiceIcon(record.title || record.serviceType)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {record.title || record.serviceType}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                                    {record.serviceType}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    • {record.workshopName || 'Workshop'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {formatDateDMY(record.serviceDate)}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {record.odometer.toLocaleString()} km
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {formatDateDMY(calc.nextServiceDate)}
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {calc.nextServiceKm.toLocaleString()} km ({calc.kmTillNextService.toLocaleString()} km left)
                            </div>
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                calc.status === 'OVERDUE'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-900'
                                  : calc.status === 'DUE SOON'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-900'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 border border-emerald-200 dark:border-emerald-900'
                              }`}
                            >
                              {calc.status}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                            {settings.currency}{record.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {onOpenEditServiceRecord && (
                                <button
                                  onClick={() => onOpenEditServiceRecord(record)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                  title="Edit Service Record"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete service record for ${record.vehicleReg}?`)) {
                                    onDeleteServiceRecord(record.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Services DB Catalog Reference & Editor Tab */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Master Services Database &amp; Reference Rules
                  </h3>
                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    {currentDB.length} Rules
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard factory service intervals. Click &quot;Edit ✎&quot; on any rule to modify its interval, time period, or classification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDB}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  title="Reset to factory default rules"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddDBRule}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Service Rule</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search service rule..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setCatalogCategory('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      catalogCategory === 'all'
                        ? 'bg-slate-900 dark:bg-slate-700 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All ({currentDB.length})
                  </button>
                  <button
                    onClick={() => setCatalogCategory('Four Wheeler')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      catalogCategory === 'Four Wheeler'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    4-Wheelers
                  </button>
                  <button
                    onClick={() => setCatalogCategory('Two Wheeler')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      catalogCategory === 'Two Wheeler'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    2-Wheelers
                  </button>
                </div>
              </div>

              {/* Classification Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Classification:</span>
                </span>
                <select
                  value={catalogClassification}
                  onChange={(e) => setCatalogClassification(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden font-medium"
                >
                  <option value="all">All Classifications</option>
                  {existingClassifications.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Service Type / Name</th>
                    <th className="px-4 py-3">Mileage Interval</th>
                    <th className="px-4 py-3">Periodicity</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredCatalog.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No service rules matched your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalog.map(({ item, originalIndex }) => (
                      <tr key={originalIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.vehicleCategory === 'Four Wheeler'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          }`}>
                            {item.vehicleCategory}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {item.serviceType}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {item.mileageInterval.toLocaleString()} km
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.timePeriodMonths} {item.timePeriodMonths === 1 ? 'Month' : 'Months'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            {item.classification}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditDBRule(item, originalIndex)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit service details"
                            >
                              <Edit2 className="w-3 h-3 text-emerald-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete rule "${item.serviceType}"?`)) {
                                  handleDeleteDBEntry(originalIndex);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Service DB Rule Modal */}
      <EditServiceDBModal
        isOpen={isEditDBModalOpen}
        entryToEdit={dbEntryToEdit}
        entryIndex={dbEntryIndexToEdit}
        existingClassifications={existingClassifications}
        onClose={() => setIsEditDBModalOpen(false)}
        onSave={handleSaveDBEntry}
        onDelete={handleDeleteDBEntry}
      />
    </div>
  );
};
