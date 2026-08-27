import React, { useState } from 'react';
import { Car, User, Lock, Eye, EyeOff, ArrowRight, Loader2, Database, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile, AppSettings } from '../types';

interface AuthScreenProps {
  onLogin?: (profile: UserProfile) => void;
  onLoginSuccess?: () => void;
  onSaveScriptUrl?: (url: string) => void;
  profile?: UserProfile;
  settings?: AppSettings;
  onOpenGoogleSheetModal?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onLoginSuccess,
  onSaveScriptUrl,
  profile,
  settings,
  onOpenGoogleSheetModal,
}) => {
  const defaultProfile: UserProfile = profile || {
    id: 'usr-1',
    fullName: 'Alex Morgan',
    userId: '@alex_morgan',
    email: 'alex.morgan@autocare.com',
    phoneNumber: '+1 (555) 123-4567',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    role: 'Fleet Manager',
  };

  const [userId, setUserId] = useState(defaultProfile.userId || '@alex_morgan');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password) {
      setError('Please enter both User ID and Password.');
      return;
    }

    setLoading(true);
    setError(null);

    // If a Google Apps Script Web App URL is configured, trigger a sync test
    if (settings?.googleAppsScriptUrl) {
      try {
        await storageService.syncWithGoogleAppsScript(settings.googleAppsScriptUrl, {
          action: 'LOGIN',
          userId: userId.trim(),
          password,
        });
      } catch (err) {
        console.warn('Apps script auth note, continuing locally', err);
      }
    }

    setTimeout(() => {
      setLoading(false);
      if (onLogin) {
        onLogin({
          ...defaultProfile,
          userId: userId.trim(),
        });
      }
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col gap-6 relative">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <Car className="w-9 h-9 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight">
              AutoCare
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Fleet & Vehicle Intelligence System
            </p>
          </div>
        </div>

        {/* Avatar Graphic */}
        <div className="flex justify-center -my-1">
          <div className="relative">
            <img
              src={defaultProfile.avatarUrl}
              alt="Profile avatar"
              className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md object-cover bg-slate-100 dark:bg-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" title="Online" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-2.5 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign In
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access your vehicles, fuel logs & maintenance records
            </p>
          </div>

          {/* UserID / Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="auth-userid">
              UserID / Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                id="auth-userid"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your UserID"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="auth-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-11 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            id="auth-signin-submit"
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Backend & Google Sheet Info Box */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline-ready & Local Storage active</span>
            </span>
            {onOpenGoogleSheetModal && (
              <button
                onClick={onOpenGoogleSheetModal}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Google Sheet Backend</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Account Access Help</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              AutoCare is currently in single-user/fleet-manager mode. You can sign in using any credentials or default ID: 
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-600 ml-1">@alex_morgan</span>
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setUserId('@alex_morgan');
                  setPassword('password123');
                  setShowForgotModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
              >
                Use Demo Login
              </button>
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
