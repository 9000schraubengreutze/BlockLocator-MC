import React from 'react';
import { Compass, Flame, Grid, Eye, Sparkles } from 'lucide-react';
import { AnalysisMode } from '../../types/locator.ts';

interface AnalysisModeSelectorProps {
  currentMode: AnalysisMode;
  onSelectMode: (mode: AnalysisMode) => void;
}

export const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: {
    id: AnalysisMode;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    isHighlighted?: boolean;
    badge?: string;
  }[] = [
    {
      id: 'nether_roof_pattern',
      label: 'Nether Roof – Bedrock Pattern',
      sublabel: 'Deterministic Seed Pattern Cracker (Zero-Hallucination)',
      icon: Grid,
      accentColor: 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-purple-950/50',
      isHighlighted: true,
      badge: 'Seed Solver',
    },
    {
      id: 'overworld',
      label: 'Overworld',
      sublabel: 'Biomes, Mountains, River Crossings & Sun Vectors',
      icon: Compass,
      accentColor: 'border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-emerald-950/50',
    },
    {
      id: 'nether',
      label: 'Nether (Terrain)',
      sublabel: 'Fortresses, Bastions, Lava Sea & Soul Valleys',
      icon: Flame,
      accentColor: 'border-rose-500 bg-rose-500/10 text-rose-300 shadow-rose-950/50',
    },
    {
      id: 'the_end',
      label: 'The End',
      sublabel: 'End Cities, Chorus Plants & Island Outer Void',
      icon: Eye,
      accentColor: 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300 shadow-fuchsia-950/50',
    },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <span>Analysis Mode</span>
          <span className="text-[10px] text-slate-500 font-normal">
            (Select specialized geolocation algorithm)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group ${
                isActive
                  ? `${mode.accentColor} shadow-lg ring-1 ring-white/10`
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80 hover:text-slate-200'
              }`}
            >
              {mode.badge && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                    {mode.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className={`p-2 rounded-xl border transition-colors ${
                    isActive
                      ? 'bg-slate-950 border-current shadow-inner'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-100 pr-12">
                  {mode.label}
                </h4>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {mode.sublabel}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
