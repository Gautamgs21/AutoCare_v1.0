import React from 'react';
import { RefreshCw, ArrowLeft, Database, CheckCircle2 } from 'lucide-react';
import { UserProfile, NavTab, AppSettings } from '../types';
import { AutoCareLogo } from './AutoCareLogo';

interface TopAppBarProps {
  currentTab?: NavTab | string;
  onNavigate?: (tab: NavTab) => void;
  onOpenProfile?: () => void;
  profile: UserProfile;
  titleOverride?: string;
  onBack?: () => void;
  settings?: AppSettings;
  onOpenGoogleSheetModal?: () => void;
  onSyncAll?: () => Promise<void>;
  isSyncing?: boolean;
  isConfigured?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab = 'dashboard',
  onNavigate,
  onOpenProfile,
  profile,
  titleOverride,
  onBack,
  settings,
  onOpenGoogleSheetModal,
  onSyncAll,
  isSyncing = false,
  isConfigured = false,
}) => {
  const isDetailView = Boolean(onBack);

  const handleProfileClick = () => {
    if (onOpenProfile) onOpenProfile();
    else if (onNavigate) onNavigate('profile');
  };

  const handleLogoClick = () => {
    if (onNavigate) onNavigate('dashboard');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Brand Identity & Back Navigation */}
        <div className="flex items-center gap-3">
          {isDetailView ? (
            <button
              id="top-back-btn"
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
              aria-label="AutoCare Dashboard"
            >
              <AutoCareLogo size="sm" showBadge={false} />
              <div>
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  AutoCare <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs sm:text-sm">v1.0</span>
                </span>
                {titleOverride && (
                  <span className="hidden md:inline-block ml-3 text-xs font-semibold text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                    {titleOverride}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            id="top-settings-btn"
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            aria-label="Settings & Profile"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold">Fleet Settings</span>
          </button>

          <button
            id="top-profile-btn"
            onClick={handleProfileClick}
            className={`relative rounded-full p-0.5 border-2 transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-100 dark:ring-emerald-950'
                : 'border-slate-200 dark:border-slate-700 shadow-xs hover:scale-105'
            }`}
            aria-label="Profile and Settings"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-slate-100 dark:bg-slate-800"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};
