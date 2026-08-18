import React from 'react';
import {
  Grid,
  RotateCw,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ObservedBedrockPattern,
  BedrockBlockState,
} from '../../../types/locator.ts';
import { rotatePattern90 } from '../../../utils/analysis/patternExtractor.ts';

interface InteractiveGridEditorProps {
  pattern: ObservedBedrockPattern;
  onChangePattern: (newPattern: ObservedBedrockPattern) => void;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const InteractiveGridEditor: React.FC<InteractiveGridEditorProps> = ({
  pattern,
  onChangePattern,
  onShowToast,
}) => {
  const handleCycleCell = (row: number, col: number) => {
    const currentState = pattern.grid[row][col];
    let nextState: BedrockBlockState = 'bedrock';

    if (currentState === 'bedrock') {
      nextState = 'empty';
    } else if (currentState === 'empty') {
      nextState = 'unknown';
    } else {
      nextState = 'bedrock';
    }

    const nextGrid = pattern.grid.map((r, ri) =>
      r.map((val, ci) => (ri === row && ci === col ? nextState : val))
    );

    // Recalculate totals
    let totalBedrock = 0;
    let totalEmpty = 0;
    let totalUnknown = 0;

    nextGrid.forEach((r) => {
      r.forEach((cell) => {
        if (cell === 'bedrock') totalBedrock++;
        else if (cell === 'empty') totalEmpty++;
        else totalUnknown++;
      });
    });

    onChangePattern({
      ...pattern,
      grid: nextGrid,
      totalBedrock,
      totalEmpty,
      totalUnknown,
    });
  };

  const handleResize = (size: number) => {
    const nextGrid: BedrockBlockState[][] = [];
    let totalBedrock = 0;
    let totalEmpty = 0;
    let totalUnknown = 0;

    for (let r = 0; r < size; r++) {
      const row: BedrockBlockState[] = [];
      for (let c = 0; c < size; c++) {
        const existing =
          r < pattern.grid.length && c < pattern.grid[0].length
            ? pattern.grid[r][c]
            : (r + c) % 2 === 0
            ? 'bedrock'
            : 'empty';
        row.push(existing);
        if (existing === 'bedrock') totalBedrock++;
        else if (existing === 'empty') totalEmpty++;
        else totalUnknown++;
      }
      nextGrid.push(row);
    }

    onChangePattern({
      ...pattern,
      width: size,
      height: size,
      grid: nextGrid,
      totalBedrock,
      totalEmpty,
      totalUnknown,
    });
    onShowToast(`Grid resized to ${size}x${size}`, 'info');
  };

  const handleRotate = () => {
    const rotated = rotatePattern90(pattern);
    onChangePattern(rotated);
    onShowToast('Muster um 90° im Uhrzeigersinn gedreht', 'info');
  };

  const handleInvert = () => {
    const nextGrid = pattern.grid.map((r) =>
      r.map((cell) => {
        if (cell === 'bedrock') return 'empty';
        if (cell === 'empty') return 'bedrock';
        return 'unknown';
      })
    );

    let totalBedrock = 0;
    let totalEmpty = 0;
    let totalUnknown = 0;

    nextGrid.forEach((r) => {
      r.forEach((cell) => {
        if (cell === 'bedrock') totalBedrock++;
        else if (cell === 'empty') totalEmpty++;
        else totalUnknown++;
      });
    });

    onChangePattern({
      ...pattern,
      grid: nextGrid,
      totalBedrock,
      totalEmpty,
      totalUnknown,
    });
    onShowToast('Bedrock und Luft-Zustände invertiert', 'info');
  };

  const reliableCount = pattern.totalBedrock + pattern.totalEmpty;
  const isInformationSparse = reliableCount < 12;

  return (
    <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4">
      {/* Header & Size Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Grid className="w-4 h-4 text-purple-400" />
            <span>Manuelle Rasterkorrektur (Bedrock Matrix)</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Klicke auf Felder zum Umschalten: [Bedrock #] → [Empty .] → [Unknown ?]
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Größe:</span>
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            {[5, 7, 9].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleResize(sz)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                  pattern.width === sz
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sz}x{sz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center gap-1.5">
          <div className="w-3 h-3 rounded bg-neutral-950 border border-purple-500 shadow" />
          <span className="text-slate-200 font-bold">Bedrock (#): {pattern.totalBedrock}</span>
        </div>
        <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-center justify-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-900 border border-rose-600" />
          <span className="text-rose-200 font-bold">Empty (.): {pattern.totalEmpty}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-800 border border-slate-600" />
          <span className="text-slate-400 font-bold">Unknown (?): {pattern.totalUnknown}</span>
        </div>
      </div>

      {/* Sparse Warning if too few blocks */}
      {isInformationSparse && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Not enough information:</strong> Das Muster enthält aktuell nur{' '}
            <span className="font-bold underline">{reliableCount} verifizierte Blöcke</span>. Für
            eine eindeutige Seed-Lokalisierung ohne Mehrdeutigkeit werden mindestens 16–25 Blöcke
            empfohlen.
          </div>
        </div>
      )}

      {/* Interactive Grid Canvas */}
      <div className="p-4 rounded-2xl bg-neutral-950 border-2 border-purple-500/30 flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center justify-between w-full max-w-xs text-[10px] font-mono text-slate-500 px-1">
          <span>← West (-X)</span>
          <span className="text-rose-400 font-bold">▲ Nord (-Z)</span>
          <span>Ost (+X) →</span>
        </div>

        <div
          className="grid gap-1.5 p-2 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${pattern.width}, minmax(0, 1fr))`,
          }}
        >
          {pattern.grid.map((row, r) =>
            row.map((cellState, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCycleCell(r, c)}
                title={`Klicke zum Umschalten (Zeile ${r + 1}, Spalte ${c + 1}): ${cellState}`}
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border font-mono text-xs flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-90 ${
                  cellState === 'bedrock'
                    ? 'bg-neutral-950 border-purple-500/60 text-purple-300 shadow-md hover:border-purple-400'
                    : cellState === 'empty'
                    ? 'bg-rose-950/60 border-rose-800/80 text-rose-300 hover:border-rose-500'
                    : 'bg-slate-900 border-dashed border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                {cellState === 'bedrock' && (
                  <>
                    <span className="font-bold text-xs">#</span>
                    <span className="text-[7px] text-purple-400/80">BEDROCK</span>
                  </>
                )}
                {cellState === 'empty' && (
                  <>
                    <span className="font-bold text-xs">.</span>
                    <span className="text-[7px] text-rose-400/80">EMPTY</span>
                  </>
                )}
                {cellState === 'unknown' && (
                  <>
                    <span className="font-bold text-xs">?</span>
                    <span className="text-[7px] text-slate-500">UNK</span>
                  </>
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleRotate}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-purple-400" />
            <span>90° Drehen</span>
          </button>

          <button
            type="button"
            onClick={handleInvert}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Invertieren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
