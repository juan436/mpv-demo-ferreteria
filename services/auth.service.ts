/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { AuthUser, LoginCredentials } from "@/types"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
    role: "admin" | "user"
    branch: { _id: string; name: string } | null
  }
}

interface RegisterData {
  email: string
  name: string
  password: string
  role: "admin" | "user"
  branch: string
}

/**
 * AuthService
 * Servicio de autenticación con login, registro y gestión de perfil
 */
class AuthService {
  private readonly AUTH_STORAGE_KEY = "Ferreteria_auth"
  private readonly USER_STORAGE_KEY = "Ferreteria_user"

  async login(credentials: LoginCredentials): Promise<AuthUser | null> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)

      // Store auth data
      if (typeof window !== "undefined") {
        localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(response))
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(response.user))
      }

      // Convertir a AuthUser (branch como string para compatibilidad)
      return {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        branch: response.user.branch?._id || "",
      }
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
  }

  async register(data: RegisterData): Promise<AuthUser | null> {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, data)

      // Store auth data
      if (typeof window !== "undefined") {
        localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(response))
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(response.user))
      }

      // Convertir a AuthUser (branch como string para compatibilidad)
      return {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        branch: response.user.branch?._id || "",
      }
    } catch (error) {
      console.error("Register error:", error)
      return null
    }
  }

  async getProfile(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ userId: string; email: string; role: "admin" | "user" }>(
        API_ENDPOINTS.AUTH.PROFILE,
      )
      // Try to enrich with stored user (name/branch)
      let storedUser: { name?: string; branch?: string } | null = null
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.USER_STORAGE_KEY)
        storedUser = stored ? JSON.parse(stored) : null
      }

      return {
        id: response.userId,
        email: response.email,
        name: storedUser?.name || "",
        role: response.role,
        branch: storedUser?.branch || "",
      }
    } catch (error) {
      console.error("Get profile error:", error)
      return null
    }
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.AUTH_STORAGE_KEY)
      localStorage.removeItem(this.USER_STORAGE_KEY)
    }
  }

  getCurrentUser(): AuthUser | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.USER_STORAGE_KEY)
      if (!stored) return null
      
      const user = JSON.parse(stored)
      // Convertir formato backend a AuthUser
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branch: user.branch?._id || user.branch || "",
      }
    }
    return null
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.AUTH_STORAGE_KEY)
      if (stored) {
        const auth = JSON.parse(stored)
        return auth.access_token || null
      }
    }
    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getToken() !== null
  }
}

export const authService = new AuthService()
