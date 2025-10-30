/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useDevice } from "@/hooks/use-device"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { TabletNav } from "@/components/navigation/tablet-nav"
import { DesktopSidebar } from "@/components/navigation/desktop-sidebar"
import { DashboardSectionProvider, useDashboardSection } from "@/components/context/dashboard-section-context"
import { OrdersView } from "@/components/views/orders-view"
import { ReportView } from "@/components/views/report-view"
import { ProvidersView } from "@/components/views/providers-view"
import { UsersView } from "@/components/views/users-view"
import { BranchesView } from "@/components/views/branches-view"

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardContentSwitcher() {
  const { activeSection } = useDashboardSection()
  if (activeSection === "orders") return <OrdersView />
  if (activeSection === "report") return <ReportView />
  if (activeSection === "providers") return <ProvidersView />
  if (activeSection === "users") return <UsersView />
  if (activeSection === "sucursales") return <BranchesView />
  return <ProvidersView />
}

/**
 * DashboardLayout
 * Componente que maneja la lógica del dashboard
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, loading } = useAuth()
  const { deviceType, isMounted } = useDevice()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Mobile Layout
  if (deviceType === "mobile") {
    return (
      <DashboardSectionProvider>
        <div className="h-dvh bg-gradient-to-br from-white to-[#DEE7FF] flex flex-col overflow-hidden">
          <MobileNav />
          <main className="flex-1 overflow-hidden">
            <DashboardContentSwitcher /> 
          </main>
        </div>
      </DashboardSectionProvider>
    )
  }

  // Tablet Layout
  if (deviceType === "tablet") {
    return (
      <DashboardSectionProvider>
        <div className="h-dvh bg-gradient-to-br from-white to-[#E5E7EB] flex flex-col overflow-hidden">
          <TabletNav />
          <main className="flex-1 overflow-hidden p-4">
            <DashboardContentSwitcher />
          </main>
        </div>
      </DashboardSectionProvider>
    )
  }

  // Desktop Layout
  return (
    <DashboardSectionProvider>
      <div className="min-h-screen bg-gradient-to-br from-white to-[#DEE7FF] flex">
        <DesktopSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardContentSwitcher />
        </main>
      </div>
    </DashboardSectionProvider>
  )
}
