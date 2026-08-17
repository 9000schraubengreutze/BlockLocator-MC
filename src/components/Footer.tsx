import React from 'react';
import { Compass, Shield, Github, Heart } from 'lucide-react';

interface FooterProps {
  onScrollToLocator: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToLocator }) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="bg-[#06090d] border-t border-slate-800/80 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-slate-800/80">
          {/* Brand */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">
                Block<span className="text-emerald-400">Locator</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Minecraft Screenshot Geolocation Tool
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-medium">
            <button
              onClick={onScrollToLocator}
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Locator
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('seed-guide')}
              className="text-slate-300 hover:text-emerald-400 transition-colors"
            >
              Seed Guide
            </button>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left leading-relaxed max-w-2xl">
            BlockLocator is an independent community project and is not affiliated with Mojang or Microsoft.
          </p>
          <div className="flex items-center gap-2">
            <span>Bedrock & Java 1.21.x Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
