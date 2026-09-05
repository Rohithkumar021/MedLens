import React from 'react';
import { User, FileText, AlertTriangle, ShieldCheck, Activity, Link2, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import ProvenanceBadge from '../ProvenanceBadge';
import ConfidenceBadge from '../ConfidenceBadge';

export default function VisualizationFallback({
  patient,
  reports = [],
  observations = [],
  conflicts = [],
  timeline = [],
  summary,
  onOpenEvidenceChain,
  onOpenReview,
  onNavigateTab
}) {
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-card space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700">2D Relationship Matrix</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
              High-Contrast / Accessible View
            </span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 mt-1">
            Clinical Evidence &amp; Inconsistency Map
          </h3>
        </div>
      </div>

      {/* Grid of Relationships */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Core */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" /> Patient Identity Anchor
          </div>
          <div className="text-sm font-extrabold text-slate-900">{patient?.name || 'No Patient'}</div>
          <div className="text-xs text-slate-500">
            {patient?.sex}, {patient?.age ? `${patient.age} yrs` : ''} · DOB: {patient?.date_of_birth || 'N/A'}
          </div>
          <div className="pt-2 text-[11px] text-slate-600">
            Connected to {reports.length} reports, {observations.length} observations, and {conflicts.length} conflict checks.
          </div>
        </div>

        {/* Source Reports */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-brand-700 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Source Documents ({reports.length})
          </div>
          {reports.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No reports ingested.</div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {reports.map((r) => (
                <div key={r.id} className="text-xs bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between shadow-subtle">
                  <span className="font-semibold text-slate-900 truncate max-w-[170px]">{r.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{r.report_date || '2026'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinical Inconsistencies */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Flagged Inconsistencies ({conflicts.length})
          </div>
          {conflicts.length === 0 ? (
            <div className="text-xs text-emerald-700 flex items-center gap-1.5 pt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> No active clinical conflicts detected
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {conflicts.map((c) => (
                <div key={c.id} className="text-xs bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-800">
                  <div className="font-bold text-[11px] uppercase">{c.conflict_type}</div>
                  <div className="text-[11px] truncate">{c.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Observations Linear Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Structured Observations &amp; Evidence Chains ({observations.length})
          </div>
          <span className="text-[11px] text-slate-500">
            Click "Evidence" to inspect the 8-Stage Traceable Evidence Chain
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {observations.map((obs) => (
            <div key={obs.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 text-xs">{obs.test_name}</span>
                <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
              </div>

              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className="text-slate-500">Reported Value:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {obs.corrected_value || obs.value_text} {obs.unit || ''}
                </span>
              </div>

              <div className="text-[11px] text-brand-700 font-mono bg-sky-50 p-1.5 rounded border border-sky-100">
                Range: {obs.original_reference_range || 'Not provided in source'}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <ProvenanceBadge provenance={obs.provenance} size="sm" />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenEvidenceChain(obs)}
                    className="px-2 py-0.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded text-[10.5px] flex items-center gap-1 transition shadow-subtle"
                  >
                    <Link2 className="w-3 h-3" /> Evidence
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenReview(obs)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[10.5px] border border-slate-300 transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
