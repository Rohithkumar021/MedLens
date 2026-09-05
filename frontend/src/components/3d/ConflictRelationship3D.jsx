import React, { useRef, useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ShieldCheck, User, Pill, Activity, Link2, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ConflictRelationship3D({ conflicts = [], patient, onResolveConflict }) {
  const canvasRef = useRef(null);
  const [selectedConflict, setSelectedConflict] = useState(conflicts[0] || null);

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

      // Deep dark clinical slate
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw Allergy Entity (Left)
      const leftX = centerX - 120;
      const rightX = centerX + 120;
      const nodeY = centerY;

      // Draw pulsating warning link
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.moveTo(leftX, nodeY);
      ctx.lineTo(rightX, nodeY);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Energy wave in the middle
      const waveOffset = (Math.sin(t * 3) * 12);
      ctx.beginPath();
      ctx.arc(centerX, centerY + waveOffset, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warning text in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CONFLICT', centerX, centerY + waveOffset);
      ctx.restore();

      // Node Left: Allergy Record
      ctx.save();
      ctx.beginPath();
      ctx.arc(leftX, nodeY, 26, 0, Math.PI * 2);
      const g1 = ctx.createRadialGradient(leftX, nodeY, 5, leftX, nodeY, 26);
      g1.addColorStop(0, '#fda4af');
      g1.addColorStop(0.5, '#f43f5e');
      g1.addColorStop(1, '#881337');
      ctx.fillStyle = g1;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Allergy: Penicillin', leftX, nodeY + 42);
      ctx.restore();

      // Node Right: Prescribed Medication
      ctx.save();
      ctx.beginPath();
      ctx.arc(rightX, nodeY, 26, 0, Math.PI * 2);
      const g2 = ctx.createRadialGradient(rightX, nodeY, 5, rightX, nodeY, 26);
      g2.addColorStop(0, '#c084fc');
      g2.addColorStop(0.5, '#a855f7');
      g2.addColorStop(1, '#581c87');
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Rx: Amoxicillin', rightX, nodeY + 42);
      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-elevation">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-3 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-xs font-bold text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" /> 3D Inconsistency Topology
        </div>
      </div>
    </div>
  );
}

