import React from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { DEMO_PRESETS } from '../data/demoPresets';
import { DemoPreset } from '../types/locator';

interface DemoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const DemoPickerModal: React.FC<DemoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                Explore BlockLocator Demo Scenarios
              </h3>
              <p className="text-xs text-slate-400">
                Select a simulated Minecraft scene to test coordinate detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1">
          {DEMO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="h-28 rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800 relative">
                  <img
                    src={preset.imageThumbnail}
                    alt={preset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                    {preset.badge}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors mb-1">
                  {preset.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                  {preset.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Seed: {preset.seed || 'None'}</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-sans font-semibold">
                  Launch <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
