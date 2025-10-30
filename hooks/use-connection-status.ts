/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import { syncService } from "@/lib/sync-service"

/**
 * Hook para obtener el estado de conexión (online/offline)
 */
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Obtener estado inicial
    const initialStatus = syncService.getStatus()
    setIsOnline(initialStatus === 'online')

    // Escuchar cambios de estado
    const listener = {
      onStatusChange: (status: 'online' | 'offline' | 'checking') => {
        setIsOnline(status === 'online')
      },
    }

    syncService.addListener(listener)

    return () => {
      syncService.removeListener(listener)
    }
  }, [])

  return { isOnline }
}
