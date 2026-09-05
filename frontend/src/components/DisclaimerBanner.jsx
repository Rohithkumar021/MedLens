import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" aria-hidden="true" />
          <span className="font-bold tracking-wide text-sky-300 uppercase text-[11px]">
            Clinical Intelligence &amp; Provenance System:
          </span>
          <span className="text-slate-300 hidden md:inline text-[11px] leading-tight">
            MedLens organizes and explains facts from provided records. It does not provide medical diagnoses or prescribe treatments.
          </span>
          <span className="text-slate-300 md:hidden text-[11px]">
            Non-diagnostic clinical intelligence tool.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 shrink-0 text-[11px] font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span className="hidden sm:inline">Deterministic reference range engine active</span>
        </div>
      </div>
    </div>
  );
}
