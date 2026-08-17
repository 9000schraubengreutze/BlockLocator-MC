import React from 'react';
import { AlertTriangle, HelpCircle, ArrowRight, BookOpen, Hash, RefreshCw, Download } from 'lucide-react';
import { LocatorResult } from '../../types/locator';

interface InconclusiveCardProps {
  result: LocatorResult;
  onRetry: () => void;
  onOpenSeedGuide: () => void;
  onExportReport?: () => void;
}

export const InconclusiveCard: React.FC<InconclusiveCardProps> = ({
  result,
  onRetry,
  onOpenSeedGuide,
  onExportReport,
}) => {
  const isNoSeed = result.status === 'seed_recommended';

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      {/* Header Badge */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-950/40">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {isNoSeed ? 'Seed Required For Exact Coords' : 'Inconclusive Result'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {isNoSeed
              ? 'A world seed is recommended for accurate coordinate detection.'
              : 'Unable to determine an exact location'}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {isNoSeed
              ? 'BlockLocator successfully extracted terrain and celestial markers, but requires your world seed to solve global (X, Y, Z) coordinates.'
              : 'Try providing the world seed, Minecraft version, or additional screenshots with visible terrain landmarks.'}
          </p>
        </div>
      </div>

      {/* Honest Reasoning Breakdown */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
        <p className="font-semibold text-slate-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          Technical Analysis Notes:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          {result.notes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
          <li>Minecraft terrain generation uses pseudo-random noise layers derived from world seeds. Without the seed, absolute coordinate mapping cannot be guaranteed.</li>
        </ul>
      </div>

      {/* Action Guidance */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onOpenSeedGuide}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>How to Find Your Seed in Bedrock</span>
        </button>

        {onExportReport && (
          <button
            type="button"
            onClick={onExportReport}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Analysis JSON</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-2 ml-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Search Again with Seed</span>
        </button>
      </div>
    </div>
  );
};
