/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { Provider } from "@/types"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { branchService } from "./branch.service"
import { getBranchObject } from "@/lib/storage-helper"
import { syncService } from "@/lib/sync-service"
import { indexedDBService } from "@/lib/indexeddb"

interface BackendProvider {
  _id: string
  name: string
  branch: { _id: string; name: string }
  createdAt: string
}

/**
 * ProviderService
 * Servicio de proveedores con operaciones CRUD y soporte offline
 */
class ProviderService {
  private mapProvider(backendProvider: BackendProvider): Provider {
    return {
      id: backendProvider._id,
      name: backendProvider.name,
      branch: backendProvider.branch._id,
      branchName: backendProvider.branch.name,
      createdAt: backendProvider.createdAt,
    }
  }

  async getProviders(): Promise<Provider[]> {
    try {
      const branchObj = getBranchObject()
      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        // Modo ONLINE: Obtener del backend
        let providers: BackendProvider[]
        if (branchObj) {
          providers = await apiClient.get<BackendProvider[]>(`${API_ENDPOINTS.PROVIDERS.BASE}/by-branch/${branchObj._id}`)
        } else {
          providers = await apiClient.get<BackendProvider[]>(API_ENDPOINTS.PROVIDERS.BASE)
        }
        
        // Guardar en IndexedDB para uso offline
        const mappedProviders = providers.map((p) => this.mapProvider(p))
        await indexedDBService.saveProviders(mappedProviders)
        
        return mappedProviders
      } else {
        // Modo OFFLINE: Obtener de IndexedDB
        console.log('📴 Modo offline: Obteniendo proveedores de IndexedDB')
        const providers = await indexedDBService.getProviders(branchObj?._id)
        return providers
      }
    } catch (error) {
      console.error("Error fetching providers:", error)
      // Si falla online, intentar desde IndexedDB
      try {
        const branchObj = getBranchObject()
        return await indexedDBService.getProviders(branchObj?._id)
      } catch (dbError) {
        console.error("Error fetching from IndexedDB:", dbError)
        return []
      }
    }
  }

  async getProvider(id: string): Promise<Provider | null> {
    try {
      const provider = await apiClient.get<BackendProvider>(API_ENDPOINTS.PROVIDERS.BY_ID(id))
      return this.mapProvider(provider)
    } catch (error) {
      console.error("Error fetching provider:", error)
      return null
    }
  }

  async createProvider(name: string, branch?: string): Promise<Provider | null> {
    try {
      const branchObj = getBranchObject()
      if (!branchObj) {
        throw new Error('Usuario sin sucursal asignada')
      }

      const payload = { 
        name: name.trim(),
        branch: branchObj,
      }

      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        // Modo ONLINE: Crear en backend
        const provider = await apiClient.post<BackendProvider>(API_ENDPOINTS.PROVIDERS.BASE, payload)
        const mappedProvider = this.mapProvider(provider)
        
        // Guardar en IndexedDB también
        await indexedDBService.saveProvider(mappedProvider)
        
        return mappedProvider
      } else {
        // Modo OFFLINE: Crear localmente
        console.log('📴 Modo offline: Guardando proveedor localmente')
        
        const tempId = `temp-${Date.now()}`
        const newProvider: Provider = {
          id: tempId,
          name: payload.name,
          branch: branchObj._id,
          createdAt: new Date().toISOString(),
        }
        
        // Guardar en IndexedDB
        await indexedDBService.saveProvider(newProvider)
        
        // Agregar a cola de sincronización con tempId para mapeo
        await indexedDBService.addToSyncQueue({
          type: 'CREATE',
          entity: 'provider',
          data: {
            ...payload,
            tempId: tempId, // Guardar el ID temporal para mapeo posterior
          },
        })
        
        return newProvider
      }
    } catch (error) {
      console.error("Error creating provider:", error)
      return null
    }
  }

  async updateProvider(id: string, name: string, branch?: string): Promise<Provider | null> {
    try {
      const updateData: any = { name: name.trim() }
      if (branch) updateData.branch = branch

      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        // Modo ONLINE: Actualizar en backend
        const provider = await apiClient.patch<BackendProvider>(API_ENDPOINTS.PROVIDERS.BY_ID(id), updateData)
        const mappedProvider = this.mapProvider(provider)
        
        // Actualizar en IndexedDB también
        await indexedDBService.saveProvider(mappedProvider)
        
        return mappedProvider
      } else {
        // Modo OFFLINE: Actualizar localmente
        console.log('📴 Modo offline: Actualizando proveedor localmente')
        
        const existingProvider = await indexedDBService.getProvider(id)
        if (!existingProvider) {
          throw new Error('Proveedor no encontrado')
        }
        
        const updatedProvider: Provider = {
          ...existingProvider,
          name: updateData.name,
        }
        
        // Actualizar en IndexedDB
        await indexedDBService.saveProvider(updatedProvider)
        
        // Agregar a cola de sincronización
        await indexedDBService.addToSyncQueue({
          type: 'UPDATE',
          entity: 'provider',
          data: { id, ...updateData },
        })
        
        return updatedProvider
      }
    } catch (error) {
      console.error("Error updating provider:", error)
      return null
    }
  }

  async deleteProvider(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.PROVIDERS.BY_ID(id))
      return true
    } catch (error) {
      console.error("Error deleting provider:", error)
      return false
    }
  }

  async searchProviders(query: string): Promise<Provider[]> {
    try {
      if (!query.trim()) {
        return this.getProviders()
      }

      const isOnline = syncService.getStatus() === 'online'
      const branchObj = getBranchObject()

      if (isOnline) {
        // Modo ONLINE: Buscar en backend
        const providers = await apiClient.get<BackendProvider[]>(`${API_ENDPOINTS.PROVIDERS.SEARCH}?q=${encodeURIComponent(query)}`)
        return providers.map((p) => this.mapProvider(p))
      } else {
        // Modo OFFLINE: Buscar en IndexedDB
        console.log('📴 Modo offline: Buscando proveedores en IndexedDB')
        return await indexedDBService.searchProviders(query, branchObj?._id)
      }
    } catch (error) {
      console.error("Error searching providers:", error)
      // Fallback a IndexedDB
      try {
        const branchObj = getBranchObject()
        return await indexedDBService.searchProviders(query, branchObj?._id)
      } catch (dbError) {
        return []
      }
    }
  }

  async generateReport(): Promise<string> {
    const providers = await this.getProviders()
    const csvHeader = "ID,Nombre,Sucursal,Fecha de Creación\n"
    const csvData = providers
      .map((p) => `${p.id},"${p.name}","${p.branch}",${new Date(p.createdAt).toLocaleDateString()}`)
      .join("\n")

    return csvHeader + csvData
  }

  async downloadReport(): Promise<void> {
    const csvContent = await this.generateReport()
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `proveedores_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  async downloadExcelReport(): Promise<void> {
    try {
      console.log("Iniciando generación de Excel para proveedores...")
      
      // Get providers and branch names
      const providers = await this.getProviders()
      const branches = await branchService.getBranches()
      
      console.log(`Proveedores encontrados: ${providers.length}`)
      
      // Dynamic import ExcelJS
      const ExcelJS = await import("exceljs")
      
      // Create workbook
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Ferreteria"
      workbook.created = new Date()
      
      const worksheet = workbook.addWorksheet("Reporte de Proveedores")
      
      // Set column widths - A, B, C = más espacio
      worksheet.columns = [
        { header: "A", key: "colA", width: 35 },
        { header: "B", key: "colB", width: 35 },
        { header: "C", key: "colC", width: 30 }
      ]

      // Logo en fila 1, celdas combinadas A1:C1
      worksheet.mergeCells("A1:C1")
      const logoCell = worksheet.getCell("A1")
      logoCell.value = "" // Espacio para logo
      worksheet.getRow(1).height = 80
      
      // Empty row for spacing
      worksheet.addRow([])
      
      // Title en fila 3, celdas combinadas A3:C3
      worksheet.mergeCells("A3:C3")
      const titleCell = worksheet.getCell("A3")
      titleCell.value = "REPORTE DE PROVEEDORES"
      titleCell.font = { size: 18, bold: true, color: { argb: "FF1E3A8A" } }
      titleCell.alignment = { horizontal: "center", vertical: "middle" }
      worksheet.getRow(3).height = 35
      
      // Empty row after title
      worksheet.addRow([])
      
      // Summary information
      const summaryInfo = [
        ["Total de Proveedores:", providers.length.toString()],
        ["Fecha de Reporte:", new Date().toLocaleDateString("es-ES")]
      ]
      
      summaryInfo.forEach(([field, value]) => {
        const row = worksheet.addRow([field, value])
        row.getCell(1).font = { bold: true, size: 12 }
        row.getCell(2).font = { size: 12 }
      })
      
      // Empty rows
      worksheet.addRow([])
      worksheet.addRow([])
      
      // Providers header
      worksheet.mergeCells(`A${worksheet.rowCount + 1}:C${worksheet.rowCount + 1}`)
      const providersHeaderCell = worksheet.getCell(`A${worksheet.rowCount}`)
      providersHeaderCell.value = "LISTADO DE PROVEEDORES"
      providersHeaderCell.font = { size: 14, bold: true }
      providersHeaderCell.alignment = { horizontal: "center" }
      
      // Empty row
      worksheet.addRow([])
      
      // Providers table header
      const headerRow = worksheet.addRow(["Nombre", "Sucursal", "Fecha Creación"])
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11 }
        cell.alignment = { horizontal: "center", vertical: "middle" }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F3FF" }
        }
        cell.border = {
          top: { style: "thin", color: { argb: "FF1E3A8A" } },
          left: { style: "thin", color: { argb: "FF1E3A8A" } },
          bottom: { style: "thin", color: { argb: "FF1E3A8A" } },
          right: { style: "thin", color: { argb: "FF1E3A8A" } }
        }
      })
      
      // Providers data
      providers.forEach((provider, index) => {
        // Usar branchName si existe, sino buscar
        const branchName = provider.branchName || branches.find(b => b.id === provider.branch)?.name || provider.branch
        const row = worksheet.addRow([
          provider.name,
          branchName,
          new Date(provider.createdAt).toLocaleDateString("es-ES")
        ])
        
        // Alternate row colors
        if (index % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" }
            }
          })
        }
        
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } }
          }
        })
      })
      
      // Add logo
      try {
        console.log("Intentando cargar logo...")
        const logoResponse = await fetch("/logo.jpg")
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          const imageId = workbook.addImage({
            buffer: logoBuffer,
            extension: "png"
          })
          
          console.log("Logo cargado, insertando en Excel...")
          // Logo en las celdas combinadas A1:C1
          worksheet.addImage(imageId, {
            tl: { col: 0.6, row: 0 },
            ext: { width: 680, height: 120 }
          })
        } else {
          console.warn("No se pudo cargar el logo - respuesta no OK")
        }
      } catch (error) {
        console.warn("Error cargando logo:", error)
      }
      
      console.log("Generando buffer de Excel...")
      // Generate buffer and force direct download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
      
      console.log("Iniciando descarga...")
      // Force download without server interaction
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = `reporte_proveedores_${Date.now()}.xlsx`
      link.style.display = "none"
      link.rel = "noopener noreferrer"
      link.target = "_blank"
      
      // Ensure it's a direct download
      document.body.appendChild(link)
      
      // Force click and immediate cleanup
      setTimeout(() => {
        link.click()
        console.log("Excel de proveedores descargado exitosamente")
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }, 10)
      
    } catch (error) {
      console.error("Error generando Excel de proveedores:", error)
      throw error
    }
  }
}

export const providerService = new ProviderService()
