/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"

export type DashboardSection = "report" | "orders" | "providers" | "users" | "sucursales"

interface DashboardSectionContextValue {
  activeSection: DashboardSection
  setActiveSection: (s: DashboardSection) => void
}

const DashboardSectionContext = createContext<DashboardSectionContextValue | undefined>(undefined)

/**
 * DashboardSectionProvider
 * Componente proveedor que maneja la sección activa del dashboard
 */
export function DashboardSectionProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [activeSection, setActiveSection] = useState<DashboardSection | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!loading && user && !isInitialized) {
      const defaultSection: DashboardSection = user.role === "admin" ? "users" : "orders"
      setActiveSection(defaultSection)
      setIsInitialized(true)
    }
  }, [loading, user, isInitialized])

  const handleSetActiveSection = (section: DashboardSection) => {
    setActiveSection(section)
  }

  const value = useMemo(
    () => ({ 
      activeSection: activeSection || "orders", 
      setActiveSection: handleSetActiveSection 
    }), 
    [activeSection]
  )

  if (!activeSection) {
    return null
  }

  return <DashboardSectionContext.Provider value={value}>{children}</DashboardSectionContext.Provider>
}

/**
 * useDashboardSection
 * Hook personalizado para acceder al contexto de la sección activa del dashboard
 */
export function useDashboardSection() {
  const ctx = useContext(DashboardSectionContext)
  if (!ctx) throw new Error("useDashboardSection must be used within DashboardSectionProvider")
  return ctx
}
