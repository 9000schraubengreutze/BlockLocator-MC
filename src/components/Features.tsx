import React from 'react';
import { Hash, Eye, Navigation, Terminal, Layers, ShieldCheck, Sparkles, Map } from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      title: 'Seed Analysis',
      desc: 'Use your Minecraft world seed to improve location accuracy.',
      icon: Hash,
      color: 'emerald',
    },
    {
      title: 'Screenshot Recognition',
      desc: 'Analyze terrain, structures and visual landmarks.',
      icon: Eye,
      color: 'cyan',
    },
    {
      title: 'Coordinate Detection',
      desc: 'Get X, Y and Z coordinates.',
      icon: Navigation,
      color: 'purple',
    },
    {
      title: 'Minecraft Commands',
      desc: 'Generate ready-to-use /tp commands.',
      icon: Terminal,
      color: 'amber',
    },
    {
      title: 'Multiple Candidates',
      desc: 'See multiple possible locations when the result isn\'t unique.',
      icon: Layers,
      color: 'blue',
    },
    {
      title: 'Bedrock Support',
      desc: 'Optimized for Minecraft Bedrock worlds.',
      icon: ShieldCheck,
      color: 'emerald',
    },
  ];

  return (
    <section id="features" className="py-20 bg-[#090d12] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Capabilities & Tools
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Minecraft Explorers
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Everything you need to recover lost builds, map screenshot locations, and navigate with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1.5 group-hover:text-emerald-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
