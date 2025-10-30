/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { Toast } from "@/components/ui/toast"
import { useNotifications } from "@/hooks/use-notifications"

/**
 * ToastContainer
 * Componente que maneja la notificación toast
 */
export function ToastContainer() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}
