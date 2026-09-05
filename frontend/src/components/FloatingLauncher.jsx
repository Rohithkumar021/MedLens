import React from 'react';
import { Activity, ArrowRight } from 'lucide-react';

export default function FloatingLauncher({ isOpen, onToggle, activePatientName = 'Active Session' }) {
  if (isOpen) return null;

  return (
    <button
      onClick={onToggle}
      aria-label="Open MedLens Clinical Intelligence Workspace"
      className="fixed bottom-6 right-6 z-40 group flex flex-col overflow-hidden rounded-2xl border border-emerald-600/30 bg-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      {/* Top Header Section: Fresh Clinical Green */}
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
            <Activity className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider font-mono">MEDLENS</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-100">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
          READY
        </span>
      </div>

      {/* Lower Body Section: Warm Cream / Off-White */}
      <div className="flex items-center justify-between gap-4 bg-[#FFFDF7] px-4 py-3 text-left">
        <div>
          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Open Clinical Workspace
          </div>
          <div className="text-[10.5px] text-slate-500 font-medium">
            AI Information Intelligence
          </div>
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white">
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

