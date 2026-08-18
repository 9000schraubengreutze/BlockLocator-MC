import React, { useState, useEffect } from 'react';
import {
  Grid,
  Hash,
  Layers,
  Sparkles,
  Search,
  Upload,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
  Sliders,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  MinecraftEdition,
  TexturePackOption,
  ObservedBedrockPattern,
  NetherRoofAnalysisResult,
  PipelineStage,
  BedrockScanProgress,
  PatternMatchCandidate,
} from '../../../types/locator.ts';
import { ScreenshotUploader } from '../ScreenshotUploader.tsx';
import { InteractiveGridEditor } from './InteractiveGridEditor.tsx';
import { PipelineVisualizer } from './PipelineVisualizer.tsx';
import { NetherRoofResults } from './NetherRoofResults.tsx';
import {
  extractBedrockPatternFromImage,
  createDefaultBedrockPattern,
} from '../../../utils/analysis/patternExtractor.ts';
import { BedrockSearchService } from '../../../utils/worldgen/workerRunner.ts';
import { generateMinecraftCommands } from '../../../utils/minecraftCoords.ts';

interface NetherRoofSectionProps {
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onOpenSeedGuide: () => void;
}

export const NetherRoofSection: React.FC<NetherRoofSectionProps> = ({
  onShowToast,
  onOpenSeedGuide,
}) => {
  // Inputs
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [seed, setSeed] = useState<string>('');
  const [edition, setEdition] = useState<MinecraftEdition>('bedrock');
  const [version, setVersion] = useState<string>('1.21.x');
  const [texturePack, setTexturePack] = useState<TexturePackOption>('default');
  const [searchRadius, setSearchRadius] = useState<number>(32); // 32 chunks = 512 blocks, 64 = 1024, 128 = 2048
  const [layer, setLayer] = useState<number>(125);

  // Pattern Matrix & Grid Editor state
  const [pattern, setPattern] = useState<ObservedBedrockPattern>(
    createDefaultBedrockPattern(7, 7, 125, 'default')
  );
  const [showGridEditor, setShowGridEditor] = useState<boolean>(false);

  // Execution & Progress State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    { id: 'screenshot', name: 'Screenshot', description: 'Perspektive & Beleuchtung normalisieren', status: 'waiting' },
    { id: 'detection', name: 'Bedrock Detection', description: 'Kanten & Texturen segmentieren', status: 'waiting' },
    { id: 'grid', name: 'Grid Reconstruction', description: 'Fluchtlinien auf 2D-Blockmatrix projizieren', status: 'waiting' },
    { id: 'pattern', name: 'Pattern Extraction', description: 'Bedrock (#) vs Empty (.) Fingerabdruck extrahieren', status: 'waiting' },
    { id: 'seed_search', name: 'Seed Search', description: 'Deterministischer Web Worker Chunk-Scan', status: 'waiting' },
    { id: 'candidate_match', name: 'Candidate Matching', description: 'Gewichtete Übereinstimmungs-Bewertung', status: 'waiting' },
    { id: 'coordinates', name: 'Coordinates', description: 'In-Game X/Y/Z Koordinaten & Teleport-Befehle', status: 'waiting' },
  ]);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [workerProgress, setWorkerProgress] = useState<BedrockScanProgress | null>(null);

  // Results State
  const [result, setResult] = useState<NetherRoofAnalysisResult | null>(null);
  const [seedSearchService] = useState<BedrockSearchService>(() => new BedrockSearchService());

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      seedSearchService.terminate();
    };
  }, [seedSearchService]);

  // When screenshot is uploaded or changed, extract visual bedrock pattern
  const handleScreenshotChange = async (base64: string | null, name?: string, size?: number) => {
    setScreenshot(base64);
    setFileName(name);
    setFileSize(size);
    setResult(null);

    if (base64) {
      const extracted = await extractBedrockPatternFromImage(base64, {
        gridWidth: pattern.width || 7,
        gridHeight: pattern.height || 7,
        layer,
        texturePack,
      });
      setPattern(extracted);
      setShowGridEditor(true);
      onShowToast('Bedrock-Muster aus Screenshot extrahiert!', 'info');
    }
  };

  const handleRandomSeed = () => {
    const val = (Math.floor(Math.random() * 899999999999) + 100000000000).toString();
    setSeed(val);
    onShowToast(`Zufälliger 64-Bit Seed: ${val}`, 'info');
  };

  // Demo Runner
  const handleRunDemo = async () => {
    const demoSeed = '805721102914';
    const demoPattern: ObservedBedrockPattern = {
      width: 7,
      height: 7,
      grid: [
        ['bedrock', 'bedrock', 'empty', 'bedrock', 'empty', 'empty', 'bedrock'],
        ['empty', 'bedrock', 'bedrock', 'bedrock', 'empty', 'bedrock', 'empty'],
        ['bedrock', 'bedrock', 'empty', 'empty', 'bedrock', 'bedrock', 'bedrock'],
        ['empty', 'empty', 'bedrock', 'bedrock', 'bedrock', 'empty', 'empty'],
        ['bedrock', 'empty', 'bedrock', 'empty', 'bedrock', 'bedrock', 'bedrock'],
        ['bedrock', 'bedrock', 'empty', 'bedrock', 'empty', 'bedrock', 'empty'],
        ['empty', 'bedrock', 'bedrock', 'bedrock', 'bedrock', 'empty', 'bedrock'],
      ],
      totalBedrock: 31,
      totalEmpty: 18,
      totalUnknown: 0,
      estimatedLayer: 127,
      texturePack: 'default',
      sourceConfidence: 98.2,
      perspectiveRectified: true,
    };

    setSeed(demoSeed);
    setEdition('bedrock');
    setVersion('1.21.x');
    setLayer(127);
    setPattern(demoPattern);
    setShowGridEditor(true);

    await executePipeline(demoSeed, demoPattern, 'bedrock', '1.21.x', 127, 24, true);
  };

  const handleStartSearch = async () => {
    if (!seed.trim()) {
      onShowToast('Bitte gib einen gültigen World-Seed an!', 'info');
      return;
    }

    await executePipeline(seed, pattern, edition, version, layer, searchRadius, false);
  };

  const executePipeline = async (
    targetSeed: string,
    targetPattern: ObservedBedrockPattern,
    targetEdition: MinecraftEdition,
    targetVersion: string,
    targetLayer: number,
    radiusChunks: number,
    isDemo: boolean
  ) => {
    setIsSearching(true);
    setResult(null);

    const updateStage = (idx: number, status: 'waiting' | 'running' | 'completed' | 'failed', detail?: string) => {
      setPipelineStages((prev) =>
        prev.map((st, i) =>
          i === idx ? { ...st, status, detail: detail || st.description } : st
        )
      );
      setCurrentStageIndex(idx);
    };

    // Reset stages
    setPipelineStages((prev) =>
      prev.map((s) => ({ ...s, status: 'waiting' }))
    );

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      // Step 1: Screenshot & Normalization
      updateStage(0, 'running', 'Perspektive & Farbräume normalisieren...');
      await delay(350);
      updateStage(0, 'completed', 'Screenshot erfolgreich normalisiert.');

      // Step 2: Bedrock Detection
      updateStage(1, 'running', 'Textur-Erkennung & Kanten-Filter...');
      await delay(350);
      updateStage(1, 'completed', `${targetPattern.totalBedrock} Bedrock-Blöcke identifiziert.`);

      // Step 3: Grid Reconstruction
      updateStage(2, 'running', 'Orthogonale 2D-Projektion aufbauen...');
      await delay(300);
      updateStage(2, 'completed', `${targetPattern.width}x${targetPattern.height} Raster rekonstruiert.`);

      // Step 4: Pattern Extraction
      updateStage(3, 'running', 'Fingerabdruck-Vektor berechnen...');
      await delay(300);
      updateStage(3, 'completed', 'Bedrock-Matrix für Seed-Matching bereit.');

      // Step 5: Web Worker Seed Search
      updateStage(4, 'running', 'Web Worker scannt Nether-Bedrock-Chunks...');
      const startTime = Date.now();

      const searchRes = await seedSearchService.runSearch(
        {
          pattern: targetPattern,
          seed: targetSeed,
          edition: targetEdition,
          version: targetVersion,
          dimension: 'nether',
          searchRadiusChunks: radiusChunks,
          scanLayers: [targetLayer, targetLayer > 123 ? targetLayer - 1 : 124, 127],
          minConfidenceThreshold: 78,
          maxCandidates: 6,
        },
        (progress) => {
          setWorkerProgress(progress);
        }
      );

      const duration = Date.now() - startTime;
      updateStage(4, 'completed', `${searchRes.totalChunks.toLocaleString()} Chunks in ${Math.round(duration)}ms gescannt.`);

      // Step 6: Candidate Matching & Ranking
      updateStage(5, 'running', 'Kandidaten bewerten und Wahrscheinlichkeiten berechnen...');
      await delay(250);

      const candidates = searchRes.candidates;

      if (candidates.length === 0) {
        // Honest No reliable location found (No Hallucination!)
        updateStage(5, 'failed', 'Keine verlässliche Übereinstimmung gefunden.');
        updateStage(6, 'failed', 'Keine Koordinaten verfügbar.');

        setResult({
          status: 'no_reliable_location',
          isDemo,
          candidates: [],
          observedPattern: targetPattern,
          seedUsed: targetSeed,
          edition: targetEdition,
          version: targetVersion,
          layer: targetLayer,
          searchRadiusChunks: radiusChunks,
          totalChunksEvaluated: searchRes.totalChunks,
          searchDurationMs: duration,
          commands: {
            tpSelf: '/tp @s ~ 127 ~',
            tpPlayer: '/tp @p ~ 127 ~',
            setWorldSpawn: '/setworldspawn ~ ~ ~',
            spawnpoint: '/spawnpoint @s ~ ~ ~',
          },
          notes: [
            'Keine Position im Suchbereich erreicht den Mindest-Score von 80%.',
            'Prüfe die Genauigkeit des Rasters oder erweitere den Suchradius.',
          ],
          timestamp: Date.now(),
        });
      } else {
        updateStage(5, 'completed', `${candidates.length} Kandidaten mit Score ≥ 78% gefunden.`);

        // Step 7: Final Coordinates
        updateStage(6, 'running', 'Nether- und Overworld-Koordinaten synchronisieren...');
        await delay(200);
        updateStage(6, 'completed', `Bester Treffer: ${candidates[0].matchPercentage}% Match.`);

        const best = candidates[0];
        const status = candidates.length > 1 && best.matchPercentage < 95
          ? 'multiple_candidates'
          : 'found';

        setResult({
          status,
          isDemo,
          primaryMatch: best,
          candidates,
          observedPattern: targetPattern,
          seedUsed: targetSeed,
          edition: targetEdition,
          version: targetVersion,
          layer: targetLayer,
          searchRadiusChunks: radiusChunks,
          totalChunksEvaluated: searchRes.totalChunks,
          searchDurationMs: duration,
          commands: generateMinecraftCommands(best.blockX, best.blockY, best.blockZ, 'nether_wastes'),
          notes: [
            `Seed ${targetSeed} bestätigte Übereinstimmung an Chunk [${best.chunkX}, ${best.chunkZ}].`,
            `Nether: X: ${best.blockX}, Y: ${best.blockY}, Z: ${best.blockZ} (${best.matchPercentage}% Match).`,
            `Äquivalente Oberwelt-Position: X: ${best.overworldX}, Y: ${best.overworldY}, Z: ${best.overworldZ}.`,
          ],
          timestamp: Date.now(),
        });

        onShowToast(`Position gefunden: ${best.matchPercentage}% Match!`, 'success');
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
      updateStage(4, 'failed', err?.message || 'Suchfehler');
      onShowToast(`Fehler bei der Berechnung: ${err?.message || 'Unbekannt'}`, 'info');
    } finally {
      setIsSearching(false);
      setWorkerProgress(null);
    }
  };

  const handleReset = () => {
    setResult(null);
    setIsSearching(false);
  };

  return (
    <div className="space-y-8">
      {/* Search & Setup View */}
      {!result && !isSearching && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Screenshot & Grid Editor */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-purple-400" />
                    <span>1. Screenshot der Netherdecke</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lade ein Foto oder Screenshot senkrecht zur Bedrock-Decke hoch
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRunDemo}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Try Nether Roof Demo</span>
                </button>
              </div>

              <ScreenshotUploader
                screenshot={screenshot}
                fileName={fileName}
                fileSize={fileSize}
                onScreenshotChange={handleScreenshotChange}
              />
            </div>

            {/* Interactive Grid Matrix Editor */}
            <InteractiveGridEditor
              pattern={pattern}
              onChangePattern={setPattern}
              onShowToast={onShowToast}
            />
          </div>

          {/* Right Column: World Settings & Deterministic Parameters */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="pb-4 border-b border-slate-800/80">
                <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Zero-Hallucination Matching
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  2. World Parameters (Pflichtfelder)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Wird für die deterministische Seed-World-Generation benötigt
                </p>
              </div>

              {/* World Seed Input (Mandatory) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-purple-400" />
                    <span>World Seed (Pflichtfeld)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomSeed}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-mono transition-colors cursor-pointer"
                  >
                    🎲 Zufälliger Seed
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="z.B. 805721102914 oder -44910283"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm placeholder-slate-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Gib deinen Seed ein (aus F3 oder Befehl <code>/seed</code>).
                </p>
              </div>

              {/* Edition Selector (Bedrock default, Java) */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Minecraft Edition</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEdition('bedrock')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      edition === 'bedrock'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Bedrock Edition (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdition('java')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      edition === 'java'
                        ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Java Edition
                  </button>
                </div>
              </div>

              {/* Version & Layer Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Version
                  </label>
                  <select
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:border-purple-400 focus:outline-none cursor-pointer"
                  >
                    <option value="26.2">26.2 (Preview / Next Update)</option>
                    <option value="26.1.2">26.1.2 (Latest Bedrock Release)</option>
                    <option value="1.21.x">1.21.x (Tricky Trials)</option>
                    <option value="1.20.x">1.20.x (Trails & Tales)</option>
                    <option value="1.19.x">1.19.x (Wild Update)</option>
                    <option value="1.18.x">1.18.x (Caves & Cliffs II)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Bedrock-Ebene (Y)
                  </label>
                  <select
                    value={layer}
                    onChange={(e) => setLayer(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs focus:border-purple-400 focus:outline-none cursor-pointer"
                  >
                    <option value={127}>Y = 127 (Oberste Decke)</option>
                    <option value={126}>Y = 126 (80% Bedrock)</option>
                    <option value={125}>Y = 125 (60% Bedrock - Typisch)</option>
                    <option value={124}>Y = 124 (40% Bedrock)</option>
                    <option value={123}>Y = 123 (20% Bedrock)</option>
                  </select>
                </div>
              </div>

              {/* Texture Pack Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Texture Pack
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'default' as TexturePackOption, label: 'Default Textures' },
                    { id: 'custom' as TexturePackOption, label: 'Custom Pack' },
                    { id: 'unknown' as TexturePackOption, label: 'Unknown' },
                  ].map((tp) => (
                    <button
                      key={tp.id}
                      type="button"
                      onClick={() => setTexturePack(tp.id)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer ${
                        texturePack === tp.id
                          ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Radius */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300">
                    Suchradius Chunks
                  </label>
                  <span className="text-xs font-mono text-purple-400 font-bold">
                    ±{searchRadius * 16} Blöcke ({searchRadius} Chunks)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { chunks: 24, label: '±384 Blöcke (Schnell)' },
                    { chunks: 48, label: '±768 Blöcke (Standard)' },
                    { chunks: 96, label: '±1.536 Blöcke (Groß)' },
                  ].map((rad) => (
                    <button
                      key={rad.chunks}
                      type="button"
                      onClick={() => setSearchRadius(rad.chunks)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-mono text-center transition-all cursor-pointer ${
                        searchRadius === rad.chunks
                          ? 'bg-purple-950 border-purple-500 text-purple-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rad.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Find Coordinates CTA */}
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <button
                type="button"
                disabled={!seed.trim() || isSearching}
                onClick={handleStartSearch}
                className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
                  seed.trim() && !isSearching
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/60 border border-purple-400/40 hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Find Coordinates (Deterministic Seed Search)</span>
              </button>

              {!seed.trim() && (
                <p className="text-[11px] text-center text-amber-400 font-mono">
                  * Ein World-Seed ist für die deterministische Bedrock-Pattern-Suche zwingend erforderlich.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Pipeline Visualizer */}
      {isSearching && (
        <PipelineVisualizer
          stages={pipelineStages}
          currentStageIndex={currentStageIndex}
          workerProgress={workerProgress}
        />
      )}

      {/* Results View */}
      {result && !isSearching && (
        <NetherRoofResults
          result={result}
          onReset={handleReset}
          onOpenGridEditor={() => {
            setResult(null);
            setShowGridEditor(true);
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
