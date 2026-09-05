import React from 'react';
import { Activity, ArrowRight, ShieldCheck, FileText, CheckCircle2, Sparkles, AlertTriangle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

export default function HostLandingHero({ onOpenApp, currentPatient, patientsCount = 0, reportsCount = 0 }) {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Subtle Host Nav */}
      <header className="border-b border-amber-900/5 bg-white/80 backdrop-blur-xs px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">MedLens</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md">
                  Clinical Intelligence
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="clinical"
            size="sm"
            onClick={onOpenApp}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
          >
            <span>Open Application Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </header>

      {/* Main Host Presentation Content */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center text-center space-y-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deterministic Reference Ranges &amp; Provenance Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            AI-Powered Clinical Information Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Transform fragmented laboratory reports, patient intakes, and clinical timelines into unified structured facts with verifiable source lineage.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onOpenApp}
            className="group px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Launch MedLens Clinical Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Pillars Grid on Warm Cream Surface */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-left space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Deterministic Ranges</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              LOW/NORMAL/HIGH statuses evaluated strictly from bounds stated in the source report.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-left space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Side-by-Side Dual Pane</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Compare verbatim document text alongside parsed biomarkers and extracted entities.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-left space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Safety Inconsistencies</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated cross-referencing between patient allergies and prescribed medications.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-left space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Human Review Audit</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Human-in-the-loop verification with timestamped, immutable audit history.
            </p>
          </div>
        </div>
      </main>

      {/* Host Footer */}
      <footer className="border-t border-amber-900/5 bg-white/60 py-3 px-6 text-center text-[11px] text-slate-500 font-mono">
        MedLens AI · Non-Diagnostic Clinical Information Provenance Workspace
      </footer>
    </div>
  );
}

