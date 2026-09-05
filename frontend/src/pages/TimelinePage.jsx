import React, { useState } from 'react';
import { Clock, Calendar, FileText, UserCheck, Sparkles, AlertTriangle, CheckCircle, Filter, Layers, Activity } from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import Timeline3D from '../components/3d/Timeline3D';

export default function TimelinePage({ timeline = [], patient }) {
  const [filterType, setFilterType] = useState('ALL');
  const [is3DMode, setIs3DMode] = useState(true);

  if (!patient) return null;

  const eventTypeIcons = {
    PROFILE_CREATED: UserCheck,
    REPORT_UPLOADED: FileText,
    LAB_RESULT: FileText,
    REVIEW_UPDATED: CheckCircle,
    AI_SUMMARY_GENERATED: Sparkles,
  };

  const filteredEvents = timeline.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.event_type === filterType;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            Patient Clinical Timeline: {patient.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit feed of user intake inputs, report uploads, human clinical reviews, and AI summaries
          </p>
        </div>

        {/* Filter and 3D Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition ${
              is3DMode
                ? 'bg-slate-900 text-sky-400 border-slate-800 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {is3DMode ? '3D Spatial Track' : '2D Feed'}
          </button>

          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-subtle"
          >
            <option value="ALL">All Event Types</option>
            <option value="PROFILE_CREATED">Patient Intake</option>
            <option value="REPORT_UPLOADED">Report Uploads</option>
            <option value="REVIEW_UPDATED">Human Reviews</option>
            <option value="AI_SUMMARY_GENERATED">AI Summaries</option>
          </select>
        </div>
      </div>

      {/* 3D Spatial Visualization */}
      {is3DMode && (
        <Timeline3D timeline={filteredEvents} patient={patient} />
      )}

      {/* Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-card">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No events match the selected timeline filter.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
            {filteredEvents.map((ev, index) => {
              const Icon = eventTypeIcons[ev.event_type] || Clock;
              return (
                <div key={ev.id || index} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[35px] top-1 w-5 h-5 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 shadow-xs group-hover:scale-110 transition">
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{ev.title}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                          {ev.event_type}
                        </span>
                      </div>
                      <ProvenanceBadge provenance={ev.provenance} size="sm" />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">{ev.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10.5px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Event Date: {ev.event_date || 'Date Not Stated'}
                      </span>
                      <span>Recorded: {new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
