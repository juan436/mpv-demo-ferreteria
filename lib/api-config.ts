/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

/**
 * API Configuration
 * Configuración centralizada de las opciones de la API para la aplicación
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * API Endpoints
 * Endpoints de la API para la aplicación
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
  // Providers
  PROVIDERS: {
    BASE: '/providers',
    BY_ID: (id: string) => `/providers/${id}`,
    SEARCH: '/providers/search',
  },
  // Branches
  BRANCHES: {
    BASE: '/branches',
    BY_ID: (id: string) => `/branches/${id}`,
  },
  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    BY_PROVIDER: (providerId: string) => `/orders/by-provider/${providerId}`,
    BY_BRANCH: (branch: string) => `/orders/by-branch/${branch}`,
    SEND_REPORT: (id: string) => `/orders/${id}/send-report`,
  },
} as const;
