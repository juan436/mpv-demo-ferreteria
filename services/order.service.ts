/**
 * Ferretería - Gestión de Pedidos
 * Copyright (c) 2025 Juan Villegas <juancvillefer@gmail.com>
 * Apache 2.0 Licensed
 */

import type { Order, OrderItem } from "@/types"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { branchService } from "./branch.service"
import { getUserObject, getBranchObject } from "@/lib/storage-helper"
import { syncService } from "@/lib/sync-service"
import { indexedDBService } from "@/lib/indexeddb"

export interface CreateOrderData {
  provider: { _id: string; name: string }
  date: string
  status: "pending" | "completed" | "cancelled"
  items: Omit<OrderItem, "id">[]
}

interface BackendOrder {
  _id: string
  invoiceCode: string
  provider: { _id: string; name: string }
  user: { _id: string; name: string }
  branch: { _id: string; name: string }
  date: string
  status: "pending" | "completed" | "cancelled"
  items: {
    productCode: string
    productName: string
    quantity: number
  }[]
  createdAt: string
}

/**
 * OrderService
 * Servicio de órdenes con soporte offline
 */
class OrderService {
  private mapOrder(backendOrder: BackendOrder): Order {
    return {
      id: backendOrder._id,
      invoiceCode: backendOrder.invoiceCode,
      providerId: backendOrder.provider._id,
      providerName: backendOrder.provider.name,
      userId: backendOrder.user._id,
      userName: backendOrder.user.name,
      date: backendOrder.date,
      status: backendOrder.status,
      branch: backendOrder.branch._id,
      branchName: backendOrder.branch.name,
      items: backendOrder.items.map((item, index) => ({
        id: `${backendOrder._id}-${index}`,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
      })),
      createdAt: backendOrder.createdAt,
    }
  }

  /**
   * Mapea una orden para IndexedDB (con objetos completos para índices)
   */
  private mapOrderForIndexedDB(backendOrder: BackendOrder): any {
    return {
      id: backendOrder._id,
      invoiceCode: backendOrder.invoiceCode,
      provider: {
        _id: backendOrder.provider._id,
        name: backendOrder.provider.name,
      },
      user: {
        _id: backendOrder.user._id,
        name: backendOrder.user.name,
      },
      branch: {
        _id: backendOrder.branch._id,
        name: backendOrder.branch.name,
      },
      date: backendOrder.date,
      status: backendOrder.status,
      items: backendOrder.items,
      createdAt: backendOrder.createdAt,
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const branchObj = getBranchObject()
      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        // Modo ONLINE: Obtener del backend
        let orders: BackendOrder[]
        if (branchObj) {
          orders = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.BY_BRANCH(branchObj._id))
        } else {
          orders = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.BASE)
        }
        
        // Guardar en IndexedDB para uso offline (con formato IndexedDB)
        const ordersForDB = orders.map((o) => this.mapOrderForIndexedDB(o))
        await indexedDBService.saveOrders(ordersForDB)
        
