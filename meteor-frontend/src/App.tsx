import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/layout/Navbar';
import { Toasts } from './components/layout/Toasts';
import { HeroSection } from './components/landing/HeroSection';
import { CapabilitiesSection } from './components/landing/CapabilitiesSection';
import { VisionSection } from './components/landing/VisionSection';
import { HowItWorksSection } from './components/landing/HowItWorksSection';
import { WhyNowSection } from './components/landing/WhyNowSection';
import { WhatCanYouAskSection } from './components/landing/WhatCanYouAskSection';
import { OpenSourceSection } from './components/landing/OpenSourceSection';

import { MarketplaceView } from './features/marketplace/MarketplaceView';
import { DashboardView } from './features/dashboard/DashboardView';
import { WalletView } from './features/wallet/WalletView';
import { ProfileView } from './features/profile/ProfileView';

import { CreateTaskModal } from './components/marketplace/CreateTaskModal';
import { InteractiveSolverModal } from './components/marketplace/InteractiveSolverModal';

export const App: React.FC = () => {
  const { activeTab } = useAppStore();

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-body selection:bg-[#836EF9]/30 selection:text-white relative">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="w-full">
        {activeTab === 'landing' && (
          <>
            <HeroSection />
            <CapabilitiesSection />
            <VisionSection />
            <HowItWorksSection />
            <WhyNowSection />
            <WhatCanYouAskSection />
            <OpenSourceSection />
          </>
        )}

        {activeTab === 'marketplace' && <MarketplaceView />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'wallet' && <WalletView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Interactive Global Modals */}
      <CreateTaskModal />
      <InteractiveSolverModal />

      {/* Toast Notification System */}
      <Toasts />
    </div>
  );
};

export default App;
