import React, { useState } from 'react';
import {
  Copy,
  Check,
  Compass,
  Terminal,
  RotateCcw,
  Sparkles,
  MapPin,
  Layers,
  ChevronRight,
  Share2,
  Sliders,
  Download,
  FileJson,
} from 'lucide-react';
import { LocatorResult, CoordinateCandidate, MinecraftEdition } from '../../types/locator';
import { MultipleCandidates } from './MultipleCandidates';
import { WorldMapCanvas } from './WorldMapCanvas';
import { FeatureAnalysisTags } from './FeatureAnalysisTags';
import { CommandsModal } from './CommandsModal';
import { InconclusiveCard } from './InconclusiveCard';
import { BedrockOrientationInspector } from './BedrockOrientationInspector';
import { BedrockGridCrackerModal } from './BedrockGridCrackerModal';
import { exportReportAsJson } from '../../utils/exportReport';
import { calculateChunkInfo, generateMinecraftCommands } from '../../utils/minecraftCoords';

interface ResultPanelProps {
  result: LocatorResult;
  onReset: () => void;
  onOpenSeedGuide: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  onReset,
  onOpenSeedGuide,
  onShowToast,
}) => {
  // If result has multiple candidates, keep track of currently selected active candidate
  const initialCandidate = result.primaryMatch || result.candidates[0];
  const [activeCandidate, setActiveCandidate] = useState<CoordinateCandidate | null>(
    initialCandidate || null
  );
  const [commandsModalOpen, setCommandsModalOpen] = useState(false);
  const [gridCrackerOpen, setGridCrackerOpen] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // If status is seed_recommended or inconclusive without candidates, render the honest informative card
  if (result.status === 'seed_recommended' || result.status === 'inconclusive' || !activeCandidate) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <InconclusiveCard
          result={result}
          onRetry={onReset}
          onOpenSeedGuide={onOpenSeedGuide}
          onExportReport={() => {
            const fileName = exportReportAsJson(result, null);
            onShowToast(`Report exported: ${fileName}`, 'success');
          }}
        />
        {result.features && result.features.length > 0 && (
          <FeatureAnalysisTags
            features={result.features}
            confidence={result.overallConfidence}
            timeOfDay={result.timeOfDay}
            cloudDirection={result.cloudDirection}
          />
        )}
      </div>
    );
  }

  const handleCopyCoords = () => {
    const text = `${activeCandidate.x} ${activeCandidate.y} ${activeCandidate.z}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    onShowToast(`Copied: ${text}`, 'success');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyCommand = () => {
    const cmd = `/tp @s ${activeCandidate.x} ${activeCandidate.y} ${activeCandidate.z}`;
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    onShowToast(`Copied: ${cmd}`, 'success');
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleExportJson = () => {
    setIsExporting(true);
    try {
      const fileName = exportReportAsJson(result, activeCandidate);
      onShowToast(`JSON report downloaded: ${fileName}`, 'success');
    } catch (err) {
      console.error('Failed to export JSON report:', err);
      onShowToast('Failed to generate export file', 'info');
    } finally {
      setTimeout(() => setIsExporting(false), 1500);
    }
  };

  const handleUpdateCandidateCoords = (newCoords: {
    x: number;
    y: number;
    z: number;
    facing: string;
    facingAngleDeg: number;
  }) => {
    if (!activeCandidate) return;
    const updated: CoordinateCandidate = {
      ...activeCandidate,
      x: newCoords.x,
      y: newCoords.y,
      z: newCoords.z,
      facing: newCoords.facing,
      facingAngleDeg: newCoords.facingAngleDeg,
      chunk: calculateChunkInfo(newCoords.x, newCoords.z),
      distanceFromSpawn: Math.round(Math.hypot(newCoords.x, newCoords.z)),
      elevationDescription: `Y: ${newCoords.y}`,
    };
    setActiveCandidate(updated);
  };

  // Determine if bedrock inspection should be active
  const isBedrock =
    Boolean(result.bedrockAnalysis?.isBedrockDetected) ||
    activeCandidate.y >= 120 ||
    activeCandidate.biome.toLowerCase().includes('nether') ||
    result.features.some((f) => f.name.toLowerCase().includes('bedrock'));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Primary Coordinate Hero Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl relative overflow-hidden">
        {/* Background Subtle Gradient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/8 blur-[100px] rounded-full pointer-events-none" />

        {/* Status & Confidence Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {result.status === 'multiple_candidates' ? 'Multiple Candidates' : 'Location Found'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {result.edition.toUpperCase()} {result.version}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Location Found
              </h3>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Confidence</p>
              <p className="text-base font-mono font-bold text-emerald-400">
                {activeCandidate.confidence.toFixed(1)}%
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right flex items-center gap-2.5">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Facing</p>
                <p className="text-base font-semibold text-slate-200">{activeCandidate.facing}</p>
              </div>
              {/* Mini Compass */}
              <div className="relative w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
                <div
                  className="w-4 h-0.5 bg-rose-500 origin-center transition-transform duration-500"
                  style={{ transform: `rotate(${activeCandidate.facingAngleDeg}deg)` }}
                />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 absolute" />
              </div>
            </div>
          </div>
        </div>

        {/* Big Bold Coordinate Display (X, Y, Z) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 my-8">
          {/* X Coordinate */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/40 transition-colors text-center relative group">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              X
            </span>
            <span className="font-mono text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {activeCandidate.x}
            </span>
            <span className="text-[10px] text-slate-500 block mt-2 font-mono">
              East / West
            </span>
          </div>

          {/* Y Coordinate */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/40 transition-colors text-center relative group">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              Y
            </span>
            <span className="font-mono text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {activeCandidate.y}
            </span>
            <span className="text-[10px] text-slate-500 block mt-2 font-mono">
              Elevation / Height
            </span>
          </div>

          {/* Z Coordinate */}
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800/90 hover:border-emerald-500/40 transition-colors text-center relative group">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block mb-1">
              Z
            </span>
            <span className="font-mono text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {activeCandidate.z}
            </span>
            <span className="text-[10px] text-slate-500 block mt-2 font-mono">
              North / South
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Copy Coordinates */}
          <button
            type="button"
            onClick={handleCopyCoords}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedCoords ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCoords ? 'Coordinates Copied' : 'Copy Coordinates'}</span>
          </button>

          {/* Copy Minecraft Command */}
          <button
            type="button"
            onClick={handleCopyCommand}
            className="flex-1 sm:flex-initial px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/40 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {copiedCmd ? <Check className="w-4 h-4 text-white" /> : <Terminal className="w-4 h-4" />}
            <span>{copiedCmd ? 'Command Copied' : 'Copy Minecraft Command'}</span>
          </button>

          {/* Export JSON Report */}
          <button
            type="button"
            onClick={handleExportJson}
            disabled={isExporting}
            className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Download full JSON report containing coordinates, biome, chunks, and detected features"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
          </button>

          {/* Bedrock Grid & F3 Solver Quick Button */}
          <button
            type="button"
            onClick={() => setGridCrackerOpen(true)}
            className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-purple-300 hover:text-purple-200 bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 hover:border-purple-400 transition-all flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Öffne den 2D Bedrock-Pattern-Cracker oder F3 Debug-Text-Parser"
          >
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Bedrock Grid & F3 Solver</span>
          </button>

          {/* More Commands Drawer */}
          <button
            type="button"
            onClick={() => setCommandsModalOpen(true)}
            className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">More Commands</span>
          </button>

          {/* Search Again */}
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-3 rounded-xl font-medium text-xs sm:text-sm text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-800/60 border border-transparent transition-colors flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Search Again</span>
          </button>
        </div>
      </div>

      {/* Multiple Candidates Selection If Present */}
      {result.candidates && result.candidates.length > 1 && (
        <MultipleCandidates
          candidates={result.candidates}
          selectedCandidateId={activeCandidate.id}
          onSelectCandidate={(cand) => {
            setActiveCandidate(cand);
            onShowToast(`Selected Candidate #${cand.rank} (X: ${cand.x}, Z: ${cand.z})`, 'info');
          }}
        />
      )}

      {/* Bedrock Orientation & Direction Inspector */}
      {isBedrock && (
        <BedrockOrientationInspector
          bedrockAnalysis={result.bedrockAnalysis}
          seed={result.seedUsed || ''}
          activeCandidate={activeCandidate}
          dimension={result.bedrockAnalysis?.dimension || (activeCandidate.y >= 120 ? 'nether' : 'overworld')}
          onUpdateCandidateCoords={handleUpdateCandidateCoords}
          onOpenGridCracker={() => setGridCrackerOpen(true)}
          onShowToast={onShowToast}
        />
      )}

      {/* World Map Canvas */}
      <WorldMapCanvas
        candidate={activeCandidate}
        allCandidates={result.candidates}
        onSelectCandidate={(cand) => setActiveCandidate(cand)}
      />

      {/* Screenshot Analysis Tags Breakdown */}
      {result.features && result.features.length > 0 && (
        <FeatureAnalysisTags
          features={result.features}
          confidence={result.overallConfidence}
          timeOfDay={result.timeOfDay}
          cloudDirection={result.cloudDirection}
        />
      )}

      {/* Minecraft Commands Modal */}
      <CommandsModal
        isOpen={commandsModalOpen}
        onClose={() => setCommandsModalOpen(false)}
        commands={result.commands}
        x={activeCandidate.x}
        y={activeCandidate.y}
        z={activeCandidate.z}
        edition={result.edition}
        onCopy={onShowToast}
      />

      {/* Bedrock 2D Grid Cracker & F3 Solver Modal */}
      <BedrockGridCrackerModal
        isOpen={gridCrackerOpen}
        onClose={() => setGridCrackerOpen(false)}
        seed={result.seedUsed || ''}
        dimension={result.bedrockAnalysis?.dimension || (activeCandidate.y >= 120 ? 'nether' : 'overworld')}
        activeCandidate={activeCandidate}
        onApplyCoordinates={(coords) => {
          handleUpdateCandidateCoords({
            x: coords.x,
            y: coords.y,
            z: coords.z,
            facing: activeCandidate.facing,
            facingAngleDeg: activeCandidate.facingAngleDeg,
          });
          onShowToast(`Exakte Koordinaten X: ${coords.x}, Y: ${coords.y}, Z: ${coords.z} angewendet!`, 'success');
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
