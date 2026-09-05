import React, { useState } from 'react';
import { X, CheckCircle, Edit3, XCircle, AlertCircle, History, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProvenanceBadge from './ProvenanceBadge';

export default function ReviewModal({ observation, onClose, onReviewed }) {
  const [action, setAction] = useState('CONFIRM');
  const [correctedValue, setCorrectedValue] = useState(observation.corrected_value || observation.value_text);
  const [correctedStatus, setCorrectedStatus] = useState(observation.corrected_status || observation.status);
  const [notes, setNotes] = useState(observation.reviewer_notes || '');
  const [reviewer, setReviewer] = useState('Dr. Reviewer, MD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!observation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await onReviewed(observation.id, {
        action,
        corrected_value: action === 'EDIT' ? correctedValue : observation.value_text,
        corrected_status: action === 'EDIT' ? correctedStatus : observation.status,
        notes,
        reviewer
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit human review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200 w-full max-w-xl overflow-hidden animate-modal-in">
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-modal w-full max-w-xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-sky-400" aria-hidden="true" />
              Human Clinical Verification &amp; Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
            <p className="text-xs text-slate-400 mt-0.5">
              Verify, edit, or reject extracted observation before confirming into patient record
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Original Extraction Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Source Observation</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Source Observation</span>
              <ProvenanceBadge provenance={observation.provenance} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Test Name</label>
                <div className="font-extrabold text-slate-900 text-base">{observation.test_name}</div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Test Name</label>
                <div className="font-extrabold text-white text-base">{observation.test_name}</div>
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Reported Value</label>
                <div className="font-mono font-extrabold text-slate-900 text-base">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Reported Value</label>
                <div className="font-mono font-extrabold text-sky-300 text-base">
                  {observation.value_text} {observation.unit || ''}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Source Reference Range</label>
                <div className="text-xs font-mono text-slate-700 font-semibold">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Source Reference Range</label>
                <div className="text-xs font-mono text-slate-300 font-semibold">
                  {observation.original_reference_range || 'Reference range not provided in source report'}
                </div>
              </div>
              <div>
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">System-Derived Status</label>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">System-Derived Status</label>
                <div>
                  <StatusBadge status={observation.status} size="sm" />
                </div>
              </div>
            </div>

            {observation.original_text && (
              <div className="pt-2 border-t border-slate-200/80">
                <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                  <FileText className="w-3 h-3 text-slate-500" />
                  Exact Source Line (Page {observation.source_page || 1})
                </label>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 truncate mt-1">
                <div className="text-[11px] font-mono bg-slate-900/90 p-2 rounded border border-slate-800 text-slate-300 truncate mt-1">
                  {observation.original_text}
                </div>
              </div>
            )}
          </div>

          {/* Action Choice */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono">
              Reviewer Action
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAction('CONFIRM')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                  action === 'CONFIRM'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow-emerald'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CheckCircle className={`w-4 h-4 mb-1 ${action === 'CONFIRM' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <CheckCircle className={`w-4 h-4 mb-1 ${action === 'CONFIRM' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>Confirm Fact</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('EDIT')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                  action === 'EDIT'
                    ? 'bg-sky-50 border-brand-600 text-brand-900 ring-2 ring-brand-600/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-glow-cyan'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Edit3 className={`w-4 h-4 mb-1 ${action === 'EDIT' ? 'text-brand-600' : 'text-slate-400'}`} />
                <Edit3 className={`w-4 h-4 mb-1 ${action === 'EDIT' ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>Edit / Correct</span>
              </button>

              <button
                type="button"
                onClick={() => setAction('REJECT')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition ${
                  action === 'REJECT'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-glow-rose'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <XCircle className={`w-4 h-4 mb-1 ${action === 'REJECT' ? 'text-rose-600' : 'text-slate-400'}`} />
                <XCircle className={`w-4 h-4 mb-1 ${action === 'REJECT' ? 'text-rose-400' : 'text-slate-500'}`} />
                <span>Reject / Ignore</span>
              </button>
            </div>
          </div>

          {/* Edit Fields (if EDIT selected) */}
          {action === 'EDIT' && (
            <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3 animate-modal-in">
            <div className="p-4 bg-sky-500/10 rounded-xl border border-sky-500/30 space-y-3 animate-modal-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Corrected Value
                  </label>
                  <input
                    type="text"
                    value={correctedValue}
                    onChange={(e) => setCorrectedValue(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-700 rounded-lg focus:border-sky-500 focus:outline-none bg-slate-950 text-white"
                    placeholder="e.g. 13.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Corrected Status
                  </label>
                  <select
                    value={correctedStatus}
                    onChange={(e) => setCorrectedStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                    className="w-full px-3 py-1.5 text-xs font-bold border border-slate-700 rounded-lg focus:border-sky-500 focus:outline-none bg-slate-950 text-white"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                    <option value="HIGH">HIGH</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                    <option value="NOT_AVAILABLE">NOT AVAILABLE</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Reviewer details & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reviewer Justification / Clinical Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Document clinical verification reasoning..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reviewer Signature / Identification
              </label>
              <input
                type="text"
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Audit History */}
          {observation.review_records && observation.review_records.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
                <History className="w-3.5 h-3.5" />
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2 font-mono">
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>Audit Trail ({observation.review_records.length})</span>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {observation.review_records.map((r, i) => (
                  <div key={i} className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200 text-slate-600">
                    <span className="font-semibold text-slate-800">{r.action}</span> by {r.reviewer} — Value: "{r.corrected_value}" ({r.corrected_status})
                  <div key={i} className="text-[11px] bg-slate-950 p-2 rounded border border-slate-800 text-slate-400">
                    <span className="font-semibold text-slate-200">{r.action}</span> by {r.reviewer} — Value: "{r.corrected_value}" ({r.corrected_status})
                    {r.notes && <div className="text-slate-500 italic mt-0.5">Note: {r.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg shadow-glow-cyan transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Review...' : 'Save & Record Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
