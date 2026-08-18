import React, { useState } from 'react';
import {
  Check,
  Copy,
  Terminal,
  Grid,
  RotateCcw,
  Sparkles,
  MapPin,
  Flame,
  Globe,
  Compass,
  AlertTriangle,
  Info,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  NetherRoofAnalysisResult,
  PatternMatchCandidate,
} from '../../../types/locator.ts';

interface NetherRoofResultsProps {
  result: NetherRoofAnalysisResult;
  onReset: () => void;
  onOpenGridEditor: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const NetherRoofResults: React.FC<NetherRoofResultsProps> = ({
  result,
  onReset,
  onOpenGridEditor,
  onShowToast,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<PatternMatchCandidate | null>(
    result.primaryMatch || (result.candidates.length > 0 ? result.candidates[0] : null)
  );

  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopyCoords = (cand: PatternMatchCandidate) => {
    const text = `${cand.blockX} ${cand.blockY} ${cand.blockZ}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
    onShowToast(`Nether-Koordinaten kopiert: ${text}`, 'success');
  };

  const handleCopyTp = (cand: PatternMatchCandidate) => {
    const cmd = `/tp @s ${cand.blockX} ${cand.blockY} ${cand.blockZ}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
    onShowToast(`Teleport-Befehl kopiert: ${cmd}`, 'success');
  };

  const totalEvaluatedBlocks =
    result.observedPattern.totalBedrock + result.observedPattern.totalEmpty;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Status Alert */}
      {result.isDemo && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-purple-200">
                Nether Roof Demo-Modus (Verifiziertes Referenz-Beispiel)
              </p>
              <p className="text-[11px] text-slate-400">
                Seed {result.seedUsed} • Minecraft {result.edition === 'bedrock' ? 'Bedrock' : 'Java'} {result.version} • Chunks deterministisch via Web Worker berechnet.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shrink-0">
            DEMO
          </span>
        </div>
      )}

