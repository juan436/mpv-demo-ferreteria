/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { API_CONFIG } from './api-config';

/**
 * ApiError
 * Error personalizado para manejar errores de la API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * ApiClient
 * Cliente HTTP genérico con autenticación y manejo de errores
 */
class ApiClient {
  private baseURL: string;
  private inFlight: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; ts: number }> = new Map();
  private readonly CACHE_TTL_MS = 30_000;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem('Ferreteria_auth');
    if (!stored) return null;
    
    try {
      const auth = JSON.parse(stored);
      return auth.access_token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: Record<string, string> = {
      ...API_CONFIG.HEADERS,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const url = `${this.baseURL}${endpoint}`;

      // Serve from cache for GET
      const method = (config.method || 'GET').toUpperCase();
      if (method === 'GET') {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.ts < this.CACHE_TTL_MS) {
          return cached.data as T;
        }

        const pending = this.inFlight.get(url);
        if (pending) {
          return (await pending) as T;
        }

        const fetchPromise = (async () => {
          const resp = await fetch(url, config);
          const contentType = resp.headers.get('content-type');
          const isJson = contentType?.includes('application/json');
          if (!resp.ok) {
            const error = isJson ? await resp.json() : { message: resp.statusText };
            throw new ApiError(
              error.message || 'An error occurred',
              resp.status,
              error
            );
          }
          if (resp.status === 204 || !isJson) {
            const data = {} as T;
            this.cache.set(url, { data, ts: Date.now() });
            return data;
          }
          const data = (await resp.json()) as T;
          this.cache.set(url, { data, ts: Date.now() });
          return data;
        })();

        this.inFlight.set(url, fetchPromise);
        try {
          const result = await fetchPromise;
          return result as T;
        } finally {
          this.inFlight.delete(url);
        }
      }

      // Non-GET requests (no cache/dedupe)
      const response = await fetch(url, config);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const error = isJson ? await response.json() : { message: response.statusText };
        throw new ApiError(
          error.message || 'An error occurred',
          response.status,
          error
        );
      }

      // Handle empty responses (204 No Content, DELETE operations)
      if (response.status === 204 || !isJson) {
        // Invalidate cache after mutations so next GET sees fresh data
        this.cache.clear();
        return {} as T;
      }

      const data = await response.json();
      // Invalidate cache after mutations so next GET sees fresh data
      this.cache.clear();
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
