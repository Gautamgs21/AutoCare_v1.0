import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Moon, 
  Palette, 
  LogOut, 
  Save, 
  Edit, 
  Check, 
  Database, 
  Download, 
  FileSpreadsheet, 
  Sparkles, 
  RefreshCw,
  HardDrive,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Server,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Layers,
  Crown,
  Type,
  Camera,
  X
} from 'lucide-react';
import { UserProfile, AppSettings, Vehicle, FuelLog, ServiceRecord } from '../types';
import { ANIMAL_AVATARS, AnimalAvatarItem } from './AnimalAvatars';
import { APP_FONTS, applyAppFont, FontOption } from '../utils/fonts';
import confetti from 'canvas-confetti';

interface ProfileScreenProps {
  profile: UserProfile;
  settings: AppSettings;
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  serviceRecords: ServiceRecord[];
  onSaveProfile: (profile: UserProfile) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onSignOut: () => void;
  onOpenGoogleSheetModal: () => void;
  onSyncAll: () => Promise<void>;
  onResetAllData?: (mode: 'demo' | 'empty') => void;
  onReplayIntro?: () => void;
  isSyncing: boolean;
}

const THEME_COLORS = [
  { id: 'emerald', label: 'Emerald Bento', bgClass: 'bg-emerald-600' },
  { id: 'blue', label: 'Precision Blue', bgClass: 'bg-blue-600' },
  { id: 'slate', label: 'Dark Slate', bgClass: 'bg-slate-800' },
  { id: 'violet', label: 'Violet', bgClass: 'bg-violet-600' },
  { id: 'amber', label: 'Amber', bgClass: 'bg-amber-500' },
  { id: 'crimson', label: 'Crimson', bgClass: 'bg-rose-600' },
  { id: 'teal', label: 'Teal', bgClass: 'bg-teal-600' },
  { id: 'cyan', label: 'Cyan', bgClass: 'bg-cyan-600' },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  settings,
  vehicles,
  fuelLogs,
  serviceRecords,
  onSaveProfile,
  onUpdateSettings,
  onSignOut,
  onOpenGoogleSheetModal,
  onSyncAll,
  onResetAllData,
  onReplayIntro,
  isSyncing,
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [userId, setUserId] = useState(profile.userId);
  const [email, setEmail] = useState(profile.email);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('avatar-lion-suit');
  const [showAvatarModal, setShowAvatarModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<'demo' | 'empty' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const totalRecords = vehicles.length + fuelLogs.length + serviceRecords.length;
  const maxCapacity = 100000;
  const usedPercent = Math.min(100, Math.max(1, (totalRecords / maxCapacity) * 100));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      fullName: fullName.trim(),
      userId: userId.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      avatarUrl,
      role: 'Auto Manager',
    });
    setSaveSuccess(true);
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    } catch {}
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleThemeSelect = (colorId: string) => {
    onUpdateSettings({ ...settings, colorTheme: colorId });
    document.documentElement.setAttribute('data-theme', colorId);
  };

  const handleDarkModeToggle = () => {
    const newDark = !settings.darkMode;
    onUpdateSettings({ ...settings, darkMode: newDark });
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFontSelect = (font: FontOption) => {
    onUpdateSettings({ ...settings, typography: font.name });
    applyAppFont(font.name);
  };

  const handleSelectAnimalAvatar = (animal: AnimalAvatarItem) => {
    setSelectedAnimalId(animal.id);
    const newAvatarSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="60" fill="' +
        animal.bgColor +
        '"/><text x="60" y="70" font-size="34" font-weight="bold" fill="#fff" text-anchor="middle">' +
        animal.name.slice(0, 1) +
        '</text></svg>'
    )}`;
    setAvatarUrl(newAvatarSvg);
    onSaveProfile({
      ...profile,
      avatarUrl: newAvatarSvg,
    });
    setShowAvatarModal(false);
    try {
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
    } catch {}
  };

  const currentSelectedAnimal = ANIMAL_AVATARS.find((a) => a.id === selectedAnimalId) || ANIMAL_AVATARS[0];

  const downloadCSV = (type: 'vehicles' | 'fuel' | 'services') => {
    import('../services/storageService').then(({ storageService }) => {
      const csv = storageService.exportToCSV(type);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `AutoCare_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const executeReset = (mode: 'demo' | 'empty') => {
    if (onResetAllData) {
      onResetAllData(mode);
    }
    setShowResetConfirm(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Bento Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        {/* Profile Picture with Edit Avatar Trigger */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="w-20 h-20 rounded-full border-2 border-emerald-500 bg-slate-900 shadow-md flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-emerald-500/30 transition-all"
            title="Click to choose animal avatar"
          >
            {currentSelectedAnimal.renderSvg('w-full h-full')}
          </button>

          {/* Edit Profile Picture Icon Overlay */}
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-1.5 border-2 border-white dark:border-slate-900 shadow-sm cursor-pointer hover:scale-110 transition-transform"
            title="Edit Profile Picture (Avatar Palette)"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {fullName}
            </h2>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Auto Manager • {currentSelectedAnimal.name}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            User ID: {userId} • {email}
          </p>
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-1.5 inline-flex items-center gap-1 cursor-pointer"
          >
            <Edit className="w-3 h-3" />
            <span>Change Profile Avatar ({currentSelectedAnimal.name})</span>
          </button>
        </div>

        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            Replay Intro Video
          </button>
        )}
      </div>

      {/* Grid: Bento Form & Appearance Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account Info Form Bento Box */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Account Credentials
            </h3>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="pt-2">
              <button
                id="profile-save-btn"
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                {saveSuccess ? <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> : <Save className="w-4 h-4" />}
                <span>{saveSuccess ? 'Changes Saved' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Appearance & Interface Settings Bento Box */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Interface Customization
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Dark Mode Toggle */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Dark Mode Experience
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  High-contrast slate theme
                </p>
              </div>
              <button
                id="theme-dark-toggle"
                type="button"
                onClick={handleDarkModeToggle}
                className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.darkMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle dark mode"
              >
                <div
                  className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                    settings.darkMode ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Color Theme Selector */}
            <div className="pt-1 space-y-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Bento Accent Color
              </p>
              <div className="flex flex-wrap gap-2.5">
                {THEME_COLORS.map((c) => {
                  const isSelected = settings.colorTheme === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleThemeSelect(c.id)}
                      title={c.label}
                      className={`w-7 h-7 rounded-lg ${c.bgClass} flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                        isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency Selector */}
            <div className="pt-2 flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Currency Symbol
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Display symbol for costs
                </p>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => onUpdateSettings({ ...settings, currency: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="AED">AED</option>
              </select>
            </div>

            {/* Typography & Font Dropdown (Tucked inside Interface Customization) */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      App Typography & Font
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select from 54+ Google Fonts (Sans, Serif, Play)
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {settings.typography || 'Inter'}
                </span>
              </div>

              <div className="relative">
                <select
                  id="settings-font-dropdown"
                  value={settings.typography || 'Inter'}
                  onChange={(e) => {
                    const selected = APP_FONTS.find((f) => f.name.toLowerCase() === e.target.value.toLowerCase());
                    if (selected) {
                      handleFontSelect(selected);
                    } else {
                      onUpdateSettings({ ...settings, typography: e.target.value });
                      applyAppFont(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 outline-hidden cursor-pointer"
                >
                  <optgroup label="── SANS-SERIF FONTS (20) ──">
                    {APP_FONTS.filter((f) => f.category === 'sans').map((font) => (
                      <option key={font.name} value={font.name}>
                        {font.name} {font.previewText ? `— (${font.previewText})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="── SERIF FONTS (16) ──">
                    {APP_FONTS.filter((f) => f.category === 'serif').map((font) => (
                      <option key={font.name} value={font.name}>
                        {font.name} {font.previewText ? `— (${font.previewText})` : ''}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="── PLAY / DISPLAY / MONO (18) ──">
                    {APP_FONTS.filter((f) => f.category === 'play').map((font) => (
                      <option key={font.name} value={font.name}>
                        {font.name} {font.previewText ? `— (${font.previewText})` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Live Font Specimen Preview Pill */}
              {(() => {
                const currentFont = APP_FONTS.find(
                  (f) => f.name.toLowerCase() === (settings.typography || 'Inter').toLowerCase()
                ) || APP_FONTS[0];
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Live Preview ({currentFont.category})
                      </span>
                      <p
                        className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate mt-0.5"
                        style={{ fontFamily: `"${currentFont.name}", ${currentFont.fallback}` }}
                      >
                        {currentFont.previewText || 'The quick brown fox jumps over the lazy dog 1234567890'}
                      </p>
                    </div>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                      Active
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      </div>

      {/* Backend & Google Apps Script Hub */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Backend Integration & Storage Configuration
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenGoogleSheetModal}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup & Apps Script Code</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Storage Capacity & Deployment Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Database Records</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {totalRecords.toLocaleString()} / {maxCapacity.toLocaleString()}
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${usedPercent}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Deployment Target</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                GitHub Pages
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Client-side SPA Build</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Apps Script Status</span>
                <div className={`w-2 h-2 rounded-full ${settings.googleAppsScriptUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                {settings.googleAppsScriptUrl ? 'Connected' : 'Not Configured'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Google Sheet Backend</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSyncAll}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Fleet Data'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenGoogleSheetModal}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Configure Apps Script URL</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">
              Export Offline Backup:
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => downloadCSV('vehicles')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Vehicles.csv
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => downloadCSV('fuel')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                FuelLogs.csv
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => downloadCSV('services')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                Services.csv
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DATA MANAGEMENT & RESET ALL DATA PANEL (User Requested) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-xs overflow-hidden">
        <div className="px-5 py-4 bg-red-50/40 dark:bg-red-950/30 border-b border-red-100 dark:border-red-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <h3 className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">
              Auto Manager Data Management & Reset
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400">
            Database Tools
          </span>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Need to reset your application records? You can restore the complete demo vehicle dataset or clear all vehicles, fuel logs, and service records for a fresh slate.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowResetConfirm('demo')}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset to Default Demo Fleet</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm('empty')}
              className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Wipe & Reset All Fleet Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* Sign Out Button */}
      <button
        id="profile-sign-out-btn"
        type="button"
        onClick={onSignOut}
        className="w-full bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold py-3 rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out of Auto Manager</span>
      </button>

      {/* POP-UP MODAL: ANIMAL ILLUSTRATION AVATAR PALETTE (User Requested) */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Choose Profile Avatar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Animated vector animals in executive human suits & dresses
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 8 Animal Vector Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 overflow-y-auto p-1 flex-1">
              {ANIMAL_AVATARS.map((animal) => {
                const isSelected = selectedAnimalId === animal.id;
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => handleSelectAnimalAvatar(animal)}
                    className={`group p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col items-center justify-between relative ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.02]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}

                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full my-1 overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-300">
                      {animal.renderSvg('w-full h-full')}
                    </div>

                    <div className="text-center mt-2 w-full">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white block truncate">
                        {animal.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {animal.outfit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Palette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {showResetConfirm === 'demo' ? 'Reset to Demo Data?' : 'Wipe All Fleet Records?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {showResetConfirm === 'demo'
                  ? 'This will restore default demo vehicles, fuel logs, and service records.'
                  : 'This will erase all vehicles, fuel logs, and service records from local storage.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(null)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeReset(showResetConfirm)}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
