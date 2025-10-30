/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { syncService, type ConnectionStatus } from "@/lib/sync-service"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface OfflineToggleProps {
  variant?: "sidebar" | "header"
  showLabel?: boolean
  hide?: boolean
}

/**
 * OfflineToggle
 * Componente que maneja el alternador de offline
 */
export function OfflineToggle({ variant = "sidebar", showLabel = true, hide = false }: OfflineToggleProps) {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isManual, setIsManual] = useState(false)

  // Si hide es true, no renderizar nada
  if (hide) {
    return null
  }

  useEffect(() => {
    // Listener para cambios de estado
    const listener = {
      onStatusChange: (newStatus: ConnectionStatus) => {
        console.log('🔔 OfflineToggle: Cambio de estado detectado:', newStatus)
        setStatus(newStatus)
      },
      onSyncStart: () => {
        setIsSyncing(true)
      },
      onSyncComplete: (success: boolean) => {
        setIsSyncing(false)
        console.log(success ? '✅ Sincronización exitosa' : '⚠️ Sincronización con errores')
      },
    }

    syncService.addListener(listener)
    const currentStatus = syncService.getStatus()
    const currentManual = syncService.isManualOffline()
    
    console.log('🎯 OfflineToggle: Estado inicial -', { status: currentStatus, isManual: currentManual })
    setStatus(currentStatus)
    setIsManual(currentManual)

    return () => {
      syncService.removeListener(listener)
    }
  }, [])

  const handleToggle = async () => {
    await syncService.toggleManualOffline()
    setIsManual(syncService.isManualOffline())
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600 dark:text-green-400'
      case 'offline':
        return 'text-red-600 dark:text-red-400'
      case 'checking':
        return 'text-yellow-600 dark:text-yellow-400'
    }
  }

  const getStatusText = () => {
    // Siempre "Modo Offline" cuando no hay conexión (manual o automático)
    if (isManual || status === 'offline') return 'Modo Offline'
    
    switch (status) {
      case 'online':
        return 'En Línea'
      case 'checking':
        return 'Verificando...'
      default:
        return 'Modo Offline'
    }
  }

  const getTooltipText = () => {
    if (isManual) {
      return 'Modo offline activado manualmente. Click para volver online.'
    }
    switch (status) {
      case 'online':
        return 'Conectado. Click para activar modo offline.'
      case 'offline':
        return 'Sin conexión. Los cambios se guardarán localmente.'
      case 'checking':
        return 'Verificando conexión...'
    }
  }

  // Variante para Sidebar (Desktop)
  if (variant === "sidebar") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={status === 'offline' || isManual ? "destructive" : status === 'online' ? "default" : "secondary"}
              size="sm"
              onClick={handleToggle}
              disabled={status === 'checking'}
              className={cn(
                "w-full justify-start gap-2 relative",
                status === 'checking' && "opacity-50 cursor-not-allowed"
              )}
            >
              {status === 'online' ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              {showLabel && (
                <span className="text-sm font-medium">{getStatusText()}</span>
              )}
              
              {/* Indicador de sincronización */}
              {isSyncing && (
                <RefreshCw className="h-3 w-3 animate-spin ml-auto" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{getTooltipText()}</p>
            {isSyncing && <p className="text-xs text-muted-foreground mt-1">Sincronizando datos...</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Variante para Header (Tablet/Mobile)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={status === 'checking'}
            className={cn(
              "relative",
              status === 'checking' && "opacity-50 cursor-not-allowed"
            )}
          >
            {status === 'online' ? (
              <Wifi className={cn("h-5 w-5", getStatusColor())} />
            ) : (
              <WifiOff className={cn("h-5 w-5", getStatusColor())} />
            )}
            
            {/* Indicador de modo manual */}
            {isManual && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-background" />
            )}
            
            {/* Indicador de sincronización */}
            {isSyncing && (
              <span className="absolute -bottom-1 -right-1">
                <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
