"use client";

import React, { useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingStats } from './LandingStats';
import { LandingFeatures } from './LandingFeatures';
import { LandingModulesShowcase } from './LandingModulesShowcase';
import { LandingPricing } from './LandingPricing';
import { LandingTestimonials } from './LandingTestimonials';
import { LandingFAQ } from './LandingFAQ';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';
import { LandingLoginModal } from './LandingLoginModal';

export function LandingClientWrapper() {
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      <LandingNavbar
        onOpenLogin={() => setLoginModalOpen(true)}
        isAuthenticated={isAuthenticated}
      />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingModulesShowcase />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />

      <LandingLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
