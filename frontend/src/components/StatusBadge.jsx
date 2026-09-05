import React from 'react';
import { CheckCircle2, ArrowDownRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

export default function StatusBadge({ status, size = 'md', showReasonTooltip = false, reason = '' }) {
  const raw = (status || 'UNKNOWN').toUpperCase();

  const configs = {
    NORMAL: {
      label: 'WITHIN RANGE',
      shortLabel: 'NORMAL',
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
      title: 'Value is within the numerical interval stated in the source report'
    },
    LOW: {
      label: 'BELOW RANGE',
      shortLabel: 'LOW',
      bgClass: 'bg-amber-50 text-amber-900 border-amber-200/90',
      icon: ArrowDownRight,
      iconClass: 'text-amber-700',
      title: 'Value is below the lower reference bound stated in the source report'
    },
    HIGH: {
      label: 'ABOVE RANGE',
      shortLabel: 'HIGH',
      bgClass: 'bg-rose-50 text-rose-900 border-rose-200/90',
      icon: ArrowUpRight,
      iconClass: 'text-rose-700',
      title: 'Value is above the upper reference bound stated in the source report'
    },
    NOT_AVAILABLE: {
      label: 'RANGE UNAVAILABLE',
      shortLabel: 'REF N/A',
      bgClass: 'bg-slate-100 text-slate-700 border-slate-200/90',
      icon: HelpCircle,
      iconClass: 'text-slate-500',
      title: 'Reference range not provided in source document (MedLens never fabricates reference ranges)'
    },
    UNKNOWN: {
      label: 'RANGE UNAVAILABLE',
      shortLabel: 'UNKNOWN',
      bgClass: 'bg-slate-100 text-slate-700 border-slate-200/90',
      icon: HelpCircle,
      iconClass: 'text-slate-500',
      title: 'Reference range not provided or complex interval'
    }
  };

  const config = configs[raw] || configs.UNKNOWN;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-bold font-mono tracking-wider',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold font-mono tracking-wider',
    lg: 'text-xs sm:text-sm px-3 py-1.5 gap-2 font-bold font-mono tracking-wider'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  const displayLabel = size === 'sm' ? config.shortLabel : config.label;
  const tooltipText = reason || config.title;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center rounded-md border tracking-wider shadow-2xs select-none cursor-help ${config.bgClass} ${sizeClasses[size] || sizeClasses.md}`}
          >
            <Icon className={`${iconSizes[size] || iconSizes.md} ${config.iconClass} shrink-0`} aria-hidden="true" />
            <span>{displayLabel}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-sans max-w-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
