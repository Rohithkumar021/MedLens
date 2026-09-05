import React, { useEffect, useState } from 'react';
import { Settings, Shield, Server, Cpu, CheckCircle2, AlertCircle, FileCheck, Check } from 'lucide-react';
import { api } from '../services/api';

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
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          System Health &amp; Responsible AI Guardrails
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Diagnostic metrics, Gemini AI provider integration, and clinical transparency principles
        </p>
      </div>

      {/* Health & Engine Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-600" />
          Backend Runtime Diagnostic
        </h3>

        {loading ? (
          <div className="text-xs text-slate-400">Pinging backend health endpoint...</div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10.5px] text-slate-400 font-bold uppercase">Service Status</div>
              <div className="font-extrabold text-emerald-700 text-xs mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy &amp; Online
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10.5px] text-slate-400 font-bold uppercase">Environment</div>
              <div className="font-mono font-bold text-slate-800 text-xs mt-1">
                {health.environment}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10.5px] text-slate-400 font-bold uppercase">AI Provider</div>
              <div className="font-bold text-slate-800 text-xs mt-1">
                {health.ai_provider}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10.5px] text-slate-400 font-bold uppercase">Synthesis Engine</div>
              <div className="font-bold text-xs mt-1">
                {health.gemini_configured ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Gemini Connected
                  </span>
                ) : (
                  <span className="text-amber-800 flex items-center gap-1" title="Zero-downtime deterministic fallback active">
                    <Cpu className="w-3.5 h-3.5" /> Deterministic Engine Active
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-rose-700 flex items-center gap-1 font-semibold">
            <AlertCircle className="w-4 h-4" /> Could not reach backend health endpoint.
          </div>
        )}
      </div>

      {/* Responsible AI Principles Box */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-card space-y-4 border border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" />
          MedLens Responsible AI Core Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div className="font-extrabold text-white">1. Deterministic Reference Ranges</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              LOW/NORMAL/HIGH statuses are calculated strictly from numerical intervals stated in the source report. MedLens NEVER invents or hallucinates reference ranges.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div className="font-extrabold text-white">2. Non-Diagnostic &amp; Non-Prescriptive</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              MedLens is an information organization and provenance platform. It does not diagnose diseases, prescribe medications, or recommend dosage modifications.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div className="font-extrabold text-white">3. Complete Provenance Tracking</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every data point displays its exact origin (USER_PROVIDED, REPORT_EXTRACTED, SYSTEM_DERIVED, or AI_GENERATED) and source document page number.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
            <div className="font-extrabold text-white">4. Human Review &amp; Audit Trail</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Clinicians and users can review and correct extracted observations before treating them as confirmed records, preserving complete audit history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
