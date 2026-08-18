import React, { useState, useEffect } from 'react';
import {
  Grid,
  X,
  Sparkles,
  Compass,
  Layers,
  Search,
  Check,
  RotateCw,
  Copy,
  Info,
  Sliders,
  Terminal,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Globe,
  CornerDownRight,
} from 'lucide-react';
import {
  crackBedrockFromPattern,
  generateBedrockChunkLayer,
  parseF3Text,
  BedrockCrackMatch,
} from '../../utils/bedrockPatternCracker';
import { calculateChunkInfo, generateMinecraftCommands } from '../../utils/minecraftCoords';
import { CoordinateCandidate, Dimension } from '../../types/locator';

interface BedrockGridCrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seed: string;
  dimension: Dimension;
  activeCandidate?: CoordinateCandidate;
  onApplyCoordinates: (coords: { x: number; y: number; z: number; explanation: string }) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const BedrockGridCrackerModal: React.FC<BedrockGridCrackerModalProps> = ({
  isOpen,
  onClose,
  seed,
  dimension,
  activeCandidate,
  onApplyCoordinates,
  onShowToast,
}) => {
  const [gridSize, setGridSize] = useState<number>(6); // 6x6 interactive pattern
  const [layer, setLayer] = useState<number>(dimension === 'nether' ? 125 : 1);
  const [searchRadius, setSearchRadius] = useState<number>(32); // in chunks (32 chunks = ~512 blocks)
  const [centerChunkX, setCenterChunkX] = useState<number>(
    activeCandidate ? Math.floor(activeCandidate.x / 16) : 0
  );
  const [centerChunkZ, setCenterChunkZ] = useState<number>(
    activeCandidate ? Math.floor(activeCandidate.z / 16) : 0
  );

  // Initialize a realistic default pattern based on seed and layer
  const [grid, setGrid] = useState<boolean[][]>(() =>
    generateBedrockChunkLayer(seed || '8057211', centerChunkX, centerChunkZ, layer, 6)
  );

  const [matches, setMatches] = useState<BedrockCrackMatch[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [f3Input, setF3Input] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'grid' | 'f3' | 'converter'>('grid');

  // Converter state
  const [convOverworldX, setConvOverworldX] = useState<number>(activeCandidate ? activeCandidate.x * 8 : 0);
  const [convOverworldZ, setConvOverworldZ] = useState<number>(activeCandidate ? activeCandidate.z * 8 : 0);
  const [convNetherX, setConvNetherX] = useState<number>(activeCandidate ? activeCandidate.x : 0);
  const [convNetherZ, setConvNetherZ] = useState<number>(activeCandidate ? activeCandidate.z : 0);

  // Recalculate default grid when layer or seed changes
  useEffect(() => {
    setGrid(generateBedrockChunkLayer(seed || '8057211', centerChunkX, centerChunkZ, layer, gridSize));
  }, [seed, layer, gridSize]);

  // Toggle single cell in grid
  const handleToggleCell = (r: number, c: number) => {
    const newGrid = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? !val : val))
    );
    setGrid(newGrid);
  };

  const handleRunSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      const found = crackBedrockFromPattern(
        seed || '8057211',
        grid,
        layer,
        searchRadius,
        centerChunkX,
        centerChunkZ
      );
      setMatches(found);
      setIsSearching(false);
      if (found.length > 0) {
        onShowToast(`${found.length} passende Bedrock-Chunk-Treffer gefunden!`, 'success');
      } else {
        onShowToast('Keine 100% Übereinstimmung im Suchradius. Versuche den Radius zu vergrößern.', 'info');
      }
    }, 350);
  };

  const handleApplyMatch = (match: BedrockCrackMatch) => {
    onApplyCoordinates({
      x: match.blockX,
      y: match.blockY,
      z: match.blockZ,
      explanation: `Bedrock-Pattern-Cracking mit Seed ${seed || 'Default'} bei Chunk [${match.chunkX}, ${match.chunkZ}] (Genauigkeit: ${match.matchScore}%).`,
    });
    onClose();
  };

  const handleParseF3 = () => {
    const parsed = parseF3Text(f3Input);
    if (parsed.found && parsed.x !== undefined && parsed.z !== undefined) {
      const y = parsed.y ?? (dimension === 'nether' ? 125 : 70);
      onApplyCoordinates({
        x: parsed.x,
        y,
        z: parsed.z,
        explanation: `Präzise aus F3 Debug-Text extrahiert: X: ${parsed.x}, Y: ${y}, Z: ${parsed.z}${parsed.biome ? ` (${parsed.biome})` : ''}.`,
      });
      onShowToast(`F3-Koordinaten übernommen: X: ${parsed.x}, Y: ${y}, Z: ${parsed.z}`, 'success');
      onClose();
    } else {
      onShowToast('Konnte keine gültigen Koordinaten (z.B. XYZ: 100 / 64 / -200) im Text finden.', 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-purple-500/40 shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Bedrock Pattern Cracker & Koordinaten-Solver
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MC 1.18–1.21
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Mathematische Rekonstruktion exakter In-Game-Koordinaten aus Bedrock-Formationen
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('grid')}
            className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'grid'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            1. Bedrock-Muster-Scanner (2D-Grid)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('f3')}
            className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'f3'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            2. F3 Debug-Text Parser
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'converter'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            3. Nether ↔ Oberwelt 8:1 Rechner
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'grid' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/90 leading-relaxed flex items-start gap-3">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong>So funktioniert das Bedrock-Cracking:</strong> Klicke auf die Blöcke im
                  Gitter unten, um das Bedrock-Muster (dunkel = Bedrock, hell = Luft/Netherrack)
                  genauso einzustellen, wie du es an deiner Nether-Decke (z. B. Y=125) siehst. Unser
                  Algorithmus durchsucht die Chunks deines Seeds nach exakt diesem Muster!
                </div>
              </div>

              {/* Controls: Layer & Radius */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Layer Selector */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Y-Ebene (Layer):</span>
                    <strong className="text-purple-400">Y: {layer}</strong>
                  </div>
                  <input
                    type="range"
                    min={dimension === 'nether' ? 122 : 0}
                    max={dimension === 'nether' ? 127 : 5}
                    value={layer}
                    onChange={(e) => setLayer(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    {layer >= 120 ? 'Nether-Decke' : 'Bedrock-Boden'}
                  </p>
                </div>

                {/* Grid Size */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Mustergröße:</span>
                    <strong className="text-cyan-400">{gridSize}x{gridSize} Blöcke</strong>
                  </div>
                  <div className="flex gap-2">
                    {[4, 6, 8].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setGridSize(size)}
                        className={`flex-1 py-1 rounded text-xs font-mono cursor-pointer transition-all ${
                          gridSize === size
                            ? 'bg-cyan-500 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {size}x{size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Radius */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Suchradius:</span>
                    <strong className="text-emerald-400">±{searchRadius * 16} Blöcke</strong>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="128"
                    step="8"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 font-mono">
                    {searchRadius} Chunks um Spawn/Mitte
                  </p>
                </div>
              </div>

              {/* Interactive Grid Canvas */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-between w-full max-w-sm text-xs font-mono text-slate-400 px-2">
                  <span>← Westen (-X)</span>
                  <span className="text-rose-400 font-bold">▲ Norden (-Z)</span>
                  <span>Osten (+X) →</span>
                </div>

                <div
                  className="grid gap-1.5 p-3 rounded-2xl bg-neutral-950 border-2 border-purple-500/40 shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {grid.map((row, r) =>
                    row.map((isBedrock, c) => (
                      <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleToggleCell(r, c)}
                        title={`Block (${c}, ${r}): ${isBedrock ? 'Bedrock' : 'Netherrack/Luft'}`}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center font-mono text-[10px] transition-all cursor-pointer select-none ${
                          isBedrock
                            ? 'bg-neutral-900 border-neutral-700 text-purple-300 shadow-sm shadow-black hover:border-purple-400'
                            : 'bg-rose-950/40 border-rose-900/50 text-rose-300 hover:border-rose-500'
                        }`}
                      >
                        {isBedrock ? (
                          <div className="w-full h-full p-1 flex flex-col items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-neutral-700 rounded-sm mb-0.5" />
                            <span className="text-[8px] text-neutral-400">BEDROCK</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-rose-400">LUFT</span>
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleRunSearch}
                    disabled={isSearching}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-950/50 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isSearching ? 'Scanne Chunks...' : 'Seed nach Muster durchsuchen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setGrid(
                        generateBedrockChunkLayer(
                          seed || '8057211',
                          centerChunkX,
                          centerChunkZ,
                          layer,
                          gridSize
                        )
                      )
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Search Matches List */}
              {matches.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Gefundene Chunk-Positionen ({matches.length} Treffer):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              Rang #{idx + 1}
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              {m.matchScore}% Match
                            </span>
                          </div>
                          <p className="font-mono text-sm font-bold text-white mt-1">
                            X: {m.blockX}, Y: {m.blockY}, Z: {m.blockZ}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            Chunk: [{m.chunkX}, {m.chunkZ}]
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyMatch(m)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Wählen</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'f3' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                  F3 Debug Text, Chat oder Teleport-Befehl einfügen
                </label>
                <textarea
                  rows={4}
                  value={f3Input}
                  onChange={(e) => setF3Input(e.target.value)}
                  placeholder="Beispiele:&#10;XYZ: 1240.500 / 125.000 / -340.200&#10;Block: 1240 125 -340&#10;Chunk: 77 7 -22 in r.2.-1.mca&#10;/tp @s 1240 125 -340"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 font-mono text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleParseF3}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>Koordinaten aus Text extrahieren & übernehmen</span>
              </button>
            </div>
          )}

          {activeTab === 'converter' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                <strong>1 Block im Nether entspricht 8 Blöcken in der Oberwelt.</strong> Nutze
                diesen Rechner, um deine Portal-Koordinaten synchron zu halten.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nether Input */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-purple-400">
                    Nether-Koordinaten
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400">Nether X:</label>
                      <input
                        type="number"
                        value={convNetherX}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setConvNetherX(val);
                          setConvOverworldX(val * 8);
                        }}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400">Nether Z:</label>
                      <input
                        type="number"
                        value={convNetherZ}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setConvNetherZ(val);
                          setConvOverworldZ(val * 8);
                        }}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Overworld Input */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-400">
                    Oberwelt-Koordinaten (x8)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400">Oberwelt X:</label>
                      <input
                        type="number"
                        value={convOverworldX}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setConvOverworldX(val);
                          setConvNetherX(Math.floor(val / 8));
                        }}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400">Oberwelt Z:</label>
                      <input
                        type="number"
                        value={convOverworldZ}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setConvOverworldZ(val);
                          setConvNetherZ(Math.floor(val / 8));
                        }}
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyCoordinates({
                    x: convNetherX,
                    y: 125,
                    z: convNetherZ,
                    explanation: `Aus 8:1 Portal-Umrechnung (Oberwelt X: ${convOverworldX}, Z: ${convOverworldZ} → Nether X: ${convNetherX}, Z: ${convNetherZ}).`,
                  });
                  onShowToast(`Nether-Koordinaten übernommen: X: ${convNetherX}, Y: 125, Z: ${convNetherZ}`, 'success');
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>Nether-Koordinaten [X: {convNetherX}, Y: 125, Z: {convNetherZ}] übernehmen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
