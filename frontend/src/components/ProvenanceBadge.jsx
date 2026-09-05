import React from 'react';
import { UserCheck, FileText, Sparkles, Cpu, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './ui/tooltip';

export default function ProvenanceBadge({ provenance, size = 'sm' }) {
  const norm = (provenance || 'REPORT_EXTRACTED').toUpperCase().replace(/\s+/g, '_');

  const configs = {
    USER_PROVIDED: {
      label: 'USER PROVIDED',
      icon: UserCheck,
      classes: 'bg-purple-50 text-purple-800 border-purple-200/90',
      iconColor: 'text-purple-600',
      tooltip: 'Origin: Entered directly by patient or clinician during clinical intake.'
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
      tooltip: 'Origin: Synthesized by clinical AI engine based strictly on available structured records.'
    },
    SYSTEM_DERIVED: {
      label: 'SYSTEM DERIVED',
      icon: Cpu,
      classes: 'bg-slate-100 text-slate-700 border-slate-200/90',
      iconColor: 'text-slate-600',
      tooltip: 'Origin: Computed deterministically using reference intervals stated in the source report.'
    },
    HUMAN_VERIFIED: {
      label: 'HUMAN VERIFIED',
      icon: CheckCircle2,
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      iconColor: 'text-emerald-600',
      tooltip: 'Origin: Verified and confirmed by authorized human clinician or medical reviewer.'
    }
  };

  const config = configs[norm] || configs.REPORT_EXTRACTED;
  const Icon = config.icon;

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1 font-mono font-bold' : 'text-xs px-2.5 py-1 gap-1.5 font-mono font-bold';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center rounded-md border tracking-wider shadow-2xs select-none cursor-help ${config.classes} ${sizeClass}`}
          >
            <Icon className={`${iconSize} ${config.iconColor} shrink-0`} aria-hidden="true" />
            <span>{config.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-sans max-w-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
