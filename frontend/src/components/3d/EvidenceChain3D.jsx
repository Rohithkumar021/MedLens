import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Link2, CheckCircle2, FileText, Activity, Shield, Cpu, Sparkles, UserCheck, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import ProvenanceBadge from '../ProvenanceBadge';
import ConfidenceBadge from '../ConfidenceBadge';

export default function EvidenceChain3D({ observation, report, onOpenReview }) {
  const canvasRef = useRef(null);
  const [activeStage, setActiveStage] = useState(1);
  const [hoveredStage, setHoveredStage] = useState(null);

  const stages = useMemo(() => [
    {
      id: 1,
      title: '1. Clinical Observation & Reported Value',
      tag: 'Observation',
      icon: Activity,
      color: '#38bdf8',
      desc: 'Standardized observation extracted from source record with clinical measurement and unit.',
      content: (
        <div className="space-y-1">
          <div className="text-white font-extrabold text-sm">{observation.test_name}</div>
          <div className="font-mono text-base font-bold text-sky-400">
            {observation.corrected_value || observation.value_text} <span className="text-xs text-slate-400">{observation.unit || ''}</span>
          </div>
          {observation.corrected_value && (
            <div className="text-[10.5px] text-amber-300 italic">
              Original raw value: {observation.value_text} (Clinician corrected)
            </div>
          )}
        </div>
      )
    },
    {
      id: 2,
      title: '2. Source Document & Report Metadata',
      tag: 'Document',
      icon: FileText,
      color: '#0284c7',
      desc: 'Originating report document, diagnostic laboratory, and collection date.',
      content: (
        <div className="space-y-1 text-xs text-slate-300">
          <div className="text-white font-bold">{report?.title || 'Laboratory Report'}</div>
          <div className="font-mono text-[11px] text-slate-400">File: {report?.original_file_name || 'Apex_Lab_Report.pdf'}</div>
          <div>Lab: {report?.laboratory_name || 'Apex Health Diagnostics'}</div>
          <div>Collection Date: {observation.observation_date || report?.report_date || '2026-08-15'}</div>
        </div>
      )
    },
    {
      id: 3,
      title: '3. Exact Document Location / Verbatim Source Text',
      tag: 'Location',
      icon: Link2,
      color: '#6366f1',
      desc: 'Specific page number and verbatim digital extraction text from source document.',
      content: (
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-sky-300 bg-slate-800 px-2 py-0.5 rounded w-fit">
            Source Page: {observation.source_page || 1}
          </div>
          <div className="p-2 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 select-text">
            {observation.original_text || `${observation.test_name} | ${observation.value_text} | ${observation.unit || ''} | ${observation.original_reference_range || ''}`}
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: '4. Reference Range Supplied by Source',
      tag: 'Interval',
      icon: Shield,
      color: '#06b6d4',
      desc: 'Strict reference interval stated by source document. No invented standard ranges.',
      content: (
        <div className="space-y-1">
          <div className="font-mono text-xs font-bold text-white bg-slate-800/80 p-2 rounded-lg border border-slate-700">
            {observation.original_reference_range ? (
              <span className="text-sky-300">{observation.original_reference_range} {observation.unit || ''}</span>
            ) : (
              <span className="text-slate-400 italic">Reference range not provided in source report (Evaluates to NOT_AVAILABLE)</span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: '5. Deterministic Evaluation & Reasoning',
      tag: 'Logic',
      icon: Cpu,
      color: '#10b981',
      desc: 'Mathematical evaluation of observation status with step-by-step logic.',
      content: (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Computed Status:</span>
            <StatusBadge status={observation.corrected_status || observation.status} size="sm" />
          </div>
          <div className="p-2 bg-slate-800/80 rounded-lg text-xs text-slate-300 leading-relaxed border border-slate-700">
            <span className="font-bold text-white">Reasoning: </span>
            {observation.status_reason}
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: '6. Information Provenance',
      tag: 'Provenance',
      icon: Sparkles,
      color: '#8b5cf6',
      desc: 'Auditable lineage classification establishing where this clinical information originated.',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ProvenanceBadge provenance={observation.provenance} size="sm" />
          </div>
          <p className="text-xs text-slate-300">
            {observation.provenance === 'REPORT_EXTRACTED' && 'Direct digital extraction from submitted clinical report document.'}
            {observation.provenance === 'USER_PROVIDED' && 'Direct clinical entry provided during patient intake.'}
            {observation.provenance === 'SYSTEM_DERIVED' && 'Deterministically computed by MedLens clinical logic rules.'}
            {observation.provenance === 'AI_GENERATED' && 'Synthesized by AI summarization engine with strict grounding.'}
          </p>
        </div>
      )
    },
    {
      id: 7,
      title: '7. Extraction Confidence',
      tag: 'Fidelity',
      icon: Shield,
      color: '#ec4899',
      desc: 'Algorithmic digital parsing certainty metric. Never represents medical certainty.',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={observation.confidence} size="sm" />
          </div>
          <p className="text-xs text-slate-300">
            {observation.confidence >= 0.95
              ? 'High-certainty digital PDF text match with tabular structure alignment.'
              : observation.confidence >= 0.8
              ? 'Standard digital extraction with validated units and values.'
              : 'Low-confidence extraction flagged for mandatory clinician review.'}
          </p>
        </div>
      )
    },
    {
      id: 8,
      title: '8. Human Review & Audit State',
      tag: 'Audit',
      icon: UserCheck,
      color: '#f59e0b',
      desc: 'Clinician verification status, reviewer justification, and immutable historical audit trail.',
      content: (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Review State:</span>
            <span className={`text-[10.5px] uppercase font-bold px-2 py-0.5 rounded ${
              observation.is_reviewed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {observation.review_status || 'UNREVIEWED'}
            </span>
          </div>
          {observation.reviewer_notes && (
            <div className="p-2 bg-slate-800 rounded-lg text-xs text-slate-300 border border-slate-700">
              <span className="font-bold text-white">Reviewer Note: </span> {observation.reviewer_notes}
            </div>
          )}
        </div>
      )
    }
  ], [observation, report]);

  // Spatial Path Rendering in Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let t = 0;

    const render = () => {
      t += 0.02;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep dark background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Node spatial positions (serpentine 3D path)
      const stageCoords = stages.map((s, i) => {
        const progress = i / (stages.length - 1);
        const x = 50 + progress * (width - 100);
        const y = height / 2 + Math.sin(progress * Math.PI * 2 + Math.PI / 4) * (height * 0.22);
        return { x, y, stage: s };
      });

      // Draw Serpentine Path
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(stageCoords[0].x, stageCoords[0].y);
      for (let i = 0; i < stageCoords.length - 1; i++) {
        const xc = (stageCoords[i].x + stageCoords[i + 1].x) / 2;
        const yc = (stageCoords[i].y + stageCoords[i + 1].y) / 2;
        ctx.quadraticCurveTo(stageCoords[i].x, stageCoords[i].y, xc, yc);
      }
      ctx.lineTo(stageCoords[stageCoords.length - 1].x, stageCoords[stageCoords.length - 1].y);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Flowing Energy Pulse on path
      const pulseIndex = (t * 0.5) % stages.length;
      const curIdx = Math.floor(pulseIndex);
      const nextIdx = (curIdx + 1) % stages.length;
      const subT = pulseIndex - curIdx;
      const p1 = stageCoords[curIdx];
      const p2 = stageCoords[nextIdx];
      if (p1 && p2) {
        const pulseX = p1.x + (p2.x - p1.x) * subT;
        const pulseY = p1.y + (p2.y - p1.y) * subT;
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Draw Stage Nodes
      stageCoords.forEach(({ x, y, stage }) => {
        const isActive = activeStage === stage.id;
        const isHovered = hoveredStage === stage.id;
        const radius = isActive ? 16 : (isHovered ? 14 : 11);

        // Glow
        if (isActive || isHovered) {
          const glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 2.2);
          glow.addColorStop(0, stage.color);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node Circle
        ctx.fillStyle = isActive ? '#ffffff' : stage.color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Stage Number
        ctx.fillStyle = isActive ? '#0f172a' : '#ffffff';
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stage.id.toString(), x, y);

        // Tag label below
        ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
        ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
        ctx.fillText(stage.tag, x, y + radius + 12);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stages, activeStage, hoveredStage]);

  // Click on canvas to jump stage
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const segmentWidth = rect.width / stages.length;
    const clickedIdx = Math.min(stages.length, Math.max(1, Math.floor(mouseX / segmentWidth) + 1));
    setActiveStage(clickedIdx);
  };

  const currentStageObj = stages[activeStage - 1];

  return (
    <div className="space-y-4">
      {/* 3D Spatial Path Canvas */}
      <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer select-none"
          title="Click any stage along the 8-Stage Traceable Evidence Chain"
        />

        {/* Floating Quick Stepper */}
        <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-slate-400 pointer-events-none">
          <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-sky-400">
            STAGE {activeStage} OF 8: {currentStageObj.tag.toUpperCase()}
          </span>
          <span className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
            Click stage points to scrub path
          </span>
        </div>
      </div>

      {/* Active Stage Deep Inspection Card */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-elevation space-y-4 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ backgroundColor: currentStageObj.color }}
            >
              {currentStageObj.id}
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">{currentStageObj.title}</h4>
              <p className="text-xs text-slate-400">{currentStageObj.desc}</p>
            </div>
          </div>

          {/* Previous / Next Stepper Controls */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setActiveStage((p) => Math.max(1, p - 1))}
              disabled={activeStage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
              aria-label="Previous Stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs font-bold text-slate-400 px-2">
              {activeStage} / 8
            </span>
            <button
              onClick={() => setActiveStage((p) => Math.min(8, p + 1))}
              disabled={activeStage === 8}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
              aria-label="Next Stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Content Payload */}
        <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
          {currentStageObj.content}
        </div>
      </div>
    </div>
  );
}

