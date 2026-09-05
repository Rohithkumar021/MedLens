import React, { useState } from 'react';
import { X, Link2, FileText, Calendar, Building2, Edit3, History, ShieldCheck, Cpu, Database, CheckCircle2, Award, Layers, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProvenanceBadge from './ProvenanceBadge';
import ConfidenceBadge from './ConfidenceBadge';
import EvidenceChain3D from './3d/EvidenceChain3D';

export default function EvidenceChainModal({ observation, report, onClose, onOpenReview }) {
  const [viewMode, setViewMode] = useState('3D'); // '3D' or 'LIST'
  if (!observation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200 w-full max-w-2xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="bg-slate-50 text-slate-900 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-brand-700 rounded-lg border border-sky-200">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight text-slate-900">8-Stage Traceable Evidence Chain</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-sky-50 text-brand-700 rounded border border-sky-200 uppercase">
                  Verified Lineage
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifiable lineage from raw source document text to deterministic clinical evaluation and audit records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
            aria-label="Close Traceable Evidence Chain modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Switcher Sub-header */}
        <div className="bg-white px-6 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                viewMode === '3D'
                  ? 'bg-white text-brand-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> 3D Spatial Path Inspector
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition ${
                viewMode === 'LIST'
                  ? 'bg-white text-brand-700 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Full 8-Stage Audit List
            </button>
          </div>
        </div>

        {/* Modal Body: 3D Spatial Path or Full List */}
        {viewMode === '3D' ? (
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <EvidenceChain3D
              observation={observation}
              report={report}
              onOpenReview={onOpenReview}
            />
          </div>
        ) : (
          <div className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
            {/* Stage 1: Clinical Observation & Reported Value */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                1
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  1. Clinical Observation &amp; Reported Value
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
                  <span className="text-base font-extrabold text-slate-900">{observation.test_name}</span>
                  <span className="font-mono text-base font-extrabold text-brand-700">
                    {observation.corrected_value || observation.value_text} <span className="text-xs font-normal text-slate-500">{observation.unit || ''}</span>
                  </span>
                </div>
                {observation.corrected_value && (
                  <div className="text-[11px] text-amber-700 italic mt-0.5">
                    Original extracted value: {observation.value_text} {observation.unit || ''} (Corrected by clinician)
                  </div>
                )}
              </div>
            </div>

            {/* Stage 2: Source Document & Report Metadata */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                2
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  2. Source Document &amp; Report Metadata
                </div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  {report?.title || 'Laboratory Report'} ({report?.original_file_name || 'Apex_Lab_Report.pdf'})
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Lab: {report?.laboratory_name || 'Apex Health Diagnostics'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Collection Date: {observation.observation_date || report?.report_date || '2026-08-15'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 3: Exact Document Location / Verbatim Source Text */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                3
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    3. Exact Document Location / Verbatim Source Text
                  </div>
                  <span className="text-[10.5px] font-mono font-bold text-brand-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Page {observation.source_page || 1}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-900 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed select-text mt-1">
                  {observation.original_text || `${observation.test_name} | ${observation.value_text} | ${observation.unit || ''} | ${observation.original_reference_range || ''}`}
                </div>
              </div>
            </div>

            {/* Stage 4: Reference Range Supplied by Source */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                4
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  4. Reference Range Supplied by Source
                </div>
                <div className="font-mono text-xs font-bold text-slate-800">
                  {observation.original_reference_range ? (
                    <span className="text-brand-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {observation.original_reference_range} {observation.unit || ''}
                    </span>
                  ) : (
                    <span className="text-slate-600 italic bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Reference range not provided in source report (evaluated as NOT_AVAILABLE)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stage 5: Deterministic Evaluation & Reasoning */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                5
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    5. Deterministic Evaluation &amp; Reasoning
                  </div>
                  <StatusBadge status={observation.corrected_status || observation.status} size="sm" />
                </div>
                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  <span className="font-bold text-slate-900">Evaluation Logic: </span>
                  {observation.status_reason}
                </div>
              </div>
            </div>

            {/* Stage 6: Information Provenance */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                6
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  6. Information Provenance
                </div>
                <div className="flex items-center gap-3">
                  <ProvenanceBadge provenance={observation.provenance} size="sm" />
                  <span className="text-xs text-slate-600">
                    {observation.provenance === 'REPORT_EXTRACTED' && 'Direct digital extraction from submitted clinical report document.'}
                    {observation.provenance === 'USER_PROVIDED' && 'Direct clinical entry provided during patient intake.'}
                    {observation.provenance === 'SYSTEM_DERIVED' && 'Deterministically computed by MedLens clinical logic rules.'}
                    {observation.provenance === 'AI_GENERATED' && 'Synthesized by AI summarization engine with strict grounding.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 7: Extraction Confidence */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                7
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  7. Extraction Confidence
                </div>
                <div className="flex items-center gap-3">
                  <ConfidenceBadge confidence={observation.confidence} size="sm" />
                  <span className="text-xs text-slate-600">
                    {observation.confidence >= 0.95
                      ? 'High-certainty digital PDF text match with tabular structure alignment.'
                      : observation.confidence >= 0.8
                      ? 'Standard digital extraction with validated units and values.'
                      : 'Low-confidence extraction flagged for mandatory clinician review.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 8: Human Review & Audit State */}
            <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-subtle">
                8
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    8. Human Review &amp; Audit State
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    observation.is_reviewed ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {observation.review_status || 'UNREVIEWED'}
                  </span>
                </div>

                {observation.reviewer_notes && (
                  <div className="text-xs bg-white p-2 rounded border border-slate-200 text-slate-700">
                    <span className="font-bold">Reviewer Note:</span> {observation.reviewer_notes}
                  </div>
                )}

                {observation.review_records && observation.review_records.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 font-mono">
                      <History className="w-3 h-3 text-brand-600" /> Historical Audit Trail
                    </div>
                    {observation.review_records.map((r, i) => (
                      <div key={i} className="text-[10.5px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                        {r.action} by {r.reviewer} — Value: "{r.corrected_value}" ({r.corrected_status})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Traceable Evidence Chain provides transparent, auditable lineage for clinical facts.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenReview(observation);
              }}
              className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-subtle inline-flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" /> Review / Edit Fact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
