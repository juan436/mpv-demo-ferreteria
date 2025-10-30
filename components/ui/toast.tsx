/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { NotificationType } from "@/services/notification.service"

interface ToastProps {
  id: string
  type: NotificationType
  title: string
  message?: string
  onClose: (id: string) => void
}

export function Toast({ id, type, title, message, onClose }: ToastProps) {
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  return (
    <div className={cn("border rounded-lg p-4 shadow-lg", typeStyles[type])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onClose(id)} className="h-6 w-6 p-0 ml-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
