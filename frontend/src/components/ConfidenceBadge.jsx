import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export default function ConfidenceBadge({ confidence, size = 'sm' }) {
  const norm = (confidence || 'HIGH').toUpperCase();

  const configs = {
    HIGH: {
      label: 'Extraction: HIGH',
      classes: 'bg-emerald-50/80 text-emerald-800 border-emerald-200',
      classes: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-glow-emerald',
      icon: ShieldCheck,
      iconClass: 'text-emerald-600',
      iconClass: 'text-emerald-400',
      tooltip: 'Extraction Confidence: High (unambiguous tabular extraction directly aligned with document layout).'
    },
    MEDIUM: {
      label: 'Extraction: MEDIUM',
      classes: 'bg-amber-50/80 text-amber-800 border-amber-200',
      classes: 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-glow-amber',
      icon: Shield,
      iconClass: 'text-amber-600',
      iconClass: 'text-amber-400',
      tooltip: 'Extraction Confidence: Medium (pattern matched from inline text).'
    },
    LOW: {
      label: 'Extraction: LOW',
      classes: 'bg-rose-50/80 text-rose-800 border-rose-200',
      classes: 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-glow-rose',
      icon: ShieldAlert,
      iconClass: 'text-rose-600',
      iconClass: 'text-rose-400',
      tooltip: 'Extraction Confidence: Low (irregular formatting; human review strongly advised).'
    }
  };

  const config = configs[norm] || configs.HIGH;
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1 font-semibold' : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1 font-bold' : 'text-xs px-2.5 py-1 gap-1.5 font-bold';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center rounded border tracking-wide shadow-subtle ${config.classes} ${sizeClass}`}
      className={`inline-flex items-center rounded-md border tracking-wide select-none backdrop-blur-xs transition-all ${config.classes} ${sizeClass}`}
    >
      <Icon className={`w-3 h-3 ${config.iconClass} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
