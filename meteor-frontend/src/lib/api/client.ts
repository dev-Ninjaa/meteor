// Base HTTP client with auth, error handling
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) { this.accessToken = token; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new ApiError(response.status, error.message || 'Request failed');
    }

    // Handle empty responses (e.g., 204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : undefined as T;
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
      body: body !== undefined ? JSON.stringify(body) : undefined 
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