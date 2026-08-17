import React, { useState } from 'react';
import { Hash, Layers, HelpCircle, ChevronDown, ChevronUp, MapPin, Globe, Sparkles } from 'lucide-react';
import { MinecraftEdition, Dimension, KnownCoords } from '../../types/locator';

interface WorldInfoFormProps {
  seed: string;
  onSeedChange: (seed: string) => void;
  edition: MinecraftEdition;
  onEditionChange: (edition: MinecraftEdition) => void;
  version: string;
  onVersionChange: (version: string) => void;
  knownCoords: KnownCoords;
  onKnownCoordsChange: (coords: KnownCoords) => void;
  dimension: Dimension;
  onDimensionChange: (dim: Dimension) => void;
}

export const WorldInfoForm: React.FC<WorldInfoFormProps> = ({
  seed,
  onSeedChange,
  edition,
  onEditionChange,
  version,
  onVersionChange,
  knownCoords,
  onKnownCoordsChange,
  dimension,
  onDimensionChange,
}) => {
  const [showKnownCoords, setShowKnownCoords] = useState(false);
  const [seedHelpOpen, setSeedHelpOpen] = useState(false);

  const handleRandomSeed = () => {
    // Generate a realistic 64-bit style seed
    const randomSeed = Math.floor(Math.random() * 899999999999 + 100000000000).toString();
    onSeedChange(randomSeed);
  };

  const handleCoordChange = (field: 'x' | 'y' | 'z', value: string) => {
    const num = value === '' ? '' : parseInt(value, 10);
    onKnownCoordsChange({
      ...knownCoords,
      [field]: isNaN(num as number) ? '' : num,
    });
  };

  return (
    <div className="space-y-4">
      {/* World Seed Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-emerald-400" />
            World Seed
            <button
              type="button"
              onClick={() => setSeedHelpOpen(!seedHelpOpen)}
              className="text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer"
              title="How to get seed"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomSeed}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Random
            </button>
            {seed && (
              <button
                type="button"
                onClick={() => onSeedChange('')}
                className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={seed}
            onChange={(e) => onSeedChange(e.target.value)}
            placeholder="e.g. -1234567890123456789"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 text-slate-100 placeholder-slate-500 font-mono text-sm transition-all"
          />
          {seed ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              SEED LOADED
            </div>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hidden sm:block">
              RECOMMENDED
            </div>
          )}
        </div>

        {seedHelpOpen && (
          <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-150">
            <p className="font-semibold text-emerald-300">How to find your Seed in Bedrock:</p>
            <p className="text-slate-400">
              Open <strong>Pause Menu → Settings → Game</strong> and scroll down to <strong>Seed</strong>. Or type <code className="text-emerald-300 font-mono bg-slate-800 px-1 py-0.5 rounded">/seed</code> in chat.
            </p>
          </div>
        )}
      </div>

      {/* Edition & Version Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Minecraft Edition Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Minecraft Edition
          </label>
          <div className="relative">
            <select
              value={edition}
              onChange={(e) => onEditionChange(e.target.value as MinecraftEdition)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 text-slate-100 text-sm appearance-none cursor-pointer pr-10 font-medium"
            >
              <option value="bedrock">Bedrock Edition (Console/Win/Mobile)</option>
              <option value="java">Java Edition (PC / Mac)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Minecraft Version Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5">
            Minecraft Version
          </label>
          <div className="relative">
            <select
              value={version}
              onChange={(e) => onVersionChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 text-slate-100 text-sm appearance-none cursor-pointer pr-10 font-mono"
            >
              <option value="26.2">26.2 (Preview / Next Update)</option>
              <option value="26.1.2">26.1.2 (Latest Bedrock Release)</option>
              <option value="1.21.x">1.21.x (Tricky Trials)</option>
              <option value="1.20.x">1.20.x (Trails & Tales)</option>
              <option value="1.19.x">1.19.x (The Wild Update)</option>
              <option value="1.18.x">1.18.x (Caves & Cliffs II)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dimension Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
          Dimension
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onDimensionChange('overworld')}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
              dimension === 'overworld'
                ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Overworld
          </button>

          <button
            type="button"
            onClick={() => onDimensionChange('nether')}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
              dimension === 'nether'
                ? 'bg-rose-950/60 border-rose-500/70 text-rose-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            Nether
          </button>

          <button
            type="button"
            onClick={() => onDimensionChange('the_end')}
            className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
              dimension === 'the_end'
                ? 'bg-purple-950/60 border-purple-500/70 text-purple-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            The End
          </button>
        </div>
      </div>

      {/* Optional Known Coordinates Accordion */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowKnownCoords(!showKnownCoords)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Do you know any coordinates?
              </span>
              <span className="ml-2 text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Optional
              </span>
            </div>
          </div>
          {showKnownCoords ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showKnownCoords && (
          <div className="mt-2 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in duration-150">
            <p className="text-[11px] text-slate-400">
              Provide an approximate base, world spawn, or landmark coordinate (e.g. 0, 70, 0) to accelerate search bounds.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">X</label>
                <input
                  type="number"
                  value={knownCoords.x ?? ''}
                  onChange={(e) => handleCoordChange('x', e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Y</label>
                <input
                  type="number"
                  value={knownCoords.y ?? ''}
                  onChange={(e) => handleCoordChange('y', e.target.value)}
                  placeholder="e.g. 64"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Z</label>
                <input
                  type="number"
                  value={knownCoords.z ?? ''}
                  onChange={(e) => handleCoordChange('z', e.target.value)}
                  placeholder="e.g. -250"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
