// Base HTTP client with auth, error handling, auto-refresh, global toasts
import { authApi } from './index';

type ToastCallback = (message: string, variant: 'default' | 'success' | 'destructive') => void;

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private toastCallback: ToastCallback | null = null;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1') {
    this.baseUrl = baseUrl;
    // Initialize from localStorage on creation
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  /** Register global toast callback (call once from app root) */
  setToastCallback(cb: ToastCallback) {
    this.toastCallback = cb;
  }

  private showToast(message: string, variant: 'default' | 'success' | 'destructive' = 'default') {
    if (this.toastCallback) {
      this.toastCallback(message, variant);
    }
  }

  setToken(token: string | null) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
    const body = options.body;
    const isFormData = body instanceof FormData;
    
    const headers: HeadersInit = isFormData 
      ? { ...options.headers }  // Let browser set Content-Type with boundary
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

    // Handle 401 - attempt silent re-auth
    if (response.status === 401 && retry && !endpoint.includes('/auth/')) {
      const newToken = await this.refreshAuth();
      if (newToken) {
        // Retry with new token
        return this.request(endpoint, options, false);
      }
      // Refresh failed - clear token and throw
      this.setToken(null);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      const message = error.message || 'Request failed';
      
      // Global error toast for failed requests (excluding some endpoints)
      const isAuthEndpoint = endpoint.includes('/auth/');
      const isHealthEndpoint = endpoint.includes('/health');
      if (!isAuthEndpoint && !isHealthEndpoint) {
        this.showToast(Array.isArray(message) ? message.join(', ') : message, 'destructive');
      }
      
      throw new ApiError(response.status, message);
    }

    // Global success toast for mutating requests (POST, PATCH, DELETE)
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(method)) {
      const isAuthEndpoint = endpoint.includes('/auth/');
      if (!isAuthEndpoint) {
        this.showToast('Success', 'success');
      }
    }

    const text = await response.text();
    return text ? JSON.parse(text) : undefined as T;
  }

  private async refreshAuth(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshAuth();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshAuth(): Promise<string | null> {
    // Preferred path: silent refresh using the stored refresh token.
    // Only fall back to SIWE (full wallet re-login) when the refresh token
    // is missing or has expired.
    const refreshToken = this.getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await authApi.refresh({ refreshToken });
        const accessToken = refreshResponse?.data?.accessToken;
        const newRefreshToken = refreshResponse?.data?.refreshToken;

        if (accessToken) {
          this.setToken(accessToken);
          // Backend rotates the refresh token on every refresh - persist it.
          if (newRefreshToken && typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          return accessToken;
        }
      } catch (error) {
        console.warn('Token refresh failed, falling back to wallet re-auth:', error);
      }
    }

    // Fallback: full SIWE re-auth (wallet signature prompt).
    // Uses siweLogin (single-flight) so the wallet-connect flow and this
    // fallback share ONE nonce+signature+verify instead of racing each other.
    try {
      // Dynamic imports to avoid circular deps
      const { siweLogin } = await import('../wallet');
      
      const address = this.getStoredAddress();
      
      if (!address) {
        console.warn('No wallet address available for re-auth');
        return null;
      }

      // Ensure address is valid hex format for viem
      const walletAddress = address.startsWith('0x') ? address as `0x${string}` : `0x${address}` as `0x${string}`;
      const result = await siweLogin(walletAddress);
      return result?.accessToken ?? null;
    } catch (error) {
      console.error('Silent re-auth failed:', error);
      return null;
    }
  }

  private getStoredAddress(): string | null {
    // Try to get from localStorage (set when wallet connects)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress');
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  get<T>(url: string, params?: Record<string, string | number | boolean | undefined>) {
    const query = params
      ? `?${new URLSearchParams(Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
        ).toString()}`
      : '';
    return this.request<T>(`${url}${query}`);
  }

  post<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'POST',
      body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });
  }

  patch<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  delete<T>(url: string, body?: unknown) {
    return this.request<T>(url, {
      method: 'DELETE',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Singleton instance
export const api = new ApiClient();