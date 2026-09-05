import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import ConflictRelationship3D from '../components/3d/ConflictRelationship3D';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

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
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Clinical Inconsistencies &amp; Safety Warnings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
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
          <Card className="my-8 max-w-md mx-auto text-center p-8">
            <CardContent className="space-y-3 pt-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">No Active Inconsistencies</h3>
                <p className="text-xs text-slate-500 mt-1">
                  No allergy-medication clashes or unusual biomarker variances detected for {patient.name}.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          conflicts.map((c) => (
            <Card
              key={c.id}
              className="border-amber-200/80 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-amber-300"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-100 text-amber-800 rounded-md">
                    <ShieldAlert className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                  <Badge variant="warning" className="text-[10px] uppercase font-mono font-bold">
                    {c.severity} Severity
                  </Badge>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">{c.description}</p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-600 pt-1">
                  {c.entity_a && (
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      Entity A: <b className="text-slate-900">{c.entity_a}</b>
                    </span>
                  )}
                  {c.entity_b && (
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      Entity B: <b className="text-slate-900">{c.entity_b}</b>
                    </span>
                  )}
                  <ProvenanceBadge provenance={c.provenance} size="sm" />
                </div>
              </div>

              {/* Action Resolution Form */}
              <div className="shrink-0 flex flex-col items-end gap-2">
                {resolvingId === c.id ? (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 w-full sm:w-72 animate-in fade-in zoom-in-95 duration-150 shadow-2xs">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Clinical justification..."
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResolvingId(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="clinical"
                        size="sm"
                        onClick={() => handleResolve(c.id, 'RESOLVED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResolvingId(c.id)}
                    className="text-xs font-semibold shadow-2xs"
                  >
                    Acknowledge &amp; Resolve
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
