import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConflictRelationship3D from '../components/3d/ConflictRelationship3D';

export default function ConflictsPage({ conflicts = [], patient, onResolveConflict }) {
  const [resolvingId, setResolvingId] = useState(null);
  const [notes, setNotes] = useState('');

  if (!patient) return null;

  const handleResolve = async (conflictId, status) => {
    await onResolveConflict(conflictId, {
      status,
      resolution_notes: notes.trim() || `Acknowledged and resolved by clinician.`
    });
    setResolvingId(null);
    setNotes('');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Clinical Inconsistencies &amp; Safety Warnings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
        <p className="text-xs text-slate-400 mt-0.5">
          Automated cross-referencing between patient allergies, prescribed medications, and longitudinal biomarker variance
        </p>
      </div>

      {/* 3D Conflict Topology */}
      {conflicts.length > 0 && (
        <ConflictRelationship3D
          conflicts={conflicts}
          patient={patient}
          onResolveConflict={onResolveConflict}
        />
      )}

      {/* Conflicts List */}
      <div className="space-y-3.5">
        {conflicts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 max-w-md mx-auto space-y-3 shadow-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-12 text-center text-slate-400 max-w-md mx-auto space-y-3 shadow-elevation">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">No Active Inconsistencies</h3>
              <h3 className="text-sm font-extrabold text-white">No Active Inconsistencies</h3>
              <p className="text-xs text-slate-400 mt-1">
                No allergy-medication clashes or unusual biomarker variances detected for {patient.name}.
              </p>
            </div>
          </div>
        ) : (
          conflicts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-amber-500/30 p-5 shadow-elevation flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-100 text-amber-800 rounded">
                  <span className="p-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm">{c.title}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  <h3 className="font-extrabold text-white text-sm">{c.title}</h3>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                    {c.severity} Severity
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">{c.description}</p>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{c.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600 pt-1">
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                  {c.entity_a && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Entity A: <b className="text-slate-900">{c.entity_a}</b>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Entity A: <b className="text-sky-300">{c.entity_a}</b>
                    </span>
                  )}
                  {c.entity_b && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Entity B: <b className="text-slate-900">{c.entity_b}</b>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Entity B: <b className="text-sky-300">{c.entity_b}</b>
                    </span>
                  )}
                  <ProvenanceBadge provenance={c.provenance} size="sm" />
                </div>
              </div>

              {/* Action Resolution Form */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                {resolvingId === c.id ? (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 w-full sm:w-72 animate-modal-in">
                  <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 w-full sm:w-72 animate-modal-in shadow-elevation">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Clinical justification..."
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      className="w-full px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-sky-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setResolvingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        className="px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleResolve(c.id, 'RESOLVED')}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-glow-emerald"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setResolvingId(c.id)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition shadow-subtle"
                      className="px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition"
                    >
                      Acknowledge &amp; Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
