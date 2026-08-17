import React from 'react';
import { Upload, Sparkles, ArrowRight, ShieldCheck, Cpu, Map, Navigation } from 'lucide-react';

interface HeroProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onUploadClick, onDemoClick }) => {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-grid-pattern">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-blue-500/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Workflow steps pill */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs sm:text-sm font-mono text-slate-300 shadow-xl shadow-black/40 mb-8 backdrop-blur-md">
          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Screenshot
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-300 font-medium">World Analysis</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-emerald-300 font-semibold">Coordinate Detection</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Find Your Minecraft <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
            Coordinates
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-normal">
          Upload a screenshot, provide your world seed, and let BlockLocator determine where you are.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <button
            onClick={onUploadClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 shadow-xl shadow-emerald-950/60 border border-emerald-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <Upload className="w-4 h-4 text-white group-hover:-translate-y-0.5 transition-transform" />
            <span>Upload Screenshot</span>
          </button>
          
          <button
            onClick={onDemoClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/40 shadow-lg shadow-black/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Try Demo</span>
          </button>
        </div>

        {/* Value Props & Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Zero Hallucination</p>
              <p className="text-[11px] text-slate-400">Honest confidence scores</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Bedrock & Java</p>
              <p className="text-[11px] text-slate-400">1.21.x generation parity</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Celestial Vectoring</p>
              <p className="text-[11px] text-slate-400">Sun & cloud direction</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/70 backdrop-blur-sm flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Interactive Map</p>
              <p className="text-[11px] text-slate-400">Instant /tp command</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
