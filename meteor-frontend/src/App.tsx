import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
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
import { TaskDetailModalWrapper } from './components/marketplace/TaskDetailModalWrapper';
import { ManualVerificationModal } from './components/marketplace/ManualVerificationModal';

// Landing page component
const LandingPage: React.FC = () => (
  <>
    <HeroSection />
    <CapabilitiesSection />
    <VisionSection />
    <HowItWorksSection />
    <WhyNowSection />
    <WhatCanYouAskSection />
    <OpenSourceSection />
  </>
);

// App layout with navbar - for /app/* routes
const AppLayout: React.FC = () => (
  <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-body selection:bg-[#836EF9]/30 selection:text-white relative">
    <Navbar />
    <main className="w-full pt-20">
      <Outlet />
    </main>
    <CreateTaskModal />
    <InteractiveSolverModal />
    <TaskDetailModalWrapper />
    <ManualVerificationModal />
    <Toasts />
  </div>
);

// Landing layout - no navbar wallet button
const LandingLayout: React.FC = () => (
  <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-body selection:bg-[#836EF9]/30 selection:text-white relative">
    <Navbar />
    <main className="w-full">
      <Outlet />
    </main>
    <Toasts />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page - no wallet button */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
        
        {/* App routes - with wallet button in navbar */}
        <Route path="/app/*" element={<AppLayout />}>
          <Route path="marketplace" element={<MarketplaceView />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="wallet" element={<WalletView />} />
          <Route path="profile" element={<ProfileView />} />
        </Route>
        
        {/* Redirect old routes to new ones */}
        <Route path="marketplace" element={<Navigate to="/app/marketplace" replace />} />
        <Route path="dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="wallet" element={<Navigate to="/app/wallet" replace />} />
        <Route path="profile" element={<Navigate to="/app/profile" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;