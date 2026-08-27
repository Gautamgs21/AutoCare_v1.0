import React, { useState, useEffect, useMemo } from 'react';
import { Wrench, Calendar, Gauge, Save, X, ArrowLeft, Search, Plus, Check, Tag, Car, Bike, Info, Layers } from 'lucide-react';
import { ServiceRecord, Vehicle, AppSettings } from '../types';
import { ServicesDBEntry } from '../data/servicesDB';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface LogServiceModalProps {
  isOpen: boolean;
  vehicles: Vehicle[];
  settings: AppSettings;
  selectedVehicle?: Vehicle | null;
  recordToEdit?: ServiceRecord | null;
  servicesDB?: ServicesDBEntry[];
  onClose: () => void;
  onSave: (serviceRecord: Partial<ServiceRecord>) => void;
}

export const LogServiceModal: React.FC<LogServiceModalProps> = ({
  isOpen,
  vehicles,
  settings,
  selectedVehicle,
  recordToEdit,
  servicesDB: propServicesDB,
  onClose,
  onSave,
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceType, setServiceType] = useState<string>('Periodic Maintanence');
  const [title, setTitle] = useState('');
  const [odometer, setOdometer] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [technicianName, setTechnicianName] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskSearch, setTaskSearch] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load Services DB from props or storage
  const activeServicesDB = useMemo(() => {
    if (propServicesDB && propServicesDB.length > 0) return propServicesDB;
    return storageService.getServicesDB();
  }, [propServicesDB, isOpen]);

  // Extract ONLY unique Classification options from the Services DB Reference
  const availableClassifications = useMemo(() => {
    const set = new Set<string>();
    activeServicesDB.forEach((item) => {
      if (item.classification && item.classification.trim()) {
        set.add(item.classification.trim());
      }
    });
    const list = Array.from(set);
    return list.length > 0
      ? list
      : [
          'Periodic Maintanence',
          'Oil Change',
          'Inspection / Tuning',
          'Repair / Replacement',
          'General Service',
          'Paint Job',
          'Others',
        ];
  }, [activeServicesDB]);

  // Currently selected vehicle object
  const currentVeh = useMemo(() => {
    return vehicles.find((v) => v.id === vehicleId) || null;
  }, [vehicles, vehicleId]);

  // Normalized Vehicle Type: "Four Wheeler" or "Two Wheeler"
  const currentVehicleCategory: 'Four Wheeler' | 'Two Wheeler' = useMemo(() => {
    if (!currentVeh) return 'Four Wheeler';
    return currentVeh.category === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler';
  }, [currentVeh]);

  // Populate Services Completed based strictly on:
  // 1. Vehicle Type Selected (Four Wheeler / Two Wheeler)
  // 2. Service Type (Classification)
  const categoryAndClassTasks = useMemo(() => {
    if (!currentVehicleCategory || !serviceType) return [];

    const matchedEntries = activeServicesDB.filter((item) => {
      const matchCategory = item.vehicleCategory === currentVehicleCategory;
      const matchClass = item.classification.toLowerCase() === serviceType.toLowerCase();
      return matchCategory && matchClass;
    });

    const uniqueTaskNames = Array.from(new Set(matchedEntries.map((e) => e.serviceType)));
    return uniqueTaskNames;
  }, [activeServicesDB, currentVehicleCategory, serviceType]);

  // Initialize or populate when opening modal
  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        // Edit Mode
        setVehicleId(recordToEdit.vehicleId);
        setServiceDate(recordToEdit.serviceDate || new Date().toISOString().split('T')[0]);
        setServiceType(recordToEdit.serviceType || availableClassifications[0] || 'Periodic Maintanence');
        setTitle(recordToEdit.title || '');
        setOdometer(recordToEdit.odometer);
        setTotalCost(recordToEdit.totalCost);
        setTechnicianName(recordToEdit.technicianName || '');
        setWorkshopName(recordToEdit.workshopName || '');
        setSelectedTasks(recordToEdit.tasksCompleted || []);
        setRemarks(recordToEdit.remarks || '');
        setTaskSearch('');
        setError(null);
      } else {
        // Create Mode
        const now = new Date();
        setServiceDate(now.toISOString().split('T')[0]);

        const initialVeh = selectedVehicle || vehicles[0] || null;
        if (initialVeh) {
          setVehicleId(initialVeh.id);
          setOdometer(initialVeh.currentOdometer + 100);
        } else {
          setVehicleId('');
          setOdometer('');
        }

        const defaultClass = availableClassifications.includes('Periodic Maintanence')
          ? 'Periodic Maintanence'
          : availableClassifications[0] || 'General Service';
        
        setServiceType(defaultClass);
        setTitle(defaultClass);
        setTotalCost(1250);
        setTechnicianName('Master Technician');
        setWorkshopName('Apex Auto Care');
        setRemarks('');
        setTaskSearch('');
        setError(null);

        // Pre-select first task for convenience if available
        const vCat = initialVeh?.category === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler';
        const initialTasks = activeServicesDB
          .filter((s) => s.vehicleCategory === vCat && s.classification.toLowerCase() === defaultClass.toLowerCase())
          .map((s) => s.serviceType);
        
        setSelectedTasks(initialTasks.slice(0, 2));
      }
    }
  }, [isOpen, selectedVehicle, vehicles, recordToEdit, availableClassifications, activeServicesDB]);

  // When changing Service Type (Classification), if title was tracking classification or default, update title
  const handleServiceTypeChange = (newClassification: string) => {
    setServiceType(newClassification);
    if (!title || availableClassifications.includes(title)) {
      setTitle(newClassification);
    }
  };

  if (!isOpen) return null;

  const toggleTask = (task: string) => {
    if (selectedTasks.includes(task)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== task));
    } else {
      setSelectedTasks([...selectedTasks, task]);
      if (!title || title === serviceType) {
        setTitle(task);
      }
    }
  };

  const handleAddCustomTask = () => {
    const trimmed = taskSearch.trim();
    if (trimmed && !selectedTasks.includes(trimmed)) {
      setSelectedTasks([...selectedTasks, trimmed]);
      setTaskSearch('');
      if (!title || title === serviceType) {
        setTitle(trimmed);
      }
    }
  };

  const handleSelectAllCategoryTasks = () => {
    const merged = Array.from(new Set([...selectedTasks, ...categoryAndClassTasks]));
    setSelectedTasks(merged);
  };

  const handleClearSelectedTasks = () => {
    setSelectedTasks([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setError('Please choose a vehicle.');
      return;
    }
    if (!odometer || Number(odometer) <= 0) {
      setError('Please enter a valid odometer reading.');
      return;
    }
    if (totalCost === '' || Number(totalCost) < 0) {
      setError('Please enter the total bill amount.');
      return;
    }

    const currentV = vehicles.find((v) => v.id === vehicleId);

    const savedRecord: ServiceRecord = {
      id: recordToEdit ? recordToEdit.id : `srv-${Date.now()}`,
      vehicleId,
      vehicleReg: currentV ? currentV.registrationNumber : 'MH12 AB 1234',
      vehicleName: currentV ? `${currentV.make} ${currentV.model}` : 'Vehicle',
      serviceDate: serviceDate || new Date().toISOString().split('T')[0],
      serviceType: serviceType, // Classification from Services DB
      title: title.trim() || (selectedTasks[0] || serviceType),
      odometer: Number(odometer),
      totalCost: Number(totalCost),
      technicianName: technicianName.trim() || 'Service Technician',
      workshopName: workshopName.trim() || 'Authorized Workshop',
      tasksCompleted: selectedTasks.length > 0 ? selectedTasks : [serviceType],
      remarks: remarks.trim(),
      createdAt: recordToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(savedRecord);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {}
    onClose();
  };

  // Filter tasks by user search term
  const filteredTasks = categoryAndClassTasks.filter((t) =>
    t.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl w-full max-w-[580px] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
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
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {recordToEdit ? 'Edit Service Record' : 'Log Service'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categorized according to Services DB Reference
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
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs px-3.5 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Vehicle & Classification */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vehicle & Classification</span>
              </h3>
              {currentVeh && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  currentVehicleCategory === 'Two Wheeler'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}>
                  {currentVehicleCategory === 'Two Wheeler' ? <Bike className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                  <span>{currentVehicleCategory}</span>
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Choose Vehicle *
              </label>
              <select
                value={vehicleId}
                onChange={(e) => {
                  setVehicleId(e.target.value);
                  const v = vehicles.find((item) => item.id === e.target.value);
                  if (v && !recordToEdit) {
                    setOdometer(v.currentOdometer + 100);
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-medium"
                required
              >
                <option value="" disabled>Select vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} — {v.make} {v.model} ({v.category === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Service Types (Strictly from Classification in Services DB) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Service Type (DB Classification) *
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => handleServiceTypeChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-semibold"
                  required
                >
                  {availableClassifications.map((classificationOption) => (
                    <option key={classificationOption} value={classificationOption}>
                      {classificationOption}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Service Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Odometer Reading (KM) *
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 45000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Total Bill ({settings.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {settings.currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-8 pr-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Services Completed (Cascaded on Vehicle Category & Classification) */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Services Completed (DB Populated)</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Filtered by <strong>{currentVehicleCategory}</strong> &amp; <strong>{serviceType}</strong> ({categoryAndClassTasks.length} available)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {categoryAndClassTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllCategoryTasks}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                )}
                {selectedTasks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelectedTasks}
                    className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear ({selectedTasks.length})
                  </button>
                )}
              </div>
            </div>

            {/* Task search input within matching DB items */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  placeholder={`Search ${currentVehicleCategory} ${serviceType} services...`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>
              {taskSearch.trim() && (
                <button
                  type="button"
                  onClick={handleAddCustomTask}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom</span>
                </button>
              )}
            </div>

            {/* Cascaded Matching Service Tasks Pills */}
            {filteredTasks.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-44 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                {filteredTasks.map((task) => {
                  const isSelected = selectedTasks.includes(task);
                  return (
                    <button
                      key={task}
                      type="button"
                      onClick={() => toggleTask(task)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 stroke-[3] text-emerald-400 dark:text-white shrink-0" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                      )}
                      <span>{task}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                {taskSearch ? (
                  <p>
                    No matching services found for &quot;{taskSearch}&quot;. Click <strong>&quot;Add Custom&quot;</strong> above to add it as a custom completed task.
                  </p>
                ) : (
                  <p>
                    No default DB items for <strong>{currentVehicleCategory} • {serviceType}</strong>. You can type above and add custom tasks.
                  </p>
                )}
              </div>
            )}

            {/* Active Selected Tasks display */}
            {selectedTasks.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Selected Tasks to Log ({selectedTasks.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTasks.map((task) => (
                    <span
                      key={task}
                      className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-medium"
                    >
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>{task}</span>
                      <button
                        type="button"
                        onClick={() => toggleTask(task)}
                        className="ml-1 text-emerald-700 hover:text-rose-600 dark:text-emerald-400 dark:hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Workshop & Remarks */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>Workshop & Remarks</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Work Carried Out By
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="e.g. Master Tech John"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Workshop Name
                </label>
                <input
                  type="text"
                  value={workshopName}
                  onChange={(e) => setWorkshopName(e.target.value)}
                  placeholder="e.g. Apex Auto Care"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Technician Remarks / Notes
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Next service recommended at 55,000 km. Replaced front brake pads."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden resize-none"
              />
            </div>
          </section>

          {/* Save Action Button */}
          <div className="pt-2">
            <button
              id="save-service-record-btn"
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{recordToEdit ? 'Save Changes' : 'Save Service Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
