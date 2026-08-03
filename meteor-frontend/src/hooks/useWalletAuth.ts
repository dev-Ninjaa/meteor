// Wallet auth hook - bridges RainbowKit connection → SIWE auth
import { useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from './useAuth';
import { signInWithEthereum } from '../lib/wallet';
import { api } from '../lib/api';

export function useWalletAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { login, initializeAuth, getToken } = useAuth();
  const authAttempted = useRef(false);
  const lastAuthAddress = useRef<string | null>(null);

  // The SIWE auth function - defined first so effects can use it
  const doAuth = useCallback(async () => {
    if (!address || authAttempted.current || lastAuthAddress.current === address) return;
    
    authAttempted.current = true;
    
    try {
      console.log('[useWalletAuth] Starting SIWE auth for:', address);
      
      // Check if we already have a valid token
      const token = getToken();
      if (token) {
        console.log('[useWalletAuth] Token already exists, setting on api client');
        api.setToken(token);
        return;
      }

      // Perform SIWE authentication
      console.log('[useWalletAuth] Calling signInWithEthereum...');
      const { signature } = await signInWithEthereum(address as `0x${string}`);
      console.log('[useWalletAuth] Got signature, calling login mutation...');
      
      // Backend expects walletAddress and signature (nonce is stored in DB)
      await login.mutateAsync({
        walletAddress: address,
        signature,
      });
      
      lastAuthAddress.current = address;
      console.log('[useWalletAuth] SIWE auth successful!');
    } catch (error) {
      console.error('[useWalletAuth] SIWE auth failed:', error);
      authAttempted.current = false; // Allow retry on error
    }
  }, [address, login, getToken]);

  // Initialize API client token on mount
  useEffect(() => {
    console.log('[useWalletAuth] Initializing auth from localStorage');
    initializeAuth();
  }, [initializeAuth]);

  // Store wallet address for re-auth when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (address) {
        console.log('[useWalletAuth] Storing wallet address:', address);
        localStorage.setItem('walletAddress', address);
        api.setToken(getToken() || null);
      } else {
        console.log('[useWalletAuth] Removing wallet address');
        localStorage.removeItem('walletAddress');
        api.setToken(null);
        authAttempted.current = false; // Reset on disconnect
        lastAuthAddress.current = null;
      }
    }
  }, [address, getToken]);

  // Trigger SIWE auth when wallet connects (address changes)
  useEffect(() => {
    console.log('[useWalletAuth] State changed:', { address, isConnected, isConnecting });
    
    if (!isConnected || !address || isConnecting) return;

    doAuth();
  }, [address, isConnected, isConnecting, doAuth]);

  return { address, isConnected };
}