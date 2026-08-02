'use client'

import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from './lib/wallet';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './hooks/useAuth';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer() {
  const { initializeAuth } = useAuth();
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthInitializer />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}