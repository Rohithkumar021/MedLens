import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Building2,
  Edit3,
  UploadCloud,
  CheckCircle,
  FileCode,
  Layers,
  Link2,
  Info,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../components/ui/sheet';

export default function ReportViewerPage({
  reports,
  patient,
  onOpenUpload,
  onOpenReview,
  onOpenEvidenceChain
}) {
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id || null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [highlightedTest, setHighlightedTest] = useState(null);
  const [mobileView, setMobileView] = useState('structured'); // 'structured' or 'source'
  const [activeSheetObs, setActiveSheetObs] = useState(null);

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  if (reports.length === 0) {
    return (
      <Card className="my-8 max-w-lg mx-auto text-center p-8">
        <CardContent className="space-y-4 pt-4">
          <div className="w-14 h-14 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center mx-auto border border-sky-200/60">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Medical Reports Uploaded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Upload a laboratory PDF or clinical text report to extract structured observations side-by-side with source text.
            </p>
          </div>
          <Button
            variant="clinical"
            size="sm"
            onClick={onOpenUpload}
            className="text-xs font-semibold"
          >
            <UploadCloud className="w-4 h-4 mr-1.5" /> Upload First Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  const observations = currentReport?.observations || [];

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Report Selector */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl border border-sky-200/60">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label htmlFor="report-select" className="sr-only">Selected Report</label>
                <select
                  id="report-select"
                  value={selectedReportId || currentReport.id}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="font-bold text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-500 cursor-pointer pr-4"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.original_file_name})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: <b className="text-slate-700 font-mono">{currentReport.report_date || 'Not stated'}</b>
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Lab: <b className="text-slate-700">{currentReport.laboratory_name || 'Apex Diagnostics'}</b>
                </span>
                <ProvenanceBadge provenance={currentReport.provenance} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile view toggle */}
            <div className="md:hidden flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setMobileView('source')}
                className={`px-2.5 py-1 rounded ${mobileView === 'source' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600'}`}
              >
                Source Text
              </button>
              <button
                onClick={() => setMobileView('structured')}
                className={`px-2.5 py-1 rounded ${mobileView === 'structured' ? 'bg-white text-sky-700 shadow-2xs' : 'text-slate-600'}`}
              >
                Structured Data
              </button>
            </div>

            <Button
              variant="clinical"
              size="sm"
              onClick={onOpenUpload}
              className="text-xs font-semibold shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload Another
            </Button>
          </div>
        </div>
      </Card>

      {/* Side-by-Side Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Extracted Source Document Text (5 cols) */}
        <Card className={`lg:col-span-5 flex flex-col h-[740px] ${mobileView === 'structured' ? 'hidden md:flex' : 'flex'}`}>
          <CardHeader className="pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-sky-600" />
                  Source Document / Extracted Text
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Verbatim digital text extracted from uploaded file
                </CardDescription>
              </div>

              {/* Page Selector */}
              {currentReport.pages_metadata && currentReport.pages_metadata.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
                  {currentReport.pages_metadata.map((p) => (
                    <button
                      key={p.page_num}
                      onClick={() => setSelectedPage(p.page_num)}
                      className={`px-2 py-0.5 rounded font-bold font-mono transition ${
                        selectedPage === p.page_num ? 'bg-white text-sky-700 border border-sky-200 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pg {p.page_num}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          {/* Raw Text Viewer with line highlighting */}
          <CardContent className="mt-3 flex-1 overflow-y-auto bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs leading-relaxed space-y-0.5 select-text shadow-inner">
            {currentReport.raw_text.split('\n').map((line, idx) => {
              const isHighlighted = highlightedTest && line.toLowerCase().includes(highlightedTest.toLowerCase());
              return (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded transition ${
                    isHighlighted ? 'bg-amber-500/20 text-amber-200 border-l-2 border-amber-400 font-bold' : 'hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 text-[10px] select-none mr-2 inline-block w-6 text-right">
                    {idx + 1}
                  </span>
                  {line}
                </div>
              );
            })}
          </CardContent>

          <CardFooter className="pt-2.5 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between shrink-0 font-mono">
            <span>File: <b className="text-slate-800">{currentReport.original_file_name}</b></span>
            <span>{(currentReport.file_size_bytes / 1024).toFixed(1)} KB</span>
          </CardFooter>
        </Card>

        {/* RIGHT PANE: Structured Medical Information (7 cols) */}
        <Card className={`lg:col-span-7 flex flex-col h-[740px] ${mobileView === 'source' ? 'hidden md:flex' : 'flex'}`}>
          <CardHeader className="pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-sky-600" />
                  Structured Medical Observations ({observations.length})
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400">
                  Deterministic reference-range evaluation &amp; provenance breakdown
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold font-mono">
                {observations.filter((o) => o.is_reviewed).length} / {observations.length} Reviewed
              </Badge>
            </div>
          </CardHeader>

          {/* Observations List */}
          <CardContent className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
            {observations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No observations parsed from this document.
              </div>
            ) : (
              observations.map((obs) => {
                const isCorrected = obs.review_status === 'CORRECTED';
                return (
                  <div
                    key={obs.id}
                    onMouseEnter={() => setHighlightedTest(obs.test_name)}
                    onMouseLeave={() => setHighlightedTest(null)}
                    className={`p-3.5 rounded-xl border transition ${
                      obs.is_reviewed
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-slate-200 hover:border-sky-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{obs.test_name}</h4>
                          {obs.is_reviewed && (
                            <Badge variant="success" className="text-[10px] uppercase font-mono flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> {obs.review_status}
                            </Badge>
                          )}
                        </div>

                        {/* Reported Value & Source Reference Range */}
                        <div className="flex flex-wrap items-baseline gap-2.5 mt-1.5">
                          <div className="text-xs text-slate-600">
                            Reported value: <span className="font-mono font-bold text-sky-700 text-sm">{obs.corrected_value || obs.value_text} {obs.unit || ''}</span>
                          </div>

                          {isCorrected && (
                            <span className="text-[11px] text-slate-400 line-through font-mono">
                              Extracted: {obs.value_text}
                            </span>
                          )}

                          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                            {obs.original_reference_range
                              ? `Reference range from source report: ${obs.original_reference_range}`
                              : `Reference range not provided in source report`}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => onOpenEvidenceChain(obs, currentReport)}
                            className="text-[11px] text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 font-bold px-2 py-0.5 rounded transition flex items-center gap-1"
                            title="Inspect full Evidence Chain"
                          >
                            <Link2 className="w-3 h-3" /> Evidence
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReview(obs)}
                            className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-0.5 rounded transition flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Review
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Deterministic Evaluation Reasoning */}
                    <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11.5px] text-slate-700">
                      <span className="font-bold text-sky-700">Deterministic Evaluation: </span>
                      {obs.status_reason}
                    </div>

                    {/* Metadata & Provenance Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <ProvenanceBadge provenance={obs.provenance} size="sm" />
                        <span className="font-mono">Source: Page {obs.source_page || 1}</span>
                      </div>
                      <ConfidenceBadge confidence={obs.confidence} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Observation Detail Slide-Over Drawer Sheet */}
      <Sheet isOpen={Boolean(activeSheetObs)} onClose={() => setActiveSheetObs(null)}>
        {activeSheetObs && (
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{activeSheetObs.test_name}</SheetTitle>
              <SheetDescription>Detailed observation metadata &amp; evaluation logic</SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold">Value:</span>
                <p className="text-slate-900 font-mono text-sm font-bold">{activeSheetObs.value_text} {activeSheetObs.unit}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold">Reference Range:</span>
                <p className="text-slate-700 font-mono">{activeSheetObs.original_reference_range || 'Not provided in report'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold">Deterministic Reasoning:</span>
                <p className="text-slate-700">{activeSheetObs.status_reason}</p>
              </div>
            </div>
            <SheetFooter>
              <Button
                variant="clinical"
                onClick={() => {
                  const obs = activeSheetObs;
                  setActiveSheetObs(null);
                  onOpenReview(obs);
                }}
              >
                Review This Observation
              </Button>
            </SheetFooter>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
