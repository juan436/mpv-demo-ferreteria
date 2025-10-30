/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

"use client"

import { useState, useEffect } from "react"
import type { Branch } from "@/types"
import { branchService } from "@/services/branch.service"
import { notificationService } from "@/services/notification.service"

/**
 * useBranches
 * Hook personalizado para manejar sucursales
 */
export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await branchService.getBranches()
      setBranches(data)
    } catch (err) {
      setError("Error al cargar sucursales")
      console.error("Error loading branches:", err)
    } finally {
      setLoading(false)
    }
  }

  const createBranch = async (name: string): Promise<boolean> => {
    try {
      setError(null)
      const newBranch = await branchService.createBranch(name)
      if (newBranch) {
        setBranches((prev) => [...prev, newBranch])
        notificationService.success(
          "Sucursal creada",
          `La sucursal "${name}" ha sido creada exitosamente.`
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo crear la sucursal. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al crear sucursal"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error creating branch:", err)
      return false
    }
  }

  const updateBranch = async (id: string, name: string): Promise<boolean> => {
    try {
      setError(null)
      const updatedBranch = await branchService.updateBranch(id, name)
      if (updatedBranch) {
        setBranches((prev) => prev.map((b) => (b.id === id ? updatedBranch : b)))
        notificationService.success(
          "Sucursal actualizada",
          `La sucursal "${name}" ha sido actualizada exitosamente.`
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo actualizar la sucursal. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al actualizar sucursal"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error updating branch:", err)
      return false
    }
  }

  const deleteBranch = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await branchService.deleteBranch(id)
      if (success) {
        setBranches((prev) => prev.filter((b) => b.id !== id))
        notificationService.success(
          "Sucursal eliminada",
          "La sucursal ha sido eliminada exitosamente."
        )
        return true
      }
      notificationService.error(
        "Error",
        "No se pudo eliminar la sucursal. Intenta nuevamente."
      )
      return false
    } catch (err) {
      const errorMsg = "Error al eliminar sucursal"
      setError(errorMsg)
      notificationService.error("Error", errorMsg)
      console.error("Error deleting branch:", err)
      return false
    }
  }

  const searchBranches = async (query: string) => {
    try {
      setError(null)
      const results = await branchService.searchBranches(query)
      setBranches(results)
    } catch (err) {
      setError("Error al buscar sucursales")
      console.error("Error searching branches:", err)
    }
  }

  const downloadReport = async () => {
    try {
      await branchService.downloadReport()
    } catch (err) {
      setError("Error al generar reporte")
      console.error("Error generating report:", err)
    }
  }

  const downloadExcelReport = async () => {
    try {
      setError(null)
      await branchService.downloadExcelReport()
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

  useEffect(() => {
    loadBranches()
  }, [])

  return {
    branches,
    loading,
    error,
    createBranch,
    updateBranch,
    deleteBranch,
    searchBranches,
    downloadReport,
    downloadExcelReport,
    refreshBranches: loadBranches,
  }
}
