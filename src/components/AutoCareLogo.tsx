import React, { useState } from 'react';

interface AutoCareLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showBadge?: boolean;
}

export const AutoCareLogo: React.FC<AutoCareLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showBadge = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  // Logo uploaded by user on GitHub
  const logoImageUrl = 'https://raw.githubusercontent.com/Gautamgs21/AutoCare/d42c2f20345b33be9c9c7e879a07c01a8ebfd61f/Logo.png';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Graphic Container */}
      <div className={`relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden ${iconSizes[size]}`}>
        {!imageError ? (
          <img
            src={logoImageUrl}
            alt="AutoCare Logo"
            className="w-full h-full object-contain drop-shadow-xs transition-transform hover:scale-105"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-Fidelity SVG Vector Fallback */
          <svg viewBox="0 0 400 240" className="w-full h-full drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="135" cy="120" r="64" stroke="#1e3a8a" strokeWidth="12" strokeOpacity="0.2" />
            <circle cx="265" cy="120" r="64" stroke="#06b6d4" strokeWidth="12" strokeOpacity="0.2" />
            <path
              d="M 200,120 C 235,70 310,70 335,120 C 360,170 285,170 200,120 C 115,70 40,70 65,120 C 90,170 165,170 200,120 Z"
              stroke="url(#logoGrad)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Car Silhouette */}
            <g transform="translate(112, 96) scale(1.1)">
              <path
                d="M 5 28 L 8 28 C 8 31 10 33 13 33 C 16 33 18 31 18 28 L 24 28 C 24 31 26 33 29 33 C 32 33 34 31 34 28 L 37 28 C 39 28 40 26 40 24 L 38 18 C 37 14 33 10 28 9 L 14 9 C 9 10 5 14 4 18 L 2 24 C 2 26 3 28 5 28 Z"
                fill="#0f2647"
                className="dark:fill-slate-100"
              />
              <circle cx="13" cy="28" r="3" fill="#0284c7" />
              <circle cx="29" cy="28" r="3" fill="#0284c7" />
            </g>
            {/* Bike Silhouette */}
            <g transform="translate(242, 96) scale(1.1)">
              <circle cx="8" cy="26" r="6" stroke="#0f2647" strokeWidth="2.5" fill="none" className="dark:stroke-slate-100" />
              <circle cx="34" cy="26" r="6" stroke="#0f2647" strokeWidth="2.5" fill="none" className="dark:stroke-slate-100" />
              <path
                d="M 8 26 L 18 16 L 26 16 L 34 26 M 18 16 L 22 26 L 34 26 M 22 14 L 16 10 L 26 10"
                stroke="#0f2647"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="dark:stroke-slate-100"
              />
              <circle cx="8" cy="26" r="2" fill="#06b6d4" />
              <circle cx="34" cy="26" r="2" fill="#06b6d4" />
            </g>
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none text-base sm:text-lg">
              AUTOCARE
            </span>
            {showBadge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                PRO
              </span>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-500 dark:text-slate-400 tracking-[0.18em] uppercase">
            MANAGE YOUR RIDES
          </span>
        </div>
      )}
    </div>
  );
};
