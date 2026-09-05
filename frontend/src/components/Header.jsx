import React from 'react';
import { Activity, Sparkles, User, Plus, Menu, X, Search, Command } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

export default function Header({
  currentPatient,
  patients = [],
  onSelectPatient,
  onNewPatient,
  onSeedDemo,
  onOpenCommand,
  isLoading,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  const patientInitials = currentPatient?.name
    ? currentPatient.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PX';

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-slate-600 hover:text-slate-900"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 text-white flex items-center justify-center shadow-sm border border-sky-500/20">
            <Activity className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">MedLens</span>
              <Badge variant="clinical" className="text-[10px] font-bold tracking-wider uppercase">
                Clinical Intelligence
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Structured patient facts &amp; deterministic reference-range provenance
            </p>
          </div>
        </div>

        {/* Center/Search Shortcut Button */}
        <button
          onClick={onOpenCommand}
          className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          title="Open command menu (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search patients, records...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Right: Patient Switcher & Main Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Patient Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Avatar className="w-5 h-5 bg-sky-100 text-sky-800 text-[10px] font-bold">
              <AvatarFallback>{patientInitials}</AvatarFallback>
            </Avatar>
            <label htmlFor="patient-select" className="sr-only">Select Active Patient</label>
            <select
              id="patient-select"
              value={currentPatient?.id || ''}
              onChange={(e) => onSelectPatient(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[180px] truncate"
            >
              {patients.length === 0 ? (
                <option value="">No patients recorded</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.age ? `(${p.age}y)` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* New Patient Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onNewPatient}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium"
            title="Create a new patient record"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Add Patient</span>
          </Button>

          {/* Load Synthetic Demo Patient Button */}
          <Button
            variant="clinical"
            size="sm"
            onClick={onSeedDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs"
            title="Seed complete synthetic patient (Sarah Jenkins) with lab reports and conflicts"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Load Demo</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
