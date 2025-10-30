/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { User } from "../types"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { authService } from "./auth.service"
import { branchService } from "./branch.service"

interface BackendUser {
  _id: string
  email: string
  name: string
  role: "admin" | "user"
  branch?: { _id: string; name: string } | null
  createdAt: string
}

class UserService {
  private mapUser(backendUser: BackendUser): Omit<User, "password"> {
    return {
      id: backendUser._id,
      email: backendUser.email,
      name: backendUser.name,
      role: backendUser.role,
      branch: backendUser.branch?._id || "",
      createdAt: backendUser.createdAt,
    }
  }

  async getUsers(): Promise<Omit<User, "password">[]> {
    try {
      const users = await apiClient.get<BackendUser[]>(API_ENDPOINTS.USERS.BASE)
      const mapped = users.map((u) => this.mapUser(u))
      
      const current = authService.getCurrentUser()
      if (current) {
        return mapped.filter((u) => u.id !== current.id && u.email !== current.email)
      }
      return mapped
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }

  async getUser(id: string): Promise<Omit<User, "password"> | null> {
    try {
      const user = await apiClient.get<BackendUser>(API_ENDPOINTS.USERS.BY_ID(id))
      return this.mapUser(user)
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<Omit<User, "password"> | null> {
    try {
      const payload: any = {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: userData.password,
      }

      // Si tiene branch (usuario normal), obtener nombre y enviar objeto embebido
      if (userData.branch && userData.role !== "admin") {
        const branches = await branchService.getBranches()
        const branchObj = branches.find(b => b.id === userData.branch)
        if (branchObj) {
          payload.branch = {
            _id: userData.branch,
            name: branchObj.name
          }
        }
      }

      const user = await apiClient.post<BackendUser>(API_ENDPOINTS.USERS.BASE, payload)
      return this.mapUser(user)
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  async updateUser(id: string, userData: Partial<Omit<User, "id" | "createdAt">>): Promise<Omit<User, "password"> | null> {
    try {
      const payload: any = { ...userData }

      if (userData.branch && userData.role !== "admin") {
        const branches = await branchService.getBranches()
        const branchObj = branches.find(b => b.id === userData.branch)
        if (branchObj) {
          payload.branch = {
            _id: userData.branch,
            name: branchObj.name
          }
        }
      } else if (userData.role === "admin") {
        payload.branch = null
      }

      const user = await apiClient.patch<BackendUser>(API_ENDPOINTS.USERS.BY_ID(id), payload)
      return this.mapUser(user)
    } catch (error) {
      console.error("Error updating user:", error)
      return null
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id))
      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  async searchUsers(query: string): Promise<Omit<User, "password">[]> {
    const users = await this.getUsers()
    if (!query.trim()) return users

    const searchTerm = query.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        (user.branch ?? "").toLowerCase().includes(searchTerm),
    )
  }

  async generateUsersReport(): Promise<string> {
    const users = await this.getUsers()
    const headers = ["ID", "Nombre", "Email", "Rol", "Sucursal", "Fecha Creación"]
    const rows = users.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.branch,
      new Date(user.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    return csvContent
  }

  async downloadExcelReport(): Promise<void> {
    try {
      console.log("Iniciando generación de Excel para usuarios...")
      
      // Get users and branch names
      const users = await this.getUsers()
      const branches = await branchService.getBranches()
      
      console.log(`Usuarios encontrados: ${users.length}`)
      
      // Dynamic import ExcelJS
      const ExcelJS = await import("exceljs")
      
      // Create workbook
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Ferreteria"
      workbook.created = new Date()
      
      const worksheet = workbook.addWorksheet("Reporte de Usuarios")
      
      // Set column widths - A, B, C, D = más espacio
      worksheet.columns = [
        { header: "A", key: "colA", width: 30 },
        { header: "B", key: "colB", width: 40 },
        { header: "C", key: "colC", width: 20 },
        { header: "D", key: "colD", width: 30 }
      ]

      // Logo en fila 1, celdas combinadas A1:D1
      worksheet.mergeCells("A1:D1")
      const logoCell = worksheet.getCell("A1")
      logoCell.value = "" // Espacio para logo
      worksheet.getRow(1).height = 95
      
      // Empty row for spacing
      worksheet.addRow([])
      
      // Title en fila 3, celdas combinadas A3:D3
      worksheet.mergeCells("A3:D3")
      const titleCell = worksheet.getCell("A3")
      titleCell.value = "REPORTE DE USUARIOS"
      titleCell.font = { size: 18, bold: true, color: { argb: "FF1E3A8A" } }
      titleCell.alignment = { horizontal: "center", vertical: "middle" }
      worksheet.getRow(3).height = 35
      
      // Empty row after title
      worksheet.addRow([])
      
      // Summary information
      const summaryInfo = [
        ["Total de Usuarios:", users.length.toString()],
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
      
      // Users header
      worksheet.mergeCells(`A${worksheet.rowCount + 1}:D${worksheet.rowCount + 1}`)
      const usersHeaderCell = worksheet.getCell(`A${worksheet.rowCount}`)
      usersHeaderCell.value = "LISTADO DE USUARIOS"
      usersHeaderCell.font = { size: 14, bold: true }
      usersHeaderCell.alignment = { horizontal: "center" }
      
      // Empty row
      worksheet.addRow([])
      
      // Users table header
      const headerRow = worksheet.addRow(["Nombre", "Email", "Rol", "Sucursal"])
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
      
      // Users data
      users.forEach((user, index) => {
        const branchName = branches.find(b => b.id === user.branch)?.name || user.branch || "Sin asignar"
        const roleName = user.role === "admin" ? "Administrador" : "Usuario"
        const row = worksheet.addRow([
          user.name,
          user.email,
          roleName,
          branchName
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
          // Logo en las celdas combinadas A1:D1
          worksheet.addImage(imageId, {
            tl: { col: 0.5, row: 0 },
            ext: { width: 880, height: 140 }
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
      link.download = `reporte_usuarios_${Date.now()}.xlsx`
      link.style.display = "none"
      link.rel = "noopener noreferrer"
      link.target = "_blank"
      
      // Ensure it's a direct download
      document.body.appendChild(link)
      
      // Force click and immediate cleanup
      setTimeout(() => {
        link.click()
        console.log("Excel de usuarios descargado exitosamente")
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }, 10)
      
    } catch (error) {
      console.error("Error generando Excel de usuarios:", error)
      throw error
    }
  }
}

export const userService = new UserService()
