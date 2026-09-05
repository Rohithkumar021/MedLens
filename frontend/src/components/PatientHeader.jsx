import React from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Edit3,
  FileText,
  AlertTriangle,
  CheckSquare,
  LayoutDashboard,
  Upload,
  ShieldAlert,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Pill,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';

export default function PatientHeader({
  patient,
  reports = [],
  observations = [],
  conflicts = [],
  unreviewedCount = 0,
  currentTab = 'dashboard',
  setTab = () => {},
  onOpenPatientEdit = () => {},
  onOpenUpload = () => {}
}) {
  if (!patient) return null;

  // Extract initials
  const initials = patient.name
    ? patient.name
        .replace(/\(.*?\)/g, '')
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'PT';

  // Format clean display name (e.g., "Sarah Jenkins")
  const displayName = patient.name.replace(/\(Synthetic Demo\)/gi, '').trim() || patient.name;
  const isSyntheticDemo = patient.name.toLowerCase().includes('demo') || patient.is_demo || patient.id?.startsWith('demo') || true;

  // Demographics formatting
  const dobFormatted = patient.date_of_birth || (patient.age ? '12 Apr 1984' : '12 Apr 1984');
  const patientIdDisplay = patient.mrn || 'DEMO-001';

  // Data Completeness Calculation
  let completenessScore = 0;
  if (patient.name && (patient.age || patient.date_of_birth) && patient.sex) completenessScore += 30;
  if (patient.symptoms?.length > 0 || patient.existing_conditions?.length > 0) completenessScore += 25;
  if (patient.allergies?.length > 0 || patient.medications?.length > 0) completenessScore += 25;
  if (reports.length > 0) completenessScore += 20;
  if (completenessScore === 0) completenessScore = 100; // default for demo

  // Data lists
  const conditionsList = patient.existing_conditions && patient.existing_conditions.length > 0
    ? patient.existing_conditions
    : ['Type 2 Diabetes Mellitus'];

  const medicationsList = patient.medications && patient.medications.length > 0
    ? patient.medications
    : ['Amoxicillin 500mg PO BID', 'Metformin 1000mg PO Daily', 'Lisinopril 10mg PO Daily'];

  const allergiesList = patient.allergies && patient.allergies.length > 0
    ? patient.allergies
    : ['Penicillin'];

  // Check for potential allergy-medication clash in clinical record
  const hasPenicillinClash = allergiesList.some(a => a.toLowerCase().includes('penicillin')) &&
    medicationsList.some(m => m.toLowerCase().includes('amoxicillin') || m.toLowerCase().includes('penicillin'));

  const navTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: FileText, count: reports.length },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'conflicts', label: 'Inconsistencies', icon: AlertTriangle, count: conflicts.length, alert: conflicts.length > 0 },
    { id: 'review', label: 'Review', icon: CheckSquare, count: unreviewedCount, alert: unreviewedCount > 0 },
  ];

  return (
    <div className="space-y-4">
      {/* 1. PERSISTENT PATIENT IDENTITY HEADER */}
      <Card className="border-slate-200 shadow-xs bg-white overflow-hidden">
        <CardContent className="p-5 sm:p-6 space-y-5">
          {/* Top Row: Patient ID, Badges, Completeness & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            {/* Identity Info */}
            <div className="flex items-start sm:items-center gap-3.5">
              <Avatar className="w-12 h-12 bg-sky-100 text-sky-800 text-sm font-bold border border-sky-200 shrink-0">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                    {displayName}
                  </h1>

                  {isSyntheticDemo && (
                    <Badge variant="clinical" className="text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border-emerald-200">
                      SYNTHETIC DEMO
                    </Badge>
                  )}

                  <ProvenanceBadge provenance={patient.source || 'USER_PROVIDED'} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>DOB: <strong className="text-slate-800 font-mono">{dobFormatted}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Patient ID: <strong className="text-slate-800 font-mono">{patientIdDisplay}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>{patient.sex || 'Female'} {patient.age ? `(${patient.age} yrs)` : ''}</span>
                </div>
              </div>
            </div>

            {/* Right: Record Completeness & Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              {/* Record Completeness Indicator */}
              <div className="bg-slate-50/90 border border-slate-200 px-3 py-2 rounded-xl text-xs space-y-1 w-44 shadow-2xs">
                <div className="flex items-center justify-between font-semibold text-[11px] text-slate-600">
                  <span>Record Completeness</span>
                  <span className="text-sky-700 font-mono font-bold">{completenessScore}%</span>
                </div>
                <Progress value={completenessScore} className="h-1.5" />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenPatientEdit}
                  className="text-xs font-semibold text-slate-700 h-8"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" /> Edit Context
                </Button>
                <Button
                  variant="clinical"
                  size="sm"
                  onClick={onOpenUpload}
                  className="text-xs font-semibold h-8 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload Report
                </Button>
              </div>
            </div>
          </div>

          {/* 2. GROUPED PATIENT CONTEXT (Conditions, Medications, Allergies) */}
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2.5">
              Patient Context
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Column A: Conditions */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
                    <span>Conditions</span>
                  </div>
                  <Badge variant="clinical" className="text-[10px] font-semibold">
                    {conditionsList.length} Active
                  </Badge>
                </div>

                <ul className="space-y-1 pt-1 text-xs text-slate-700">
                  {conditionsList.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-medium leading-tight">
                      <span className="text-sky-500 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                  {patient.symptoms && patient.symptoms.length > 0 && (
                    <li className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      Symptoms: {patient.symptoms.join(', ')}
                    </li>
                  )}
                </ul>
              </div>

              {/* Column B: Medications (Grouped List of Individual Items) */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Pill className="w-3.5 h-3.5 text-purple-600" />
                    <span>Medications</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold text-purple-800 bg-purple-50 border-purple-200">
                    {medicationsList.length} Active
                  </Badge>
                </div>

                <ul className="space-y-1.5 pt-1 text-xs text-slate-700">
                  {medicationsList.map((med, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 font-medium leading-tight text-slate-800">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column C: Allergies & Neutral Safety Conflict Flag */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Allergies</span>
                    </div>
                    <Badge variant="destructive" className="text-[10px] font-semibold">
                      {allergiesList.length} Documented
                    </Badge>
                  </div>

                  <ul className="space-y-1.5 pt-1 text-xs text-slate-700">
                    {allergiesList.map((alg, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 font-medium text-slate-800">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{alg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Neutral Clinical Safety Flag (Non-diagnostic, clinician review reminder) */}
                {hasPenicillinClash && (
                  <div className="mt-2 p-2 bg-amber-50/90 border border-amber-200/80 rounded-lg text-[11px] text-amber-800 space-y-0.5">
                    <div className="font-bold flex items-center gap-1 text-amber-900">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Potential medication–allergy conflict detected</span>
                    </div>
                    <p className="text-slate-600 text-[10px]">
                      Human review required
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. PATIENT-SPECIFIC SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 overflow-x-auto">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <Badge
                  variant={tab.alert ? 'destructive' : 'clinical'}
                  className="text-[9.5px] px-1 py-0 h-4 min-w-4 flex items-center justify-center font-mono font-bold"
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

