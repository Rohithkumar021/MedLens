import React, { useEffect, useState } from 'react';
import { Settings, Shield, Server, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600" />
          System Health &amp; Responsible AI Guardrails
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Diagnostic metrics, Gemini AI provider integration, and clinical transparency principles
        </p>
      </div>

      {/* Health & Engine Status */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-600" />
            Backend Runtime Diagnostic
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-xs text-slate-400 font-mono">Pinging backend health endpoint...</div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase font-mono">Service Status</div>
                <div className="font-bold text-emerald-700 text-xs mt-1 flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Healthy &amp; Online
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase font-mono">Environment</div>
                <div className="font-mono font-bold text-slate-800 text-xs mt-1">
                  {health.environment}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase font-mono">AI Provider</div>
                <div className="font-bold text-slate-800 text-xs mt-1">
                  {health.ai_provider}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[10.5px] text-slate-500 font-bold uppercase font-mono">Synthesis Engine</div>
                <div className="font-bold text-xs mt-1">
                  {health.gemini_configured ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Gemini Connected
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1 font-mono" title="Zero-downtime deterministic fallback active">
                      <Cpu className="w-3.5 h-3.5 text-amber-700" /> Deterministic Engine
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertTitle>Connection Failure</AlertTitle>
              <AlertDescription>Could not reach backend health endpoint.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Responsible AI Principles Box */}
      <Card className="p-6 space-y-4">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-2 font-mono">
            <Shield className="w-4 h-4 text-sky-600" />
            MedLens Responsible AI Core Principles
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <div className="font-bold text-slate-900">1. Deterministic Reference Ranges</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                LOW/NORMAL/HIGH statuses are calculated strictly from numerical intervals stated in the source report. MedLens NEVER invents or hallucinates reference ranges.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <div className="font-bold text-slate-900">2. Non-Diagnostic &amp; Non-Prescriptive</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                MedLens is an information organization and provenance platform. It does not diagnose diseases, prescribe medications, or recommend dosage modifications.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <div className="font-bold text-slate-900">3. Complete Provenance Tracking</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Every data point displays its exact origin (USER_PROVIDED, REPORT_EXTRACTED, SYSTEM_DERIVED, or AI_GENERATED) and source document page number.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <div className="font-bold text-slate-900">4. Human Review &amp; Audit Trail</div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Clinicians and users can review and correct extracted observations before treating them as confirmed records, preserving complete audit history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
