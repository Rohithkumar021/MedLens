import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Sparkles, Eye, RotateCcw, Play, Pause, Layers, Maximize2, Minimize2, AlertTriangle, ShieldCheck, FileText, Activity, User, HelpCircle, Link2, Search, Filter } from 'lucide-react';
import EvidenceDetailPanel from './EvidenceDetailPanel';
import VisualizationFallback from './VisualizationFallback';

export default function EvidenceConstellation({
  patient,
  reports = [],
  observations = [],
  conflicts = [],
  timeline = [],
  summary,
  onOpenEvidenceChain,
  onOpenReview,
  onNavigateTab
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [is3DMode, setIs3DMode] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [filterType, setFilterType] = useState('ALL'); // ALL, ABNORMAL, REVIEW, CONFLICTS
  const [showLegend, setShowLegend] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera 3D state
  const cameraRef = useRef({
    rotX: 0.35,
    rotY: -0.4,
    targetRotX: 0.35,
    targetRotY: -0.4,
    zoom: 1.0,
    targetZoom: 1.0,
    panX: 0,
    panY: 0,
    targetPanX: 0,
    targetPanY: 0,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    dragDistance: 0
  });

  // Build real graph dataset from real MedLens entities
  const graphData = useMemo(() => {
    if (!patient) return { nodes: [], links: [] };

    const nodes = [];
    const links = [];

    // 1. Central Patient Node (Origin [0, 0, 0])
    const patientNode = {
      id: 'patient-core',
      label: patient.name || 'Patient',
      sublabel: `${patient.sex || 'Unspecified'}, ${patient.age || 'N/A'} yrs`,
      type: 'patient',
      color: '#0284c7', // Brand medical blue
      glowColor: 'rgba(2, 132, 199, 0.25)',
      radius: 20,
      x: 0,
      y: 0,
      z: 0,
      data: patient
    };
    nodes.push(patientNode);

    // 2. Source Report Nodes (Orbital Shell 1: Radius ~140, distributed around Y)
    const reportCount = reports.length;
    reports.forEach((rep, i) => {
      const angle = (i / Math.max(1, reportCount)) * Math.PI * 2;
      const repNode = {
        id: `report-${rep.id}`,
        label: rep.title || 'Laboratory Report',
        sublabel: rep.report_date || 'Source Document',
        type: 'report',
        color: '#475569', // Slate 600
        glowColor: 'rgba(71, 85, 105, 0.2)',
        radius: 14,
        x: Math.cos(angle) * 140,
        y: (i % 2 === 0 ? 30 : -30),
        z: Math.sin(angle) * 140,
        data: rep
      };
      nodes.push(repNode);
      links.push({
        source: 'patient-core',
        target: repNode.id,
        color: 'rgba(2, 132, 199, 0.25)',
        type: 'hierarchy'
      });
    });

    // 3. Structured Observation Nodes (Orbital Shell 2: Radius ~240)
    const obsCount = observations.length;
    observations.forEach((obs, i) => {
      const repIndex = reports.findIndex(r => r.id === obs.report_id);
      const baseAngle = repIndex >= 0
        ? (repIndex / Math.max(1, reportCount)) * Math.PI * 2 + ((i % 5) - 2) * 0.35
        : (i / Math.max(1, obsCount)) * Math.PI * 2;

      let obsColor = '#16a34a'; // Green 600 (Normal)
      let obsGlow = 'rgba(22, 163, 74, 0.2)';
      if (obs.status === 'HIGH') {
        obsColor = '#d97706'; // Amber 600
        obsGlow = 'rgba(217, 119, 6, 0.25)';
      } else if (obs.status === 'LOW') {
        obsColor = '#0284c7'; // Sky 600
        obsGlow = 'rgba(2, 132, 199, 0.25)';
      } else if (obs.status === 'NOT_AVAILABLE' || obs.status === 'UNKNOWN') {
        obsColor = '#94a3b8'; // Slate 400
        obsGlow = 'rgba(148, 163, 184, 0.2)';
      }

      const yPos = ((i % 4) - 1.5) * 45;
      const obsRadius = obs.is_reviewed ? 11 : 13;

      const obsNode = {
        id: `obs-${obs.id}`,
        label: obs.test_name,
        sublabel: `${obs.corrected_value || obs.value_text} ${obs.unit || ''} (${obs.status})`,
        type: 'observation',
        color: obsColor,
        glowColor: obsGlow,
        radius: obsRadius,
        x: Math.cos(baseAngle) * (230 + (i % 3) * 20),
        y: yPos,
        z: Math.sin(baseAngle) * (230 + (i % 3) * 20),
        status: obs.status,
        isReviewed: obs.is_reviewed,
        data: obs
      };
      nodes.push(obsNode);

      if (repIndex >= 0) {
        links.push({
          source: `report-${reports[repIndex].id}`,
          target: obsNode.id,
          color: obsGlow,
          type: 'extraction'
        });
      } else {
        links.push({
          source: 'patient-core',
          target: obsNode.id,
          color: 'rgba(148, 163, 184, 0.25)',
          type: 'extraction'
        });
      }
    });

    // 4. Clinical Conflict / Inconsistency Nodes
    conflicts.forEach((conf, i) => {
      const angle = Math.PI * 0.75 + i * 0.6;
      const confNode = {
        id: `conf-${conf.id}`,
        label: conf.conflict_type.replace(/_/g, ' '),
        sublabel: conf.description,
        type: 'conflict',
        color: '#dc2626', // Red 600
        glowColor: 'rgba(220, 38, 38, 0.25)',
        radius: 15,
        x: Math.cos(angle) * 310,
        y: ((i % 2) - 0.5) * 60,
        z: Math.sin(angle) * 310,
        data: conf
      };
      nodes.push(confNode);

      links.push({
        source: 'patient-core',
        target: confNode.id,
        color: 'rgba(220, 38, 38, 0.4)',
        dashed: true,
        type: 'conflict'
      });
    });

    // 5. Synthesized Clinical Summary Node
    if (summary) {
      const sumNode = {
        id: 'summary-core',
        label: 'Clinical Synthesis',
        sublabel: 'Grounded Evidence Summary',
        type: 'summary',
        color: '#7c3aed', // Purple 600
        glowColor: 'rgba(124, 58, 237, 0.25)',
        radius: 16,
        x: 0,
        y: 130,
        z: 0,
        data: summary
      };
      nodes.push(sumNode);

      links.push({
        source: 'patient-core',
        target: sumNode.id,
        color: 'rgba(124, 58, 237, 0.35)',
        type: 'synthesis'
      });
    }

    return { nodes, links };
  }, [patient, reports, observations, conflicts, summary]);

  // Filter nodes based on user selection
  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return graphData.nodes;
    if (filterType === 'ABNORMAL') {
      return graphData.nodes.filter(n =>
        n.type === 'patient' ||
        n.type === 'report' ||
        (n.type === 'observation' && (n.status === 'HIGH' || n.status === 'LOW')) ||
        n.type === 'conflict'
      );
    }
    if (filterType === 'REVIEW') {
      return graphData.nodes.filter(n =>
        n.type === 'patient' ||
        n.type === 'report' ||
        (n.type === 'observation' && !n.isReviewed)
      );
    }
    if (filterType === 'CONFLICTS') {
      return graphData.nodes.filter(n =>
        n.type === 'patient' || n.type === 'conflict'
      );
    }
    return graphData.nodes;
  }, [graphData.nodes, filterType]);

  // Generate subtle ambient dust particles
  const ambientParticles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 40; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 800,
        size: 1 + Math.random() * 2,
        opacity: 0.15 + Math.random() * 0.2
      });
    }
    return pts;
  }, []);

  // 3D Math Projection Function
  const project3D = useCallback((x, y, z, width, height, rotX, rotY, zoom, panX, panY) => {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    const fov = 500;
    const distance = 600;
    const perspective = fov / (fov + z2 + distance);
    const scale = perspective * zoom;

    const screenX = width / 2 + (x1 + panX) * scale;
    const screenY = height / 2 + (y2 + panY) * scale;

    return {
      x: screenX,
      y: screenY,
      z: z2,
      scale,
      visible: z2 + distance > -fov * 0.8
    };
  }, []);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !is3DMode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setWebglSupported(false);
      return;
    }

    let animationFrameId;
    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

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

      // Smooth Camera Interpolation
      const cam = cameraRef.current;
      if (autoRotate && !cam.isDragging && !hoveredNode) {
        cam.targetRotY += 0.0025;
      }

      cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;
      cam.panX += (cam.targetPanX - cam.panX) * 0.1;
      cam.panY += (cam.targetPanY - cam.panY) * 0.1;

      // 1. Clear with Clean Light Clinical Background Gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, Math.max(width, height) * 0.8);
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Concentric Orbital Clinical Reference Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.12)';
      ctx.lineWidth = 1;
      [140, 240, 320].forEach((radius) => {
        ctx.beginPath();
        const steps = 64;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          const px = Math.cos(theta) * radius;
          const pz = Math.sin(theta) * radius;
          const pt = project3D(px, 0, pz, width, height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
          if (s === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      });
      ctx.restore();

      // 3. Render Ambient Spatial Dots
      ambientParticles.forEach((p) => {
        const pt = project3D(p.x, p.y, p.z, width, height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
        if (pt.visible) {
          ctx.fillStyle = `rgba(14, 165, 233, ${p.opacity * Math.min(1, pt.scale)})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size * pt.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 4. Project and Depth-Sort Nodes
      const nodeMap = new Map();
      const projectedNodes = filteredNodes.map((n) => {
        const pt = project3D(n.x, n.y, n.z, width, height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
        const isHovered = hoveredNode && hoveredNode.id === n.id;
        const isSelected = selectedNode && selectedNode.id === n.id;
        const pNode = {
          ...n,
          screenX: pt.x,
          screenY: pt.y,
          depth: pt.z,
          scale: pt.scale,
          visible: pt.visible,
          isHovered,
          isSelected
        };
        nodeMap.set(n.id, pNode);
        return pNode;
      });

      projectedNodes.sort((a, b) => b.depth - a.depth);

      // 5. Draw 3D Connection Lines
      graphData.links.forEach((link) => {
        const sourceNode = nodeMap.get(link.source);
        const targetNode = nodeMap.get(link.target);
        if (!sourceNode || !targetNode || !sourceNode.visible || !targetNode.visible) return;

        const isHighlighted = (hoveredNode && (hoveredNode.id === link.source || hoveredNode.id === link.target)) ||
                              (selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target));

        ctx.save();
        ctx.beginPath();
        if (link.dashed) {
          ctx.setLineDash([4, 4]);
        }
        ctx.strokeStyle = isHighlighted ? '#0284c7' : (link.color || 'rgba(148, 163, 184, 0.4)');
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;

        const midX = (sourceNode.screenX + targetNode.screenX) / 2;
        const midY = (sourceNode.screenY + targetNode.screenY) / 2 - 15 * sourceNode.scale;
        ctx.moveTo(sourceNode.screenX, sourceNode.screenY);
        ctx.quadraticCurveTo(midX, midY, targetNode.screenX, targetNode.screenY);
        ctx.stroke();

        if (isHighlighted) {
          const pulseT = ((time * 0.001) % 1);
          const px = (1 - pulseT) * (1 - pulseT) * sourceNode.screenX + 2 * (1 - pulseT) * pulseT * midX + pulseT * pulseT * targetNode.screenX;
          const py = (1 - pulseT) * (1 - pulseT) * sourceNode.screenY + 2 * (1 - pulseT) * pulseT * midY + pulseT * pulseT * targetNode.screenY;
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 6. Draw 3D Nodes
      projectedNodes.forEach((node) => {
        if (!node.visible) return;

        const currentRadius = node.radius * node.scale * (node.isHovered || node.isSelected ? 1.35 : 1.0);

        ctx.save();
        ctx.translate(node.screenX, node.screenY);

        // A. Subtle Soft Halo
        const glow = ctx.createRadialGradient(0, 0, currentRadius * 0.2, 0, 0, currentRadius * 2.2);
        glow.addColorStop(0, node.glowColor || 'rgba(2, 132, 199, 0.2)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // B. Node Sphere Core
        const coreGrad = ctx.createRadialGradient(-currentRadius * 0.3, -currentRadius * 0.3, currentRadius * 0.1, 0, 0, currentRadius);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, node.color);
        coreGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // C. Outer Border Ring
        ctx.lineWidth = node.isSelected ? 3 : (node.isHovered ? 2 : 1.2);
        ctx.strokeStyle = node.isSelected ? '#0284c7' : (node.isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.9)');
        ctx.stroke();

        // D. Node Label Badge (Crisp Light Pill)
        if (node.scale > 0.45 || node.isHovered || node.isSelected || node.type === 'patient') {
          ctx.font = `${node.type === 'patient' ? 'bold 12px' : '600 10.5px'} 'Plus Jakarta Sans', system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textY = currentRadius + 14;
          const text = node.label;
          const metrics = ctx.measureText(text);
          const padX = 6;
          const padY = 3;

          // Label Pill Background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
          ctx.strokeStyle = node.isSelected ? '#0284c7' : '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-metrics.width / 2 - padX, textY - 8 - padY, metrics.width + padX * 2, 16 + padY * 2, 4);
          ctx.fill();
          ctx.stroke();

          // Label Text
          ctx.fillStyle = node.isSelected ? '#0284c7' : '#0f172a';
          ctx.fillText(text, 0, textY);
        }

        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [is3DMode, filteredNodes, graphData, autoRotate, hoveredNode, selectedNode, ambientParticles, project3D]);

  // Mouse Interaction Handlers
  const handleMouseDown = (e) => {
    const cam = cameraRef.current;
    cam.isDragging = true;
    cam.lastMouseX = e.clientX;
    cam.lastMouseY = e.clientY;
    cam.dragDistance = 0;
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
      cam.targetRotY += dx * 0.006;
      cam.targetRotX = Math.max(-1.4, Math.min(1.4, cam.targetRotX + dy * 0.006));
      cam.lastMouseX = e.clientX;
      cam.lastMouseY = e.clientY;
      cam.dragDistance += Math.abs(dx) + Math.abs(dy);
      return;
    }

    let closestNode = null;
    let minDist = Infinity;

    filteredNodes.forEach((n) => {
      const pt = project3D(n.x, n.y, n.z, rect.width, rect.height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
      if (!pt.visible) return;
      const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
      const hitRadius = Math.max(16, n.radius * pt.scale * 1.5);
      if (dist < hitRadius && dist < minDist) {
        minDist = dist;
        closestNode = n;
      }
    });

    setHoveredNode(closestNode);
    canvas.style.cursor = closestNode ? 'pointer' : (cam.isDragging ? 'grabbing' : 'grab');
  };

  const handleMouseUp = (e) => {
    const cam = cameraRef.current;
    cam.isDragging = false;

    if (cam.dragDistance < 5 && hoveredNode) {
      handleNodeClick(hoveredNode);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const cam = cameraRef.current;
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    cam.targetZoom = Math.max(0.4, Math.min(2.5, cam.targetZoom * zoomFactor));
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    const cam = cameraRef.current;
    cam.targetPanX = -node.x * 0.5;
    cam.targetPanY = -node.y * 0.5;
  };

  const handleResetCamera = () => {
    const cam = cameraRef.current;
    cam.targetRotX = 0.35;
    cam.targetRotY = -0.4;
    cam.targetZoom = 1.0;
    cam.targetPanX = 0;
    cam.targetPanY = 0;
    setSelectedNode(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'r' || e.key === 'R') {
        handleResetCamera();
      } else if (e.key === ' ') {
        setAutoRotate((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!webglSupported || !is3DMode) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setIs3DMode(true)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-brand-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition shadow-subtle"
          >
            <Layers className="w-3.5 h-3.5 text-brand-600" /> Switch to 3D Clinical Graph
          </button>
        </div>
        <VisualizationFallback
          patient={patient}
          reports={reports}
          observations={observations}
          conflicts={conflicts}
          timeline={timeline}
          summary={summary}
          onOpenEvidenceChain={onOpenEvidenceChain}
          onOpenReview={onOpenReview}
          onNavigateTab={onNavigateTab}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-card transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[460px] sm:h-[520px]'
      }`}
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full block select-none touch-none"
        aria-label="Interactive 3D Clinical Information Graph"
      />

      {/* Top Floating Header & Filter Toolbar */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-subtle">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-extrabold text-slate-900 tracking-tight">Clinical Evidence Map</span>
          <span className="text-[10px] font-mono text-slate-600 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
            {filteredNodes.length} Nodes
          </span>
        </div>

        {/* Filter Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 text-xs shadow-subtle">
          {[
            { id: 'ALL', label: 'All Entities' },
            { id: 'ABNORMAL', label: 'Abnormal Only' },
            { id: 'REVIEW', label: 'Needs Review' },
            { id: 'CONFLICTS', label: 'Inconsistencies' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                filterType === f.id
                  ? 'bg-sky-50 text-brand-700 border border-sky-200 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Action Controls Toolbar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 shadow-subtle">
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          title={autoRotate ? 'Pause Orbit Rotation (Space)' : 'Start Auto-Orbit (Space)'}
          className={`p-1.5 rounded-md text-xs font-bold transition ${
            autoRotate ? 'bg-sky-50 text-brand-700 border border-sky-200' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Toggle auto-orbit"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View (R / Esc)"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
          aria-label="Reset camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowLegend((prev) => !prev)}
          title="Toggle Legend & Telemetry Key"
          className={`p-1.5 rounded-md transition ${
            showLegend ? 'bg-sky-50 text-brand-700 border border-sky-200' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label="Toggle legend"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIs3DMode(false)}
          title="Switch to 2D High-Contrast Matrix"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
          aria-label="Switch to 2D View"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredNode && !selectedNode && (
        <div
          className="absolute pointer-events-none z-30 bg-white/95 backdrop-blur-md border border-slate-300 text-slate-900 px-3 py-2 rounded-lg shadow-lg text-xs -translate-x-1/2 -translate-y-full mb-3 animate-modal-in"
          style={{
            left: `${hoveredNode.screenX}px`,
            top: `${hoveredNode.screenY - 10}px`
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
            <span className="font-extrabold text-slate-900">{hoveredNode.label}</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-0.5 font-mono">{hoveredNode.sublabel}</div>
          <div className="text-[10px] text-brand-600 mt-1 font-semibold flex items-center gap-1">
            <span>Click node to inspect evidence &amp; actions</span>
          </div>
        </div>
      )}

      {/* Interactive Node Inspection Detail Panel */}
      {selectedNode && (
        <EvidenceDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onOpenEvidenceChain={(obs) => {
            setSelectedNode(null);
            onOpenEvidenceChain(obs);
          }}
          onOpenReview={(obs) => {
            setSelectedNode(null);
            onOpenReview(obs);
          }}
          onNavigateTab={(tab) => {
            setSelectedNode(null);
            onNavigateTab(tab);
          }}
        />
      )}

      {/* Spatial Legend & Controls Key Overlay */}
      {showLegend && (
        <div className="absolute bottom-12 left-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 text-slate-800 text-xs max-w-xs shadow-xl animate-modal-in space-y-2">
          <div className="font-extrabold text-brand-700 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200">
            Clinical Data Map Legend
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
              <span>Patient Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Source Report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Normal Biomarker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>High Biomarker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
              <span>Low Biomarker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>Inconsistency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>AI Summary</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 leading-tight">
            <strong>Controls:</strong> Drag to rotate · Scroll to zoom · Click to inspect · Esc to reset
          </div>
        </div>
      )}

      {/* Bottom Telemetry Status Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[10.5px] font-mono text-slate-500">
        <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-2 pointer-events-auto shadow-subtle">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>STRUCTURED CLINICAL GRAPH</span>
        </div>

        <div className="hidden sm:flex bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 items-center gap-2 pointer-events-auto shadow-subtle">
          <span>Drag to orbit · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
