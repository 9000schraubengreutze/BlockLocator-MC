import React from 'react';
import { Layers, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { CoordinateCandidate } from '../../types/locator';

interface MultipleCandidatesProps {
  candidates: CoordinateCandidate[];
  selectedCandidateId: string;
  onSelectCandidate: (candidate: CoordinateCandidate) => void;
}

export const MultipleCandidates: React.FC<MultipleCandidatesProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
}) => {
  if (!candidates || candidates.length <= 1) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Possible Locations
          <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
            {candidates.length} Plausible Matches
          </span>
        </h4>
        <span className="text-[11px] text-slate-400">Click to switch active location</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {candidates.map((cand) => {
          const isSelected = cand.id === selectedCandidateId;

          return (
            <button
              key={cand.id}
              type="button"
              onClick={() => onSelectCandidate(cand)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-200">
                  Candidate #{cand.rank}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    cand.confidence >= 90
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : cand.confidence >= 80
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {cand.confidence.toFixed(1)}%
                </span>
              </div>

              {/* Coordinates block */}
              <div className="space-y-0.5 font-mono text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">X:</span>
                  <span className="font-bold text-slate-100">{cand.x}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Y:</span>
                  <span className="font-bold text-slate-100">{cand.y}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Z:</span>
                  <span className="font-bold text-slate-100">{cand.z}</span>
                </div>
              </div>

              {/* Sub-info */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[130px]">{cand.biome}</span>
                <div className="flex items-center gap-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <Compass className="w-3 h-3" />
                  <span className="text-[10px] font-mono">{cand.facing}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
