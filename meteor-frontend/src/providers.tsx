'use client'

import { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from './lib/wallet';
import { Toaster, useToast } from './components/ui/toaster';
import { useWalletAuth } from './hooks/useWalletAuth';
import { api } from './lib/api';
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
  const { address, isConnected } = useWalletAuth();
  // useWalletAuth handles everything automatically
  return null;
}

// Toast registrar - connects global api toasts to local toast store
function ToastRegistrar() {
  const { toast } = useToast();
  
  useEffect(() => {
    api.setToastCallback((message, variant) => {
      toast(message, variant);
    });
  }, [toast]);
  
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthInitializer />
          <ToastRegistrar />
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}