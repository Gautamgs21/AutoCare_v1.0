import React from 'react';
import { Home, Car, Wrench, Fuel, BarChart3, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentTab, onTabChange, onNavigate }) => {
  const handleNav = (tab: NavTab) => {
    if (onTabChange) onTabChange(tab);
    if (onNavigate) onNavigate(tab);
  };

  const navItems: { tab: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Overview', icon: Home },
    { tab: 'vehicles', label: 'Vehicles', icon: Car },
    { tab: 'fuel', label: 'Fuel', icon: Fuel },
    { tab: 'services', label: 'Services', icon: Wrench },
    { tab: 'analytics', label: 'Analytics', icon: BarChart3 },
    { tab: 'profile', label: 'Settings', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-6xl mx-auto h-16 px-2 sm:px-4 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              id={`nav-btn-${item.tab}`}
              onClick={() => handleNav(item.tab)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 sm:px-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`px-3 py-1 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 scale-105 shadow-xs' : ''
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 font-bold truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
