import React, { useState } from 'react';
import { Sparkles, MapPin, Loader2, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { MinecraftEdition, Dimension, KnownCoords, LocatorResult, DemoPreset, AnalysisMode } from '../../types/locator';
import { ScreenshotUploader } from './ScreenshotUploader';
import { WorldInfoForm } from './WorldInfoForm';
import { AnalysisProgress } from './AnalysisProgress';
import { ResultPanel } from './ResultPanel';
import { AnalysisModeSelector } from './AnalysisModeSelector';
import { NetherRoofSection } from './NetherRoof/NetherRoofSection';
import { DEMO_PRESETS } from '../../data/demoPresets';
import { fallbackAlgorithmicAnalysis } from '../../utils/fallbackAnalyzer';

interface LocatorSectionProps {
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onOpenSeedGuide: () => void;
}

export const LocatorSection: React.FC<LocatorSectionProps> = ({
  onShowToast,
  onOpenSeedGuide,
}) => {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('nether_roof_pattern');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [seed, setSeed] = useState<string>('');
  const [edition, setEdition] = useState<MinecraftEdition>('bedrock');
  const [version, setVersion] = useState<string>('1.21.x');
  const [knownCoords, setKnownCoords] = useState<KnownCoords>({});
  const [dimension, setDimension] = useState<Dimension>('overworld');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<LocatorResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When mode is changed, sync dimension
  const handleSelectMode = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    if (mode === 'overworld') setDimension('overworld');
    else if (mode === 'nether' || mode === 'nether_roof_pattern') setDimension('nether');
    else if (mode === 'the_end') setDimension('the_end');
  };

  // Load a preset directly
  const handleSelectPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setScreenshot(preset.imageThumbnail);
      setFileName(`${preset.id}.png`);
      setFileSize(142 * 1024);
      setSeed(preset.seed);
      setEdition(preset.edition);
      setVersion(preset.version);
      setKnownCoords(preset.knownCoords || {});
      setResult(null);
      onShowToast(`Loaded preset: ${preset.title}`, 'info');
    }
  };

  const handleStartAnalysis = async () => {
    if (!screenshot) return;
    setErrorMsg(null);
    setIsAnalyzing(true);
    setResult(null);

    // Give visual animation minimum ~2.8s for smooth multi-step cartography scanning experience
    const minTimePromise = new Promise((res) => setTimeout(res, 2800));

    try {
      // Call backend API /api/analyze
      const fetchPromise = fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: screenshot,
          seed,
          edition,
          version,
          knownCoords: (knownCoords.x !== undefined && knownCoords.x !== '') || (knownCoords.z !== undefined && knownCoords.z !== '')
            ? knownCoords
            : undefined,
          dimension,
        }),
      }).then(async (res) => {
        if (!res.ok) throw new Error('API server returned error');
        return await res.json();
      });

      const [_, apiResult] = await Promise.all([minTimePromise, fetchPromise]);
      setResult(apiResult);
      onShowToast('Analysis complete!', 'success');
    } catch (err) {
      console.warn('API error or offline fallback, using client-side engine:', err);
      await minTimePromise;
      // Fallback algorithmic analysis
      const fallback = fallbackAlgorithmicAnalysis({
        image: screenshot || undefined,
        seed,
        edition,
        version,
        knownCoords: (knownCoords.x !== undefined && knownCoords.x !== '') || (knownCoords.z !== undefined && knownCoords.z !== '')
          ? (knownCoords as any)
          : undefined,
        dimension,
      });
      setResult(fallback);
      onShowToast('Analysis complete!', 'success');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    window.scrollTo({
      top: document.getElementById('locator')?.offsetTop || 0,
      behavior: 'smooth',
    });
  };

  return (
    <section id="locator" className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-purple-400 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          BlockLocator Analysis Engine
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Minecraft Coordinate Triangulation
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-2">
          Deterministische Seed-Pattern-Suche & Geländekartografie ohne Halluzinationen.
        </p>
      </div>

      {/* Analysis Mode Selector */}
      <AnalysisModeSelector
        currentMode={analysisMode}
        onSelectMode={handleSelectMode}
      />

      {/* Mode 1: Nether Roof – Bedrock Pattern Cracking (Zero Hallucination) */}
      {analysisMode === 'nether_roof_pattern' ? (
        <NetherRoofSection
          onShowToast={onShowToast}
          onOpenSeedGuide={onOpenSeedGuide}
        />
      ) : (
        /* Mode 2: Overworld / Nether / End Terrain & Horizon Locator */
        !result && !isAnalyzing ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Screenshot Upload Area */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between">
              <ScreenshotUploader
                screenshot={screenshot}
                fileName={fileName}
                fileSize={fileSize}
                onScreenshotChange={(base64, name, size) => {
                  setScreenshot(base64);
                  setFileName(name);
                  setFileSize(size);
                }}
                onSelectPreset={handleSelectPreset}
              />
            </div>

            {/* Right Column: World Information & Actions */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="pb-4 border-b border-slate-800/80 mb-5">
                  <h3 className="text-base font-bold text-slate-100">
                    World Information
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Specify world seed and version parameters
                  </p>
                </div>

                <WorldInfoForm
                  seed={seed}
                  onSeedChange={setSeed}
                  edition={edition}
                  onEditionChange={setEdition}
                  version={version}
                  onVersionChange={setVersion}
                  knownCoords={knownCoords}
                  onKnownCoordsChange={setKnownCoords}
                  dimension={dimension}
                  onDimensionChange={setDimension}
                />
              </div>

              {/* Locate Me Action Button */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <button
                  type="button"
                  disabled={!screenshot || isAnalyzing}
                  onClick={handleStartAnalysis}
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl cursor-pointer ${
                    screenshot && !isAnalyzing
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/60 border border-emerald-400/40 hover:scale-[1.01] active:scale-[0.99]'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>Locate Me</span>
                    </>
                  )}
                </button>

                {!screenshot && (
                  <p className="text-[11px] text-center text-slate-400">
                    Please upload a screenshot or pick a demo preset above to activate analysis.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : isAnalyzing ? (
          <AnalysisProgress />
        ) : result ? (
          <ResultPanel
            result={result}
            onReset={handleReset}
            onOpenSeedGuide={onOpenSeedGuide}
            onShowToast={onShowToast}
          />
        ) : null
      )}
    </section>
  );
};

