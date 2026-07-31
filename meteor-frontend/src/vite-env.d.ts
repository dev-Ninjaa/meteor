/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_WS_URL: string;
    readonly VITE_WALLETCONNECT_PROJECT_ID: string;
    readonly VITE_ESCROW_CONTRACT_ADDRESS: string;
    readonly VITE_ENABLE_AI_VERIFICATION: string;
    readonly VITE_ENABLE_MANUAL_VERIFICATION: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  interface Window {
    ethereum?: any;
  }
}

export {};