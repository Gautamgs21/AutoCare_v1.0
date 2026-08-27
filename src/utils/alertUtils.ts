export type AlertLevel = 'BLINK_RED' | 'RED' | 'BLINK_YELLOW' | 'YELLOW' | 'GREEN' | 'NEUTRAL';

export interface AlertResult {
  level: AlertLevel;
  className: string;
  badgeClass: string;
  dotClass: string;
  label: string;
  isBlinking: boolean;
  statusType: 'danger' | 'warning' | 'success' | 'neutral';
}

/**
 * Days Alert Criteria:
 * - days < 0: Blinking Red (Expired / Overdue)
 * - days < 10 (0 to 9): Red (Critical)
 * - days < 20 (10 to 19): Blinking Yellow (High alert)
 * - days < 30 (20 to 29): Yellow (Attention)
 * - days >= 30: Green (Healthy)
 */
export function getDaysAlert(days: number | null | undefined, customSuffix = 'days left'): AlertResult {
  if (days === null || days === undefined || isNaN(days)) {
    return {
      level: 'NEUTRAL',
      className: 'text-slate-500 dark:text-slate-400',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dotClass: 'bg-slate-400',
      label: 'N/A',
      isBlinking: false,
      statusType: 'neutral',
    };
  }

  if (days < 0) {
    const overdueDays = Math.abs(days);
    return {
      level: 'BLINK_RED',
      className: 'text-rose-600 dark:text-rose-400 font-extrabold',
      badgeClass: 'animate-blink-red text-white font-extrabold border border-red-600 shadow-sm',
      dotClass: 'bg-red-500 animate-ping',
      label: `Expired (${overdueDays}d overdue)`,
      isBlinking: true,
      statusType: 'danger',
    };
  }

  if (days < 10) {
    return {
      level: 'RED',
      className: 'text-rose-600 dark:text-rose-400 font-bold',
      badgeClass: 'bg-rose-500 text-white font-bold border border-rose-600 shadow-xs dark:bg-rose-600',
      dotClass: 'bg-rose-500',
      label: `${days}d left (${days === 1 ? 'Tomorrow' : 'Critical'})`,
      isBlinking: false,
      statusType: 'danger',
    };
  }

  if (days < 20) {
    return {
      level: 'BLINK_YELLOW',
      className: 'text-amber-600 dark:text-amber-400 font-bold',
      badgeClass: 'animate-blink-yellow text-slate-900 font-extrabold border border-amber-500 shadow-sm',
      dotClass: 'bg-amber-500 animate-ping',
      label: `${days}d left (Due Soon)`,
      isBlinking: true,
      statusType: 'warning',
    };
  }

  if (days < 30) {
    return {
      level: 'YELLOW',
      className: 'text-amber-700 dark:text-amber-300 font-bold',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700',
      dotClass: 'bg-amber-500',
      label: `${days}d left`,
      isBlinking: false,
      statusType: 'warning',
    };
  }

  return {
    level: 'GREEN',
    className: 'text-emerald-700 dark:text-emerald-300 font-bold',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    label: `${days}d left (Valid)`,
    isBlinking: false,
    statusType: 'success',
  };
}

/**
 * Km Alert Criteria:
 * - km < 0: Blinking Red (Overdue by X km)
 * - km < 80 (0 to 79): Red (Critical service due)
 * - km < 200 (80 to 199): Blinking Yellow (Service approaching)
 * - km < 250 (200 to 249): Yellow (Plan service)
 * - km >= 250: Green (Good health)
 */
export function getKmAlert(km: number | null | undefined): AlertResult {
  if (km === null || km === undefined || isNaN(km)) {
    return {
      level: 'NEUTRAL',
      className: 'text-slate-500 dark:text-slate-400',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      dotClass: 'bg-slate-400',
      label: 'N/A',
      isBlinking: false,
      statusType: 'neutral',
    };
  }

  if (km < 0) {
    const overdueKm = Math.abs(km);
    return {
      level: 'BLINK_RED',
      className: 'text-rose-600 dark:text-rose-400 font-extrabold',
      badgeClass: 'animate-blink-red text-white font-extrabold border border-red-600 shadow-sm',
      dotClass: 'bg-red-500 animate-ping',
      label: `Overdue by ${overdueKm.toLocaleString()} km`,
      isBlinking: true,
      statusType: 'danger',
    };
  }

  if (km < 80) {
    return {
      level: 'RED',
      className: 'text-rose-600 dark:text-rose-400 font-bold',
      badgeClass: 'bg-rose-500 text-white font-bold border border-rose-600 shadow-xs dark:bg-rose-600',
      dotClass: 'bg-rose-500',
      label: `${km.toLocaleString()} km left (Critical)`,
      isBlinking: false,
      statusType: 'danger',
    };
  }

  if (km < 200) {
    return {
      level: 'BLINK_YELLOW',
      className: 'text-amber-600 dark:text-amber-400 font-bold',
      badgeClass: 'animate-blink-yellow text-slate-900 font-extrabold border border-amber-500 shadow-sm',
      dotClass: 'bg-amber-500 animate-ping',
      label: `${km.toLocaleString()} km left (Due Soon)`,
      isBlinking: true,
      statusType: 'warning',
    };
  }

  if (km < 250) {
    return {
      level: 'YELLOW',
      className: 'text-amber-700 dark:text-amber-300 font-bold',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700',
      dotClass: 'bg-amber-500',
      label: `${km.toLocaleString()} km left`,
      isBlinking: false,
      statusType: 'warning',
    };
  }

  return {
    level: 'GREEN',
    className: 'text-emerald-700 dark:text-emerald-300 font-bold',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    label: `${km.toLocaleString()} km left (Healthy)`,
    isBlinking: false,
    statusType: 'success',
  };
}
