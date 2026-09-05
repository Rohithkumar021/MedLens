import React, { useState } from 'react';
import { X, UploadCloud, FileText, AlertCircle, CheckCircle2, Download, Cpu, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function UploadReportModal({ patientId, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('LABORATORY');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selected) => {
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'json'].includes(ext)) {
      setError('Please select a valid PDF, TXT, or JSON medical report.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setError('');
    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadStep('Extracting digital text from document...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim() || file.name);
      formData.append('report_type', reportType);

      // Multi-step UI transition
      setTimeout(() => setUploadStep('Evaluating reference intervals & flags deterministically...'), 400);

      const result = await api.uploadReport(patientId, formData);
      setUploadStep('Structuring clinical observations complete.');
      onUploaded(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to extract and structure report.');
    } finally {
      setIsUploading(false);
      setUploadStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200 w-full max-w-lg overflow-hidden animate-modal-in">
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-modal w-full max-w-lg overflow-hidden animate-modal-in">
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-brand-600" aria-hidden="true" />
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-sky-400" aria-hidden="true" />
              Upload Medical Report
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
            <p className="text-xs text-slate-400 mt-0.5">
              Digital PDF extraction, deterministic reference-range parsing &amp; provenance logging
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close upload modal"
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

          {/* Processing Steps Indicator */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500 pb-1">
            <div className={`p-1.5 rounded border ${file ? 'bg-sky-50 text-brand-800 border-sky-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400 pb-1 font-mono">
            <div className={`p-1.5 rounded border ${file ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : 'bg-slate-950 border-slate-800'}`}>
              1. Validate File
            </div>
            <div className={`p-1.5 rounded border ${isUploading ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`p-1.5 rounded border ${isUploading ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-950 border-slate-800'}`}>
              2. Extract &amp; Parse
            </div>
            <div className="p-1.5 rounded border bg-slate-50 border-slate-200">
            <div className="p-1.5 rounded border bg-slate-950 border-slate-800">
              3. Ready for Review
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
              dragActive
                ? 'border-brand-500 bg-brand-50/60'
                ? 'border-sky-500 bg-sky-500/10 shadow-glow-cyan'
                : file
                ? 'border-emerald-400 bg-emerald-50/40'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                ? 'border-emerald-500/80 bg-emerald-500/10 shadow-glow-emerald'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt,.json"
              onChange={(e) => e.target.files && selectFile(e.target.files[0])}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <div className="font-extrabold text-slate-900 text-xs">{file.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div className="font-extrabold text-white text-xs">{file.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {(file.size / 1024).toFixed(1)} KB — Ready for text extraction
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold underline mt-1"
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold underline mt-1"
                >
                  Choose another file
                </button>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="p-2.5 bg-white rounded-full shadow-subtle border border-slate-200">
                  <UploadCloud className="w-5 h-5 text-brand-600" />
                <div className="p-2.5 bg-slate-900 rounded-full shadow-subtle border border-slate-800 text-sky-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-600 hover:underline">
                  <span className="text-xs font-bold text-sky-400 hover:underline">
                    Click to select file
                  </span>
                  <span className="text-xs text-slate-600"> or drag and drop PDF</span>
                  <span className="text-xs text-slate-400"> or drag and drop PDF</span>
                </div>
                <p className="text-[11px] text-slate-400">Supported formats: PDF, TXT, JSON (Max 10MB)</p>
                <p className="text-[11px] text-slate-500 font-mono">Supported formats: PDF, TXT, JSON (Max 10MB)</p>
              </label>
            )}
          </div>

          {/* Quick Demo Report Download */}
          <div className="p-3 bg-sky-50 border border-sky-200/90 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-sky-950 text-xs">Need a synthetic lab report to test?</span>
              <p className="text-sky-800 text-[11px]">Download synthetic PDF with normal, high, and missing range values.</p>
              <span className="font-bold text-slate-200 text-xs">Need a synthetic lab report to test?</span>
              <p className="text-slate-400 text-[11px]">Download synthetic PDF with normal, high, and missing range values.</p>
            </div>
            <a
              href={api.getSyntheticPdfUrl()}
              download="Apex_Synthetic_Lab_Report.pdf"
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-subtle shrink-0 transition"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-subtle shrink-0 transition"
            >
              <Download className="w-3.5 h-3.5" /> Sample PDF
              <Download className="w-3.5 h-3.5 text-sky-400" /> Sample PDF
            </a>
          </div>

          {/* Report Metadata */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apex Diagnostics - Metabolic Panel"
                className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Clinical Category
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-950 border border-slate-700 text-white rounded-lg focus:border-sky-500 focus:outline-none"
              >
                <option value="LABORATORY">Laboratory / Biomarker Panel</option>
                <option value="PATHOLOGY">Pathology Report</option>
                <option value="RADIOLOGY">Radiology Summary</option>
                <option value="DISCHARGE">Discharge Summary</option>
                <option value="OTHER">Other Clinical Document</option>
              </select>
            </div>
          </div>

          {/* Upload Progress Status */}
          {isUploading && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-2 text-slate-700">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center gap-2 text-slate-300 font-mono">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <span>{uploadStep}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 rounded-lg shadow-glow-cyan transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                'Extract & Structure Observations'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
