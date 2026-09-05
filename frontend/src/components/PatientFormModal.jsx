import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Plus, Trash2, ShieldAlert } from 'lucide-react';
import ProvenanceBadge from './ProvenanceBadge';

export default function PatientFormModal({ patient, onClose, onSaved }) {
  const [name, setName] = useState(patient?.name || '');
  const [age, setAge] = useState(patient?.age || '');
  const [dob, setDob] = useState(patient?.date_of_birth || '');
  const [sex, setSex] = useState(patient?.sex || 'Female');
  const [symptoms, setSymptoms] = useState(patient?.symptoms || []);
  const [conditions, setConditions] = useState(patient?.existing_conditions || []);
  const [allergies, setAllergies] = useState(patient?.allergies || []);
  const [medications, setMedications] = useState(patient?.medications || []);
  const [notes, setNotes] = useState(patient?.notes || '');
  
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');
  const [currentAllergy, setCurrentAllergy] = useState('');
  const [currentMedication, setCurrentMedication] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = (item, setItem, list, setList) => {
    if (item.trim() && !list.includes(item.trim())) {
      setList([...list, item.trim()]);
      setItem('');
    }
  };

  const handleRemoveItem = (index, list, setList) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Patient full name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        age: age ? parseInt(age, 10) : null,
        date_of_birth: dob || null,
        sex,
        symptoms,
        existing_conditions: conditions,
        allergies,
        medications,
        notes: notes.trim() || null,
      };

      await onSaved(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save patient profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200 w-full max-w-2xl overflow-hidden animate-modal-in">
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-modal w-full max-w-2xl overflow-hidden animate-modal-in">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-sky-400" aria-hidden="true" />
              {patient ? 'Edit Patient Context' : 'Record New Patient Profile'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-slate-500">Record Origin:</span>
              <span className="text-[11px] text-slate-400">Record Origin:</span>
              <ProvenanceBadge provenance="USER_PROVIDED" size="sm" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Demographics */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1 font-mono">
              1. Patient Demographics
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sex</label>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other / Non-binary</option>
                  <option value="Unspecified">Unspecified</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                <label className="block text-xs font-bold text-slate-300 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                <label className="block text-xs font-bold text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Context & Medical History */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1 font-mono">
              2. Clinical Context &amp; History
            </div>

            {/* Reported Symptoms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Reported Symptoms
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentSymptom}
                  onChange={(e) => setCurrentSymptom(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(currentSymptom, setCurrentSymptom, symptoms, setSymptoms))}
                  placeholder="e.g. Fatigue, Increased Thirst (Press Enter)"
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem(currentSymptom, setCurrentSymptom, symptoms, setSymptoms)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {symptoms.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md text-xs font-semibold">
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md text-xs font-semibold">
                    {s}
                    <button type="button" onClick={() => handleRemoveItem(i, symptoms, setSymptoms)} className="hover:text-amber-950">
                    <button type="button" onClick={() => handleRemoveItem(i, symptoms, setSymptoms)} className="hover:text-amber-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Existing Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Existing Conditions
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentCondition}
                  onChange={(e) => setCurrentCondition(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(currentCondition, setCurrentCondition, conditions, setConditions))}
                  placeholder="e.g. Type 2 Diabetes, Hypertension (Press Enter)"
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddItem(currentCondition, setCurrentCondition, conditions, setConditions)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conditions.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-50 text-sky-900 border border-sky-200 rounded-md text-xs font-semibold">
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/30 rounded-md text-xs font-semibold">
                    {c}
                    <button type="button" onClick={() => handleRemoveItem(i, conditions, setConditions)} className="hover:text-sky-950">
                    <button type="button" onClick={() => handleRemoveItem(i, conditions, setConditions)} className="hover:text-sky-100">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Safety Profile (Allergies & Current Medications) */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1 flex items-center justify-between font-mono">
              <span>3. Safety Profile (Cross-Reference Checks)</span>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Known Allergies (e.g. Penicillin)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentAllergy}
                    onChange={(e) => setCurrentAllergy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(currentAllergy, setCurrentAllergy, allergies, setAllergies))}
                    placeholder="e.g. Penicillin..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem(currentAllergy, setCurrentAllergy, allergies, setAllergies)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-md text-xs font-bold">
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded-md text-xs font-bold">
                      {a}
                      <button type="button" onClick={() => handleRemoveItem(i, allergies, setAllergies)} className="hover:text-rose-950">
                      <button type="button" onClick={() => handleRemoveItem(i, allergies, setAllergies)} className="hover:text-rose-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Current Medications (e.g. Amoxicillin)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentMedication}
                    onChange={(e) => setCurrentMedication(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem(currentMedication, setCurrentMedication, medications, setMedications))}
                    placeholder="e.g. Metformin 500mg..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddItem(currentMedication, setCurrentMedication, medications, setMedications)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {medications.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-md text-xs font-semibold">
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-md text-xs font-semibold">
                      {m}
                      <button type="button" onClick={() => handleRemoveItem(i, medications, setMedications)} className="hover:text-purple-950">
                      <button type="button" onClick={() => handleRemoveItem(i, medications, setMedications)} className="hover:text-purple-100">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1 font-mono">
              4. Additional Intake Notes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Clinical notes entered during intake..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-lg focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Footer */}
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
              {isSubmitting ? 'Saving Profile...' : patient ? 'Update Patient' : 'Save Patient Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
