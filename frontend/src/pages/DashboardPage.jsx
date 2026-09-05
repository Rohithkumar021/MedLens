import React from 'react';
import { Sparkles, FileText, AlertTriangle, CheckSquare, Upload, ArrowRight, UserCheck, Shield, HelpCircle, Activity, Link2, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import EvidenceConstellation from '../components/3d/EvidenceConstellation';

export default function DashboardPage({
  patient,
  reports,
  observations,
  conflicts,
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
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-card my-6 max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-brand-600 flex items-center justify-center mx-auto">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">No Patient Selected</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create a patient record or click "Load Demo Patient" in the header to view clinical insights.
          </p>
        </div>
      </div>
    );
  }

  const normalCount = observations.filter((o) => o.status === 'NORMAL').length;
  const highCount = observations.filter((o) => o.status === 'HIGH').length;
  const lowCount = observations.filter((o) => o.status === 'LOW').length;
  const notAvailableCount = observations.filter((o) => o.status === 'NOT_AVAILABLE' || o.status === 'UNKNOWN').length;
  const unreviewedCount = observations.filter((o) => !o.is_reviewed).length;

  // Real Data Completeness Index Calculation (0 - 100%)
  let completenessScore = 0;
  if (patient.name && (patient.age || patient.date_of_birth) && patient.sex) completenessScore += 30;
  if (patient.symptoms?.length > 0 || patient.existing_conditions?.length > 0) completenessScore += 25;
  if (patient.allergies?.length > 0 || patient.medications?.length > 0) completenessScore += 25;
  if (reports.length > 0) completenessScore += 20;

  return (
    <div className="space-y-6 pb-12">
      {/* Product Mission Hero Banner */}
      <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-card border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-700">Clinical Intelligence Workspace</span>
              <span className="text-slate-300">·</span>
              <ProvenanceBadge provenance={patient.source || 'USER_PROVIDED'} size="sm" />
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{patient.name}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {patient.sex || 'Unspecified'}, {patient.age ? `${patient.age} yrs` : 'Age N/A'}
              </span>
              {patient.date_of_birth && (
                <span className="text-xs text-slate-500 font-mono">DOB: {patient.date_of_birth}</span>
              )}
            </div>

            {/* Patient Context Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
              {patient.symptoms?.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium">
                  Symptom: {s}
                </span>
              ))}
              {patient.existing_conditions?.map((c, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md font-medium">
                  Condition: {c}
                </span>
              ))}
              {patient.allergies?.map((a, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md font-bold">
                  Allergy: {a}
                </span>
              ))}
              {patient.medications?.map((m, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md font-medium">
                  Medication: {m}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Real Data Completeness Index Bar */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1 w-44">
              <div className="flex items-center justify-between font-bold text-[11px] text-slate-600">
                <span>Record Completeness</span>
                <span className="text-brand-700 font-mono">{completenessScore}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenPatientEdit}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition shadow-subtle"
              >
                Edit Context
              </button>
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Reports</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">{reports.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-brand-600" /> Extracted Documents
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-mono">Within Range</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-0.5 font-mono">{normalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Within source range</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <div className="text-[10px] font-bold text-rose-700 uppercase tracking-widest font-mono">Out of Range</div>
          <div className="text-2xl font-extrabold text-rose-700 mt-0.5 font-mono">{highCount + lowCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-rose-700 font-bold">{highCount} High</span> · <span className="text-amber-700 font-bold">{lowCount} Low</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Ref Not Provided</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-0.5 font-mono">{notAvailableCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1" title="MedLens never invents reference ranges">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Status: NOT AVAILABLE
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest font-mono">Inconsistencies</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-0.5 font-mono">{conflicts.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {conflicts.length > 0 ? (
              <button onClick={() => setTab('conflicts')} className="text-amber-700 font-bold hover:underline">
                Review Conflicts →
              </button>
            ) : (
              'No active clashes'
            )}
          </div>
        </div>
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-subtle">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-mono">
                    Potential Clinical Inconsistency ({conflicts.length})
                  </h3>
                  <ProvenanceBadge provenance={conflicts[0].provenance} size="sm" />
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {conflicts[0].title}: {conflicts[0].description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTab('conflicts')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition shadow-subtle"
            >
              Review Inconsistencies
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: AI Summary (Left) & Key Observations (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* AI Summary Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Clinical Information Summary</h3>
                  <p className="text-[11px] text-slate-500">
                    AI synthesis based strictly on structured records &amp; report-stated reference intervals
                  </p>
                </div>
              </div>
              <button
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingSummary ? 'Synthesizing...' : 'Regenerate'}</span>
              </button>
            </div>

            {/* Summary Text Content */}
            <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
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
                        <span className="text-[11px] text-brand-700 font-mono">Click to trace Evidence Chain</span>
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
                              className="p-2.5 bg-white rounded-lg border border-slate-200 hover:border-brand-400 cursor-pointer transition text-xs shadow-subtle space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-900">{item.test_name}</span>
                                <StatusBadge status={item.status} size="sm" />
                              </div>
                              <div className="font-mono text-xs font-bold text-brand-700">
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
                  <button
                    onClick={onGenerateSummary}
                    disabled={isGeneratingSummary}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Generate AI Summary
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Human Review: <b className="text-slate-800">{unreviewedCount} unreviewed observation(s)</b></span>
            <button onClick={() => setTab('review')} className="text-brand-600 font-bold hover:underline flex items-center gap-1">
              Go to Review Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Key Observations Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Extracted Laboratory Values</h3>
                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono">
                  {observations.length}
                </span>
              </div>
              <button onClick={() => setTab('reports')} className="text-xs font-bold text-brand-600 hover:underline">
                View Reports →
              </button>
            </div>

            <div className="py-3 space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
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
                        <span className="font-extrabold text-slate-900 text-xs group-hover:text-brand-700 transition">
                          {obs.test_name}
                        </span>
                        <StatusBadge status={obs.corrected_status || obs.status} size="sm" />
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <div className="font-mono text-xs font-extrabold text-brand-700">
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
                            className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded border border-slate-200 flex items-center gap-1 shadow-subtle transition"
                            title="Trace Evidence Chain"
                          >
                            <Link2 className="w-3 h-3 text-brand-600" /> Evidence
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenReview(obs)}
                            className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-brand-800 font-bold rounded border border-sky-200 flex items-center gap-1 transition"
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
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">Click "Evidence" on any observation to inspect the Traceable Evidence Chain</span>
          </div>
        </div>
      </div>
    </div>
  );
}
