/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import type { AuthUser, LoginCredentials } from "@/types"
import { authService } from "@/services/auth.service"

/**
 * useAuth
 * Hook personalizado para manejar autenticación
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true)
    try {
      const authUser = await authService.login(credentials)
      if (authUser) {
        setUser(authUser)
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
