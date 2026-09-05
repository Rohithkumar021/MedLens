import React from 'react';
import { CheckCircle2, ArrowDownRight, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md', showReasonTooltip = false, reason = '' }) {
  const normalized = (status || 'UNKNOWN').toUpperCase();

  const configs = {
    NORMAL: {
      label: 'NORMAL',
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
      title: 'Within report reference interval'
    },
    LOW: {
      label: 'LOW',
      bgClass: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: ArrowDownRight,
      iconClass: 'text-amber-700',
      title: 'Below report reference interval'
    },
    HIGH: {
      label: 'HIGH',
      bgClass: 'bg-rose-50 text-rose-900 border-rose-300',
      icon: ArrowUpRight,
      iconClass: 'text-rose-700',
      title: 'Above report reference interval'
    },
    NOT_AVAILABLE: {
      label: 'NOT AVAILABLE',
      bgClass: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: HelpCircle,
      iconClass: 'text-slate-500',
      title: 'Reference range not provided in source report'
    },
    UNKNOWN: {
      label: 'UNKNOWN',
      bgClass: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: HelpCircle,
      iconClass: 'text-slate-500',
      title: 'Complex or unparsed reference range'
    }
  };

  const config = configs[normalized] || configs.UNKNOWN;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold tracking-wide',
    lg: 'text-xs sm:text-sm px-3 py-1.5 gap-2 font-bold tracking-wider'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      title={reason || config.title}
      className={`inline-flex items-center rounded-md border shadow-subtle select-none ${config.bgClass} ${sizeClasses[size]}`}
    >
      <Icon className={`${iconSizes[size]} ${config.iconClass} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
