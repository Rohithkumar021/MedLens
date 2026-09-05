import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Clock, Calendar, FileText, Sparkles, UserCheck, AlertTriangle, Activity, ArrowRight, RotateCcw } from 'lucide-react';
import ProvenanceBadge from '../ProvenanceBadge';

export default function Timeline3D({ timeline = [], patient }) {
  const canvasRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(timeline[0] || null);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const cameraRef = useRef({
    rotX: 0.25,
    rotY: -0.2,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // Calculate 3D coordinates along a chronological path
  const eventNodes = useMemo(() => {
    return timeline.map((ev, i) => {
      const t = i / Math.max(1, timeline.length - 1);
      // Helical curve through 3D space: x spreads horizontally, y ripples, z oscillates
      const x = (i - (timeline.length - 1) / 2) * 110;
      const y = Math.sin(i * 0.8) * 35;
      const z = Math.cos(i * 0.8) * 55;

      let color = '#38bdf8';
      if (ev.event_type === 'PROFILE_CREATED') color = '#0284c7';
      else if (ev.event_type === 'REPORT_UPLOADED') color = '#6366f1';
      else if (ev.event_type === 'REVIEW_UPDATED') color = '#10b981';
      else if (ev.event_type === 'AI_SUMMARY_GENERATED') color = '#a855f7';
      else if (ev.event_type === 'CONFLICT_DETECTED') color = '#f43f5e';

      return {
        ...ev,
        index: i,
        x,
        y,
        z,
        color,
        radius: 14
      };
    });
  }, [timeline]);

  const project3D = useCallback((x, y, z, width, height, rotX, rotY, zoom, panX, panY) => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const fov = 450;
    const distance = 500;
    const perspective = fov / (fov + z2 + distance);
    const scale = perspective * zoom;

    return {
      x: width / 2 + (x1 + panX) * scale,
      y: height / 2 + (y2 + panY) * scale,
      z: z2,
      scale,
      visible: z2 + distance > -fov * 0.8
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let tTime = 0;

    const render = () => {
      tTime += 0.015;
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

      // Deep spatial slate
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      const cam = cameraRef.current;

      // Project nodes
      const projected = eventNodes.map((ev) => {
        const pt = project3D(ev.x, ev.y, ev.z, width, height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
        return {
          ...ev,
          screenX: pt.x,
          screenY: pt.y,
          depth: pt.z,
          scale: pt.scale,
          visible: pt.visible
        };
      });

      // Draw Chronological 3D Ribbon Line
      if (projected.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(projected[0].screenX, projected[0].screenY);
        for (let i = 1; i < projected.length; i++) {
          ctx.lineTo(projected[i].screenX, projected[i].screenY);
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Pulsing spark on timeline
        const sparkIdx = (tTime * 0.8) % Math.max(1, projected.length - 1);
        const curI = Math.floor(sparkIdx);
        const nextI = Math.min(projected.length - 1, curI + 1);
        const frac = sparkIdx - curI;
        const p1 = projected[curI];
        const p2 = projected[nextI];
        if (p1 && p2) {
          const sx = p1.screenX + (p2.screenX - p1.screenX) * frac;
          const sy = p1.screenY + (p2.screenY - p1.screenY) * frac;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw 3D Event Nodes (Depth Sorted)
      projected.sort((a, b) => b.depth - a.depth);
      projected.forEach((node) => {
        if (!node.visible) return;

        const isSelected = selectedEvent && selectedEvent.id === node.id;
        const isHovered = hoveredEvent && hoveredEvent.id === node.id;
        const r = node.radius * node.scale * (isSelected || isHovered ? 1.4 : 1.0);

        ctx.save();
        ctx.translate(node.screenX, node.screenY);

        // Glow
        if (isSelected || isHovered) {
          const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2.2);
          glow.addColorStop(0, node.color);
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node Sphere
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, node.color);
        grad.addColorStop(1, '#020617');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();

        // Date pill above node
        ctx.font = 'bold 9.5px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(node.event_date || 'Date N/A', 0, -r - 10);

        // Title below node
        if (node.scale > 0.5 || isSelected || isHovered) {
          ctx.fillStyle = isSelected ? '#38bdf8' : '#ffffff';
          ctx.font = '600 10.5px Inter, system-ui, sans-serif';
          const titleText = node.title.length > 20 ? node.title.slice(0, 20) + '...' : node.title;
          ctx.fillText(titleText, 0, r + 14);
        }

        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [eventNodes, selectedEvent, hoveredEvent, project3D]);

  const handleMouseDown = (e) => {
    const cam = cameraRef.current;
    cam.isDragging = true;
    cam.lastMouseX = e.clientX;
    cam.lastMouseY = e.clientY;
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cam = cameraRef.current;
    if (cam.isDragging) {
      const dx = e.clientX - cam.lastMouseX;
      const dy = e.clientY - cam.lastMouseY;
      cam.rotY += dx * 0.006;
      cam.rotX = Math.max(-1.2, Math.min(1.2, cam.rotX + dy * 0.006));
      cam.lastMouseX = e.clientX;
      cam.lastMouseY = e.clientY;
      return;
    }

    // Hit-test
    let closest = null;
    let minDist = Infinity;
    eventNodes.forEach((ev) => {
      const pt = project3D(ev.x, ev.y, ev.z, rect.width, rect.height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
      if (!pt.visible) return;
      const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
      if (dist < 20 && dist < minDist) {
        minDist = dist;
        closest = ev;
      }
    });

    setHoveredEvent(closest);
    canvas.style.cursor = closest ? 'pointer' : 'grab';
  };

  const handleMouseUp = () => {
    const cam = cameraRef.current;
    cam.isDragging = false;
    if (hoveredEvent) {
      setSelectedEvent(hoveredEvent);
    }
  };

  return (
    <div className="space-y-4">
      {/* 3D Timeline Canvas */}
      <div className="relative h-64 sm:h-72 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-elevation">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full block cursor-grab select-none touch-none"
        />

        {/* Status indicator */}
        <div className="absolute top-3 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-xs font-bold text-sky-400">
          <Clock className="w-3.5 h-3.5" /> 3D Spatial Timeline
        </div>

        <button
          onClick={() => {
            const cam = cameraRef.current;
            cam.rotX = 0.25;
            cam.rotY = -0.2;
            cam.zoom = 1.0;
            cam.panX = 0;
            cam.panY = 0;
          }}
          className="absolute top-3 right-4 p-1.5 bg-slate-900/80 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Event Card Detail */}
      {selectedEvent && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-elevation animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedEvent.color || '#38bdf8' }}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                {selectedEvent.event_type}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {selectedEvent.event_date || 'Date N/A'}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-white">{selectedEvent.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{selectedEvent.description}</p>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <ProvenanceBadge provenance={selectedEvent.provenance || 'REPORT_EXTRACTED'} size="sm" />
            <span className="text-[11px] text-slate-500 font-mono">
              Event #{selectedEvent.index !== undefined ? selectedEvent.index + 1 : 1} of {timeline.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

