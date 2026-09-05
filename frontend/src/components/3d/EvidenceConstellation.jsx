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

  // Build real 3D graph dataset from real MedLens entities
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
      color: '#38bdf8', // Sky 400
      glowColor: 'rgba(56, 189, 248, 0.4)',
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
        color: '#0284c7', // Brand 600
        glowColor: 'rgba(2, 132, 199, 0.45)',
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
        color: 'rgba(56, 189, 248, 0.45)',
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

      let obsColor = '#10b981'; // Emerald 500 (Normal)
      let obsGlow = 'rgba(16, 185, 129, 0.4)';
      if (obs.status === 'HIGH') {
        obsColor = '#f59e0b'; // Amber 500
        obsGlow = 'rgba(245, 158, 11, 0.45)';
      } else if (obs.status === 'LOW') {
        obsColor = '#06b6d4'; // Cyan 500
        obsGlow = 'rgba(6, 182, 212, 0.45)';
      } else if (obs.status === 'NOT_AVAILABLE' || obs.status === 'UNKNOWN') {
        obsColor = '#94a3b8'; // Slate 400
        obsGlow = 'rgba(148, 163, 184, 0.35)';
      }

      // Height variation based on index
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

      // Connect observation to its originating report or patient
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
          color: 'rgba(148, 163, 184, 0.3)',
          type: 'extraction'
        });
      }
    });

    // 4. Clinical Conflict / Inconsistency Nodes
    conflicts.forEach((conf, i) => {
      const angle = Math.PI * 0.75 + i * 0.6;
      const confNode = {
        id: `conf-${conf.id}`,
        label: `Inconsistency: ${conf.conflict_type}`,
        sublabel: conf.description,
        type: 'conflict',
        color: '#f43f5e', // Rose 500
        glowColor: 'rgba(244, 63, 94, 0.6)',
        radius: 14,
        x: Math.cos(angle) * 190,
        y: 80 + i * 30,
        z: Math.sin(angle) * 190,
        data: conf
      };
      nodes.push(confNode);

      // Connect conflict with patient core
      links.push({
        source: 'patient-core',
        target: confNode.id,
        color: 'rgba(244, 63, 94, 0.6)',
        type: 'conflict',
        dashed: true
      });
    });

    // 5. AI Summary Node (Ascended Satellite Node)
    if (summary) {
      const sumNode = {
        id: 'summary-node',
        label: 'Clinical AI Synthesis',
        sublabel: `${summary.model_name || 'Gemini'} (Non-diagnostic)`,
        type: 'summary',
        color: '#a855f7', // Purple 500
        glowColor: 'rgba(168, 85, 247, 0.5)',
        radius: 15,
        x: 0,
        y: -160,
        z: 60,
        data: summary
      };
      nodes.push(sumNode);
      links.push({
        source: 'patient-core',
        target: sumNode.id,
        color: 'rgba(168, 85, 247, 0.5)',
        type: 'synthesis',
        dashed: true
      });
    }

    return { nodes, links };
  }, [patient, reports, observations, conflicts, summary]);

  // Filter nodes based on active filterType
  const filteredNodes = useMemo(() => {
    if (filterType === 'ALL') return graphData.nodes;
    if (filterType === 'ABNORMAL') {
      return graphData.nodes.filter(n => n.type === 'patient' || (n.type === 'observation' && (n.status === 'HIGH' || n.status === 'LOW')));
    }
    if (filterType === 'REVIEW') {
      return graphData.nodes.filter(n => n.type === 'patient' || (n.type === 'observation' && !n.isReviewed));
    }
    if (filterType === 'CONFLICTS') {
      return graphData.nodes.filter(n => n.type === 'patient' || n.type === 'conflict');
    }
    return graphData.nodes;
  }, [graphData.nodes, filterType]);

  // Background Ambient Dust Particles (3D Starfield/Telemetry)
  const ambientParticles = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 90; i++) {
      pts.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 600,
        z: (Math.random() - 0.5) * 800,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.35 + 0.1
      });
    }
    return pts;
  }, []);

  // 3D Math Projection Function
  const project3D = useCallback((x, y, z, width, height, rotX, rotY, zoom, panX, panY) => {
    // 1. Rotate around Y-axis (Yaw)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = z * cosY + x * sinY;

    // 2. Rotate around X-axis (Pitch)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = z1 * cosX + y * sinX;

    // 3. Perspective Projection
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

      // Smooth Camera Interpolation (Dampening)
      const cam = cameraRef.current;
      if (autoRotate && !cam.isDragging && !hoveredNode) {
        cam.targetRotY += 0.003;
      }

      cam.rotX += (cam.targetRotX - cam.rotX) * 0.1;
      cam.rotY += (cam.targetRotY - cam.rotY) * 0.1;
      cam.zoom += (cam.targetZoom - cam.zoom) * 0.1;
      cam.panX += (cam.targetPanX - cam.panX) * 0.1;
      cam.panY += (cam.targetPanY - cam.panY) * 0.1;

      // 1. Clear with Deep Clinical Slate Gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, Math.max(width, height) * 0.8);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Subtle Spatial Telemetry Grid & Concentric Orbital Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
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

      // 3. Render Ambient Spatial Particles
      ambientParticles.forEach((p) => {
        const pt = project3D(p.x, p.y, p.z, width, height, cam.rotX, cam.rotY, cam.zoom, cam.panX, cam.panY);
        if (pt.visible) {
          ctx.fillStyle = `rgba(186, 230, 253, ${p.opacity * Math.min(1, pt.scale)})`;
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

      // Sort by depth (back to front) for correct alpha blending
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
        ctx.strokeStyle = isHighlighted ? '#38bdf8' : (link.color || 'rgba(148, 163, 184, 0.25)');
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;

        // Quadratic Bezier Curve for smooth spatial routing
        const midX = (sourceNode.screenX + targetNode.screenX) / 2;
        const midY = (sourceNode.screenY + targetNode.screenY) / 2 - 15 * sourceNode.scale;
        ctx.moveTo(sourceNode.screenX, sourceNode.screenY);
        ctx.quadraticCurveTo(midX, midY, targetNode.screenX, targetNode.screenY);
        ctx.stroke();

        // If highlighted, draw animated energy pulse dot
        if (isHighlighted) {
          const pulseT = ((time * 0.001) % 1);
          const px = (1 - pulseT) * (1 - pulseT) * sourceNode.screenX + 2 * (1 - pulseT) * pulseT * midX + pulseT * pulseT * targetNode.screenX;
          const py = (1 - pulseT) * (1 - pulseT) * sourceNode.screenY + 2 * (1 - pulseT) * pulseT * midY + pulseT * pulseT * targetNode.screenY;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
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

        // A. Ambient Outer Glow
        const glow = ctx.createRadialGradient(0, 0, currentRadius * 0.2, 0, 0, currentRadius * 2.4);
        glow.addColorStop(0, node.glowColor || 'rgba(56, 189, 248, 0.4)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // B. Node Sphere Core with 3D Light Highlight
        const coreGrad = ctx.createRadialGradient(-currentRadius * 0.3, -currentRadius * 0.3, currentRadius * 0.1, 0, 0, currentRadius);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, node.color);
        coreGrad.addColorStop(1, '#020617');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // C. Outer Ring & Selection Aura
        ctx.lineWidth = node.isSelected ? 3 : (node.isHovered ? 2 : 1.2);
        ctx.strokeStyle = node.isSelected ? '#ffffff' : (node.isHovered ? '#7dd3fc' : 'rgba(255, 255, 255, 0.4)');
        ctx.stroke();

        // D. Node Label Badge (High legibility)
        if (node.scale > 0.45 || node.isHovered || node.isSelected || node.type === 'patient') {
          ctx.font = `${node.type === 'patient' ? 'bold 12px' : '600 10.5px'} Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textY = currentRadius + 14;
          const text = node.label;
          const metrics = ctx.measureText(text);
          const padX = 6;
          const padY = 3;

          // Label Pill Background
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = node.isSelected ? '#38bdf8' : 'rgba(71, 85, 105, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-metrics.width / 2 - padX, textY - 8 - padY, metrics.width + padX * 2, 16 + padY * 2, 4);
          ctx.fill();
          ctx.stroke();

          // Label Text
          ctx.fillStyle = node.isSelected ? '#ffffff' : '#f8fafc';
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

    // Raycast / Hit-test nearest node
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

    // If it was a clean click without significant drag
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
    // Smoothly pan camera to center the clicked entity
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

  // Keyboard navigation & accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleResetCamera();
      } else if (e.key === 'r' || e.key === 'R') {
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
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5" /> Switch to 3D Spatial View
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
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-elevation transition-all ${
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
        aria-label="Interactive 3D Evidence Constellation Map"
      />

      {/* Top Floating Header & Filter Toolbar */}
      <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-extrabold text-white tracking-tight">Evidence Constellation</span>
          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
            {filteredNodes.length} Nodes
          </span>
        </div>

        {/* Filter Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 text-xs">
          {[
            { id: 'ALL', label: 'All Entities' },
            { id: 'ABNORMAL', label: 'Abnormal Only' },
            { id: 'REVIEW', label: 'Needs Review' },
            { id: 'CONFLICTS', label: 'Inconsistencies' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                filterType === f.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Action Controls Toolbar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          title={autoRotate ? 'Pause Orbit Rotation (Space)' : 'Start Auto-Orbit (Space)'}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            autoRotate ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Toggle auto-orbit"
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View (R / Esc)"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          aria-label="Reset camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowLegend((prev) => !prev)}
          title="Toggle Legend & Telemetry Key"
          className={`p-1.5 rounded-lg transition ${
            showLegend ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Toggle legend"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIs3DMode(false)}
          title="Switch to 2D High-Contrast Matrix"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          aria-label="Switch to 2D View"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullscreen((prev) => !prev)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredNode && !selectedNode && (
        <div
          className="absolute pointer-events-none z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white px-3 py-2 rounded-xl shadow-2xl text-xs -translate-x-1/2 -translate-y-full mb-3 animate-fade-in"
          style={{
            left: `${hoveredNode.screenX}px`,
            top: `${hoveredNode.screenY - 10}px`
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
            <span className="font-extrabold text-white">{hoveredNode.label}</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5 font-mono">{hoveredNode.sublabel}</div>
          <div className="text-[10px] text-sky-400 mt-1 font-semibold flex items-center gap-1">
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
        <div className="absolute bottom-12 left-4 z-30 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/90 text-white text-xs max-w-xs shadow-2xl animate-fade-in space-y-2">
          <div className="font-extrabold text-sky-400 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
            Spatial Telemetry Legend
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Patient Core</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
              <span>Source Report</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal Biomarker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>High Biomarker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Low Biomarker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Inconsistency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>AI Summary</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-tight">
            <strong>Controls:</strong> Drag to rotate · Scroll to zoom · Click to inspect · Double-click to open · Esc to reset
          </div>
        </div>
      )}

      {/* Bottom Telemetry Status Bar */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none text-[10.5px] font-mono text-slate-400">
        <div className="bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center gap-2 pointer-events-auto">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REAL-TIME EVIDENCE TOPOLOGY</span>
        </div>

        <div className="hidden sm:flex bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800/80 items-center gap-2 pointer-events-auto">
          <span>Drag to orbit · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}

