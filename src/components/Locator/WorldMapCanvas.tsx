import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Map as MapIcon, Layers } from 'lucide-react';
import { CoordinateCandidate } from '../../types/locator';

interface WorldMapCanvasProps {
  candidate: CoordinateCandidate;
  allCandidates?: CoordinateCandidate[];
  onSelectCandidate?: (cand: CoordinateCandidate) => void;
}

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({
  candidate,
  allCandidates = [],
  onSelectCandidate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1); // 1 = normal
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverCoords, setHoverCoords] = useState<{ x: number; z: number } | null>(null);

  // Center view on current candidate coordinates
  const centerOnCandidate = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    centerOnCandidate();
  }, [candidate.x, candidate.z, centerOnCandidate]);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2 + offset.x;
    const centerY = height / 2 + offset.y;

    // Scale factor: 1 canvas pixel = N minecraft blocks
    // At zoom 1, let 1 pixel = 8 minecraft blocks (or 0.125 scale)
    const scale = (0.15 * zoom);

    // Clear background (Bedrock void / deep slate)
    ctx.fillStyle = '#0a0f16';
    ctx.fillRect(0, 0, width, height);

    // Draw stylized Biome noise / terrain zones
    // Background biome colors
    const tileSize = 64 * zoom;
    const startCol = Math.floor(-centerX / tileSize) - 1;
    const endCol = Math.ceil((width - centerX) / tileSize) + 1;
    const startRow = Math.floor(-centerY / tileSize) - 1;
    const endRow = Math.ceil((height - centerY) / tileSize) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const blockX = Math.floor((c * tileSize - offset.x) / scale);
        const blockZ = Math.floor((r * tileSize - offset.y) / scale);

        // Deterministic biome terrain color simulator based on block coordinates
        const hash = Math.sin(blockX * 0.003 + blockZ * 0.003) * Math.cos(blockZ * 0.002);
        
        let biomeColor = '#1e3a1e'; // Default plains dark green
        if (hash > 0.45) biomeColor = '#3f4825'; // Mountain / stone
        else if (hash > 0.25) biomeColor = '#254e28'; // Forest
        else if (hash < -0.4) biomeColor = '#1a334d'; // Ocean / river
        else if (hash < -0.2) biomeColor = '#24523b'; // Swamp / lush

        ctx.fillStyle = biomeColor;
        ctx.fillRect(centerX + c * tileSize, centerY + r * tileSize, tileSize + 1, tileSize + 1);

        // Subtle grid border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX + c * tileSize, centerY + r * tileSize, tileSize, tileSize);
      }
    }

    // Draw Minecraft Coordinate Axes (X = Horizontal, Z = Vertical)
    // World Origin (0,0) position on canvas
    const originCanvasX = centerX - candidate.x * scale;
    const originCanvasY = centerY - candidate.z * scale;

    // Axis Lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // X Axis (Z = 0)
    ctx.beginPath();
    ctx.moveTo(0, originCanvasY);
    ctx.lineTo(width, originCanvasY);
    ctx.stroke();

    // Z Axis (X = 0)
    ctx.beginPath();
    ctx.moveTo(originCanvasX, 0);
    ctx.lineTo(originCanvasX, height);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash

    // Draw World Spawn (0, 0) Landmark Marker
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(originCanvasX, originCanvasY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = '10px monospace';
    ctx.fillText('Spawn (0,0)', originCanvasX + 8, originCanvasY - 4);

    // Draw other candidates if present
    if (allCandidates.length > 1) {
      allCandidates.forEach((c) => {
        if (c.id === candidate.id) return;
        const candCanvasX = centerX + (c.x - candidate.x) * scale;
        const candCanvasY = centerY + (c.z - candidate.z) * scale;

        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(candCanvasX, candCanvasY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px monospace';
        ctx.fillText(`Candidate #${c.rank}`, candCanvasX + 8, candCanvasY - 4);
      });
    }

    // Draw Active Selected Candidate Marker (Center of our view)
    const playerCanvasX = centerX;
    const playerCanvasY = centerY;

    // Pulse radar ring around player
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(playerCanvasX, playerCanvasY, 24 * zoom, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(playerCanvasX, playerCanvasY, 36 * zoom, 0, Math.PI * 2);
    ctx.stroke();

    // Facing Vision Cone (Player FOV ~70°)
    const facingRad = ((candidate.facingAngleDeg - 90) * Math.PI) / 180;
    const fovHalfRad = (35 * Math.PI) / 180;
    const coneRadius = 55 * zoom;

    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.beginPath();
    ctx.moveTo(playerCanvasX, playerCanvasY);
    ctx.arc(playerCanvasX, playerCanvasY, coneRadius, facingRad - fovHalfRad, facingRad + fovHalfRad);
    ctx.closePath();
    ctx.fill();

    // Facing direction line pointer
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerCanvasX, playerCanvasY);
    ctx.lineTo(
      playerCanvasX + Math.cos(facingRad) * (coneRadius + 8),
      playerCanvasY + Math.sin(facingRad) * (coneRadius + 8)
    );
    ctx.stroke();

    // Player Pin Center
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(playerCanvasX, playerCanvasY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Player Label Badge
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`Player (X: ${candidate.x}, Z: ${candidate.z})`, playerCanvasX + 12, playerCanvasY - 8);

    // Chunk Boundary Box (16x16)
    const chunkBlockX = candidate.chunk.blockMinX;
    const chunkBlockZ = candidate.chunk.blockMinZ;
    const chunkCanvasX = centerX + (chunkBlockX - candidate.x) * scale;
    const chunkCanvasY = centerY + (chunkBlockZ - candidate.z) * scale;
    const chunkCanvasSize = 16 * scale;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(chunkCanvasX, chunkCanvasY, chunkCanvasSize, chunkCanvasSize);
    ctx.setLineDash([]);
  }, [candidate, allCandidates, zoom, offset]);

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Mouse Drag / Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const centerX = canvas.width / 2 + offset.x;
      const centerY = canvas.height / 2 + offset.y;
      const scale = 0.15 * zoom;

      const calcBlockX = Math.round(candidate.x + (mouseX - centerX) / scale);
      const calcBlockZ = Math.round(candidate.z + (mouseY - centerY) / scale);
      setHoverCoords({ x: calcBlockX, z: calcBlockZ });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.3, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.3, 0.4));

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/80 overflow-hidden shadow-xl space-y-0">
      {/* Top Map Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            Minecraft World Cartography
          </span>
        </div>

        {/* Map View Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={centerOnCandidate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            title="Recenter Player"
          >
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Center</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[280px] sm:h-[340px] bg-slate-950 cursor-grab active:cursor-grabbing select-none overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Live Hover Crosshair Tooltip */}
        {hoverCoords && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-slate-300 pointer-events-none">
            Cursor: X: {hoverCoords.x} • Z: {hoverCoords.z}
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-slate-300 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Player Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Spawn (0,0)</span>
          </div>
        </div>
      </div>

      {/* Bottom Coordinates Panel */}
      <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-400 mr-2">World Position:</span>
          <span className="font-mono font-bold text-emerald-300">
            X: {candidate.x} &nbsp; Y: {candidate.y} &nbsp; Z: {candidate.z}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>Chunk: [{candidate.chunk.x}, {candidate.chunk.z}]</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Region: {candidate.chunk.regionFile}</span>
        </div>
      </div>
    </div>
  );
};
