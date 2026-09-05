import React from 'react';
import { X, Link2, FileText, CheckCircle2, AlertTriangle, Clock, Sparkles, UserCheck, Shield, Edit3, ArrowRight, ExternalLink, Activity } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import ProvenanceBadge from '../ProvenanceBadge';
import ConfidenceBadge from '../ConfidenceBadge';

export default function EvidenceDetailPanel({
  node,
  onClose,
  onOpenEvidenceChain,
  onOpenReview,
  onNavigateTab
}) {
  if (!node) return null;

  const data = node.data || {};

  return (
    <div className="absolute top-4 right-4 z-40 w-84 sm:w-96 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-5 animate-modal-in transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-brand-700 border border-sky-200">
            {node.type === 'patient' && <UserCheck className="w-4 h-4" />}
            {node.type === 'report' && <FileText className="w-4 h-4" />}
            {node.type === 'observation' && <Activity className="w-4 h-4" />}
            {node.type === 'conflict' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            {node.type === 'timeline' && <Clock className="w-4 h-4 text-purple-600" />}
            {node.type === 'summary' && <Sparkles className="w-4 h-4 text-brand-600" />}
            {node.type === 'range' && <Shield className="w-4 h-4 text-emerald-600" />}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              {node.type === 'patient' && 'Patient Identity'}
              {node.type === 'report' && 'Source Report'}
              {node.type === 'observation' && 'Structured Observation'}
              {node.type === 'conflict' && 'Potential Inconsistency'}
              {node.type === 'timeline' && 'Timeline Event'}
              {node.type === 'summary' && 'AI Clinical Synthesis'}
              {node.type === 'range' && 'Source Reference Interval'}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-[230px]">
              {node.label}
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
          aria-label="Close detail panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="py-3 space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
        {/* Observation Node Content */}
        {node.type === 'observation' && (
          <>
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Extracted Value</span>
              <span className="font-mono text-sm font-extrabold text-slate-900">
                {data.corrected_value || data.value_text} <span className="text-xs font-normal text-slate-500">{data.unit || ''}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Deterministic Status</span>
              <StatusBadge status={data.corrected_status || data.status} size="sm" />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase">Report-Stated Interval</div>
              <div className="font-mono text-xs text-brand-700">
                {data.original_reference_range || 'Reference range not provided in source report'}
              </div>
              <div className="text-[11px] text-slate-600 pt-1">
                <span className="font-semibold text-slate-700">Reasoning: </span>
                {data.status_reason || 'Evaluated against document text.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Provenance</div>
                <ProvenanceBadge provenance={data.provenance} size="sm" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Extraction Confidence</div>
                <ConfidenceBadge confidence={data.confidence} size="sm" />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenEvidenceChain && onOpenEvidenceChain(data)}
                className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-subtle transition"
              >
                <Link2 className="w-3.5 h-3.5" /> Inspect 8-Stage Evidence Chain
              </button>
              <button
                type="button"
                onClick={() => onOpenReview && onOpenReview(data)}
                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-2 border border-slate-300 transition"
              >
                <Edit3 className="w-3.5 h-3.5" /> Review / Edit Extraction
              </button>
            </div>
          </>
        )}

        {/* Report Node Content */}
        {node.type === 'report' && (
          <>
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Document Metadata</div>
              <div className="text-slate-900 font-semibold">{data.title}</div>
              <div className="text-[11px] text-slate-500 font-mono">File: {data.original_file_name}</div>
              <div className="text-[11px] text-slate-500">Lab: {data.laboratory_name || 'Apex Health Diagnostics'}</div>
              <div className="text-[11px] text-slate-500">Date: {data.report_date || '2026-08-15'}</div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Processing Status</span>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {data.status || 'PROCESSED'}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('reports')}
                className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-subtle"
              >
                <FileText className="w-3.5 h-3.5" /> Open in Side-by-Side Report Viewer
              </button>
            </div>
          </>
        )}

        {/* Conflict Node Content */}
        {node.type === 'conflict' && (
          <>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-800">Severity: {data.severity || 'HIGH'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  {data.conflict_type || 'INCONSISTENCY'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {data.description}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('conflicts')}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition shadow-subtle"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Resolve Potential Inconsistency
              </button>
            </div>
          </>
        )}

        {/* Timeline Node Content */}
        {node.type === 'timeline' && (
          <>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-purple-700">{data.event_type}</div>
              <div className="text-xs font-bold text-slate-900">{data.title}</div>
              <p className="text-[11px] text-slate-600">{data.description}</p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">Date: {data.event_date || 'N/A'}</div>
            </div>
          </>
        )}

        {/* Patient Node Content */}
        {node.type === 'patient' && (
          <>
            <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Patient Information</div>
              <div className="text-slate-900 font-bold text-sm">{data.name}</div>
              <div className="text-slate-600">{data.sex || 'Unspecified'}, {data.age ? `${data.age} years old` : 'Age N/A'}</div>
              {data.allergies?.length > 0 && (
                <div className="text-rose-700 font-semibold text-[11px]">Allergies: {data.allergies.join(', ')}</div>
              )}
              {data.medications?.length > 0 && (
                <div className="text-purple-700 text-[11px]">Medications: {data.medications.join(', ')}</div>
              )}
            </div>
          </>
        )}

        {/* AI Summary Node Content */}
        {node.type === 'summary' && (
          <>
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-brand-700">
                <span>AI Clinical Synthesis</span>
                <ProvenanceBadge provenance="AI_GENERATED" size="sm" />
              </div>
              <p className="text-xs text-slate-700 line-clamp-4 leading-relaxed">
                {data.summary_text || 'Synthesized clinical explanation grounded strictly on reported findings.'}
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Model: {data.model_name || 'Gemini 2.5 Flash'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
