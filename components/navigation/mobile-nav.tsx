/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useDashboardSection } from "@/components/context/dashboard-section-context"
import { ShoppingCart, Building2, BarChart3, Users, Building } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatarMenu } from "@/components/ui/user-avatar-menu"
import { useAuth } from "@/hooks/use-auth"
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

/**
 * MobileNav
 * Componente que maneja la navegación móvil
 */
export function MobileNav() {
  const { user } = useAuth()
  const { activeSection, setActiveSection } = useDashboardSection()

  const hideOfflineToggle = activeSection === 'users' || activeSection === 'sucursales'

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Ferreteria" className="h-9 md:h-10 w-auto" />
          </div>

          <div className="flex items-center gap-2">
            <OfflineToggle variant="header" showLabel={false} hide={hideOfflineToggle} />
            <UserAvatarMenu />
          </div>
        </div>
      </header>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
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
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors",
                  isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
                onClick={() => setActiveSection(item.section)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
