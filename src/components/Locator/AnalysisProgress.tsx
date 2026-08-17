import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Radar, Search, Compass, Cpu } from 'lucide-react';

interface AnalysisProgressProps {
  onComplete?: () => void;
}

const STAGES = [
  {
    id: 1,
    title: 'Analyzing screenshot...',
    subtext: 'Extracting biome palettes, celestial angles & horizon landmarks',
    icon: Search,
  },
  {
    id: 2,
    title: 'Comparing terrain...',
    subtext: 'Evaluating ridgelines, river contours & elevation layers',
    icon: Radar,
  },
  {
    id: 3,
    title: 'Searching world seed...',
    subtext: 'Correlating with Bedrock world generation algorithm',
    icon: Cpu,
  },
  {
    id: 4,
    title: 'Calculating coordinates...',
    subtext: 'Triangulating X, Y, Z vector & cardinal facing direction',
    icon: Compass,
  },
];

export const AnalysisProgress: React.FC<AnalysisProgressProps> = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentStage(1);
      setProgressPercent(40);
    }, 700);

    const timer2 = setTimeout(() => {
      setCurrentStage(2);
      setProgressPercent(70);
    }, 1500);

    const timer3 = setTimeout(() => {
      setCurrentStage(3);
      setProgressPercent(95);
    }, 2300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
      {/* Background Cartography Scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-12 w-full animate-scanline pointer-events-none" />

      {/* Header with Radar Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radar className="w-5 h-5 animate-spin text-emerald-400" style={{ animationDuration: '4s' }} />
            <div className="absolute inset-0 rounded-xl border border-emerald-400/20 animate-ping" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Locating Player Position
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">Multi-stage Minecraft vision & terrain engine</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono font-bold text-emerald-400">{progressPercent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/60">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stages List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {STAGES.map((stage, idx) => {
          const isDone = currentStage > idx;
          const isCurrent = currentStage === idx;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : isCurrent
                  ? 'bg-slate-800/90 border-emerald-400/60 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${isCurrent ? 'text-emerald-300' : isDone ? 'text-slate-200' : 'text-slate-400'}`}>
                  {stage.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {stage.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
