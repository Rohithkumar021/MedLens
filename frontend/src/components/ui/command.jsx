import React, { useState, useEffect } from "react";
import { Search, FileText, Users, ShieldAlert, CheckCircle2, Sliders, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function CommandDialog({
  isOpen,
  onClose,
  patients = [],
  onSelectPatient,
  onNavigate,
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered by parent or global listener
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = (patients || []).filter((p) =>
    `${p.name || ''} ${p.mrn || ''} ${(p.existing_conditions || []).join(' ')} ${(p.symptoms || []).join(' ')}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const navigationItems = [
    { label: "Clinical Dashboard", icon: FileText, tab: "dashboard", category: "Navigation" },
    { label: "Patient Directory", icon: Users, tab: "patients", category: "Navigation" },
    { label: "Source Report Inspector", icon: FileText, tab: "reports", category: "Navigation" },
    { label: "Human Review Queue", icon: CheckCircle2, tab: "review", category: "Navigation" },
    { label: "Clinical Timeline", icon: FileText, tab: "timeline", category: "Navigation" },
    { label: "Inconsistency & Conflict Resolution", icon: ShieldAlert, tab: "conflicts", category: "Navigation" },
    { label: "System Diagnostics & Settings", icon: Sliders, tab: "settings", category: "Navigation" },
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="mr-3 h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search patients, reports, navigate pages, review queue... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-400 hover:text-slate-600 mr-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Navigation Section */}
          {navigationItems.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pages & Navigation
              </div>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                      onNavigate(item.tab);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Patients Section */}
          {filteredPatients.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Patients ({filteredPatients.length})
              </div>
              {filteredPatients.slice(0, 5).map((p) => {
                const initials = (p.name || 'PT')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p);
                      onNavigate("dashboard");
                      onClose();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-700">
                        {initials}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900">
                          {p.name}
                        </span>
                        <span className="ml-2 text-xs font-mono text-slate-400">
                          ID: {p.mrn || p.id?.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    {p.existing_conditions?.[0] && (
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {p.existing_conditions[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {navigationItems.length === 0 && filteredPatients.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              No matching results for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
}

