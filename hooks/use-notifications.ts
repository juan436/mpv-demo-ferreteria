/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import { notificationService, type Notification } from "@/services/notification.service"

/**
 * useNotifications
 * Hook personalizado para manejar notificaciones
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setNotifications((prev) => [...prev, notification])

      // Auto remove after duration
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, notification.duration)
    })

    return unsubscribe
  }, [])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return {
    notifications,
    removeNotification,
  }
}
