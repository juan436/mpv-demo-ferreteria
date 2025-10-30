/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

export type NotificationType = "success" | "error" | "warning" | "info"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
}

/**
 * NotificationService
 * Servicio de notificaciones para mostrar notificaciones toast
 */
class NotificationService {
  private listeners: ((notification: Notification) => void)[] = []

  subscribe(callback: (notification: Notification) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  private notify(notification: Omit<Notification, "id">) {
    const fullNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      duration: notification.duration || 5000,
    }

    this.listeners.forEach((listener) => listener(fullNotification))
  }

  success(title: string, message?: string, duration?: number) {
    this.notify({ type: "success", title, message, duration })
  }

  error(title: string, message?: string, duration?: number) {
    this.notify({ type: "error", title, message, duration })
  }

  warning(title: string, message?: string, duration?: number) {
    this.notify({ type: "warning", title, message, duration })
  }

  info(title: string, message?: string, duration?: number) {
    this.notify({ type: "info", title, message, duration })
  }
}

export const notificationService = new NotificationService()
