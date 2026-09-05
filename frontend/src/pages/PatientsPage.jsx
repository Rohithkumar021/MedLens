import React, { useState } from 'react';
import { Users, UserPlus, Search, FileText, AlertTriangle, ChevronRight, Activity, Trash2, ShieldAlert } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';

export default function PatientsPage({
  patients,
  currentPatient,
  onSelectPatient,
  onNewPatient,
  onDeletePatient
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.existing_conditions?.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Patient Records &amp; Clinical Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
          <p className="text-xs text-slate-400 mt-0.5">
            Registered patient profiles with structured intake history and explicit origin tracking
          </p>
        </div>

        <button
          onClick={onNewPatient}
          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5 transition shrink-0"
          className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-glow-cyan inline-flex items-center gap-1.5 transition shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add Patient Record
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by patient name, diagnosed condition, or symptom..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-subtle"
          className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-subtle backdrop-blur-md"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs shadow-card">
          <div className="col-span-full bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-12 text-center text-slate-500 text-xs shadow-elevation">
            No patient records match your search criteria.
          </div>
        ) : (
          filtered.map((p) => {
            const isSelected = p.id === currentPatient?.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPatient(p.id)}
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-card ${
                className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between shadow-elevation backdrop-blur-md ${
                  isSelected
                    ? 'bg-sky-50/70 border-brand-500 ring-2 ring-brand-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                    ? 'bg-slate-900/90 border-sky-500 shadow-glow-cyan ring-1 ring-sky-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                      <h3 className="font-extrabold text-white text-base">{p.name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        {p.sex || 'Unspecified'}, {p.age ? `${p.age} years old` : 'Age N/A'}
                      </div>
                    </div>
                    <ProvenanceBadge provenance="USER_PROVIDED" size="sm" />
                  </div>

                  {/* Conditions & Allergies Tags */}
                  <div className="mt-3 space-y-1.5">
                    {p.existing_conditions && p.existing_conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.existing_conditions.map((c, i) => (
                          <span key={i} className="text-[10.5px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-semibold border border-sky-200">
                          <span key={i} className="text-[10.5px] bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded-md font-semibold border border-sky-500/30">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.allergies && p.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.allergies.map((a, i) => (
                          <span key={i} className="text-[10.5px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-200 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-600" /> Allergy: {a}
                          <span key={i} className="text-[10.5px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded-md font-bold border border-rose-500/30 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3 text-rose-400" /> Allergy: {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer with counts */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-150 flex items-center justify-between text-xs text-slate-500">
                <div className="pt-3.5 mt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> {p.reports_count || 0} Reports
                      <FileText className="w-3.5 h-3.5 text-sky-400" /> {p.reports_count || 0} Reports
                    </span>
                    {p.conflicts_count > 0 && (
                      <span className="flex items-center gap-1 text-rose-700 font-bold">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> {p.conflicts_count} Inconsistencies
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete patient record for ${p.name}?`)) {
                        onDeletePatient(p.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition"
                    title="Delete Patient Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
