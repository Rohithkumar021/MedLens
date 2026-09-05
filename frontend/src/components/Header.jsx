import React from 'react';
import { Activity, Sparkles, User, Plus, Menu, X } from 'lucide-react';

export default function Header({
  currentPatient,
  patients,
  patients = [],
  onSelectPatient,
  onNewPatient,
  onSeedDemo,
  isLoading,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-subtle">
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 shadow-elevation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-sky-700 text-white flex items-center justify-center shadow-glow-cyan border border-sky-400/30">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">MedLens</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">MedLens</span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 bg-sky-500/15 text-sky-300 border border-sky-400/30 rounded-full">
                Clinical Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Structured patient facts &amp; deterministic reference-range provenance
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Structured clinical telemetry &amp; deterministic reference-range provenance
            </p>
          </div>
        </div>

        {/* Right: Patient Switcher & Main Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Patient Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-250 border-slate-200 rounded-lg px-2.5 py-1.5 shadow-subtle">
            <User className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-750 border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-subtle">
            <User className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />
            <label htmlFor="patient-select" className="sr-only">Select Active Patient</label>
            <select
              id="patient-select"
              value={currentPatient?.id || ''}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[190px] truncate"
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[190px] truncate"
            >
              {patients.length === 0 ? (
                <option value="">No patients recorded</option>
                <option value="" className="bg-slate-900 text-slate-400">No patients recorded</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} {p.age ? `(${p.age}y)` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* New Patient Button */}
          <button
            onClick={onNewPatient}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition shadow-subtle"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/70 rounded-xl text-xs font-semibold transition shadow-subtle"
            title="Create a new patient record"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <Plus className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span className="hidden sm:inline">Add Patient</span>
          </button>

          {/* Load Synthetic Demo Patient Button */}
          <button
            onClick={onSeedDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold shadow-glow-cyan border border-sky-400/30 transition disabled:opacity-50"
            title="Seed complete synthetic patient (Sarah Jenkins) with lab reports and conflicts"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Demo Patient</span>
          </button>
        </div>
      </div>
    </header>
  );
}
