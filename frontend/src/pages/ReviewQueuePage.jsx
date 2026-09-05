import React, { useState } from 'react';
import { CheckSquare, AlertCircle, CheckCircle, Edit3, Link2, Filter, ShieldAlert, FileText, Check } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function ReviewQueuePage({
  observations,
  reports,
  patient,
  onOpenReview,
  onOpenEvidenceChain,
  onQuickConfirm
}) {
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, UNREVIEWED, OUT_OF_RANGE, MISSING_REF, LOW_CONF

  if (!patient) return null;

  const needsReviewList = observations.filter((obs) => {
    if (filterMode === 'UNREVIEWED') return !obs.is_reviewed;
    if (filterMode === 'OUT_OF_RANGE') return ['HIGH', 'LOW'].includes(obs.status);
    if (filterMode === 'MISSING_REF') return ['NOT_AVAILABLE', 'UNKNOWN'].includes(obs.status);
    if (filterMode === 'LOW_CONF') return obs.confidence === 'LOW' || obs.confidence === 'MEDIUM';
    // Default ALL: any unreviewed or abnormal or missing ref
    return !obs.is_reviewed || ['HIGH', 'LOW', 'NOT_AVAILABLE'].includes(obs.status);
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-600" />
            Clinical Verification &amp; Review Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Human-in-the-loop verification workspace for unreviewed observations, out-of-range biomarkers, and unsupplied reference intervals
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'ALL' ? 'bg-white text-brand-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Priority ({observations.filter(o => !o.is_reviewed || ['HIGH', 'LOW', 'NOT_AVAILABLE'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilterMode('UNREVIEWED')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'UNREVIEWED' ? 'bg-white text-brand-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unreviewed ({observations.filter(o => !o.is_reviewed).length})
          </button>
          <button
            onClick={() => setFilterMode('OUT_OF_RANGE')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'OUT_OF_RANGE' ? 'bg-white text-rose-700 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Out of Range ({observations.filter(o => ['HIGH', 'LOW'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilterMode('MISSING_REF')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'MISSING_REF' ? 'bg-white text-slate-800 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ref N/A ({observations.filter(o => ['NOT_AVAILABLE', 'UNKNOWN'].includes(o.status)).length})
          </button>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-3">
        {needsReviewList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 max-w-md mx-auto space-y-3 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Review Queue Clear</h3>
              <p className="text-xs text-slate-500 mt-1">
                All observations matching this filter have been verified or have normal stated reference ranges.
              </p>
            </div>
          </div>
        ) : (
          needsReviewList.map((obs) => {
            const report = reports.find((r) => r.id === obs.report_id);
            const isCorrected = obs.review_status === 'CORRECTED';
            return (
              <div
                key={obs.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-brand-300"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{obs.test_name}</h3>
                    <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
                    <ProvenanceBadge provenance={obs.provenance} size="sm" />
                    <ConfidenceBadge confidence={obs.confidence} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-baseline gap-3 text-xs text-slate-600">
                    <div>
                      Reported Value: <span className="font-mono font-extrabold text-brand-700 text-sm">{obs.corrected_value || obs.value_text} {obs.unit || ''}</span>
                    </div>
                    {isCorrected && (
                      <span className="text-slate-400 line-through text-[11px] font-mono">
                        Original: {obs.value_text}
                      </span>
                    )}
                    <div className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {obs.original_reference_range
                        ? `Reference range from source report: ${obs.original_reference_range}`
                        : `Reference range not provided in source report`}
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-brand-700">Deterministic Evaluation: </span>
                    {obs.status_reason}
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-mono">Source: {report?.title || 'Report'} · Page {obs.source_page || 1}</span>
                    <span>·</span>
                    <span>State: <b className="text-slate-800 font-mono">{obs.review_status || 'UNREVIEWED'}</b></span>
                    {obs.reviewer_notes && <span className="italic text-slate-600">("{obs.reviewer_notes}")</span>}
                  </div>
                </div>

                {/* Quick Action Controls */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => onOpenEvidenceChain(obs, report)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition inline-flex items-center gap-1.5 shadow-subtle"
                    title="View step-by-step Evidence Chain"
                  >
                    <Link2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>Evidence Chain</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenReview(obs)}
                    className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition shadow-subtle inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Review &amp; Correct</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
