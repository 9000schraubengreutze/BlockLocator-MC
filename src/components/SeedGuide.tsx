import React, { useState } from 'react';
import { BookOpen, Gamepad2, Laptop, Monitor, Compass, Sun, Wind, ChevronDown, ChevronUp } from 'lucide-react';

export const SeedGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bedrock' | 'java'>('bedrock');

  return (
    <section id="seed-guide" className="py-20 bg-slate-950/80 border-t border-slate-900 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Field Guide
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How to Find Your Seed & Align Coordinates
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Simple steps to retrieve world seeds and orientation clues from in-game environmental cues.
          </p>
        </div>

        {/* Edition Switcher */}
        <div className="flex justify-center mb-8">
          <div className="p-1 bg-slate-900 border border-slate-800 rounded-2xl inline-flex">
            <button
              onClick={() => setActiveTab('bedrock')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bedrock'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bedrock Edition (Console, Win, Mobile)
            </button>
            <button
              onClick={() => setActiveTab('java')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'java'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Java Edition (PC / Mac / Linux)
            </button>
          </div>
        </div>

        {/* Guide Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Step Instructions Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              {activeTab === 'bedrock' ? 'Retrieving Bedrock Seed' : 'Retrieving Java Seed'}
            </h3>

            {activeTab === 'bedrock' ? (
              <ol className="list-decimal list-inside space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="leading-relaxed">
                  <strong className="text-white">Method 1 (Settings):</strong> Pause your game → Click <strong>Settings</strong> → In the <strong>Game</strong> tab, scroll down to the <strong>Seed</strong> field.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Method 2 (Chat command):</strong> If cheats or operator permissions are enabled, open chat and type <code className="text-emerald-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">/seed</code>.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">World Selection:</strong> You can also view the seed on the World Select menu by clicking the pencil (Edit) icon next to your world name.
                </li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="leading-relaxed">
                  <strong className="text-white">Method 1 (Command):</strong> Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded font-mono">T</kbd> or <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded font-mono">/</kbd> and enter <code className="text-emerald-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">/seed</code>. The seed will be printed in green and can be clicked to copy.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Method 2 (F3 Debug screen):</strong> Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-200 rounded font-mono">F3</kbd> in singleplayer to inspect biome names, light levels, facing direction, and camera pitch.
                </li>
              </ol>
            )}
          </div>

          {/* Orientation Tips Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              Celestial & Compass Rules
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <Wind className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Clouds Always Drift West</p>
                  <p className="text-xs text-slate-400 mt-0.5">In Minecraft, blocky clouds always travel precisely towards the <strong>West (-X)</strong> direction.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Sun & Moon Trajectory</p>
                  <p className="text-xs text-slate-400 mt-0.5">The sun and moon rise in the <strong>East (+X)</strong> and set in the <strong>West (-X)</strong>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <Compass className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Sea Level is Always Y = 62 / 63</p>
                  <p className="text-xs text-slate-400 mt-0.5">Overworld ocean and major river water surfaces are fixed at block level 62.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
