import React, { useState, useEffect } from 'react';
import { Database, X, ArrowLeft, Save, Trash2, Gauge, Calendar, Layers, Car, Bike, AlertCircle } from 'lucide-react';
import { ServicesDBEntry } from '../data/servicesDB';
import confetti from 'canvas-confetti';

interface EditServiceDBModalProps {
  isOpen: boolean;
  entryToEdit: ServicesDBEntry | null;
  entryIndex: number | null;
  existingClassifications: string[];
  onClose: () => void;
  onSave: (entry: ServicesDBEntry, index?: number) => void;
  onDelete?: (index: number) => void;
}

export const EditServiceDBModal: React.FC<EditServiceDBModalProps> = ({
  isOpen,
  entryToEdit,
  entryIndex,
  existingClassifications,
  onClose,
  onSave,
  onDelete,
}) => {
  const [serviceType, setServiceType] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<'Four Wheeler' | 'Two Wheeler'>('Four Wheeler');
  const [classification, setClassification] = useState('Periodic Maintanence');
  const [customClassification, setCustomClassification] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [mileageInterval, setMileageInterval] = useState<number | ''>(10000);
  const [timePeriodMonths, setTimePeriodMonths] = useState<number | ''>(12);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (entryToEdit) {
        setServiceType(entryToEdit.serviceType);
        setVehicleCategory(entryToEdit.vehicleCategory);
        setMileageInterval(entryToEdit.mileageInterval);
        setTimePeriodMonths(entryToEdit.timePeriodMonths);
        
        if (existingClassifications.includes(entryToEdit.classification)) {
          setClassification(entryToEdit.classification);
          setIsCustomClass(false);
          setCustomClassification('');
        } else {
          setIsCustomClass(true);
          setCustomClassification(entryToEdit.classification);
          setClassification('__CUSTOM__');
        }
      } else {
        // New entry defaults
        setServiceType('');
        setVehicleCategory('Four Wheeler');
        setClassification(existingClassifications[0] || 'Periodic Maintanence');
        setIsCustomClass(false);
        setCustomClassification('');
        setMileageInterval(10000);
        setTimePeriodMonths(12);
      }
      setError(null);
    }
  }, [isOpen, entryToEdit, existingClassifications]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType.trim()) {
      setError('Please enter a service name.');
      return;
    }
    const finalClass = isCustomClass ? customClassification.trim() : classification;
    if (!finalClass) {
      setError('Please specify a classification.');
      return;
    }
    if (!mileageInterval || Number(mileageInterval) <= 0) {
      setError('Please enter a valid mileage interval (greater than 0 km).');
      return;
    }
    if (!timePeriodMonths || Number(timePeriodMonths) <= 0) {
      setError('Please enter a valid periodicity in months.');
      return;
    }

    const newEntry: ServicesDBEntry = {
      serviceType: serviceType.trim(),
      vehicleCategory,
      classification: finalClass as ServicesDBEntry['classification'],
      mileageInterval: Number(mileageInterval),
      timePeriodMonths: Number(timePeriodMonths),
    };

    onSave(newEntry, entryIndex !== null ? entryIndex : undefined);
    try {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    } catch {}
    onClose();
  };

  const handleDelete = () => {
    if (entryIndex !== null && onDelete) {
      if (window.confirm(`Are you sure you want to delete "${serviceType}" from the Services DB?`)) {
        onDelete(entryIndex);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#f8fafc] dark:bg-slate-900 rounded-3xl w-full max-w-[520px] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
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
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {entryToEdit ? 'Edit Service Rule' : 'Add Service Rule'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Master Services DB Reference Item
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Name & Category */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Vehicle Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVehicleCategory('Four Wheeler')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    vehicleCategory === 'Four Wheeler'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Four Wheeler</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleCategory('Two Wheeler')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    vehicleCategory === 'Two Wheeler'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Two Wheeler</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Service Type / Name *
              </label>
              <input
                type="text"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                placeholder="e.g. Engine Oil Replacement"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Classification *
              </label>
              <div className="space-y-2">
                <select
                  value={isCustomClass ? '__CUSTOM__' : classification}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomClass(true);
                    } else {
                      setIsCustomClass(false);
                      setClassification(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                >
                  {existingClassifications.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Custom Classification...</option>
                </select>

                {isCustomClass && (
                  <input
                    type="text"
                    value={customClassification}
                    onChange={(e) => setCustomClassification(e.target.value)}
                    placeholder="Enter custom classification name"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-400 dark:border-emerald-600 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-medium"
                    autoFocus
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* Interval Math Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interval Rules</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Mileage Interval (KM) *
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    value={mileageInterval}
                    onChange={(e) => setMileageInterval(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 10000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  e.g. 10000 km
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Periodicity (Months) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    value={timePeriodMonths}
                    onChange={(e) => setTimePeriodMonths(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 12"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  e.g. 12 months
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            {entryToEdit && entryIndex !== null && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Delete Rule"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{entryToEdit ? 'Save Changes' : 'Add to Services DB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
