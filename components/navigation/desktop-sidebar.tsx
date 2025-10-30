/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Building2, LogOut, BarChart3, Users, Building } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardSection } from "@/components/context/dashboard-section-context"
import { OfflineToggle } from "@/components/offline/offline-toggle"

const navItems = [
  {
    section: "report" as const,
    label: "Reporte",
    icon: BarChart3,
    roles: ["user"],
  },
  {
    section: "orders" as const,
    label: "Pedidos",
    icon: ShoppingCart,
    roles: ["user"],
  },
  {
    section: "providers" as const,
    label: "Proveedores",
    icon: Building2,
    roles: ["user"],
  },
  {
    section: "users" as const,
    label: "Usuarios",
    icon: Users,
    roles: ["admin"],
  },
  {
    section: "sucursales" as const,
    label: "Sucursales",
    icon: Building,
    roles: ["admin"],
  },
]

export function DesktopSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { activeSection, setActiveSection } = useDashboardSection()
  const [branchName, setBranchName] = useState<string>("")

  const hideOfflineToggle = activeSection === 'users' || activeSection === 'sucursales'

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  useEffect(() => {
    if (!user?.branch) {
      setBranchName("")
      return
    }
    
    try {
      const stored = localStorage.getItem('Ferreteria_user')
      if (stored) {
        const storedUser = JSON.parse(stored)
        setBranchName(storedUser?.branch?.name || "")
      }
    } catch (err) {
      setBranchName("")
      console.error("Error getting branch from localStorage:", err)
    }
  }, [user?.branch])

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Ferreteria" className="h-10 md:h-12 lg:h-14 w-auto" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            if (!user?.role || !item.roles.includes(user.role)) {
              return null
            }

            const Icon = item.icon
            const isActive = activeSection === item.section

            return (
              <button
                key={item.label}
                type="button"
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                )}
                onClick={() => setActiveSection(item.section)}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Información del usuario y cierre de sesión */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Alternador de Offline */}
        <OfflineToggle variant="sidebar" showLabel={true} hide={hideOfflineToggle} />
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">{user?.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              Ferretería: {branchName || "—"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="w-full bg-transparent">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
