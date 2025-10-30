/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { Branch } from "@/types"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"

interface BackendBranch {
  _id: string
  name: string
  createdAt: string
}

/**
 * BranchService
 * Servicio de sucursales con operaciones CRUD
 */
class BranchService {
  private mapBranch(backendBranch: BackendBranch): Branch {
    return {
      id: backendBranch._id,
      name: backendBranch.name,
      createdAt: backendBranch.createdAt,
    }
  }

  async getBranches(): Promise<Branch[]> {
    try {
      const branches = await apiClient.get<BackendBranch[]>(API_ENDPOINTS.BRANCHES.BASE)
      return branches.map((b) => this.mapBranch(b))
    } catch (error) {
      console.error("Error fetching branches:", error)
      return []
    }
  }

  async getBranch(id: string): Promise<Branch | null> {
    try {
      const branch = await apiClient.get<BackendBranch>(API_ENDPOINTS.BRANCHES.BY_ID(id))
      return this.mapBranch(branch)
    } catch (error) {
      console.error("Error fetching branch:", error)
      return null
    }
  }

  async createBranch(name: string): Promise<Branch | null> {
    try {
      const payload = { name: name.trim() }
      const branch = await apiClient.post<BackendBranch>(API_ENDPOINTS.BRANCHES.BASE, payload)
      return this.mapBranch(branch)
    } catch (error) {
      console.error("Error creating branch:", error)
      return null
    }
  }

  async updateBranch(id: string, name: string): Promise<Branch | null> {
    try {
      const updateData = { name: name.trim() }
      const branch = await apiClient.patch<BackendBranch>(API_ENDPOINTS.BRANCHES.BY_ID(id), updateData)
      return this.mapBranch(branch)
    } catch (error) {
      console.error("Error updating branch:", error)
      return null
    }
  }

  async deleteBranch(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.BRANCHES.BY_ID(id))
      return true
    } catch (error) {
      console.error("Error deleting branch:", error)
      return false
    }
  }

  async searchBranches(query: string): Promise<Branch[]> {
    const branches = await this.getBranches()

    if (!query.trim()) return branches

    const searchTerm = query.toLowerCase().trim()
    return branches.filter((branch) => branch.name.toLowerCase().includes(searchTerm))
  }

  async generateReport(): Promise<string> {
    const branches = await this.getBranches()
    const csvHeader = "ID,Nombre,Fecha de Creación\n"
    const csvData = branches
      .map((b) => `${b.id},"${b.name}",${new Date(b.createdAt).toLocaleDateString()}`)
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
      link.setAttribute("download", `branches_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  async downloadExcelReport(): Promise<void> {
    try {
      console.log("Iniciando generación de Excel para sucursales...")
      
      // Get branches
      const branches = await this.getBranches()
      
      console.log(`Sucursales encontradas: ${branches.length}`)
      
      // Dynamic import ExcelJS
      const ExcelJS = await import("exceljs")
      
      // Create workbook
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Ferreteria"
      workbook.created = new Date()
      
      const worksheet = workbook.addWorksheet("Reporte de Sucursales")
      
      // Set column widths - A, B = más espacio
      worksheet.columns = [
        { header: "A", key: "colA", width: 45 },
        { header: "B", key: "colB", width: 35 }
      ]

      // Logo en fila 1, celdas combinadas A1:B1
      worksheet.mergeCells("A1:B1")
      const logoCell = worksheet.getCell("A1")
      logoCell.value = "" // Espacio para logo
      worksheet.getRow(1).height = 70
      
      // Empty row for spacing
      worksheet.addRow([])
      
      // Title en fila 3, celdas combinadas A3:B3
      worksheet.mergeCells("A3:B3")
      const titleCell = worksheet.getCell("A3")
      titleCell.value = "REPORTE DE SUCURSALES"
      titleCell.font = { size: 18, bold: true, color: { argb: "FF1E3A8A" } }
      titleCell.alignment = { horizontal: "center", vertical: "middle" }
      worksheet.getRow(3).height = 35
      
      // Empty row after title
      worksheet.addRow([])
      
      // Summary information
      const summaryInfo = [
        ["Total de Sucursales:", branches.length.toString()],
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
      
      // Branches header
      worksheet.mergeCells(`A${worksheet.rowCount + 1}:B${worksheet.rowCount + 1}`)
      const branchesHeaderCell = worksheet.getCell(`A${worksheet.rowCount}`)
      branchesHeaderCell.value = "LISTADO DE SUCURSALES"
      branchesHeaderCell.font = { size: 14, bold: true }
      branchesHeaderCell.alignment = { horizontal: "center" }
      
      // Empty row
      worksheet.addRow([])
      
      // Branches table header
      const headerRow = worksheet.addRow(["Nombre", "Fecha Creación"])
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
      
      // Branches data
      branches.forEach((branch, index) => {
        const row = worksheet.addRow([
          branch.name,
          new Date(branch.createdAt).toLocaleDateString("es-ES")
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
          // Logo en las celdas combinadas A1:B1
          worksheet.addImage(imageId, {
            tl: { col: 0.01, row: 0 },
            ext: { width: 580, height: 100 }
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
      link.download = `reporte_sucursales_${Date.now()}.xlsx`
      link.style.display = "none"
      link.rel = "noopener noreferrer"
      link.target = "_blank"
      
      // Ensure it's a direct download
      document.body.appendChild(link)
      
      // Force click and immediate cleanup
      setTimeout(() => {
        link.click()
        console.log("Excel de sucursales descargado exitosamente")
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }, 10)
      
    } catch (error) {
      console.error("Error generando Excel de sucursales:", error)
      throw error
    }
  }
}

export const branchService = new BranchService()
