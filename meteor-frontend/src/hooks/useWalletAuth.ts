// Wallet auth hook - bridges RainbowKit connection → SIWE auth
import { useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAuth } from './useAuth';
import { siweLogin } from '../lib/wallet';
import { api } from '../lib/api';

export function useWalletAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { initializeAuth, getToken } = useAuth();
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

      // Perform SIWE authentication via the single-flight login shared with
      // ApiClient's silent re-auth, so they never race each other's nonce.
      console.log('[useWalletAuth] Calling siweLogin...');
      const result = await siweLogin(address as `0x${string}`);
      if (!result) {
        throw new Error('SIWE login returned no token');
      }
      
      lastAuthAddress.current = address;
      console.log('[useWalletAuth] SIWE auth successful!');
    } catch (error) {
      console.error('[useWalletAuth] SIWE auth failed:', error);
      authAttempted.current = false; // Allow retry on error
    }
  }, [address, getToken]);

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