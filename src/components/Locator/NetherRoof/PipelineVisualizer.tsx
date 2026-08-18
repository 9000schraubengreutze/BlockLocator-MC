import React from 'react';
import {
  Image as ImageIcon,
  Scan,
  Grid,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
} from 'lucide-react';
import { PipelineStage, BedrockScanProgress } from '../../../types/locator.ts';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  currentStageIndex: number;
  workerProgress?: BedrockScanProgress | null;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  stages,
  currentStageIndex,
  workerProgress,
}) => {
  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            Deterministic Pipeline Execution
          </div>
          <h3 className="text-lg font-bold text-white">
            Seed-basierte Bedrock-Pattern-Suche
          </h3>
        </div>

        {workerProgress && workerProgress.isScanning && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Multi-Threaded Web Worker Active</span>
          </div>
        )}
      </div>

      {/* Pipeline Step Flow (Horizontal on wide, vertical on mobile) */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const isCurrent = idx === currentStageIndex;
          const isCompleted = stage.status === 'completed';
          const isRunning = stage.status === 'running';
          const isFailed = stage.status === 'failed';
          const isWaiting = stage.status === 'waiting';

          return (
            <div
              key={stage.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isRunning
                  ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-950/40 ring-1 ring-purple-400/30'
                  : isCompleted
                  ? 'bg-slate-950/60 border-emerald-500/30'
                  : isFailed
                  ? 'bg-rose-950/40 border-rose-500/40'
                  : 'bg-slate-950/30 border-slate-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Step number / icon badge */}
                <div
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                    isRunning
                      ? 'bg-purple-600 text-white animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isFailed
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isFailed ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">
                      {stage.name}
                    </h4>
                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isRunning
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isFailed
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {stage.detail || stage.description}
                  </p>
                </div>
              </div>

              {/* Special live counter inside Seed Search step */}
              {stage.id === 'seed_search' && workerProgress && isRunning && (
                <div className="sm:text-right shrink-0 bg-slate-900/90 p-2.5 rounded-xl border border-purple-500/30">
                  <p className="text-[11px] font-mono text-purple-300 font-bold">
                    Scanned: {workerProgress.chunksScanned.toLocaleString()} Chunks
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Best Match: <span className="text-emerald-400 font-bold">{workerProgress.bestMatchPercentage}%</span> • ETA: {workerProgress.estimatedTimeRemaining}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Web Worker Live Telemetry Card */}
      {workerProgress && workerProgress.isScanning && (
        <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs text-purple-200">
            <span className="font-bold flex items-center gap-1.5">
              <Scan className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              Scanning Nether Bedrock Chunks...
            </span>
            <span>{workerProgress.percentage}% complete</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-purple-500/30">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-150"
              style={{ width: `${Math.max(4, workerProgress.percentage)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-950/70 border border-purple-500/20">
              <span className="text-slate-500 block">Chunks Scanned</span>
              <span className="font-bold text-slate-200">
                {workerProgress.chunksScanned.toLocaleString()}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-purple-500/20">
              <span className="text-slate-500 block">Candidates</span>
              <span className="font-bold text-amber-300">
                {workerProgress.candidatesFound}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-purple-500/20">
              <span className="text-slate-500 block">Best Match</span>
              <span className="font-bold text-emerald-400">
                {workerProgress.bestMatchPercentage}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/70 border border-purple-500/20">
              <span className="text-slate-500 block">Estimated Time</span>
              <span className="font-bold text-cyan-300">
                {workerProgress.estimatedTimeRemaining}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
