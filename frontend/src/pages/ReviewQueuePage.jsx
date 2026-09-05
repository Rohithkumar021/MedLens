import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle,
  Edit3,
  Link2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

export default function ReviewQueuePage({
  observations,
  reports,
  patient,
  onOpenReview,
  onOpenEvidenceChain
}) {
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, UNREVIEWED, OUT_OF_RANGE, MISSING_REF

  if (!patient) return null;

  const needsReviewList = (observations || []).filter((obs) => {
    if (filterMode === 'UNREVIEWED') return !obs.is_reviewed;
    if (filterMode === 'OUT_OF_RANGE') return ['HIGH', 'LOW'].includes(obs.status);
    if (filterMode === 'MISSING_REF') return ['NOT_AVAILABLE', 'UNKNOWN'].includes(obs.status);
    // Default ALL: any unreviewed or abnormal or missing ref
    return !obs.is_reviewed || ['HIGH', 'LOW', 'NOT_AVAILABLE'].includes(obs.status);
  });

  const allCount = observations.filter(o => !o.is_reviewed || ['HIGH', 'LOW', 'NOT_AVAILABLE'].includes(o.status)).length;
  const unreviewedCount = observations.filter(o => !o.is_reviewed).length;
  const outOfRangeCount = observations.filter(o => ['HIGH', 'LOW'].includes(o.status)).length;
  const missingRefCount = observations.filter(o => ['NOT_AVAILABLE', 'UNKNOWN'].includes(o.status)).length;

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-600" />
            Clinical Verification &amp; Review Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Human-in-the-loop verification workspace for unreviewed observations, out-of-range biomarkers, and unsupplied reference intervals
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'ALL' ? 'bg-white text-sky-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Priority ({allCount})
          </button>
          <button
            onClick={() => setFilterMode('UNREVIEWED')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'UNREVIEWED' ? 'bg-white text-sky-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unreviewed ({unreviewedCount})
          </button>
          <button
            onClick={() => setFilterMode('OUT_OF_RANGE')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'OUT_OF_RANGE' ? 'bg-white text-rose-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Out of Range ({outOfRangeCount})
          </button>
          <button
            onClick={() => setFilterMode('MISSING_REF')}
            className={`px-3 py-1.5 rounded-lg transition font-mono ${
              filterMode === 'MISSING_REF' ? 'bg-white text-slate-800 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ref N/A ({missingRefCount})
          </button>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="space-y-3">
        {needsReviewList.length === 0 ? (
          <Card className="my-8 max-w-md mx-auto text-center p-8">
            <CardContent className="space-y-3 pt-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Review Queue Clear</h3>
                <p className="text-xs text-slate-500 mt-1">
                  All observations matching this filter have been verified or have normal stated reference ranges.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          needsReviewList.map((obs) => {
            const report = reports.find((r) => r.id === obs.report_id);
            const isCorrected = obs.review_status === 'CORRECTED';
            return (
              <Card
                key={obs.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-sky-300"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{obs.test_name}</h3>
                    <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
                    <ProvenanceBadge provenance={obs.provenance} size="sm" />
                    <ConfidenceBadge confidence={obs.confidence} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-baseline gap-3 text-xs text-slate-600">
                    <div>
                      Reported Value: <span className="font-mono font-bold text-sky-700 text-sm">{obs.corrected_value || obs.value_text} {obs.unit || ''}</span>
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
                    <span className="font-bold text-sky-700">Deterministic Evaluation: </span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenEvidenceChain(obs, report)}
                    className="text-xs font-semibold shadow-2xs"
                    title="View step-by-step Evidence Chain"
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1 text-sky-600" />
                    <span>Evidence Chain</span>
                  </Button>

                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={() => onOpenReview(obs)}
                    className="text-xs font-semibold shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    <span>Review &amp; Correct</span>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
