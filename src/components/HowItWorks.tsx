import React from 'react';
import { UploadCloud, Cpu, Compass, ArrowRight, Sun, Layers, ShieldCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Upload a Minecraft screenshot.',
      details: 'Drop your screenshot or paste directly from clipboard. Supports Bedrock and Java screenshots.',
      icon: UploadCloud,
      tag: 'Screenshot Intake',
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'BlockLocator analyzes terrain, structures and visual landmarks.',
      details: 'Evaluates biome foliage palettes, sun/moon azimuth, cloud drift, surface elevation, and structural formations.',
      icon: Cpu,
      tag: 'Vision & Feature Parsing',
    },
    {
      num: '03',
      title: 'Locate',
      desc: 'The system compares the visual data with the Minecraft world and estimates your coordinates.',
      details: 'Correlates visual terrain contours with the world generation seed algorithm to determine exact X, Y, Z coordinates and facing direction.',
      icon: Compass,
      tag: 'Coordinate Triangulation',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-950/60 border-t border-b border-slate-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Methodology & Pipeline
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Combining multi-modal vision parsing with Minecraft procedural terrain mathematics to reverse-engineer player position.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-black text-slate-700 group-hover:text-emerald-400/80 transition-colors">
                    {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400/90 block mb-1">
                    {step.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-200 mb-3">
                    {step.desc}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.details}
                  </p>
                </div>

                {/* Subtle indicator bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                  <div className="w-1/3 group-hover:w-full bg-emerald-500/60 h-full transition-all duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
