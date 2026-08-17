/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LocatorSection } from './components/Locator/LocatorSection';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { SeedGuide } from './components/SeedGuide';
import { Footer } from './components/Footer';
import { DemoPickerModal } from './components/DemoPickerModal';
import { Toast } from './components/Toast';
import { DEMO_PRESETS } from './data/demoPresets';
import { DemoPreset } from './types/locator';

export default function App() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const scrollToLocator = () => {
    const el = document.getElementById('locator');
    if (el) {
      const navHeight = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToSeedGuide = () => {
    const el = document.getElementById('seed-guide');
    if (el) {
      const navHeight = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectPresetFromModal = (preset: DemoPreset) => {
    scrollToLocator();
    // Dispatch event or let uploader take it
    setTimeout(() => {
      // Find preset trigger or load it
      const presetButtons = document.querySelectorAll('button');
      presetButtons.forEach((btn) => {
        if (btn.textContent?.includes(preset.title)) {
          btn.click();
        }
      });
    }, 300);
    showToast(`Loaded demo: ${preset.title}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#090d12] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navigation */}
      <Navbar
        onOpenDemoPicker={() => setDemoModalOpen(true)}
        onScrollToLocator={scrollToLocator}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onUploadClick={scrollToLocator}
          onDemoClick={() => setDemoModalOpen(true)}
        />

        {/* Main Locator Section */}
        <LocatorSection
          onShowToast={showToast}
          onOpenSeedGuide={scrollToSeedGuide}
        />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Features Section */}
        <Features />

        {/* Seed & Alignment Field Guide */}
        <SeedGuide />
      </main>

      {/* Footer */}
      <Footer onScrollToLocator={scrollToLocator} />

      {/* Demo Modal */}
      <DemoPickerModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onSelectPreset={handleSelectPresetFromModal}
      />

      {/* Notification Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
