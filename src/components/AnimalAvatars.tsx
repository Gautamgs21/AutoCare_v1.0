import React from 'react';

export interface AnimalAvatarItem {
  id: string;
  name: string;
  role: string;
  animal: string;
  outfit: string;
  accentColor: string;
  bgColor: string;
  renderSvg: (className?: string) => React.ReactNode;
}

export const ANIMAL_AVATARS: AnimalAvatarItem[] = [
  {
    id: 'avatar-lion-suit',
    name: 'Lord Leonard',
    role: 'Fleet Executive & CEO',
    animal: 'Golden Lion',
    outfit: 'Royal Navy Blazer & Gold Tie',
    accentColor: '#f59e0b',
    bgColor: '#1e293b',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#1e293b" />
        {/* Mane */}
        <path d="M60 14 C42 14 26 28 26 50 C26 70 34 82 46 88 L74 88 C86 82 94 70 94 50 C94 28 78 14 60 14 Z" fill="#d97706" />
        <path d="M30 40 Q20 52 30 64 Q18 76 34 82 L86 82 Q102 76 90 64 Q100 52 90 40 Q100 28 80 20 Q60 16 40 20 Q20 28 30 40 Z" fill="#b45309" />
        {/* Head */}
        <circle cx="60" cy="50" r="24" fill="#fbbf24" />
        {/* Ears */}
        <circle cx="42" cy="34" r="7" fill="#d97706" />
        <circle cx="42" cy="34" r="4" fill="#fef3c7" />
        <circle cx="78" cy="34" r="7" fill="#d97706" />
        <circle cx="78" cy="34" r="4" fill="#fef3c7" />
        {/* Face features */}
        <ellipse cx="60" cy="54" rx="9" ry="7" fill="#fef3c7" />
        <path d="M56 50 L64 50 L60 55 Z" fill="#78350f" />
        <circle cx="51" cy="46" r="2.5" fill="#1e293b" />
        <circle cx="69" cy="46" r="2.5" fill="#1e293b" />
        <circle cx="52" cy="45" r="0.8" fill="#ffffff" />
        <circle cx="70" cy="45" r="0.8" fill="#ffffff" />
        {/* Whiskers */}
        <line x1="42" y1="53" x2="34" y2="52" stroke="#78350f" strokeWidth="1" />
        <line x1="42" y1="56" x2="33" y2="57" stroke="#78350f" strokeWidth="1" />
        <line x1="78" y1="53" x2="86" y2="52" stroke="#78350f" strokeWidth="1" />
        <line x1="78" y1="56" x2="87" y2="57" stroke="#78350f" strokeWidth="1" />
        {/* Suit & Shirt */}
        <path d="M36 84 L30 116 L90 116 L84 84 Z" fill="#1e3a8a" />
        <path d="M46 84 L60 116 L74 84 Z" fill="#ffffff" />
        {/* Lapels */}
        <path d="M36 84 L50 116 L42 116 L30 116 Z" fill="#172554" />
        <path d="M84 84 L70 116 L78 116 L90 116 Z" fill="#172554" />
        {/* Red/Gold Silk Tie */}
        <path d="M57 88 L63 88 L65 106 L60 114 L55 106 Z" fill="#dc2626" />
        <polygon points="56,86 64,86 62,91 58,91" fill="#f59e0b" />
      </svg>
    ),
  },
  {
    id: 'avatar-fox-tweed',
    name: 'Sir Reynard Fox',
    role: 'Chief Route Strategist',
    animal: 'Red Fox',
    outfit: 'Tweed Blazer & Bowtie',
    accentColor: '#ea580c',
    bgColor: '#0f172a',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#0f172a" />
        {/* Fox Ears */}
        <polygon points="36,18 48,42 26,38" fill="#c2410c" />
        <polygon points="38,23 46,40 30,37" fill="#ffffff" />
        <polygon points="84,18 72,42 94,38" fill="#c2410c" />
        <polygon points="82,23 74,40 90,37" fill="#ffffff" />
        {/* Fox Head */}
        <path d="M60 28 C42 28 32 44 32 54 C32 68 44 76 60 76 C76 76 88 68 88 54 C88 44 78 28 60 28 Z" fill="#ea580c" />
        <path d="M42 52 C36 58 36 68 44 74 C50 78 60 78 60 78 C60 78 70 78 76 74 C84 68 84 58 78 52 C70 60 60 62 60 62 C60 62 50 60 42 52 Z" fill="#ffffff" />
        {/* Snout & Nose */}
        <polygon points="56,66 64,66 60,72" fill="#0f172a" />
        {/* Smart Spectacles */}
        <circle cx="48" cy="48" r="8" stroke="#d97706" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
        <circle cx="72" cy="48" r="8" stroke="#d97706" strokeWidth="2" fill="rgba(255,255,255,0.2)" />
        <line x1="56" y1="48" x2="64" y2="48" stroke="#d97706" strokeWidth="2" />
        <line x1="40" y1="48" x2="34" y2="46" stroke="#d97706" strokeWidth="1.5" />
        <line x1="80" y1="48" x2="86" y2="46" stroke="#d97706" strokeWidth="1.5" />
        {/* Eyes inside glasses */}
        <circle cx="48" cy="48" r="2.5" fill="#0f172a" />
        <circle cx="72" cy="48" r="2.5" fill="#0f172a" />
        {/* Tweed Jacket & Shirt */}
        <path d="M34 82 L26 116 L94 116 L86 82 Z" fill="#78350f" />
        <path d="M46 80 L60 116 L74 80 Z" fill="#fef3c7" />
        {/* Blazer Lapel with Tweed dots */}
        <path d="M34 82 L52 116 L40 116 L26 116 Z" fill="#582407" />
        <path d="M86 82 L68 116 L80 116 L94 116 Z" fill="#582407" />
        {/* Emerald Bowtie */}
        <polygon points="52,82 60,86 52,90" fill="#059669" />
        <polygon points="68,82 60,86 68,90" fill="#059669" />
        <circle cx="60" cy="86" r="3" fill="#047857" />
      </svg>
    ),
  },
  {
    id: 'avatar-bear-aviator',
    name: 'Captain Barnaby Bear',
    role: 'Fleet Logistics Commander',
    animal: 'Grizzly Bear',
    outfit: 'Leather Bomber & Aviators',
    accentColor: '#0284c7',
    bgColor: '#1e1b4b',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#1e1b4b" />
        {/* Bear Ears */}
        <circle cx="38" cy="32" r="10" fill="#78350f" />
        <circle cx="38" cy="32" r="5" fill="#b45309" />
        <circle cx="82" cy="32" r="10" fill="#78350f" />
        <circle cx="82" cy="32" r="5" fill="#b45309" />
        {/* Bear Head */}
        <ellipse cx="60" cy="52" rx="26" ry="24" fill="#92400e" />
        {/* Muzzle */}
        <ellipse cx="60" cy="60" rx="14" ry="11" fill="#d97706" />
        <ellipse cx="60" cy="55" rx="5" ry="3.5" fill="#1c1917" />
        <path d="M60 58.5 L60 64 M56 63 Q60 67 64 63" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        {/* Aviator Sunglasses on Forehead / Eyes */}
        <rect x="36" y="40" width="20" height="13" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="64" y="40" width="20" height="13" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
        <line x1="56" y1="44" x2="64" y2="44" stroke="#38bdf8" strokeWidth="2" />
        {/* Shine on Aviators */}
        <line x1="40" y1="43" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="68" y1="43" x2="78" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        {/* Fleece Collar & Bomber Jacket */}
        <path d="M30 84 L22 116 L98 116 L90 84 Z" fill="#451a03" />
        {/* White Shearling Fleece Collar */}
        <path d="M36 80 C36 80 48 90 60 90 C72 90 84 80 84 80 C88 88 80 98 70 98 L50 98 C40 98 32 88 36 80 Z" fill="#fef3c7" />
        <line x1="60" y1="92" x2="60" y2="116" stroke="#f59e0b" strokeWidth="2" />
        {/* Pilot Wing Badge */}
        <path d="M72 104 L84 104 L88 107 L84 110 L72 110 Z" fill="#fbbf24" />
      </svg>
    ),
  },
  {
    id: 'avatar-owl-professor',
    name: 'Professor Archibald Owl',
    role: 'Chief Fleet Auditor',
    animal: 'Great Horned Owl',
    outfit: 'Wool Overcoat & Velvet Scarf',
    accentColor: '#8b5cf6',
    bgColor: '#0f172a',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#0f172a" />
        {/* Feather Tufts */}
        <polygon points="40,16 48,36 34,32" fill="#475569" />
        <polygon points="80,16 72,36 86,32" fill="#475569" />
        {/* Owl Head */}
        <ellipse cx="60" cy="48" rx="26" ry="22" fill="#64748b" />
        {/* Facial Discs */}
        <circle cx="48" cy="46" r="13" fill="#f8fafc" />
        <circle cx="72" cy="46" r="13" fill="#f8fafc" />
        {/* Large Wise Eyes */}
        <circle cx="48" cy="46" r="8" fill="#f59e0b" />
        <circle cx="48" cy="46" r="4.5" fill="#0f172a" />
        <circle cx="50" cy="44" r="1.5" fill="#ffffff" />
        <circle cx="72" cy="46" r="8" fill="#f59e0b" />
        <circle cx="72" cy="46" r="4.5" fill="#0f172a" />
        <circle cx="74" cy="44" r="1.5" fill="#ffffff" />
        {/* Gold Spectacles */}
        <circle cx="48" cy="46" r="11" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        <circle cx="72" cy="46" r="11" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        <line x1="59" y1="46" x2="61" y2="46" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Beak */}
        <polygon points="57,50 63,50 60,60" fill="#d97706" />
        {/* Overcoat & Scarf */}
        <path d="M34 82 L26 116 L94 116 L86 82 Z" fill="#334155" />
        <path d="M44 80 L60 116 L76 80 Z" fill="#e2e8f0" />
        {/* Violet Silk Scarf draped */}
        <path d="M42 76 C46 84 54 88 60 88 C66 88 74 84 78 76 L74 96 L46 96 Z" fill="#7c3aed" />
        <rect x="54" y="88" width="12" height="24" rx="2" fill="#6d28d9" />
      </svg>
    ),
  },
  {
    id: 'avatar-wolf-trench',
    name: 'Winston Shadow Wolf',
    role: 'Senior Operations Detective',
    animal: 'Silver Wolf',
    outfit: 'Classic Trench Coat & Fedora',
    accentColor: '#10b981',
    bgColor: '#18181b',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#18181b" />
        {/* Wolf Ears */}
        <polygon points="34,16 48,36 28,34" fill="#52525b" />
        <polygon points="36,20 45,34 31,33" fill="#a1a1aa" />
        <polygon points="86,16 72,36 92,34" fill="#52525b" />
        <polygon points="84,20 75,34 89,33" fill="#a1a1aa" />
        {/* Fedora Hat */}
        <ellipse cx="60" cy="30" rx="34" ry="7" fill="#27272a" />
        <path d="M40 30 C40 18 48 16 60 16 C72 16 80 18 80 30 Z" fill="#3f3f46" />
        <rect x="40" y="26" width="40" height="4" fill="#10b981" />
        {/* Wolf Face */}
        <path d="M60 32 C44 32 38 46 38 56 C38 68 46 76 60 76 C74 76 82 68 82 56 C82 46 76 32 60 32 Z" fill="#71717a" />
        <path d="M44 56 C44 68 52 74 60 74 C68 74 76 68 76 56 C70 60 60 62 60 62 C60 62 50 60 44 56 Z" fill="#e4e4e7" />
        {/* Piercing Amber Eyes */}
        <polygon points="46,48 54,46 52,51" fill="#f59e0b" />
        <circle cx="50" cy="48" r="1.5" fill="#18181b" />
        <polygon points="74,48 66,46 68,51" fill="#f59e0b" />
        <circle cx="70" cy="48" r="1.5" fill="#18181b" />
        {/* Nose */}
        <polygon points="56,64 64,64 60,70" fill="#18181b" />
        {/* Trench Coat */}
        <path d="M32 82 L24 116 L96 116 L88 82 Z" fill="#d4d4d8" />
        <path d="M32 82 L56 116 L44 116 L24 116 Z" fill="#a1a1aa" />
        <path d="M88 82 L64 116 L76 116 L96 116 Z" fill="#a1a1aa" />
        {/* Double breasted buttons */}
        <circle cx="48" cy="94" r="2" fill="#27272a" />
        <circle cx="48" cy="106" r="2" fill="#27272a" />
        <circle cx="72" cy="94" r="2" fill="#27272a" />
        <circle cx="72" cy="106" r="2" fill="#27272a" />
      </svg>
    ),
  },
  {
    id: 'avatar-deer-waistcoat',
    name: 'Duke Dominic Stag',
    role: 'Logistics Controller & Planner',
    animal: 'Noble Stag',
    outfit: 'Emerald Velvet Waistcoat & Gold Watch',
    accentColor: '#10b981',
    bgColor: '#064e3b',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#064e3b" />
        {/* Antlers */}
        <path d="M48 28 L36 12 M36 12 L30 14 M36 12 L38 6 M42 20 L30 18" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M72 28 L84 12 M84 12 L90 14 M84 12 L82 6 M78 20 L90 18" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        {/* Deer Ears */}
        <ellipse cx="36" cy="38" rx="10" ry="5" transform="rotate(-30 36 38)" fill="#b45309" />
        <ellipse cx="36" cy="38" rx="7" ry="3" transform="rotate(-30 36 38)" fill="#fef3c7" />
        <ellipse cx="84" cy="38" rx="10" ry="5" transform="rotate(30 84 38)" fill="#b45309" />
        <ellipse cx="84" cy="38" rx="7" ry="3" transform="rotate(30 84 38)" fill="#fef3c7" />
        {/* Head */}
        <ellipse cx="60" cy="50" rx="18" ry="24" fill="#d97706" />
        <ellipse cx="60" cy="64" rx="8" ry="8" fill="#fef3c7" />
        <ellipse cx="60" cy="62" rx="4" ry="2.5" fill="#1c1917" />
        {/* Gentle Eyes */}
        <ellipse cx="50" cy="46" rx="3.5" ry="4.5" fill="#1c1917" />
        <circle cx="51" cy="45" r="1.2" fill="#ffffff" />
        <ellipse cx="70" cy="46" rx="3.5" ry="4.5" fill="#1c1917" />
        <circle cx="71" cy="45" r="1.2" fill="#ffffff" />
        {/* White Collar & Emerald Waistcoat */}
        <path d="M38 82 L28 116 L92 116 L82 82 Z" fill="#047857" />
        <path d="M48 80 L60 116 L72 80 Z" fill="#ffffff" />
        <path d="M44 82 L58 116 L48 116 L34 116 Z" fill="#065f46" />
        <path d="M76 82 L62 116 L72 116 L86 116 Z" fill="#065f46" />
        {/* Gold Pocket Watch Chain */}
        <path d="M52 100 Q60 108 68 100" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
        <circle cx="68" cy="100" r="2" fill="#fbbf24" />
      </svg>
    ),
  },
  {
    id: 'avatar-tiger-tuxedo',
    name: 'Captain Tiberius Tiger',
    role: 'Operations Commander',
    animal: 'Bengal Tiger',
    outfit: 'Shawl Collar Tuxedo',
    accentColor: '#f97316',
    bgColor: '#090d16',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#090d16" />
        {/* Tiger Ears */}
        <circle cx="40" cy="32" r="8" fill="#ea580c" />
        <circle cx="40" cy="32" r="4" fill="#ffffff" />
        <circle cx="80" cy="32" r="8" fill="#ea580c" />
        <circle cx="80" cy="32" r="4" fill="#ffffff" />
        {/* Head */}
        <circle cx="60" cy="50" rx="24" fill="#f97316" />
        {/* Tiger Stripes */}
        <path d="M60 28 L60 36 M52 30 L56 36 M68 30 L64 36" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 46 L46 48 M38 52 L46 53 M82 46 L74 48 M82 52 L74 53" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
        {/* Snout */}
        <ellipse cx="60" cy="58" rx="12" ry="9" fill="#ffffff" />
        <polygon points="56,54 64,54 60,60" fill="#dc2626" />
        {/* Fierce Eyes */}
        <circle cx="49" cy="45" r="3" fill="#84cc16" />
        <circle cx="49" cy="45" r="1.5" fill="#18181b" />
        <circle cx="71" cy="45" r="3" fill="#84cc16" />
        <circle cx="71" cy="45" r="1.5" fill="#18181b" />
        {/* Tuxedo */}
        <path d="M34 82 L26 116 L94 116 L86 82 Z" fill="#18181b" />
        <path d="M46 80 L60 116 L74 80 Z" fill="#ffffff" />
        <path d="M34 82 L52 116 L42 116 L26 116 Z" fill="#27272a" />
        <path d="M86 82 L68 116 L78 116 L94 116 Z" fill="#27272a" />
        {/* Black Satin Bowtie */}
        <polygon points="52,82 60,86 52,90" fill="#09090b" />
        <polygon points="68,82 60,86 68,90" fill="#09090b" />
        <circle cx="60" cy="86" r="3" fill="#27272a" />
      </svg>
    ),
  },
  {
    id: 'avatar-rabbit-racer',
    name: 'Rowan Speed Rabbit',
    role: 'Express Dispatcher',
    animal: 'Snowshoe Rabbit',
    outfit: 'Vintage Cafe Racer Jacket',
    accentColor: '#38bdf8',
    bgColor: '#1e293b',
    renderSvg: (className = 'w-full h-full') => (
      <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#1e293b" />
        {/* Long Rabbit Ears */}
        <ellipse cx="46" cy="22" rx="7" ry="18" transform="rotate(-10 46 22)" fill="#f1f5f9" />
        <ellipse cx="46" cy="22" rx="4" ry="14" transform="rotate(-10 46 22)" fill="#fbcfe8" />
        <ellipse cx="74" cy="22" rx="7" ry="18" transform="rotate(10 74 22)" fill="#f1f5f9" />
        <ellipse cx="74" cy="22" rx="4" ry="14" transform="rotate(10 74 22)" fill="#fbcfe8" />
        {/* Rabbit Head */}
        <circle cx="60" cy="50" r="22" fill="#f8fafc" />
        {/* Nose & Whiskers */}
        <polygon points="57,56 63,56 60,60" fill="#f472b6" />
        <line x1="42" y1="56" x2="32" y2="54" stroke="#94a3b8" strokeWidth="1" />
        <line x1="42" y1="59" x2="31" y2="60" stroke="#94a3b8" strokeWidth="1" />
        <line x1="78" y1="56" x2="88" y2="54" stroke="#94a3b8" strokeWidth="1" />
        <line x1="78" y1="59" x2="89" y2="60" stroke="#94a3b8" strokeWidth="1" />
        {/* Ruby Eyes */}
        <circle cx="50" cy="46" r="3.5" fill="#e11d48" />
        <circle cx="51" cy="45" r="1" fill="#ffffff" />
        <circle cx="70" cy="46" r="3.5" fill="#e11d48" />
        <circle cx="71" cy="45" r="1" fill="#ffffff" />
        {/* Vintage Leather Racing Jacket */}
        <path d="M34 82 L26 116 L94 116 L86 82 Z" fill="#0f172a" />
        {/* Racing Stripes */}
        <rect x="54" y="82" width="6" height="34" fill="#38bdf8" />
        <rect x="62" y="82" width="4" height="34" fill="#f8fafc" />
        <path d="M34 82 L48 94 L38 116" stroke="#38bdf8" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
];
