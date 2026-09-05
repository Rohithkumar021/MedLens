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
    <div className="absolute top-4 right-4 z-40 w-84 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-5 animate-modal-in transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            {node.type === 'patient' && <UserCheck className="w-4 h-4" />}
            {node.type === 'report' && <FileText className="w-4 h-4" />}
            {node.type === 'observation' && <Activity className="w-4 h-4" />}
            {node.type === 'conflict' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {node.type === 'timeline' && <Clock className="w-4 h-4 text-purple-400" />}
            {node.type === 'summary' && <Sparkles className="w-4 h-4 text-indigo-400" />}
            {node.type === 'range' && <Shield className="w-4 h-4 text-emerald-400" />}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {node.type === 'patient' && 'Patient Identity'}
              {node.type === 'report' && 'Source Report'}
              {node.type === 'observation' && 'Structured Observation'}
              {node.type === 'conflict' && 'Potential Inconsistency'}
              {node.type === 'timeline' && 'Timeline Event'}
              {node.type === 'summary' && 'AI Clinical Synthesis'}
              {node.type === 'range' && 'Source Reference Interval'}
            </span>
            <h4 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-[230px]">
              {node.label}
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
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
            <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <span className="text-slate-400">Extracted Value</span>
              <span className="font-mono text-sm font-extrabold text-white">
                {data.corrected_value || data.value_text} <span className="text-xs font-normal text-slate-400">{data.unit || ''}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Deterministic Status</span>
              <StatusBadge status={data.corrected_status || data.status} size="sm" />
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
              <div className="text-[10.5px] font-bold text-slate-400 uppercase">Report-Stated Interval</div>
              <div className="font-mono text-xs text-sky-300">
                {data.original_reference_range || 'Reference range not provided in source report'}
              </div>
              <div className="text-[11px] text-slate-400 pt-1">
                <span className="font-semibold text-slate-300">Reasoning: </span>
                {data.status_reason || 'Evaluated against document text.'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Provenance</div>
                <ProvenanceBadge provenance={data.provenance} size="sm" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Extraction Confidence</div>
                <ConfidenceBadge confidence={data.confidence} size="sm" />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenEvidenceChain && onOpenEvidenceChain(data)}
                className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Link2 className="w-3.5 h-3.5" /> Inspect 8-Stage Evidence Chain
              </button>
              <button
                type="button"
                onClick={() => onOpenReview && onOpenReview(data)}
                className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <Edit3 className="w-3.5 h-3.5" /> Review / Edit Extraction
              </button>
            </div>
          </>
        )}

        {/* Report Node Content */}
        {node.type === 'report' && (
          <>
            <div className="space-y-1.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Document Metadata</div>
              <div className="text-white font-semibold">{data.title}</div>
              <div className="text-[11px] text-slate-400 font-mono">File: {data.original_file_name}</div>
              <div className="text-[11px] text-slate-400">Lab: {data.laboratory_name || 'Apex Health Diagnostics'}</div>
              <div className="text-[11px] text-slate-400">Date: {data.report_date || '2026-08-15'}</div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Processing Status</span>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {data.status || 'PROCESSED'}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('reports')}
                className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <FileText className="w-3.5 h-3.5" /> Open in Side-by-Side Report Viewer
              </button>
            </div>
          </>
        )}

        {/* Conflict Node Content */}
        {node.type === 'conflict' && (
          <>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-400">Severity: {data.severity || 'HIGH'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                  {data.conflict_type || 'INCONSISTENCY'}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {data.description}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab && onNavigateTab('conflicts')}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Resolve Potential Inconsistency
              </button>
            </div>
          </>
        )}

        {/* Timeline Node Content */}
        {node.type === 'timeline' && (
          <>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-purple-400">{data.event_type}</div>
              <div className="text-xs font-bold text-white">{data.title}</div>
              <p className="text-[11px] text-slate-300">{data.description}</p>
              <div className="text-[10px] font-mono text-slate-400 pt-1">Date: {data.event_date || 'N/A'}</div>
            </div>
          </>
        )}

        {/* Patient Node Content */}
        {node.type === 'patient' && (
          <>
            <div className="space-y-1.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Patient Information</div>
              <div className="text-white font-bold text-sm">{data.name}</div>
              <div className="text-slate-300">{data.sex || 'Unspecified'}, {data.age ? `${data.age} years old` : 'Age N/A'}</div>
              {data.allergies?.length > 0 && (
                <div className="text-rose-300 font-semibold text-[11px]">Allergies: {data.allergies.join(', ')}</div>
              )}
              {data.medications?.length > 0 && (
                <div className="text-purple-300 text-[11px]">Medications: {data.medications.join(', ')}</div>
              )}
            </div>
          </>
        )}

        {/* AI Summary Node Content */}
        {node.type === 'summary' && (
          <>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-indigo-300">
                <span>AI Clinical Synthesis</span>
                <ProvenanceBadge provenance="AI_GENERATED" size="sm" />
              </div>
              <p className="text-xs text-slate-200 line-clamp-4 leading-relaxed">
                {data.summary_text || 'Synthesized clinical explanation grounded strictly on reported findings.'}
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                Model: {data.model_name || 'Gemini 2.5 Flash'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