        // Retornar en formato UI
        const mappedOrders = orders.map((o) => this.mapOrder(o))
        return mappedOrders
      } else {
        // Modo OFFLINE: Obtener de IndexedDB
        console.log('📴 Modo offline: Obteniendo órdenes de IndexedDB')
        console.log('📴 Branch filter:', branchObj?._id)
        
        let ordersFromDB: any[] = []
        
        try {
          // Intentar con filtro de branch
          ordersFromDB = await indexedDBService.getOrders({ branchId: branchObj?._id })
          console.log(`📴 Encontradas ${ordersFromDB.length} órdenes en IndexedDB`)
        } catch (error) {
          console.warn('⚠️ Error con filtro de branch, obteniendo todas las órdenes:', error)
          // Si falla el filtro, obtener todas
          ordersFromDB = await indexedDBService.getOrders()
          console.log(`📴 Encontradas ${ordersFromDB.length} órdenes totales en IndexedDB`)
        }
        
        if (ordersFromDB.length === 0) {
          console.warn('⚠️ No hay órdenes en IndexedDB. Asegúrate de cargar la app online primero.')
          return []
        }
        
        // Convertir formato IndexedDB a formato UI y ordenar por más reciente primero
        const mapped = ordersFromDB.map((o: any) => ({
          id: o.id,
          invoiceCode: o.invoiceCode,
          providerId: o.provider?._id || o.providerId,
          providerName: o.provider?.name || o.providerName,
          userId: o.user?._id || o.userId,
          userName: o.user?.name || o.userName,
          date: o.date,
          status: o.status,
          branch: o.branch?._id || o.branch,
          branchName: o.branch?.name,
          items: o.items.map((item: any, index: number) => ({
            id: `${o.id}-${index}`,
            productCode: item.productCode,
            productName: item.productName,
            quantity: item.quantity,
          })),
          createdAt: o.createdAt,
        }))
        return mapped.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      // Si falla online, intentar desde IndexedDB y también ordenar
      try {
        const branchObj = getBranchObject()
        const ordersFromDB = await indexedDBService.getOrders({ branchId: branchObj?._id })
        
        // Convertir formato IndexedDB a formato UI y ordenar por más reciente primero
        const mapped = ordersFromDB.map((o: any) => ({
          id: o.id,
          invoiceCode: o.invoiceCode,
          providerId: o.provider._id,
          providerName: o.provider.name,
          userId: o.user._id,
          userName: o.user.name,
          date: o.date,
          status: o.status,
          branch: o.branch._id,
          items: o.items.map((item: any, index: number) => ({
            id: `${o.id}-${index}`,
            productCode: item.productCode,
            productName: item.productName,
            quantity: item.quantity,
          })),
          createdAt: o.createdAt,
        }))
        return mapped.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } catch (dbError) {
        console.error("Error fetching from IndexedDB:", dbError)
        return []
      }
    }
  }

  async getOrder(id: string): Promise<Order | null> {
    try {
      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        const order = await apiClient.get<BackendOrder>(API_ENDPOINTS.ORDERS.BY_ID(id))
        return this.mapOrder(order)
      } else {
        // Modo OFFLINE: Obtener de IndexedDB
        return await indexedDBService.getOrder(id)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      // Fallback a IndexedDB
      try {
        return await indexedDBService.getOrder(id)
      } catch (dbError) {
        return null
      }
    }
  }

  async createOrder(data: CreateOrderData): Promise<Order | null> {
    try {
      const userObj = getUserObject()
      const branchObj = getBranchObject()
      
      if (!userObj || !branchObj) {
        throw new Error('Usuario o sucursal no disponibles')
      }

      const payload = {
        provider: data.provider,
        user: userObj,
        branch: branchObj,
        date: data.date,
        status: data.status,
        items: data.items,
      }

      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        // Modo ONLINE: Crear en backend
        const order = await apiClient.post<BackendOrder>(API_ENDPOINTS.ORDERS.BASE, payload)
        
        // Guardar en IndexedDB con formato correcto
        const orderForDB = this.mapOrderForIndexedDB(order)
        await indexedDBService.saveOrder(orderForDB)
        
        // Retornar en formato UI
        const mappedOrder = this.mapOrder(order)
        return mappedOrder
      } else {
        // Modo OFFLINE: Crear localmente
        console.log('📴 Modo offline: Guardando orden localmente')
        
        const tempId = `temp-${Date.now()}`
        const invoiceCode = `TEMP-${Date.now().toString().slice(-6)}`
        
        // Formato para UI
        const newOrder: Order = {
          id: tempId,
          invoiceCode: invoiceCode,
          providerId: data.provider._id,
          providerName: data.provider.name,
          userId: userObj._id,
          userName: userObj.name,
          date: data.date,
          status: data.status,
          branch: branchObj._id,
          branchName: branchObj.name,
          items: data.items.map((item, index) => ({
            id: `${tempId}-${index}`,
            productCode: item.productCode,
            productName: item.productName,
            quantity: item.quantity,
          })),
          createdAt: new Date().toISOString(),
        }
        
        // Formato para IndexedDB (con objetos completos)
        const orderForDB = {
          id: tempId,
          invoiceCode: invoiceCode,
          provider: data.provider,
          user: userObj,
          branch: branchObj,
          date: data.date,
          status: data.status,
          items: data.items,
          createdAt: new Date().toISOString(),
        }
        
        // Guardar en IndexedDB
        await indexedDBService.saveOrder(orderForDB)
        
        // Agregar a cola de sincronización con tempId para actualizar IndexedDB después
        await indexedDBService.addToSyncQueue({
          type: 'CREATE',
          entity: 'order',
          data: {
            ...payload,
            tempId: tempId, // Para actualizar IndexedDB después de sincronizar
          },
        })
        
        return newOrder
      }
    } catch (error) {
      console.error("Error creating order:", error)
      return null
    }
  }

  // ⚠️ NOTA: Las órdenes NO se pueden modificar según requisitos del backend
  // Este método está deshabilitado
  async updateOrder(id: string, data: Partial<CreateOrderData>): Promise<Order | null> {
    console.warn("Las órdenes no se pueden modificar. Solo se pueden crear nuevas o eliminar existentes.")
    return null
  }

  async deleteOrder(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.ORDERS.BY_ID(id))
      return true
    } catch (error) {
      console.error("Error deleting order:", error)
      return false
    }
  }

  async getOrdersByProvider(providerId: string): Promise<Order[]> {
    try {
      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        const orders = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.BY_PROVIDER(providerId))
        return orders.map((o) => this.mapOrder(o))
      } else {
        // Modo OFFLINE: Obtener de IndexedDB
        return await indexedDBService.getOrders({ providerId })
      }
    } catch (error) {
      console.error("Error fetching orders by provider:", error)
      // Fallback a IndexedDB
      try {
        return await indexedDBService.getOrders({ providerId })
      } catch (dbError) {
        return []
      }
    }
  }

  async getOrdersByBranch(branch: string): Promise<Order[]> {
    try {
      const isOnline = syncService.getStatus() === 'online'

      if (isOnline) {
        const orders = await apiClient.get<BackendOrder[]>(API_ENDPOINTS.ORDERS.BY_BRANCH(branch))
        return orders.map((o) => this.mapOrder(o))
      } else {
        // Modo OFFLINE: Obtener de IndexedDB
        return await indexedDBService.getOrders({ branchId: branch })
      }
    } catch (error) {
      console.error("Error fetching orders by branch:", error)
      // Fallback a IndexedDB
      try {
        return await indexedDBService.getOrders({ branchId: branch })
      } catch (dbError) {
        return []
      }
    }
  }

  async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const orders = await this.getOrders()
    const start = new Date(startDate)
    const end = new Date(endDate)

    return orders.filter((order) => {
      const orderDate = new Date(order.date)
      return orderDate >= start && orderDate <= end
    })
  }

  async searchOrders(query: string): Promise<Order[]> {
    const orders = await this.getOrders()

    if (!query.trim()) return orders

    const searchTerm = query.toLowerCase().trim()
    return orders.filter(
      (order) =>
        order.providerName.toLowerCase().includes(searchTerm) ||
        order.userName.toLowerCase().includes(searchTerm) ||
        order.branch.toLowerCase().includes(searchTerm) ||
        order.items.some(
          (item) =>
            item.productName.toLowerCase().includes(searchTerm) || item.productCode.toLowerCase().includes(searchTerm),
        ),
    )
  }

  async generateOrdersReport(orders?: Order[]): Promise<string> {
    const ordersToExport = orders || (await this.getOrders())
    const csvHeader = "Factura,Proveedor,Usuario,Sucursal,Fecha,Estado,Total Items,Fecha Creación\n"
    const csvData = ordersToExport
      .map((order: Order) => {
        const totalItems = order.items.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)
        return `${order.invoiceCode},"${order.providerName}","${order.userName}","${order.branch}",${new Date(
          order.date,
        ).toLocaleDateString()},"${order.status}",${totalItems},${new Date(order.createdAt).toLocaleDateString()}`
      })
      .join("\n")

    return csvHeader + csvData
  }

  generateOrderDetailReport(order: Order): string {
    const csvHeader = "Código,Producto,Cantidad\n"
    const csvData = order.items.map((item) => `"${item.productCode}","${item.productName}",${item.quantity}`).join("\n")

    const orderInfo = `Pedido Factura: ${order.invoiceCode}\nProveedor: ${order.providerName}\nSucursal: ${order.branch}\nFecha: ${new Date(
      order.date,
    ).toLocaleDateString()}\nUsuario: ${order.userName}\n\n`

    return orderInfo + csvHeader + csvData
  }

  async downloadOrdersReport(orders?: Order[]): Promise<void> {
    const csvContent = await this.generateOrdersReport(orders)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `pedidos_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  async downloadOrderDetailReport(order: Order): Promise<void> {
    try {
      // Get branch name - usar branchName si existe, sino buscar
      let branchName = order.branchName || "Sin sucursal"
      
      if (!order.branchName) {
        try {
          const branches = await branchService.getBranches()
          const branch = branches.find(b => b.id === order.branch)
          branchName = branch?.name || order.branch
        } catch (error) {
          console.warn('⚠️ Error obteniendo sucursales para el reporte:', error)
          branchName = order.branch
        }
      }

      // Dynamic import ExcelJS
      const ExcelJS = await import("exceljs")
      
      // Create workbook
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "Ferreteria"
      workbook.created = new Date()
      
      const worksheet = workbook.addWorksheet("Detalle del Pedido")
      
      // Set column widths - Solo A, B, C = 15 cada una
      worksheet.columns = [
        { header: "A", key: "colA", width: 25 },
        { header: "B", key: "colB", width: 25 },
        { header: "C", key: "colC", width: 25 }
      ]

      // Logo en fila 1, celdas combinadas A1:C1
      worksheet.mergeCells("A1:C1")
      const logoCell = worksheet.getCell("A1")
      logoCell.value = "" // Espacio para logo
      worksheet.getRow(1).height = 60
      
      // Empty row for spacing
      worksheet.addRow([])
      
      // Title en fila 3, celdas combinadas A3:C3
      worksheet.mergeCells("A3:C3")
      const titleCell = worksheet.getCell("A3")
      titleCell.value = "DETALLE DEL PEDIDO"
      titleCell.font = { size: 16, bold: true, color: { argb: "FF1E3A8A" } }
      titleCell.alignment = { horizontal: "center", vertical: "middle" }
      worksheet.getRow(3).height = 30
      
      // Empty row after title
      worksheet.addRow([])
      
      // Order information
      const orderInfo = [
        ["Factura:", order.invoiceCode],
        ["Proveedor:", order.providerName],
        ["Sucursal:", branchName],
        ["Fecha:", new Date(order.date).toLocaleDateString("es-ES")],
        ["Usuario:", order.userName]
      ]
      
      orderInfo.forEach(([field, value]) => {
        const row = worksheet.addRow([field, value])
        row.getCell(1).font = { bold: true }
      })
      
      // Empty rows
      worksheet.addRow([])
      worksheet.addRow([])
      
      // Products header
      worksheet.mergeCells(`A${worksheet.rowCount + 1}:C${worksheet.rowCount + 1}`)
      const productsHeaderCell = worksheet.getCell(`A${worksheet.rowCount}`)
      productsHeaderCell.value = "PRODUCTOS"
      productsHeaderCell.font = { size: 14, bold: true }
      productsHeaderCell.alignment = { horizontal: "center" }
      
      // Empty row
      worksheet.addRow([])
      
      // Products table header
      const headerRow = worksheet.addRow(["Código", "Producto", "Cantidad"])
      headerRow.eachCell((cell) => {
        cell.font = { bold: true }
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE6F3FF" }
        }
      })
      
      // Products data
      order.items.forEach((item) => {
        worksheet.addRow([item.productCode, item.productName, item.quantity])
      })
      
      // Add logo grande en A1:C1
      try {
        const logoResponse = await fetch("/logo.jpg")
        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          const imageId = workbook.addImage({
            buffer: logoBuffer,
            extension: "png"
          })
          
          // Logo MÁS GRANDE en las celdas combinadas A1:C1
          worksheet.addImage(imageId, {
            tl: { col: 0.05, row: 0 },
            ext: { width: 525, height: 90 }
          })
        }
      } catch (error) {
        console.warn("No se pudo cargar el logo:", error)
      }
      
      // Generate buffer and force direct download (NO server storage)
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      })
      
      // Force download without server interaction
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.href = url
      link.download = `detalle_pedido_${order.invoiceCode}_${Date.now()}.xlsx`
      link.style.display = "none"
      link.rel = "noopener noreferrer"
      link.target = "_blank"
      
      // Ensure it's a direct download
      document.body.appendChild(link)
      
      // Force click and immediate cleanup
      setTimeout(() => {
        link.click()
        setTimeout(() => {
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }, 100)
      }, 10)
      
    } catch (error) {
      console.error("Error generando Excel:", error)
      throw error
    }
  }

  async sendOrderReportByEmail(orderId: string, email: string): Promise<boolean> {
    try {
      await apiClient.post(API_ENDPOINTS.ORDERS.SEND_REPORT(orderId), { email })
      return true
    } catch (error) {
      console.error("Error sending order report by email:", error)
      return false
    }
  }
}

export const orderService = new OrderService()
