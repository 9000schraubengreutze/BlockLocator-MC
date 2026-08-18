import React, { useState } from 'react';
import {
  Compass,
  RotateCw,
  Layers,
  Sparkles,
  Check,
  Cpu,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  Sliders,
  Grid,
} from 'lucide-react';
import { BedrockPatternAnalysis, CoordinateCandidate, Dimension } from '../../types/locator';
import { calculateCoordinatesFromBedrockOrientation } from '../../utils/bedrockPatternCracker';
import { calculateChunkInfo } from '../../utils/minecraftCoords';

interface BedrockOrientationInspectorProps {
  bedrockAnalysis?: BedrockPatternAnalysis;
  seed: string;
  activeCandidate: CoordinateCandidate;
  dimension: Dimension;
  onUpdateCandidateCoords: (newCoords: { x: number; y: number; z: number; facing: string; facingAngleDeg: number }) => void;
  onOpenGridCracker?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const BedrockOrientationInspector: React.FC<BedrockOrientationInspectorProps> = ({
  bedrockAnalysis,
  seed,
  activeCandidate,
  dimension,
  onUpdateCandidateCoords,
  onOpenGridCracker,
  onShowToast,
}) => {
  const [currentRotation, setCurrentRotation] = useState<number>(
    bedrockAnalysis?.rotationDeg ?? 0
  );
  const [currentLayer, setCurrentLayer] = useState<number>(
    bedrockAnalysis?.layerEstimated ?? (dimension === 'nether' ? 125 : 1)
  );
  const [subChunkX, setSubChunkX] = useState<number>(
    bedrockAnalysis?.subChunkOffset?.x ?? 7
  );
  const [subChunkZ, setSubChunkZ] = useState<number>(
    bedrockAnalysis?.subChunkOffset?.z ?? 11
  );

  // Recalculate on any parameter change
  const computed = calculateCoordinatesFromBedrockOrientation({
    seed,
    rotationDeg: currentRotation,
    layer: currentLayer,
    subChunkX,
    subChunkZ,
    dimension,
  });

  const handleApply = () => {
    onUpdateCandidateCoords({
      x: computed.x,
      y: computed.y,
      z: computed.z,
      facing: computed.facing,
      facingAngleDeg: currentRotation,
    });
    onShowToast(`Bedrock-Ausrichtung (${computed.facing}) angewendet: X: ${computed.x}, Y: ${computed.y}, Z: ${computed.z}`, 'success');
  };

  const handleSetRotation = (deg: number) => {
    setCurrentRotation(deg);
    const newCoords = calculateCoordinatesFromBedrockOrientation({
      seed,
      rotationDeg: deg,
      layer: currentLayer,
      subChunkX,
      subChunkZ,
      dimension,
    });
    onUpdateCandidateCoords({
      x: newCoords.x,
      y: newCoords.y,
      z: newCoords.z,
      facing: newCoords.facing,
      facingAngleDeg: deg,
    });
    onShowToast(`Bedrock-Drehung auf ${deg}° (${newCoords.facing}) gesetzt.`, 'info');
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-purple-500/40 p-6 sm:p-8 shadow-2xl shadow-purple-950/30 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-950/40">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Bedrock Direction & Pattern Engine
              </span>
              <span className="text-xs text-purple-300/80 font-mono">
                Pixel-Rotationsanalyse
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              Bedrock-Musterausrichtung & Koordinaten-Berechnung
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-purple-950/50 border border-purple-500/30 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-mono text-purple-200">
            Aktive Richtung: <strong>{computed.facing} ({currentRotation}°)</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Bedrock Interactive Compass & Texture */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative group">
          <p className="text-xs font-mono text-slate-400 mb-4 uppercase tracking-wider text-center">
            Bedrock 16x16 Textur-Matrix & Orientierung
          </p>

          {/* Interactive Rotatable Bedrock Texture with Directional Overlay */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl border-2 border-purple-500/50 overflow-hidden shadow-xl shadow-purple-950/50 bg-neutral-900 flex items-center justify-center">
            {/* Minecraft Bedrock Texture SVG that rotates */}
            <div
              className="w-full h-full transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${currentRotation}deg)` }}
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                {/* Pixelated Bedrock background */}
                <rect width="64" height="64" fill="#222" />
                {/* Characteristic Minecraft Bedrock Dark & Light pixel clusters */}
                <rect x="0" y="0" width="16" height="16" fill="#111" />
                <rect x="16" y="0" width="16" height="16" fill="#333" />
                <rect x="32" y="0" width="16" height="16" fill="#181818" />
                <rect x="48" y="0" width="16" height="16" fill="#2c2c2c" />

                <rect x="0" y="16" width="16" height="16" fill="#383838" />
                <rect x="16" y="16" width="16" height="16" fill="#0d0d0d" />
                {/* Canonical L-shaped dark cluster at North position */}
                <rect x="16" y="16" width="8" height="16" fill="#050505" />
                <rect x="24" y="24" width="8" height="8" fill="#050505" />
                
                <rect x="32" y="16" width="16" height="16" fill="#252525" />
                <rect x="48" y="16" width="16" height="16" fill="#141414" />

                <rect x="0" y="32" width="16" height="16" fill="#1f1f1f" />
                <rect x="16" y="32" width="16" height="16" fill="#2e2e2e" />
                <rect x="32" y="32" width="16" height="16" fill="#0a0a0a" />
                <rect x="48" y="32" width="16" height="16" fill="#363636" />

                <rect x="0" y="48" width="16" height="16" fill="#2b2b2b" />
                <rect x="16" y="48" width="16" height="16" fill="#171717" />
                <rect x="32" y="48" width="16" height="16" fill="#313131" />
                <rect x="48" y="48" width="16" height="16" fill="#111" />

                {/* Light ridge feature */}
                <rect x="40" y="44" width="6" height="4" fill="#555" />
                <rect x="44" y="48" width="8" height="4" fill="#666" />
                
                {/* Feature marker box */}
                <rect x="14" y="14" width="20" height="20" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3,2" />
              </svg>
            </div>

            {/* Cardinal Direction Overlays */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-rose-400 border border-rose-500/30">
              N (-Z)
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
              S (+Z)
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
              E (+X)
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
              W (-X)
            </div>

            {/* Center Reticle */}
            <div className="absolute w-4 h-4 rounded-full border border-purple-400/80 bg-purple-500/20 pointer-events-none flex items-center justify-center">
              <div className="w-1 h-1 bg-purple-300 rounded-full" />
            </div>
          </div>

          <p className="text-[11px] text-purple-300/80 mt-3 text-center">
            Klicke unten auf eine Himmelsrichtung, um die Bedrock-Textur auszurichten.
          </p>
        </div>

        {/* Direction Selector & Live Parameters */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4 Cardinal Direction Buttons */}
          <div>
            <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
              Bedrock Textur-Ausrichtung (Cardinal Direction)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* North */}
              <button
                type="button"
                onClick={() => handleSetRotation(0)}
                className={`p-3 rounded-xl border font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  currentRotation === 0
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/60'
                }`}
              >
                <ArrowUp className="w-4 h-4 text-rose-400" />
                <span className="font-bold">0° Nord</span>
                <span className="text-[10px] text-slate-400">-Z Achse</span>
              </button>

              {/* East */}
              <button
                type="button"
                onClick={() => handleSetRotation(90)}
                className={`p-3 rounded-xl border font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  currentRotation === 90
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/60'
                }`}
              >
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <span className="font-bold">90° Ost</span>
                <span className="text-[10px] text-slate-400">+X Achse</span>
              </button>

              {/* South */}
              <button
                type="button"
                onClick={() => handleSetRotation(180)}
                className={`p-3 rounded-xl border font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  currentRotation === 180
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/60'
                }`}
              >
                <ArrowDown className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">180° Süd</span>
                <span className="text-[10px] text-slate-400">+Z Achse</span>
              </button>

              {/* West */}
              <button
                type="button"
                onClick={() => handleSetRotation(270)}
                className={`p-3 rounded-xl border font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  currentRotation === 270
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/60'
                }`}
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">270° West</span>
                <span className="text-[10px] text-slate-400">-X Achse</span>
              </button>
            </div>
          </div>

          {/* Layer & SubChunk Offsets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Height Layer */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Höhenebene Y-Layer
                </span>
                <span className="font-bold text-purple-400">Y: {currentLayer}</span>
              </div>
              <input
                type="range"
                min={dimension === 'nether' ? 120 : 0}
                max={dimension === 'nether' ? 127 : 5}
                value={currentLayer}
                onChange={(e) => {
                  const newLayer = Number(e.target.value);
                  setCurrentLayer(newLayer);
                  const updated = calculateCoordinatesFromBedrockOrientation({
                    seed,
                    rotationDeg: currentRotation,
                    layer: newLayer,
                    subChunkX,
                    subChunkZ,
                    dimension,
                  });
                  onUpdateCandidateCoords({
                    x: updated.x,
                    y: updated.y,
                    z: updated.z,
                    facing: updated.facing,
                    facingAngleDeg: currentRotation,
                  });
                }}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                {dimension === 'nether' ? 'Nether-Decke (Y=120 bis 127)' : 'Bedrock-Boden (Y=0 bis 5)'}
              </p>
            </div>

            {/* Sub-chunk Offset X/Z */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-cyan-400" />
                  Sub-Chunk Offset
                </span>
                <span className="font-bold text-cyan-400">
                  X+{subChunkX}, Z+{subChunkZ}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={subChunkX}
                  onChange={(e) => setSubChunkX(Number(e.target.value))}
                  className="w-1/2 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  title="Sub-Chunk X Offset"
                />
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={subChunkZ}
                  onChange={(e) => setSubChunkZ(Number(e.target.value))}
                  className="w-1/2 accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  title="Sub-Chunk Z Offset"
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Blockposition innerhalb des 16x16 Chunks
              </p>
            </div>
          </div>

          {/* Computed Coordinates Live Badge */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-mono text-purple-300 uppercase tracking-wider">
                Berechnete Minecraft-Koordinaten aus Bedrock-Richtung:
              </p>
              <p className="font-mono text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                X: <span className="text-emerald-400">{computed.x}</span>, Y: <span className="text-cyan-400">{computed.y}</span>, Z: <span className="text-purple-400">{computed.z}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Chunk: [{computed.chunkX}, {computed.chunkZ}] • Ausrichtung: {computed.facing}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenGridCracker && (
                <button
                  type="button"
                  onClick={onOpenGridCracker}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-purple-200 bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-4 h-4 text-purple-300" />
                  <span>2D Bedrock-Muster Grid Solver</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-950/50 flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Koordinaten übernehmen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