      {/* Main Outcome Card */}
      {result.status === 'no_reliable_location' || !selectedCandidate ? (
        /* NO RELIABLE LOCATION FOUND (HONEST ZERO-HALLUCINATION) */
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-2xl font-extrabold text-white">
            No Reliable Location Found
          </h3>

          <p className="max-w-xl mx-auto text-sm text-slate-300 leading-relaxed">
            Innerhalb des durchsuchten Radius ({result.totalChunksEvaluated.toLocaleString()} Chunks)
            konnte kein Bedrock-Muster mit mindestens 80% mathematischer Übereinstimmung für Seed{' '}
            <code className="font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              {result.seedUsed}
            </code>{' '}
            gefunden werden.
          </p>

          <div className="p-4 max-w-lg mx-auto rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs text-slate-400 space-y-2">
            <p className="font-bold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Mögliche Ursachen & nächste Schritte:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stelle sicher, dass der World-Seed und die Edition (Bedrock vs Java) exakt übereinstimmen.</li>
              <li>Prüfe im <strong>Raster-Editor</strong>, ob verdeckte oder unsichere Blöcke als <em>Unknown (?)</em> markiert sind.</li>
              <li>Erhöhe den Suchradius (z. B. auf $\pm 10.000$ Blöcke).</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenGridEditor}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/50"
            >
              <Grid className="w-4 h-4" />
              <span>Raster manuell korrigieren</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Neue Suche starten</span>
            </button>
          </div>
        </div>
      ) : (
        /* LOCATION FOUND / CANDIDATES FOUND */
        <div className="space-y-6">
          {/* Primary Featured Candidate Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/50 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedCandidate.matchPercentage >= 95
                      ? 'Location Found (Exakter Match)'
                      : 'Possible Location Found'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Seed: <span className="text-slate-200 font-bold">{result.seedUsed}</span>
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <span>Nether-Koordinaten</span>
                  <span className="text-sm font-mono font-bold px-3 py-1 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300">
                    {selectedCandidate.matchPercentage}% Match
                  </span>
                </h3>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCopyCoords(selectedCandidate)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow transition-all active:scale-95"
                >
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>{copiedCoords ? 'Kopiert!' : 'Copy Coordinates'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyTp(selectedCandidate)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{copiedCmd ? 'Befehl kopiert!' : 'Copy /tp Command'}</span>
                </button>
              </div>
            </div>

            {/* Coordinates Grid Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-800/80">
              {/* Nether XYZ Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 uppercase">
                    <Flame className="w-4 h-4" />
                    <span>Nether Coordinates (1:8)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Bedrock Pattern: {totalEvaluatedBlocks} blocks
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">X</span>
                    <span className="text-xl sm:text-2xl font-bold text-rose-200">
                      {selectedCandidate.blockX}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Y (Decke)</span>
                    <span className="text-xl sm:text-2xl font-bold text-purple-200">
                      {selectedCandidate.blockY}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Z</span>
                    <span className="text-xl sm:text-2xl font-bold text-rose-200">
                      {selectedCandidate.blockZ}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between px-1">
                  <span>Chunk: [{selectedCandidate.chunkX}, {selectedCandidate.chunkZ}]</span>
                  <span>SubChunk Offset: (+{selectedCandidate.subChunkX}, +{selectedCandidate.subChunkZ})</span>
                </div>
              </div>

              {/* Overworld Equivalent Box */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                    <Globe className="w-4 h-4" />
                    <span>Equivalent Overworld Position (8x)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Portal Sync</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Overworld X</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-200">
                      {selectedCandidate.overworldX}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Overworld Y</span>
                    <span className="text-xl sm:text-2xl font-bold text-slate-300">
                      {selectedCandidate.overworldY}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Overworld Z</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-200">
                      {selectedCandidate.overworldZ}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-400 px-1">
                  Ein Netherportal an ({selectedCandidate.blockX}, {selectedCandidate.blockY}, {selectedCandidate.blockZ}) verbindet zur Oberwelt bei ({selectedCandidate.overworldX}, ~, {selectedCandidate.overworldZ}).
                </p>
              </div>
            </div>

            {/* Bottom Meta & Pattern Verified blocks */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-4">
                <span>
                  Erkannte Bedrock-Blöcke: <strong className="text-purple-300">{selectedCandidate.matchedBedrock}</strong>
                </span>
                <span>
                  Freie Blöcke (Luft): <strong className="text-rose-300">{selectedCandidate.matchedEmpty}</strong>
                </span>
                <span>
                  Suchdauer: <strong className="text-slate-200">{Math.round(result.searchDurationMs)}ms</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenGridEditor}
                className="text-purple-400 hover:text-purple-300 underline cursor-pointer flex items-center gap-1"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>View Pattern & Modify Grid</span>
              </button>
            </div>
          </div>

          {/* Multiple Candidates Ranking List if > 1 */}
          {result.candidates.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Possible Locations ({result.candidates.length} Treffer gefunden)
                </h4>
                <span className="text-xs text-slate-400">
                  Klicke auf einen Kandidaten, um ihn als aktiv zu setzen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.candidates.map((cand) => {
                  const isSelected = selectedCandidate.id === cand.id;

                  return (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer font-mono ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg ring-1 ring-purple-400/40'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-purple-300">
                          #{cand.rank} {isSelected && '• [Aktiv]'}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-purple-500/30 text-emerald-400">
                          {cand.matchPercentage}%
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        <p>X: <strong className="text-slate-100">{cand.blockX}</strong></p>
                        <p>Y: <strong className="text-slate-100">{cand.blockY}</strong></p>
                        <p>Z: <strong className="text-slate-100">{cand.blockZ}</strong></p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Chunk [{cand.chunkX}, {cand.chunkZ}]</span>
                        <span className="text-emerald-400 font-bold">{cand.matchedBedrock} Bedrock</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Search Again</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenGridEditor}
                className="px-5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-2 cursor-pointer shadow transition-colors"
              >
                <Grid className="w-4 h-4 text-purple-400" />
                <span>Adjust Grid & Re-Scan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
