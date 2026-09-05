import React from 'react';
import { UserCheck, FileText, Sparkles, Cpu } from 'lucide-react';

export default function ProvenanceBadge({ provenance, size = 'sm' }) {
  const norm = (provenance || 'REPORT_EXTRACTED').toUpperCase();

  const configs = {
    USER_PROVIDED: {
      label: 'USER PROVIDED',
      icon: UserCheck,
      classes: 'bg-purple-50 text-purple-800 border-purple-200/90',
      iconColor: 'text-purple-600',
      tooltip: 'Origin: Entered directly by patient or healthcare provider during intake.'
    },
    REPORT_EXTRACTED: {
      label: 'REPORT EXTRACTED',
      icon: FileText,
      classes: 'bg-sky-50 text-sky-800 border-sky-200/90',
      iconColor: 'text-sky-600',
      tooltip: 'Origin: Extracted digitally from uploaded medical laboratory document.'
    },
    AI_GENERATED: {
      label: 'AI GENERATED',
      icon: Sparkles,
      classes: 'bg-teal-50 text-teal-800 border-teal-200/90',
      iconColor: 'text-teal-600',
      tooltip: 'Origin: Synthesized by clinical AI service based strictly on available structured records.'
    },
    SYSTEM_DERIVED: {
      label: 'SYSTEM DERIVED',
      icon: Cpu,
      classes: 'bg-slate-100 text-slate-700 border-slate-250 border-slate-300',
      iconColor: 'text-slate-600',
      tooltip: 'Origin: Computed deterministically using reference intervals stated in the source report.'
    }
  };

  const config = configs[norm] || configs.REPORT_EXTRACTED;
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1 font-mono font-semibold' : 'text-xs px-2.5 py-1 gap-1.5 font-mono font-semibold';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      title={config.tooltip}
      className={`inline-flex items-center rounded border tracking-wider shadow-subtle ${config.classes} ${sizeClass}`}
    >
      <Icon className={`${iconSize} ${config.iconColor} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
