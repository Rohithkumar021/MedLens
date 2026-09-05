import React from 'react';
import {
  Sparkles,
  FileText,
  AlertTriangle,
  Upload,
  ArrowRight,
  Shield,
  HelpCircle,
  Activity,
  Link2,
  CheckCircle2,
  Check,
  Edit3,
  Users,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import EvidenceConstellation from '../components/3d/EvidenceConstellation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { SpotlightCard } from '../components/ui/spotlight-card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';

export default function DashboardPage({
  patient,
  reports = [],
  observations = [],
  conflicts = [],
  summary,
  onGenerateSummary,
  onOpenUpload,
  onOpenReview,
  onOpenPatientEdit,
  onOpenEvidenceChain,
  isGeneratingSummary,
  setTab
}) {
  if (!patient) {
    return (
      <Card className="my-6 max-w-xl mx-auto text-center p-8">
        <CardContent className="space-y-4 pt-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto border border-sky-200/60">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">No Patient Selected</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Create a patient record or click "Load Demo" in the header to view clinical insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const normalCount = observations.filter((o) => o.status === 'NORMAL').length;
  const highCount = observations.filter((o) => o.status === 'HIGH').length;
  const lowCount = observations.filter((o) => o.status === 'LOW').length;
  const notAvailableCount = observations.filter((o) => o.status === 'NOT_AVAILABLE' || o.status === 'UNKNOWN').length;
  const unreviewedCount = observations.filter((o) => !o.is_reviewed).length;
  const attentionObservations = observations.filter((o) => !o.is_reviewed || ['HIGH', 'LOW', 'NOT_AVAILABLE'].includes(o.status));

  // Real Data Completeness Index Calculation (0 - 100%)
  let completenessScore = 0;
  if (patient.name && (patient.age || patient.date_of_birth) && patient.sex) completenessScore += 30;
  if (patient.symptoms?.length > 0 || patient.existing_conditions?.length > 0) completenessScore += 25;
  if (patient.allergies?.length > 0 || patient.medications?.length > 0) completenessScore += 25;
  if (reports.length > 0) completenessScore += 20;

  return (
    <div className="space-y-6 pb-12">
      {/* Primary Overview Cards (4 canonical clinical metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4 cursor-pointer hover:border-sky-300 transition" onClick={() => setTab('review')}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Extracted Biomarkers</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">{observations.length} Total</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-sky-600" /> {normalCount} in standard range
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:border-sky-300 transition" onClick={() => setTab('reports')}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Medical Reports</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">{reports.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-sky-600" /> Extracted Documents
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:border-amber-300 transition border-amber-200/80 bg-amber-50/20" onClick={() => setTab('review')}>
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono">Pending Reviews</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-0.5 font-mono">{unreviewedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {unreviewedCount > 0 ? 'Awaiting verification' : 'All verified'}
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:border-rose-300 transition border-rose-200/80 bg-rose-50/20" onClick={() => setTab('conflicts')}>
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-widest font-mono">Clinical Inconsistencies</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-0.5 font-mono">{conflicts.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {conflicts.length > 0 ? (
              <span className="text-rose-700 font-bold">{conflicts.length} Active Conflict(s)</span>
            ) : (
              'No clashes detected'
            )}
          </div>
        </Card>
      </div>

      {/* Signature 3D Evidence Constellation Hero Visualization */}
      <EvidenceConstellation
        patient={patient}
        reports={reports}
        observations={observations}
        conflicts={conflicts}
        summary={summary}
        onOpenEvidenceChain={onOpenEvidenceChain}
        onOpenReview={onOpenReview}
        onNavigateTab={setTab}
      />

      {/* Active Clinical Inconsistencies Alert (if any) */}
      {conflicts.length > 0 && (
        <Alert variant="warning" className="shadow-xs">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTitle className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                    Potential Clinical Inconsistency ({conflicts.length})
                  </AlertTitle>
                  <ProvenanceBadge provenance={conflicts[0].provenance} size="sm" />
                </div>
                <AlertDescription className="text-xs text-amber-800 leading-relaxed">
                  {conflicts[0].title}: {conflicts[0].description}
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="clinical"
              size="sm"
              onClick={() => setTab('conflicts')}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs font-bold"
            >
              Review Inconsistencies
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Grid: AI Summary (Left) & Key Observations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AI Summary Card (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-slate-900">AI-Generated Clinical Summary</CardTitle>
                    <Badge variant="clinical" className="text-[10px] uppercase font-mono">
                      AI GENERATED
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] text-slate-500">
                    Non-diagnostic synthesis based strictly on structured records &amp; report-stated reference intervals
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
                className="text-xs font-semibold text-teal-800 border-teal-200 hover:bg-teal-50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
                <span>{isGeneratingSummary ? 'Synthesizing...' : 'Regenerate'}</span>
              </Button>
            </CardHeader>

            {/* Summary Text Content */}
            <CardContent className="py-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {summary ? (
                <>
                  <div className="whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-slate-800">
                    {summary.summary_text}
                  </div>

                  {/* Key structured findings citations */}
                  {summary.key_observations && summary.key_observations.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Structured Evidence Breakdown ({summary.key_observations.length})</span>
                        <span className="text-[11px] text-sky-700 font-mono">Click to trace Evidence Chain</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {summary.key_observations.map((item, idx) => {
                          const matchedObs = observations.find(o => o.test_name.toLowerCase() === item.test_name.toLowerCase());
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                if (matchedObs) {
                                  const rep = reports.find(r => r.id === matchedObs.report_id);
                                  onOpenEvidenceChain(matchedObs, rep);
                                }
                              }}
                              className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-sky-400 cursor-pointer transition text-xs shadow-2xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{item.test_name}</span>
                                <StatusBadge status={item.status} size="sm" />
                              </div>
                              <div className="font-mono text-xs font-bold text-sky-700">
                                {item.value}
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate font-mono">
                                Ref: {item.reference_range}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary Engine & Provenance */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Synthesis Engine: <b className="text-slate-800 font-mono">{summary.model_name}</b></span>
                      <ProvenanceBadge provenance={summary.provenance} size="sm" />
                    </div>
                    <span className="font-mono">Generated: {new Date(summary.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Limitations and Disclaimers */}
                  {summary.limitations && summary.limitations.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-slate-800 text-[11px]">
                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                        <span>Data Limitations &amp; Transparency:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                        {summary.limitations.map((lim, i) => (
                          <li key={i}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="text-xs">No clinical summary generated yet for this record.</p>
                  <Button
                    variant="clinical"
                    size="sm"
                    onClick={onGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="text-xs font-bold"
                  >
                    Generate AI Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </div>

          <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Human Review: <b className="text-slate-800">{unreviewedCount} unreviewed observation(s)</b></span>
            <button onClick={() => setTab('review')} className="text-sky-600 font-bold hover:underline flex items-center gap-1">
              Go to Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </CardFooter>
        </Card>

        {/* Key Observations Feed (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-slate-900">Extracted Laboratory Values</CardTitle>
                <Badge variant="outline" className="text-xs font-bold font-mono">
                  {observations.length}
                </Badge>
              </div>
              <button onClick={() => setTab('reports')} className="text-xs font-bold text-sky-600 hover:underline">
                View Reports →
              </button>
            </CardHeader>

            <CardContent className="py-3 space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {observations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No laboratory observations extracted. Upload a report PDF to populate.
                </div>
              ) : (
                observations.map((obs) => {
                  const rep = reports.find(r => r.id === obs.report_id);
                  return (
                    <div
                      key={obs.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200 transition space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs group-hover:text-sky-700 transition">
                          {obs.test_name}
                        </span>
                        <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <div className="font-mono text-xs font-bold text-sky-700">
                          {obs.corrected_value || obs.value_text} <span className="text-[11px] font-normal text-slate-500">{obs.unit || ''}</span>
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-500">
                          Ref: {obs.original_reference_range || <span className="italic text-slate-400">Not provided</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <ProvenanceBadge provenance={obs.provenance} size="sm" />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEvidenceChain(obs, rep)}
                            className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 flex items-center gap-1 shadow-2xs transition"
                            title="Trace Evidence Chain"
                          >
                            <Link2 className="w-3 h-3 text-sky-600" /> Evidence
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReview(obs)}
                            className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold rounded border border-sky-200 flex items-center gap-1 transition"
                            title="Review Observation"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </div>

          <CardFooter className="pt-3 border-t border-slate-100 text-center justify-center">
            <span className="text-[11px] text-slate-400">Click "Evidence" on any observation to inspect the Traceable Evidence Chain</span>
          </CardFooter>
        </Card>
      </div>

      {/* Clinical Attention & Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Clinical Attention Table */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Clinical Attention</CardTitle>
              </div>
              <Badge variant="warning" className="text-xs font-mono font-bold">
                {attentionObservations.length + conflicts.length} Items
              </Badge>
            </div>
            <CardDescription className="text-[11px] text-slate-500">
              Observations needing human verification, out-of-range biomarkers, or unsupplied reference bounds
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Observation</TableHead>
                  <TableHead>Value / Ref</TableHead>
                  <TableHead>Evaluation</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attentionObservations.length === 0 && conflicts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-xs text-slate-400">
                      No clinical attention items active. All records are verified and within normal stated bounds.
                    </TableCell>
                  </TableRow>
                ) : (
                  attentionObservations.slice(0, 5).map((obs) => (
                    <TableRow key={obs.id}>
                      <TableCell className="font-bold text-xs text-slate-900">
                        {obs.test_name}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <span className="font-bold text-sky-700">{obs.corrected_value || obs.value_text}</span>
                        <div className="text-[10.5px] text-slate-500">{obs.original_reference_range || 'Ref N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenReview(obs)}
                          className="text-xs h-7 px-2"
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="pt-2 border-t border-slate-100 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setTab('review')} className="text-xs text-sky-600 font-semibold">
              View All In Review Queue <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activity Table */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <CardTitle className="text-sm font-bold text-slate-900">Recent Clinical Activity</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs font-mono font-bold">
                {reports.length} Reports
              </Badge>
            </div>
            <CardDescription className="text-[11px] text-slate-500">
              Chronological log of document ingestions, human reviews, and AI synthesis runs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Document / Lab</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-xs text-slate-400">
                      No document activity recorded. Upload a report to start.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.slice(0, 5).map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell className="text-xs">
                        <div className="font-bold text-slate-900">{rep.title}</div>
                        <div className="text-[10.5px] text-slate-500 font-mono">{rep.report_date || 'Date N/A'}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {rep.laboratory_name || 'Apex Diagnostics'}
                      </TableCell>
                      <TableCell>
                        <ProvenanceBadge provenance={rep.provenance} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTab('reports')}
                          className="text-xs text-sky-600 h-7 px-2"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="pt-2 border-t border-slate-100 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setTab('timeline')} className="text-xs text-sky-600 font-semibold">
              View Full Timeline <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
