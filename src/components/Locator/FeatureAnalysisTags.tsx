import React from 'react';
import { Tag, Sparkles, CheckCircle, Info } from 'lucide-react';
import { AnalysisFeature } from '../../types/locator';

interface FeatureAnalysisTagsProps {
  features: AnalysisFeature[];
  confidence: number;
  timeOfDay?: string;
  cloudDirection?: string;
}

export const FeatureAnalysisTags: React.FC<FeatureAnalysisTagsProps> = ({
  features,
  confidence,
  timeOfDay,
  cloudDirection,
}) => {
  if (!features || features.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">Detected Features</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Analysis confidence</span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {confidence.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Feature Badges Grid */}
      <div className="flex flex-wrap gap-2">
        {features.map((feat) => {
          let badgeStyle = 'bg-slate-800 text-slate-200 border-slate-700';

          if (feat.category === 'biome') {
            badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
          } else if (feat.category === 'structure') {
            badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
          } else if (feat.category === 'geology') {
            badgeStyle = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30';
          } else if (feat.category === 'flora') {
            badgeStyle = 'bg-green-950/60 text-green-300 border-green-500/30';
          } else if (feat.category === 'celestial') {
            badgeStyle = 'bg-yellow-950/60 text-yellow-300 border-yellow-500/30';
          } else if (feat.category === 'elevation') {
            badgeStyle = 'bg-purple-950/60 text-purple-300 border-purple-500/30';
          }

          return (
            <span
              key={feat.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${badgeStyle} shadow-sm transition-transform hover:scale-105`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {feat.name}
              {feat.confidence ? (
                <span className="text-[10px] opacity-70 font-mono">({feat.confidence}%)</span>
              ) : null}
            </span>
          );
        })}
      </div>

      {/* Environmental Context Details */}
      {(timeOfDay || cloudDirection) && (
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-400">
          {timeOfDay && (
            <div>
              <span className="text-slate-500">Lighting / Time: </span>
              <span className="text-slate-300 font-medium">{timeOfDay}</span>
            </div>
          )}
          {cloudDirection && (
            <div>
              <span className="text-slate-500">Cloud Drift: </span>
              <span className="text-slate-300 font-medium font-mono">{cloudDirection}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
