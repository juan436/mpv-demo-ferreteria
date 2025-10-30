/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import { BaseDataService } from "./base-data.service"
import { validationService } from "./validation.service"
import { notificationService } from "./notification.service"
import type { Provider } from "@/types"
import type { IReportService } from "@/interfaces/data.interface"

/**
 * EnhancedProviderService
 * Servicio de proveedores con operaciones CRUD y reportes
 */
class EnhancedProviderService extends BaseDataService<Provider> implements IReportService<Provider> {
  protected dataUrl = "/data/providers.json"
  protected entityName = "providers"

  protected matchesSearch(provider: Provider, searchTerm: string): boolean {
    return provider.name.toLowerCase().includes(searchTerm)
  }

  async create(data: Omit<Provider, "id" | "createdAt">): Promise<Provider> {
    const validation = validationService.validateProvider(data)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0]
      notificationService.error("Error de validación", errorMessage)
      throw new Error(errorMessage)
    }

    try {
      const provider = await super.create(data)
      notificationService.success("Proveedor creado", `${provider.name} ha sido creado exitosamente`)
      return provider
    } catch (error) {
      notificationService.error("Error", "No se pudo crear el proveedor")
      throw error
    }
  }

  async update(id: string, data: Partial<Provider>): Promise<Provider | null> {
    const validation = validationService.validateProvider(data)
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0]
      notificationService.error("Error de validación", errorMessage)
      throw new Error(errorMessage)
    }

    try {
      const provider = await super.update(id, data)
      if (provider) {
        notificationService.success("Proveedor actualizado", `${provider.name} ha sido actualizado exitosamente`)
      }
      return provider
    } catch (error) {
      notificationService.error("Error", "No se pudo actualizar el proveedor")
      throw error
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const provider = await this.getById(id)
      const success = await super.delete(id)
      if (success && provider) {
        notificationService.success("Proveedor eliminado", `${provider.name} ha sido eliminado exitosamente`)
      }
      return success
    } catch (error) {
      notificationService.error("Error", "No se pudo eliminar el proveedor")
      throw error
    }
  }

  generateReport(providers: Provider[]): string {
    const csvHeader = "ID,Nombre,Fecha de Creación\n"
    const csvData = providers.map((p) => `${p.id},"${p.name}",${new Date(p.createdAt).toLocaleDateString()}`).join("\n")

    return csvHeader + csvData
  }

  downloadReport(providers: Provider[], filename?: string): void {
    const csvContent = this.generateReport(providers)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename || `proveedores_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}

export const enhancedProviderService = new EnhancedProviderService()
