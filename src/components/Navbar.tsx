import React, { useState, useEffect } from 'react';
import { Compass, Menu, X, Sparkles, MapPin, BookOpen, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenDemoPicker: () => void;
  onScrollToLocator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDemoPicker, onScrollToLocator }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
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
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#090d12]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/40 py-3.5'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-400/40">
            <Compass className="w-5 h-5 text-white animate-pulse-slow" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-sm border-2 border-[#090d12]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Block<span className="text-emerald-400">Locator</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded">
                Bedrock
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Minecraft Geolocation Engine</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/70 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <button
            onClick={onScrollToLocator}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-full transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Locator
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-full transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Features
          </button>
          <button
            onClick={() => scrollTo('seed-guide')}
            className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-full transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Seed Guide
          </button>
        </nav>

        {/* Right Action CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenDemoPicker}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Try Demo
          </button>
          <button
            onClick={onScrollToLocator}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-xl shadow-lg shadow-emerald-950/50 border border-emerald-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            Open Locator
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onScrollToLocator}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
          >
            Locate
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090d12]/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 mt-2 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2">
          <button
            onClick={onScrollToLocator}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 text-left font-medium text-sm"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            Locator App
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 text-left font-medium text-sm"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            How It Works
          </button>
          <button
            onClick={() => scrollTo('features')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 text-left font-medium text-sm"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            Features
          </button>
          <button
            onClick={() => scrollTo('seed-guide')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-200 hover:bg-slate-800/80 text-left font-medium text-sm"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            Seed Guide
          </button>
          <div className="pt-2 border-t border-slate-800/80 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemoPicker();
              }}
              className="flex-1 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Demo Presets
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
