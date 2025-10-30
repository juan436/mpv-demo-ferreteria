/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import type { Provider } from "@/types"
import { providerService } from "@/services/provider.service"
import { notificationService } from "@/services/notification.service"
import { syncService } from "@/lib/sync-service"

/**
 * useProviders
 * Hook personalizado para manejar proveedores
 */
export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await providerService.getProviders()
      setProviders(data)
    } catch (err) {
      setError("Error al cargar proveedores")
      console.error("Error loading providers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()

    // Escuchar cuando termine la sincronización para refrescar
    const listener = {
      onStatusChange: () => {},
      onSyncComplete: (success: boolean) => {
        if (success) {
          console.log('🔄 Sincronización completa, refrescando proveedores...')
          loadProviders()
        }
      },
    }

    syncService.addListener(listener)

    return () => {
      syncService.removeListener(listener)
    }
  }, [])

  const createProvider = async (name: string, branch?: string): Promise<boolean> => {
    try {
      setError(null)
      const newProvider = await providerService.createProvider(name, branch)
      if (newProvider) {
        setProviders((prev) => [...prev, newProvider])
        notificationService.success(
          "Proveedor creado",
          `El proveedor "${name}" ha sido creado exitosamente.`
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo crear el proveedor. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al crear proveedor"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error creating provider:", err)
      return false
    }
  }

  const updateProvider = async (id: string, name: string): Promise<boolean> => {
    try {
      setError(null)
      const updatedProvider = await providerService.updateProvider(id, name)
      if (updatedProvider) {
        setProviders((prev) => prev.map((p) => (p.id === id ? updatedProvider : p)))
        notificationService.success(
          "Proveedor actualizado",
          `El proveedor "${name}" ha sido actualizado exitosamente.`
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo actualizar el proveedor. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al actualizar proveedor"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error updating provider:", err)
      return false
    }
  }

  const deleteProvider = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await providerService.deleteProvider(id)
      if (success) {
        setProviders((prev) => prev.filter((p) => p.id !== id))
        notificationService.success(
          "Proveedor eliminado",
          "El proveedor ha sido eliminado exitosamente."
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo eliminar el proveedor. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al eliminar proveedor"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error deleting provider:", err)
      return false
    }
  }

  const searchProviders = async (query: string): Promise<Provider[]> => {
    try {
      setError(null)
      return await providerService.searchProviders(query)
    } catch (err) {
      setError("Error al buscar proveedores")
      console.error("Error searching providers:", err)
      return []
    }
  }

  const downloadReport = () => {
    try {
      providerService.downloadReport()
    } catch (err) {
      setError("Error al descargar reporte")
      console.error("Error downloading report:", err)
    }
  }

  const downloadExcelReport = async () => {
    try {
      setError(null)
      await providerService.downloadExcelReport()
      notificationService.success(
        "Reporte generado",
        "El reporte Excel se ha descargado exitosamente."
      )
    } catch (err) {
      const errorMsg = "Error al generar reporte Excel"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error generating Excel report:", err)
    }
  }

  return {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    searchProviders,
    downloadReport,
    downloadExcelReport,
    refresh: loadProviders,
  }
}
